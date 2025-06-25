import React from 'react';
import { Box, Typography, Link, Divider, Button } from '@mui/material';

//Bug for mobile view. Still can scroll horizontally

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
  return (
    <Box maxWidth="md" mx="auto" py={6} px={2}>
      <Typography variant="h3" fontWeight="bold" textAlign="center" gutterBottom>
        Wellness Program
      </Typography>

      <Typography variant="body1" color="textSecondary" textAlign="center" mb={4}>
        Welcome to your personalized wellness hub! Here, you'll find daily exercises, mindfulness
        techniques, and expert health tips designed to improve your lifestyle and well-being.
      </Typography>

      {wellnessItems.map((item, index) => (
        <Box key={index} mb={4}>
          <Typography variant="h6" fontWeight="bold">
            {index + 1}. {item.title}
          </Typography>
          <Typography variant="body2" color="textSecondary" mt={0.5}>
            {item.desc}
          </Typography>
          <Link
            component="button"
            underline="hover"
            color="primary"
            fontSize="0.9rem"
            mt={1}
            sx={{ display: 'inline-block', mt: 1 }}
          >
            Read More »
          </Link>
          <Divider sx={{ mt: 2 }} />
        </Box>
      ))}

      {/* Goal Tracker Button */}
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
  );
};

export default WellnessProgram;
