import React, { useState } from 'react';
import {
  AppBar, Toolbar, Typography, Button, IconButton,
  Menu, MenuItem, Avatar, Box, useScrollTrigger
} from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';

const Header: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const isLoggedIn = !!localStorage.getItem('token');
  const isHome = location.pathname === '/';
  const isDashboard = location.pathname === '/dashboard';

  // On home page: transparent until scrolled; elsewhere: always solid
  const trigger = useScrollTrigger({ disableHysteresis: true, threshold: 60 });
  const elevated = !isHome || trigger;

  const handleMenuOpen = (e: React.MouseEvent<HTMLElement>) => setAnchorEl(e.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const goToAccount = () => { handleMenuClose(); navigate('/account'); };
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    handleMenuClose();
    navigate('/');
  };

  // Derive avatar initial from stored user
  const storedUser = (() => {
    try { return JSON.parse(localStorage.getItem('user') || 'null'); } catch { return null; }
  })();
  const initial = storedUser?.name?.[0]?.toUpperCase() || '?';

  return (
    <AppBar
      position="sticky"
      elevation={elevated ? 2 : 0}
      sx={{
        top: 0,
        zIndex: 1100,
        bgcolor: elevated ? '#fff' : 'transparent',
        backdropFilter: elevated ? 'none' : 'blur(4px)',
        color: isHome && !elevated ? '#fff' : 'text.primary',
        transition: 'background-color 0.25s, box-shadow 0.25s, color 0.25s',
        borderBottom: elevated ? '1px solid rgba(0,0,0,0.08)' : 'none',
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', minHeight: { xs: 56, sm: 64 } }}>
        <Typography
          variant="h6"
          fontWeight={800}
          onClick={() => navigate('/')}
          sx={{
            cursor: 'pointer',
            userSelect: 'none',
            color: isHome && !elevated ? '#fff' : 'primary.main',
            letterSpacing: '-0.3px',
          }}
        >
          MigraineGenie
        </Typography>

        {isLoggedIn ? (
          <Box display="flex" alignItems="center" gap={1.5}>
            {!isDashboard && (
              <Button
                variant="contained"
                size="small"
                onClick={() => navigate('/dashboard')}
                sx={{ borderRadius: 2, fontWeight: 700, display: { xs: 'none', sm: 'inline-flex' } }}
              >
                Dashboard
              </Button>
            )}
            <IconButton onClick={handleMenuOpen} size="small">
              <Avatar
                sx={{
                  width: 34,
                  height: 34,
                  bgcolor: 'primary.main',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                }}
              >
                {initial}
              </Avatar>
            </IconButton>
            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}
              PaperProps={{ sx: { mt: 1, minWidth: 160, borderRadius: 2, boxShadow: '0 4px 20px rgba(0,0,0,0.12)' } }}
            >
              <MenuItem onClick={goToAccount} sx={{ fontWeight: 600 }}>Account</MenuItem>
              {!isDashboard && (
                <MenuItem onClick={() => { handleMenuClose(); navigate('/dashboard'); }} sx={{ fontWeight: 600 }}>
                  Dashboard
                </MenuItem>
              )}
              <MenuItem onClick={logout} sx={{ color: 'error.main', fontWeight: 600 }}>Logout</MenuItem>
            </Menu>
          </Box>
        ) : isHome ? null : (
          <Button variant="contained" size="small" onClick={() => navigate('/')} sx={{ borderRadius: 2 }}>
            Login
          </Button>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Header;
