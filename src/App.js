import React, { useState } from "react";
import PermissionToggle from "./PermissionToggle";
import ChatComponent from "./ChatComponent";
import InsightsDisplay from "./InsightsDisplay";
import { askFinanceAssistant } from "./apiService";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";

const initialPermissions = {
  assets: true,
  liabilities: true,
  transactions: false,
  investments: false,
  epf: false,
  creditScore: false
};

function App() {
  const [permissions, setPermissions] = useState(initialPermissions);
  const [messages, setMessages] = useState([
    { sender: "assistant", text: "Ask me anything about your finances!" }
  ]);
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(false);

  const handlePermissionChange = (newPermissions) => {
    setPermissions(newPermissions);
  };

  const handleSend = async (query) => {
    setLoading(true);
    setMessages((msgs) => [...msgs, { sender: "user", text: query }]);
    try {
      const data = await askFinanceAssistant(query, permissions);
      setMessages((msgs) => [
        ...msgs,
        { sender: "assistant", text: data.answer }
      ]);
      setInsights(data.insights || []);
    } catch (err) {
      setMessages((msgs) => [
        ...msgs,
        { sender: "assistant", text: "Error talking to backend!" }
      ]);
      setInsights([]);
    }
    setLoading(false);
  };

  return (
    <Container maxWidth="sm">
      <Paper elevation={4} sx={{ p: 4, mt: 6, borderRadius: 4, bgcolor: "#fafbff" }}>
        <Box display="flex" alignItems="center" mb={2}>
          <img src="/logo192.png" alt="logo" height={40} style={{ marginRight: 16 }} />
          <Typography variant="h4" color="primary">Finance AI Assistant</Typography>
        </Box>
        <PermissionToggle permissions={permissions} onChange={handlePermissionChange} />
        <Divider sx={{ my: 2 }}/>
        <ChatComponent messages={messages} onSend={handleSend} loading={loading} />
        <InsightsDisplay insights={insights} />
      </Paper>
    </Container>
  );
}

export default App;
