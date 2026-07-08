"""Celery task for embedding messages into images"""
import logging
import os
import signal
from typing_extensions import Literal

from celery_app.worker import celery_app
from celery_app.utils import log_activity
from services.stego_service import StegoService

logger = logging.getLogger(__name__)

# How long to give all SteganoGAN operations (embed + verify) before falling back to LSB
STEGANOGAN_TIMEOUT_SECONDS = 60


def _timeout_handler(signum, frame):
    raise TimeoutError(
        f"SteganoGAN operation timed out after {STEGANOGAN_TIMEOUT_SECONDS}s"
    )


RAISE_AUTH_PREFIX = "RAISE_AUTH:"


def _wrap_with_auth(payload: str, embedder_id: int, recipient_id: int) -> str:
    """Prepend RAISE_AUTH header so extraction can enforce who may read the data.

    Format: RAISE_AUTH:<embedder_id>:<recipient_id>:<original_payload>

    Using split(":", 3) during extraction gives exactly four parts regardless of
    colons inside the payload (e.g. RAISE_FILE: protocol strings).
    """
    return f"{RAISE_AUTH_PREFIX}{embedder_id}:{recipient_id}:{payload}"


@celery_app.task(bind=True, name="celery_app.tasks.embed_message")
def embed_message(
    self,
    image_path: str,
    message: str,
    output_path: str,
    architecture: Literal["dense", "basic"] = "dense",
    user_id: int = 1,
    payload_type: str = "text",
    method: str = "auto",
    recipient_id: int = None,
):
    """
    Embed a message/file into an image.

    Tries SteganoGAN first (with a timeout covering both embedding and extraction
    verification). If SteganoGAN fails, times out, or the round-trip verification
    shows the extracted message doesn't match, falls back to LSB steganography
    after verifying the cover image has enough capacity.

    Raises ValueError if capacity is exceeded when falling back to LSB.

    Returns a dict including ``method_used`` ("steganogan" or "lsb") and
    ``payload_type`` ("text", "image", or "pdf").
    """
    effective_recipient_id = recipient_id if recipient_id is not None else user_id

    logger.info(
        "embed_message started | user=%s recipient=%s arch=%s payload_type=%s method=%s input=%s",
        user_id, effective_recipient_id, architecture, payload_type, method, image_path,
    )

    log_activity(
        user_id=user_id,
        action_type="embed_message",
        details=f"Embedding {payload_type} using {architecture} architecture",
    )

    self.update_state(
        state="PROGRESS",
        meta={"status": "Preparing payload...", "progress": 15},
    )

    # Wrap the payload with the RAISE_AUTH header so extractors can enforce access control
    message = _wrap_with_auth(message, user_id, effective_recipient_id)

    self.update_state(
        state="PROGRESS",
        meta={"status": "Trying SteganoGAN...", "progress": 25},
    )

    method_used = None
    result_path = None

    # ── Attempt 1: SteganoGAN (skipped when method='lsb') ────────────────
    if method != "lsb":
        try:
            if hasattr(signal, "SIGALRM"):
                old_handler = signal.signal(signal.SIGALRM, _timeout_handler)
                signal.alarm(STEGANOGAN_TIMEOUT_SECONDS)
            try:
                # Step 1a: Embed with SteganoGAN
                self.update_state(
                    state="PROGRESS",
                    meta={
                        "status": f"Embedding with SteganoGAN ({architecture})...",
                        "progress": 40,
                    },
                )
                candidate_path = StegoService.embed_steganogan(
                    image_path, message, output_path, architecture
                )

                # Step 1b: Verify that extraction recovers the exact same payload.
                # If the neural network cannot reliably round-trip the message we
                # must not trust the output — fall back to LSB instead.
                self.update_state(
                    state="PROGRESS",
                    meta={"status": "Verifying SteganoGAN embedding...", "progress": 55},
                )
                extracted = StegoService.extract_steganogan(candidate_path, architecture)
                if extracted != message:
                    raise ValueError(
                        "SteganoGAN extraction verification failed: "
                        "the extracted payload does not match the embedded payload. "
                        "Falling back to LSB."
                    )

                result_path = candidate_path
                method_used = "steganogan"
                logger.info(
                    "SteganoGAN embedding verified successfully → %s", result_path
                )
            finally:
                if hasattr(signal, "SIGALRM"):
                    signal.alarm(0)
                    signal.signal(signal.SIGALRM, old_handler)
        except Exception as exc:
            if method == "steganogan":
                # Caller explicitly requested SteganoGAN — do not fall back
                raise
            logger.warning(
                "SteganoGAN failed (%s: %s) — falling back to LSB.",
                type(exc).__name__, exc,
            )
            result_path = None  # ensure LSB path is taken

    # ── Attempt 2: LSB (fallback or explicit) ────────────────────────────
    if method_used is None:
        self.update_state(
            state="PROGRESS",
            meta={
                "status": "SteganoGAN unavailable — checking LSB capacity...",
                "progress": 65,
            },
        )

        data = message.encode("utf-8")
        capacity = StegoService.get_lsb_capacity(image_path)

        if len(data) > capacity:
            raise ValueError(
                f"Image capacity exceeded. "
                f"The cover image can hold at most {capacity} bytes via LSB steganography, "
                f"but the payload requires {len(data)} bytes. "
                f"Please use a larger cover image or reduce the payload size."
            )

        self.update_state(
            state="PROGRESS",
            meta={"status": "Embedding with LSB steganography...", "progress": 75},
        )

        # LSB output must be PNG to preserve LSBs losslessly
        lsb_output = os.path.splitext(output_path)[0] + ".png"
        result_path = StegoService.embed_lsb(image_path, data, lsb_output)
        method_used = "lsb"
        logger.info("LSB embedding succeeded → %s", result_path)

    self.update_state(
        state="PROGRESS",
        meta={"status": "Finalizing...", "progress": 90},
    )

    return {
        "status": "completed",
        "message": "Message embedded successfully",
        "output_path": result_path,
        "architecture": architecture if method_used == "steganogan" else None,
        "method_used": method_used,
        "payload_type": payload_type,
        "recipient_id": effective_recipient_id,
    }
