// interface/src/pages/FinanceData.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain, ArrowLeft, Plus, Edit, Trash2 } from 'lucide-react';
import { jwtDecode } from 'jwt-decode';

const FinanceData = () => {
  const [username, setUsername] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });
  const navigate = useNavigate();

  // Summary Finance States
  const [creditScore, setCreditScore] = useState('');
  const [epfBalance, setEpfBalance] = useState('');
  const [isEditingSummary, setIsEditingSummary] = useState(false);

  // Investments States
  const [investments, setInvestments] = useState([]);
  const [selectedInvestmentFile, setSelectedInvestmentFile] = useState(null);

  // Accounts States
  const [accounts, setAccounts] = useState([]);
  const [newAccount, setNewAccount] = useState({
    account_name: '',
    bank_name: '',

    account_type: '',
    balance: '',
  });
  const [editingAccountId, setEditingAccountId] = useState(null);

  const [transactions, setTransactions] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);

  // --- API Calls ---
  const fetchSummaryFinance = async (token) => {
    try {
      const response = await fetch('http://localhost:8000/api/summary_finance', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to fetch summary finance');
      const data = await response.json();
      setCreditScore(data.credit_score || '');
      setEpfBalance(data.epf_balance || '');
    } catch (error) {
      console.error("Error fetching summary finance:", error);
      setMessage({ type: 'error', text: error.message });
    }
  };

  const updateSummaryFinance = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const response = await fetch('http://localhost:8000/api/summary_finance', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ credit_score: creditScore, epf_balance: epfBalance }),
      });
      if (!response.ok) throw new Error('Failed to update summary finance');
      setMessage({ type: 'success', text: 'Summary finance updated!' });
      setIsEditingSummary(false);
    } catch (error) {
      console.error("Error updating summary finance:", error);
      setMessage({ type: 'error', text: error.message });
    }
  };

  const fetchInvestments = async (token) => {
    try {
      const response = await fetch('http://localhost:8000/api/investments', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to fetch investments');
      const data = await response.json();
      setInvestments(data);
    } catch (error) {
      console.error("Error fetching investments:", error);
      setMessage({ type: 'error', text: error.message });
    }
  };

  const handleInvestmentFileChange = (event) => {
    setSelectedInvestmentFile(event.target.files[0]);
  };

  const handleInvestmentUpload = async () => {
    if (!selectedInvestmentFile) {
      setMessage({ type: 'error', text: 'Please select a file to upload.' });
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) return;

    const formData = new FormData();
    formData.append('file', selectedInvestmentFile);

    try {
      const response = await fetch('http://localhost:8000/api/upload/investments', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to upload investments');
      }

      setMessage({ type: 'success', text: 'Investments uploaded successfully!' });
      setSelectedInvestmentFile(null); // Clear selected file
      fetchInvestments(token); // Re-fetch investments to update the list
    } catch (error) {
      console.error("Error uploading investments:", error);
      setMessage({ type: 'error', text: error.message });
    }
  };

  const fetchAccounts = async (token) => {
    try {
      const response = await fetch('http://localhost:8000/api/accounts', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to fetch accounts');
      const data = await response.json();
      setAccounts(data);
    } catch (error) {
      console.error("Error fetching accounts:", error);
      setMessage({ type: 'error', text: error.message });
    }
  };

  const createAccount = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const response = await fetch('http://localhost:8000/api/accounts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(newAccount),
      });
      if (!response.ok) throw new Error('Failed to create account');
      setMessage({ type: 'success', text: 'Account created!' });
      setNewAccount({ account_name: '', bank_name: '', account_number: '', account_type: '', balance: '' });
      fetchAccounts(token);
    } catch (error) {
      console.error("Error creating account:", error);
      setMessage({ type: 'error', text: error.message });
    }
  };

  const updateAccount = async (id) => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const accountToUpdate = accounts.find(acc => acc.id === id);
      const response = await fetch(`http://localhost:8000/api/accounts/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(accountToUpdate),
      });
      if (!response.ok) throw new Error('Failed to update account');
      setMessage({ type: 'success', text: 'Account updated!' });
      setEditingAccountId(null);
      fetchAccounts(token);
    } catch (error) {
      console.error("Error updating account:", error);
      setMessage({ type: 'error', text: error.message });
    }
  };

  const deleteAccount = async (id) => {
    const token = localStorage.getItem('token');
    if (!token) return;
    if (!window.confirm("Are you sure you want to delete this account?")) return;
    try {
      const response = await fetch(`http://localhost:8000/api/accounts/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to delete account');
      setMessage({ type: 'success', text: 'Account deleted!' });
      fetchAccounts(token);
    } catch (error) {
      console.error("Error deleting account:", error);
      setMessage({ type: 'error', text: error.message });
    }
  };

  const fetchTransactions = async (accountId, token) => {
    try {
      const response = await fetch(`http://localhost:8000/api/accounts/${accountId}/transactions`, {
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

  const deleteTransaction = async (id, accountId) => {
    const token = localStorage.getItem('token');
    if (!token) return;
    if (!window.confirm("Are you sure you want to delete this transaction?")) return;
    try {
      const response = await fetch(`http://localhost:8000/api/transactions/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to delete transaction');
      setMessage({ type: 'success', text: 'Transaction deleted!' });
      fetchTransactions(accountId, token);
    } catch (error) {
      console.error("Error deleting transaction:", error);
      setMessage({ type: 'error', text: error.message });
    }
  };

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setMessage({ type: 'error', text: 'Please select a file to upload.' });
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) return;

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await fetch('http://localhost:8000/api/upload/transactions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to upload transactions');
      }

      setMessage({ type: 'success', text: 'Transactions uploaded successfully!' });
      setSelectedFile(null); // Clear selected file
      // Optionally re-fetch transactions to update the list
      // fetchTransactions(selectedAccountId, token);
    } catch (error) {
      console.error("Error uploading transactions:", error);
      setMessage({ type: 'error', text: error.message });
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        setUsername(decodedToken.username || 'User');
        fetchSummaryFinance(token);
        fetchInvestments(token);
        fetchAccounts(token);
      } catch (error) {
        console.error("Error decoding token:", error);
        localStorage.removeItem('token');
        navigate('/signin');
      }
    }
   else {
      navigate('/signin');
    }
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gradient-bg py-12 px-4 sm:px-6 lg:px-8">
      <header className="fixed w-full top-0 z-50 glass-effect py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <button onClick={() => navigate(-1)} className="text-gray-700 hover:text-blue-600 transition-colors duration-200 font-medium">
            Back
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
        <h2 className="mt-6 text-center text-3xl font-extrabold text-white">Finance Data for {username}</h2>
        
        {message.text && (
          <div className={`p-3 rounded-md text-center ${message.type === 'success' ? 'bg-green-500' : 'bg-red-500'} text-white`}>
            {message.text}
          </div>
        )}

        {/* Summary Finance */}
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-white">Summary Finance</h3>
          <div className="bg-white/10 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-white">Credit Score:</span>
              {isEditingSummary ? (
                <input
                  type="number"
                  value={creditScore}
                  onChange={(e) => setCreditScore(e.target.value)}
                  className="bg-white/20 text-white rounded-md px-2 py-1"
                />
              ) : (
                <span className="text-white font-semibold">{creditScore || 'N/A'}</span>
              )}
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-white">EPF Balance:</span>
              {isEditingSummary ? (
                <input
                  type="number"
                  value={epfBalance}
                  onChange={(e) => setEpfBalance(e.target.value)}
                  className="bg-white/20 text-white rounded-md px-2 py-1"
                />
              ) : (
                <span className="text-white font-semibold">{epfBalance || 'N/A'}</span>
              )}
            </div>
            <div className="mt-4 text-right">
              {isEditingSummary ? (
                <button onClick={updateSummaryFinance} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Save
                </button>
              ) : (
                <button onClick={() => setIsEditingSummary(true)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Edit
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Investments */}
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-white">Investments</h3>
          {investments.slice(0, 10).map((inv) => (
            <div key={inv.id} className="bg-white/10 p-4 rounded-lg flex justify-between items-center">
              <div>
                <p className="text-white font-semibold">{inv.name} ({inv.investment_type})</p>
                <p className="text-gray-300 text-sm">Quantity: {inv.quantity}, Purchase: {inv.purchase_price}, Current: {inv.current_price || 'N/A'}</p>
              </div>
              <div>
                <button onClick={() => deleteInvestment(inv.id)} className="text-red-400 hover:text-red-300"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
          {investments.length > 10 && (
            <div className="text-center mt-4">
              <button onClick={() => navigate('/all-investments')} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Read More
              </button>
            </div>
          )}
          {/* File Upload Section for Investments */}
          <div className="bg-white/10 p-4 rounded-lg mt-4">
            <h4 className="text-white font-semibold mb-2">Upload Investments (Excel/PDF)</h4>
            <input
              type="file"
              accept=".xlsx, .xls, .pdf"
              onChange={handleInvestmentFileChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            <button onClick={handleInvestmentUpload} className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Upload Investments
            </button>
          </div>
        </div>

        {/* Accounts */}
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-white">Accounts</h3>
          {accounts.map((acc) => (
            <div key={acc.id} className="bg-white/10 p-4 rounded-lg flex justify-between items-center">
              <div>
                <p className="text-white font-semibold">{acc.account_name} ({acc.bank_name})</p>
                <p className="text-gray-300 text-sm">Balance: {acc.balance}</p>
              </div>
              <div>
                <button onClick={() => setEditingAccountId(acc.id)} className="text-blue-400 hover:text-blue-300 mr-2"><Edit className="w-4 h-4" /></button>
                <button onClick={() => deleteAccount(acc.id)} className="text-red-400 hover:text-red-300"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
          {editingAccountId && (
            <div className="bg-white/10 p-4 rounded-lg mt-4">
              {/* Edit Account Form */}
              <h4 className="text-white font-semibold mb-2">Edit Account</h4>
              <input type="text" placeholder="Account Name" value={accounts.find(acc => acc.id === editingAccountId)?.account_name || ''} onChange={(e) => setAccounts(accounts.map(acc => acc.id === editingAccountId ? { ...acc, account_name: e.target.value } : acc))} className="bg-gray-700 text-white rounded-md px-2 py-1 mb-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <input type="text" placeholder="Bank Name" value={accounts.find(acc => acc.id === editingAccountId)?.bank_name || ''} onChange={(e) => setAccounts(accounts.map(acc => acc.id === editingAccountId ? { ...acc, bank_name: e.target.value } : acc))} className="bg-gray-700 text-white rounded-md px-2 py-1 mb-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500" />


              <input type="text" placeholder="Account Type" value={accounts.find(acc => acc.id === editingAccountId)?.account_type || ''} onChange={(e) => setAccounts(accounts.map(acc => acc.id === editingAccountId ? { ...acc, account_type: e.target.value } : acc))} className="bg-gray-700 text-white rounded-md px-2 py-1 mb-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <input type="number" placeholder="Balance" value={accounts.find(acc => acc.id === editingAccountId)?.balance || ''} onChange={(e) => setAccounts(accounts.map(acc => acc.id === editingAccountId ? { ...acc, balance: parseFloat(e.target.value) } : acc))} className="bg-gray-700 text-white rounded-md px-2 py-1 mb-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <button onClick={() => updateAccount(editingAccountId)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 mr-2">Save</button>
              <button onClick={() => setEditingAccountId(null)} className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700">Cancel</button>
            </div>
          )}
          <div className="bg-white/10 p-4 rounded-lg">
            <h4 className="text-white font-semibold mb-2">Add New Account</h4>
            <input type="text" placeholder="Account Name" value={newAccount.account_name} onChange={(e) => setNewAccount({ ...newAccount, account_name: e.target.value })} className="bg-gray-700 text-white rounded-md px-2 py-1 mb-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <input type="text" placeholder="Bank Name" value={newAccount.bank_name} onChange={(e) => setNewAccount({ ...newAccount, bank_name: e.target.value })} className="bg-gray-700 text-white rounded-md px-2 py-1 mb-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500" />


            <select value={newAccount.account_type} onChange={(e) => setNewAccount({ ...newAccount, account_type: e.target.value })} className="bg-gray-700 text-white rounded-md px-2 py-1 mb-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Select Account Type</option>
              <option value="saving">Saving</option>
              <option value="current">Current</option>
            </select>
            <input type="number" placeholder="Balance" value={newAccount.balance} onChange={(e) => setNewAccount({ ...newAccount, balance: parseFloat(e.target.value) })} className="bg-gray-700 text-white rounded-md px-2 py-1 mb-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <button onClick={createAccount} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Add Account</button>
          </div>
        </div>

        {/* Transactions */}
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-white">Transactions</h3>
          {accounts.length > 0 ? (
            <div className="bg-white/10 p-4 rounded-lg">
              <h4 className="text-white font-semibold mb-2">Select Account for Transactions</h4>
              <select
                onChange={(e) => fetchTransactions(e.target.value, localStorage.getItem('token'))}
                className="w-full bg-gray-700 text-white rounded-md px-2 py-1 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="" className="bg-gray-700 text-white">-- Select an Account --</option>
                {accounts.map(acc => (
                  <option key={acc.id} value={acc.id} className="bg-gray-700 text-white">{acc.account_name} (...{acc.account_number ? acc.account_number.slice(-4) : ''})</option>
                ))}
              </select>

              {transactions.slice(0, 10).map(tx => (
                <div key={tx.id} className="flex justify-between items-center mt-2">
                  <div>
                    <p className="text-white font-semibold">{tx.description} ({tx.date})</p>
                    <p className="text-gray-300 text-sm">Amount: {tx.amount}</p>
                  </div>
                  <div>
                    <button onClick={() => deleteTransaction(tx.id, tx.account_id)} className="text-red-400 hover:text-red-300"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              ))}
              {transactions.length > 10 && (
                <div className="text-center mt-4">
                  <button onClick={() => navigate('/all-transactions')} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    Read More
                  </button>
                </div>
              )}
              {/* File Upload Section */}
              <div className="bg-white/10 p-4 rounded-lg mt-4">
                <h4 className="text-white font-semibold mb-2">Upload Transactions (Excel/PDF)</h4>
                <input
                  type="file"
                  accept=".xlsx, .xls, .pdf"
                  onChange={handleFileChange}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                <button onClick={handleUpload} className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Upload Transactions
                </button>
              </div>
            </div>
          ) : (
            <div className="text-gray-400 text-sm">No accounts available to manage transactions.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FinanceData;