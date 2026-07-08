"""Tests for the extract Celery task — method routing and RAISE_FILE detection."""
import base64
import os
from unittest.mock import patch, MagicMock

import pytest

from core.config import settings
from celery_app.tasks.extract import extract_message
from celery_app.worker import celery_app


def _run_extract(extracted_text, tmp_output_dir, method="steganogan"):
    """
    Run the extract task eagerly with a mocked StegoService.

    Configures extract_steganogan to return *extracted_text*; for method="lsb"
    configures extract_lsb to return the UTF-8 bytes of *extracted_text*.
    """
    original_output_dir = settings.OUTPUT_DIR
    settings.OUTPUT_DIR = tmp_output_dir

    try:
        with patch("celery_app.tasks.extract.StegoService") as MockService, \
             patch("celery_app.tasks.extract.log_activity"):

            # Wire the correct mock for each method
            MockService.extract_steganogan.return_value = extracted_text
            MockService.extract_lsb.return_value = extracted_text.encode("utf-8")

            celery_app.conf.task_always_eager = True
            celery_app.conf.task_eager_propagates = True
            try:
                async_result = extract_message.apply(
                    kwargs={
                        "image_path": "/fake/image.png",
                        "architecture": "dense",
                        "user_id": 1,
                        "method": method,
                    }
                )
                return async_result.result
            finally:
                celery_app.conf.task_always_eager = False
                celery_app.conf.task_eager_propagates = False
    finally:
        settings.OUTPUT_DIR = original_output_dir


class TestExtractFileDetection:
    """RAISE_FILE detection using the default (SteganoGAN) method."""

    def test_plain_text_extraction(self, tmp_dirs):
        _, output_dir = tmp_dirs
        result = _run_extract("Hello world", output_dir)

        assert result["content_type"] == "text"
        assert result["extracted_message"] == "Hello world"
        assert result["method_used"] == "steganogan"
        assert "extracted_file_path" not in result

    def test_image_file_extraction(self, tmp_dirs, sample_png_bytes):
        _, output_dir = tmp_dirs
        b64 = base64.b64encode(sample_png_bytes).decode("utf-8")
        payload = f"RAISE_FILE:image/png:secret.png:{b64}"

        result = _run_extract(payload, output_dir)

        assert result["content_type"] == "image"
        assert result["extracted_mime_type"] == "image/png"
        assert result["extracted_filename"] == "secret.png"
        assert result["method_used"] == "steganogan"
        assert os.path.exists(result["extracted_file_path"])
        with open(result["extracted_file_path"], "rb") as f:
            assert f.read() == sample_png_bytes

    def test_pdf_file_extraction(self, tmp_dirs, sample_pdf_bytes):
        _, output_dir = tmp_dirs
        b64 = base64.b64encode(sample_pdf_bytes).decode("utf-8")
        payload = f"RAISE_FILE:application/pdf:report.pdf:{b64}"

        result = _run_extract(payload, output_dir)

        assert result["content_type"] == "application"
        assert result["extracted_mime_type"] == "application/pdf"
        assert result["extracted_filename"] == "report.pdf"
        assert result["method_used"] == "steganogan"
        assert os.path.exists(result["extracted_file_path"])
        with open(result["extracted_file_path"], "rb") as f:
            assert f.read() == sample_pdf_bytes

    def test_jpeg_file_extraction(self, tmp_dirs, sample_jpeg_bytes):
        _, output_dir = tmp_dirs
        b64 = base64.b64encode(sample_jpeg_bytes).decode("utf-8")
        payload = f"RAISE_FILE:image/jpeg:photo.jpg:{b64}"

        result = _run_extract(payload, output_dir)

        assert result["content_type"] == "image"
        assert result["extracted_mime_type"] == "image/jpeg"
        assert result["extracted_filename"] == "photo.jpg"
        assert result["method_used"] == "steganogan"
        with open(result["extracted_file_path"], "rb") as f:
            assert f.read() == sample_jpeg_bytes

    def test_corrupted_raise_file_falls_back_to_text(self, tmp_dirs):
        _, output_dir = tmp_dirs
        payload = "RAISE_FILE:image/png"

        result = _run_extract(payload, output_dir)

        assert result["content_type"] == "text"
        assert result["extracted_message"] == payload
        assert result["method_used"] == "steganogan"

    def test_invalid_base64_falls_back_to_text(self, tmp_dirs):
        _, output_dir = tmp_dirs
        payload = "RAISE_FILE:image/png:test.png:NOT_VALID_BASE64!!!"

        result = _run_extract(payload, output_dir)

        assert result["content_type"] == "text"
        assert result["extracted_message"] == payload
        assert result["method_used"] == "steganogan"

    def test_text_starting_with_raise_but_not_file(self, tmp_dirs):
        _, output_dir = tmp_dirs
        result = _run_extract("RAISE the roof!", output_dir)

        assert result["content_type"] == "text"
        assert result["extracted_message"] == "RAISE the roof!"
        assert result["method_used"] == "steganogan"

    def test_output_dir_created_if_missing(self, tmp_path, sample_png_bytes):
        output_dir = str(tmp_path / "nonexistent" / "outputs")
        b64 = base64.b64encode(sample_png_bytes).decode("utf-8")
        payload = f"RAISE_FILE:image/png:test.png:{b64}"

        result = _run_extract(payload, output_dir)

        assert os.path.exists(result["extracted_file_path"])
        assert os.path.isdir(output_dir)

    def test_filename_path_traversal_prevented(self, tmp_dirs, sample_png_bytes):
        _, output_dir = tmp_dirs
        b64 = base64.b64encode(sample_png_bytes).decode("utf-8")
        payload = f"RAISE_FILE:image/png:../../etc/passwd:{b64}"

        result = _run_extract(payload, output_dir)

        assert result["extracted_filename"] == "passwd"
        assert output_dir in result["extracted_file_path"]


