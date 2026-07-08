"""Tests for the embed endpoint with file steganography support."""
import io
import base64
from unittest.mock import patch, MagicMock

import pytest


def _get_message(mock_embed_task):
    """Extract the 'message' kwarg passed to embed_task.apply_async."""
    return mock_embed_task.apply_async.call_args[1]["kwargs"]["message"]


def _get_payload_type(mock_embed_task):
    """Extract the 'payload_type' kwarg passed to embed_task.apply_async."""
    return mock_embed_task.apply_async.call_args[1]["kwargs"]["payload_type"]


# ------------------------------------------------------------------
# Tests: Text embedding
# ------------------------------------------------------------------

class TestEmbedText:
    """Test that text embedding still works as before."""

    @patch("api.v1.stego.embed_task")
    def test_embed_text_message_success(self, mock_embed_task, client, sample_png_bytes):
        mock_task = MagicMock()
        mock_task.id = "test-job-id"
        mock_embed_task.apply_async.return_value = mock_task

        response = client.post(
            "/api/v1/stego/embed",
            files={"image": ("cover.png", io.BytesIO(sample_png_bytes), "image/png")},
            data={
                "message": "Hello secret world",
                "content_type": "text",
                "architecture": "dense",
            },
        )

        assert response.status_code == 200
        body = response.json()
        assert body["job_id"] == "test-job-id"
        assert body["status"] == "PENDING"
        assert _get_message(mock_embed_task) == "Hello secret world"

    @patch("api.v1.stego.embed_task")
    def test_embed_text_payload_type_stored(self, mock_embed_task, client, sample_png_bytes):
        """payload_type='text' must be passed to the task and saved on the DB job."""
        mock_task = MagicMock()
        mock_task.id = "test-job-id"
        mock_embed_task.apply_async.return_value = mock_task

        response = client.post(
            "/api/v1/stego/embed",
            files={"image": ("cover.png", io.BytesIO(sample_png_bytes), "image/png")},
            data={"message": "Hello", "content_type": "text"},
        )

        assert response.status_code == 200
        assert _get_payload_type(mock_embed_task) == "text"

    @patch("api.v1.stego.embed_task")
    def test_embed_text_default_content_type(self, mock_embed_task, client, sample_png_bytes):
        """content_type defaults to 'text' when omitted."""
        mock_task = MagicMock()
        mock_task.id = "test-job-id"
        mock_embed_task.apply_async.return_value = mock_task

        response = client.post(
            "/api/v1/stego/embed",
            files={"image": ("cover.png", io.BytesIO(sample_png_bytes), "image/png")},
            data={"message": "default text", "architecture": "dense"},
        )

        assert response.status_code == 200
        assert _get_message(mock_embed_task) == "default text"

    @patch("api.v1.stego.embed_task")
    def test_embed_text_missing_message_returns_400(self, mock_embed_task, client, sample_png_bytes):
        """When content_type is text but no message, should return 400."""
        response = client.post(
            "/api/v1/stego/embed",
            files={"image": ("cover.png", io.BytesIO(sample_png_bytes), "image/png")},
            data={"content_type": "text", "architecture": "dense"},
        )

        assert response.status_code == 400
        assert "Message is required" in response.json()["detail"]

    @patch("api.v1.stego.embed_task")
    def test_embed_text_empty_message_returns_400(self, mock_embed_task, client, sample_png_bytes):
        response = client.post(
            "/api/v1/stego/embed",
            files={"image": ("cover.png", io.BytesIO(sample_png_bytes), "image/png")},
            data={"message": "   ", "content_type": "text", "architecture": "dense"},
        )

        assert response.status_code == 400


# ------------------------------------------------------------------
# Tests: Image file embedding
# ------------------------------------------------------------------

