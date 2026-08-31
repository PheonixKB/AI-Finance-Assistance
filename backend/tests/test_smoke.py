"""
Smoke tests: verify app initialization and route registration.
Run: pytest tests/test_smoke.py -v
"""
import pytest


class TestAppStructure:
    def test_app_import(self):
        from main import app
        assert app is not None
        assert app.title == "AI Finance Assistant"

    def test_routes_registered(self):
        from fastapi.testclient import TestClient
        from main import app

        client = TestClient(app)
        response = client.get('/openapi.json')
        assert response.status_code == 200
        paths = response.json().get('paths', {})
        expected_routes = [
            '/api/v1/register',
            '/api/v1/login',
            '/api/v1/me',
            '/api/v1/ask',
            '/api/v1/chat/create_session',
            '/api/v1/chat/add_message',
            '/api/v1/permissions/',
            '/api/v1/upload/transactions',
            '/api/v1/upload/investments',
            '/api/v1/investments',
            '/api/v1/accounts',
            '/api/v1/transactions',
            '/api/v1/goals',
            '/api/v1/finance_profile',
            '/api/v1/summary_finance',
            '/api/v1/budget-summary',
            '/api/v1/investment-insights',
            '/api/v1/stats',
            '/api/v1/testimonials',
        ]
        for route in expected_routes:
            assert route in paths, f"Route {route} not found in OpenAPI paths"


class TestModels:
    def test_create_chat_session_model(self):
        from models.models import CreateChatSession
        model = CreateChatSession(title="Test Chat")
        assert model.title == "Test Chat"

    def test_add_message_model(self):
        from models.models import AddMessage
        model = AddMessage(session_id=1, sender="user", text="Hello")
        assert model.sender == "user"
        assert model.text == "Hello"

    def test_update_chat_title_model(self):
        from models.models import UpdateChatTitle
        model = UpdateChatTitle(title="Updated Title")
        assert model.title == "Updated Title"

    def test_permissions_model(self):
        from permissions import PermissionsModel
        model = PermissionsModel(
            assets=True,
            liabilities=False,
            transactions=True,
            investments=True,
            epf=True,
            credit_score=False,
        )
        assert model.assets is True
        assert model.liabilities is False
        assert model.credit_score is False

    def test_query_model(self):
        from ai import QueryModel
        model = QueryModel(query="What's my spending?")
        assert model.query == "What's my spending?"

    def test_user_create_model(self):
        from users import UserCreate
        model = UserCreate(email="test@test.com", username="testuser", password="Password123!")
        assert model.email == "test@test.com"
        assert model.username == "testuser"


class TestConfig:
    def test_secret_key_default(self):
        from users import SECRET_KEY, ALGORITHM
        assert SECRET_KEY is not None
        assert ALGORITHM == "HS256"

    def test_rate_limits_defined(self):
        from ai import FREE_AI_LIMIT, AUTHENTICATED_AI_LIMIT
        assert FREE_AI_LIMIT == 5
        assert AUTHENTICATED_AI_LIMIT == 50

    def test_db_config(self):
        from db import dbconfig
        assert "host" in dbconfig
        assert "user" in dbconfig


class TestCorrelationId:
    def test_middleware_generates_correlation_id(self):
        from fastapi.testclient import TestClient
        from main import app

        client = TestClient(app)
        response = client.get('/api/v1/stats')
        assert 'X-Correlation-ID' in response.headers
        assert len(response.headers['X-Correlation-ID']) > 0

    def test_middleware_honors_existing_correlation_id(self):
        from fastapi.testclient import TestClient
        from main import app

        client = TestClient(app)
        existing_id = 'test-correlation-123'
        response = client.get('/api/v1/stats', headers={'X-Correlation-ID': existing_id})
        assert response.headers['X-Correlation-ID'] == existing_id
