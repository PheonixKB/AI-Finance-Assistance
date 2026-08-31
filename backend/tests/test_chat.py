"""
Tests for chat session logic.
Run: pytest tests/test_chat.py -v
"""
import pytest
from unittest.mock import patch, MagicMock


class TestChatSessionModel:
    def test_create_session_model(self):
        from models.models import CreateChatSession
        model = CreateChatSession(title="Test Chat")
        assert model.title == "Test Chat"

    def test_add_message_model(self):
        from models.models import AddMessage
        model = AddMessage(session_id=1, sender="user", text="Hello AI")
        assert model.session_id == 1
        assert model.sender == "user"
        assert model.text == "Hello AI"

    def test_update_title_model(self):
        from models.models import UpdateChatTitle
        model = UpdateChatTitle(title="Updated Title")
        assert model.title == "Updated Title"


class TestChatRoutes:
    @patch('routes.chat_routes.get_current_user')
    @patch('routes.chat_routes.get_db_connection')
    def test_create_session_returns_id_and_title(self, mock_get_conn, mock_get_user):
        mock_conn = MagicMock()
        mock_cursor = MagicMock()
        mock_cursor.lastrowid = 42
        mock_conn.cursor.return_value = mock_cursor
        mock_get_conn.return_value = mock_conn
        mock_get_user.return_value = {"id": 1, "email": "test@test.com", "username": "test"}

        from fastapi.testclient import TestClient
        from main import app

        client = TestClient(app)
        response = client.post(
            '/api/v1/chat/create_session',
            json={"title": "New Chat"},
            headers={"Authorization": "Bearer fake-token"},
        )
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == 42
        assert data["title"] == "New Chat"

    @patch('routes.chat_routes.get_current_user')
    @patch('routes.chat_routes.get_db_connection')
    def test_get_session_messages_returns_list(self, mock_get_conn, mock_get_user):
        mock_conn = MagicMock()
        mock_cursor = MagicMock()
        mock_cursor.fetchall.return_value = [
            {"sender": "user", "text": "Hello", "created_at": "2024-01-01T00:00:00"},
            {"sender": "ai", "text": "Hi there!", "created_at": "2024-01-01T00:01:00"},
        ]
        mock_cursor.fetchone.side_effect = [
            {"id": 1},
            None,
        ]
        mock_conn.cursor.return_value = mock_cursor
        mock_get_conn.return_value = mock_conn
        mock_get_user.return_value = {"id": 1, "email": "test@test.com", "username": "test"}

        from fastapi.testclient import TestClient
        from main import app

        client = TestClient(app)
        response = client.get('/api/v1/chat/messages/1')
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 2
        assert data[0]["sender"] == "user"
        assert data[1]["sender"] == "ai"

    @patch('routes.chat_routes.get_current_user')
    @patch('routes.chat_routes.get_db_connection')
    def test_get_session_messages_denies_other_user(self, mock_get_conn, mock_get_user):
        mock_conn = MagicMock()
        mock_cursor = MagicMock()
        mock_cursor.fetchone.return_value = None
        mock_conn.cursor.return_value = mock_cursor
        mock_get_conn.return_value = mock_conn
        mock_get_user.return_value = {"id": 1, "email": "test@test.com", "username": "test"}

        from fastapi.testclient import TestClient
        from main import app

        client = TestClient(app)
        response = client.get('/api/v1/chat/messages/1')
        assert response.status_code == 404

    @patch('routes.chat_routes.get_current_user')
    @patch('routes.chat_routes.get_db_connection')
    def test_add_message_denies_other_user_session(self, mock_get_conn, mock_get_user):
        mock_conn = MagicMock()
        mock_cursor = MagicMock()
        mock_cursor.fetchone.return_value = None
        mock_conn.cursor.return_value = mock_cursor
        mock_get_conn.return_value = mock_conn
        mock_get_user.return_value = {"id": 1, "email": "test@test.com", "username": "test"}

        from fastapi.testclient import TestClient
        from main import app

        client = TestClient(app)
        response = client.post(
            '/api/v1/chat/add_message',
            json={"session_id": 1, "sender": "user", "text": "hello"},
            headers={"Authorization": "Bearer fake-token"},
        )
        assert response.status_code == 404

    @patch('routes.chat_routes.get_current_user')
    @patch('routes.chat_routes.get_db_connection')
    def test_get_user_sessions_returns_own_sessions(self, mock_get_conn, mock_get_user):
        mock_conn = MagicMock()
        mock_cursor = MagicMock()
        mock_cursor.fetchall.return_value = [
            {"id": 1, "title": "Chat 1", "created_at": "2024-01-01T00:00:00"},
            {"id": 2, "title": "Chat 2", "created_at": "2024-01-02T00:00:00"},
        ]
        mock_conn.cursor.return_value = mock_cursor
        mock_get_conn.return_value = mock_conn
        mock_get_user.return_value = {"id": 1, "email": "test@test.com", "username": "test"}

        from fastapi.testclient import TestClient
        from main import app

        client = TestClient(app)
        response = client.get('/api/v1/chat/sessions', headers={"Authorization": "Bearer fake-token"})
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 2
