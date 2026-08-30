import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain, ArrowLeft, PieChart, TrendingUp, Wallet, DollarSign, Loader } from 'lucide-react';
import { auth, accounts, investments, financeProfile, summaryFinance, content } from '../apiService';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Pie } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const WealthAnalytics = () => {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [accountsList, setAccountsList] = useState([]);
  const [investmentsList, setInvestmentsList] = useState([]);
  const [summary, setSummary] = useState(null);
  const [profile, setProfile] = useState(null);
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
        const [accData, invData, summaryData, profileData] = await Promise.allSettled([
          accounts.getAll(),
          investments.getAll(),
          summaryFinance.get(),
          financeProfile.get(),
        ]);

        if (accData.status === 'fulfilled') setAccountsList(accData.value || []);
        if (invData.status === 'fulfilled') setInvestmentsList(invData.value || []);
        if (summaryData.status === 'fulfilled') setSummary(summaryData.value || {});
        if (profileData.status === 'fulfilled') setProfile(profileData.value || {});
      } catch (err) {
        setError(err.message || 'Failed to load wealth data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const totalAccountBalance = accountsList.reduce(
    (sum, acc) => sum + parseFloat(acc.balance || 0),
    0
  );

  const totalInvestmentValue = investmentsList.reduce(
    (sum, inv) => sum + (parseFloat(inv.current_price || 0) * parseFloat(inv.quantity || 1)),
    0
  );

  const totalWealth = totalAccountBalance + totalInvestmentValue;

  const investmentChartData = {
    labels: investmentsList.map((inv) => inv.name),
    datasets: [
      {
        data: investmentsList.map((inv) =>
          parseFloat(inv.current_price || 0) * parseFloat(inv.quantity || 1)
        ),
        backgroundColor: ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF7', '#06B6D4'],
        hoverBackgroundColor: ['#4338CA', '#059669', '#D97706', '#DC2626', '#7C3AED', '#02B6D5'],
      },
    ],
  };

  const accountChartData = {
    labels: accountsList.map((acc) => acc.account_name || acc.bank_name || 'Account'),
    datasets: [
      {
        data: accountsList.map((acc) => parseFloat(acc.balance || 0)),
        backgroundColor: ['#3B82F6', '#8B5CF7', '#10B981', '#F59E0B'],
      },
    ],
  };

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

      <div className="max-w-5xl w-full space-y-8 p-10 glass-effect rounded-xl shadow-lg z-10 mt-20">
        <h2 className="text-center text-3xl font-extrabold text-white">Wealth Analytics for {username}</h2>

        {error && (
          <div className="p-3 rounded-md text-center bg-red-500/20 text-red-300">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white/10 p-4 rounded-lg text-center">
            <DollarSign className="w-6 h-6 text-green-400 mx-auto mb-1" />
            <p className="text-gray-300 text-sm">Total Net Worth</p>
            <p className="text-white text-2xl font-bold">${totalWealth.toLocaleString()}</p>
          </div>
          <div className="bg-white/10 p-4 rounded-lg text-center">
            <Wallet className="w-6 h-6 text-blue-400 mx-auto mb-1" />
            <p className="text-gray-300 text-sm">Bank Accounts</p>
            <p className="text-white text-2xl font-bold">${totalAccountBalance.toLocaleString()}</p>
          </div>
          <div className="bg-white/10 p-4 rounded-lg text-center">
            <TrendingUp className="w-6 h-6 text-purple-400 mx-auto mb-1" />
            <p className="text-gray-300 text-sm">Investments</p>
            <p className="text-white text-2xl font-bold">${totalInvestmentValue.toLocaleString()}</p>
          </div>
          <div className="bg-white/10 p-4 rounded-lg text-center">
            <PieChart className="w-6 h-6 text-yellow-400 mx-auto mb-1" />
            <p className="text-gray-300 text-sm">Credit Score</p>
            <p className="text-white text-2xl font-bold">{summary?.credit_score || 'N/A'}</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {accountsList.length > 0 && (
            <div className="bg-white/10 p-4 rounded-lg">
              <h3 className="text-white font-semibold mb-3">Account Breakdown</h3>
              <div className="h-48">
                <Pie data={accountChartData} />
              </div>
            </div>
          )}

          {investmentsList.length > 0 && (
            <div className="bg-white/10 p-4 rounded-lg">
              <h3 className="text-white font-semibold mb-3">Investment Portfolio</h3>
              <div className="h-48">
                <Pie data={investmentChartData} />
              </div>
            </div>
          )}
        </div>

        <div className="bg-white/10 p-4 rounded-lg">
          <h3 className="text-white font-semibold mb-3 flex items-center">
            <Brain className="w-5 h-5 mr-2 text-blue-400" />
            AI Wealth Insights
          </h3>
          <p className="text-gray-300 text-sm">
            Based on your current portfolio of {investmentsList.length} holdings across{' '}
            {accountsList.length} accounts, your net worth stands at ${totalWealth.toLocaleString()}.
          </p>
          {profile?.risk_tolerance && (
            <p className="text-gray-300 text-sm mt-2">
              With a <span className="text-white capitalize">{profile.risk_tolerance}</span> risk tolerance,
              consider diversifying your investment mix to optimize long-term returns.
            </p>
          )}
        </div>

        <div className="flex justify-center space-x-4">
          <button
            onClick={() => navigate('/finance-data')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 text-sm"
          >
            Manage Finance Data
          </button>
          <button
            onClick={() => navigate('/investment-insights')}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all duration-200 text-sm"
          >
            Investment Insights
          </button>
        </div>
      </div>
    </div>
  );
};

export default WealthAnalytics;
