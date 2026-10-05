import React from 'react';
import { Box, Button, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

// Any unknown address. Seo.tsx gives it a "Page not found" title and noindex.
const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Box minHeight="60vh" display="flex" flexDirection="column" alignItems="center" justifyContent="center" textAlign="center" px={2} py={8}>
      <Typography variant="h3" component="h1" fontWeight={800} color="primary.main" gutterBottom>
        Page not found
      </Typography>
      <Typography variant="body1" color="text.secondary" mb={4} maxWidth={420}>
        That page doesn&apos;t exist or has moved. Check the address, or head back to the start.
      </Typography>
      <Button variant="contained" size="large" onClick={() => navigate('/')}>
        Back to Migraine Genie
      </Button>
    </Box>
  );
};

export default NotFound;
