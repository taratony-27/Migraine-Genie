import React from 'react';
import { Box, Typography, Divider, Button } from '@mui/material';

const MonitoringReport: React.FC = () => {
  return (
    <Box
      display="flex"
      flexDirection="column"
      width="100%"
    >
      <Typography variant="h4" fontWeight="bold" mb={2} color="primary.main" textAlign="center">
        Symptom and Trigger Monitoring Report
      </Typography>

      <Divider sx={{ mb: 4 }} />

    </Box>
  );
};

export default MonitoringReport;