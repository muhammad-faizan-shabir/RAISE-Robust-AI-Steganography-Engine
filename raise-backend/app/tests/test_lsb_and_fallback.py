"""
Tests for:
  1. StegoService LSB methods (unit)
  2. embed_message Celery task — SteganoGAN→LSB fallback, capacity check,
     payload_type and method_used in result
"""
import os
import struct
import zlib
from unittest.mock import patch, MagicMock, call

import pytest

from services.stego_service import StegoService, LSB_HEADER_BYTES
from celery_app.tasks.embed import embed_message as embed_task_fn
from celery_app.worker import celery_app


# ─────────────────────────────────────────────────────────────────────────────
# Helpers / fixtures
# ─────────────────────────────────────────────────────────────────────────────

try:
    import numpy as np
    from PIL import Image
    PIL_AVAILABLE = True
except ImportError:
    PIL_AVAILABLE = False

pytestmark = pytest.mark.skipif(
    not PIL_AVAILABLE,
    reason="PIL / numpy not installed",
)


def _make_png(path, width=200, height=200, color=(100, 150, 200)):
    """Create a solid-colour PNG at *path* and return it."""
    img = Image.new("RGB", (width, height), color=color)
    img.save(path, "PNG")
    return path


def _make_jpeg(path, width=50, height=50):
    """Create a minimal JPEG at *path* and return it."""
    img = Image.new("RGB", (width, height), color=(80, 80, 80))
    img.save(path, "JPEG")
    return path


@pytest.fixture
def cover_png(tmp_path):
    return _make_png(str(tmp_path / "cover.png"), width=200, height=200)


@pytest.fixture
def tiny_png(tmp_path):
    """1×1 image — capacity = 0 usable bytes after header."""
    return _make_png(str(tmp_path / "tiny.png"), width=1, height=1)


@pytest.fixture
def output_png(tmp_path):
    return str(tmp_path / "output.png")


def _run_embed_task(image_path, message, output_path,
                    payload_type="text", architecture="dense"):
    """Run embed_message eagerly with mocked log_activity; does NOT mock StegoService."""
    celery_app.conf.task_always_eager = True
    celery_app.conf.task_eager_propagates = True
    try:
        with patch("celery_app.tasks.embed.log_activity"):
            result = embed_task_fn.apply(kwargs={
                "image_path": image_path,
                "message": message,
                "output_path": output_path,
                "architecture": architecture,
                "user_id": 1,
                "payload_type": payload_type,
            }).result
    finally:
        celery_app.conf.task_always_eager = False
        celery_app.conf.task_eager_propagates = False
    return result


def _run_embed_mocked(image_path, message, output_path,
                      steganogan_side_effect=None,
                      lsb_capacity=5000,
                      lsb_return_value=None,
                      payload_type="text"):
    """
    Run embed_message eagerly with StegoService fully mocked.

    steganogan_side_effect=None  → SteganoGAN embed + verification both succeed
    steganogan_side_effect=exc   → SteganoGAN embed raises that exception
    """
    celery_app.conf.task_always_eager = True
    celery_app.conf.task_eager_propagates = True
    try:
        with patch("celery_app.tasks.embed.StegoService") as MockSvc, \
             patch("celery_app.tasks.embed.log_activity"):

            if steganogan_side_effect is None:
                # SteganoGAN embed succeeds; capture the wrapped message so
                # the extraction verification step returns an exact match.
                _captured = {}

                def _embed(img_path, msg, out_path, arch="dense"):
                    _captured["msg"] = msg
                    return output_path

                MockSvc.embed_steganogan.side_effect = _embed
                MockSvc.extract_steganogan.side_effect = (
                    lambda path, arch="dense": _captured.get("msg", "")
                )
            else:
                MockSvc.embed_steganogan.side_effect = steganogan_side_effect

            MockSvc.get_lsb_capacity.return_value = lsb_capacity
            MockSvc.embed_lsb.return_value = lsb_return_value or output_path

            result = embed_task_fn.apply(kwargs={
                "image_path": image_path,
                "message": message,
                "output_path": output_path,
                "payload_type": payload_type,
                "user_id": 1,
            }).result
    finally:
        celery_app.conf.task_always_eager = False
        celery_app.conf.task_eager_propagates = False
    return result


# ─────────────────────────────────────────────────────────────────────────────
# 1. StegoService.get_lsb_capacity
# ─────────────────────────────────────────────────────────────────────────────

