import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Box,
  Typography,
  Paper,
  Grid
} from '@mui/material';
import {
  Bar,
  Line
} from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const Visualization: React.FC = () => {
  const [entries, setEntries] = useState<any[]>([]);

  useEffect(() => {
    axios.get('http://localhost:3001/api/daily-inputs')
      .then(res => setEntries(res.data))
      .catch(err => console.error('Fetch failed:', err));
  }, []);

  const parsed = entries
    .filter((e) => e.log_date && e.intensity && e.duration)
    .map((e) => ({
      date: new Date(e.log_date).toLocaleDateString('en-GB'),
      intensity: e.intensity,
      duration: parseFloat(e.duration),
    }));

  const intensityCounts: Record<string, number> = {};
  const intensityDurations: Record<string, number> = {};
  const dailyTotals: Record<string, number> = {};

  parsed.forEach(({ date, intensity, duration }) => {
    intensityCounts[intensity] = (intensityCounts[intensity] || 0) + 1;
    intensityDurations[intensity] = (intensityDurations[intensity] || 0) + duration;
    dailyTotals[date] = (dailyTotals[date] || 0) + duration;
  });

  const barDataFrequency = {
    labels: Object.keys(intensityCounts),
    datasets: [{
      label: 'Frequency',
      data: Object.values(intensityCounts),
      backgroundColor: '#64b5f6',
    }],
  };

  const barDataDuration = {
    labels: Object.keys(intensityDurations),
    datasets: [{
      label: 'Total Duration (hrs)',
      data: Object.values(intensityDurations),
      backgroundColor: '#ef5350',
    }],
  };

  const lineData = {
    labels: Object.keys(dailyTotals),
    datasets: [{
      label: 'Daily Duration (hrs)',
      data: Object.values(dailyTotals),
      fill: false,
      borderColor: '#42a5f5',
      backgroundColor: '#42a5f5',
      tension: 0.3,
    }],
  };

  return (
    <Box display="flex" flexDirection="column" width="100%" px={{ xs: 1, sm: 2 }}>
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        Migraine Entry Visualizations
      </Typography>

      <Grid container spacing={2} mb={4} columns={{ xs: 1, sm: 12 }}>
        <Grid item xs={12} sm={4}>
          <Paper sx={{ p: 1, minHeight: 200 }}>
            <Typography variant="subtitle1" gutterBottom>Frequency by Intensity</Typography>
            <Bar data={barDataFrequency} />
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Paper sx={{ p: 1, minHeight: 200 }}>
            <Typography variant="subtitle1" gutterBottom>Total Duration by Intensity</Typography>
            <Bar data={barDataDuration} />
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Paper sx={{ p: 1, minHeight: 200 }}>
            <Typography variant="subtitle1" gutterBottom>Daily Duration Over Time</Typography>
            <Line data={lineData} />
          </Paper>
        </Grid>
      </Grid>

      <Typography variant="h5" fontWeight="bold" gutterBottom>
        Entry List
      </Typography>

      <Box display="flex" flexDirection="column" gap={2}>
        {entries.map((entry) => (
          <Paper key={entry.log_id || entry.log_date + Math.random()} sx={{ p: 2, bgcolor: '#f5f5f5' }}>
            <Typography variant="subtitle1" fontWeight="bold">
              {new Date(entry.log_date).toLocaleDateString()} — {entry.intensity || '—'}
            </Typography>
            <Typography variant="body2">Duration: {entry.duration || '—'} hrs</Typography>
            <Typography variant="body2">Trigger: {entry.trigger || '—'}</Typography>
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
    </Box>
  );
};

export default Visualization;