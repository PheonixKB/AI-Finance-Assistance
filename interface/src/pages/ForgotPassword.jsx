import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Brain, Mail, ArrowLeft } from 'lucide-react';
import { auth } from '../apiService';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });
    setLoading(true);

    try {
      await auth.forgotPassword(email);
      setMessage({ type: 'success', text: 'If an account with that email exists, a password reset link has been sent.' });
      setEmail('');
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to send reset email' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gradient-bg py-12 px-4 sm:px-6 lg:px-8">
      <header className="fixed w-full top-0 z-50 glass-effect py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <span className="text-white text-xl font-bold">AI Finance Assistant</span>
          </Link>
        </div>
      </header>

      <div className="max-w-md w-full space-y-8 mt-20">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-white">Forgot Password?</h2>
          <p className="mt-2 text-gray-400">
            Enter your email and we'll send you a reset link
          </p>
        </div>

        {message.text && (
          <div className={`p-4 rounded-md ${message.type === 'error' ? 'bg-red-600/20 text-red-400' : 'bg-green-600/20 text-green-400'}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-gray-700 text-white rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="you@example.com"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center items-center space-x-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-md hover:from-blue-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50"
          >
            <Mail className="w-5 h-5" />
            <span>{loading ? 'Sending...' : 'Send Reset Link'}</span>
          </button>

          <div className="text-center">
            <Link to="/signin" className="text-blue-400 hover:text-blue-300 flex items-center justify-center space-x-1">
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Sign In</span>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
