import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Stack,
  Button,
  Paper,
} from '@mui/material';
import MedicationHistory from './MedicationHistory';
import { useTheme, useMediaQuery } from '@mui/material';
import axios from 'axios';

const Medication: React.FC = () => {
  const [form, setForm] = useState({
    medication_name: '',
    dosage: '',
    frequency: '',
    start_date: '',
    end_date: '',
    notes: '',
  });

  const [showHistory, setShowHistory] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const payload = {
        ...form,
        user_id: 1,
        medication_id: Math.floor(Math.random() * 1000),
        taken: true,
        created_at: new Date().toISOString(),
      };

      await axios.post('http://localhost:3001/api/medications', payload);

      alert('Medication saved successfully.');
      setForm({
        medication_name: '',
        dosage: '',
        frequency: '',
        start_date: '',
        end_date: '',
        notes: '',
      });
    } catch (error) {
      console.error('Save failed:', error);
      alert('Failed to save medication.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box display="flex" flexDirection="column" alignItems="center" p={2}>
      {/* Header with Centered Title and Right-Aligned Button */}
      <Box
        width="100%"
        maxWidth={560}
        mb={2}
        position="relative"
        display="flex"
        justifyContent="center"
        alignItems="center"
      >
        <Typography variant="h5" fontWeight="bold" textAlign="center">
          Medication
        </Typography>

        <Button
          variant="outlined"
          size="small"
          sx={{ position: 'absolute', right: 0 }}
          onClick={() => setShowHistory((prev) => !prev)}
        >
          {showHistory ? 'Hide History' : 'View History'}
        </Button>
      </Box>

      {/* Form */}
      {!showHistory && (
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
              name="medication_name"
              value={form.medication_name}
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
              name="start_date"
              value={form.start_date}
              onChange={handleChange}
              type="date"
              fullWidth
              InputLabelProps={{ shrink: true }}
              variant="outlined"
            />
            <TextField
              label="End Date"
              name="end_date"
              value={form.end_date}
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
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save Medication'}
          </Button>
        </Paper>
      )}

      {/* History */}
      {showHistory && (
        <Box width="100%" maxWidth={700} mt={2}>
          <MedicationHistory />
        </Box>
      )}
    </Box>
  );
};

export default Medication;