class TestLsbCapacity:

    def test_capacity_formula_200x200(self, cover_png):
        capacity = StegoService.get_lsb_capacity(cover_png)
        # 200×200×3 bits ÷ 8 − 4-byte header = 15000 − 4 = 14996
        assert capacity == 200 * 200 * 3 // 8 - LSB_HEADER_BYTES

    def test_capacity_tiny_image(self, tiny_png):
        # 1×1×3 = 3 bits → floor(3/8)=0 bytes, minus header → negative or 0
        capacity = StegoService.get_lsb_capacity(tiny_png)
        assert capacity <= 0

    def test_capacity_raises_if_file_missing(self, tmp_path):
        with pytest.raises(Exception):
            StegoService.get_lsb_capacity(str(tmp_path / "ghost.png"))


# ─────────────────────────────────────────────────────────────────────────────
# 2. StegoService.embed_lsb + extract_lsb — unit tests
# ─────────────────────────────────────────────────────────────────────────────

class TestLsbEmbedExtract:

    def test_embed_produces_png(self, cover_png, output_png):
        data = b"hello lsb world"
        result = StegoService.embed_lsb(cover_png, data, output_png)
        assert result == output_png
        assert os.path.exists(output_png)
        with Image.open(output_png) as img:
            assert img.format == "PNG"

    def test_extract_recovers_exact_bytes(self, cover_png, output_png):
        data = b"exact byte recovery test"
        StegoService.embed_lsb(cover_png, data, output_png)
        recovered = StegoService.extract_lsb(output_png)
        assert recovered == data

    def test_roundtrip_short_text(self, cover_png, output_png):
        text = "Short message"
        StegoService.embed_lsb(cover_png, text.encode("utf-8"), output_png)
        recovered = StegoService.extract_lsb(output_png).decode("utf-8")
        assert recovered == text

    def test_roundtrip_long_text(self, cover_png, output_png):
        # 10 000-char string — fits in a 200×200 image (capacity ~14996 bytes)
        text = "A" * 10_000
        StegoService.embed_lsb(cover_png, text.encode("utf-8"), output_png)
        recovered = StegoService.extract_lsb(output_png).decode("utf-8")
        assert recovered == text

    def test_roundtrip_binary_data(self, cover_png, output_png):
        data = bytes(range(256)) * 10  # 2560 binary bytes
        StegoService.embed_lsb(cover_png, data, output_png)
        assert StegoService.extract_lsb(output_png) == data

    def test_roundtrip_raise_file_payload(self, cover_png, output_png):
        """The RAISE_FILE protocol survives an LSB roundtrip."""
        import base64
        payload_str = "RAISE_FILE:image/png:secret.png:" + base64.b64encode(b"fake-img").decode()
        StegoService.embed_lsb(cover_png, payload_str.encode("utf-8"), output_png)
        recovered = StegoService.extract_lsb(output_png).decode("utf-8")
        assert recovered == payload_str

    def test_embed_raises_value_error_on_overflow(self, tiny_png, output_png):
        """Embedding more bytes than capacity must raise ValueError with a helpful message."""
        data = b"X" * 1000  # way more than a 1×1 image can hold
        with pytest.raises(ValueError, match="[Pp]ayload too large"):
            StegoService.embed_lsb(tiny_png, data, output_png)

    def test_embed_raises_file_not_found(self, output_png):
        with pytest.raises(FileNotFoundError):
            StegoService.embed_lsb("/no/such/image.png", b"data", output_png)

    def test_extract_raises_file_not_found(self):
        with pytest.raises(FileNotFoundError):
            StegoService.extract_lsb("/no/such/image.png")

    def test_extract_raises_on_unmodified_image(self, cover_png):
        """Extracting from an image with no LSB payload raises ValueError."""
        with pytest.raises(ValueError, match="[Ii]nvalid LSB header"):
            StegoService.extract_lsb(cover_png)

    def test_output_is_always_png_even_for_jpeg_cover(self, tmp_path, output_png):
        """embed_lsb saves as PNG regardless of input format."""
        jpeg_cover = _make_jpeg(str(tmp_path / "cover.jpg"))
        StegoService.embed_lsb(jpeg_cover, b"data", output_png)
        with Image.open(output_png) as img:
            assert img.format == "PNG"

    def test_embed_at_exact_capacity(self, cover_png, output_png):
        """Embedding exactly at capacity (no overflow) must succeed."""
        capacity = StegoService.get_lsb_capacity(cover_png)
        data = b"Z" * capacity  # exactly at the limit
        StegoService.embed_lsb(cover_png, data, output_png)
        assert StegoService.extract_lsb(output_png) == data

    def test_embed_one_byte_over_capacity_raises(self, cover_png, output_png):
        capacity = StegoService.get_lsb_capacity(cover_png)
        data = b"Z" * (capacity + 1)
        with pytest.raises(ValueError):
            StegoService.embed_lsb(cover_png, data, output_png)


