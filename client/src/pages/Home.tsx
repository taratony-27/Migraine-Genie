import React from 'react';
import {
  Box, Typography, Card, CardContent, Grid, Container,
  useTheme, useMediaQuery, Button, Avatar, Divider, Chip
} from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import FavoriteIcon from '@mui/icons-material/Favorite';
import GroupsIcon from '@mui/icons-material/Groups';
import TrackChangesIcon from '@mui/icons-material/TrackChanges';
import InsightsIcon from '@mui/icons-material/Insights';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { useNavigate } from 'react-router-dom';
import Auth from '../components/Auth';

const Home: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmall = useMediaQuery(theme.breakpoints.down('sm'));
  const isLoggedIn = !!localStorage.getItem('token');
  const navigate = useNavigate();

  const featureData = [
    {
      title: "Symptom Tracker",
      desc: "Log your daily symptoms, triggers, intensity, and medications in seconds.",
      icon: <TrackChangesIcon sx={{ fontSize: 48, color: '#1565c0' }} />,
      color: '#e3f2fd',
      border: '#90caf9',
    },
    {
      title: "Personalized Insights",
      desc: "AI-powered analysis reveals your unique migraine patterns and risk factors.",
      icon: <InsightsIcon sx={{ fontSize: 48, color: '#7b1fa2' }} />,
      color: '#f3e5f5',
      border: '#ce93d8',
    },
    {
      title: "Smart Alerts",
      desc: "Get proactive warnings before a migraine hits based on your tracked data.",
      icon: <NotificationsActiveIcon sx={{ fontSize: 48, color: '#e65100' }} />,
      color: '#fff3e0',
      border: '#ffcc80',
    },
    {
      title: "Wellness Program",
      desc: "Curated articles and videos to help you manage migraines holistically.",
      icon: <FavoriteIcon sx={{ fontSize: 48, color: '#c2185b' }} />,
      color: '#fce4ec',
      border: '#f48fb1',
    },
    {
      title: "AI Assistant",
      desc: "Ask your personal migraine expert anything, anytime — powered by AI.",
      icon: <AutoAwesomeIcon sx={{ fontSize: 48, color: '#00796b' }} />,
      color: '#e0f2f1',
      border: '#80cbc4',
    },
    {
      title: "Community Support",
      desc: "You're not alone. Connect with others navigating the same journey.",
      icon: <GroupsIcon sx={{ fontSize: 48, color: '#2e7d32' }} />,
      color: '#e8f5e9',
      border: '#a5d6a7',
    },
  ];

  const testimonialsData = [
    {
      name: "Sarah K.",
      role: "Chronic migraine sufferer",
      feedback: "Migraine Genie helped me finally understand my triggers. I went from 15 migraine days a month to 6. Absolute game-changer!",
      initials: "SK",
      color: '#1565c0',
    },
    {
      name: "Jason M.",
      role: "Software engineer",
      feedback: "The personalized insights showed me that my screen time was directly correlated with my attacks. Simple but powerful.",
      initials: "JM",
      color: '#7b1fa2',
    },
    {
      name: "Emma T.",
      role: "Teacher",
      feedback: "Simple, beautiful, and genuinely helpful. The AI assistant answers questions my doctor never had time for.",
      initials: "ET",
      color: '#c2185b',
    },
  ];

  const stats = [
    { value: '10k+', label: 'Active Users' },
    { value: '500k+', label: 'Symptoms Logged' },
    { value: '68%', label: 'Reduction in Migraine Days' },
    { value: '4.9★', label: 'Average Rating' },
  ];

  const benefits = [
    'No more guessing your triggers',
    'Data-driven, not opinion-driven',
    'Built for daily use — 2 mins per log',
    'Private & secure — your data stays yours',
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', backgroundColor: '#f0f7ff' }}>

      {/* ── Hero ── */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #0d47a1 0%, #1565c0 40%, #1976d2 100%)',
          color: '#fff',
          pt: { xs: 6, md: 10 },
          pb: { xs: 8, md: 12 },
          px: 2,
          position: 'relative',
          overflow: 'hidden',
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: -2,
            left: 0,
            right: 0,
            height: { xs: 40, md: 64 },
            background: '#f0f7ff',
            borderRadius: '50% 50% 0 0 / 100% 100% 0 0',
          },
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={{ xs: 4, md: 8 }} alignItems="center">
            {/* Left: Copy */}
            <Grid item xs={12} md={isLoggedIn ? 12 : 6}>
              <Box textAlign={isMobile || isLoggedIn ? 'center' : 'left'}>
                <Chip
                  label="AI-Powered Migraine Relief"
                  size="small"
                  sx={{
                    bgcolor: 'rgba(255,255,255,0.15)',
                    color: '#fff',
                    fontWeight: 600,
                    mb: 2,
                    fontSize: '0.75rem',
                    letterSpacing: 0.5,
                  }}
                />
                <Typography
                  variant={isSmall ? 'h4' : 'h2'}
                  component="h1"
                  fontWeight={800}
                  lineHeight={1.15}
                  mb={2}
                  sx={{ letterSpacing: '-0.5px' }}
                >
                  Take Control of{' '}
                  <Box component="span" sx={{ color: '#90caf9' }}>
                    Your Migraines
                  </Box>
                </Typography>
                <Typography
                  variant="h6"
                  sx={{
                    opacity: 0.85,
                    fontWeight: 400,
                    maxWidth: isLoggedIn ? 640 : 480,
                    mx: isMobile || isLoggedIn ? 'auto' : 0,
                    lineHeight: 1.6,
                    fontSize: { xs: '1rem', md: '1.15rem' },
                  }}
                >
                  Track symptoms, uncover your triggers, and get AI-powered insights
                  — all in one beautifully simple app.
                </Typography>

                {/* Benefits list */}
                <Box
                  sx={{
                    mt: 3,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1,
                    alignItems: isMobile || isLoggedIn ? 'center' : 'flex-start',
                  }}
                >
                  {benefits.map((b) => (
                    <Box key={b} display="flex" alignItems="center" gap={1}>
                      <CheckCircleOutlineIcon sx={{ fontSize: 18, color: '#90caf9' }} />
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>{b}</Typography>
                    </Box>
                  ))}
                </Box>

                {isLoggedIn && (
                  <Button
                    variant="contained"
                    size="large"
                    onClick={() => navigate('/dashboard')}
                    sx={{
                      mt: 4,
                      px: 5,
                      py: 1.5,
                      bgcolor: '#fff',
                      color: '#1565c0',
                      fontWeight: 700,
                      fontSize: '1rem',
                      borderRadius: 3,
                      '&:hover': { bgcolor: '#e3f2fd' },
                    }}
                  >
                    Go to Dashboard
                  </Button>
                )}
              </Box>
            </Grid>

            {/* Right: Auth form */}
            {!isLoggedIn && (
              <Grid item xs={12} md={6} display="flex" justifyContent="center">
                <Auth />
              </Grid>
            )}
          </Grid>
        </Container>
      </Box>

      {/* ── Stats bar ── */}
      <Box sx={{ bgcolor: '#fff', py: { xs: 4, md: 5 }, boxShadow: '0 2px 12px rgba(21,101,192,0.08)' }}>
        <Container maxWidth="lg">
          <Grid container spacing={2} justifyContent="center">
            {stats.map((s, i) => (
              <Grid item xs={6} sm={3} key={i} sx={{ textAlign: 'center' }}>
                <Typography
                  variant={isSmall ? 'h5' : 'h4'}
                  fontWeight={800}
                  color="#1565c0"
                >
                  {s.value}
                </Typography>
                <Typography variant="body2" color="text.secondary" fontWeight={500}>
                  {s.label}
                </Typography>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* ── About Us ── */}
      <Box sx={{ bgcolor: '#f0f7ff', py: { xs: 7, md: 10 }, px: 2 }}>
        <Container maxWidth="md">
          <Typography
            variant={isSmall ? 'h5' : 'h4'}
            component="h2"
            fontWeight={800}
            color="#0d47a1"
            textAlign="center"
            mb={2}
          >
            Why Migraine Genie?
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            textAlign="center"
            sx={{ maxWidth: 640, mx: 'auto', lineHeight: 1.8, fontSize: { xs: '0.95rem', md: '1.05rem' } }}
          >
            Millions of people suffer from migraines with no clear understanding of why.
            Migraine Genie was built to change that — giving you the tools to track, analyze,
            and ultimately reduce your migraine days through smart data and compassionate design.
          </Typography>
          {!isLoggedIn && (
            <Box textAlign="center" mt={4}>
              <Button
                variant="contained"
                size="large"
                href="#signup"
                onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                sx={{ px: 5, py: 1.5, borderRadius: 3, fontWeight: 700, fontSize: '1rem' }}
              >
                Start for Free
              </Button>
            </Box>
          )}
        </Container>
      </Box>

      {/* ── Features ── */}
      <Box sx={{ bgcolor: '#fff', py: { xs: 7, md: 10 }, px: 2 }}>
        <Container maxWidth="lg">
          <Typography
            variant={isSmall ? 'h5' : 'h4'}
            fontWeight={800}
            color="#0d47a1"
            textAlign="center"
            mb={1}
          >
            Everything You Need
          </Typography>
          <Typography variant="body2" color="text.secondary" textAlign="center" mb={6}>
            One app. All the tools to understand and manage your migraines.
          </Typography>
          <Grid container columnSpacing={4} rowSpacing={6} justifyContent="center">
            {featureData.map((feature, idx) => (
              <Grid item xs={12} sm={6} md={4} key={idx}>
                <Card
                  elevation={0}
                  sx={{
                    bgcolor: feature.color,
                    border: `1.5px solid ${feature.border}`,
                    borderRadius: 4,
                    p: { xs: 3, md: 4 },
                    height: '100%',
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 24px rgba(21,101,192,0.12)',
                    },
                  }}
                >
                  <CardContent sx={{ p: 0 }}>
                    <Box mb={2}>{feature.icon}</Box>
                    <Typography variant="h6" fontWeight={700} color="#0d47a1" mb={1}>
                      {feature.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" lineHeight={1.7}>
                      {feature.desc}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* ── Testimonials ── */}
      <Box sx={{ bgcolor: '#f0f7ff', py: { xs: 7, md: 10 }, px: 2 }}>
        <Container maxWidth="lg">
          <Typography
            variant={isSmall ? 'h5' : 'h4'}
            fontWeight={800}
            color="#0d47a1"
            textAlign="center"
            mb={1}
          >
            Real Stories
          </Typography>
          <Typography variant="body2" color="text.secondary" textAlign="center" mb={6}>
            From people who've taken back control of their lives.
          </Typography>
          <Grid container spacing={3} justifyContent="center">
            {testimonialsData.map((t, idx) => (
              <Grid item xs={12} sm={6} md={4} key={idx}>
                <Card
                  elevation={0}
                  sx={{
                    border: '1.5px solid #bbdefb',
                    borderRadius: 4,
                    p: { xs: 2.5, md: 3.5 },
                    height: '100%',
                    bgcolor: '#fff',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <CardContent sx={{ p: 0, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                    <FormatQuoteIcon sx={{ fontSize: 32, color: '#bbdefb', mb: 1 }} />
                    <Typography
                      variant="body1"
                      color="text.secondary"
                      fontStyle="italic"
                      lineHeight={1.8}
                      flexGrow={1}
                      mb={3}
                      sx={{ fontSize: { xs: '0.9rem', md: '0.95rem' } }}
                    >
                      {t.feedback}
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <Box display="flex" alignItems="center" gap={1.5}>
                      <Avatar sx={{ bgcolor: t.color, width: 36, height: 36, fontSize: '0.8rem', fontWeight: 700 }}>
                        {t.initials}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle2" fontWeight={700} color="#0d47a1">
                          {t.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {t.role}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* ── Bottom CTA (logged-out only) ── */}
      {!isLoggedIn && (
        <Box
          sx={{
            background: 'linear-gradient(135deg, #0d47a1 0%, #1976d2 100%)',
            py: { xs: 7, md: 10 },
            px: 2,
            textAlign: 'center',
          }}
        >
          <Container maxWidth="sm">
            <Typography
              variant={isSmall ? 'h5' : 'h4'}
              fontWeight={800}
              color="#fff"
              mb={2}
            >
              Ready to stop guessing?
            </Typography>
            <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.8)', mb: 4, lineHeight: 1.7 }}>
              Join thousands of people who've used Migraine Genie to understand and manage
              their migraines. It's free to get started.
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              sx={{
                bgcolor: '#fff',
                color: '#1565c0',
                fontWeight: 700,
                fontSize: '1rem',
                px: 5,
                py: 1.5,
                borderRadius: 3,
                '&:hover': { bgcolor: '#e3f2fd' },
              }}
            >
              Create Free Account
            </Button>
          </Container>
        </Box>
      )}

    </Box>
  );
};

export default Home;
