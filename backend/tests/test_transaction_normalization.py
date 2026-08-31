"""
Tests for transaction amount normalization edge cases.
Run: pytest tests/test_transaction_normalization.py -v
"""
import pytest
from unittest.mock import patch, MagicMock


class TestTransactionNormalization:
    @patch('routes.content_routes.get_db_connection')
    @patch('routes.content_routes.get_current_user')
    def test_amount_from_debit_credit_fields(self, mock_get_user, mock_get_conn):
        from fastapi.testclient import TestClient
        from main import app

        mock_get_user.return_value = {"id": 1, "email": "test@test.com", "username": "test"}
        mock_conn = MagicMock()
        mock_cursor = MagicMock()
        mock_cursor.fetchone.return_value = {"id": 1, "user_id": 1}
        mock_conn.cursor.return_value = mock_cursor
        mock_get_conn.return_value = mock_conn

        client = TestClient(app)
        response = client.put(
            '/api/v1/transactions/1',
            json={"Debit ($)": 100, "Credit ($)": 200},
            headers={"Authorization": "Bearer fake-token"},
        )
        assert response.status_code == 200
        assert response.json()["updated_fields"] == ["amount"]

    @patch('routes.content_routes.get_db_connection')
    @patch('routes.content_routes.get_current_user')
    def test_amount_zero_values_preserved(self, mock_get_user, mock_get_conn):
        from fastapi.testclient import TestClient
        from main import app

        mock_get_user.return_value = {"id": 1, "email": "test@test.com", "username": "test"}
        mock_conn = MagicMock()
        mock_cursor = MagicMock()
        mock_cursor.fetchone.return_value = {"id": 1, "user_id": 1}
        mock_conn.cursor.return_value = mock_cursor
        mock_get_conn.return_value = mock_conn

        client = TestClient(app)
        response = client.put(
            '/api/v1/transactions/1',
            json={"Debit ($)": 0, "Credit ($)": 0},
            headers={"Authorization": "Bearer fake-token"},
        )
        assert response.status_code == 200
        assert response.json()["updated_fields"] == ["amount"]

    @patch('routes.content_routes.get_db_connection')
    @patch('routes.content_routes.get_current_user')
    def test_amount_with_single_debit(self, mock_get_user, mock_get_conn):
        from fastapi.testclient import TestClient
        from main import app

        mock_get_user.return_value = {"id": 1, "email": "test@test.com", "username": "test"}
        mock_conn = MagicMock()
        mock_cursor = MagicMock()
        mock_cursor.fetchone.return_value = {"id": 1, "user_id": 1}
        mock_conn.cursor.return_value = mock_cursor
        mock_get_conn.return_value = mock_conn

        client = TestClient(app)
        response = client.put(
            '/api/v1/transactions/1',
            json={"Debit ($)": 50},
            headers={"Authorization": "Bearer fake-token"},
        )
        assert response.status_code == 200
        assert response.json()["updated_fields"] == ["amount"]
