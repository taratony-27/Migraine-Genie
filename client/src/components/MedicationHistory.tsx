import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Stack,
  Container,
} from '@mui/material';
import axios from 'axios';

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

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await axios.get<MedicationEntry[]>('http://localhost:3001/api/medications');
        setHistory(response.data);
      } catch (err) {
        setError('Failed to fetch medication history');
      } finally {
        setLoading(false);
      }
    };

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
                {new Date(entry.start_date).toLocaleDateString()} –{' '}
                {new Date(entry.end_date).toLocaleDateString()}
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
