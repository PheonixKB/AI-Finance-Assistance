import React from 'react';
import { Navigate } from 'react-router-dom'; // Navigate component for redirection

/**
 * AuthGuard component is a higher-order component (HOC) used to protect routes.
 * It checks if a user is authenticated by looking for a JWT token in local storage.
 * If no token is found, it redirects the user to the sign-in page.
 */
const AuthGuard = ({ children }) => {
  const token = localStorage.getItem('token'); // Retrieve the authentication token

  // If no token is found, the user is not authenticated
  if (!token) {
    // Redirect to the sign-in page, replacing the current history entry
    return <Navigate to="/signin" replace />;
  }

  // If authenticated, render the children components (the protected route's content)
  return children;
};

export default AuthGuard;