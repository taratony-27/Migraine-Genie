import React from 'react';
import {
  Box, Typography, Card, CardContent, Grid, Container, useTheme, useMediaQuery
} from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import FavoriteIcon from '@mui/icons-material/Favorite';
import GroupsIcon from '@mui/icons-material/Groups';
import Auth from '../components/Auth'; // Replace with your actual path

const Home: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isLoggedIn = !!localStorage.getItem('token');

  const featureData = [
    {
      title: "Symptom Tracker",
      desc: "Easily log your symptoms, triggers, and treatments.",
      icon: <AutoAwesomeIcon sx={{ fontSize: 60, color: '#1565c0' }} />
    },
    {
      title: "Personalized Insights",
      desc: "Get tailored advice based on your migraine patterns.",
      icon: <FavoriteIcon sx={{ fontSize: 60, color: '#c2185b' }} />
    },
    {
      title: "Community Support",
      desc: "Connect with others who understand your journey.",
      icon: <GroupsIcon sx={{ fontSize: 60, color: '#2e7d32' }} />
    }
  ];

  const testimonialsData = [
    {
      name: "Sarah K.",
      feedback: "Migraine Genie helped me finally understand my triggers. Absolute game-changer!"
    },
    {
      name: "Jason M.",
      feedback: "The personalized insights helped me drastically reduce my migraine days."
    },
    {
      name: "Emma T.",
      feedback: "Simple, beautiful, and genuinely helpful. I recommend it to everyone I know."
    }
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#e3f2fd' }}>

      {/* Hero Section */}
      <Box sx={{ flexGrow: 1, py: 4 }}>
        <Container
          maxWidth="lg"
          sx={{
            minHeight: '80vh',
            display: 'flex',
            flexDirection: isMobile || !isLoggedIn ? 'column' : 'row',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: isMobile || !isLoggedIn ? 'center' : 'left'
          }}
        >
          {/* Welcome Text */}
          <Box
            flex={isLoggedIn ? 1 : 'unset'}
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            textAlign="center"
            sx={{
              mb: isLoggedIn ? 0 : 4,
              width: isLoggedIn ? '100%' : 'auto',
              minHeight: isLoggedIn ? '60vh' : 'auto'
            }}
          >
            <Typography variant="h3" fontWeight="bold" color="#1565c0">
              Welcome to Migraine Genie
            </Typography>
            <Typography variant="body1" color="textSecondary" sx={{ mt: 2, maxWidth: 500 }}>
              Your personalized migraine relief assistant. Track symptoms, get tailored recommendations,
              and take control of your migraine management journey.
            </Typography>
          </Box>

          {/* Auth Form (Login / Signup) */}
          {!isLoggedIn && (
            <Box flex={1} display="flex" justifyContent="center" alignItems="center">
              <Auth />
            </Box>
          )}
        </Container>
      </Box>

      {/* About Us */}
      <Box sx={{ flexGrow: 1, backgroundColor: '#bbdefb', py: 10 }}>
        <Container maxWidth="md">
          <Typography variant="h4" fontWeight="bold" color="#0d47a1" textAlign="center" mb={4}>
            About Us
          </Typography>
          <Typography variant="body1" color="textSecondary" textAlign="center" maxWidth="sm" mx="auto">
            Migraine Genie was created to help individuals manage and understand their migraines through
            smart tracking, personalized recommendations, and community support.
          </Typography>
        </Container>
      </Box>

      {/* Features */}
      <Box sx={{ flexGrow: 1, backgroundColor: '#e3f2fd', py: 10 }}>
        <Container maxWidth="lg">
          <Typography variant="h4" fontWeight="bold" color="#0d47a1" textAlign="center" mb={6}>
            Features
          </Typography>
          <Grid container spacing={4} justifyContent="center">
            {featureData.map((feature, idx) => (
              <Grid item xs={12} md={4} key={idx}>
                <Card
                  elevation={6}
                  sx={{
                    background: 'linear-gradient(135deg, #ffffff 0%, #bbdefb 100%)',
                    p: 4,
                    borderRadius: 4,
                    textAlign: 'center',
                    transition: 'transform 0.3s ease',
                    '&:hover': { transform: 'scale(1.05)' }
                  }}
                >
                  <CardContent>
                    {feature.icon}
                    <Typography variant="h6" fontWeight="bold" color="primary" mt={2}>
                      {feature.title}
                    </Typography>
                    <Typography variant="body2" color="textSecondary" mt={1}>
                      {feature.desc}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Testimonials */}
      <Box sx={{ flexGrow: 1, backgroundColor: '#bbdefb', py: 10 }}>
        <Container maxWidth="lg">
          <Typography variant="h4" fontWeight="bold" color="#0d47a1" textAlign="center" mb={6}>
            Testimonials
          </Typography>
          <Grid container spacing={4} justifyContent="center">
            {testimonialsData.map((testimonial, idx) => (
              <Grid item xs={12} md={4} key={idx}>
                <Card
                  elevation={8}
                  sx={{
                    background: '#ffffff',
                    border: '1px solid #1565c0',
                    borderRadius: 4,
                    p: 4,
                    textAlign: 'center',
                    boxShadow: '0 4px 20px rgba(21, 101, 192, 0.2)'
                  }}
                >
                  <CardContent>
                    <Typography variant="body1" color="textSecondary" fontStyle="italic" mb={2}>
                      "{testimonial.feedback}"
                    </Typography>
                    <Typography variant="subtitle2" fontWeight="bold" color="#1565c0">
                      - {testimonial.name}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
    </Box>
  );
};

export default Home;
