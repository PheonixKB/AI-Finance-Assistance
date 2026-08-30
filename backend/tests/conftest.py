"""
Pytest configuration and shared fixtures for backend tests.
"""
import os
import sys

backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

os.environ.setdefault('SECRET_KEY', 'test-secret-key-for-testing')
os.environ.setdefault('OPENAI_API_KEY', '')
os.environ.setdefault('DB_USER', 'root')
os.environ.setdefault('DB_USERNAME', 'root')
os.environ.setdefault('DB_PASSWORD', 'test')
os.environ.setdefault('DB_NAME', 'finance_assistant')
os.environ.setdefault('DB_HOST', 'localhost')

import pytest
from unittest.mock import MagicMock


@pytest.fixture
def mock_cursor():
    cursor = MagicMock()
    cursor.fetchall.return_value = []
    cursor.fetchone.return_value = None
    return cursor


@pytest.fixture
def mock_conn(mock_cursor):
    conn = MagicMock()
    conn.cursor.return_value = mock_cursor
    return conn


@pytest.fixture
def test_user_token():
    from jose import jwt
    secret = os.environ.get('SECRET_KEY', 'test-secret-key-for-testing')
    token = jwt.encode(
        {"sub": "test@example.com", "username": "testuser"},
        secret,
        algorithm="HS256",
    )
    return token
