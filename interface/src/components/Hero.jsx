import React from 'react';
import { ArrowRight, Sparkles, Shield, Zap } from 'lucide-react'; // Importing icons for visual elements
import { useNavigate } from 'react-router-dom'; // Hook for programmatic navigation

/**
 * Hero component represents the main introductory section of the landing page.
 * It features a compelling headline, a brief description, call-to-action buttons,
 * and highlights key benefits with illustrative graphics.
 */
const Hero = () => {
  const navigate = useNavigate(); // Initialize navigate hook

  return (
    // Main section with padding and a gradient background
    <section className="pt-24 pb-12 md:pt-32 md:pb-20 gradient-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left column: Text content and call-to-action buttons */}
          <div className="animate-fade-in"> {/* Apply fade-in animation */}
            {/* AI-Powered Financial Intelligence highlight */}
            <div className="flex items-center space-x-2 mb-6">
              <Sparkles className="w-5 h-5 text-yellow-300" />
              <span className="text-yellow-300 font-semibold">AI-Powered Financial Intelligence</span>
            </div>
            
            {/* Main headline */}
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Your Personal
              <span className="text-yellow-300"> AI Finance</span>
              <br />
              Assistant
            </h1>
            
            {/* Description paragraph */}
            <p className="text-xl text-gray-200 mb-8 leading-relaxed">
              Make smarter financial decisions with AI-powered insights. Track expenses, optimize budgets, and get personalized investment recommendations.
            </p>
            
            {/* Call-to-action buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <button
                className="px-8 py-4 bg-white text-purple-600 rounded-lg font-semibold hover:bg-gray-100 transition-all duration-200 hover:scale-105 flex items-center justify-center space-x-2"
                onClick={() => navigate('/signup')} // Navigate to sign-up page
              >
                <span>Start Free Trial</span>
                <ArrowRight className="w-5 h-5" />
              </button>
              <button
                className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-lg font-semibold hover:bg-white hover:text-purple-600 transition-all duration-200"
                onClick={() => document.getElementById('features').scrollIntoView({ behavior: 'smooth' })} // Scroll to features section
              >
                Watch Demo
              </button>
            </div>
            
            {/* Key features/benefits */}
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
          
          {/* Right column: Illustrative graphic/dashboard preview */}
          <div className="relative animate-float"> {/* Apply floating animation */}
            <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20"> {/* Glass effect card */}
              <div className="space-y-6">
                {/* Monthly Spending display */}
                <div className="flex items-center justify-between">
                  <span className="text-white/80">Monthly Spending</span>
                  <span className="text-white font-semibold">$3,247</span>
                </div>
                {/* Spending chart placeholder */}
                <div className="h-32 bg-gradient-to-r from-blue-400 to-purple-500 rounded-lg flex items-end p-4">
                  <div className="w-full flex items-end justify-between">
                    <div className="w-8 bg-white/80 rounded-t" style={{height: '60%'}}></div>
                    <div className="w-8 bg-white/80 rounded-t" style={{height: '80%'}}></div>
                    <div className="w-8 bg-white/80 rounded-t" style={{height: '45%'}}></div>
                    <div className="w-8 bg-white/80 rounded-t" style={{height: '90%'}}></div>
                  </div>
                </div>
                {/* Savings Goal and AI Insights */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="bg-white/10 rounded-lg p-3">
                    <p className="text-white/70">Savings Goal</p>
                    <p className="text-white font-semibold">$2,100 / $5,000</p>
                  </div>
                  <div className="bg-white/10 rounded-lg p-3">
                    <p className="text-white/70">AI Insights</p>
                    <p className="text-green-400 font-semibold">+12% Optimized</p>
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