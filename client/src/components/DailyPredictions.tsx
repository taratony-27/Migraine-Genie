import React from 'react';
import { Box, Typography, Grid, Paper } from '@mui/material';

const DailyPredictions: React.FC = () => (
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
        <Grid item xs={4} key={index}>
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
              color={trigger.risk.includes("High") ? "error" :
                     trigger.risk.includes("Medium") ? "warning.main" :
                     "success.main"}
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
          { day: "Mon", risk: "40%" },
          { day: "Tues", risk: "80%" },
          { day: "Wed", risk: "50%" },
          { day: "Thurs", risk: "60%" },
          { day: "Fri", risk: "50%" },
        ].map((forecast, index) => (
          <Grid item key={index}>
            <Paper
              elevation={1}
              sx={{
                p: 1,
                width: 60,
                height: 60,
                borderRadius: "50%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: "#f0f0f0",
              }}
            >
              <Typography variant="body2" fontWeight="bold">
                {forecast.risk}
              </Typography>
              <Typography variant="caption">
                {forecast.day}
              </Typography>
            </Paper>
          </Grid>
        ))}
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

export default DailyPredictions;
