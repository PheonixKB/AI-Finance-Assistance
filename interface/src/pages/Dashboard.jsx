import React from 'react';

/**
 * Dashboard component serves as a placeholder page for authenticated users.
 * In a full application, this would display user-specific information, analytics, or controls.
 */
const Dashboard = () => {
  return (
    // Main container for the dashboard page with a minimum screen height and centered content
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      {/* Content container with styling */}
      <div className="max-w-md w-full space-y-8 p-10 bg-white rounded-xl shadow-lg z-10">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Welcome to your Dashboard!
        </h2>
        <p className="text-center text-gray-600">
          You are successfully logged in.
        </p>
      </div>
    </div>
  );
};

export default Dashboard;