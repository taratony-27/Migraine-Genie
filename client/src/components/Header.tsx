import React, { useState } from 'react';
import {
  AppBar, Toolbar, Typography, Button, IconButton,
  Menu, MenuItem, Avatar, Box
} from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';

const Header: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const isLoggedIn = !!localStorage.getItem('token');
  const isHome = location.pathname === '/';
  const isDashboard = location.pathname === '/dashboard';

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const goToAccount = () => {
    handleMenuClose();
    navigate('/account');
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    handleMenuClose();
    navigate('/');
  };

  return (
    <AppBar position="static" color="transparent" elevation={0}>
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <Typography
          variant="h6"
          fontWeight="bold"
          onClick={() => navigate('/')}
          sx={{ cursor: 'pointer', userSelect: 'none' }}
        >
          MigraineGenie
        </Typography>

        {isHome && !isLoggedIn ? (
          <Button variant="contained" color="primary" onClick={() => navigate('/')}>
            Sign Up
          </Button>
        ) : isLoggedIn ? (
          <Box display="flex" alignItems="center" gap={2}>
            {!isDashboard && (
              <Button variant="contained" color="primary" onClick={() => navigate('/dashboard')}>
                Go To App
              </Button>
            )}
            <IconButton onClick={handleMenuOpen}>
              <Avatar src="/profile.jpg" />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
            >
              <MenuItem onClick={goToAccount}>Account</MenuItem>
              <MenuItem onClick={handleMenuClose}>Settings</MenuItem>
              <MenuItem onClick={logout}>Logout</MenuItem>
            </Menu>
          </Box>
        ) : null}
      </Toolbar>
    </AppBar>
  );
};

export default Header;
