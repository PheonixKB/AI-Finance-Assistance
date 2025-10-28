import React from 'react';
import { BarChart3, Wallet, Target, TrendingUp, CreditCard, PieChart } from 'lucide-react';

const Features = () => {
  const features = [
    {
      icon: <BarChart3 className="w-8 h-8 text-blue-600" />,
      title: "Smart Budgeting",
      description: "AI automatically categorizes expenses and creates personalized budgets based on your spending patterns.",
      gradient: "from-blue-500 to-blue-600"
    },
    {
      icon: <TrendingUp className="w-8 h-8 text-green-600" />,
      title: "Investment Insights",
      description: "Get AI-powered investment recommendations tailored to your risk tolerance and financial goals.",
      gradient: "from-green-500 to-green-600"
    },
    {
      icon: <Target className="w-8 h-8 text-purple-600" />,
      title: "Goal Tracking",
      description: "Set financial goals and track progress with intelligent milestones and achievement predictions.",
      gradient: "from-purple-500 to-purple-600"
    },
    {
      icon: <Wallet className="w-8 h-8 text-orange-600" />,
      title: "Expense Optimization",
      description: "Identify unnecessary expenses and get suggestions to save more money each month.",
      gradient: "from-orange-500 to-orange-600"
    },
    {
      icon: <CreditCard className="w-8 h-8 text-red-600" />,
      title: "Bill Management",
      description: "Never miss a payment with AI-powered bill reminders and automatic payment scheduling.",
      gradient: "from-red-500 to-red-600"
    },
    {
      icon: <PieChart className="w-8 h-8 text-indigo-600" />,
      title: "Wealth Analytics",
      description: "Comprehensive wealth tracking with net worth calculations and portfolio performance analysis.",
      gradient: "from-indigo-500 to-indigo-600"
    }
  ];

  return (
    <section id="features" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Powerful AI Features
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Transform your financial life with intelligent features designed to help you save more, spend wisely, and build wealth.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100"
            >
              <div className="mb-6">
                <div className="w-16 h-16 bg-gradient-to-br rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
              <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity duration-300"></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;