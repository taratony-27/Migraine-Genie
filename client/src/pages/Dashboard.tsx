import React, { useState } from 'react';
import {
  Box,
  Typography,
  Container,
  ButtonGroup,
  Button,
  Paper,
  useTheme,
  useMediaQuery,
  Menu,
  MenuItem,
  IconButton,
} from '@mui/material';
import { motion } from 'framer-motion';
import MenuIcon from '@mui/icons-material/Menu';

import DailyLog from '../components/DailyLog';
import DailyPredictions from '../components/DailyPredictions';
import Medication from '../components/Medication';
import WellnessProgram from '../components/WelnessProgram';
import AIAssistant from '../components/AIAssistant';
import Visualization from '../components/Visualization'; //Need to change

const tabs = [
  'Daily Trigger Prediction',
  'Daily Log',
  'Wellness Program',
  'Medication',
  'AI Assistant',
  'Visualization Report'
];

const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('Daily Trigger Prediction');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuItemClick = (tab: string) => {
    setActiveTab(tab);
    setAnchorEl(null);
  };

  const handleButtonClick = (tab: string) => {
    setActiveTab(tab);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'Daily Log':
        return <DailyLog />;
      case 'Wellness Program':
        return <WellnessProgram />;
      case 'Medication':
        return <Medication />;
      case 'AI Assistant':
        return <AIAssistant />;
      case 'Visualization Report':
        return <Visualization />;
      case 'Daily Trigger Prediction':
      default:
        return <DailyPredictions />;
    }
  };

  const activeTabIndex = tabs.indexOf(activeTab);
  const tabWidth = 100 / tabs.length; // 4 tabs = 25% each

  return (
    <Box
      display="flex"
      flexDirection="column"
      minHeight="100dvh"
      bgcolor="#f5f5f5"
      py={4}
    >
      {/* Profile Section */}
      <Container maxWidth="lg" sx={{ mb: 4 }}>
        <Box display="flex" flexDirection="column" alignItems="center" textAlign="center">
          <Typography variant="h4" fontWeight="bold">
            Dashboard
          </Typography>
        </Box>
      </Container>

      {/* Navigation */}
      <Container maxWidth="md" sx={{ mb: 4, position: 'relative' }}>
        {isMobile ? (
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" fontWeight="bold">
              {activeTab}
            </Typography>
            <IconButton onClick={handleMenuClick}>
              <MenuIcon />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={() => setAnchorEl(null)}
            >
              {tabs.map((tab) => (
                <MenuItem key={tab} onClick={() => handleMenuItemClick(tab)}>
                  {tab}
                </MenuItem>
              ))}
            </Menu>
          </Box>
        ) : (
          <Box position="relative">
            {/* Moving background slider */}
            <Box position="relative" overflow="hidden" borderRadius="50px" boxShadow={2}>
              <motion.div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  height: '100%',
                  width: `${tabWidth}%`,
                  backgroundColor: theme.palette.primary.main,
                  borderRadius: '50px',
                  zIndex: 1,
                }}
                animate={{
                  x: `${activeTabIndex * 100}%`,
                }}
                transition={{
                  type: 'spring',
                  stiffness: 300,
                  damping: 30,
                }}
              />
              <ButtonGroup
                fullWidth
                variant="contained"
                aria-label="outlined primary button group"
                sx={{
                  position: 'relative',
                  zIndex: 2,
                  borderRadius: '50px',
                  overflow: 'hidden',
                  '& .MuiButtonGroup-grouped': {
                    border: 'none !important',   // <-- Strong override to kill border
                    borderColor: 'transparent !important',
                  },
                  '& .MuiButtonGroup-grouped:not(:last-of-type)': {
                    borderRight: 'none !important',
                  },
                }}
              >

                {tabs.map((tab) => (
                  <Button
                  key={tab}
                  onClick={() => handleButtonClick(tab)}
                  sx={{
                    borderRadius: 0,
                    bgcolor: 'transparent',
                    color: activeTab === tab ? 'white' : 'text.primary',
                    fontWeight: activeTab === tab ? 'bold' : 'normal',
                    transition: 'color 0.3s ease', // Only color transition
                    border: 'none !important',
                    borderColor: 'transparent !important',
                    boxShadow: 'none !important',
                    '&:hover': {
                      color: activeTab === tab ? 'white' : theme.palette.primary.main, // Text becomes primary color on hover
                      bgcolor: 'transparent',  // stays transparent
                      boxShadow: 'none',
                      border: 'none',
                    },
                    '&:focus': {
                      border: 'none',
                      boxShadow: 'none',
                    },
                    '&:focus-visible': {
                      border: 'none',
                      boxShadow: 'none',
                    },
                  }}
                >
                  {tab}
                </Button>  
                ))}
              </ButtonGroup>
            </Box>
          </Box>
        )}
      </Container>

      {/* Main Content */}
      <Container
        maxWidth="lg"
        sx={{
          mb: 6,
          display: 'flex',
          justifyContent: 'center',
          flexGrow: 1,
        }}
      >
        <Paper
          elevation={3}
          sx={{
            width: '100%',
            maxWidth: '800px',
            p: { xs: 2, md: 4 },
            borderRadius: 3,
            bgcolor: "#ffffff",
            display: "flex",
            flexDirection: "column",
            minHeight: { xs: "200px", md: "300px" },
          }}
        >
          {renderContent()}
        </Paper>
      </Container>
    </Box>
  );
};

export default Dashboard;
