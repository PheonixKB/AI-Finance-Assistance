// interface/src/pages/AllTransactions.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain, ArrowLeft } from 'lucide-react';
import { jwtDecode } from 'jwt-decode';

const AllTransactions = () => {
  const [username, setUsername] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [message, setMessage] = useState({ type: '', text: '' });
  const navigate = useNavigate();

  const fetchTransactions = async (token) => {
    try {
      const response = await fetch('http://localhost:8000/api/transactions', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to fetch transactions');
      const data = await response.json();
      setTransactions(data);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      setMessage({ type: 'error', text: error.message });
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        setUsername(decodedToken.username || 'User');
        fetchTransactions(token);
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
        <h2 className="mt-6 text-center text-3xl font-extrabold text-white">All Transactions for {username}</h2>
        
        {message.text && (
          <div className={`p-3 rounded-md text-center ${message.type === 'success' ? 'bg-green-500' : 'bg-red-500'} text-white`}>
            {message.text}
          </div>
        )}

        <div className="space-y-4">
          {transactions.map(tx => (
            <div key={tx.id} className="flex justify-between items-center mt-2">
              <div>
                <p className="text-white font-semibold">{tx.description} ({tx.date})</p>
                <p className="text-gray-300 text-sm">Amount: {tx.amount}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AllTransactions;
