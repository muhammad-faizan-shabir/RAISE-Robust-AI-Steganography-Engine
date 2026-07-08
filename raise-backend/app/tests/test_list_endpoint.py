"""Tests for the list/history endpoint — verifying operation_type casing."""
import json
from unittest.mock import patch, MagicMock
from datetime import datetime

import pytest

from models.stego_jobs import StegoJob, OperationType, JobStatus


class TestListEndpoint:
    """Test that the list endpoint returns lowercase operation_type values."""

    def test_list_returns_lowercase_operation_type(self, client, mock_db):
        """operation_type should be lowercase ('embed', 'extract') for frontend compatibility."""
        # Create mock jobs
        embed_job = MagicMock(spec=StegoJob)
        embed_job.id = 1
        embed_job.job_id = "embed-job-id"
        embed_job.operation_type = OperationType.EMBED
        embed_job.original_filename = "cover.png"
        embed_job.status = JobStatus.SUCCESS
        embed_job.result = json.dumps({"output_path": "/app/output/test.png"})
        embed_job.error = None
        embed_job.payload_type = "text"
        embed_job.method_used = "lsb"
        embed_job.created_at = datetime(2026, 1, 1)

        extract_job = MagicMock(spec=StegoJob)
        extract_job.id = 2
        extract_job.job_id = "extract-job-id"
        extract_job.operation_type = OperationType.EXTRACT
        extract_job.original_filename = "stego.png"
        extract_job.status = JobStatus.SUCCESS
        extract_job.result = json.dumps({
            "extracted_message": "hello",
            "content_type": "text",
        })
        extract_job.error = None
        extract_job.payload_type = None
        extract_job.method_used = "steganogan"
        extract_job.created_at = datetime(2026, 1, 2)

        # Mock the DB query chain
        mock_query = MagicMock()
        mock_query.filter.return_value = mock_query
        mock_query.count.return_value = 2
        mock_query.order_by.return_value = mock_query
        mock_query.offset.return_value = mock_query
        mock_query.limit.return_value = mock_query
        mock_query.all.return_value = [embed_job, extract_job]
        mock_db.query.return_value = mock_query

        response = client.get("/api/v1/stego")

        assert response.status_code == 200
        body = response.json()

        assert len(body["items"]) == 2
        assert body["items"][0]["operation_type"] == "embed"
        assert body["items"][1]["operation_type"] == "extract"

    def test_list_returns_result_with_extracted_message(self, client, mock_db):
        """Extract job results should include extracted_message in the response."""
        extract_job = MagicMock(spec=StegoJob)
        extract_job.id = 1
        extract_job.job_id = "extract-job-id"
        extract_job.operation_type = OperationType.EXTRACT
        extract_job.original_filename = "stego.png"
        extract_job.status = JobStatus.SUCCESS
        extract_job.result = json.dumps({
            "status": "completed",
            "message": "Message extracted successfully",
            "content_type": "text",
            "extracted_message": "secret message here",
            "architecture": "dense",
        })
        extract_job.error = None
        extract_job.payload_type = "text"
        extract_job.method_used = "steganogan"
        extract_job.created_at = datetime(2026, 1, 1)

        mock_query = MagicMock()
        mock_query.filter.return_value = mock_query
        mock_query.count.return_value = 1
        mock_query.order_by.return_value = mock_query
        mock_query.offset.return_value = mock_query
        mock_query.limit.return_value = mock_query
        mock_query.all.return_value = [extract_job]
        mock_db.query.return_value = mock_query

        response = client.get("/api/v1/stego")

        assert response.status_code == 200
        body = response.json()
        item = body["items"][0]

        assert item["operation_type"] == "extract"
        assert item["result"]["extracted_message"] == "secret message here"
        assert item["result"]["content_type"] == "text"

    def test_list_embed_job_has_output_path_in_result(self, client, mock_db):
        """Embed job results should include output_path for download."""
        embed_job = MagicMock(spec=StegoJob)
        embed_job.id = 1
        embed_job.job_id = "embed-job-id"
        embed_job.operation_type = OperationType.EMBED
        embed_job.original_filename = "cover.png"
        embed_job.status = JobStatus.SUCCESS
        embed_job.result = json.dumps({
            "status": "completed",
            "message": "Message embedded successfully",
            "output_path": "/app/temp/outputs/embed-job-id_output.png",
            "architecture": "dense",
            "method_used": "steganogan",
            "payload_type": "text",
        })
        embed_job.error = None
        embed_job.payload_type = "text"
        embed_job.method_used = "steganogan"
        embed_job.created_at = datetime(2026, 1, 1)

        mock_query = MagicMock()
        mock_query.filter.return_value = mock_query
        mock_query.count.return_value = 1
        mock_query.order_by.return_value = mock_query
        mock_query.offset.return_value = mock_query
        mock_query.limit.return_value = mock_query
        mock_query.all.return_value = [embed_job]
        mock_db.query.return_value = mock_query

        response = client.get("/api/v1/stego")

        assert response.status_code == 200
        body = response.json()
        item = body["items"][0]

        assert item["operation_type"] == "embed"
        assert item["status"] == "SUCCESS"
        assert "output_path" in item["result"]
