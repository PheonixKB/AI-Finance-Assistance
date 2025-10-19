// frontend/src/ChatComponent.js
import { useState, useRef, useEffect } from "react";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import SendIcon from "@mui/icons-material/Send";
import CircularProgress from "@mui/material/CircularProgress";
import ReactMarkdown from "react-markdown";
import { useTheme } from "@mui/material/styles";
import "./ChatComponent.css";

function ChatComponent({ messages, onSend, loading }) {
  const [input, setInput] = useState("");
  const bottomRef = useRef(null);
  const theme = useTheme();

  // ✅ Scroll to bottom when messages update
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ✅ Handle Enter / Shift+Enter
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;
    onSend(input);
    setInput("");
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "70vh",
        borderRadius: 3,
        p: 2,
        bgcolor:
          theme.palette.mode === "dark"
            ? "rgba(255,255,255,0.06)"
            : "rgba(0,0,0,0.03)",
      }}
    >
      {/* Message List */}
      <Box
        sx={{
          flexGrow: 1,
          overflowY: "auto",
          mb: 2,
          px: 1,
          display: "flex",
          flexDirection: "column",
          gap: 1.5,
        }}
      >
        {messages.map((msg, idx) => (
          <Box
            key={idx}
            className={`message ${msg.sender}`}
            sx={{
              alignSelf: msg.sender === "user" ? "flex-end" : "flex-start",
              bgcolor:
                msg.sender === "user"
                  ? theme.palette.primary.main
                  : theme.palette.mode === "dark"
                  ? "#333"
                  : "#e0e0e0",
              color:
                msg.sender === "user"
                  ? theme.palette.primary.contrastText
                  : theme.palette.text.primary,
              p: 1.5,
              borderRadius: 2,
              maxWidth: "80%",
              wordWrap: "break-word",
              whiteSpace: "pre-wrap",
              boxShadow:
                msg.sender === "user"
                  ? "0 2px 6px rgba(0,0,0,0.2)"
                  : "0 2px 6px rgba(0,0,0,0.1)",
            }}
          >
            <ReactMarkdown>{msg.text}</ReactMarkdown>
          </Box>
        ))}
        <div ref={bottomRef} />
      </Box>

      {/* Input Box */}
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{ display: "flex", gap: 1, alignItems: "center" }}
      >
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Send a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          multiline
          maxRows={3}
          disabled={loading}
        />
        <IconButton
          color="primary"
          type="submit"
          disabled={loading || !input.trim()}
        >
          {loading ? <CircularProgress size="1.5rem" /> : <SendIcon />}
        </IconButton>
      </Box>
    </Box>
  );
}

export default ChatComponent;
