import React, { useState, useEffect, useRef } from 'react';
import { Brain, Plus, User, LogOut, MessageSquare, Trash2, Edit, Send, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import apiService, { chat, ai } from '../apiService';

const AIChat = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [username, setUsername] = useState('Guest');
  const [sessionId, setSessionId] = useState(null);
  const [chatSessions, setChatSessions] = useState([]);
  const [currentChatTitle, setCurrentChatTitle] = useState('New Chat');
  const [isEditingTitle, setIsEditingTitle] = useState(null);
  const [editedTitle, setEditedTitle] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const initialLoadRef = useRef(true);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchChatSessions = async (user) => {
    if (!apiService.auth.isAuthenticated() || !user) return;
    try {
      const sessions = await chat.getSessions();
      setChatSessions(sessions);
      if (sessions.length > 0 && !sessionId) {
        handleSessionClick(sessions[0].id, sessions[0].title);
      } else if (sessions.length === 0 && initialLoadRef.current) {
        handleNewChat();
      }
    } catch (err) {
      console.error('Error fetching chat sessions:', err);
      setError(err.message || 'Failed to fetch sessions');
    }
  };

  const fetchSessionMessages = async (id) => {
    try {
      const messagesData = await chat.getMessages(id);
      setMessages(messagesData.map((msg) => ({ sender: msg.sender, text: msg.text })));
    } catch (err) {
      console.error('Error fetching session messages:', err);
      setError(err.message || 'Failed to fetch messages');
    }
  };

  useEffect(() => {
    let cancelled = false;
    apiService.auth.isAuthenticated().then((ok) => {
      if (!cancelled && !ok) {
        navigate('/signin');
        return;
      }
      if (!cancelled) {
        setUsername('User');
        initialLoadRef.current = false;
        fetchChatSessions('User');
      }
    });
    return () => { cancelled = true; };
  }, [navigate]);

  const handleSendMessage = async () => {
    if (input.trim() === '') return;
    if (!sessionId) {
      setError('No active chat session. Please start a new chat.');
      return;
    }

    const userMessage = { sender: 'user', text: input };
    const currentInput = input;
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError('');

    try {
      await chat.addMessage(sessionId, 'user', currentInput);

      const response = await ai.ask(currentInput);
      const aiText = response.answer || '[No response from AI]';
      setMessages((prev) => [...prev, { sender: 'ai', text: aiText }]);

      await chat.addMessage(sessionId, 'ai', aiText);
    } catch (err) {
      console.error('Error sending message:', err);
      setError(err.message || 'Failed to get AI response');
      setMessages((prev) => [
        ...prev,
        { sender: 'ai', text: 'Sorry, I encountered an error. Please try again.' },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewChat = async () => {
    setMessages([]);
    setInput('');
    setCurrentChatTitle('New Chat');
    setError('');

    if (!apiService.auth.isAuthenticated()) {
      navigate('/signin');
      return;
    }

    try {
      const data = await chat.createSession('New Chat');
      setSessionId(data.id);
      fetchChatSessions(username);
    } catch (err) {
      console.error('Error creating new chat session:', err);
      setError(err.message || 'Failed to create new chat');
    }
  };

  const handleSessionClick = (id, title) => {
    setSessionId(id);
    setCurrentChatTitle(title);
    setMessages([]);
    setInput('');
    setError('');
    fetchSessionMessages(id);
  };

  const handleDeleteSession = async (id) => {
    if (!apiService.auth.isAuthenticated()) {
      navigate('/signin');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this chat session?')) {
      return;
    }

    try {
      await chat.deleteSession(id);
      if (sessionId === id) {
        handleNewChat();
      } else {
        fetchChatSessions(username);
      }
    } catch (err) {
      console.error('Error deleting chat session:', err);
      setError(err.message || 'Failed to delete session');
    }
  };

  const handleEditTitle = async (id) => {
    if (!apiService.auth.isAuthenticated()) {
      navigate('/signin');
      return;
    }

    if (editedTitle.trim() === '') {
      alert('Chat title cannot be empty.');
      return;
    }

    try {
      await chat.updateTitle(id, editedTitle);
      setIsEditingTitle(null);
      fetchChatSessions(username);
      if (sessionId === id) {
        setCurrentChatTitle(editedTitle);
      }
    } catch (err) {
      console.error('Error updating chat title:', err);
      setError(err.message || 'Failed to update title');
    }
  };

  const handleLogout = () => {
    apiService.auth.logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen flex gradient-bg">
      <div className="w-64 glass-effect p-6 flex flex-col justify-between">
        <div>
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-xl font-bold text-white">FinanceAI</h2>
          </div>

          <button
            className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 mb-4"
            onClick={handleNewChat}
          >
            <Plus className="w-5 h-5" />
            <span>New Chat</span>
          </button>

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
                      onBlur={() => handleEditTitle(session.id)}
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

        <button
          className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200 mt-4"
          onClick={() => navigate('/finance-data')}
        >
          <MessageSquare className="w-5 h-5" />
          <span>Finance Data</span>
        </button>

        <div className="border-t border-gray-700 pt-4">
          <h3 className="text-gray-300 text-sm font-semibold mb-2">Chat Profile</h3>
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate('/profile')}>
            <User className="w-8 h-8 text-gray-400" />
            <span className="text-white">{username}</span>
          </div>
          <button
            className="w-full flex items-center justify-center space-x-2 px-4 py-2 mt-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-200"
            onClick={handleLogout}
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl w-full space-y-8 p-10 glass-effect rounded-xl shadow-lg z-10">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white">AI Financial Assistant Chat - {currentChatTitle}</h2>
          </div>

          {error && (
            <div className="flex items-center space-x-2 p-3 bg-red-500/20 text-red-300 rounded-lg">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          <div className="flex flex-col space-y-4 h-96 overflow-y-auto p-4 bg-white/10 rounded-lg">
            {messages.length === 0 && !isLoading ? (
              <div className="text-gray-400 text-center py-8">
                <Brain className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Ask me anything about your finances!</p>
                <p className="text-xs mt-2">e.g. "What's my spending trend?" or "How can I save more?"</p>
              </div>
            ) : (
              messages.map((msg, index) => (
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
                    <pre className="whitespace-pre-wrap font-sans text-sm">{msg.text}</pre>
                  </div>
                </div>
              ))
            )}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-200 text-gray-800 max-w-[70%] p-3 rounded-lg">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="flex space-x-4">
            <input
              type="text"
              className="flex-grow px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ask your financial assistant..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !isLoading) {
                  handleSendMessage();
                }
              }}
              disabled={isLoading}
            />
            <button
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              onClick={handleSendMessage}
              disabled={isLoading || !input.trim()}
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIChat;
