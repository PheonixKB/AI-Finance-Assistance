"""
Tests for upload route file size limits.
Run: pytest tests/test_uploads.py -v
"""
import pytest
from unittest.mock import patch, MagicMock
from io import BytesIO


class TestUploadFileSizeLimit:
    @patch('routes.upload_routes.get_db_connection')
    def test_transaction_upload_rejects_oversized_file(self, mock_get_conn):
        from fastapi.testclient import TestClient
        from main import app
        from users import get_current_user

        def mock_dep():
            return {"id": 1, "email": "test@test.com", "username": "test"}

        app.dependency_overrides[get_current_user] = mock_dep

        mock_conn = MagicMock()
        mock_cursor = MagicMock()
        mock_conn.cursor.return_value = mock_cursor
        mock_get_conn.return_value = mock_conn

        try:
            client = TestClient(app)
            large_content = b"x" * (11 * 1024 * 1024)
            response = client.post(
                '/api/upload/transactions',
                files={"file": ("test.xlsx", BytesIO(large_content), "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")},
            )
            assert response.status_code == 413
        finally:
            app.dependency_overrides.clear()

    @patch('routes.upload_routes.get_db_connection')
    def test_investment_upload_rejects_oversized_file(self, mock_get_conn):
        from fastapi.testclient import TestClient
        from main import app
        from users import get_current_user

        def mock_dep():
            return {"id": 1, "email": "test@test.com", "username": "test"}

        app.dependency_overrides[get_current_user] = mock_dep

        mock_conn = MagicMock()
        mock_cursor = MagicMock()
        mock_conn.cursor.return_value = mock_cursor
        mock_get_conn.return_value = mock_conn

        try:
            client = TestClient(app)
            large_content = b"x" * (11 * 1024 * 1024)
            response = client.post(
                '/api/upload/investments',
                files={"file": ("test.pdf", BytesIO(large_content), "application/pdf")},
            )
            assert response.status_code == 413
        finally:
            app.dependency_overrides.clear()
