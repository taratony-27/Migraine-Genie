import React, { useEffect, useState } from 'react';
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
import api from '../services/api';

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

  // attach token if present
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }, []);

  const resolveUserId = () => {
    const user = localStorage.getItem('user');
    if (!user) return 1;
    try {
      const parsed = JSON.parse(user);
      return parsed?.user_id ?? parsed?.id ?? parsed?._id ?? 1;
    } catch {
      return 1;
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const userId = resolveUserId();
      const payload = {
        ...form,
        user_id: userId,
        medication_id: Math.floor(Math.random() * 1000),
        taken: true,
        created_at: new Date().toISOString(),
      };

      await api.post('/api/medications', payload, { params: { userId } });

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
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            justifyContent: { xs: 'flex-start', sm: 'center' },
          }}
        >
          <Typography
            variant="h5"
            fontWeight="bold"
            textAlign="center"
            sx={{ fontSize: { xs: '1.2rem', sm: '1.8rem', md: '2rem' } }}
          >
            Medication
          </Typography>
        </Box>

        <Button
          variant="outlined"
          size="small"
          sx={{
            position: 'absolute',
            right: 0,
            width: { xs: '80px', sm: 'fit-content' },
            fontSize: { xs: '0.5rem', sm: '1rem' },
            padding: { xs: '3px 7px', sm: '6px 12px' },
            whiteSpace: 'nowrap',
          }}
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
            sx={{ mt: 3, borderRadius: 2, fontWeight: 'bold' }}
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
