import React from 'react';
import {
  Box,
  Typography,
  Avatar,
  Button,
  Paper,
  Grid,
  Divider,
} from '@mui/material';

const Profile: React.FC = () => {
  // Example static user data (replace with actual props or API data)
  const user = {
    name: 'Jane Doe',
    email: 'jane.doe@example.com',
    joined: 'March 2024',
    totalEntries: 27,
    recentIntensity: 'Moderate',
  };

  return (
    <Box minHeight="100vh" display="flex" justifyContent="center" alignItems="center" bgcolor="#f4faff" px={2}>
      <Paper
        elevation={6}
        sx={{
          maxWidth: 700,
          width: '100%',
          padding: 4,
          borderRadius: 4,
          backgroundColor: '#ffffff',
        }}
      >
        {/* Profile Header */}
        <Box display="flex" alignItems="center" flexDirection="column" textAlign="center" mb={4}>
          <Avatar sx={{ width: 96, height: 96, bgcolor: '#1565c0', fontSize: 36 }}>
            {user.name[0]}
          </Avatar>
          <Typography variant="h4" fontWeight="bold" mt={2} color="#1565c0">
            {user.name}
          </Typography>
          <Typography variant="body1" color="textSecondary">
            {user.email}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Joined: {user.joined}
          </Typography>
        </Box>

        <Divider sx={{ mb: 3, borderColor: '#90caf9' }} />

        {/* Stats Section */}
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <Paper elevation={2} sx={{ padding: 2 }}>
              <Typography variant="h6" color="#1565c0">
                Total Entries
              </Typography>
              <Typography variant="h4" fontWeight="bold">
                {user.totalEntries}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Paper elevation={2} sx={{ padding: 2 }}>
              <Typography variant="h6" color="#1565c0">
                Recent Migraine Intensity
              </Typography>
              <Typography variant="h4" fontWeight="bold">
                {user.recentIntensity}
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* Actions */}
        <Box mt={5} display="flex" justifyContent="center" gap={2}>
          <Button
            variant="outlined"
            color="primary"
            sx={{ borderColor: '#1565c0', color: '#1565c0' }}
          >
            Edit Profile
          </Button>
          <Button
            variant="contained"
            color="primary"
            href="/dashboard"
            sx={{ backgroundColor: '#1565c0', '&:hover': { backgroundColor: '#0d47a1' } }}
          >
            Go to Dashboard
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default Profile;
