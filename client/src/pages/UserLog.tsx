import React from 'react';
import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material';

const mockLogs = [
  { date: '2025-06-09', triggers: ['Dehydration', 'Stress'], intensity: 'High' },
  { date: '2025-06-08', triggers: ['Lack of Sleep'], intensity: 'Moderate' },
  { date: '2025-06-07', triggers: ['Skipped Meal'], intensity: 'Low' },
];

const UserLog: React.FC = () => (
  <Box minHeight="100vh" px={2} py={4} bgcolor="#f4faff" display="flex" justifyContent="center">
    <Paper sx={{ width: '100%', maxWidth: 800, p: 4, borderRadius: 4 }} elevation={4}>
      <Typography variant="h5" fontWeight="bold" gutterBottom color="#1565c0">
        Log History
      </Typography>
      <Divider sx={{ mb: 2 }} />

      <List>
        {mockLogs.map((log, idx) => (
          <React.Fragment key={idx}>
            <ListItem>
              <ListItemText
                primary={`Date: ${log.date}`}
                secondary={
                  <>
                    <Typography component="span" variant="body2" color="textPrimary">
                      Triggers: {log.triggers.join(', ')}
                    </Typography>
                    <br />
                    <Typography component="span" variant="body2" color="textSecondary">
                      Intensity: {log.intensity}
                    </Typography>
                  </>
                }
              />
            </ListItem>
            {idx < mockLogs.length - 1 && <Divider component="li" />}
          </React.Fragment>
        ))}
      </List>
    </Paper>
  </Box>
);

export default UserLog;
