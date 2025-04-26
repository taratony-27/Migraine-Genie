import React from 'react';
import { Box, Typography } from '@mui/material';

const Footer: React.FC = () => {
  return (
    <Box component="footer" textAlign="center" py={2} bgcolor="#f5f5f5" mt={4}>
      <Typography variant="body2" color="textSecondary">
        © {new Date().getFullYear()} MigraineGenie. All rights reserved.
      </Typography>
    </Box>
  );
};

export default Footer;
