import React from 'react';
import { Box, Typography, Divider, Link, Stack } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { SITE } from '../config/site';

const Footer: React.FC = () => {
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem('token');

  return (
    <Box
      component="footer"
      sx={{
        bgcolor: '#0d47a1',
        color: 'rgba(255,255,255,0.85)',
        pt: 5,
        pb: 3,
        px: { xs: 3, md: 6 },
        mt: 'auto',
      }}
    >
      <Box
        sx={{
          maxWidth: 1200,
          mx: 'auto',
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          gap: 4,
          mb: 4,
        }}
      >
        {/* Brand */}
        <Box>
          <Typography variant="h6" fontWeight={800} color="#fff" mb={1}>
            {SITE.name}
          </Typography>
          <Typography variant="body2" sx={{ maxWidth: 240, lineHeight: 1.7, opacity: 0.75 }}>
            Your AI-powered companion for understanding and managing migraines.
          </Typography>
          <Typography variant="body2" sx={{ mt: 1, opacity: 0.55 }}>
            {SITE.domain}
          </Typography>
        </Box>

        {/* Links */}
        <Stack spacing={1}>
          <Typography variant="overline" color="rgba(255,255,255,0.5)" fontWeight={700}>
            App
          </Typography>
          {isLoggedIn ? (
            <>
              <Link onClick={() => navigate('/dashboard')} sx={linkSx}>Dashboard</Link>
              <Link onClick={() => navigate('/account')} sx={linkSx}>Account</Link>
            </>
          ) : (
            <Link onClick={() => navigate('/')} sx={linkSx}>Login / Sign Up</Link>
          )}
        </Stack>

        {/* Support */}
        <Stack spacing={1}>
          <Typography variant="overline" color="rgba(255,255,255,0.5)" fontWeight={700}>
            Support
          </Typography>
          <Link href={`mailto:${SITE.supportEmail}`} sx={linkSx}>
            {SITE.supportEmail}
          </Link>
        </Stack>
      </Box>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.12)', mb: 3 }} />

      <Typography variant="body2" textAlign="center" sx={{ opacity: 0.5 }}>
        © {new Date().getFullYear()} {SITE.name}. All rights reserved.
      </Typography>
    </Box>
  );
};

const linkSx = {
  color: 'rgba(255,255,255,0.8)',
  cursor: 'pointer',
  typography: 'body2',
  textDecoration: 'none',
  '&:hover': { color: '#fff' },
};

export default Footer;
