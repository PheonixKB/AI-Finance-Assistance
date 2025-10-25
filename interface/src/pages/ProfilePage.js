import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { fetchUserProfile, updateUserProfile } from '../apiService';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  CircularProgress,
  Alert,
  Grid,
} from "@mui/material";

function ProfilePage() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ username: '', email: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getProfile = async () => {
      try {
        setLoading(true);
        const userData = await fetchUserProfile(token);
        setUser(userData);
        setFormData({ username: userData.username, email: userData.email });
      } catch (err) {
        setError('Failed to fetch profile: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      getProfile();
    }
  }, [token]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    try {
      setLoading(true);
      const updatedUser = await updateUserProfile(formData, token);
      setUser(updatedUser);
      setIsEditing(false);
      setMessage('Profile updated successfully!');
    } catch (err) {
      setError('Failed to update profile: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Paper elevation={3} sx={{ p: 4, maxWidth: 600, margin: 'auto' }}>
        <Typography variant="h4" gutterBottom align="center">
          User Profile
        </Typography>

        {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {!isEditing ? (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6">Username: {user.username}</Typography>
            <Typography variant="h6">Email: {user.email}</Typography>
            <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
              <Button variant="contained" onClick={() => setIsEditing(true)}>
                Edit Profile
              </Button>
              <Button variant="outlined" onClick={() => navigate('/')}>
                Back to Chat
              </Button>
            </Box>
          </Box>
        ) : (
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  label="Username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  fullWidth
                  required
                />
              </Grid>
            </Grid>
            <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
              <Button variant="contained" type="submit" disabled={loading}>
                {loading ? <CircularProgress size={24} /> : 'Save Changes'}
              </Button>
              <Button variant="outlined" onClick={() => setIsEditing(false)} disabled={loading}>
                Cancel
              </Button>
            </Box>
          </Box>
        )}
      </Paper>
    </Box>
  );
}

export default ProfilePage;
