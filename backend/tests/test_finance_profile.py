"""
Tests for finance profile validation.
Run: pytest tests/test_finance_profile.py -v
"""
import pytest
from unittest.mock import patch, MagicMock


class TestFinanceProfileValidation:
    @patch('routes.content_routes.get_db_connection')
    @patch('routes.content_routes.get_current_user')
    def test_create_finance_profile_requires_salary(self, mock_get_user, mock_get_conn):
        from fastapi.testclient import TestClient
        from main import app

        mock_get_user.return_value = {"id": 1, "email": "test@test.com", "username": "test"}
        mock_conn = MagicMock()
        mock_cursor = MagicMock()
        mock_cursor.fetchone.return_value = None
        mock_conn.cursor.return_value = mock_cursor
        mock_get_conn.return_value = mock_conn

        client = TestClient(app)
        response = client.post(
            '/api/v1/finance_profile',
            json={"savings_goal": 5000},
            headers={"Authorization": "Bearer fake-token"},
        )
        assert response.status_code == 422

    @patch('routes.content_routes.get_db_connection')
    @patch('routes.content_routes.get_current_user')
    def test_create_finance_profile_accepts_valid_data(self, mock_get_user, mock_get_conn):
        from fastapi.testclient import TestClient
        from main import app

        mock_get_user.return_value = {"id": 1, "email": "test@test.com", "username": "test"}
        mock_conn = MagicMock()
        mock_cursor = MagicMock()
        mock_cursor.fetchone.return_value = None
        mock_conn.cursor.return_value = mock_cursor
        mock_get_conn.return_value = mock_conn

        client = TestClient(app)
        response = client.post(
            '/api/v1/finance_profile',
            json={"salary": 5000, "savings_goal": 10000},
            headers={"Authorization": "Bearer fake-token"},
        )
        assert response.status_code == 200
