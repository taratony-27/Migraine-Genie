import React, { useState, useEffect } from 'react';
import {
  Box, TextField, Typography, Button, Link, MenuItem, Snackbar, Alert, Paper
} from '@mui/material';
import api from '../services/api';

interface AuthProps {
  onSwitchMode?: () => void;
}

const Auth: React.FC<AuthProps> = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    dateOfBirth: '',
    gender: '',
  });

  const [alert, setAlert] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  // If a token already exists (e.g., returning user), attach it to the shared client once.
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (email: string, password: string) => {
    try {
      const res = await api.post('/api/users/login', { email, password });
      const { token, user } = res.data;

      // Persist auth and set header on the shared client for subsequent calls
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      setAlert({ open: true, message: 'Login successful!', severity: 'success' });
      setTimeout(() => (window.location.href = '/dashboard'), 1000);
    } catch (err: any) {
      setAlert({
        open: true,
        message: err?.response?.data?.message || 'Login failed',
        severity: 'error',
      });
    }
  };

  const handleSignup = async () => {
    const { name, email, password, dateOfBirth, gender } = formData;
    try {
      await api.post('/api/users/signup', {
        name,
        email,
        password,
        date_of_birth: dateOfBirth,
        gender,
      });
      setAlert({ open: true, message: 'Signup successful! Please log in.', severity: 'success' });
      setIsLogin(true);
    } catch (err: any) {
      setAlert({
        open: true,
        message: err?.response?.data?.message || 'Signup failed',
        severity: 'error',
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    isLogin ? handleLogin(formData.email, formData.password) : handleSignup();
  };

  return (
    <>
      <Paper
        elevation={8}
        sx={{
          maxWidth: 360,
          width: '100%',
          minHeight: 400,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          p: 4,
          borderRadius: 3,
          backgroundColor: '#fff',
          border: '2px solid #1565c0',
        }}
      >
        <Typography variant="h5" fontWeight="bold" gutterBottom color="#1565c0">
          {isLogin ? 'Login' : 'Sign Up'}
        </Typography>

        <Box width="90%" component="form" onSubmit={handleSubmit}>
          {!isLogin && (
            <>
              <TextField
                label="Full Name"
                name="name"
                fullWidth
                margin="dense"
                value={formData.name}
                onChange={handleChange}
              />
              <TextField
                label="Date of Birth"
                name="dateOfBirth"
                type="date"
                fullWidth
                margin="dense"
                InputLabelProps={{ shrink: true }}
                value={formData.dateOfBirth}
                onChange={handleChange}
              />
              <TextField
                label="Gender"
                name="gender"
                select
                fullWidth
                margin="dense"
                value={formData.gender}
                onChange={handleChange}
              >
                <MenuItem value="male">Male</MenuItem>
                <MenuItem value="female">Female</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </TextField>
            </>
          )}
          <TextField
            label="Email"
            name="email"
            type="email"
            fullWidth
            margin="dense"
            value={formData.email}
            onChange={handleChange}
          />
          <TextField
            label="Password"
            name="password"
            type="password"
            fullWidth
            margin="dense"
            value={formData.password}
            onChange={handleChange}
          />
          <Button type="submit" fullWidth variant="contained" color="primary" sx={{ mt: 2 }}>
            {isLogin ? 'Login' : 'Sign Up'}
          </Button>
          <Typography variant="body2" mt={2} textAlign="center">
            {isLogin ? (
              <>
                Don&apos;t have an account?{' '}
                <Link
                  component="button"
                  onClick={(e) => {
                    e.preventDefault();
                    setIsLogin(false);
                  }}
                >
                  Sign up
                </Link>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <Link
                  component="button"
                  onClick={(e) => {
                    e.preventDefault();
                    setIsLogin(true);
                  }}
                >
                  Log in
                </Link>
              </>
            )}
          </Typography>
        </Box>
      </Paper>

      <Snackbar
        open={alert.open}
        autoHideDuration={3000}
        onClose={() => setAlert({ ...alert, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setAlert({ ...alert, open: false })}
          severity={alert.severity}
          sx={{ width: '100%' }}
        >
          {alert.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default Auth;
