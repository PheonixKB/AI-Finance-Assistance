import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain, User, Check, X, Edit } from 'lucide-react';
import { jwtDecode } from 'jwt-decode';

const Profile = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [editedUsername, setEditedUsername] = useState('');
  const [permissions, setPermissions] = useState({
    assets: false,
    liabilities: false,
    transactions: false,
    investments: false,
    epf: false,
    creditScore: false,
  });
  const [message, setMessage] = useState({ type: '', text: '' }); // For success/error messages
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        setUsername(decodedToken.username || 'User');
        setEmail(decodedToken.sub || ''); // 'sub' typically holds the email
        setEditedUsername(decodedToken.username || 'User');
        // TODO: Fetch actual permissions from backend
        setPermissions({
          assets: true,
          liabilities: false,
          transactions: true,
          investments: false,
          epf: true,
          creditScore: false,
        });
      } catch (error) {
        console.error("Error decoding token:", error);
        localStorage.removeItem('token');
        navigate('/signin');
      }
    } else {
      navigate('/signin');
    }
  }, [navigate]);

  const handleUpdateUsername = async () => {
    if (editedUsername.trim() === '') {
      setMessage({ type: 'error', text: 'Username cannot be empty.' });
      return;
    }
    if (editedUsername === username) {
      setIsEditingUsername(false);
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/signin');
      return;
    }

    try {
      const response = await fetch('http://localhost:8000/api/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ username: editedUsername }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("API Error:", errorData); // Log API error response
        throw new Error(errorData.detail || 'Failed to update username');
      }

      const data = await response.json();
      console.log("API Response:", data); // Log successful API response
      localStorage.setItem('token', data.access_token); // Store the new JWT token
      setUsername(data.username); // Update local state with new username
      setMessage({ type: 'success', text: 'Username updated successfully!' });
      setIsEditingUsername(false);
    } catch (error) {
      console.error("Error updating username:", error); // Log caught JavaScript errors
      setMessage({ type: 'error', text: error.message });
    }
  };

  const handlePermissionChange = (permissionName) => {
    setPermissions((prevPermissions) => ({
      ...prevPermissions,
      [permissionName]: !prevPermissions[permissionName],
    }));
    // TODO: Send update to backend
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gradient-bg py-12 px-4 sm:px-6 lg:px-8">
      <header className="fixed w-full top-0 z-50 glass-effect py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <button onClick={() => navigate(-1)} className="text-gray-700 hover:text-blue-600 transition-colors duration-200 font-medium">
            Back
          </button>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">FinanceAI</h1>
              <p className="text-xs text-gray-600">Smart Financial Assistant</p>
            </div>
          </div>
          <div className="w-20"></div> {/* Spacer */}
        </div>
      </header>

      <div className="max-w-2xl w-full space-y-8 p-10 glass-effect rounded-xl shadow-lg z-10 mt-20">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-white">User Profile</h2>
        
        {message.text && (
          <div className={`p-3 rounded-md text-center ${message.type === 'success' ? 'bg-green-500' : 'bg-red-500'} text-white`}>
            {message.text}
          </div>
        )}

        <div className="flex flex-col items-center space-y-4">
          <User className="w-24 h-24 text-gray-400" />
          <div className="flex items-center space-x-2">
            {isEditingUsername ? (
              <input
                type="text"
                value={editedUsername}
                onChange={(e) => setEditedUsername(e.target.value)}
                onBlur={handleUpdateUsername} // Save on blur
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleUpdateUsername();
                  }
                }}
                className="text-white text-xl font-semibold bg-white/10 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <span className="text-white text-xl font-semibold">{username}</span>
            )}
            {!isEditingUsername && (
              <button
                onClick={() => setIsEditingUsername(true)}
                className="p-1 rounded-md text-gray-400 hover:text-blue-500 hover:bg-white/10"
                title="Edit Username"
              >
                <Edit className="w-5 h-5" />
              </button>
            )}
          </div>
          <span className="text-gray-300 text-lg">{email}</span>
        </div>

        <div className="space-y-4">
          <h3 className="text-xl font-bold text-white">Data Permissions</h3>
          {Object.entries(permissions).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between bg-white/10 p-4 rounded-lg">
              <span className="text-white capitalize">{key}</span>
              <button
                onClick={() => handlePermissionChange(key)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${value ? 'bg-blue-600' : 'bg-gray-400'}`}
              >
                <span className="sr-only">Enable {key}</span>
                <span
                  className={`transform transition ease-in-out duration-200 ${value ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 rounded-full bg-white`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Profile;