class TestEmbedImage:
    """Test embedding images within images."""

    @patch("api.v1.stego.embed_task")
    def test_embed_image_file_success(self, mock_embed_task, client, sample_png_bytes):
        mock_task = MagicMock()
        mock_task.id = "img-job-id"
        mock_embed_task.apply_async.return_value = mock_task

        response = client.post(
            "/api/v1/stego/embed",
            files={
                "image": ("cover.png", io.BytesIO(sample_png_bytes), "image/png"),
                "secret_file": ("secret.png", io.BytesIO(sample_png_bytes), "image/png"),
            },
            data={"content_type": "image", "architecture": "dense"},
        )

        assert response.status_code == 200
        assert response.json()["job_id"] == "img-job-id"

        payload = _get_message(mock_embed_task)
        assert payload.startswith("RAISE_FILE:image/png:secret.png:")
        parts = payload.split(":", 3)
        assert base64.b64decode(parts[3]) == sample_png_bytes

    @patch("api.v1.stego.embed_task")
    def test_embed_image_payload_type_stored(self, mock_embed_task, client, sample_png_bytes):
        """payload_type='image' must be forwarded to the task."""
        mock_task = MagicMock()
        mock_task.id = "img-job-id"
        mock_embed_task.apply_async.return_value = mock_task

        client.post(
            "/api/v1/stego/embed",
            files={
                "image": ("cover.png", io.BytesIO(sample_png_bytes), "image/png"),
                "secret_file": ("secret.png", io.BytesIO(sample_png_bytes), "image/png"),
            },
            data={"content_type": "image"},
        )

        assert _get_payload_type(mock_embed_task) == "image"

    @patch("api.v1.stego.embed_task")
    def test_embed_image_jpeg_accepted(self, mock_embed_task, client, sample_png_bytes, sample_jpeg_bytes):
        mock_task = MagicMock()
        mock_task.id = "jpeg-job-id"
        mock_embed_task.apply_async.return_value = mock_task

        response = client.post(
            "/api/v1/stego/embed",
            files={
                "image": ("cover.png", io.BytesIO(sample_png_bytes), "image/png"),
                "secret_file": ("photo.jpg", io.BytesIO(sample_jpeg_bytes), "image/jpeg"),
            },
            data={"content_type": "image", "architecture": "dense"},
        )

        assert response.status_code == 200
        payload = _get_message(mock_embed_task)
        assert payload.startswith("RAISE_FILE:image/jpeg:photo.jpg:")

    @patch("api.v1.stego.embed_task")
    def test_embed_image_rejects_pdf_file(self, mock_embed_task, client, sample_png_bytes, sample_pdf_bytes):
        """Sending a PDF when content_type is 'image' should fail."""
        response = client.post(
            "/api/v1/stego/embed",
            files={
                "image": ("cover.png", io.BytesIO(sample_png_bytes), "image/png"),
                "secret_file": ("doc.pdf", io.BytesIO(sample_pdf_bytes), "application/pdf"),
            },
            data={"content_type": "image", "architecture": "dense"},
        )

        assert response.status_code == 400
        assert "Invalid secret file type" in response.json()["detail"]

    @patch("api.v1.stego.embed_task")
    def test_embed_image_missing_secret_file(self, mock_embed_task, client, sample_png_bytes):
        """content_type image but no secret_file should fail."""
        response = client.post(
            "/api/v1/stego/embed",
            files={"image": ("cover.png", io.BytesIO(sample_png_bytes), "image/png")},
            data={"content_type": "image", "architecture": "dense"},
        )

        assert response.status_code == 400
        assert "secret_file is required" in response.json()["detail"]


# ------------------------------------------------------------------
# Tests: PDF file embedding
# ------------------------------------------------------------------

class TestEmbedPdf:
    """Test embedding PDFs within images."""

    @patch("api.v1.stego.embed_task")
    def test_embed_pdf_success(self, mock_embed_task, client, sample_png_bytes, sample_pdf_bytes):
        mock_task = MagicMock()
        mock_task.id = "pdf-job-id"
        mock_embed_task.apply_async.return_value = mock_task

        response = client.post(
            "/api/v1/stego/embed",
            files={
                "image": ("cover.png", io.BytesIO(sample_png_bytes), "image/png"),
                "secret_file": ("report.pdf", io.BytesIO(sample_pdf_bytes), "application/pdf"),
            },
            data={"content_type": "pdf", "architecture": "dense"},
        )

        assert response.status_code == 200
        payload = _get_message(mock_embed_task)
        assert payload.startswith("RAISE_FILE:application/pdf:report.pdf:")
        parts = payload.split(":", 3)
        assert base64.b64decode(parts[3]) == sample_pdf_bytes

    @patch("api.v1.stego.embed_task")
    def test_embed_pdf_payload_type_stored(self, mock_embed_task, client, sample_png_bytes, sample_pdf_bytes):
        mock_task = MagicMock()
        mock_task.id = "pdf-job-id"
        mock_embed_task.apply_async.return_value = mock_task

        client.post(
            "/api/v1/stego/embed",
            files={
                "image": ("cover.png", io.BytesIO(sample_png_bytes), "image/png"),
                "secret_file": ("report.pdf", io.BytesIO(sample_pdf_bytes), "application/pdf"),
            },
            data={"content_type": "pdf"},
        )

        assert _get_payload_type(mock_embed_task) == "pdf"

    @patch("api.v1.stego.embed_task")
    def test_embed_pdf_rejects_image_file(self, mock_embed_task, client, sample_png_bytes):
        """Sending an image when content_type is 'pdf' should fail."""
        response = client.post(
            "/api/v1/stego/embed",
            files={
                "image": ("cover.png", io.BytesIO(sample_png_bytes), "image/png"),
                "secret_file": ("photo.png", io.BytesIO(sample_png_bytes), "image/png"),
            },
            data={"content_type": "pdf", "architecture": "dense"},
        )

        assert response.status_code == 400
        assert "Invalid secret file type" in response.json()["detail"]


