import { useState } from "react";
import PermissionToggle from "./PermissionToggle";
import ChatComponent from "./ChatComponent";
import InsightsDisplay from "./InsightsDisplay";
import { askFinanceAssistant } from "./apiService";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import Button from "@mui/material/Button";
import { AuthProvider, useAuth } from "./AuthContext";
import Login from "../Front/Login";
import Register from "./Register";

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
  const [showPermissions, setShowPermissions] = useState(false);
  const [messages, setMessages] = useState([
    { sender: "assistant", text: "Ask me anything about your finances!" },
  ]);
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(false);

  const handlePermissionChange = (newPermissions) => setPermissions(newPermissions);

  const handleSend = async (query) => {
    setLoading(true);
    setMessages((msgs) => [...msgs, { sender: "user", text: query }]);
    try {
      const data = await askFinanceAssistant(query, permissions, token);
      setMessages((msgs) => [...msgs, { sender: "assistant", text: data.answer }]);
      setInsights(data.insights || []);
    } catch (err) {
      setMessages((msgs) => [
        ...msgs,
        { sender: "assistant", text: "Error talking to backend!" },
      ]);
      setInsights([]);
    }
    setLoading(false);
  };

  return (
    <Container maxWidth="sm">
      <Paper elevation={4} sx={{ p: 4, mt: 6, borderRadius: 4, bgcolor: "background.paper" }}>
        <Box display="flex" alignItems="center" mb={2}>
          <img src="/logo192.png" alt="logo" height={40} style={{ marginRight: 16 }} />
          <Typography variant="h4" color="primary">Finance AI Assistant</Typography>
        </Box>

        <Box display="flex" gap={2} mb={2}>
          <Button variant="text" color="secondary" onClick={logout}>Logout</Button>
          <Button variant="contained" onClick={toggleDarkMode}>
            {darkMode ? "Light Mode" : "Dark Mode"}
          </Button>
        </Box>

        <Button
          variant="outlined"
          onClick={() => setShowPermissions(!showPermissions)}
          sx={{ mb: 2 }}
        >
          {showPermissions ? "Hide Permissions" : "Show Permissions"}
        </Button>

        {showPermissions && (
          <PermissionToggle permissions={permissions} onChange={handlePermissionChange} />
        )}

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
          <Button variant="text" onClick={() => setShowRegister(false)}>Already have an account? Login</Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm">
      <Login onLoggedIn={() => {}} />
      <Box textAlign="center" mt={2}>
        <Button variant="text" onClick={() => setShowRegister(true)}>Don't have an account? Register</Button>
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
