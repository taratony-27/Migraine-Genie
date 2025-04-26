import React, { useState } from 'react';
import { AppBar, Toolbar, Typography, Button, IconButton, Menu, MenuItem, Avatar, Box } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom'; // 👈 Add useNavigate

const Header: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate(); // 👈 Initialize navigate
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const isHome = location.pathname === "/";

  return (
    <AppBar position="static" color="transparent" elevation={0}>
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <Typography
          variant="h6"
          fontWeight="bold"
          onClick={() => navigate('/')} // 👈 Redirect to Home on click
          sx={{
            cursor: 'pointer', // 👈 Make it obvious it's clickable
            userSelect: 'none', // optional: prevent text highlight
          }}
        >
          MigraineGenie
        </Typography>

        {isHome ? (
          <Button variant="contained" color="primary">
            Sign Up
          </Button>
        ) : (
          <Box>
            <IconButton onClick={handleMenuOpen}>
              <Avatar src="/profile.jpg" />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
            >
              <MenuItem onClick={handleMenuClose}>Account</MenuItem>
              <MenuItem onClick={handleMenuClose}>Profile</MenuItem>
              <MenuItem onClick={handleMenuClose}>Settings</MenuItem>
              <MenuItem onClick={handleMenuClose}>Logout</MenuItem>
            </Menu>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Header;
