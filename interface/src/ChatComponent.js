import { useState, useRef, useEffect } from "react";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";

function ChatComponent({ messages, onSend, loading }) {
  const [input, setInput] = useState("");
  const bottomRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;
    onSend(input);
    setInput("");
  };

  useEffect(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), [messages]);

  return (
    <Box>
      <List sx={{ minHeight: 180, maxHeight: 220, overflowY: "auto", background: "#f4f4fa", borderRadius: 2, px: 2, mb: 2 }}>
        {messages.map((msg, idx) => (
          <ListItem key={idx}>
            <Box>
              <Typography variant="subtitle2" color={msg.sender === "user" ? "primary" : "secondary"}>
                {msg.sender === "user" ? "You" : "Assistant"}:
              </Typography>
              <Typography variant="body1">{msg.text}</Typography>
            </Box>
          </ListItem>
        ))}
        <div ref={bottomRef} />
      </List>
      <form onSubmit={handleSubmit} style={{ display: "flex", gap: 12 }}>
        <TextField variant="outlined" fullWidth value={input} onChange={e => setInput(e.target.value)} placeholder="Ask your finance assistant..." disabled={loading} />
        <Button variant="contained" color="primary" type="submit" disabled={loading}>
          {loading ? <CircularProgress size="1.5rem" /> : "Send"}
        </Button>
      </form>
    </Box>
  );
}

export default ChatComponent;
