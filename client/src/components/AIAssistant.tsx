import React from 'react';
import {
  Box,
  Typography,
  Divider,
  Button,
  useMediaQuery,
  useTheme,
} from '@mui/material';

const AIAssistant: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Box
      display="flex"
      flexDirection="column"
      width="100%"
      sx={{
        // Remove fixed height on mobile for natural height flow
        height: isMobile ? 'auto' : 'auto',
        maxHeight: 'none',
        overflowY: 'visible',
        px: isMobile ? 2 : 4,
        py: isMobile ? 2 : 6,
        boxSizing: 'border-box',
      }}
    >
      {!isMobile && (
        <Typography variant="h4" fontWeight="bold" textAlign="center" gutterBottom>
          AI Assistant
        </Typography>
      )}

      <Typography
        variant="subtitle1"
        color="text.secondary"
        mb={3}
        textAlign="center"
      >
        Your daily dose of intelligent care
      </Typography>

      <Divider sx={{ mb: 3 }} />

      <Typography variant="body1" color="text.secondary" mb={2}>
        Meet your AI-powered health assistant. Designed to track symptoms, monitor medication, suggest
        wellness strategies, and provide personalized recommendations—all in one place.
      </Typography>

      <Typography variant="body1" color="text.secondary" mb={3}>
        Whether you're managing a condition or just building healthier habits, the assistant is here to support you daily.
      </Typography>

      <Box textAlign="center" pt={2}>
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
            maxWidth: isMobile ? '100%' : 'auto',
            minWidth: isMobile ? 'unset' : undefined,
          }}
        >
          Launch Assistant
        </Button>
      </Box>
    </Box>
  );
};

export default AIAssistant;

