import React, { useState } from 'react';
import { Box, Typography, TextField, Stack, Button, Paper } from '@mui/material';

const Medication: React.FC = () => {
  const [form, setForm] = useState({
    medicationName: '',
    dosage: '',
    frequency: '',
    startDate: '',
    endDate: '',
    notes: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = () => {
    console.log('Form Submitted:', form);
    // Save to backend or localStorage etc.
  };

  return (
    <Box display="flex" flexDirection="column" alignItems="center" p={2}>
      <Typography variant="h5" fontWeight="bold" mb={3}>
        Medication
      </Typography>

      <Paper
        elevation={3}
        sx={{
          width: '100%',
          maxWidth: 500,
          p: { xs: 2, md: 4 },
          borderRadius: 3,
          display: 'flex',
          flexDirection: 'column',
          gap: 3,
          bgcolor: '#fafafa',
        }}
      >
        <Stack spacing={2}>
          <TextField
            label="Medication Name"
            name="medicationName"
            value={form.medicationName}
            onChange={handleChange}
            fullWidth
            variant="outlined"
          />
          <TextField
            label="Dosage (e.g., 500mg)"
            name="dosage"
            value={form.dosage}
            onChange={handleChange}
            fullWidth
            variant="outlined"
          />
          <TextField
            label="Frequency (e.g., Twice a day)"
            name="frequency"
            value={form.frequency}
            onChange={handleChange}
            fullWidth
            variant="outlined"
          />
          <TextField
            label="Start Date"
            name="startDate"
            value={form.startDate}
            onChange={handleChange}
            type="date"
            fullWidth
            InputLabelProps={{ shrink: true }}
            variant="outlined"
          />
          <TextField
            label="End Date"
            name="endDate"
            value={form.endDate}
            onChange={handleChange}
            type="date"
            fullWidth
            InputLabelProps={{ shrink: true }}
            variant="outlined"
          />
          <TextField
            label="Notes (Optional)"
            name="notes"
            value={form.notes}
            onChange={handleChange}
            multiline
            rows={3}
            fullWidth
            variant="outlined"
          />
        </Stack>

        <Button
          variant="contained"
          size="large"
          sx={{
            mt: 3,
            borderRadius: 2,
            fontWeight: 'bold',
          }}
          onClick={handleSubmit}
        >
          Save Medication
        </Button>
      </Paper>
    </Box>
  );
};

export default Medication;
