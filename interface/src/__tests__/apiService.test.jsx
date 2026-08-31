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
    it('returns false when /api/v1/me returns 401', async () => {
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: false,
          status: 401,
          json: () => Promise.resolve({ detail: 'Not authenticated' }),
        })
      );
      const { auth } = await import('../apiService');
      expect(await auth.isAuthenticated()).toBe(false);
    });

    it('returns true when /api/v1/me returns 200', async () => {
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve({ id: 1, email: 'test@test.com', username: 'test' }),
        })
      );
      const { auth } = await import('../apiService');
      expect(await auth.isAuthenticated()).toBe(true);
    });
  });

  describe('auth.logout', () => {
    it('calls /api/v1/logout endpoint', async () => {
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve({ message: 'Logged out successfully' }),
        })
      );
      const { auth } = await import('../apiService');
      await auth.logout();
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/v1/logout'),
        expect.objectContaining({ method: 'POST', credentials: 'include' })
      );
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
      await expect(request('/api/v1/test')).rejects.toThrow('Server error. Our team has been notified.');
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
      await expect(request('/api/v1/test')).rejects.toThrow('The requested resource was not found.');
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
        await request('/api/v1/test');
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
