import React, { useState, useEffect } from 'react';
import { Menu, X, TrendingUp, Brain, User, Upload } from 'lucide-react'; // Importing icons for UI elements
import { useNavigate } from 'react-router-dom'; // Hook for programmatic navigation

/**
 * Header component provides the main navigation bar for the application.
 * It includes branding, navigation links, authentication buttons (Sign In/Get Started or Logout),
 * and a responsive mobile menu.
 */
const Header = () => {
  // State for controlling the visibility of the mobile menu
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  // State for tracking user login status
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate(); // Hook for programmatic navigation

  // Effect hook to check login status on component mount and listen for storage changes
  useEffect(() => {
    const token = localStorage.getItem('token'); // Check for JWT token in local storage
    setIsLoggedIn(!!token); // Set login status based on token presence

    // Event listener for changes in local storage (e.g., token added/removed in another tab)
    const handleStorageChange = () => {
      const newToken = localStorage.getItem('token');
      setIsLoggedIn(!!newToken);
    };

    window.addEventListener('storage', handleStorageChange);
    // Cleanup function to remove the event listener
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []); // Empty dependency array ensures this effect runs only once on mount

  /**
   * Handles user logout.
   * Removes the JWT token from local storage, updates login status, and redirects to the home page.
   */
  const handleLogout = () => {
    localStorage.removeItem('token'); // Remove authentication token
    setIsLoggedIn(false); // Update login status
    navigate('/'); // Redirect to the home page
  };

  // Navigation links data
  const navigation = [
    { name: 'Features', href: '#features' },
    { name: 'Analytics', href: '#analytics' },
    { name: 'Testimonials', href: '#testimonials' },
    { name: 'Contact', href: '#contact' },
  ];

  const loggedInNavigation = [
    { name: 'Profile', href: '/profile', icon: User },
    { name: 'Upload Finance Data', href: '/finance-data', icon: Upload },
  ];

  return (
    // Fixed header with full width, top position, z-index, and glass effect styling
    <header className="fixed w-full top-0 z-50 glass-effect">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Branding/Logo section */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">FinanceAI</h1>
              <p className="text-xs text-gray-600">Smart Financial Assistant</p>
            </div>
          </div>

          {/* Desktop navigation links */}
          <nav className="hidden md:flex space-x-8">
            {navigation.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="text-gray-700 hover:text-blue-600 transition-colors duration-200 font-medium"
              >
                {item.name}
              </a>
            ))}
            {isLoggedIn && loggedInNavigation.map((item) => (
              <button
                key={item.name}
                onClick={() => navigate(item.href)}
                className="text-gray-700 hover:text-blue-600 transition-colors duration-200 font-medium"
              >
                {item.name}
              </button>
            ))}
          </nav>

          {/* Desktop authentication buttons (Sign In/Get Started or Logout) */}
          <div className="hidden md:flex items-center space-x-4">
            {isLoggedIn ? ( // Conditionally render Profile and Logout buttons if logged in
              <button
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-200 hover:scale-105"
                onClick={handleLogout}
              >
                Logout
              </button>
            ) : ( // Render Sign In and Get Started buttons if not logged in
              <>
                <button
                  className="px-4 py-2 text-blue-600 hover:text-blue-700 transition-colors duration-200"
                  onClick={() => navigate('/signin')}
                >
                  Sign In
                </button>
                <button
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 hover:scale-105"
                  onClick={() => navigate('/signup')}
                >
                  Get Started
                </button>
              </>
            )}
          </div>

          {/* Mobile menu toggle button */}
          <button
            className="md:hidden text-gray-700"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />} {/* Toggle Menu/X icon */} 
          </button>
        </div>

        {/* Mobile menu content, conditionally rendered */}
        {isMenuOpen && (
          <div className="md:hidden pb-4">
            <nav className="flex flex-col space-y-4">
              {navigation.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="text-gray-700 hover:text-blue-600 transition-colors duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </a>
              ))}
              {isLoggedIn && (
                <>                  {loggedInNavigation.map((item) => (
                    <button
                      key={item.name}
                      onClick={() => {
                        setIsMenuOpen(false);
                        navigate(item.href);
                      }}
                      className="px-4 py-2 text-blue-600 hover:text-blue-700 transition-colors duration-200 text-left flex items-center space-x-2"
                    >
                      {item.icon && <item.icon className="w-5 h-5" />}
                      <span>{item.name}</span>
                    </button>
                  ))}
                  <button
                    className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-200 text-left"
                    onClick={() => {
                      setIsMenuOpen(false);
                      handleLogout();
                    }}
                  >
                    Logout
                  </button>
                </>
              )}
              {!isLoggedIn && (
                <div className="flex flex-col space-y-2 pt-4 border-t border-gray-200">
                  <button
                    className="px-4 py-2 text-blue-600 hover:text-blue-700 transition-colors duration-200 text-left"
                    onClick={() => {
                      setIsMenuOpen(false);
                      navigate('/signin');
                    }}
                  >
                    Sign In
                  </button>
                  <button
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200"
                    onClick={() => {
                      setIsMenuOpen(false);
                      navigate('/signup');
                    }}
                  >
                    Get Started
                  </button>
                </div>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;