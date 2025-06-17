import React, { useState } from 'react';
import { Box, Typography, Divider, Button, TextField, LinearProgress } from '@mui/material';

const WellnessProgram: React.FC = () => {
  const [goalDays, setGoalDays] = useState<number>(0);
  const [completedDays, setCompletedDays] = useState<number>(0);
  const [inputGoal, setInputGoal] = useState<string>('');

  const handleSetGoal = () => {
    const parsed = parseInt(inputGoal);
    if (!isNaN(parsed) && parsed > 0) {
      setGoalDays(parsed);
      setCompletedDays(0); // reset progress when setting a new goal
    }
  };

  const handleMarkDone = () => {
    if (completedDays < goalDays) {
      setCompletedDays(prev => prev + 1);
    }
  };

  const progressPercent = goalDays > 0 ? (completedDays / goalDays) * 100 : 0;

  return (
    <Box display="flex" flexDirection="column" width="100%">
      <Typography variant="subtitle1" color="text.secondary" mb={4} textAlign="center">
        A Journey Toward Healthier Living
      </Typography>

      <Divider sx={{ mb: 4 }} />

      <Typography variant="body1" color="text.secondary" mb={2}>
        Welcome to your personalized wellness hub! Here, you'll find daily exercises,
        mindfulness techniques, and expert health tips designed to improve your lifestyle and well-being.
      </Typography>

      <Typography variant="body1" color="text.secondary" mb={4}>
        Begin your journey to a healthier you by exploring our curated programs tailored to your needs.
      </Typography>

      <Box mb={3} display="flex" gap={2} alignItems="center">
        <TextField
          label="Set goal (days)"
          type="number"
          value={inputGoal}
          onChange={(e) => setInputGoal(e.target.value)}
          sx={{ width: 150 }}
        />
        <Button variant="outlined" onClick={handleSetGoal}>
          Set Goal
        </Button>
      </Box>

      {goalDays > 0 && (
        <Box mb={3}>
          <Typography mb={1}>
            Progress: {completedDays} / {goalDays} days
          </Typography>
          <LinearProgress
            variant="determinate"
            value={progressPercent}
            sx={{ height: 10, borderRadius: 5 }}
          />
          <Button
            variant="contained"
            color="success"
            onClick={handleMarkDone}
            sx={{ mt: 2 }}
            disabled={completedDays >= goalDays}
          >
            Mark Today as Done
          </Button>
        </Box>
      )}

      <Box textAlign="center" mt={4}>
        <Button
          variant="contained"
          size="large"
          color="primary"
          href="/dashboard"
          sx={{ borderRadius: 8, px: 5, py: 1.5, fontWeight: 'bold' }}
        >
          Start Now
        </Button>
      </Box>
    </Box>
  );
};

export default WellnessProgram;
