"""Tests for the download endpoint — handling both embed and extract file results."""
import os
from unittest.mock import patch, MagicMock

import pytest


class TestDownloadEmbed:
    """Test downloading embed job results (existing functionality)."""

    @patch("api.v1.stego.AsyncResult")
    def test_download_embed_result(self, MockAsyncResult, client, tmp_dirs, sample_png_bytes):
        _, output_dir = tmp_dirs

        # Create a fake output file
        output_file = os.path.join(output_dir, "test_output.png")
        with open(output_file, "wb") as f:
            f.write(sample_png_bytes)

        mock_result = MagicMock()
        mock_result.state = "SUCCESS"
        mock_result.result = {"output_path": output_file}
        MockAsyncResult.return_value = mock_result

        response = client.get("/api/v1/stego/download/test-job-id")

        assert response.status_code == 200
        assert response.headers["content-type"] == "image/png"
        assert response.content == sample_png_bytes

    @patch("api.v1.stego.AsyncResult")
    def test_download_not_ready(self, MockAsyncResult, client, tmp_dirs):
        mock_result = MagicMock()
        mock_result.state = "PENDING"
        MockAsyncResult.return_value = mock_result

        response = client.get("/api/v1/stego/download/test-job-id")

        assert response.status_code == 400
        assert "not ready" in response.json()["detail"].lower()


class TestDownloadExtractedFile:
    """Test downloading extracted file results (new functionality)."""

    @patch("api.v1.stego.AsyncResult")
    def test_download_extracted_image(self, MockAsyncResult, client, tmp_dirs, sample_png_bytes):
        _, output_dir = tmp_dirs

        # Create a fake extracted file
        extracted_file = os.path.join(output_dir, "test_secret.png")
        with open(extracted_file, "wb") as f:
            f.write(sample_png_bytes)

        mock_result = MagicMock()
        mock_result.state = "SUCCESS"
        mock_result.result = {
            "status": "completed",
            "content_type": "image",
            "extracted_mime_type": "image/png",
            "extracted_filename": "secret.png",
            "extracted_file_path": extracted_file,
        }
        MockAsyncResult.return_value = mock_result

        response = client.get("/api/v1/stego/download/extract-job-id")

        assert response.status_code == 200
        assert response.content == sample_png_bytes
        assert "secret.png" in response.headers.get("content-disposition", "")

    @patch("api.v1.stego.AsyncResult")
    def test_download_extracted_pdf(self, MockAsyncResult, client, tmp_dirs, sample_pdf_bytes):
        _, output_dir = tmp_dirs

        extracted_file = os.path.join(output_dir, "test_doc.pdf")
        with open(extracted_file, "wb") as f:
            f.write(sample_pdf_bytes)

        mock_result = MagicMock()
        mock_result.state = "SUCCESS"
        mock_result.result = {
            "status": "completed",
            "content_type": "application",
            "extracted_mime_type": "application/pdf",
            "extracted_filename": "report.pdf",
            "extracted_file_path": extracted_file,
        }
        MockAsyncResult.return_value = mock_result

        response = client.get("/api/v1/stego/download/pdf-job-id")

        assert response.status_code == 200
        assert response.content == sample_pdf_bytes
        assert "report.pdf" in response.headers.get("content-disposition", "")

    @patch("api.v1.stego.AsyncResult")
    def test_download_extracted_file_missing(self, MockAsyncResult, client, tmp_dirs):
        """If the extracted file was deleted, should return 404."""
        mock_result = MagicMock()
        mock_result.state = "SUCCESS"
        mock_result.result = {
            "status": "completed",
            "content_type": "image",
            "extracted_mime_type": "image/png",
            "extracted_filename": "ghost.png",
            "extracted_file_path": "/nonexistent/path/ghost.png",
        }
        MockAsyncResult.return_value = mock_result

        response = client.get("/api/v1/stego/download/missing-job-id")

        assert response.status_code == 404

    @patch("api.v1.stego.AsyncResult")
    def test_download_text_extract_returns_400(self, MockAsyncResult, client, tmp_dirs):
        """Text extract results have no downloadable file."""
        mock_result = MagicMock()
        mock_result.state = "SUCCESS"
        mock_result.result = {
            "status": "completed",
            "content_type": "text",
            "extracted_message": "Hello world",
        }
        MockAsyncResult.return_value = mock_result

        response = client.get("/api/v1/stego/download/text-job-id")

        assert response.status_code == 400
        assert "downloadable" in response.json()["detail"].lower()
