import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Brain } from 'lucide-react'; // Importing Brain icon for branding

/**
 * SignUp component provides a user interface for registering a new account.
 * It handles user input for name, email, and password, communicates with the backend for registration,
 * and redirects the user upon successful registration.
 */
const SignUp = () => {
  // State variables for name, email, password, and error messages
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate(); // Hook for programmatic navigation

  /**
   * Handles the form submission for user registration.
   * Prevents default form behavior, sends user data to the backend, and processes the response.
   */
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission
    setError(''); // Clear any previous error messages

    try {
      // Send registration request to the backend API
      const response = await fetch('http://localhost:8000/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json', // Specify content type as JSON
        },
        // Send user data as a JSON string in the request body
        body: JSON.stringify({
          username: name,
          email: email,
          password: password,
        }),
      });

      // Check if the response was successful
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Registration failed'); // Throw error with message from backend or default
      }

      // Redirect to the sign-in page after successful registration
      navigate('/signin');
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
      {/* Sign-up form container with glass effect and shadow */}
      <div className="max-w-md w-full space-y-8 p-10 glass-effect rounded-xl shadow-lg z-10 mt-20">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
            Create your account
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm"> {/* Input fields container */}
            <div className="mb-4"> {/* Full Name input field */}
              <label htmlFor="full-name" className="sr-only">Full Name</label>
              <input
                id="full-name"
                name="full-name"
                type="text"
                autoComplete="name"
                required
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
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
                autoComplete="new-password"
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

          <div> {/* Sign up button */}
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Sign up
            </button>
          </div>
        </form>
        {/* Link to sign in page */}
        <div className="text-center text-sm text-gray-200">
          Already have an account? {' '}
          <Link to="/signin" className="font-medium text-blue-400 hover:text-blue-300">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SignUp;