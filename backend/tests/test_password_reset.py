"""
Tests for password reset flow.
Run: pytest tests/test_password_reset.py -v
"""
import pytest
from unittest.mock import patch, MagicMock
import hashlib
import datetime
from jose import jwt


class TestPasswordResetFlow:
    @patch('users.get_db_connection')
    def test_forgot_password_returns_success_for_existing_email(self, mock_get_conn):
        from fastapi.testclient import TestClient
        from main import app

        mock_conn = MagicMock()
        mock_cursor = MagicMock()
        mock_cursor.fetchone.return_value = {"id": 1, "email": "test@test.com", "username": "test"}
        mock_conn.cursor.return_value = mock_cursor
        mock_get_conn.return_value = mock_conn

        client = TestClient(app)
        response = client.post(
            '/api/v1/forgot-password',
            json={"email": "test@test.com"},
        )
        assert response.status_code == 200
        assert "reset link has been sent" in response.json()["message"]

    @patch('users.get_db_connection')
    def test_forgot_password_returns_success_for_nonexistent_email(self, mock_get_conn):
        from fastapi.testclient import TestClient
        from main import app

        mock_conn = MagicMock()
        mock_cursor = MagicMock()
        mock_cursor.fetchone.return_value = None
        mock_conn.cursor.return_value = mock_cursor
        mock_get_conn.return_value = mock_conn

        client = TestClient(app)
        response = client.post(
            '/api/v1/forgot-password',
            json={"email": "nonexistent@test.com"},
        )
        assert response.status_code == 200
        assert "reset link has been sent" in response.json()["message"]

    @patch('users.verify_password_reset_token')
    @patch('users.get_db_connection')
    def test_reset_password_with_valid_token(self, mock_get_conn, mock_verify_token):
        from fastapi.testclient import TestClient
        from main import app

        mock_conn = MagicMock()
        mock_cursor = MagicMock()
        mock_cursor.fetchone.return_value = {"id": 1, "email": "test@test.com", "username": "test", "password_hash": "hashed"}
        mock_conn.cursor.return_value = mock_cursor
        mock_get_conn.return_value = mock_conn

        mock_verify_token.return_value = {"id": 1, "user_id": 1, "expires_at": datetime.datetime.now() + datetime.timedelta(hours=1), "used": False}

        with patch('users.pwd_context.hash', return_value='hashed_password'):
            client = TestClient(app)
            response = client.post(
                '/api/v1/reset-password',
                json={"token": "test-reset-token-123", "new_password": "NewPass123!"},
            )
            assert response.status_code == 200
            assert "successful" in response.json()["message"]

    @patch('users.verify_password_reset_token')
    @patch('users.get_db_connection')
    def test_reset_password_with_invalid_token(self, mock_get_conn, mock_verify_token):
        from fastapi.testclient import TestClient
        from main import app

        mock_conn = MagicMock()
        mock_cursor = MagicMock()
        mock_cursor.fetchone.return_value = {"id": 1, "email": "test@test.com", "username": "test", "password_hash": "hashed"}
        mock_conn.cursor.return_value = mock_cursor
        mock_get_conn.return_value = mock_conn

        mock_verify_token.return_value = None

        client = TestClient(app)
        response = client.post(
            '/api/v1/reset-password',
            json={"token": "invalid-token", "new_password": "NewPass123!"},
        )
        assert response.status_code == 400
        assert "Invalid or expired" in response.json()["detail"]

    @patch('users.verify_password_reset_token')
    @patch('users.get_db_connection')
    def test_reset_password_with_used_token(self, mock_get_conn, mock_verify_token):
        from fastapi.testclient import TestClient
        from main import app

        mock_conn = MagicMock()
        mock_cursor = MagicMock()
        mock_cursor.fetchone.return_value = {"id": 1, "email": "test@test.com", "username": "test", "password_hash": "hashed"}
        mock_conn.cursor.return_value = mock_cursor
        mock_get_conn.return_value = mock_conn

        mock_verify_token.return_value = None

        client = TestClient(app)
        response = client.post(
            '/api/v1/reset-password',
            json={"token": "used-token", "new_password": "NewPass123!"},
        )
        assert response.status_code == 400
        assert "Invalid or expired" in response.json()["detail"]
