import React, { useState } from 'react';
import { Box, Typography, TextField, Button, MenuItem } from '@mui/material';

const intensityLevels = ['Mild', 'Moderate', 'Severe'];
const triggers = [
  'Stress', 'Lack of sleep', 'Dehydration', 'Hormonal changes', 'Certain foods', 'Weather', 'Bright lights', 'Noise'
];

const DailyLog: React.FC = () => {
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
    alert("Migraine entry saved!");
  };

  return (
    <Box width="100%">
      <Typography variant="h4" fontWeight="bold" color="#1565c0" mb={3}>
        Migraine Diary Entry
      </Typography>

      <Box display="flex" flexDirection="column" gap={2}>
        <TextField
          label="Date"
          type="date"
          fullWidth
          name="date"
          value={entry.date}
          onChange={handleChange}
          InputLabelProps={{ shrink: true }}
        />

        <TextField
          label="Duration (in hours)"
          type="number"
          fullWidth
          name="duration"
          value={entry.duration}
          onChange={handleChange}
        />

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

        <TextField
          label="Additional Notes"
          name="notes"
          value={entry.notes}
          onChange={handleChange}
          fullWidth
          multiline
          minRows={3}
        />

        <Button
          variant="contained"
          color="primary"
          fullWidth
          onClick={handleSubmit}
          sx={{ backgroundColor: '#1565c0', '&:hover': { backgroundColor: '#0d47a1' } }}
        >
          Save Entry
        </Button>
      </Box>
    </Box>
  );
};

export default DailyLog;
