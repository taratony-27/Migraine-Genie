import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  MenuItem,
  Paper,
  Grid,
} from '@mui/material';

const intensityLevels = ['Mild', 'Moderate', 'Severe'];
const triggers = [
  'Stress', 'Lack of sleep', 'Dehydration', 'Hormonal changes', 'Certain foods', 'Weather', 'Bright lights', 'Noise'
];

const Diary: React.FC = () => {
  const [entry, setEntry] = useState({
    date: '',
    duration: '',
    intensity: '',
    trigger: '',
    notes: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEntry(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    console.log('Diary entry submitted:', entry);
    // You can connect this to your backend or local storage
    alert("Migraine entry saved!");
  };

  return (
    <Box minHeight="100vh" display="flex" justifyContent="center" alignItems="center" bgcolor="#f4faff" px={2}>
      <Paper
        elevation={6}
        sx={{
          maxWidth: 600,
          width: '100%',
          padding: 4,
          borderRadius: 4,
          backgroundColor: '#ffffff',
        }}
      >
        <Typography variant="h4" fontWeight="bold" color="#1565c0" gutterBottom>
          Migraine Diary Entry
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              label="Date"
              type="date"
              fullWidth
              name="date"
              value={entry.date}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              label="Duration (in hours)"
              type="number"
              fullWidth
              name="duration"
              value={entry.duration}
              onChange={handleChange}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              select
              label="Intensity"
              fullWidth
              name="intensity"
              value={entry.intensity}
              onChange={handleChange}
            >
              {intensityLevels.map(level => (
                <MenuItem key={level} value={level}>
                  {level}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12}>
            <TextField
              select
              label="Trigger"
              fullWidth
              name="trigger"
              value={entry.trigger}
              onChange={handleChange}
            >
              {triggers.map(trigger => (
                <MenuItem key={trigger} value={trigger}>
                  {trigger}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12}>
            <TextField
              label="Additional Notes"
              name="notes"
              value={entry.notes}
              onChange={handleChange}
              fullWidth
              multiline
              minRows={3}
            />
          </Grid>

          <Grid item xs={12}>
            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={handleSubmit}
              sx={{ backgroundColor: '#1565c0', '&:hover': { backgroundColor: '#0d47a1' } }}
            >
              Save Entry
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default Diary;
