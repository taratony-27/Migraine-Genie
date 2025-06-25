import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  MenuItem,
  Stack,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import MedicationHistory from './MedicationHistory';
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
  const [loading, setLoading] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
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
    } catch (err) {
      console.error('Error saving medication:', err);
      alert('Failed to save medication.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box width="100%">
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4" fontWeight="bold" color="#1565c0">
          Medication Log
        </Typography>
        <Button
          variant="outlined"
          onClick={() => setShowHistory((prev) => !prev)}
          sx={{ width: 'fit-content' }}
        >
          {showHistory ? 'Hide History' : 'View History'}
        </Button>
      </Box>

      {showHistory ? (
        <Box mb={4} p={2} border="1px solid #ccc" borderRadius={2}>
          <Typography variant="h6" gutterBottom>
            Medication History
          </Typography>
          <MedicationHistory />
        </Box>
      ) : (
        <Box display="flex" flexDirection="column" gap={2}>
          <TextField
            label="Medication Name"
            name="medication_name"
            value={form.medication_name}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            label="Dosage (e.g., 500mg)"
            name="dosage"
            value={form.dosage}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            label="Frequency (e.g., Twice a day)"
            name="frequency"
            value={form.frequency}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            label="Start Date"
            name="start_date"
            value={form.start_date}
            onChange={handleChange}
            type="date"
            fullWidth
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="End Date"
            name="end_date"
            value={form.end_date}
            onChange={handleChange}
            type="date"
            fullWidth
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="Notes (Optional)"
            name="notes"
            value={form.notes}
            onChange={handleChange}
            multiline
            rows={3}
            fullWidth
          />
          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={handleSubmit}
            disabled={loading}
            sx={{ backgroundColor: '#1565c0', '&:hover': { backgroundColor: '#0d47a1' } }}
          >
            {loading ? 'Saving...' : 'Save Medication'}
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default Medication;
