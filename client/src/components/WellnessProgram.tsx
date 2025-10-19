import React from 'react';
import { Box, Typography, Divider, Button, Link, useMediaQuery, useTheme } from '@mui/material';

const wellnessItems = [
  {
    title: '6 Simple Stretches for Migraine Relief',
    desc: 'Easy stretches that can ease tension and support migraine relief.',
  },
  {
    title: 'Tai Chi for Migraine Relief',
    desc: 'Explore how Tai Chi improves balance and reduces migraine frequency.',
  },
  {
    title: 'High-Intensity Aerobic Exercise & Migraines',
    desc: 'Research-backed benefits of aerobic workouts for episodic migraines.',
  },
  {
    title: 'Meditation for Migraine Relief',
    desc: 'How mindfulness practices can reduce migraine intensity and frequency.',
  },
];

const WellnessProgram: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        px: 2,
        py: { xs: 4, sm: 6 },
        boxSizing: 'border-box',
      }}
    >
      <Box width="100%" maxWidth="md">
        {!isMobile && (
          <Typography
            variant="h4"
            fontWeight="bold"
            textAlign="center"
            gutterBottom
          >
            Wellness Program
          </Typography>
        )}

        <Typography
          variant="body1"
          color="text.secondary"
          textAlign="center"
          mb={4}
          sx={{ wordWrap: 'break-word' }}
        >
          Welcome to your personalized wellness hub! Here, you'll find daily exercises, mindfulness
          techniques, and expert health tips designed to improve your lifestyle and well-being.
        </Typography>

        {wellnessItems.map((item, index) => (
          <Box
            key={index}
            mb={4}
            sx={{
              wordWrap: 'break-word',
              overflowWrap: 'anywhere',
              width: '100%',
            }}
          >
            <Typography variant="h6" fontWeight="bold">
              {index + 1}. {item.title}
            </Typography>
            <Typography variant="body2" color="text.secondary" mt={0.5}>
              {item.desc}
            </Typography>
            <Link
              component="button"
              underline="hover"
              color="primary"
              sx={{ fontSize: '0.9rem', mt: 1, display: 'inline-block' }}
            >
              Read More »
            </Link>
            <Divider sx={{ mt: 2 }} />
          </Box>
        ))}

        <Box textAlign="center" mt={6}>
          <Button
            variant="contained"
            color="primary"
            size="large"
            sx={{ borderRadius: 8, px: 5, py: 1.5, fontWeight: 'bold' }}
            href="/goal-tracker"
          >
            Goal Tracker
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default WellnessProgram;