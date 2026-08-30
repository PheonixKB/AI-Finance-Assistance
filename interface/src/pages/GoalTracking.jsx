import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain, ArrowLeft, Target, Calendar, Loader } from 'lucide-react';
import { auth, goals } from '../apiService';

const GoalTracking = () => {
  const [username, setUsername] = useState('');
  const [goalList, setGoalList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [progressInsight, setProgressInsight] = useState(null);
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

    const fetchGoals = async () => {
      setLoading(true);
      try {
        const data = await goals.getAll();
        setGoalList(data);
      } catch (err) {
        setError(err.message || 'Failed to load goals');
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchGoals();
  }, [navigate]);

  const handleGoalClick = async (goalId) => {
    try {
      const data = await goals.getProgress(goalId);
      setProgressInsight(data);
    } catch (err) {
      setError(err.message || 'Failed to load goal progress');
    }
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

      <div className="max-w-4xl w-full space-y-8 p-10 glass-effect rounded-xl shadow-lg z-10 mt-20">
        <h2 className="text-center text-3xl font-extrabold text-white">Goal Tracking for {username}</h2>

        {error && (
          <div className="p-3 rounded-md text-center bg-red-500/20 text-red-300">
            {error}
          </div>
        )}

        <div className="flex justify-between items-center">
          <h3 className="text-xl font-bold text-white">Your Financial Goals</h3>
          <button
            onClick={() => navigate('/finance-data')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 text-sm"
          >
            + Add Goal
          </button>
        </div>

        {goalList.length > 0 ? (
          <div className="space-y-4">
            {goalList.map((goal) => {
              const progress = goal.target_amount > 0
                ? Math.min(100, (goal.current_progress / goal.target_amount) * 100)
                : 0;
              return (
                <div
                  key={goal.id}
                  className={`bg-white/10 p-4 rounded-lg transition-all duration-200 ${
                    progressInsight?.goal?.id === goal.id ? 'ring-2 ring-blue-500' : ''
                  }`}
                  onClick={() => handleGoalClick(goal.id)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-white font-semibold flex items-center">
                      <Target className="w-4 h-4 mr-2 text-purple-400" />
                      {goal.goal_name}
                    </h4>
                    <span className="text-gray-300 text-sm">
                      ${goal.current_progress?.toLocaleString()} / ${goal.target_amount?.toLocaleString()}
                    </span>
                  </div>

                  <div className="w-full bg-gray-700 rounded-full h-3 mb-2">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>

                  {goal.deadline && (
                    <div className="flex items-center text-sm text-gray-400">
                      <Calendar className="w-4 h-4 mr-1" />
                      Deadline: {new Date(goal.deadline).toLocaleDateString()}
                    </div>
                  )}

                  {progressInsight?.goal?.id === goal.id && progressInsight.suggestions && (
                    <div className="mt-3 p-3 bg-white/5 rounded-lg">
                      <p className="text-gray-300 text-sm whitespace-pre-wrap">
                        {progressInsight.suggestions}
                      </p>
                      {progressInsight.months_needed !== null && progressInsight.months_needed !== undefined && (
                        <p className="text-blue-300 text-sm mt-2">
                          Estimated months to reach goal: {Math.ceil(progressInsight.months_needed)}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-gray-400 text-sm text-center py-8">
            No goals set yet. Add your first financial goal to start tracking progress!
          </div>
        )}
      </div>
    </div>
  );
};

export default GoalTracking;
