// fronend/src/Login.js
import { useState } from "react";
import { useAuth } from "./AuthContext";
import { login } from "./apiService";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";

function Login({ onLoggedIn }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const { login: doLogin } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    try {
      const data = await login(username, password);
      doLogin(data.access_token);
      onLoggedIn();
    } catch (error) {
      setErr("Login failed: " + error.message);
    }
  };

  return (
    <Box mt={8} maxWidth={400} mx="auto">
      <Typography variant="h5" gutterBottom>Login to Finance Assistant</Typography>
      {err && <Alert severity="error" sx={{ mb: 2 }}>{err}</Alert>}
      <form onSubmit={handleSubmit}>
        <TextField label="Username" fullWidth margin="normal" value={username} onChange={e => setUsername(e.target.value)} />
        <TextField label="Password" type="password" fullWidth margin="normal" value={password} onChange={e => setPassword(e.target.value)} />
        <Button variant="contained" color="primary" type="submit" fullWidth sx={{ mt: 2 }}>Login</Button>
      </form>
    </Box>
  );
}

export default Login;
