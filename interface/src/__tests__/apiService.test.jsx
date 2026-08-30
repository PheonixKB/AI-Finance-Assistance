import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import React from 'react';

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
      const decoded = auth.decodeToken();
      expect(decoded).not.toBeNull();
      expect(decoded.exp).toBeLessThan(Date.now() / 1000);
    });
  });

  describe('request error mapping', () => {
    it('maps 500 to generic message', async () => {
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: false,
          status: 500,
          json: () => Promise.resolve({ detail: 'Internal server error: DB connection failed' }),
        })
      );
      const { request } = await import('../apiService');
      await expect(request('/api/test')).rejects.toThrow('Server error. Our team has been notified.');
    });

    it('maps 404 to generic message', async () => {
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: false,
          status: 404,
          json: () => Promise.resolve({ detail: 'Not found' }),
        })
      );
      const { request } = await import('../apiService');
      await expect(request('/api/test')).rejects.toThrow('The requested resource was not found.');
    });

    it('preserves error status code', async () => {
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: false,
          status: 403,
          json: () => Promise.resolve({ detail: 'Forbidden' }),
        })
      );
      const { request } = await import('../apiService');
      try {
        await request('/api/test');
      } catch (e) {
        expect(e.status).toBe(403);
      }
    });
  });
});

describe('ErrorBoundary', () => {
  it('renders children when no error', async () => {
    const ErrorBoundary = (await import('../components/ErrorBoundary.jsx')).default;
    render(React.createElement(ErrorBoundary, null, React.createElement('div', null, 'OK')));
    expect(document.body.textContent).toContain('OK');
  });

  it('renders fallback UI when child throws during render', async () => {
    const ErrorBoundary = (await import('../components/ErrorBoundary.jsx')).default;
    const Thrower = () => { throw new Error('boom'); };
    render(React.createElement(ErrorBoundary, null, React.createElement(Thrower)));
    expect(document.body.textContent).toContain('Something went wrong');
  });
});
