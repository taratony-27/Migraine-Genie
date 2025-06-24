import React, { useState } from 'react';
import { Box, TextField, Typography, Button, Link, MenuItem } from '@mui/material';

interface SignupProps {
  onSubmit: (name: string, email: string, password: string, dob: string, gender: string) => void;
  onSwitch: () => void;
}

const Signup: React.FC<SignupProps> = ({ onSubmit, onSwitch }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    dateOfBirth: '',
    gender: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const { name, email, password, dateOfBirth, gender } = formData;
    onSubmit(name, email, password, dateOfBirth, gender);
  };

  return (
    <Box component="form" onSubmit={handleSubmit} width="100%" maxWidth="400px" textAlign="center">
      <Typography variant="h4" mb={3}>
        Create an Account
      </Typography>
      <TextField
        fullWidth label="Full Name" name="name" margin="normal"
        value={formData.name} onChange={handleChange}
      />
      <TextField
        fullWidth label="Email" name="email" margin="normal"
        value={formData.email} onChange={handleChange}
      />
      <TextField
        fullWidth label="Password" name="password" type="password" margin="normal"
        value={formData.password} onChange={handleChange}
      />
      <TextField
        fullWidth name="dateOfBirth" label="Date of Birth" type="date" margin="normal"
        InputLabelProps={{ shrink: true }}
        value={formData.dateOfBirth} onChange={handleChange}
      />
      <TextField
        fullWidth name="gender" label="Gender" select margin="normal"
        value={formData.gender} onChange={handleChange}
      >
        <MenuItem value="male">Male</MenuItem>
        <MenuItem value="female">Female</MenuItem>
        <MenuItem value="other">Other</MenuItem>
      </TextField>
      <Button fullWidth type="submit" variant="contained" color="primary" sx={{ mt: 3 }}>
        Sign Up
      </Button>
      <Typography mt={2}>
        Already have an account?{' '}
        <Link component="button" onClick={onSwitch}>
          Log in
        </Link>
      </Typography>
    </Box>
  );
};

export default Signup;