class TestExtractAutoMethod:
    """Verify the task auto-detection: SteganoGAN first, LSB fallback."""

    def test_auto_uses_steganogan_when_available(self, tmp_dirs):
        _, output_dir = tmp_dirs
        result = _run_extract("auto steganogan message", output_dir, method="auto")

        assert result["content_type"] == "text"
        assert result["extracted_message"] == "auto steganogan message"
        assert result["method_used"] == "steganogan"

    def test_auto_falls_back_to_lsb_on_steganogan_failure(self, tmp_dirs):
        _, output_dir = tmp_dirs
        original_output_dir = None
        from core.config import settings
        original_output_dir = settings.OUTPUT_DIR
        settings.OUTPUT_DIR = output_dir

        try:
            with patch("celery_app.tasks.extract.StegoService") as MockService, \
                 patch("celery_app.tasks.extract.log_activity"):

                MockService.extract_steganogan.side_effect = RuntimeError("model error")
                MockService.extract_lsb.return_value = b"lsb fallback text"

                from celery_app.worker import celery_app
                from celery_app.tasks.extract import extract_message
                celery_app.conf.task_always_eager = True
                celery_app.conf.task_eager_propagates = True
                try:
                    result = extract_message.apply(kwargs={
                        "image_path": "/fake/image.png",
                        "architecture": "dense",
                        "user_id": 1,
                        "method": "auto",
                    }).result
                finally:
                    celery_app.conf.task_always_eager = False
                    celery_app.conf.task_eager_propagates = False

            assert result["content_type"] == "text"
            assert result["extracted_message"] == "lsb fallback text"
            assert result["method_used"] == "lsb"
        finally:
            settings.OUTPUT_DIR = original_output_dir


class TestExtractLsbMethod:
    """Verify the task routes correctly when method='lsb'."""

    def test_lsb_plain_text(self, tmp_dirs):
        _, output_dir = tmp_dirs
        result = _run_extract("secret lsb message", output_dir, method="lsb")

        assert result["content_type"] == "text"
        assert result["extracted_message"] == "secret lsb message"
        assert result["method_used"] == "lsb"
        assert result["architecture"] is None  # LSB doesn't use architecture

    def test_lsb_raise_file_image(self, tmp_dirs, sample_png_bytes):
        _, output_dir = tmp_dirs
        b64 = base64.b64encode(sample_png_bytes).decode("utf-8")
        payload = f"RAISE_FILE:image/png:secret.png:{b64}"

        result = _run_extract(payload, output_dir, method="lsb")

        assert result["content_type"] == "image"
        assert result["method_used"] == "lsb"
        assert os.path.exists(result["extracted_file_path"])

    def test_lsb_raise_file_pdf(self, tmp_dirs, sample_pdf_bytes):
        _, output_dir = tmp_dirs
        b64 = base64.b64encode(sample_pdf_bytes).decode("utf-8")
        payload = f"RAISE_FILE:application/pdf:report.pdf:{b64}"

        result = _run_extract(payload, output_dir, method="lsb")

        assert result["content_type"] == "application"
        assert result["method_used"] == "lsb"


class TestExtractRoundTrip:

    def test_roundtrip_image(self, sample_png_bytes):
        mime_type = "image/png"
        filename = "secret.png"
        b64_data = base64.b64encode(sample_png_bytes).decode("utf-8")
        payload = f"RAISE_FILE:{mime_type}:{filename}:{b64_data}"

        remainder = payload[len("RAISE_FILE:"):]
        parsed_mime, parsed_filename, parsed_b64 = remainder.split(":", 2)

        assert parsed_mime == mime_type
        assert parsed_filename == filename
        assert base64.b64decode(parsed_b64) == sample_png_bytes

    def test_roundtrip_pdf(self, sample_pdf_bytes):
        mime_type = "application/pdf"
        filename = "doc.pdf"
        b64_data = base64.b64encode(sample_pdf_bytes).decode("utf-8")
        payload = f"RAISE_FILE:{mime_type}:{filename}:{b64_data}"

        remainder = payload[len("RAISE_FILE:"):]
        parsed_mime, parsed_filename, parsed_b64 = remainder.split(":", 2)

        assert parsed_mime == mime_type
        assert parsed_filename == filename
        assert base64.b64decode(parsed_b64) == sample_pdf_bytes

    def test_filename_with_special_characters(self):
        data = b"test data"
        filename = "my report (final).pdf"
        b64_data = base64.b64encode(data).decode("utf-8")
        payload = f"RAISE_FILE:application/pdf:{filename}:{b64_data}"

        remainder = payload[len("RAISE_FILE:"):]
        parsed_mime, parsed_filename, parsed_b64 = remainder.split(":", 2)

        assert parsed_filename == filename
        assert base64.b64decode(parsed_b64) == data
