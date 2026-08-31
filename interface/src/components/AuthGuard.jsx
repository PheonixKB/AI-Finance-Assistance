import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { auth } from '../apiService';

const AuthGuard = ({ children }) => {
  const [checking, setChecking] = useState(true);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    auth.isAuthenticated().then((ok) => {
      if (!cancelled) {
        setAuthed(ok);
        setChecking(false);
      }
    });
    return () => { cancelled = true; };
  }, []);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!authed) {
    return <Navigate to="/signin" replace />;
  }

  return children;
};

export default AuthGuard;
