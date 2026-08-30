"""
Tests for JWT authentication and auth dependency.
Run: pytest tests/test_auth.py -v
"""
import pytest
from jose import jwt
import os
import datetime


class TestJWT:
    def test_jwt_encode_decode(self):
        secret = os.environ.get('SECRET_KEY', 'test-secret-key-for-testing')
        token = jwt.encode(
            {"sub": "test@example.com", "username": "testuser"},
            secret,
            algorithm="HS256",
        )
        payload = jwt.decode(token, secret, algorithms=["HS256"])
        assert payload["sub"] == "test@example.com"
        assert payload["username"] == "testuser"

    def test_jwt_invalid_token(self):
        from jose import JWTError
        try:
            jwt.decode("invalid.token.here", "wrong-secret", algorithms=["HS256"])
            assert False, "Should have raised JWTError"
        except JWTError:
            pass


class TestAuthGuard:
    def test_no_token_redirects(self):
        pass

    def test_valid_token_decodes(self):
        secret = os.environ.get('SECRET_KEY', 'test-secret-key-for-testing')
        token = jwt.encode(
            {"sub": "test@example.com", "username": "testuser"},
            secret,
            algorithm="HS256",
        )
        from users import get_current_user
        from unittest.mock import patch, MagicMock

        with patch('users.get_db_connection') as mock_get_conn:
            mock_conn = MagicMock()
            mock_cursor = MagicMock()
            mock_cursor.fetchone.return_value = {"id": 1, "email": "test@example.com", "username": "testuser"}
            mock_conn.cursor.return_value = mock_cursor
            mock_get_conn.return_value = mock_conn

            request = MagicMock()
            request.headers = {"Authorization": f"Bearer {token}"}
            request.client.host = "127.0.0.1"

            result = get_current_user(request)
            assert result is not None
            assert result["username"] == "testuser"

    def test_expired_token_returns_none(self):
        secret = os.environ.get('SECRET_KEY', 'test-secret-key-for-testing')
        expired_payload = {
            "sub": "test@example.com",
            "username": "testuser",
            "exp": datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(minutes=1)
        }
        token = jwt.encode(expired_payload, secret, algorithm="HS256")

        from users import get_current_user
        from unittest.mock import MagicMock

        request = MagicMock()
        request.headers = {"Authorization": f"Bearer {token}"}
        request.client.host = "127.0.0.1"

        result = get_current_user(request)
        assert result is None
