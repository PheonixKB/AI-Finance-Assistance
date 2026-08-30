import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import Dashboard from './pages/Dashboard';
import AIChat from './pages/AIChat';
import Profile from './pages/Profile';
import FinanceData from './pages/FinanceData';
import SmartBudgeting from './pages/SmartBudgeting';
import FinanceQuestionnaire from './pages/FinanceQuestionnaire';
import AllInvestments from './pages/AllInvestments';
import AllTransactions from './pages/AllTransactions';
import InvestmentInsights from './pages/InvestmentInsights';
import GoalTracking from './pages/GoalTracking';
import ExpenseOptimization from './pages/ExpenseOptimization';
import BillManagement from './pages/BillManagement';
import WealthAnalytics from './pages/WealthAnalytics';
import AuthGuard from './components/AuthGuard';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/chat" element={<AIChat />} />
        <Route path="/finance-questionnaire" element={<FinanceQuestionnaire />} />

        <Route path="/dashboard" element={<AuthGuard><Dashboard /></AuthGuard>} />
        <Route path="/profile" element={<AuthGuard><Profile /></AuthGuard>} />
        <Route path="/finance-data" element={<AuthGuard><FinanceData /></AuthGuard>} />
        <Route path="/smart-budgeting" element={<AuthGuard><SmartBudgeting /></AuthGuard>} />
        <Route path="/all-investments" element={<AuthGuard><AllInvestments /></AuthGuard>} />
        <Route path="/all-transactions" element={<AuthGuard><AllTransactions /></AuthGuard>} />
        <Route path="/investment-insights" element={<AuthGuard><InvestmentInsights /></AuthGuard>} />
        <Route path="/goal-tracking" element={<AuthGuard><GoalTracking /></AuthGuard>} />
        <Route path="/expense-optimization" element={<AuthGuard><ExpenseOptimization /></AuthGuard>} />
        <Route path="/bill-management" element={<AuthGuard><BillManagement /></AuthGuard>} />
        <Route path="/wealth-analytics" element={<AuthGuard><WealthAnalytics /></AuthGuard>} />
      </Routes>
    </Router>
  );
}

export default App;