# ─────────────────────────────────────────────────────────────────────────────
# 3. embed_message Celery task — fallback logic (mocked StegoService)
# ─────────────────────────────────────────────────────────────────────────────

class TestEmbedTaskFallback:

    def test_steganogan_success_returns_steganogan_method(self, tmp_path):
        result = _run_embed_mocked(
            str(tmp_path / "cover.png"),
            "hello",
            str(tmp_path / "out.png"),
            steganogan_side_effect=None,  # success
        )
        assert result["method_used"] == "steganogan"
        assert result["architecture"] == "dense"

    def test_steganogan_failure_falls_back_to_lsb(self, tmp_path):
        result = _run_embed_mocked(
            str(tmp_path / "cover.png"),
            "hello",
            str(tmp_path / "out.png"),
            steganogan_side_effect=RuntimeError("capacity exceeded"),
            lsb_capacity=10_000,
        )
        assert result["method_used"] == "lsb"
        assert result["architecture"] is None  # not used for LSB

    def test_timeout_falls_back_to_lsb(self, tmp_path):
        result = _run_embed_mocked(
            str(tmp_path / "cover.png"),
            "hello",
            str(tmp_path / "out.png"),
            steganogan_side_effect=TimeoutError("timed out"),
            lsb_capacity=10_000,
        )
        assert result["method_used"] == "lsb"

    def test_generic_exception_falls_back_to_lsb(self, tmp_path):
        result = _run_embed_mocked(
            str(tmp_path / "cover.png"),
            "test",
            str(tmp_path / "out.png"),
            steganogan_side_effect=Exception("model error"),
            lsb_capacity=10_000,
        )
        assert result["method_used"] == "lsb"

    def test_capacity_exceeded_raises_value_error(self, tmp_path):
        """When LSB capacity is too small for the payload, ValueError must propagate."""
        long_message = "X" * 500
        celery_app.conf.task_always_eager = True
        celery_app.conf.task_eager_propagates = True
        try:
            with patch("celery_app.tasks.embed.StegoService") as MockSvc, \
                 patch("celery_app.tasks.embed.log_activity"):
                MockSvc.embed_steganogan.side_effect = RuntimeError("no capacity")
                MockSvc.get_lsb_capacity.return_value = 10  # far too small
                with pytest.raises(ValueError, match="[Cc]apacity exceeded"):
                    embed_task_fn.apply(kwargs={
                        "image_path": str(tmp_path / "cover.png"),
                        "message": long_message,
                        "output_path": str(tmp_path / "out.png"),
                        "payload_type": "text",
                        "user_id": 1,
                    })
        finally:
            celery_app.conf.task_always_eager = False
            celery_app.conf.task_eager_propagates = False

    def test_payload_type_text_in_result(self, tmp_path):
        result = _run_embed_mocked(
            str(tmp_path / "cover.png"),
            "hello",
            str(tmp_path / "out.png"),
            payload_type="text",
        )
        assert result["payload_type"] == "text"

    def test_payload_type_image_in_result(self, tmp_path):
        result = _run_embed_mocked(
            str(tmp_path / "cover.png"),
            "RAISE_FILE:image/png:x.png:abc",
            str(tmp_path / "out.png"),
            payload_type="image",
        )
        assert result["payload_type"] == "image"

    def test_payload_type_pdf_in_result(self, tmp_path):
        result = _run_embed_mocked(
            str(tmp_path / "cover.png"),
            "RAISE_FILE:application/pdf:doc.pdf:abc",
            str(tmp_path / "out.png"),
            payload_type="pdf",
        )
        assert result["payload_type"] == "pdf"

    def test_result_always_has_output_path(self, tmp_path):
        result = _run_embed_mocked(
            str(tmp_path / "cover.png"),
            "msg",
            str(tmp_path / "out.png"),
        )
        assert "output_path" in result
        assert result["output_path"] is not None

    def test_lsb_output_path_ends_with_png(self, tmp_path):
        """When falling back to LSB, the output path should be .png."""
        lsb_out = str(tmp_path / "out.png")
        result = _run_embed_mocked(
            str(tmp_path / "cover.jpg"),   # JPEG input
            "hello",
            str(tmp_path / "out.jpg"),     # original output path is .jpg
            steganogan_side_effect=RuntimeError("fail"),
            lsb_capacity=10_000,
            lsb_return_value=lsb_out,
        )
        assert result["output_path"].endswith(".png")

    def test_steganogan_verification_failure_falls_back_to_lsb(self, tmp_path):
        """SteganoGAN embeds but extraction returns wrong payload → falls back to LSB."""
        celery_app.conf.task_always_eager = True
        celery_app.conf.task_eager_propagates = True
        try:
            with patch("celery_app.tasks.embed.StegoService") as MockSvc, \
                 patch("celery_app.tasks.embed.log_activity"):
                MockSvc.embed_steganogan.return_value = str(tmp_path / "out.png")
                # Extraction returns wrong message — verification must fail
                MockSvc.extract_steganogan.return_value = "WRONG MESSAGE THAT DOES NOT MATCH"
                MockSvc.get_lsb_capacity.return_value = 10_000
                MockSvc.embed_lsb.return_value = str(tmp_path / "out.png")

                result = embed_task_fn.apply(kwargs={
                    "image_path": str(tmp_path / "cover.png"),
                    "message": "secret payload",
                    "output_path": str(tmp_path / "out.png"),
                    "payload_type": "text",
                    "user_id": 1,
                }).result
        finally:
            celery_app.conf.task_always_eager = False
            celery_app.conf.task_eager_propagates = False

        assert result["method_used"] == "lsb"
        assert result["architecture"] is None


