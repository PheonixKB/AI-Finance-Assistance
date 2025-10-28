import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// Import page components
import Home from './pages/Home';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import Dashboard from './pages/Dashboard';
import AIChat from './pages/AIChat'; // Import AIChat component for the AI chat page
import Profile from './pages/Profile'; // Import Profile component for the user profile page
import FinanceData from './pages/FinanceData'; // Import FinanceData component for the finance data page
// Import authentication guard component
import AuthGuard from './components/AuthGuard';

/**
 * Main application component responsible for setting up routing.
 * Uses react-router-dom to define different routes for the application.
 */
function App() {
  return (
    <Router> {/* BrowserRouter enables client-side routing */}
      <Routes> {/* Routes component defines the different routes in the application */}
        {/* Public routes accessible to all users */}
        <Route path="/" element={<Home />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        
        {/* Protected routes requiring authentication */}
        {/* The Dashboard route is protected by AuthGuard */}
        <Route
          path="/dashboard"
          element={
            <AuthGuard> {/* AuthGuard checks for authentication before rendering Dashboard */}
              <Dashboard />
            </AuthGuard>
          }
        />
        {/* The AI Chat route is protected by AuthGuard */}
        <Route
          path="/chat"
          element={
            <AuthGuard> {/* AuthGuard checks for authentication before rendering AIChat */}
              <AIChat />
            </AuthGuard>
          }
        />
        {/* The Profile route is protected by AuthGuard */}
        <Route
          path="/profile"
          element={
            <AuthGuard> {/* AuthGuard checks for authentication before rendering Profile */}
              <Profile />
            </AuthGuard>
          }
        />
        {/* The Finance Data route is protected by AuthGuard */}
        <Route
          path="/finance-data"
          element={
            <AuthGuard> {/* AuthGuard checks for authentication before rendering FinanceData */}
              <FinanceData />
            </AuthGuard>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;