import React from 'react';
import { Box } from '@mui/material';
import Header from './Header';
import Footer from './Footer';
import ServerWakeNotice from './ServerWakeNotice';

interface LayoutProps {
  children: React.ReactNode;
}
//If it is home page, dont show Header
const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <Box display="flex" flexDirection="column" minHeight="100dvh">
      {/* Keyboard users can jump past the header; visible only when focused */}
      <Box
        component="a"
        href="#main"
        sx={{
          position: 'absolute', left: 8, top: -48, zIndex: 2000, px: 2, py: 1,
          bgcolor: '#fff', color: 'primary.main', fontWeight: 700, borderRadius: 1, boxShadow: 2,
          '&:focus': { top: 8 },
        }}
      >
        Skip to content
      </Box>
      <Header />
      <Box component="main" id="main" tabIndex={-1} flexGrow={1} sx={{ outline: 'none' }}>
        {children}
      </Box>
      <Footer />
      <ServerWakeNotice />
    </Box>
  );
};

export default Layout;
