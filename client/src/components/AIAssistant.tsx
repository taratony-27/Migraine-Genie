import React from 'react';
import { Box, Typography, Divider, Button } from '@mui/material';

const AIAssistant: React.FC = () => {
  return (
    <Box display="flex" flexDirection="column" width="100%">
      <Typography variant="subtitle1" color="text.secondary" mb={4} textAlign="center">
        Your daily dose of intelligent care
      </Typography>

      <Divider sx={{ mb: 4 }} />

      <Typography variant="body1" color="text.secondary" mb={2}>
        Meet your AI-powered health assistant. Designed to track symptoms, monitor medication, suggest
        wellness strategies, and provide personalized recommendations—all in one place.
      </Typography>

      <Typography variant="body1" color="text.secondary" mb={4}>
        Whether you're managing a condition or just building healthier habits, the assistant is here to support you daily.
      </Typography>

      <Box textAlign="center" mt={2}>
        <Button
          variant="contained"
          size="large"
          color="primary"
          href="/assistant-chat"
          sx={{
            borderRadius: 8,
            px: 5,
            py: 1.5,
            fontWeight: 'bold',
          }}
        >
          Launch Assistant
        </Button>
      </Box>
    </Box>
  );
};

export default AIAssistant;
