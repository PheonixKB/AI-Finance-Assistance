// interface/src/App.js
import { useState, useEffect } from "react";
import { askFinanceAssistant, fetchSessions, createSession, fetchMessages, addMessage } from "./apiService";
import { AuthProvider, useAuth } from "./AuthContext";
import Login from "./Login";
import Register from "./Register";
import SideMenu from "./SideMenu";
import ChatComponent from "./ChatComponent";
import InsightsDisplay from "./InsightsDisplay";

import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import Button from "@mui/material/Button";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { CssBaseline } from "@mui/material";

const initialPermissions = {
  assets: true,
  liabilities: true,
  transactions: false,
  investments: false,
  epf: false,
  creditScore: false,
};

function MainApp({ toggleDarkMode, darkMode }) {
  const { token, logout } = useAuth();
  const [permissions, setPermissions] = useState(initialPermissions);
  const [messages, setMessages] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load chat sessions
  useEffect(() => {
    if (!token) return;
    const loadSessions = async () => {
      try {
        const res = await fetchSessions(token);
        setSessions(res);
        if (res.length > 0) setActiveSession(res[0].id);
      } catch (err) {
        console.error("Failed to load sessions:", err);
      }
    };
    loadSessions();
  }, [token]);

  // Load messages when session changes
  useEffect(() => {
    if (!activeSession) return;
    const loadMessages = async () => {
      try {
        const res = await fetchMessages(activeSession);
        setMessages(res);
      } catch (err) {
        console.error("Failed to load messages:", err);
      }
    };
    loadMessages();
  }, [activeSession]);

  const handlePermissionChange = (newPermissions) => setPermissions(newPermissions);

  const handleNewChat = async () => {
    if (!token) return;
    const title = `Chat ${sessions.length + 1}`;
    try {
      const newSession = await createSession(token, title);
      // Ensure new session object matches shape from backend: {id, title}
      setSessions((prev) => [newSession, ...prev]);
      setActiveSession(newSession.id);
      setMessages([]);
    } catch (err) {
      console.error("Failed to create session:", err);
    }
  };



  const handleSend = async (query) => {
    if (!activeSession) return alert("Please create or select a chat first!");

    setLoading(true);
    const userMsg = { sender: "user", text: query };
    setMessages((msgs) => [...msgs, userMsg]);

    await addMessage(activeSession, "user", query);

    try {
      const data = await askFinanceAssistant(query, permissions, token);
      const reply = { sender: "assistant", text: data.answer };
      await addMessage(activeSession, "assistant", data.answer);
      setMessages((msgs) => [...msgs, reply]);
      setInsights(data.insights || []);
    } catch (err) {
      setMessages((msgs) => [...msgs, { sender: "assistant", text: "Error talking to backend!" }]);
      setInsights([]);
    }
    setLoading(false);
  };

  return (
    <Container maxWidth="sm">
      <Paper elevation={4} sx={{ p: 4, mt: 6, borderRadius: 4, bgcolor: "background.paper" }}>
        <Box display="flex" alignItems="center" mb={2}>
          <img src="/logo.png" alt="logo" height={40} style={{ marginRight: 16 }} />
          <Typography variant="h4" color="primary">Finance AI Assistant</Typography>
        </Box>

        <SideMenu
          onLogout={logout}
          onToggleDarkMode={toggleDarkMode}
          permissions={permissions}
          onPermissionChange={handlePermissionChange}
          onNewChat={handleNewChat}
          sessions={sessions}
          onSelectSession={(id) => setActiveSession(id)}
        />

        <Divider sx={{ my: 2 }} />
        <ChatComponent messages={messages} onSend={handleSend} loading={loading} />
        <InsightsDisplay insights={insights} />
      </Paper>
    </Container>
  );
}

function AuthScreen() {
  const [showRegister, setShowRegister] = useState(false);
  if (showRegister) {
    return (
      <Container maxWidth="sm">
        <Register onRegistered={() => setShowRegister(false)} />
        <Box textAlign="center" mt={2}>
          <Button variant="text" onClick={() => setShowRegister(false)}>
            Already have an account? Login
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm">
      <Login onLoggedIn={() => {}} />
      <Box textAlign="center" mt={2}>
        <Button variant="text" onClick={() => setShowRegister(true)}>
          Don't have an account? Register
        </Button>
      </Box>
    </Container>
  );
}

function App({ toggleDarkMode, darkMode }) {
  const { token } = useAuth();
  if (!token) return <AuthScreen />;
  return <MainApp toggleDarkMode={toggleDarkMode} darkMode={darkMode} />;
}

export default function AppWrapper() {
  const [darkMode, setDarkMode] = useState(false);
  const theme = createTheme({ palette: { mode: darkMode ? "dark" : "light" } });
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <App toggleDarkMode={() => setDarkMode(!darkMode)} darkMode={darkMode} />
      </AuthProvider>
    </ThemeProvider>
  );
}
