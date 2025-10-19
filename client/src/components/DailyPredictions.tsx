import React, { useEffect, useState } from 'react';
import { Box, Typography, Grid, Paper, CircularProgress } from '@mui/material';
import api from '../services/api'; // adjust path if needed

const getToday = () => {
  return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][new Date().getDay()];
};

const DailyPredictions: React.FC<{ userId: string | number | null }> = ({ userId }) => {
  const today = getToday();
  const [entryCount, setEntryCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch daily log count for the user
    api
      .get(`/api/daily-inputs/my/count?userId=${userId}`)
      .then((res) => {
        console.log('Entry count:', res.data.count);
        setEntryCount(res.data.count);
      })
      .catch(() => setEntryCount(0))
      .finally(() => setLoading(false));
  }, [userId]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
        <CircularProgress />
      </Box>
    );
  }

  if (entryCount !== null && entryCount < 10) {
    return (
      <Box display="flex" flexDirection="column" alignItems="center" mt={4}>
        <Typography variant="h6" color="textSecondary">
          Add 10 or more daily log entries to see trigger predictions.
        </Typography>
      </Box>
    );
  }

  return (
    <Box display="flex" flexDirection="column" gap={2}>
      {/* Risk Status */}
      <Typography variant="h6" fontWeight="bold" color="error">
        High Likelihood of Migraine Today
      </Typography>
      <Typography variant="body2" color="textSecondary">
        Based on recent patterns and environmental factors, these are your potential triggers:
      </Typography>

      {/* Trigger Cards */}
      <Grid container spacing={2}>
        {[
          { icon: "🛌", label: "Lack of Sleep", risk: "High Risk" },
          { icon: "🌡️", label: "Weather Change", risk: "Medium Risk" },
          { icon: "💧", label: "Dehydration", risk: "Low Risk" },
        ].map((trigger, index) => (
          <Grid item xs={12} sm={4} key={index}> {/* <-- Responsive here */}
            <Paper
              elevation={2}
              sx={{
                p: 1,
                textAlign: 'center',
                borderRadius: 2,
                bgcolor: "#f9f9f9",
              }}
            >
              <Typography variant="h3">{trigger.icon}</Typography>
              <Typography variant="subtitle2" fontWeight="bold" noWrap>
                {trigger.label}
              </Typography>
              <Typography
                variant="caption"
                color={
                  trigger.risk.includes("High")
                    ? "error"
                    : trigger.risk.includes("Medium")
                    ? "warning.main"
                    : "success.main"
                }
              >
                {trigger.risk}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Migraine Risk Forecast */}
      <Box mt={3}>
        <Typography variant="subtitle1" fontWeight="bold" mb={1}>
          Migraine Risk Forecast
        </Typography>
        <Grid container spacing={1} justifyContent="center">
          {[
            { day: "Sun", risk: "30%" },
            { day: "Mon", risk: "40%" },
            { day: "Tue", risk: "80%" },
            { day: "Wed", risk: "50%" },
            { day: "Thu", risk: "60%" },
            { day: "Fri", risk: "50%" },
            { day: "Sat", risk: "35%" },
          ].map((forecast, index) => {
            const isToday = forecast.day === today;
            return (
              <Grid item key={index}>
                <Paper
                  elevation={isToday ? 4 : 1}
                  sx={{
                    p: 1,
                    width: 60,
                    height: 60,
                    borderRadius: "50%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    bgcolor: isToday ? "#ffe0e0" : "#f0f0f0",
                    border: isToday ? "2px solid #ff5252" : "none",
                  }}
                >
                  <Typography variant="body2" fontWeight="bold">
                    {forecast.risk}
                  </Typography>
                  <Typography variant="caption">{forecast.day}</Typography>
                </Paper>
              </Grid>
            );
          })}
        </Grid>
      </Box>

      {/* Recommendations */}
      <Box mt={3}>
        <Typography variant="subtitle1" fontWeight="bold" mb={1}>
          Recommendations
        </Typography>
        <Box component="ul" pl={2}>
          <li>Increase water intake today</li>
          <li>Aim for 7+ hours of sleep tonight</li>
          <li>Reduce screen time in the evening</li>
        </Box>
      </Box>
    </Box>
  );
};

export default DailyPredictions;
