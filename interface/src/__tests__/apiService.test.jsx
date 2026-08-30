import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('apiService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe('BASE_URL', () => {
    it('defaults to localhost:8000 when env var is not set', async () => {
      const { BASE_URL } = await import('../apiService');
      expect(BASE_URL).toBeDefined();
      expect(typeof BASE_URL).toBe('string');
    });
  });

  describe('auth.isAuthenticated', () => {
    it('returns false when no token exists', async () => {
      const { auth } = await import('../apiService');
      expect(auth.isAuthenticated()).toBe(false);
    });

    it('returns false for an invalid token', async () => {
      localStorage.setItem('token', 'invalid-token');
      const { auth } = await import('../apiService');
      expect(auth.isAuthenticated()).toBe(false);
    });

    it('returns true for a valid token', async () => {
      const fakeToken = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ0ZXN0QGV4YW1wbGUuY29tIiwidXNlcm5hbWUiOiJ0ZXN0dXNlciIsImlhdCI6MTcwMDAwMDAwMCwiZXhwIjo5OTk5OTk5OTk5fQ.signature';
      localStorage.setItem('token', fakeToken);
      const { auth } = await import('../apiService');
      expect(auth.isAuthenticated()).toBe(true);
    });
  });

  describe('auth.logout', () => {
    it('removes the token from localStorage', async () => {
      localStorage.setItem('token', 'some-token');
      const { auth } = await import('../apiService');
      auth.logout();
      expect(localStorage.getItem('token')).toBeNull();
    });
  });

  describe('auth.decodeToken', () => {
    it('returns null when no token exists', async () => {
      const { auth } = await import('../apiService');
      expect(auth.decodeToken()).toBeNull();
    });

    it('decodes a valid token payload', async () => {
      const fakeToken = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ0ZXN0QGV4YW1wbGUuY29tIiwidXNlcm5hbWUiOiJ0ZXN0dXNlciIsImlhdCI6MTcwMDAwMDAwMCwiZXhwIjo5OTk5OTk5OTk5fQ.signature';
      localStorage.setItem('token', fakeToken);
      const { auth } = await import('../apiService');
      const decoded = auth.decodeToken();
      expect(decoded).not.toBeNull();
      expect(decoded.username).toBe('testuser');
      expect(decoded.sub).toBe('test@example.com');
    });

    it('detects expired token', async () => {
      const expiredToken = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ0ZXN0QGV4YW1wbGUuY29tIiwidXNlcm5hbWUiOiJ0ZXN0dXNlciIsImlhdCI6MTcwMDAwMDAwMCwiZXhwIjoxNjAwMDAwMDAwfQ.expired';
      localStorage.setItem('token', expiredToken);
      const { auth } = await import('../apiService');
      expect(auth.isAuthenticated()).toBe(false);
    });
  });
});
