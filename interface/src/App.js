import { useState, useEffect, useRef } from "react";
import {
  askFinanceAssistant,
  fetchSessions,
  createSession,
  fetchMessages,
  addMessage,
  updateChatTitle,
} from "./apiService";
import { AuthProvider, useAuth } from "./AuthContext";
import Login from "./Login";
import Register from "./Register";
import SideMenu from "./SideMenu";
import ChatComponent from "./ChatComponent";
import InsightsDisplay from "./InsightsDisplay";

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
import MenuIcon from "@mui/icons-material/Menu";

function MainApp({ toggleDarkMode }) {
  const { token, logout } = useAuth();
  const [messages, setMessages] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(false);

  const [drawerWidth, setDrawerWidth] = useState(280);
  const [collapsed, setCollapsed] = useState(false);
  const isResizing = useRef(false);

  useEffect(() => {
    document.documentElement.style.setProperty(
      "--drawer-width",
      `${collapsed ? 0 : drawerWidth}px`
    );
  }, [drawerWidth, collapsed]);

  // --- Resize Logic ---
  const startResize = (e) => {
    if (collapsed) return;
    isResizing.current = true;
    document.addEventListener("mousemove", resizeDrawer);
    document.addEventListener("mouseup", stopResize);
  };
  const resizeDrawer = (e) => {
    if (!isResizing.current) return;
    const newWidth = Math.min(Math.max(e.clientX, 180), 480);
    setDrawerWidth(newWidth);
  };
  const stopResize = () => {
    isResizing.current = false;
    document.removeEventListener("mousemove", resizeDrawer);
    document.removeEventListener("mouseup", stopResize);
  };
  const toggleCollapse = () => setCollapsed((prev) => !prev);

  // --- Data Loading ---
  useEffect(() => {
    if (!token) return;
    (async () => {
      const res = await fetchSessions(token);
      setSessions(res);
      if (res.length > 0) setActiveSession(res[0].id);
    })();
  }, [token]);

  useEffect(() => {
    if (!activeSession) return;
    (async () => {
      const res = await fetchMessages(activeSession);
      setMessages(res);
    })();
  }, [activeSession]);

  const handleNewChat = async () => {
    const title = `Chat ${sessions.length + 1}`;
    const newSession = await createSession(token, title);
    setSessions((prev) => [newSession, ...prev]);
    setActiveSession(newSession.id);
    setMessages([]);
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

  const handleSend = async (query) => {
    if (!activeSession) return alert("Please create or select a chat first!");
    setLoading(true);
    const userMsg = { sender: "user", text: query };
    setMessages((msgs) => [...msgs, userMsg]);
    await addMessage(activeSession, "user", query);
    try {
      const data = await askFinanceAssistant(query, token);
      const reply = { sender: "assistant", text: data.answer };
      await addMessage(activeSession, "assistant", data.answer);
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
    <Box sx={{ display: "flex", height: "100vh", minWidth: 0 }}>
      <CssBaseline />

      <Drawer
        variant="permanent"
        sx={{
          width: collapsed ? 0 : drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: collapsed ? 0 : drawerWidth,
            boxSizing: "border-box",
            position: "relative",
            transition: "width 0.25s",
            borderRight: "1px solid rgba(0,0,0,0.12)",
            height: "100vh",
            minWidth: 0,
            display: "flex",
            flexDirection: "column",
            padding: 0,
          },
        }}
        open={!collapsed}
      >
        {!collapsed && (
          <>
            <SideMenu
              onLogout={logout}
              onToggleDarkMode={toggleDarkMode}
              onNewChat={handleNewChat}
              sessions={sessions}
              onSelectSession={(id) => setActiveSession(id)}
              activeSession={activeSession}
              collapsed={collapsed}
              toggleCollapse={toggleCollapse}
              onUpdateTitle={handleUpdateTitle}
            />
            <div
              className="resize-handle"
              onMouseDown={startResize}
              style={{
                width: 6,
                cursor: "col-resize",
                backgroundColor: "transparent",
                position: "absolute",
                top: 0,
                right: 0,
                bottom: 0,
                transition: "background 0.2s",
                zIndex: 10,
              }}
            ></div>
          </>
        )}
      </Drawer>

      {/* Top bar */}
      <AppBar
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          ml: collapsed ? 0 : `${drawerWidth}px`,              // AppBar starts right of Drawer
          width: collapsed ? "100%" : `calc(100% - ${drawerWidth}px)`, // AppBar doesn't overlay Drawer
          transition: "all 0.25s ease",
        }}
      >
        <Toolbar>
          {collapsed && (
            <IconButton color="inherit" onClick={toggleCollapse} edge="start" sx={{ mr: 2 }}>
              <MenuIcon />
            </IconButton>
          )}
          <Typography variant="h6" noWrap>
            Finance AI Assistant
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minWidth: 0,
          height: "100vh",
          p: 3,
          pt: "80px",
          transition: "margin 0.25s ease, width 0.25s ease",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <ChatComponent messages={messages} onSend={handleSend} loading={loading} />
        <InsightsDisplay insights={insights} />
      </Box>
    </Box>
  );
}

function AuthScreen() {
  const [showRegister, setShowRegister] = useState(false);
  return showRegister ? (
    <Container maxWidth="sm">
      <Register onRegistered={() => setShowRegister(false)} />
      <Box textAlign="center" mt={2}>
        <Button onClick={() => setShowRegister(false)}>
          Already have an account? Login
        </Button>
      </Box>
    </Container>
  ) : (
    <Container maxWidth="sm">
      <Login onLoggedIn={() => {}} />
      <Box textAlign="center" mt={2}>
        <Button onClick={() => setShowRegister(true)}>
          Don't have an account? Register
        </Button>
      </Box>
    </Container>
  );
}

function App({ toggleDarkMode }) {
  const { token } = useAuth();
  return token ? <MainApp toggleDarkMode={toggleDarkMode} /> : <AuthScreen />;
}

export default function AppWrapper() {
  const [darkMode, setDarkMode] = useState(false);
  const theme = createTheme({
    palette: {
      mode: darkMode ? "dark" : "light",
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <App toggleDarkMode={() => setDarkMode(!darkMode)} />
      </AuthProvider>
    </ThemeProvider>
  );
}
