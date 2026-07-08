"""Celery task for extracting messages from images"""
import base64
import logging
import os
import signal
from typing import Optional
from typing_extensions import Literal

from celery_app.worker import celery_app
from celery_app.utils import log_activity
from core.config import settings
from services.stego_service import StegoService

logger = logging.getLogger(__name__)

RAISE_FILE_PREFIX = "RAISE_FILE:"
RAISE_AUTH_PREFIX = "RAISE_AUTH:"


def _check_raise_auth(extracted_msg: str, user_id: int) -> str:
    """Strip the RAISE_AUTH header and enforce access control.

    Format embedded during encoding:
        RAISE_AUTH:<embedder_id>:<recipient_id>:<inner_payload>

    Rules:
    - If the prefix is absent the image was embedded without access control;
      return the message unchanged (backward-compatible).
    - If present, allow access only when the requesting user is the embedder
      OR the designated recipient.
    - Otherwise raise PermissionError so the task fails with a clear message.

    Returns the inner payload (with the auth header stripped).
    """
    if not extracted_msg.startswith(RAISE_AUTH_PREFIX):
        return extracted_msg  # unprotected image — backward compatible

    remainder = extracted_msg[len(RAISE_AUTH_PREFIX):]
    parts = remainder.split(":", 2)
    if len(parts) != 3:
        # Malformed header — treat as plain text (don't block access)
        return extracted_msg

    embedder_id_str, recipient_id_str, inner_payload = parts
    try:
        embedder_id = int(embedder_id_str)
        recipient_id = int(recipient_id_str)
    except ValueError:
        return extracted_msg  # Malformed IDs — treat as plain text

    if user_id not in (embedder_id, recipient_id):
        raise PermissionError(
            "You are not authorized to extract data from this image."
        )

    return inner_payload


def _parse_raise_file(extracted_msg: str, task_id: str) -> Optional[dict]:
    """
    Detect and unpack a RAISE_FILE payload (format: RAISE_FILE:<mime>:<filename>:<b64>).
    Returns a result dict if successful, None if the message is not a file payload.
    """
    if not extracted_msg.startswith(RAISE_FILE_PREFIX):
        return None

    try:
        remainder = extracted_msg[len(RAISE_FILE_PREFIX):]
        mime_type, original_filename, b64_data = remainder.split(":", 2)
        file_bytes = base64.b64decode(b64_data)

        os.makedirs(settings.OUTPUT_DIR, exist_ok=True)
        safe_filename = os.path.basename(original_filename)
        out_path = os.path.join(settings.OUTPUT_DIR, f"{task_id}_{safe_filename}")
        with open(out_path, "wb") as fh:
            fh.write(file_bytes)

        logger.info("Extracted file saved → %s", out_path)
        top_type = mime_type.split("/")[0]  # "image" or "application"
        return {
            "status": "completed",
            "message": "File extracted successfully",
            "content_type": top_type,
            "extracted_mime_type": mime_type,
            "extracted_filename": safe_filename,
            "extracted_file_path": out_path,
        }
    except Exception as exc:
        logger.warning("Failed to parse RAISE_FILE payload, treating as text: %s", exc)
        return None


STEGANOGAN_EXTRACT_TIMEOUT_SECONDS = 60


def _timeout_handler_extract(signum, frame):
    raise TimeoutError(
        f"SteganoGAN extraction timed out after {STEGANOGAN_EXTRACT_TIMEOUT_SECONDS}s"
    )


@celery_app.task(bind=True, name="celery_app.tasks.extract_message")
def extract_message(
    self,
    image_path: str,
    architecture: Literal["dense", "basic"] = "dense",
    user_id: int = 1,
    method: str = "auto",  # "auto", "steganogan", or "lsb"
):
    """
    Extract a hidden payload from an image.

    Parameters
    ----------
    image_path  : path to the stego image
    architecture: SteganoGAN architecture (only used when method!="lsb")
    user_id     : ID of the requesting user
    method      : extraction method — "auto" tries SteganoGAN first then falls
                  back to LSB; "steganogan" forces SteganoGAN; "lsb" uses LSB

    Returns a dict that always includes ``method_used`` so the caller can
    persist which method was used for this job.
    """
    logger.info(
        "extract_message started | user=%s method=%s arch=%s image=%s",
        user_id, method, architecture, image_path,
    )

    log_activity(
        user_id=user_id,
        action_type="extract_message",
        details=f"Extracting with {method} (arch={architecture})",
    )

    self.update_state(
        state="PROGRESS",
        meta={"status": "Starting extraction...", "progress": 25},
    )

    # ── Extract ──────────────────────────────────────────────────────────
    method_used = None
    extracted_msg = None

    # ── Attempt 1: SteganoGAN (skipped when method='lsb') ────────────────
    if method != "lsb":
        try:
            if hasattr(signal, "SIGALRM"):
                old_handler = signal.signal(signal.SIGALRM, _timeout_handler_extract)
                signal.alarm(STEGANOGAN_EXTRACT_TIMEOUT_SECONDS)
            try:
                self.update_state(
                    state="PROGRESS",
                    meta={
                        "status": f"Running SteganoGAN extraction ({architecture})...",
                        "progress": 50,
                    },
                )
                extracted_msg = StegoService.extract_steganogan(image_path, architecture)
                method_used = "steganogan"
                logger.info("SteganoGAN extraction succeeded from %s", image_path)
            finally:
                if hasattr(signal, "SIGALRM"):
                    signal.alarm(0)
                    signal.signal(signal.SIGALRM, old_handler)
        except Exception as exc:
            if method == "steganogan":
                # Caller explicitly requested SteganoGAN — do not fall back
                raise
            logger.warning(
                "SteganoGAN extraction failed (%s: %s) — falling back to LSB.",
                type(exc).__name__, exc,
            )

    # ── Attempt 2: LSB (fallback or explicit) ────────────────────────────
    if method_used is None:
        self.update_state(
            state="PROGRESS",
            meta={"status": "Running LSB extraction...", "progress": 65},
        )
        raw_bytes = StegoService.extract_lsb(image_path)
        extracted_msg = raw_bytes.decode("utf-8", errors="replace")
        method_used = "lsb"
        logger.info("LSB extraction succeeded from %s", image_path)

    logger.info("Extraction complete from %s using %s", image_path, method_used)
    self.update_state(
        state="PROGRESS",
        meta={"status": "Verifying authorization...", "progress": 80},
    )

    # ── Access control ───────────────────────────────────────────────────
    # Strips RAISE_AUTH header and raises PermissionError if unauthorized.
    extracted_msg = _check_raise_auth(extracted_msg, user_id)

    self.update_state(
        state="PROGRESS",
        meta={"status": "Finalizing...", "progress": 90},
    )

    # ── Detect RAISE_FILE payload ────────────────────────────────────────
    file_result = _parse_raise_file(extracted_msg, self.request.id)
    if file_result:
        file_result["method_used"] = method_used
        file_result["architecture"] = architecture if method_used != "lsb" else None
        return file_result

    return {
        "status": "completed",
        "message": "Message extracted successfully",
        "content_type": "text",
        "extracted_message": extracted_msg,
        "method_used": method_used,
        "architecture": architecture if method_used != "lsb" else None,
    }
