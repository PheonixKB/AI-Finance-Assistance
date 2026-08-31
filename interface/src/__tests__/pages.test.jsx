import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('lucide-react', () => {
  const icons = [
    'Brain', 'ArrowLeft', 'Loader', 'Target', 'Calendar', 'CreditCard',
    'Bell', 'PieChart', 'FileText', 'BarChart3', 'TrendingUp', 'Wallet',
    'DollarSign', 'Sparkles', 'Shield', 'Zap', 'Send', 'Plus', 'Edit',
    'Trash2', 'AlertCircle', 'Menu', 'X', 'User', 'LogOut', 'MessageSquare',
  ];
  return Object.fromEntries(icons.map((name) => [name, () => React.createElement('span', { dataTestId: name })]));
});

const mockAuth = () => {
  vi.mock('../apiService', async (importOriginal) => {
    const actual = await importOriginal();
    return {
      ...actual,
      auth: {
        ...actual.auth,
        isAuthenticated: () => Promise.resolve(true),
      },
    };
  });
};

const setFetchMock = (data) => {
  global.fetch = vi.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve(data),
    })
  );
};

describe('Missing pages exist', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuth();
  });

  it('InvestmentInsights page renders without crashing', async () => {
    setFetchMock({
      insights: 'Test insights',
      risk_tolerance: 'medium',
      investment_experience: 'beginner',
    });
    const InvestmentInsights = (await import('../pages/InvestmentInsights')).default;
    const { container } = render(React.createElement(InvestmentInsights));
    await waitFor(() => {
      expect(container).toBeDefined();
    });
  });

  it('GoalTracking page renders without crashing', async () => {
    setFetchMock([]);
    const GoalTracking = (await import('../pages/GoalTracking')).default;
    const { container } = render(React.createElement(GoalTracking));
    await waitFor(() => {
      expect(container).toBeDefined();
    });
  });

  it('ExpenseOptimization page renders without crashing', async () => {
    setFetchMock({ categorized_expenses: [], salary: 5000 });
    const ExpenseOptimization = (await import('../pages/ExpenseOptimization')).default;
    const { container } = render(React.createElement(ExpenseOptimization));
    await waitFor(() => {
      expect(container).toBeDefined();
    });
  });

  it('BillManagement page renders without crashing', async () => {
    setFetchMock([]);
    const BillManagement = (await import('../pages/BillManagement')).default;
    const { container } = render(React.createElement(BillManagement));
    await waitFor(() => {
      expect(container).toBeDefined();
    });
  });

  it('WealthAnalytics page renders without crashing', async () => {
    setFetchMock([]);
    const WealthAnalytics = (await import('../pages/WealthAnalytics')).default;
    const { container } = render(React.createElement(WealthAnalytics));
    await waitFor(() => {
      expect(container).toBeDefined();
    });
  });
});
