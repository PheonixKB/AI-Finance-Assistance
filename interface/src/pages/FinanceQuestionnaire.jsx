import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain } from 'lucide-react';
import { financeProfile, auth } from '../apiService';

const FinanceQuestionnaire = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
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
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: (name === 'salary' || name === 'monthly_debt_payments' || name === 'housing_cost' || name === 'transportation_cost' || name === 'food_cost' || name === 'other_expenses' || name === 'savings_goal')
        ? (value === '' ? null : parseFloat(value))
        : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    const isAuth = await auth.isAuthenticated();
    if (!isAuth) {
      setMessage({ type: 'error', text: 'Authentication required. Please log in again.' });
      navigate('/signin');
      return;
    }

    try {
      await financeProfile.create(formData);
      setMessage({ type: 'success', text: 'Financial profile saved successfully!' });
      navigate('/');
    } catch (error) {
      console.error('Error saving financial profile:', error);
      setMessage({ type: 'error', text: error.message });
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gradient-bg py-12 px-4 sm:px-6 lg:px-8">
      <header className="fixed w-full top-0 z-50 glass-effect py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">FinanceAI</h1>
              <p className="text-xs text-gray-600">Smart Financial Assistant</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-md w-full space-y-8 p-10 glass-effect rounded-xl shadow-lg z-10 mt-20">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
          Tell Us About Your Finances
        </h2>
        <p className="mt-2 text-center text-sm text-gray-200">
          This information helps our AI provide personalized advice.
        </p>

        {message.text && (
          <div className={`p-3 rounded-md text-center ${message.type === 'success' ? 'bg-green-500' : 'bg-red-500'} text-white`}>
            {message.text}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="salary" className="sr-only">Annual Salary</label>
            <input
              id="salary"
              name="salary"
              type="number"
              step="0.01"
              required
              className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
              placeholder="Annual Salary"
              value={formData.salary}
              onChange={handleChange}
            />
          </div>
          <div>
            <label htmlFor="monthly_debt_payments" className="sr-only">Monthly Debt Payments</label>
            <input
              id="monthly_debt_payments"
              name="monthly_debt_payments"
              type="number"
              step="0.01"
              className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
              placeholder="Monthly Debt Payments"
              value={formData.monthly_debt_payments}
              onChange={handleChange}
            />
          </div>
          <div>
            <label htmlFor="housing_cost" className="sr-only">Monthly Housing Cost</label>
            <input
              id="housing_cost"
              name="housing_cost"
              type="number"
              step="0.01"
              className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
              placeholder="Monthly Housing Cost"
              value={formData.housing_cost}
              onChange={handleChange}
            />
          </div>
          <div>
            <label htmlFor="transportation_cost" className="sr-only">Monthly Transportation Cost</label>
            <input
              id="transportation_cost"
              name="transportation_cost"
              type="number"
              step="0.01"
              className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
              placeholder="Monthly Transportation Cost"
              value={formData.transportation_cost}
              onChange={handleChange}
            />
          </div>
          <div>
            <label htmlFor="food_cost" className="sr-only">Monthly Food Cost</label>
            <input
              id="food_cost"
              name="food_cost"
              type="number"
              step="0.01"
              className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
              placeholder="Monthly Food Cost"
              value={formData.food_cost}
              onChange={handleChange}
            />
          </div>
          <div>
            <label htmlFor="other_expenses" className="sr-only">Other Monthly Expenses</label>
            <input
              id="other_expenses"
              name="other_expenses"
              type="number"
              step="0.01"
              className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
              placeholder="Other Monthly Expenses"
              value={formData.other_expenses}
              onChange={handleChange}
            />
          </div>
          <div>
            <label htmlFor="savings_goal" className="sr-only">Savings Goal</label>
            <input
              id="savings_goal"
              name="savings_goal"
              type="number"
              step="0.01"
              className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
              placeholder="Savings Goal"
              value={formData.savings_goal}
              onChange={handleChange}
            />
          </div>
          <div>
            <label htmlFor="risk_tolerance" className="sr-only">Risk Tolerance</label>
            <select
              id="risk_tolerance"
              name="risk_tolerance"
              className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
              value={formData.risk_tolerance}
              onChange={handleChange}
            >
              <option value="">Select Risk Tolerance</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          <div>
            <label htmlFor="investment_experience" className="sr-only">Investment Experience</label>
            <select
              id="investment_experience"
              name="investment_experience"
              className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
              value={formData.investment_experience}
              onChange={handleChange}
            >
              <option value="">Select Investment Experience</option>
              <option value="none">None</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="expert">Expert</option>
            </select>
          </div>
          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Save Financial Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FinanceQuestionnaire;
