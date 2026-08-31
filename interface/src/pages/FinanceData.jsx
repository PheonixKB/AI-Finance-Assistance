import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain, ArrowLeft, Plus, Edit, Trash2 } from 'lucide-react';
import { auth, summaryFinance, investments, accounts, upload, content, goals, transactions } from '../apiService';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS } from 'chart.js/auto';

const FinanceData = () => {
  const [username, setUsername] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });
  const navigate = useNavigate();

  const [creditScore, setCreditScore] = useState('');
  const [epfBalance, setEpfBalance] = useState('');
  const [isEditingSummary, setIsEditingSummary] = useState(false);

  const [investmentList, setInvestmentList] = useState([]);
  const [selectedInvestmentFile, setSelectedInvestmentFile] = useState(null);

  const [accountList, setAccountList] = useState([]);
  const [newAccount, setNewAccount] = useState({
    account_name: '',
    bank_name: '',
    account_number: '',
    account_type: '',
    balance: '',
  });
  const [editingAccountId, setEditingAccountId] = useState(null);

  const [transactionList, setTransactionList] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedAccountId, setSelectedAccountId] = useState('');

  const [budgetSummary, setBudgetSummary] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [investmentInsights, setInvestmentInsights] = useState(null);

  const [goals, setGoals] = useState([]);
  const [newGoal, setNewGoal] = useState({
    goal_name: '',
    target_amount: '',
    deadline: '',
  });
  const [editingGoalId, setEditingGoalId] = useState(null);

  // --- API Calls ---

  const fetchSummaryFinance = async () => {
    try {
      const data = await summaryFinance.get();
      setCreditScore(data.credit_score || '');
      setEpfBalance(data.epf_balance || '');
    } catch (error) {
      console.error('Error fetching summary finance:', error);
      setMessage({ type: 'error', text: error.message });
    }
  };

  const updateSummaryFinance = async () => {
    try {
      await summaryFinance.update({ credit_score: creditScore, epf_balance: epfBalance });
      setMessage({ type: 'success', text: 'Summary finance updated!' });
      setIsEditingSummary(false);
    } catch (error) {
      console.error('Error updating summary finance:', error);
      setMessage({ type: 'error', text: error.message });
    }
  };

  const fetchInvestments = async () => {
    try {
      const data = await investments.getAll();
      setInvestmentList(data);
    } catch (error) {
      console.error('Error fetching investments:', error);
      setMessage({ type: 'error', text: error.message });
    }
  };

  const deleteInvestment = async (id) => {
    if (!window.confirm('Are you sure you want to delete this investment?')) return;
    try {
      await investments.delete(id);
      setMessage({ type: 'success', text: 'Investment deleted!' });
      fetchInvestments();
    } catch (error) {
      console.error('Error deleting investment:', error);
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

    try {
      const data = await upload.investments(selectedInvestmentFile);
      setMessage({ type: 'success', text: data.message || 'Investments uploaded successfully!' });
      setSelectedInvestmentFile(null);
      fetchInvestments();
    } catch (error) {
      console.error('Error uploading investments:', error);
      setMessage({ type: 'error', text: error.message });
    }
  };

  const fetchAccounts = async () => {
    try {
      const data = await accounts.getAll();
      setAccountList(data);
    } catch (error) {
      console.error('Error fetching accounts:', error);
      setMessage({ type: 'error', text: error.message });
    }
  };

  const fetchBudgetSummary = async () => {
    try {
      const data = await content.getBudgetSummary();
      setBudgetSummary(data);

      if (data.categorized_expenses && data.categorized_expenses.length > 0) {
        const labels = data.categorized_expenses.map((exp) => exp.category);
        const totals = data.categorized_expenses.map((exp) => exp.total_spent);
        setChartData({
          labels,
          datasets: [
            {
              data: totals,
              backgroundColor: [
                '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40',
              ],
              hoverBackgroundColor: [
                '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40',
              ],
            },
          ],
        });
      }
    } catch (error) {
      console.error('Error fetching budget summary:', error);
      setMessage({ type: 'error', text: error.message });
    }
  };

  const fetchInvestmentInsights = async () => {
    try {
      const data = await content.getInvestmentInsights();
      setInvestmentInsights(data);
    } catch (error) {
      console.error('Error fetching investment insights:', error);
      setMessage({ type: 'error', text: error.message });
    }
  };

  const createAccount = async () => {
    try {
      await accounts.create(newAccount);
      setMessage({ type: 'success', text: 'Account created!' });
      setNewAccount({ account_name: '', bank_name: '', account_type: '', balance: '' });
      fetchAccounts();
    } catch (error) {
      console.error('Error creating account:', error);
      setMessage({ type: 'error', text: error.message });
    }
  };

  const updateAccount = async (id) => {
    try {
      const accountToUpdate = accountList.find((acc) => acc.id === id);
      await accounts.update(id, accountToUpdate);
      setMessage({ type: 'success', text: 'Account updated!' });
      setEditingAccountId(null);
      fetchAccounts();
    } catch (error) {
      console.error('Error updating account:', error);
      setMessage({ type: 'error', text: error.message });
    }
  };

  const deleteAccount = async (id) => {
    if (!window.confirm('Are you sure you want to delete this account?')) return;
    try {
      await accounts.delete(id);
      setMessage({ type: 'success', text: 'Account deleted!' });
      fetchAccounts();
    } catch (error) {
      console.error('Error deleting account:', error);
      setMessage({ type: 'error', text: error.message });
    }
  };

  const fetchTransactions = async (accountId) => {
    if (!accountId) return;
    setSelectedAccountId(accountId);
    try {
      const data = await accounts.getTransactions(accountId);
      setTransactionList(data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setMessage({ type: 'error', text: error.message });
    }
  };

  const deleteTransaction = async (id, accountId) => {
    if (!window.confirm('Are you sure you want to delete this transaction?')) return;
    try {
      await transactions.delete(id);
      setMessage({ type: 'success', text: 'Transaction deleted!' });
      fetchTransactions(accountId);
    } catch (error) {
      console.error('Error deleting transaction:', error);
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

    try {
      const data = await upload.transactions(selectedFile);
      setMessage({ type: 'success', text: data.message || 'Transactions uploaded successfully!' });
      setSelectedFile(null);
      fetchTransactions(selectedAccountId);
    } catch (error) {
      console.error('Error uploading transactions:', error);
      setMessage({ type: 'error', text: error.message });
    }
  };

  const fetchGoals = async () => {
    try {
      const data = await goals.getAll();
      setGoals(data);
    } catch (error) {
      console.error('Error fetching goals:', error);
    }
  };

  const createGoal = async () => {
    if (!newGoal.goal_name || !newGoal.target_amount) {
      setMessage({ type: 'error', text: 'Goal name and target amount are required.' });
      return;
    }
    try {
      await goals.create({
        goal_name: newGoal.goal_name,
        target_amount: parseFloat(newGoal.target_amount),
        deadline: newGoal.deadline || null,
      });
      setMessage({ type: 'success', text: 'Goal created!' });
      setNewGoal({ goal_name: '', target_amount: '', deadline: '' });
      fetchGoals();
    } catch (error) {
      console.error('Error creating goal:', error);
      setMessage({ type: 'error', text: error.message });
    }
  };

  const updateGoal = async (id) => {
    try {
      await goals.update(id, {
        goal_name: goals.find((g) => g.id === id)?.goal_name || '',
        target_amount: parseFloat(goals.find((g) => g.id === id)?.target_amount || 0),
        current_progress: parseFloat(goals.find((g) => g.id === id)?.current_progress || 0),
        deadline: goals.find((g) => g.id === id)?.deadline || null,
      });
      setMessage({ type: 'success', text: 'Goal updated!' });
      setEditingGoalId(null);
      fetchGoals();
    } catch (error) {
      console.error('Error updating goal:', error);
      setMessage({ type: 'error', text: error.message });
    }
  };

  const deleteGoal = async (id) => {
    if (!window.confirm('Are you sure you want to delete this goal?')) return;
    try {
      await goals.delete(id);
      setMessage({ type: 'success', text: 'Goal deleted!' });
      fetchGoals();
    } catch (error) {
      console.error('Error deleting goal:', error);
      setMessage({ type: 'error', text: error.message });
    }
  };

  useEffect(() => {
    let cancelled = false;
    auth.isAuthenticated().then((ok) => {
      if (!cancelled && !ok) {
        navigate('/signin');
        return;
      }
      if (!cancelled) {
        setUsername('User');
        fetchSummaryFinance();
        fetchInvestments();
        fetchAccounts();
        fetchBudgetSummary();
        fetchInvestmentInsights();
        fetchGoals();
      }
    });
    return () => { cancelled = true; };
  }, [navigate]);

  const deleteTransactionViaAPI = async (id, accountId) => {
    if (!window.confirm('Are you sure you want to delete this transaction?')) return;
    try {
       await transactions.delete(id);
      setMessage({ type: 'success', text: 'Transaction deleted!' });
      fetchTransactions(accountId);
    } catch (error) {
      console.error('Error deleting transaction:', error);
      setMessage({ type: 'error', text: error.message });
    }
  };

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
          <div className="w-20"></div>
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

        {/* Goals */}
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-white">Financial Goals</h3>
          {goals.map((goal) => (
            <div key={goal.id} className="bg-white/10 p-4 rounded-lg flex justify-between items-center">
              <div>
                <p className="text-white font-semibold">{goal.goal_name}</p>
                <p className="text-gray-300 text-sm">
                  Target: ${goal.target_amount} | Progress: ${goal.current_progress || 0}
                  {goal.deadline && ` | Deadline: ${new Date(goal.deadline).toLocaleDateString()}`}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <button onClick={() => navigate(`/goal-progress/${goal.id}`)} className="text-blue-400 hover:text-blue-300 text-xs px-2 py-1">
                  View Progress
                </button>
                <button onClick={() => deleteGoal(goal.id)} className="text-red-400 hover:text-red-300"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
          <div className="bg-white/10 p-4 rounded-lg">
            <h4 className="text-white font-semibold mb-2">Add New Goal</h4>
            <input
              type="text"
              placeholder="Goal Name"
              value={newGoal.goal_name}
              onChange={(e) => setNewGoal({ ...newGoal, goal_name: e.target.value })}
              className="bg-gray-700 text-white rounded-md px-2 py-1 mb-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="number"
              placeholder="Target Amount"
              value={newGoal.target_amount}
              onChange={(e) => setNewGoal({ ...newGoal, target_amount: e.target.value })}
              className="bg-gray-700 text-white rounded-md px-2 py-1 mb-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="date"
              placeholder="Deadline"
              value={newGoal.deadline}
              onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })}
              className="bg-gray-700 text-white rounded-md px-2 py-1 mb-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button onClick={createGoal} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Add Goal
            </button>
          </div>
        </div>

        {/* Smart Budgeting */}
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-white">Smart Budgeting</h3>
          {budgetSummary && budgetSummary.categorized_expenses && budgetSummary.categorized_expenses.length > 0 ? (
            <div className="bg-white/10 p-4 rounded-lg">
              <h4 className="text-white font-semibold mb-2">Monthly Spending by Category</h4>
              {chartData && <Pie data={chartData} />}
              <h4 className="text-white font-semibold mt-4 mb-2">AI Budget Suggestions</h4>
              <p className="text-gray-300 text-sm whitespace-pre-wrap">{budgetSummary.suggestions}</p>
              <div className="text-center mt-4">
                <button onClick={() => navigate('/smart-budgeting')} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  View Smart Budgeting
                </button>
              </div>
            </div>
          ) : (
            <div className="text-gray-400 text-sm">Upload transactions and set your salary to get smart budgeting insights.</div>
          )}
        </div>

        {/* Investments */}
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-white">Investments</h3>
          {investmentList.slice(0, 10).map((inv) => (
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
          {investmentList.length > 10 && (
            <div className="text-center mt-4">
              <button onClick={() => navigate('/all-investments')} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Read More
              </button>
            </div>
          )}
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

        {/* Investment Insights */}
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-white">Investment Insights</h3>
          {investmentInsights && investmentInsights.insights ? (
            <div className="bg-white/10 p-4 rounded-lg">
              <h4 className="text-white font-semibold mb-2">AI-Powered Recommendations</h4>
              <p className="text-gray-300 text-sm whitespace-pre-wrap">{investmentInsights.insights}</p>
              <div className="text-center mt-4">
                <button onClick={() => navigate('/investment-insights')} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  View Full Insights
                </button>
              </div>
            </div>
          ) : (
            <div className="text-gray-400 text-sm">Complete your finance profile and upload investments to get personalized insights.</div>
          )}
        </div>

        {/* Accounts */}
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-white">Accounts</h3>
          {accountList.map((acc) => (
            <div key={acc.id} className="bg-white/10 p-4 rounded-lg flex justify-between items-center">
              <div>
                <p className="text-white font-semibold">{acc.account_name} ({acc.bank_name})</p>
                <p className="text-gray-300 text-sm">
                  {acc.account_number ? `****${acc.account_number.slice(-4)}` : 'No account number'}
                </p>
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
              <h4 className="text-white font-semibold mb-2">Edit Account</h4>
              <input
                type="text"
                placeholder="Account Name"
                value={accountList.find((acc) => acc.id === editingAccountId)?.account_name || ''}
                onChange={(e) => setAccountList(accountList.map((acc) => acc.id === editingAccountId ? { ...acc, account_name: e.target.value } : acc))}
                className="bg-gray-700 text-white rounded-md px-2 py-1 mb-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                placeholder="Bank Name"
                value={accountList.find((acc) => acc.id === editingAccountId)?.bank_name || ''}
                onChange={(e) => setAccountList(accountList.map((acc) => acc.id === editingAccountId ? { ...acc, bank_name: e.target.value } : acc))}
                className="bg-gray-700 text-white rounded-md px-2 py-1 mb-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                placeholder="Account Number"
                value={accountList.find((acc) => acc.id === editingAccountId)?.account_number || ''}
                onChange={(e) => setAccountList(accountList.map((acc) => acc.id === editingAccountId ? { ...acc, account_number: e.target.value } : acc))}
                className="bg-gray-700 text-white rounded-md px-2 py-1 mb-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                placeholder="Account Type"
                value={accountList.find((acc) => acc.id === editingAccountId)?.account_type || ''}
                onChange={(e) => setAccountList(accountList.map((acc) => acc.id === editingAccountId ? { ...acc, account_type: e.target.value } : acc))}
                className="bg-gray-700 text-white rounded-md px-2 py-1 mb-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="number"
                placeholder="Balance"
                value={accountList.find((acc) => acc.id === editingAccountId)?.balance || ''}
                onChange={(e) => setAccountList(accountList.map((acc) => acc.id === editingAccountId ? { ...acc, balance: parseFloat(e.target.value) } : acc))}
                className="bg-gray-700 text-white rounded-md px-2 py-1 mb-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button onClick={() => updateAccount(editingAccountId)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 mr-2">Save</button>
              <button onClick={() => setEditingAccountId(null)} className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700">Cancel</button>
            </div>
          )}
          <div className="bg-white/10 p-4 rounded-lg">
            <h4 className="text-white font-semibold mb-2">Add New Account</h4>
            <input
              type="text"
              placeholder="Account Name"
              value={newAccount.account_name}
              onChange={(e) => setNewAccount({ ...newAccount, account_name: e.target.value })}
              className="bg-gray-700 text-white rounded-md px-2 py-1 mb-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
              <input
                type="text"
                placeholder="Bank Name"
                value={newAccount.bank_name}
                onChange={(e) => setNewAccount({ ...newAccount, bank_name: e.target.value })}
                className="bg-gray-700 text-white rounded-md px-2 py-1 mb-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                placeholder="Account Number"
                value={newAccount.account_number}
                onChange={(e) => setNewAccount({ ...newAccount, account_number: e.target.value })}
                className="bg-gray-700 text-white rounded-md px-2 py-1 mb-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <select
                value={newAccount.account_type}
                onChange={(e) => setNewAccount({ ...newAccount, account_type: e.target.value })}
                className="bg-gray-700 text-white rounded-md px-2 py-1 mb-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
              <option value="">Select Account Type</option>
              <option value="saving">Saving</option>
              <option value="current">Current</option>
            </select>
            <input
              type="number"
              placeholder="Balance"
              value={newAccount.balance}
              onChange={(e) => setNewAccount({ ...newAccount, balance: parseFloat(e.target.value) })}
              className="bg-gray-700 text-white rounded-md px-2 py-1 mb-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button onClick={createAccount} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Add Account</button>
          </div>
        </div>

        {/* Transactions */}
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-white">Transactions</h3>
          {accountList.length > 0 ? (
            <div className="bg-white/10 p-4 rounded-lg">
              <h4 className="text-white font-semibold mb-2">Select Account for Transactions</h4>
              <select
                onChange={(e) => fetchTransactions(e.target.value)}
                className="w-full bg-gray-700 text-white rounded-md px-2 py-1 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="" className="bg-gray-700 text-white">-- Select an Account --</option>
                {accountList.map((acc) => (
                  <option key={acc.id} value={acc.id} className="bg-gray-700 text-white">
                    {acc.account_name} (...{acc.account_number ? acc.account_number.slice(-4) : ''})
                  </option>
                ))}
              </select>

              {transactionList.slice(0, 10).map((tx) => (
                <div key={tx.id} className="flex justify-between items-center mt-2">
                  <div>
                    <p className="text-white font-semibold">{tx.description} ({tx.date})</p>
                    <p className="text-gray-300 text-sm">Amount: {tx.amount}</p>
                  </div>
                  <div>
                    <button onClick={() => deleteTransactionViaAPI(tx.id, selectedAccountId)} className="text-red-400 hover:text-red-300"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              ))}
              {transactionList.length > 10 && (
                <div className="text-center mt-4">
                  <button onClick={() => navigate('/all-transactions')} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    Read More
                  </button>
                </div>
              )}
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
