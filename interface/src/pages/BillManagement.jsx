import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain, ArrowLeft, CreditCard, Calendar, Bell, FileText, Loader } from 'lucide-react';
import { auth, transactions } from '../apiService';
import { SkeletonCard } from '../components/Skeleton';

const BillManagement = () => {
  const [username, setUsername] = useState('');
  const [billTransactions, setBillTransactions] = useState([]);
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

    const fetchBills = async () => {
      setLoading(true);
      try {
        const data = await transactions.getAll();
        const bills = data.filter(
          (tx) => tx.category && tx.category.toLowerCase().includes('bill')
        );
        setBillTransactions(bills);
      } catch (err) {
        setError(err.message || 'Failed to load bills');
      } finally {
        setLoading(false);
      }
    };

    fetchBills();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gradient-bg py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full space-y-6">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
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
        <h2 className="text-center text-3xl font-extrabold text-white">Bill Management for {username}</h2>

        {error && (
          <div className="p-3 rounded-md text-center bg-red-500/20 text-red-300">
            {error}
          </div>
        )}

        <div className="bg-white/10 p-6 rounded-lg text-center">
          <Bell className="w-12 h-12 text-yellow-400 mx-auto mb-3" />
          <h3 className="text-xl font-bold text-white mb-2">Automated Bill Reminders</h3>
          <p className="text-gray-300 text-sm">
            This feature is coming soon. It will automatically detect recurring bills from your
            transactions, send you due-date reminders, and suggest automated payment scheduling.
          </p>
        </div>

        <h3 className="text-xl font-bold text-white">Detected Bills</h3>
        {billTransactions.length > 0 ? (
          <div className="space-y-3">
            {billTransactions.map((tx, idx) => (
              <div key={idx} className="bg-white/10 p-3 rounded-lg flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <CreditCard className="w-5 h-5 text-blue-400" />
                  <div>
                    <p className="text-white font-semibold">{tx.description}</p>
                    <p className="text-gray-300 text-sm">
                      {new Date(tx.date).toLocaleDateString()} • Category: {tx.category || 'N/A'}
                    </p>
                  </div>
                </div>
                <span className="text-white font-bold">${tx.amount}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-gray-400 text-sm text-center py-6">
            No bill payments detected in your transaction history. Upload transactions with recurring
            expenses to enable bill detection.
          </div>
        )}

        <div className="flex justify-center">
          <button
            onClick={() => navigate('/finance-data')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 text-sm"
          >
            Upload Transactions
          </button>
        </div>
      </div>
    </div>
  );
};

export default BillManagement;
