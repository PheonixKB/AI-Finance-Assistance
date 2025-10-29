import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Brain } from 'lucide-react'; // Importing Brain icon for branding

/**
 * SignIn component provides a user interface for logging into the application.
 * It handles user input for email and password, communicates with the backend for authentication,
 * stores the authentication token, and redirects the user upon successful login.
 */
const SignIn = () => {
  // State variables for email, password, and error messages
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate(); // Hook for programmatic navigation

  /**
   * Handles the form submission for user login.
   * Prevents default form behavior, sends credentials to the backend, and processes the response.
   */
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission
    setError(''); // Clear any previous error messages

    try {
      // Send login request to the backend API
      const response = await fetch('http://localhost:8000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded', // Required for OAuth2PasswordRequestForm
        },
        // Encode credentials as URLSearchParams for x-www-form-urlencoded
        body: new URLSearchParams({
          username: email, // FastAPI's OAuth2PasswordRequestForm expects 'username' for email
          password: password,
        }),
      });

      // Check if the response was successful
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Login failed'); // Throw error with message from backend or default
      }

      // Parse the successful response
      const data = await response.json();
      localStorage.setItem('token', data.access_token); // Store the JWT token
      navigate('/'); // Redirect to the home page after successful login
    } catch (err) {
      setError(err.message); // Display any caught errors
    }
  };

  return (
    // Main container with gradient background and centered content
    <div className="min-h-screen flex flex-col items-center justify-center gradient-bg py-12 px-4 sm:px-6 lg:px-8">
      {/* Header for navigation back to home */}
      <header className="fixed w-full top-0 z-50 glass-effect py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          {/* Branding/Logo link to home */}
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">FinanceAI</h1>
              <p className="text-xs text-gray-600">Smart Financial Assistant</p>
            </div>
          </Link>
          {/* Link to go back to the home page */}
          <Link to="/" className="text-gray-700 hover:text-blue-600 transition-colors duration-200 font-medium">
            Back to Home
          </Link>
        </div>
      </header>
      {/* Sign-in form container with glass effect and shadow */}
      <div className="max-w-md w-full space-y-8 p-10 glass-effect rounded-xl shadow-lg z-10 mt-20">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
            Sign in to your account
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm"> {/* Input fields container */}
            <div className="mb-4"> {/* Email input field */}
              <label htmlFor="email-address" className="sr-only">Email address</label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div> {/* Password input field */}
              <label htmlFor="password" className="sr-only">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {/* Error message display */}
          {error && <p className="mt-2 text-center text-sm text-red-400">{error}</p>}

          <div className="flex items-center justify-between"> {/* Remember me and Forgot password section */}
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-200">
                Remember me
              </label>
            </div>

            <div className="text-sm">
              <a href="#" className="font-medium text-blue-400 hover:text-blue-300">
                Forgot your password?
              </a>
            </div>
          </div>

          <div> {/* Sign in button */}
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Sign in
            </button>
          </div>
        </form>
        {/* Link to sign up page */}
        <div className="text-center text-sm text-gray-200">
          Don't have an account? {' '}
          <Link to="/signup" className="font-medium text-blue-400 hover:text-blue-300">
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SignIn;