// interface/src/pages/SmartBudgeting.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain, ArrowLeft } from 'lucide-react';
import { jwtDecode } from 'jwt-decode';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS } from 'chart.js/auto';

const SmartBudgeting = () => {
  const [username, setUsername] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });
  const navigate = useNavigate();

  const [budgetSummary, setBudgetSummary] = useState(null);
  const [chartData, setChartData] = useState(null);

  const fetchBudgetSummary = async (token) => {
    try {
      const response = await fetch('http://localhost:8000/api/budget-summary', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to fetch budget summary');
      const data = await response.json();
      setBudgetSummary(data);

      if (data.categorized_expenses && data.categorized_expenses.length > 0) {
        const labels = data.categorized_expenses.map(exp => exp.category);
        const totals = data.categorized_expenses.map(exp => exp.total_spent);
        setChartData({
          labels: labels,
          datasets: [
            {
              data: totals,
              backgroundColor: [
                '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'
              ],
              hoverBackgroundColor: [
                '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'
              ],
            },
          ],
        });
      }
    } catch (error) {
      console.error("Error fetching budget summary:", error);
      setMessage({ type: 'error', text: error.message });
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        setUsername(decodedToken.username || 'User');
        fetchBudgetSummary(token);
      } catch (error) {
        console.error("Error decoding token:", error);
        localStorage.removeItem('token');
        navigate('/signin');
      }
    } else {
      navigate('/signin');
    }
  }, [navigate]);

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
          <div className="w-20"></div> {/* Spacer */}
        </div>
      </header>

      <div className="max-w-4xl w-full space-y-8 p-10 glass-effect rounded-xl shadow-lg z-10 mt-20">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-white">Smart Budgeting for {username}</h2>
        
        {message.text && (
          <div className={`p-3 rounded-md text-center ${message.type === 'success' ? 'bg-green-500' : 'bg-red-500'} text-white`}>
            {message.text}
          </div>
        )}

        {budgetSummary && budgetSummary.categorized_expenses && budgetSummary.categorized_expenses.length > 0 ? (
          <div className="bg-white/10 p-4 rounded-lg">
            <h4 className="text-white font-semibold mb-2">Monthly Spending by Category</h4>
            {chartData && <Pie data={chartData} />}
            <h4 className="text-white font-semibold mt-4 mb-2">AI Budget Suggestions</h4>
            <p className="text-gray-300 text-sm whitespace-pre-wrap">{budgetSummary.suggestions}</p>
          </div>
        ) : (
          <div className="text-gray-400 text-sm">Upload transactions and set your salary in the finance profile to get smart budgeting insights.</div>
        )}
      </div>
    </div>
  );
};

export default SmartBudgeting;
