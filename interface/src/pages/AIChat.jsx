import React, { useState, useEffect, useRef } from 'react';
import { Brain, Plus, User, LogOut, MessageSquare, Trash2, Edit } from 'lucide-react'; // Importing icons for UI elements
import { useNavigate } from 'react-router-dom'; // Hook for programmatic navigation
import { jwtDecode } from 'jwt-decode'; // Library to decode JWT tokens

/**
 * AIChat component provides the main interface for users to interact with the AI financial assistant.
 * It includes a side menu for navigation and user profile, and a main chat area for conversations.
 */
const AIChat = () => {
  // State variables for managing chat messages, user input, and the logged-in username
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [username, setUsername] = useState('Guest'); // Default username
  const [sessionId, setSessionId] = useState(null); // State to store the current chat session ID
  const [chatSessions, setChatSessions] = useState([]); // State to store list of chat sessions
  const [currentChatTitle, setCurrentChatTitle] = useState("New Chat"); // State to store the title of the current chat
  const [isEditingTitle, setIsEditingTitle] = useState(null); // State to track which session title is being edited
  const [editedTitle, setEditedTitle] = useState(''); // State to store the value of the edited title
  const navigate = useNavigate(); // Hook for programmatic navigation
  const initialLoadRef = useRef(true); // Ref to track initial component load

  // Function to fetch chat sessions for the current user
  const fetchChatSessions = async (user) => {
    const token = localStorage.getItem('token');
    if (!token || !user) return;

    try {
      const response = await fetch(`http://localhost:8000/api/chat/sessions/${user}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch chat sessions');
      }

      const sessions = await response.json();
      setChatSessions(sessions);
      // If there are sessions and no current session is set, load the latest one
      if (sessions.length > 0 && !sessionId) {
        handleSessionClick(sessions[0].id, sessions[0].title);
      } else if (sessions.length === 0 && !sessionId && initialLoadRef.current) {
        // If no sessions exist and it's the initial load, create a new one
        handleNewChat();
      }
    } catch (error) {
      console.error("Error fetching chat sessions:", error);
    }
  };

  // Function to fetch messages for a specific session
  const fetchSessionMessages = async (id) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch(`http://localhost:8000/api/chat/messages/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch session messages');
      }

      const messagesData = await response.json();
      setMessages(messagesData.map(msg => ({ sender: msg.sender, text: msg.text })));
    } catch (error) {
      console.error("Error fetching session messages:", error);
    }
  };

  // Effect hook to check authentication status and extract username from JWT on component mount
  useEffect(() => {
    const token = localStorage.getItem('token'); // Retrieve JWT token from local storage
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        const user = decodedToken.username || 'User';
        setUsername(user);
        fetchChatSessions(user); // Fetch chat sessions for the logged-in user

        initialLoadRef.current = false; // Mark initial load as complete
      } catch (error) {
        console.error("Error decoding token:", error); // Log any token decoding errors
        localStorage.removeItem('token'); // Remove invalid token
        navigate('/signin'); // Redirect to sign-in page
      }
    } else {
      navigate('/signin'); // Redirect to sign-in if no token is found
    }
  }, [navigate, sessionId, username]); // Dependency array ensures effect runs only when navigate, sessionId or username changes

  /**
   * Handles sending a new message from the user.
   * Adds the user's message to the chat, clears the input, and simulates an AI response.
   */
  const handleSendMessage = () => {
    if (input.trim() === '') return; // Prevent sending empty messages

    const newMessage = { sender: 'user', text: input };
    setMessages([...messages, newMessage]); // Add user's message to chat history
    setInput(''); // Clear the input field

    // TODO: Integrate with backend AI API to get actual responses
    // Simulate an AI response after a short delay
    setTimeout(() => {
      setMessages((prevMessages) => [
        ...prevMessages,
        { sender: 'ai', text: `Hello! You said: "${input}"` },
      ]);
    }, 1000);
  };

  /**
   * Handles initiating a new chat session.
   * Clears all current messages and the input field.
   */
  const handleNewChat = async () => {
    console.log("New Chat button clicked!"); // Log for debugging purposes
    setMessages([]); // Clear all messages
    setInput(''); // Clear the input field
    setCurrentChatTitle("New Chat"); // Reset title for new chat

    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/signin');
      return;
    }

    try {
      const response = await fetch('http://localhost:8000/api/chat/create_session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ title: "New Chat" }), // Provide a default title
      });

      if (!response.ok) {
        throw new Error('Failed to create new chat session');
      }

      const data = await response.json();
      setSessionId(data.id); // Store the new session ID
      console.log("New session created with ID:", data.id);
      fetchChatSessions(username); // Refresh the list of chat sessions
    } catch (error) {
      console.error("Error creating new chat session:", error);
      // Optionally display an error message to the user
    }
  };

  // Handles clicking on a past chat session to load its messages
  const handleSessionClick = (id, title) => {
    setSessionId(id);
    setCurrentChatTitle(title);
    fetchSessionMessages(id);
    setMessages([]); // Clear current messages before loading new ones
    setInput('');
  };

  // Handles deleting a chat session
  const handleDeleteSession = async (id) => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/signin');
      return;
    }

    if (!window.confirm("Are you sure you want to delete this chat session?")) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:8000/api/chat/sessions/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete chat session');
      }

      console.log("Session deleted with ID:", id);
      fetchChatSessions(username); // Refresh the list of chat sessions
      // If the deleted session was the current one, create a new default session
      if (sessionId === id) {
        handleNewChat();
      }
    } catch (error) {
      console.error("Error deleting chat session:", error);
      // Optionally display an error message to the user
    }
  };

  // Handles editing a chat session title
  const handleEditTitle = async (id) => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/signin');
      return;
    }

    if (editedTitle.trim() === '') {
      alert("Chat title cannot be empty.");
      return;
    }

    try {
      const response = await fetch(`http://localhost:8000/api/chat/sessions/${id}/title`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ title: editedTitle }),
      });

      if (!response.ok) {
        throw new Error('Failed to update chat title');
      }

      console.log("Session title updated for ID:", id);
      setIsEditingTitle(null); // Exit editing mode
      fetchChatSessions(username); // Refresh the list of chat sessions
      if (sessionId === id) {
        setCurrentChatTitle(editedTitle);
      }
    } catch (error) {
      console.error("Error updating chat title:", error);
      // Optionally display an error message to the user
    }
  };

  /**
   * Handles user logout.
   * Removes the JWT token from local storage and redirects to the home page.
   */
  const handleLogout = () => {
    localStorage.removeItem('token'); // Remove authentication token
    navigate('/'); // Redirect to the home page
  };

  return (
    // Main container for the chat interface with a gradient background and flex layout
    <div className="min-h-screen flex gradient-bg">
      {/* Side Menu: Fixed width, glass effect, and spaced content */}
      <div className="w-64 glass-effect p-6 flex flex-col justify-between">
        <div>
          {/* Application branding in the side menu */}
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-xl font-bold text-white">FinanceAI</h2>
          </div>

          {/* New Chat button */}
          <button
            className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 mb-4"
            onClick={handleNewChat}
          >
            <Plus className="w-5 h-5" />
            <span>New Chat</span>
          </button>

          {/* Past Chat Sessions */}
          <div className="space-y-2">
            <h3 className="text-gray-300 text-sm font-semibold">Past Chats</h3>
            {chatSessions.length > 0 ? (
              chatSessions.map((session) => (
                <div key={session.id} className="flex items-center justify-between group">
                  {isEditingTitle === session.id ? (
                    <input
                      type="text"
                      value={editedTitle}
                      onChange={(e) => setEditedTitle(e.target.value)}
                      onBlur={() => handleEditTitle(session.id)} // Save on blur
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleEditTitle(session.id);
                        }
                      }}
                      className="flex-grow px-3 py-2 rounded-lg text-sm bg-white/10 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <button
                      className={`flex-grow text-left px-3 py-2 rounded-lg text-sm transition-colors duration-200 ${sessionId === session.id ? 'bg-blue-700 text-white' : 'text-gray-400 hover:bg-white/10'}`}
                      onClick={() => handleSessionClick(session.id, session.title)}
                    >
                      <MessageSquare className="inline-block w-4 h-4 mr-2" />
                      {session.title}
                    </button>
                  )}
                  <div className="flex items-center">
                    {isEditingTitle !== session.id && (
                      <button
                        className="ml-2 p-1 rounded-lg text-gray-400 hover:text-blue-500 hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                        onClick={() => {
                          setIsEditingTitle(session.id);
                          setEditedTitle(session.title);
                        }}
                        title="Edit Chat Title"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      className="ml-2 p-1 rounded-lg text-gray-400 hover:text-red-500 hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                      onClick={() => handleDeleteSession(session.id)}
                      title="Delete Chat"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-gray-400 text-sm">No past chats yet.</div>
            )}
          </div>
        </div>

        {/* Finance Data Button */}
        <button
          className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200 mt-4"
          onClick={() => navigate('/finance-data')}
        >
          <MessageSquare className="w-5 h-5" /> {/* Using MessageSquare as a placeholder icon */}
          <span>Finance Data</span>
        </button>

        {/* Chat Profile and Logout section */}
        <div className="border-t border-gray-700 pt-4">
          <h3 className="text-gray-300 text-sm font-semibold mb-2">Chat Profile</h3>
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate('/profile')}>
            <User className="w-8 h-8 text-gray-400" />
            <span className="text-white">{username}</span> {/* Display logged-in username */}
          </div>
          {/* Logout button */}
          <button
            className="w-full flex items-center justify-center space-x-2 px-4 py-2 mt-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-200"
            onClick={handleLogout}
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main Chat Area: Takes remaining width, centered content */}
      <div className="flex-1 flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl w-full space-y-8 p-10 glass-effect rounded-xl shadow-lg z-10">
          {/* Chat header with AI assistant branding */}
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white">AI Financial Assistant Chat - {currentChatTitle}</h2>
          </div>

          {/* Chat messages display area */}
          <div className="flex flex-col space-y-4 h-96 overflow-y-auto p-4 bg-white/10 rounded-lg">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] p-3 rounded-lg ${msg.sender === 'user'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-800'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          {/* Message input and send button */}
          <div className="flex space-x-4">
            <input
              type="text"
              className="flex-grow px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ask your financial assistant..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleSendMessage();
                }
              }}
            />
            <button
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200"
              onClick={handleSendMessage}
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIChat;