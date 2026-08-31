import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain, ArrowLeft, BarChart3, PieChart, FileText, Loader } from 'lucide-react';
import { auth, content } from '../apiService';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import { SkeletonCard, SkeletonText } from '../components/Skeleton';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const ExpenseOptimization = () => {
  const [username, setUsername] = useState('');
  const [budgetSummary, setBudgetSummary] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;
    auth.isAuthenticated().then((ok) => {
      if (!cancelled && !ok) {
        navigate('/signin');
        return;
      }
      if (!cancelled) {
        setUsername('User');
        const fetchBudget = async () => {
          setLoading(true);
          try {
            const data = await content.getBudgetSummary();
            if (!cancelled) {
              setBudgetSummary(data);
              if (data.categorized_expenses && data.categorized_expenses.length > 0) {
                const labels = data.categorized_expenses.map((exp) => exp.category);
                const totals = data.categorized_expenses.map((exp) => exp.total_spent);
                setChartData({
                  labels,
                  datasets: [
                    {
                      data: totals,
                      backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'],
                      hoverBackgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'],
                    },
                  ],
                });
              }
            }
          } catch (err) {
            if (!cancelled) setError(err.message || 'Failed to load budget data');
          } finally {
            if (!cancelled) setLoading(false);
          }
        };

        fetchBudget();
      }
    });
    return () => { cancelled = true; };
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gradient-bg py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full space-y-6">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonText lines={3} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gradient-bg py-12 px-4 sm:px-6 lg:px-8">
      <header className="fixed w-full top-0 z-50 glass-effect py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <button onClick={() => navigate(-1)} className="text-gray-700 hover:text-blue-600 transition-colors duration-200 font-medium">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">FinanceAI</h1>
              <p className="text-xs text-gray-600">Smart Financial Assistant</p>
            </div>
          </div>
          <div className="w-20"></div>
        </div>
      </header>

      <div className="max-w-4xl w-full space-y-8 p-10 glass-effect rounded-xl shadow-lg z-10 mt-20">
        <h2 className="text-center text-3xl font-extrabold text-white">Expense Optimization for {username}</h2>

        {error && (
          <div className="p-3 rounded-md text-center bg-red-500/20 text-red-300">
            {error}
          </div>
        )}

        {budgetSummary ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white/10 p-4 rounded-lg">
                <p className="text-gray-300 text-sm">Monthly Income</p>
                <p className="text-white text-2xl font-bold">
                  ${budgetSummary.salary?.toLocaleString() || '0'}
                </p>
              </div>
              <div className="bg-white/10 p-4 rounded-lg">
                <p className="text-gray-300 text-sm">Total Expenses</p>
                <p className="text-white text-2xl font-bold">
                  ${budgetSummary.categorized_expenses
                    ? budgetSummary.categorized_expenses.reduce((sum, exp) => sum + parseFloat(exp.total_spent || 0), 0).toLocaleString()
                    : '0'}
                </p>
              </div>
              <div className="bg-white/10 p-4 rounded-lg">
                <p className="text-gray-300 text-sm">AI Optimization</p>
                <p className="text-green-400 text-2xl font-bold">
                  Potential: <span className="text-white">12%+</span>
                </p>
              </div>
            </div>

            {chartData && (
              <div className="bg-white/10 p-4 rounded-lg">
                <h3 className="text-white font-semibold mb-3 flex items-center">
                  <PieChart className="w-5 h-5 mr-2 text-blue-400" />
                  Spending by Category
                </h3>
                <div className="h-64">
                  <Pie data={chartData} />
                </div>
              </div>
            )}

            {budgetSummary.suggestions && (
              <div className="bg-white/10 p-4 rounded-lg">
                <h3 className="text-white font-semibold mb-3 flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-purple-400" />
                  AI Budget Recommendations
                </h3>
                <div className="text-gray-300 text-sm whitespace-pre-wrap space-y-2">
                  {budgetSummary.suggestions.split('\n').map((line, i) => (
                    line.trim() && <p key={i}>{line}</p>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-gray-400 text-sm text-center py-8">
            Upload transactions and set your salary in the finance profile to get expense optimization insights.
          </div>
        )}

        <div className="flex justify-center">
          <button
            onClick={() => navigate('/finance-data')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 text-sm"
          >
            Go to Finance Data
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExpenseOptimization;
