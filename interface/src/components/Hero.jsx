import React, { useEffect, useState } from "react";
import { ArrowRight, Sparkles, Shield, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from 'jwt-decode';

const Hero = () => {
  const navigate = useNavigate();
  const [data, setData] = useState({
    monthly_spending: 0,
    spending_chart: [],
    savings_current: 0,
    savings_goal: 0,
    ai_optimization: 0,
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        // No need to set username here, as it's not displayed in Hero

        const fetchFinanceData = async () => {
          let monthlySpending = 0;
          let spendingChartData = [];
          let savingsGoal = 0;
          let totalSavings = 0;

          // Fetch finance profile for savings goal
          try {
            const response = await fetch('http://localhost:8000/api/finance_profile', {
              headers: { 'Authorization': `Bearer ${token}` },
            });
            if (response.ok) {
              const profileData = await response.json();
              savingsGoal = profileData.savings_goal || 0;
            }
          } catch (error) {
            console.error("Error fetching finance profile:", error);
          }

          // Fetch all transactions
          try {
            const response = await fetch('http://localhost:8000/api/transactions', {
              headers: { 'Authorization': `Bearer ${token}` },
            });
            if (response.ok) {
              const transactions = await response.json();
              const { processedMonthlySpending, processedSpendingChartData, processedTotalSavings } = processTransactions(transactions);
              monthlySpending = processedMonthlySpending;
              spendingChartData = processedSpendingChartData;
              totalSavings = processedTotalSavings;
            } else {
              console.error("Failed to fetch transactions");
            }
          } catch (error) {
            console.error("Error fetching transactions:", error);
          }

          setData({
            monthly_spending: monthlySpending,
            spending_chart: spendingChartData,
            savings_current: totalSavings,
            savings_goal: savingsGoal,
            ai_optimization: 12, // Placeholder for now
          });
        };

        fetchFinanceData();

      } catch (error) {
        console.error("Error decoding token:", error);
        localStorage.removeItem('token');
        navigate('/signin');
      }
    } else {
      // If no token, set default data or redirect to signin
      // For now, we'll just set default values
      setData({
        monthly_spending: 3247,
        spending_chart: [60, 80, 45, 90],
        savings_current: 2100,
        savings_goal: 5000,
        ai_optimization: 12,
      });
    }
  }, [navigate]);

  const processTransactions = (transactions) => {
    const monthlySpendingMap = {};
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Initialize monthly spending for the last 4 months
    for (let i = 0; i < 4; i++) {
      let month = currentMonth - i;
      let year = currentYear;
      if (month < 0) {
        month += 12;
        year -= 1;
      }
      const monthKey = `${year}-${month + 1}`;
      monthlySpendingMap[monthKey] = 0;
    }

    let totalCurrentMonthSpending = 0;
    let calculatedTotalSavings = 0;

    transactions.forEach(tx => {
      const txDate = new Date(tx.date);
      const txMonth = txDate.getMonth();
      const txYear = txDate.getFullYear();
      const monthKey = `${txYear}-${txMonth + 1}`;

      // Only consider transactions from the last 4 months
      if (monthlySpendingMap.hasOwnProperty(monthKey)) {
        monthlySpendingMap[monthKey] += tx.amount;
      }

      // Calculate total spending for the current month
      if (txMonth === currentMonth && txYear === currentYear) {
        totalCurrentMonthSpending += tx.amount;
      }
      // Assuming positive amounts are income/savings and negative are expenses
      calculatedTotalSavings += tx.amount; // This needs more sophisticated logic for actual savings
    });

    const spendingValues = Object.values(monthlySpendingMap);
    const maxSpending = Math.max(...spendingValues, 1); // Avoid division by zero

    const chartData = spendingValues.map(spending => (spending / maxSpending) * 100);

    return {
      processedMonthlySpending: totalCurrentMonthSpending,
      processedSpendingChartData: chartData,
      processedTotalSavings: calculatedTotalSavings,
    };
  };

  if (!data) {
    return <p className="text-white">Loading...</p>;
  }

  return (
    <section className="pt-24 pb-12 md:pt-32 md:pb-20 gradient-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="animate-fade-in">
            <div className="flex items-center space-x-2 mb-6">
              <Sparkles className="w-5 h-5 text-yellow-300" />
              <span className="text-yellow-300 font-semibold">
                AI-Powered Financial Intelligence
              </span>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Your Personal
              <span className="text-yellow-300"> AI Finance</span>
              <br />
              Assistant
            </h1>

            <p className="text-xl text-gray-200 mb-8 leading-relaxed">
              Make smarter financial decisions with AI-powered insights. Track
              expenses, optimize budgets, and get personalized investment
              recommendations.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <a
                href="/chat"
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-4 bg-white text-purple-600 rounded-lg font-semibold hover:bg-gray-100 transition-all duration-200 hover:scale-105 flex items-center justify-center space-x-2"
              >
                <span>Start Free Trial</span>
                <ArrowRight className="w-5 h-5" />
              </a>
              <a
                href="/chat"
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-lg font-semibold hover:bg-white hover:text-purple-600 transition-all duration-200"
              >
                Watch Demo
              </a>
            </div>

            <div className="flex items-center space-x-6 text-gray-300">
              <div className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-green-400" />
                <span>Bank-Level Security</span>
              </div>
              <div className="flex items-center space-x-2">
                <Zap className="w-5 h-5 text-yellow-400" />
                <span>Real-Time Analytics</span>
              </div>
            </div>
          </div>

          <div className="relative animate-float">
            <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <span className="text-white/80">Monthly Spending</span>
                  <span className="text-white font-semibold">
                    ${data.monthly_spending.toLocaleString()}
                  </span>
                </div>

                <div className="h-32 bg-gradient-to-r from-blue-400 to-purple-500 rounded-lg flex items-end p-4">
                  <div className="w-full flex items-end justify-between">
                    {(data.spending_chart || [50, 70, 40, 85]).map((height, i) => (
                      <div
                        key={i}
                        className="w-8 bg-white/80 rounded-t"
                        style={{ height: `${height}%` }}
                      ></div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="bg-white/10 rounded-lg p-3">
                    <p className="text-white/70">Savings Goal</p>
                    <p className="text-white font-semibold">
                      ${data.savings_current.toLocaleString()} / $
                      {data.savings_goal.toLocaleString()}
                    </p>
                  </div>
                  <div className="bg-white/10 rounded-lg p-3">
                    <p className="text-white/70">AI Insights</p>
                    <p className="text-green-400 font-semibold">
                      +{data.ai_optimization}% Optimized
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
