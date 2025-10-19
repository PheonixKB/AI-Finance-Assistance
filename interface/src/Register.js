// interface/src/Register.js
import { useState } from "react";
import { register } from "./apiService";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";

function Register({ onRegistered }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr(""); setSuccess("");
    try {
      await register(username, password);
      setSuccess("Registered! Please login.");
      onRegistered();
    } catch (error) {
      setErr("Register failed: " + error.message);
    }
  };

  return (
    <Box mt={8} maxWidth={400} mx="auto">
      <Typography variant="h5" gutterBottom>Register Account</Typography>
      {err && <Alert severity="error" sx={{ mb: 2 }}>{err}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
      <form onSubmit={handleSubmit}>
        <TextField label="Username" fullWidth margin="normal" value={username} onChange={e => setUsername(e.target.value)} />
        <TextField label="Password" type="password" fullWidth margin="normal" value={password} onChange={e => setPassword(e.target.value)} inputProps={{ maxLength: 72 }} />
        <Button variant="contained" color="primary" type="submit" fullWidth sx={{ mt: 2 }}>Register</Button>
      </form>
    </Box>
  );
}

export default Register;