# ─────────────────────────────────────────────────────────────────────────────
# 4. Full end-to-end LSB roundtrip through embed + extract tasks
# ─────────────────────────────────────────────────────────────────────────────

class TestLsbEndToEndTask:
    """
    Run embed_message and extract_message tasks back-to-back with real LSB
    operations (no StegoService mock) to prove the full pipeline works.
    """

    def _run_extract_real(self, image_path, method, tmp_output_dir):
        from celery_app.tasks.extract import extract_message as extract_task_fn
        original_output_dir = StegoService.__module__  # not used
        from core.config import settings
        old_out = settings.OUTPUT_DIR
        settings.OUTPUT_DIR = tmp_output_dir
        celery_app.conf.task_always_eager = True
        celery_app.conf.task_eager_propagates = True
        try:
            with patch("celery_app.tasks.extract.log_activity"):
                result = extract_task_fn.apply(kwargs={
                    "image_path": image_path,
                    "architecture": "dense",
                    "user_id": 1,
                    "method": method,
                }).result
        finally:
            celery_app.conf.task_always_eager = False
            celery_app.conf.task_eager_propagates = False
            settings.OUTPUT_DIR = old_out
        return result

    def test_text_lsb_roundtrip(self, cover_png, tmp_path):
        out_png = str(tmp_path / "stego.png")
        secret = "End-to-end LSB test message 🔒"
        data = secret.encode("utf-8")

        StegoService.embed_lsb(cover_png, data, out_png)

        result = self._run_extract_real(out_png, "lsb", str(tmp_path))

        assert result["content_type"] == "text"
        assert result["extracted_message"] == secret
        assert result["method_used"] == "lsb"

    def test_raise_file_lsb_roundtrip(self, cover_png, tmp_path, sample_png_bytes):
        import base64
        out_png = str(tmp_path / "stego.png")
        b64 = base64.b64encode(sample_png_bytes).decode()
        payload = f"RAISE_FILE:image/png:secret.png:{b64}"

        StegoService.embed_lsb(cover_png, payload.encode("utf-8"), out_png)

        result = self._run_extract_real(out_png, "lsb", str(tmp_path))

        assert result["content_type"] == "image"
        assert result["extracted_filename"] == "secret.png"
        assert result["method_used"] == "lsb"
        with open(result["extracted_file_path"], "rb") as f:
            assert f.read() == sample_png_bytes
