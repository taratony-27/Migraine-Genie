import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Box, Typography, Paper } from '@mui/material';

const DailyLogHistory: React.FC = () => {
  const [entries, setEntries] = useState<any[]>([]);

  useEffect(() => {
    axios.get('http://localhost:3001/api/daily-inputs')
      .then(res => setEntries(res.data))
      .catch(err => console.error('Fetch failed:', err));
  }, []);

  return (
    <Box display="flex" flexDirection="column" gap={2}>
      {entries.map(entry => (
        <Paper key={entry.log_id} sx={{ p: 2, bgcolor: '#f5f5f5' }}>
          <Typography variant="subtitle1" fontWeight="bold">
            {new Date(entry.log_date).toLocaleDateString()} — {entry.intensity}
          </Typography>
          <Typography variant="body2">Duration: {entry.duration} hrs</Typography>
          <Typography variant="body2">Trigger: {entry.trigger}</Typography>
          <Typography variant="body2">Notes: {entry.notes || '—'}</Typography>

          {entry.symptoms && Object.values(entry.symptoms).some(val => val) && (
            <Typography variant="body2" mt={1}>
              <strong>Symptoms:</strong>{' '}
              {Object.entries(entry.symptoms)
                .filter(([, val]) => val && val !== '')
                .map(([key, val]) => `${key}: ${val}`)
                .join(', ')}
            </Typography>
          )}
        </Paper>
      ))}
    </Box>
  );
};

export default DailyLogHistory;
