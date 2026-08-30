"""
Tests for AI endpoint logic including rate limiting and mock fallback.
Run: pytest tests/test_ai.py -v
"""
import pytest
from unittest.mock import patch, MagicMock


class TestAIMockFallback:
    @patch('ai.get_current_user', return_value=None)
    @patch('ai.get_user_permissions', return_value={"assets": True, "liabilities": True, "transactions": True, "investments": True, "epf": True, "credit_score": True})
    @patch('ai.get_user_finance_data', return_value={"credit_score": 750})
    def test_ask_returns_mock_response_without_api_key(self, mock_finance, mock_perms, mock_user):
        from fastapi.testclient import TestClient
        from main import app

        client = TestClient(app)
        response = client.post('/api/v1/ask', json={"query": "What is my credit score?"})
        assert response.status_code == 200
        data = response.json()
        assert "answer" in data
        assert "insights" in data
        assert "MOCK RESPONSE" in data["answer"]


class TestRateLimiting:
    def test_free_limit_value(self):
        from ai import FREE_AI_LIMIT
        assert FREE_AI_LIMIT == 5

    def test_authenticated_limit_value(self):
        from ai import AUTHENTICATED_AI_LIMIT
        assert AUTHENTICATED_AI_LIMIT == 50

    def test_free_ai_requests_dict_exists(self):
        from ai import free_ai_requests
        assert isinstance(free_ai_requests, dict)
