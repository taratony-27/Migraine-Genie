import React, { useState } from 'react';
import { Box, TextField, Typography, Button, Link } from '@mui/material';

interface LoginProps {
  onSubmit: (email: string, password: string) => void;
  onSwitch: () => void;
}

const Login: React.FC<LoginProps> = ({ onSubmit, onSwitch }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(email, password);
  };

  return (
    <Box component="form" onSubmit={handleSubmit} width="100%" maxWidth="400px" textAlign="center">
      <Typography variant="h4" mb={3}>
        Login to Your Account
      </Typography>
      <TextField
        fullWidth label="Email" margin="normal"
        value={email} onChange={(e) => setEmail(e.target.value)}
      />
      <TextField
        fullWidth label="Password" type="password" margin="normal"
        value={password} onChange={(e) => setPassword(e.target.value)}
      />
      <Button fullWidth type="submit" variant="contained" color="primary" sx={{ mt: 3 }}>
        Login
      </Button>
      <Typography mt={2}>
        No account?{' '}
        <Link component="button" onClick={onSwitch}>
          Sign up
        </Link>
      </Typography>
    </Box>
  );
};

export default Login;
