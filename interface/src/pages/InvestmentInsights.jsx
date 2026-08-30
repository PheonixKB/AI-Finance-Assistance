import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain, ArrowLeft, TrendingUp, BarChart3, Loader } from 'lucide-react';
import { auth, content, investments } from '../apiService';

const InvestmentInsights = () => {
  const [username, setUsername] = useState('');
  const [insights, setInsights] = useState(null);
  const [userInvestments, setUserInvestments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/signin');
      return;
    }
    const decoded = auth.decodeToken();
    if (!decoded) {
      localStorage.removeItem('token');
      navigate('/signin');
      return;
    }
    setUsername(decoded.username || 'User');

    const fetchData = async () => {
      setLoading(true);
      try {
        const [insightsData, invData] = await Promise.all([
          content.getInvestmentInsights(),
          investments.getAll(),
        ]);
        setInsights(insightsData);
        setUserInvestments(invData);
      } catch (err) {
        setError(err.message || 'Failed to load data');
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gradient-bg py-12">
        <Loader className="w-8 h-8 text-white animate-spin" />
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
        <h2 className="text-center text-3xl font-extrabold text-white">Investment Insights for {username}</h2>

        {error && (
          <div className="p-3 rounded-md text-center bg-red-500/20 text-red-300">
            {error}
          </div>
        )}

        {insights ? (
          <div className="space-y-6">
            <div className="bg-white/10 p-4 rounded-lg">
              <h3 className="text-xl font-bold text-white mb-2 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-green-400" />
                AI-Powered Investment Recommendations
              </h3>
              <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-300">Risk Tolerance:</span>
                  <span className="text-white capitalize">{insights.risk_tolerance || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Experience:</span>
                  <span className="text-white capitalize">{insights.investment_experience || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Annual Salary:</span>
                  <span className="text-white">${insights.salary?.toLocaleString() || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Savings Goal:</span>
                  <span className="text-white">${insights.savings_goal?.toLocaleString() || 'N/A'}</span>
                </div>
              </div>
              <p className="text-gray-300 text-sm whitespace-pre-wrap mt-3">{insights.insights}</p>
            </div>

            <div className="bg-white/10 p-4 rounded-lg">
              <h3 className="text-xl font-bold text-white mb-2 flex items-center">
                <BarChart3 className="w-5 h-5 mr-2 text-blue-400" />
                Current Portfolio ({userInvestments.length} holdings)
              </h3>
              {userInvestments.length > 0 ? (
                <div className="space-y-2">
                  {userInvestments.map((inv) => (
                    <div key={inv.id} className="flex justify-between items-center p-2 bg-white/5 rounded-lg">
                      <div>
                        <p className="text-white font-semibold">{inv.name} ({inv.investment_type})</p>
                        <p className="text-gray-300 text-sm">
                          Qty: {inv.quantity} | Purchase: ${inv.purchase_price} | Current: ${inv.current_price || 'N/A'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-300 text-sm">No investments found. Upload your portfolio on the Finance Data page.</p>
              )}
            </div>
          </div>
        ) : (
          <div className="text-gray-400 text-sm text-center py-8">
            Complete your finance profile and upload investments to get personalized investment insights.
          </div>
        )}
      </div>
    </div>
  );
};

export default InvestmentInsights;
