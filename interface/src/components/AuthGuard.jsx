import React from 'react';
import { Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const AuthGuard = ({ children }) => {
  const token = localStorage.getItem('token');

  if (!token) {
    return <Navigate to="/signin" replace />;
  }

  try {
    const decoded = jwtDecode(token);
    if (decoded.exp && Date.now() >= decoded.exp * 1000) {
      localStorage.removeItem('token');
      return <Navigate to="/signin" replace />;
    }
  } catch {
    localStorage.removeItem('token');
    return <Navigate to="/signin" replace />;
  }

  return children;
};

export default AuthGuard;