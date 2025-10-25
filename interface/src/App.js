import { useState, useEffect } from "react";
import {
  Box,
  Drawer,
  CssBaseline,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Container,
  Button,
  createTheme,
  ThemeProvider,
} from "@mui/material";
import {
  askFinanceAssistant,
  fetchSessions,
  createSession,
  fetchMessages,
  addMessage,
  updateChatTitle,
  deleteChatSession,
} from "./apiService";
import { AuthProvider, useAuth } from "./AuthContext";
import Login from "./auth/Login";
import Register from "./auth/Register";
import SideMenu from "./components/SideMenu";
import ChatComponent from "./components/ChatComponent";
import InsightsDisplay from "./components/InsightsDisplay";
import ProfilePage from "./pages/ProfilePage"; // Import ProfilePage
import UploadPage from "./pages/UploadPage"; // Import UploadPage
import Layout from "./components/Layout";
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from "react-router-dom";
function AppContent({ toggleDarkMode }) {
  const { token, logout } = useAuth();
  const [messages, setMessages] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(false);

  // --- Data Loading ---
  useEffect(() => {
    if (!token) return;
    console.log("Fetching sessions or creating new chat...");
    (async () => {
      try {
        const res = await fetchSessions(token);
        console.log("Fetched sessions:", res);
        setSessions(res);
        if (res.length > 0) {
          setActiveSession(res[0].id);
        } else {
          // Automatically create a new chat session if none exist
          const newSession = await createSession(token, "New Chat");
          console.log("Creating new session:", newSession);
          setSessions([newSession]);
          setActiveSession(newSession.id);
        }
      } catch (error) {
        console.error("Error fetching or creating sessions:", error);
      }
    })();
  }, [token, logout]);

  useEffect(() => {
    if (!activeSession) return;
    (async () => {
      const res = await fetchMessages(activeSession, token);
      setMessages(res);
    })();
  }, [activeSession, token]);

  const handleNewChat = async () => {
    try {
      const title = `Chat ${sessions.length + 1}`;
      const newSession = await createSession(token, title);
      console.log("New session created:", newSession);
      const updatedSessions = await fetchSessions(token);
      setSessions(updatedSessions);
      setActiveSession(newSession.id);
      setMessages([]);
    } catch (error) {
      console.error("Error creating new chat session:", error);
      alert("Failed to create new chat session: " + error.message);
    }
  };

  const handleUpdateTitle = async (sessionId, newTitle) => {
    try {
      await updateChatTitle(sessionId, newTitle, token);
      setSessions((prev) =>
        prev.map((s) => (s.id === sessionId ? { ...s, title: newTitle } : s))
      );
    } catch (error) {
      console.error("Failed to update title:", error);
    }
  };

  const handleDeleteSession = async (sessionId) => {
    try {
      await deleteChatSession(sessionId, token);
      setSessions((prevSessions) => {
        const updatedSessions = prevSessions.filter((s) => s.id !== sessionId);
        if (activeSession === sessionId) {
          const deletedIndex = prevSessions.findIndex((s) => s.id === sessionId);
          if (deletedIndex > 0) {
            setActiveSession(prevSessions[deletedIndex - 1].id);
          } else if (updatedSessions.length > 0) {
            setActiveSession(updatedSessions[0].id);
          } else {
            setActiveSession(null);
            setMessages([]);
          }
        }
        return updatedSessions;
      });
    } catch (error) {
      console.error("Failed to delete session:", error);
    }
  };

  const handleSend = async (query) => {
    if (!activeSession) return alert("Please create or select a chat first!");
    setLoading(true);
    const userMsg = { sender: "user", text: query };
    setMessages((msgs) => [...msgs, userMsg]);
    await addMessage(activeSession, "user", query, token);
    try {
      const data = await askFinanceAssistant(query, token);
      const reply = { sender: "assistant", text: data.answer };
      await addMessage(activeSession, "assistant", data.answer, token);
      setMessages((msgs) => [...msgs, reply]);
      setInsights(data.insights || []);
    } catch {
      setMessages((msgs) => [
        ...msgs,
        { sender: "assistant", text: "Error!" },
      ]);
    }
    setLoading(false);
  };

  return (
    <Routes>
      <Route path="/login" element={token ? <Navigate to="/" /> : <LoginScreen toggleDarkMode={toggleDarkMode} />} />
      <Route path="/register" element={token ? <Navigate to="/" /> : <RegisterScreen toggleDarkMode={toggleDarkMode} />} />
      <Route path="/profile" element={token ? <Layout toggleDarkMode={toggleDarkMode} onNewChat={handleNewChat} sessions={sessions} onSelectSession={setActiveSession} activeSession={activeSession} onUpdateTitle={handleUpdateTitle} onDeleteSession={handleDeleteSession}><ProfilePage /></Layout> : <Navigate to="/login" />} />
      <Route path="/upload" element={token ? <Layout toggleDarkMode={toggleDarkMode} onNewChat={handleNewChat} sessions={sessions} onSelectSession={setActiveSession} activeSession={activeSession} onUpdateTitle={handleUpdateTitle} onDeleteSession={handleDeleteSession}><UploadPage onSubmitting={() => {}} /></Layout> : <Navigate to="/login" />} />
      <Route
        path="/"
        element={
          token ? (
            <Layout
              toggleDarkMode={toggleDarkMode}
              onNewChat={handleNewChat}
              sessions={sessions}
              onSelectSession={setActiveSession}
              activeSession={activeSession}
              onUpdateTitle={handleUpdateTitle}
              onDeleteSession={handleDeleteSession}
            >
              <MainAppContent
                messages={messages}
                onSend={handleSend}
                loading={loading}
                insights={insights}
              />
            </Layout>
          ) : (
            <Navigate to="/login" />
          )
        }
      />
    </Routes>
  );
}

function MainAppContent({ messages, onSend, loading, insights }) {
  return (
    <>
      <ChatComponent messages={messages} onSend={onSend} loading={loading} />
      <InsightsDisplay insights={insights} />
    </>
  );
}

function LoginScreen({ toggleDarkMode }) {
  const navigate = useNavigate();
  return (
    <Container maxWidth="sm">
      <Login onLoggedIn={() => {}} toggleDarkMode={toggleDarkMode} onShowRegister={() => navigate("/register")} />
      <Box textAlign="center" mt={2}>
        <Button onClick={() => navigate("/register")}>
          Don't have an account? Register
        </Button>
      </Box>
    </Container>
  );
}

function RegisterScreen({ toggleDarkMode }) {
  const navigate = useNavigate();
  return (
    <Container maxWidth="sm">
      <Register onRegistered={() => navigate("/login")} toggleDarkMode={toggleDarkMode} onShowLogin={() => navigate("/login")} />
      <Box textAlign="center" mt={2}>
        <Button onClick={() => navigate("/login")}>
          Already have an account? Login
        </Button>
      </Box>
    </Container>
  );
}

export default function AppWrapper() {
  const [darkMode, setDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem("theme");
    return savedTheme === "dark";
  });
  const theme = createTheme({
    palette: {
      mode: darkMode ? "dark" : "light",
    },
  });

  const toggleDarkMode = () => {
    setDarkMode((prevMode) => {
      const newMode = !prevMode;
      localStorage.setItem("theme", newMode ? "dark" : "light");
      return newMode;
    });
  };

  return (
    <Router>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
          <AppContent toggleDarkMode={toggleDarkMode} />
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}
