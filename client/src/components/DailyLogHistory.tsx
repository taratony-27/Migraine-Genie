import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Stack,
  Grid,
  Divider,
  Skeleton,
  Snackbar,
  Alert,
  Tooltip,
} from '@mui/material';
import api from '../services/api';
import { dateSortValue, formatLogDate } from '../utils/date';

type Entry = {
  _id?: string;
  log_id?: string | number;
  log_date?: string;
  intensity?: string;
  duration?: number | string | null;
  sleep?: number | string | null;
  screentime?: number | string | null;
  trigger?: any; // can be string or object
  notes?: string | null;
  symptoms?: Record<string, string>;
};

const intensityColor = (level?: string) => {
  const v = (level || '').toLowerCase();
  if (v === 'severe') return 'error';
  if (v === 'moderate') return 'warning';
  if (v === 'mild') return 'success';
  return 'default';
};

const coerceTriggers = (trigger: any): string[] => {
  if (!trigger) return [];
  if (typeof trigger === 'string') {
    return trigger
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  }
  if (typeof trigger === 'object') {
    return Object.values(trigger)
      .flatMap((v) =>
        typeof v === 'string'
          ? v.split(',').map((s) => s.trim()).filter(Boolean)
          : []
      )
      .filter(Boolean);
  }
  return [];
};

const fmtDate = (iso?: string) => formatLogDate(iso);

const DailyLogHistory: React.FC = () => {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'warning' | 'info' }>({
    open: false,
    message: '',
    severity: 'error',
  });

  useEffect(() => {
    const fetchEntries = async () => {
      try {
        // include userId if present
        const user = localStorage.getItem('user');
        let userId: string | number | undefined;
        if (user) {
          try {
            const parsed = JSON.parse(user);
            userId = parsed?.user_id ?? parsed?.id ?? parsed?._id;
          } catch {}
        }

        const res = await api.get('/api/daily-inputs', { params: userId ? { userId } : {} });
        setEntries(Array.isArray(res.data) ? res.data : []);
      } catch (err: any) {
        console.error('Fetch failed:', err);
        setToast({
          open: true,
          message: err?.response?.data?.message || 'Failed to load history.',
          severity: 'error',
        });
      } finally {
        setLoading(false);
      }
    };
    fetchEntries();
  }, []);

  // newest first
  const sorted = useMemo(
    () =>
      [...entries].sort((a, b) => dateSortValue(b.log_date) - dateSortValue(a.log_date)),
    [entries]
  );

  if (loading) {
    return (
      <Grid container spacing={2}>
        {Array.from({ length: 4 }).map((_, i) => (
          <Grid key={i} item xs={12} md={6}>
            <Card>
              <CardHeader
                title={<Skeleton width="60%" />}
                subheader={<Skeleton width="40%" />}
              />
              <CardContent>
                <Stack direction="row" spacing={1} mb={1}>
                  <Skeleton variant="rounded" width={80} height={28} />
                  <Skeleton variant="rounded" width={110} height={28} />
                  <Skeleton variant="rounded" width={120} height={28} />
                </Stack>
                <Skeleton height={18} width="85%" />
                <Skeleton height={18} width="70%" />
                <Skeleton height={18} width="60%" />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  }

  if (!sorted.length) {
    return (
      <Box
        sx={{
          p: 4,
          textAlign: 'center',
          borderRadius: 3,
          border: '1px dashed #cbd5e1',
          bgcolor: '#f8fafc',
        }}
      >
        <Typography variant="h6" fontWeight={700}>
          No entries yet
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Your past migraine diary entries will show up here after you save them.
        </Typography>
      </Box>
    );
  }

  return (
    <>
      <Grid container spacing={2}>
        {sorted.map((entry, idx) => {
          const id = entry._id || entry.log_id || String(idx);
          const triggers = coerceTriggers(entry.trigger);
          const nonEmptySymptoms =
            entry.symptoms
              ? Object.entries(entry.symptoms)
                  .filter(([, v]) => v && String(v).toLowerCase() !== 'no')
                  .slice(0, 12) // keep it tidy
              : [];

          return (
            <Grid key={id} item xs={12} md={6}>
              <Card sx={{ borderRadius: 3, boxShadow: '0 4px 24px rgba(33,28,132,0.08)' }}>
                <CardHeader
                  title={
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Typography variant="subtitle1" fontWeight={700}>
                        {fmtDate(entry.log_date)}
                      </Typography>
                      <Chip
                        size="small"
                        label={entry.intensity || '—'}
                        color={intensityColor(entry.intensity) as any}
                        variant="filled"
                      />
                    </Stack>
                  }
                  subheader={
                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                      <Chip
                        size="small"
                        variant="outlined"
                        label={`Duration: ${entry.duration ?? '—'}h`}
                      />
                      <Chip
                        size="small"
                        variant="outlined"
                        label={`Sleep: ${entry.sleep ?? '—'}h`}
                      />
                      <Chip
                        size="small"
                        variant="outlined"
                        label={`Screen: ${entry.screentime ?? '—'}h`}
                      />
                    </Stack>
                  }
                />
                <CardContent>
                  {/* Triggers */}
                  <Stack spacing={1} mb={1.5}>
                    <Typography variant="caption" color="text.secondary">
                      Triggers
                    </Typography>
                    {triggers.length ? (
                      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                        {triggers.map((t, i) => (
                          <Chip key={i} size="small" label={t} />
                        ))}
                      </Stack>
                    ) : (
                      <Typography variant="body2">—</Typography>
                    )}
                  </Stack>

                  <Divider sx={{ my: 1.5 }} />

                  {/* Symptoms */}
                  <Stack spacing={1} mb={1.5}>
                    <Typography variant="caption" color="text.secondary">
                      Symptoms
                    </Typography>
                    {nonEmptySymptoms.length ? (
                      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                        {nonEmptySymptoms.map(([k, v]) => (
                          <Tooltip key={k} title={k}>
                            <Chip size="small" label={v} />
                          </Tooltip>
                        ))}
                      </Stack>
                    ) : (
                      <Typography variant="body2">—</Typography>
                    )}
                  </Stack>

                  <Divider sx={{ my: 1.5 }} />

                  {/* Notes */}
                  <Stack spacing={0.5}>
                    <Typography variant="caption" color="text.secondary">
                      Notes
                    </Typography>
                    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                      {entry.notes || '—'}
                    </Typography>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      <Snackbar
        open={toast.open}
        autoHideDuration={3000}
        onClose={() => setToast((t) => ({ ...t, open: false }))}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          elevation={6}
          variant="filled"
          onClose={() => setToast((t) => ({ ...t, open: false }))}
          severity={toast.severity}
          sx={{ width: '100%' }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default DailyLogHistory;
