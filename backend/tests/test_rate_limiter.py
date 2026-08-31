"""
Tests for rate_limiter module.
Run: pytest tests/test_rate_limiter.py -v
"""
import pytest
from unittest.mock import patch, MagicMock


class TestRateLimiter:
    @patch('rate_limiter.get_redis_client')
    def test_allows_requests_under_limit(self, mock_get_client):
        from rate_limiter import check_rate_limit

        mock_pipe = MagicMock()
        mock_pipe.zadd.return_value = None
        mock_pipe.zremrangebyscore.return_value = None
        mock_pipe.zcard.return_value = 1
        mock_pipe.expire.return_value = None
        mock_pipe.execute.return_value = [None, None, 1, None]

        mock_client = MagicMock()
        mock_client.pipeline.return_value = mock_pipe
        mock_get_client.return_value = mock_client

        assert check_rate_limit("test-key", 5, 60) is True
        mock_pipe.zadd.assert_called_once()
        mock_pipe.zcard.assert_called_once()

    @patch('rate_limiter.get_redis_client')
    def test_blocks_requests_over_limit(self, mock_get_client):
        from rate_limiter import check_rate_limit

        mock_pipe = MagicMock()
        mock_pipe.zadd.return_value = None
        mock_pipe.zremrangebyscore.return_value = None
        mock_pipe.zcard.return_value = 5
        mock_pipe.expire.return_value = None
        mock_pipe.execute.return_value = [None, None, 5, None]

        mock_client = MagicMock()
        mock_client.pipeline.return_value = mock_pipe
        mock_get_client.return_value = mock_client

        assert check_rate_limit("test-key", 5, 60) is False

    @patch('rate_limiter.get_redis_client')
    def test_fallback_when_redis_fails(self, mock_get_client):
        from rate_limiter import check_rate_limit

        mock_get_client.side_effect = RuntimeError("Redis connection failed")

        assert check_rate_limit("fallback-key", 3, 60) is True
        assert check_rate_limit("fallback-key", 3, 60) is True
        assert check_rate_limit("fallback-key", 3, 60) is True
        assert check_rate_limit("fallback-key", 3, 60) is False
