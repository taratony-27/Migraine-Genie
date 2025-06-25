import React from 'react';
import { Box, Typography, Divider } from '@mui/material';

const Visualization: React.FC = () => {
  return (
    <Box
      display="flex"
      flexDirection="column"
      width="100%"
    >
      <Typography variant="h4" fontWeight="bold" mb={2} color="primary.main" textAlign="center">
        Visualization Report
      </Typography>

      <Divider sx={{ mb: 4 }} />

    </Box>
  );
};

export default Visualization;