import React from 'react';
import { Box, Typography, Divider, Button } from '@mui/material';

const WellnessProgram: React.FC = () => {
  return (
    <Box
      display="flex"
      flexDirection="column"
      width="100%"
    >
      <Typography variant="h4" fontWeight="bold" mb={2} color="primary.main" textAlign="center">
        Wellness Program
      </Typography>

      <Typography variant="subtitle1" color="text.secondary" mb={4} textAlign="center">
        A Journey Toward Healthier Living
      </Typography>

      <Divider sx={{ mb: 4 }} />

      <Typography variant="body1" color="text.secondary" mb={2}>
        Welcome to your personalized wellness hub! Here, you'll find daily exercises,
        mindfulness techniques, and expert health tips designed to improve your lifestyle and well-being.
      </Typography>

      <Typography variant="body1" color="text.secondary" mb={4}>
        Begin your journey to a healthier you by exploring our curated programs tailored to your needs.
      </Typography>

      <Box textAlign="center" mt={4}>
        <Button
          variant="contained"
          size="large"
          color="primary"
          href="/dashboard"
          sx={{
            borderRadius: 8,
            px: 5,
            py: 1.5,
            fontWeight: 'bold',
          }}
        >
          Start Now
        </Button>
      </Box>
    </Box>
  );
};

export default WellnessProgram;
