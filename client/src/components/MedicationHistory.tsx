import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Stack,
  Container,
} from '@mui/material';
import api from '../services/api';

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

const MedicationHistory: React.FC = () => {
  const [history, setHistory] = useState<MedicationEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const resolveUserId = () => {
    const user = localStorage.getItem('user');
    if (!user) return undefined;
    try {
      const parsed = JSON.parse(user);
      return parsed?.user_id ?? parsed?.id ?? parsed?._id;
    } catch {
      return undefined;
    }
  };

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      try {
        const userId = resolveUserId();

        const response = await api.get<MedicationEntry[]>('/api/medications', {
          params: userId ? { userId } : {},
        });
        setHistory(Array.isArray(response.data) ? response.data : []);
      } catch (err) {
        setError('Failed to fetch medication history');
      } finally {
        setLoading(false);
      }
    };

    // attach token if present
    const token = localStorage.getItem('token');
    if (token) api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    fetchHistory();
  }, []);

  if (loading) return <CircularProgress />;
  if (error) return <Typography color="error">{error}</Typography>;
  if (history.length === 0) return <Typography>No medication history found.</Typography>;

  return (
    <Container maxWidth="sm">
      <Box>
        <Stack spacing={2}>
          {history.map((entry) => (
            <Paper
              key={entry._id}
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: '#f9f9f9',
              }}
            >
              <Typography variant="subtitle1" fontWeight="bold">
                {entry.medication_name} – {entry.dosage}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Frequency: {entry.frequency}
              </Typography>
              <Typography variant="body2">
                Duration:{' '}
                {entry.start_date ? new Date(entry.start_date).toLocaleDateString() : '—'} –{' '}
                {entry.end_date ? new Date(entry.end_date).toLocaleDateString() : '—'}
              </Typography>
              {entry.notes && (
                <Typography variant="body2" mt={1}>
                  Notes: {entry.notes}
                </Typography>
              )}
              <Typography
                variant="caption"
                color={entry.taken ? 'success.main' : 'warning.main'}
              >
                {entry.taken ? 'Taken' : 'Missed'}
              </Typography>
            </Paper>
          ))}
        </Stack>
      </Box>
    </Container>
  );
};

export default MedicationHistory;
