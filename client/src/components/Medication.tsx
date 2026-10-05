import React, { useEffect, useState } from 'react';
import {
  Box, Typography, TextField, Stack, Button, Paper,
  Snackbar, Alert, FormControlLabel, Checkbox,
} from '@mui/material';
import HistoryIcon from '@mui/icons-material/History';
import AddIcon from '@mui/icons-material/Add';
import MedicationHistory from './MedicationHistory';
import api from '../services/api';

const Medication: React.FC = () => {
  const [form, setForm] = useState({
    medication_name: '', dosage: '', frequency: '',
    start_date: '', end_date: '', notes: '',
  });
  const [taken, setTaken] = useState(true);
  const [showHistory, setShowHistory] = useState(false);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean; message: string; severity: 'success' | 'error' | 'warning' | 'info';
  }>({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }, []);

  const resolveUserId = () => {
    try {
      const parsed = JSON.parse(localStorage.getItem('user') || '{}');
      return parsed?.user_id ?? parsed?.id ?? parsed?._id ?? 1;
    } catch { return 1; }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    const warn = (message: string) => setSnackbar({ open: true, message, severity: 'warning' });
    if (!form.medication_name.trim()) return warn('Please enter the medication name.');
    if (!form.dosage.trim()) return warn('Please enter the dosage.');
    if (!form.frequency.trim()) return warn('Please enter how often you take it.');
    if (!form.start_date) return warn('Please choose a start date.');
    if (form.end_date && form.end_date < form.start_date) return warn("The end date can't be before the start date.");

    setLoading(true);
    try {
      const userId = resolveUserId();
      // The server assigns the medication_id and owner.
      await api.post('/api/medications', {
        ...form,
        taken,
        created_at: new Date().toISOString(),
      }, { params: { userId } });

      setSnackbar({ open: true, message: 'Medication saved successfully!', severity: 'success' });
      setForm({ medication_name: '', dosage: '', frequency: '', start_date: '', end_date: '', notes: '' });
      setTaken(true);
    } catch (err: any) {
      setSnackbar({ open: true, message: err?.response?.data?.message || 'Failed to save medication.', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      {/* Header row */}
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={3} flexWrap="wrap" gap={1}>
        <Typography variant="h5" fontWeight={800}>Medication</Typography>
        <Button
          variant={showHistory ? 'contained' : 'outlined'}
          size="small"
          startIcon={showHistory ? <AddIcon /> : <HistoryIcon />}
          onClick={() => setShowHistory((v) => !v)}
          sx={{ borderRadius: 2, fontWeight: 600 }}
        >
          {showHistory ? 'Add New' : 'View History'}
        </Button>
      </Box>

      {!showHistory ? (
        <Paper
          elevation={0}
          sx={{
            maxWidth: 520, mx: 'auto',
            p: { xs: 3, md: 4 },
            borderRadius: 3,
            border: '1px solid',
            borderColor: 'divider',
            bgcolor: '#fafbfc',
          }}
        >
          <Stack spacing={2.5}>
            <TextField label="Medication Name" name="medication_name" value={form.medication_name} onChange={handleChange} fullWidth required />
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField label="Dosage (e.g. 500mg)" name="dosage" value={form.dosage} onChange={handleChange} fullWidth required />
              <TextField label="Frequency" name="frequency" value={form.frequency} onChange={handleChange} fullWidth required />
            </Stack>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField label="Start Date" name="start_date" value={form.start_date} onChange={handleChange} type="date" fullWidth required InputLabelProps={{ shrink: true }} />
              <TextField label="End Date" name="end_date" value={form.end_date} onChange={handleChange} type="date" fullWidth InputLabelProps={{ shrink: true }} inputProps={{ min: form.start_date || undefined }} />
            </Stack>
            <TextField label="Notes (optional)" name="notes" value={form.notes} onChange={handleChange} multiline rows={3} fullWidth />
            <FormControlLabel
              control={<Checkbox checked={taken} onChange={(e) => setTaken(e.target.checked)} />}
              label="I took it as planned"
            />
            <Button
              variant="contained" size="large" fullWidth
              onClick={handleSubmit} disabled={loading}
              sx={{ borderRadius: 2, fontWeight: 700, py: 1.5 }}
            >
              {loading ? 'Saving…' : 'Save Medication'}
            </Button>
          </Stack>
        </Paper>
      ) : (
        <Box mt={1}>
          <MedicationHistory />
        </Box>
      )}

      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar((p) => ({ ...p, open: false }))} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert onClose={() => setSnackbar((p) => ({ ...p, open: false }))} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Medication;
