import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Paper, CircularProgress, Grid, Chip,
} from '@mui/material';
import api from '../services/api';
import { formatLogDate } from '../utils/date';

interface MedicationEntry {
  _id: string;
  medication_name: string;
  dosage: string;
  frequency: string;
  start_date: string;
  end_date: string;
  notes?: string;
  taken: boolean;
  created_at: string;
}

// Dates are stored as UTC midnight; read the calendar day so it doesn't shift a day west of UTC.
const fmtDate = (d?: string) => formatLogDate(d, { month: 'short', day: 'numeric', year: 'numeric' });

const MedicationHistory: React.FC = () => {
  const [history, setHistory] = useState<MedicationEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    const fetchHistory = async () => {
      try {
        const user = localStorage.getItem('user');
        let userId: any;
        if (user) {
          const p = JSON.parse(user);
          userId = p?.user_id ?? p?.id ?? p?._id;
        }
        const res = await api.get<MedicationEntry[]>('/api/medications', { params: userId ? { userId } : {} });
        setHistory(Array.isArray(res.data) ? res.data : []);
      } catch {
        setError('Failed to load medication history.');
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  if (loading) return <Box display="flex" justifyContent="center" py={6}><CircularProgress /></Box>;
  if (error) return <Typography color="error" p={2}>{error}</Typography>;
  if (!history.length) return (
    <Box p={4} textAlign="center" sx={{ border: '1px dashed #cbd5e1', borderRadius: 3, bgcolor: '#f8fafc' }}>
      <Typography fontWeight={700}>No medications logged yet.</Typography>
      <Typography variant="body2" color="text.secondary">Add your first medication using the form.</Typography>
    </Box>
  );

  return (
    <Grid container spacing={2}>
      {history.map((entry) => (
        <Grid item xs={12} sm={6} key={entry._id}>
          <Paper
            elevation={0}
            sx={{
              p: 2.5, borderRadius: 3,
              border: '1px solid', borderColor: 'divider',
              height: '100%', display: 'flex', flexDirection: 'column', gap: 1,
            }}
          >
            <Box display="flex" alignItems="flex-start" justifyContent="space-between" gap={1}>
              <Box>
                <Typography variant="subtitle1" fontWeight={700}>{entry.medication_name}</Typography>
                <Typography variant="body2" color="text.secondary">{entry.dosage} · {entry.frequency}</Typography>
              </Box>
              <Chip
                size="small"
                label={entry.taken ? 'Taken' : 'Missed'}
                color={entry.taken ? 'success' : 'warning'}
                sx={{ fontWeight: 700, flexShrink: 0 }}
              />
            </Box>

            <Typography variant="body2" color="text.secondary">
              {fmtDate(entry.start_date)} → {fmtDate(entry.end_date)}
            </Typography>

            {entry.notes && (
              <Typography variant="body2" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
                {entry.notes}
              </Typography>
            )}
          </Paper>
        </Grid>
      ))}
    </Grid>
  );
};

export default MedicationHistory;
