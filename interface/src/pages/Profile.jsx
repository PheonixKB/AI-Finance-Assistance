import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain, User, Edit } from 'lucide-react';
import { auth, permissions, financeProfile } from '../apiService';

const Profile = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [editedUsername, setEditedUsername] = useState('');
  const [permissions, setPermissions] = useState({
    assets: true,
    liabilities: true,
    transactions: true,
    investments: true,
    epf: true,
    credit_score: true,
  });
  const [isSavingPermissions, setIsSavingPermissions] = useState(false);
  const [financeProfile, setFinanceProfile] = useState({
    salary: '',
    monthly_debt_payments: '',
    housing_cost: '',
    transportation_cost: '',
    food_cost: '',
    other_expenses: '',
    savings_goal: '',
    risk_tolerance: '',
    investment_experience: '',
  });
  const [isEditingFinanceProfile, setIsEditingFinanceProfile] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const navigate = useNavigate();

  const fetchFinanceProfile = async () => {
    try {
      const data = await financeProfile.get();
      setFinanceProfile(data);
    } catch (error) {
      console.error('Error fetching finance profile:', error);
      setMessage({ type: 'error', text: error.message });
    }
  };

  const fetchPermissions = async () => {
    try {
      const data = await permissions.get();
      setPermissions({
        assets: data.assets ?? true,
        liabilities: data.liabilities ?? true,
        transactions: data.transactions ?? true,
        investments: data.investments ?? true,
        epf: data.epf ?? true,
        credit_score: data.credit_score ?? data.creditScore ?? true,
      });
    } catch (error) {
      console.error('Error fetching permissions:', error);
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
        setEmail('');
        setEditedUsername('User');
        fetchFinanceProfile();
        fetchPermissions();
      }
    });
    return () => { cancelled = true; };
  }, [navigate]);

  const handleUpdateUsername = async () => {
    if (editedUsername.trim() === '') {
      setMessage({ type: 'error', text: 'Username cannot be empty.' });
      return;
    }
    if (editedUsername === username) {
      setIsEditingUsername(false);
      return;
    }

    try {
      const data = await auth.updateUser(editedUsername);
      setUsername(data.username);
      setMessage({ type: 'success', text: 'Username updated successfully!' });
      setIsEditingUsername(false);
    } catch (error) {
      console.error('Error updating username:', error);
      setMessage({ type: 'error', text: error.message });
    }
  };

  const handleFinanceProfileChange = (e) => {
    const { name, value } = e.target;
    setFinanceProfile((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleUpdateFinanceProfile = async () => {
    try {
      await financeProfile.update(financeProfile);
      setMessage({ type: 'success', text: 'Financial profile updated successfully!' });
      setIsEditingFinanceProfile(false);
    } catch (error) {
      console.error('Error updating financial profile:', error);
      setMessage({ type: 'error', text: error.message });
    }
  };

  const handlePermissionChange = async (permissionName) => {
    const newPermissions = {
      ...permissions,
      [permissionName]: !permissions[permissionName],
    };
    setPermissions(newPermissions);

    try {
      setIsSavingPermissions(true);
      await permissions.update(newPermissions);
    } catch (error) {
      console.error('Error updating permissions:', error);
      setPermissions({
        ...permissions,
        [permissionName]: !newPermissions[permissionName],
      });
      setMessage({ type: 'error', text: `Failed to update ${permissionName} permission.` });
    } finally {
      setIsSavingPermissions(false);
    }
  };

  const permissionLabels = {
    assets: 'Assets',
    liabilities: 'Liabilities',
    transactions: 'Transactions',
    investments: 'Investments',
    epf: 'EPF',
    credit_score: 'Credit Score',
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

      <div className="max-w-2xl w-full space-y-8 p-10 glass-effect rounded-xl shadow-lg z-10 mt-20">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-white">User Profile</h2>

        {message.text && (
          <div className={`p-3 rounded-md text-center ${message.type === 'success' ? 'bg-green-500' : 'bg-red-500'} text-white`}>
            {message.text}
          </div>
        )}

        <div className="flex flex-col items-center space-y-4">
          <User className="w-24 h-24 text-gray-400" />
          <div className="flex items-center space-x-2">
            {isEditingUsername ? (
              <input
                type="text"
                value={editedUsername}
                onChange={(e) => setEditedUsername(e.target.value)}
                onBlur={handleUpdateUsername}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleUpdateUsername();
                  }
                }}
                className="text-white text-xl font-semibold bg-white/10 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <span className="text-white text-xl font-semibold">{username}</span>
            )}
            {!isEditingUsername && (
              <button
                onClick={() => setIsEditingUsername(true)}
                className="p-1 rounded-md text-gray-400 hover:text-blue-500 hover:bg-white/10"
                title="Edit Username"
              >
                <Edit className="w-5 h-5" />
              </button>
            )}
          </div>
          <span className="text-gray-300 text-lg">{email}</span>
        </div>

        <div className="space-y-4">
          <h3 className="text-xl font-bold text-white">Financial Profile</h3>
          <div className="bg-white/10 p-4 rounded-lg">
            {isEditingFinanceProfile ? (
              <form onSubmit={(e) => { e.preventDefault(); handleUpdateFinanceProfile(); }} className="space-y-3">
                <div>
                  <label htmlFor="salary" className="text-white text-sm">Annual Salary</label>
                  <input
                    id="salary"
                    name="salary"
                    type="number"
                    step="0.01"
                    className="w-full bg-white/20 text-white rounded-md px-2 py-1 mt-1"
                    value={financeProfile.salary || ''}
                    onChange={handleFinanceProfileChange}
                  />
                </div>
                <div>
                  <label htmlFor="monthly_debt_payments" className="text-white text-sm">Monthly Debt Payments</label>
                  <input
                    id="monthly_debt_payments"
                    name="monthly_debt_payments"
                    type="number"
                    step="0.01"
                    className="w-full bg-white/20 text-white rounded-md px-2 py-1 mt-1"
                    value={financeProfile.monthly_debt_payments || ''}
                    onChange={handleFinanceProfileChange}
                  />
                </div>
                <div>
                  <label htmlFor="housing_cost" className="text-white text-sm">Monthly Housing Cost</label>
                  <input
                    id="housing_cost"
                    name="housing_cost"
                    type="number"
                    step="0.01"
                    className="w-full bg-white/20 text-white rounded-md px-2 py-1 mt-1"
                    value={financeProfile.housing_cost || ''}
                    onChange={handleFinanceProfileChange}
                  />
                </div>
                <div>
                  <label htmlFor="transportation_cost" className="text-white text-sm">Monthly Transportation Cost</label>
                  <input
                    id="transportation_cost"
                    name="transportation_cost"
                    type="number"
                    step="0.01"
                    className="w-full bg-white/20 text-white rounded-md px-2 py-1 mt-1"
                    value={financeProfile.transportation_cost || ''}
                    onChange={handleFinanceProfileChange}
                  />
                </div>
                <div>
                  <label htmlFor="food_cost" className="text-white text-sm">Monthly Food Cost</label>
                  <input
                    id="food_cost"
                    name="food_cost"
                    type="number"
                    step="0.01"
                    className="w-full bg-white/20 text-white rounded-md px-2 py-1 mt-1"
                    value={financeProfile.food_cost || ''}
                    onChange={handleFinanceProfileChange}
                  />
                </div>
                <div>
                  <label htmlFor="other_expenses" className="text-white text-sm">Other Monthly Expenses</label>
                  <input
                    id="other_expenses"
                    name="other_expenses"
                    type="number"
                    step="0.01"
                    className="w-full bg-white/20 text-white rounded-md px-2 py-1 mt-1"
                    value={financeProfile.other_expenses || ''}
                    onChange={handleFinanceProfileChange}
                  />
                </div>
                <div>
                  <label htmlFor="savings_goal" className="text-white text-sm">Savings Goal</label>
                  <input
                    id="savings_goal"
                    name="savings_goal"
                    type="number"
                    step="0.01"
                    className="w-full bg-white/20 text-white rounded-md px-2 py-1 mt-1"
                    value={financeProfile.savings_goal || ''}
                    onChange={handleFinanceProfileChange}
                  />
                </div>
                <div>
                  <label htmlFor="risk_tolerance" className="text-white text-sm">Risk Tolerance</label>
                  <select
                    id="risk_tolerance"
                    name="risk_tolerance"
                    className="w-full bg-white/20 text-white rounded-md px-2 py-1 mt-1"
                    value={financeProfile.risk_tolerance || ''}
                    onChange={handleFinanceProfileChange}
                  >
                    <option value="">Select Risk Tolerance</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="investment_experience" className="text-white text-sm">Investment Experience</label>
                  <select
                    id="investment_experience"
                    name="investment_experience"
                    className="w-full bg-white/20 text-white rounded-md px-2 py-1 mt-1"
                    value={financeProfile.investment_experience || ''}
                    onChange={handleFinanceProfileChange}
                  >
                    <option value="">Select Investment Experience</option>
                    <option value="none">None</option>
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="expert">Expert</option>
                  </select>
                </div>
                <div className="flex justify-end space-x-2 mt-4">
                  <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    Save
                  </button>
                  <button type="button" onClick={() => setIsEditingFinanceProfile(false)} className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700">
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-300">Annual Salary:</span>
                  <span className="text-white font-semibold">{financeProfile.salary ? `$${financeProfile.salary.toLocaleString()}` : 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Monthly Debt Payments:</span>
                  <span className="text-white font-semibold">{financeProfile.monthly_debt_payments ? `$${financeProfile.monthly_debt_payments.toLocaleString()}` : 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Monthly Housing Cost:</span>
                  <span className="text-white font-semibold">{financeProfile.housing_cost ? `$${financeProfile.housing_cost.toLocaleString()}` : 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Monthly Transportation Cost:</span>
                  <span className="text-white font-semibold">{financeProfile.transportation_cost ? `$${financeProfile.transportation_cost.toLocaleString()}` : 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Monthly Food Cost:</span>
                  <span className="text-white font-semibold">{financeProfile.food_cost ? `$${financeProfile.food_cost.toLocaleString()}` : 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Other Monthly Expenses:</span>
                  <span className="text-white font-semibold">{financeProfile.other_expenses ? `$${financeProfile.other_expenses.toLocaleString()}` : 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Savings Goal:</span>
                  <span className="text-white font-semibold">{financeProfile.savings_goal ? `$${financeProfile.savings_goal.toLocaleString()}` : 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Risk Tolerance:</span>
                  <span className="text-white font-semibold capitalize">{financeProfile.risk_tolerance || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Investment Experience:</span>
                  <span className="text-white font-semibold capitalize">{financeProfile.investment_experience || 'N/A'}</span>
                </div>
                <div className="text-right mt-4">
                  <button onClick={() => setIsEditingFinanceProfile(true)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    Edit Financial Profile
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-xl font-bold text-white">Data Permissions</h3>
          {Object.entries(permissions).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between bg-white/10 p-4 rounded-lg">
              <span className="text-white capitalize">{permissionLabels[key] || key}</span>
              <button
                onClick={() => handlePermissionChange(key)}
                disabled={isSavingPermissions}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${value ? 'bg-blue-600' : 'bg-gray-400'} ${isSavingPermissions ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <span className="sr-only">Enable {key}</span>
                <span
                  className={`transform transition ease-in-out duration-200 ${value ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 rounded-full bg-white`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Profile;
