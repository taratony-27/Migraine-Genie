import React from 'react';
import { Box, Typography, Button, TextField, Paper } from '@mui/material';

const Home: React.FC = () => {
  return (
    <Box 
      display="flex" 
      flexDirection="row" 
      minHeight="100vh" 
      justifyContent="center" 
      alignItems="center"
      sx={{ backgroundColor: '#e3f2fd', padding: 4 }}
    >
      {/* Left Side - Welcome Message (50%) */}
      <Box 
        flex={1}  // Keeps it truly 50% of the screen
        display="flex" 
        flexDirection="column" 
        justifyContent="center" 
        alignItems="flex-start"  // Aligns text to the left to use full width
        sx={{ paddingLeft: 8, paddingRight: 4 }} // Adds spacing without shifting the balance
      >
        <Typography variant="h3" fontWeight="bold" color="#1565c0">
          Welcome to Migraine Genie
        </Typography>
        <Typography 
          variant="body1" 
          color="textSecondary" 
          textAlign="left" 
          sx={{ marginTop: 2, maxWidth: '90%', marginLeft: 4 }} // Ensures text is slightly shifted but doesn't shrink content area
        >
          Your personalized migraine relief assistant. Track symptoms, get tailored recommendations, 
          and take control of your migraine management journey.
        </Typography>
      </Box>
      
      {/* Right Side - Login Box (50%) */}
      <Box 
        flex={1}  // Ensures right side also remains 50%
        display="flex" 
        justifyContent="center"  // Centers the login box properly
        alignItems="center"
      >
        <Paper 
          elevation={8} 
          sx={{ 
            maxWidth: 400,
            width: '100%',
            minHeight: 450, 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center',
            padding: 3, 
            borderRadius: 3, 
            backgroundColor: '#ffffff',
            border: '2px solid #1565c0'
          }}
        >
          <Typography variant="h5" fontWeight="bold" gutterBottom color="#1565c0">
            Login
          </Typography>
          <Box width="90%">
            <TextField
              label="Email"
              variant="outlined"
              fullWidth
              margin="dense"
              name="email"
              type="email"
              autoComplete="email"
            />
            <TextField
              label="Password"
              variant="outlined"
              fullWidth
              margin="dense"
              name="password"
              type="password"
              autoComplete="current-password"
            />
            <Button
              variant="contained"
              color="primary"
              fullWidth
              sx={{ marginTop: 2, backgroundColor: '#1565c0', '&:hover': { backgroundColor: '#0d47a1' } }}
              href='/dashboard'
            >
              Login
            </Button>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

export default Home;