# ------------------------------------------------------------------
# Tests: Cover image validation
# ------------------------------------------------------------------

class TestCoverImageValidation:

    @patch("api.v1.stego.embed_task")
    def test_embed_rejects_non_image_cover(self, mock_embed_task, client, sample_pdf_bytes):
        """Cover image must be PNG or JPEG."""
        response = client.post(
            "/api/v1/stego/embed",
            files={"image": ("cover.pdf", io.BytesIO(sample_pdf_bytes), "application/pdf")},
            data={"message": "hello", "content_type": "text", "architecture": "dense"},
        )

        assert response.status_code == 400
        assert "Invalid file type" in response.json()["detail"]


# ------------------------------------------------------------------
# Tests: Extract endpoint — method parameter
# ------------------------------------------------------------------

class TestExtractMethod:
    """Verify the extract endpoint correctly accepts and forwards the method param."""

    @patch("api.v1.stego.extract_task")
    def test_extract_defaults_to_auto(self, mock_extract_task, client, sample_png_bytes):
        mock_task = MagicMock()
        mock_task.id = "extract-job-id"
        mock_extract_task.apply_async.return_value = mock_task

        response = client.post(
            "/api/v1/stego/extract",
            files={"image": ("stego.png", io.BytesIO(sample_png_bytes), "image/png")},
            data={"architecture": "dense"},
        )

        assert response.status_code == 200
        kwargs = mock_extract_task.apply_async.call_args[1]["kwargs"]
        assert kwargs["method"] == "auto"

    @patch("api.v1.stego.extract_task")
    def test_extract_auto_method_forwarded(self, mock_extract_task, client, sample_png_bytes):
        mock_task = MagicMock()
        mock_task.id = "auto-extract-id"
        mock_extract_task.apply_async.return_value = mock_task

        response = client.post(
            "/api/v1/stego/extract",
            files={"image": ("stego.png", io.BytesIO(sample_png_bytes), "image/png")},
            data={"method": "auto"},
        )

        assert response.status_code == 200
        kwargs = mock_extract_task.apply_async.call_args[1]["kwargs"]
        assert kwargs["method"] == "auto"

    @patch("api.v1.stego.extract_task")
    def test_extract_lsb_method_forwarded(self, mock_extract_task, client, sample_png_bytes):
        mock_task = MagicMock()
        mock_task.id = "lsb-extract-id"
        mock_extract_task.apply_async.return_value = mock_task

        response = client.post(
            "/api/v1/stego/extract",
            files={"image": ("stego.png", io.BytesIO(sample_png_bytes), "image/png")},
            data={"method": "lsb"},
        )

        assert response.status_code == 200
        kwargs = mock_extract_task.apply_async.call_args[1]["kwargs"]
        assert kwargs["method"] == "lsb"

    @patch("api.v1.stego.extract_task")
    def test_extract_invalid_method_rejected(self, mock_extract_task, client, sample_png_bytes):
        """Providing an unsupported method value should return 422."""
        response = client.post(
            "/api/v1/stego/extract",
            files={"image": ("stego.png", io.BytesIO(sample_png_bytes), "image/png")},
            data={"method": "magic"},
        )

        assert response.status_code == 422
