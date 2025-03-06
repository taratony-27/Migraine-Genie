import React from 'react';
import { Box, Typography, Paper, Avatar, Grid, Container } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const navigate = useNavigate(); // For navigation on card click

  // Feature cards data
  const features = [
    { title: "Daily Log", path: "/daily-log" },
    { title: "Daily Trigger Predictions", path: "/trigger-predictions" },
    { title: "Wellness Program", path: "/wellness-program" },
    { title: "AI Assistant", path: "/ai-assistant" }
  ];

  return (
    <Box display="flex" flexDirection="column" minHeight="100vh" bgcolor="#f5f5f5" p={3}>
      
      {/* Profile Section */}
      <Box display="flex" flexDirection="column" alignItems="center" mb={4}>
        <Avatar 
          src="/profile.jpg"  // Replace with actual profile image URL
          alt="Profile Image"
          sx={{ width: 100, height: 100, mb: 2 }}
        />
        <Typography variant="h5" fontWeight="bold">
          John Doe
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Migraine Management Dashboard
        </Typography>
      </Box>

      {/* Wrapped in Container (80% Width) */}
      <Container maxWidth="md" sx={{ width: "80%" }}>
        <Grid container spacing={3} justifyContent="center">
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} key={index}>
              <Paper
                elevation={3}
                sx={{
                  p: 4,
                  height: 180, // Increases vertical height
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  textAlign: "center",
                  borderRadius: 3,
                  cursor: "pointer",
                  transition: "0.3s",
                  "&:hover": { bgcolor: "#e3f2fd" } // Hover effect
                }}
                onClick={() => navigate(feature.path)} // Make the entire card clickable
              >
                <Typography variant="h6" fontWeight="bold">
                  {feature.title}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>
      
    </Box>
  );
};

export default Dashboard;
