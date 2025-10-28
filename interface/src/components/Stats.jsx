import React from 'react';
import { Users, DollarSign, TrendingUp, Award } from 'lucide-react';

const Stats = () => {
  const stats = [
    {
      icon: <Users className="w-8 h-8 text-blue-600" />,
      number: "50K+",
      label: "Active Users",
      description: "Trusting our AI assistant"
    },
    {
      icon: <DollarSign className="w-8 h-8 text-green-600" />,
      number: "$2.5M+",
      label: "Money Saved",
      description: "By our users last month"
    },
    {
      icon: <TrendingUp className="w-8 h-8 text-purple-600" />,
      number: "15%",
      label: "Average ROI",
      description: "Improvement with AI insights"
    },
    {
      icon: <Award className="w-8 h-8 text-orange-600" />,
      number: "98%",
      label: "Satisfaction Rate",
      description: "From our happy users"
    }
  ];

  return (
    <section id="analytics" className="py-20 bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Proven Results
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Join thousands of users who have transformed their financial lives with AI-powered insights.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="text-center group hover:scale-105 transition-transform duration-300"
            >
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-white/10 rounded-lg group-hover:bg-white/20 transition-colors duration-300">
                  {stat.icon}
                </div>
              </div>
              <div className="text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                {stat.number}
              </div>
              <div className="text-xl font-semibold mb-1">{stat.label}</div>
              <div className="text-gray-400">{stat.description}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Stats;