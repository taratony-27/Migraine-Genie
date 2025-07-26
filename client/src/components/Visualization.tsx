import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Tooltip,
} from '@mui/material';

import {
  Bar,
  Line
} from 'react-chartjs-2';
import Heatmap from '@nivo/heatmap';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Legend
} from 'chart.js';
import { DateCalendar, PickersDay } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { styled } from '@mui/material/styles';
import dayjs from 'dayjs';
import { HeatMap } from '@nivo/heatmap';
import { number } from 'framer-motion';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Legend
);
const Visualization: React.FC = () => {
  const [entries, setEntries] = useState<any[]>([]);

  useEffect(() => {
    axios.get('http://localhost:3001/api/daily-inputs/')
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

  const [currentMonth, setCurrentMonth] = useState(dayjs()); // Default to current month
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const startOfMonth = currentMonth.startOf('month');
  const endOfMonth = currentMonth.endOf('month');
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // build calendar days
  const calendarDays: (dayjs.Dayjs | null)[] = [];
  const startDayIndex = startOfMonth.day();
  for (let i = 0; i < startDayIndex; i++) {
    calendarDays.push(null); 
  }
  for (let d = 1; d <= endOfMonth.date(); d++) {
    calendarDays.push(dayjs(new Date(currentMonth.year(), currentMonth.month(), d)));
  }

  // convert symptoms to severity
  const severityByDate: Record<string, number> = {};
  // Handlers for navigating months
  const handlePreviousMonth = () => {
    setCurrentMonth((prev) => prev.subtract(1, 'month'));
  };

  const handleNextMonth = () => {
    setCurrentMonth((prev) => prev.add(1, 'month'));
  };
  entries.forEach((entry: any) => {
    const date = new Date(entry.log_date).toISOString().split('T')[0];
    const symptoms = entry.symptoms || {};
    const totalSeverity = Object.values(symptoms)
    .map((val: any) => {
      // Most values are already numbers (0, 1, 2, 3)
      if (typeof val === 'number') {
        return val;
      }
      // Default fallback
      return 0;
    })
      .reduce((sum: number, val: number) => sum + val, 0);

    severityByDate[date] = (severityByDate[date] || 0) + totalSeverity;
    console.log(`Date: ${date}, Total Severity: ${totalSeverity}, Symptoms:`, symptoms);
  });

  const getHeatColor = (intensity: number) => {
    if (intensity === 0) return '#dadada';     // None
    if (intensity <= 10) return '#cadeef';     // Mild
    if (intensity <= 20) return '#9bd4e4';     // Moderate
    if (intensity <= 35) return '#39ace7';     // Severe
    return '#0784b5';                          // Extreme
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

      <Typography variant="h6" fontWeight="bold" gutterBottom>
        Symptom Intensity Calendar Heatmap
      </Typography>

      <Paper 
        sx={{
          p: { xs: 1, sm: 2 }, // Smaller padding for phones
          mb: { xs: 2, sm: 4 }, // Adjust margin for phones
        }}
      >
        {/* Month Navigation */}
        <Grid container justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Button variant="outlined" 
            sx={{
            fontSize: { xs: '0.5rem', sm: '0.9rem' }, // Smaller font size for phones
            padding: { xs: '1px 5px', sm: '6px 12px' }, // Adjust button padding
          }}
          onClick={handlePreviousMonth}>
            Previous Month
          </Button>
          <Typography variant="h6" fontWeight="bold"
            sx={{
              fontSize: { xs: '0.8rem', sm: '1.25rem' }, // Smaller font size for phones
            }}
          >
            {currentMonth.format('MMMM YYYY')}
          </Typography>
          <Button variant="outlined" 
            sx={{
              fontSize: { xs: '0.5rem', sm: '0.9rem' },
              padding: { xs: '1px 5px', sm: '6px 12px' },
            }}
          onClick={handleNextMonth}>
            Next Month
          </Button>
        </Grid>

        {/* Weekday Headers */}
        <Grid container spacing={1}>
          {weekDays.map((day) => (
            <Grid item xs={1.71} key={day}>
              <Typography variant="caption" fontWeight="bold"
                sx={{
                  fontSize: { xs: '0.6rem', sm: '0.8rem' }, // Smaller font size for phones
                }}
                >
                {day}
              </Typography>
            </Grid>
          ))}
        </Grid>

        {/* Calendar Days */}
        <Grid container spacing={1}>
          {calendarDays.map((day, idx) => {
            if (!day) return <Grid item xs={1.71} key={`empty-${idx}`} />;
            const dateStr = day.format('YYYY-MM-DD');
            const severity = severityByDate[dateStr] || 0;
            return (
              <Grid item xs={1.71} key={dateStr}>
                <Tooltip title={`Intensity Sum: ${severity}`} arrow>
                  <Paper
                    onClick={() => setSelectedDate(dateStr)} // ⬅️ Make date clickable
                    sx={{
                      backgroundColor: getHeatColor(severity),
                      height: { xs: 30, sm: 40 },
                      width: { xs: 30, sm: 40 },
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      cursor: 'pointer', // ⬅️ visual cue
                      border: selectedDate === dateStr ? '2px solid black' : 'none' // Optional highlight
                    }}
                  >
                    <Typography variant="caption"
                      sx={{
                        fontSize: { xs: '0.6rem', sm: '0.8rem' },
                      }}
                    >
                      {day.date()}
                    </Typography>
                  </Paper>
                </Tooltip>
              </Grid>
            );
          })}
        </Grid>
        {/* Heatmap Legend */}
        <Box mt={2}>
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom
            sx={{
              fontSize: { xs: '0.8rem', sm: '1rem' }, // Smaller font size for phones
            }}
          >
            Legend
          </Typography>
          <Grid container 
          rowSpacing={2} 
          columnSpacing={3} 
          alignItems="center"
          justifyContent="space-between" 
          sx={{
            flexWrap: 'wrap', 
          }}
          >
            <Grid item xs={2}>
              <Box 
                sx={{
                  backgroundColor: '#dadada',
                  width: { xs: 15, sm: 20 }, 
                  height: { xs: 15, sm: 20 }, 
                  borderRadius: '50%',
                  mr: { xs: 0.3, sm: 0.6 },
                }}
              />
              <Typography variant="caption" ml={1}
                sx={{
                  fontSize: { xs: '0.4rem', sm: '0.8rem' },
                  whiteSpace: 'nowrap',
                  ml: -0.4
                }}
              >
                No Severity
              </Typography>
            </Grid>
            <Grid item xs={2}>
              <Box
                sx={{
                  backgroundColor: '#cadeef',
                  width: { xs: 15, sm: 20 },
                  height: { xs: 15, sm: 20 },
                  borderRadius: '50%',
                  mr: { xs: 0.3, sm: 0.6 },
                }}
              />
              <Typography variant="caption" ml={1}
                sx={{
                  fontSize: { xs: '0.4rem', sm: '0.8rem' },
                  whiteSpace: 'nowrap',
                  ml: -0.4
                }}
              >
              Mild(1–10)
              </Typography>
            </Grid>
            <Grid item xs={2}>
              <Box
                sx={{
                  backgroundColor: '#9bd4e4',
                  width: { xs: 15, sm: 20 },
                  height: { xs: 15, sm: 20 },
                  borderRadius: '50%',
                  mr: { xs: 0.3, sm: 0.6 },
                }}
              />
              <Typography variant="caption" ml={1}
                sx={{
                  fontSize: { xs: '0.4rem', sm: '0.8rem' },
                  whiteSpace: 'nowrap',
                  ml: -0.4
                }}
              >
              Moderate(11–20)
              </Typography>
            </Grid>
            <Grid item xs={2}>
              <Box
                sx={{
                  backgroundColor: '#39ace7',
                  width: { xs: 15, sm: 20 },
                  height: { xs: 15, sm: 20 },
                  borderRadius: '50%',
                  mr: { xs: 0.3, sm: 0.6 },
                }}
              />
              <Typography variant="caption" ml={1}
                sx={{
                  fontSize: { xs: '0.4rem', sm: '0.8rem' },
                  whiteSpace: 'nowrap',
                  ml: -0.4
                }}
              >
              Severe(21–35)
              </Typography>
            </Grid>
            <Grid item xs={2}>
              <Box
                sx={{
                  backgroundColor: '#0784b5',
                  width: { xs: 15, sm: 20 },
                  height: { xs: 15, sm: 20 },
                  borderRadius: '50%',
                  mr: { xs: 0.3, sm: 0.6 },
                }}
              />
              <Typography variant="caption" ml={1}
                sx={{
                  fontSize: { xs: '0.4rem', sm: '0.8rem' },
                  whiteSpace: 'nowrap',
                  ml: -0.4
                }}
              >
              Extreme(36+)
              </Typography>
            </Grid>
          </Grid>
        </Box>
      </Paper>

      <Typography variant="h5" fontWeight="bold" gutterBottom>
        Entry List
      </Typography>

      {selectedDate && (
        <>
          <Typography variant="h6" fontWeight="bold" mt={3} gutterBottom>
            Entries for {dayjs(selectedDate).format('MMMM D, YYYY')}
          </Typography>
          <Box display="flex" flexDirection="column" gap={2} mb={4}>
            {entries
              .filter((entry) =>
                new Date(entry.log_date).toISOString().split('T')[0] === selectedDate
              )
              .map((entry) => (
                <Paper key={entry.log_id || entry.log_date + Math.random()} sx={{ p: 2, bgcolor: '#e8f4fc' }}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    Intensity: {entry.intensity || '—'}
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
        </>
      )}

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