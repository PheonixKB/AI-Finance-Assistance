// interface/src/ChatComponent.js
import { useState, useRef, useEffect } from "react";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import SendIcon from "@mui/icons-material/Send";
import CircularProgress from "@mui/material/CircularProgress";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import Tooltip from "@mui/material/Tooltip";
import ReactMarkdown from "react-markdown";
import { useTheme } from "@mui/material/styles";
import "./ChatComponent.css";
import Avatar from "@mui/material/Avatar";
import Stack from "@mui/material/Stack";
import PersonIcon from "@mui/icons-material/Person";
import AssistantIcon from "@mui/icons-material/Assistant";


function ChatComponent({ messages, onSend, loading}) {
  const [input, setInput] = useState("");
  const bottomRef = useRef(null);
  const theme = useTheme();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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

  // Copy full chat
  const handleCopyChat = () => {
    const text = messages
      .map(
        (msg) =>
          `${msg.sender === "user" ? "You" : "AI"}: ${msg.text.replace(/\n+/g, " ")}`
      )
      .join("\n\n");
    navigator.clipboard.writeText(text);
    alert("Chat copied to clipboard!");
  };

  // Copy one message
  const handleCopyMsg = (msg) => {
    navigator.clipboard.writeText(msg.text);
    alert("Message copied!");
  };

    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          height: "100%", // Use 100% height to allow centering
          borderRadius: 3,
          p: 2,
          bgcolor:
            theme.palette.mode === "dark"
              ? "rgba(255,255,255,0.06)"
              : "rgba(0,0,0,0.03)",
          justifyContent: messages.length === 0 ? "center" : "flex-start", // Center if no messages
          alignItems: messages.length === 0 ? "center" : "stretch", // Center if no messages
        }}
      >
        {messages.length > 0 && (
          <>
            {/* Copy Chat Button */}
            <Box display="flex" justifyContent="flex-end" mb={1}>
              <Tooltip title="Copy chat as text">
                <IconButton size="small" onClick={handleCopyChat} aria-label="Copy chat">
                  <ContentCopyIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
  
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
                <Stack
                  key={idx}
                  direction="row"
                  spacing={1.5}
                  alignItems="flex-start"
                  justifyContent={msg.sender === "user" ? "flex-end" : "flex-start"}
                >
                  {msg.sender === "assistant" && (
                    <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                      <AssistantIcon />
                    </Avatar>
                  )}
                  <Box
                    className={`message ${msg.sender}`}
                    sx={{
                      position: "relative",
                      bgcolor:
                        msg.sender === "user"
                          ? theme.palette.primary.main
                          : theme.palette.background.paper,
                      color:
                        msg.sender === "user"
                          ? theme.palette.primary.contrastText
                          : theme.palette.text.primary,
                      p: 1.5,
                      borderRadius: 2,
                      maxWidth: "80%",
                      wordWrap: "break-word",
                      whiteSpace: "pre-wrap",
                      boxShadow: 1,
                    }}
                  >
                    {/* Message content */}
                    <div className="markdown-content">
                      <ReactMarkdown>{msg.text}</ReactMarkdown>
                    </div>
                    {/* Copy single message button */}
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: msg.sender === "user" ? "flex-end" : "flex-start",
                        mt: 0.5,
                      }}
                    >
                      <Tooltip title="Copy message">
                        <IconButton
                          size="small"
                          onClick={() => handleCopyMsg(msg)}
                          sx={{
                            opacity: 0.6,
                            "&:hover": { opacity: 1 },
                            transform: "scale(0.9)",
                          }}
                        >
                          <ContentCopyIcon fontSize="inherit" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>
                  {msg.sender === "user" && (
                    <Avatar>
                      <PersonIcon />
                    </Avatar>
                  )}
                </Stack>
              ))}
            </Box>
          </>
        )}
  
        {/* Input Box */}
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            display: "flex",
            gap: 1,
            alignItems: "center",
            width: messages.length === 0 ? "50%" : "100%", // Adjust width if no messages
            maxWidth: messages.length === 0 ? 600 : "none", // Max width for centering
          }}
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
    );}

export default ChatComponent;

