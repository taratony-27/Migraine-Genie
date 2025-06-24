import React, { useState } from 'react';
import {
  Box, Typography, Card, CardContent, Grid, Container, useTheme, useMediaQuery,
  TextField, Button, Link, MenuItem, Paper
} from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import FavoriteIcon from '@mui/icons-material/Favorite';
import GroupsIcon from '@mui/icons-material/Groups';
import axios from 'axios';

const API_BASE = 'http://localhost:3001';

const Home: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [isLogin, setIsLogin] = useState(true);
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

  const handleLogin = async (email: string, password: string) => {
    try {
      console.log('🔐 Logging in with:', email);
      const res = await axios.post(`${API_BASE}/api/users/login`, { email, password });
      localStorage.setItem('token', res.data.token);
      console.log('✅ Login success:', res.data);
      window.location.href = '/dashboard';
    } catch (err: any) {
      console.error('❌ Login failed:', err?.response?.data || err.message);
      alert(err.response?.data?.message || 'Login failed');
    }
  };

  const handleSignup = async () => {
    const { name, email, password, dateOfBirth, gender } = formData;
    try {
      console.log('📝 Signing up with:', formData);
      const res = await axios.post(`${API_BASE}/api/users/signup`, {
        name,
        email,
        password,
        date_of_birth: dateOfBirth,
        gender
      });
      console.log('✅ Signup success:', res.data);
      alert('Signup successful! You can now log in.');
      setIsLogin(true);
    } catch (err: any) {
      console.error('❌ Signup failed:', err?.response?.data || err.message);
      alert(err.response?.data?.message || 'Signup failed');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLogin) {
      handleLogin(formData.email, formData.password);
    } else {
      handleSignup();
    }
  };

  const featureData = [
    { title: "Symptom Tracker", desc: "Easily log your symptoms, triggers, and treatments.", icon: <AutoAwesomeIcon sx={{ fontSize: 60, color: '#1565c0' }} /> },
    { title: "Personalized Insights", desc: "Get tailored advice based on your migraine patterns.", icon: <FavoriteIcon sx={{ fontSize: 60, color: '#c2185b' }} /> },
    { title: "Community Support", desc: "Connect with others who understand your journey.", icon: <GroupsIcon sx={{ fontSize: 60, color: '#2e7d32' }} /> }
  ];

  const testimonialsData = [
    { name: "Sarah K.", feedback: "Migraine Genie helped me finally understand my triggers. Absolute game-changer!" },
    { name: "Jason M.", feedback: "The personalized insights helped me drastically reduce my migraine days." },
    { name: "Emma T.", feedback: "Simple, beautiful, and genuinely helpful. I recommend it to everyone I know." }
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#e3f2fd' }}>
      
      {/* Hero Section */}
      <Box sx={{ flexGrow: 1, py: 8 }}>
        <Container maxWidth="lg" sx={{ minHeight: { xs: '90vh', md: '95vh' }, display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: 'center', justifyContent: 'center' }}>
          
          {/* Welcome Text */}
          <Box flex={1} display="flex" flexDirection="column" alignItems={isMobile ? 'center' : 'flex-start'} textAlign={isMobile ? 'center' : 'left'} sx={{ mb: isMobile ? 4 : 0 }}>
            <Typography variant="h3" fontWeight="bold" color="#1565c0">
              Welcome to Migraine Genie
            </Typography>
            <Typography variant="body1" color="textSecondary" sx={{ mt: 2, maxWidth: 500 }}>
              Your personalized migraine relief assistant. Track symptoms, get tailored recommendations, and take control of your migraine management journey.
            </Typography>
          </Box>

          {/* Login / Signup Form */}
          <Box flex={1} display="flex" justifyContent="center" alignItems="center">
            <Paper elevation={8} sx={{
              maxWidth: 360, width: '100%', minHeight: 400,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              p: 4, borderRadius: 3, backgroundColor: '#fff', border: '2px solid #1565c0'
            }}>
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
                      <Link component="button" onClick={(e) => { e.preventDefault(); setIsLogin(false); }}>
                        Sign up
                      </Link>
                    </>
                  ) : (
                    <>
                      Already have an account?{' '}
                      <Link component="button" onClick={(e) => { e.preventDefault(); setIsLogin(true); }}>
                        Log in
                      </Link>
                    </>
                  )}
                </Typography>
              </Box>
            </Paper>
          </Box>
        </Container>
      </Box>

      {/* About Us */}
      <Box sx={{ flexGrow: 1, backgroundColor: '#bbdefb', py: 10 }}>
        <Container maxWidth="md">
          <Typography variant="h4" fontWeight="bold" color="#0d47a1" textAlign="center" mb={4}>
            About Us
          </Typography>
          <Typography variant="body1" color="textSecondary" textAlign="center" maxWidth="sm" mx="auto">
            Migraine Genie was created to help individuals manage and understand their migraines through smart tracking, personalized recommendations, and community support.
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
                <Card elevation={6} sx={{
                  background: 'linear-gradient(135deg, #ffffff 0%, #bbdefb 100%)',
                  p: 4, borderRadius: 4, textAlign: 'center',
                  transition: 'transform 0.3s ease', '&:hover': { transform: 'scale(1.05)' }
                }}>
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
                <Card elevation={8} sx={{
                  background: '#ffffff', border: '1px solid #1565c0',
                  borderRadius: 4, p: 4, textAlign: 'center',
                  boxShadow: '0 4px 20px rgba(21, 101, 192, 0.2)'
                }}>
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
