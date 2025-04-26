import React from 'react';
import { Box } from '@mui/material';
import Header from './Header';
import Footer from './Footer';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <Box display="flex" flexDirection="column" minHeight="100dvh">
      <Header />
      <Box flexGrow={1} p={2}>
        {children}
      </Box>
      <Footer />
    </Box>
  );
};

export default Layout;
