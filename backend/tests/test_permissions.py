"""
Tests for permissions logic including the credit_score column name fix.
Run: pytest tests/test_permissions.py -v
"""
import pytest
from unittest.mock import patch, MagicMock


class TestPermissionsLogic:
    @patch('permissions.get_db_connection')
    def test_default_permissions_when_no_row(self, mock_get_conn, mock_cursor):
        mock_conn = MagicMock()
        mock_conn.cursor.return_value = mock_cursor
        mock_get_conn.return_value = mock_conn
        mock_cursor.fetchone.return_value = None

        from permissions import get_user_permissions
        result = get_user_permissions(999)

        assert result is not None
        assert result["assets"] is True
        assert result["liabilities"] is True
        assert result["transactions"] is True
        assert result["investments"] is True
        assert result["epf"] is True
        assert result["credit_score"] is True

    @patch('permissions.get_db_connection')
    def test_permissions_return_from_db(self, mock_get_conn, mock_cursor):
        mock_conn = MagicMock()
        mock_conn.cursor.return_value = mock_cursor
        mock_get_conn.return_value = mock_conn
        mock_cursor.fetchone.return_value = {
            "user_id": 1,
            "assets": True,
            "liabilities": False,
            "transactions": True,
            "investments": False,
            "epf": True,
            "credit_score": False,
        }

        from permissions import get_user_permissions
        result = get_user_permissions(1)

        assert result["assets"] is True
        assert result["liabilities"] is False
        assert result["credit_score"] is False

    def test_permissions_model_field_names(self):
        from permissions import PermissionsModel
        model = PermissionsModel(
            assets=True,
            liabilities=True,
            transactions=True,
            investments=True,
            epf=True,
            credit_score=True,
        )
        assert hasattr(model, 'credit_score')
        assert not hasattr(model, 'creditScore')
