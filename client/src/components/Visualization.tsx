import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Tooltip,
  Chip,
  CircularProgress,
  Divider,
} from '@mui/material';

import { Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Legend,
  Tooltip as ChartTooltip,
} from 'chart.js';

import dayjs from 'dayjs';
import api from '../services/api';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Legend,
  ChartTooltip
);

type Entry = {
  log_id?: number;
  log_date: string | Date;
  intensity?: 'Mild' | 'Moderate' | 'Severe' | string;
  duration?: string | number;
  trigger?:
    | {
        potentialTrigger?: string | null;
        weather?: string | null;
        food?: string | null;
        activity?: string | null;
      }
    | null;
  notes?: string | null;
  symptoms?: Record<string, string | number | null>;
};

const severityMap: Record<string, number> = { No: 0, Mild: 1, Moderate: 2, Severe: 3 };

const formatTrigger = (t: Entry['trigger']) => {
  if (!t || typeof t !== 'object') return '—';
  const parts = [t.potentialTrigger, t.weather, t.food, t.activity]
    .filter((x): x is string => !!x && String(x).trim().length > 0);
  return parts.length ? parts.join(' · ') : '—';
};

const getHeatColor = (sum: number) => {
  if (sum === 0) return '#E0E0E0';
  if (sum <= 10) return '#D7EAF9';
  if (sum <= 20) return '#A9D7EF';
  if (sum <= 35) return '#53B5E9';
  return '#0D8FD1';
};

const card = {
  p: 2,
  borderRadius: 2,
  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
  border: '1px solid rgba(0,0,0,0.04)',
  bgcolor: '#fff',
};

const ENTRY_MIN_HEIGHT = 220;

const severityChip = (v: string | number | null | undefined) => {
  const s = typeof v === 'number' ? v : String(v || '').trim();
  const norm =
    typeof s === 'number'
      ? s
      : s.toLowerCase() === 'mild'
      ? 'Mild'
      : s.toLowerCase() === 'moderate'
      ? 'Moderate'
      : s.toLowerCase() === 'severe'
      ? 'Severe'
      : s.toLowerCase() === 'yes'
      ? 'Yes'
      : s.toLowerCase() === 'no'
      ? 'No'
      : '';

  const colors: Record<string, { bg: string; fg: string }> = {
    No: { bg: '#E0E0E0', fg: '#1e293b' },
    Mild: { bg: '#D7EAF9', fg: '#0f172a' },
    Moderate: { bg: '#A9D7EF', fg: '#0f172a' },
    Severe: { bg: '#53B5E9', fg: '#0b1324' },
    Yes: { bg: '#A9D7EF', fg: '#0f172a' },
    '': { bg: '#E0E0E0', fg: '#1e293b' },
  };

  return colors[norm] ?? colors[''];
};

const SymptomPills: React.FC<{ symptoms?: Record<string, string | number | null> }> = ({ symptoms }) => {
  if (!symptoms || Object.keys(symptoms).length === 0) return null;
  const items = Object.entries(symptoms).filter(
    ([, v]) => v !== null && v !== '' && String(v).toLowerCase() !== 'no'
  );
  if (items.length === 0) return null;

  return (
    <Box mt={1}>
      <Typography variant="body2" sx={{ mb: 0.5 }}>
        <strong>Symptoms:</strong>
      </Typography>
      <Box display="flex" flexWrap="wrap" gap={1}>
        {items.map(([key, v]) => {
          const { bg, fg } = severityChip(v);
          return (
            <Chip
              key={key}
              label={`${key}: ${v}`}
              size="small"
              sx={{
                bgcolor: bg,
                color: fg,
                borderRadius: '9999px',
                border: '1px solid rgba(0,0,0,0.06)',
                '.MuiChip-label': { px: 1.25, py: 0.25 },
              }}
            />
          );
        })}
      </Box>
    </Box>
  );
};

const Visualization: React.FC = () => {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentMonth, setCurrentMonth] = useState(dayjs());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // attach token if present
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }, []);

  useEffect(() => {
    let mounted = true;
    const fetchEntries = async () => {
      setLoading(true);
      try {
        // forward userId if available
        const user = localStorage.getItem('user');
        let userId: string | number | undefined;
        if (user) {
          try {
            const parsed = JSON.parse(user);
            userId = parsed?.user_id ?? parsed?.id ?? parsed?._id;
          } catch {}
        }

        const res = await api.get<Entry[]>('/api/daily-inputs/', {
          params: userId ? { userId } : {},
        });

        if (!mounted) return;
        setEntries(Array.isArray(res.data) ? res.data : []);
        setError(null);
      } catch (err) {
        console.error('Fetch failed:', err);
        if (!mounted) return;
        setError('Failed to load entries');
      } finally {
        mounted && setLoading(false);
      }
    };

    fetchEntries();
    return () => {
      mounted = false;
    };
  }, []);

  const { barDataFrequency, barDataDuration, lineData, severityByDate, topSymptoms } = useMemo(() => {
    const parsed = entries
      .filter((e) => e.log_date && e.intensity && e.duration !== undefined && e.duration !== null)
      .map((e) => {
        const d = new Date(e.log_date);
        return {
          dateKey: dayjs(d).format('YYYY-MM-DD'),
          intensity: String(e.intensity),
          duration: Number(e.duration),
        };
      });

    const intensityCounts: Record<string, number> = {};
    const intensityDurations: Record<string, number> = {};
    const dailyTotals: Record<string, number> = {};

    parsed.forEach(({ dateKey, intensity, duration }) => {
      intensityCounts[intensity] = (intensityCounts[intensity] || 0) + 1;
      intensityDurations[intensity] = (intensityDurations[intensity] || 0) + duration;
      dailyTotals[dateKey] = (dailyTotals[dateKey] || 0) + duration;
    });

    const sortedDates = Object.keys(dailyTotals).sort();

    const sevByDate: Record<string, number> = {};
    const symptomCounts: Record<string, number> = {};

    entries.forEach((entry) => {
      const key = dayjs(entry.log_date).format('YYYY-MM-DD');
      const symptoms = entry.symptoms || {};

      let total = 0;
      Object.entries(symptoms).forEach(([name, val]) => {
        const valStr = String(val ?? '').toLowerCase();
        const numeric = typeof val === 'number' ? val : severityMap[String(val)] ?? 0;
        total += numeric;

        if (val !== null && val !== '' && valStr !== 'no' && numeric !== 0) {
          symptomCounts[name] = (symptomCounts[name] || 0) + 1;
        }
      });

      sevByDate[key] = (sevByDate[key] || 0) + total;
    });

    const topSymptoms = Object.entries(symptomCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6);

    return {
      barDataFrequency: {
        labels: Object.keys(intensityCounts),
        datasets: [
          {
            label: 'Frequency',
            data: Object.values(intensityCounts),
            backgroundColor: '#64b5f6',
            borderRadius: 6,
          },
        ],
      },
      barDataDuration: {
        labels: Object.keys(intensityDurations),
        datasets: [
          {
            label: 'Total Duration (hrs)',
            data: Object.values(intensityDurations),
            backgroundColor: '#ef5350',
            borderRadius: 6,
          },
        ],
      },
      lineData: {
        labels: sortedDates,
        datasets: [
          {
            label: 'Daily Duration (hrs)',
            data: sortedDates.map((d) => dailyTotals[d]),
            fill: false,
            borderColor: '#42a5f5',
            backgroundColor: '#42a5f5',
            tension: 0.3,
            pointRadius: 2,
          },
        ],
      },
      severityByDate: sevByDate,
      topSymptoms,
    };
  }, [entries]);

  const startOfMonth = currentMonth.startOf('month');
  const endOfMonth = currentMonth.endOf('month');

  const calendarDays: (dayjs.Dayjs | null)[] = useMemo(() => {
    const arr: (dayjs.Dayjs | null)[] = [];
    const startPad = startOfMonth.day();
    for (let i = 0; i < startPad; i++) arr.push(null);
    for (let d = 1; d <= endOfMonth.date(); d++) {
      arr.push(dayjs(new Date(currentMonth.year(), currentMonth.month(), d)));
    }
    return arr;
  }, [currentMonth, startOfMonth, endOfMonth]);

  const handlePreviousMonth = () => setCurrentMonth((prev) => prev.subtract(1, 'month'));
  const handleNextMonth = () => setCurrentMonth((prev) => prev.add(1, 'month'));

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false as const,
    plugins: {
      legend: { position: 'top' as const },
      title: { display: false },
    },
    scales: {
      x: { ticks: { maxRotation: 0, autoSkip: true, maxTicksLimit: 8 } },
      y: { beginAtZero: true },
    },
  };

  if (loading) {
    return (
      <Box p={3} display="flex" justifyContent="center" alignItems="center" minHeight={240}>
        <CircularProgress />
      </Box>
    );
  }
  if (error) {
    return (
      <Box p={3}>
        <Typography color="error" fontWeight="bold">
          {error}
        </Typography>
      </Box>
    );
  }

  return (
    <Box display="flex" flexDirection="column" width="100%" px={{ xs: 1, sm: 2 }} py={1}>
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        Migraine Entry Visualizations
      </Typography>

      {/* KPI Cards */}
      <Grid container spacing={2} mb={2}>
        <Grid item xs={12} sm={4}>
          <Paper sx={{ ...card, minHeight: 100 }}>
            <Typography variant="body2" color="text.secondary">
              Total Entries
            </Typography>
            <Typography variant="h5" fontWeight="bold">{entries.length}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Paper sx={{ ...card, minHeight: 100 }}>
            <Typography variant="body2" color="text.secondary">
              Tracked Days
            </Typography>
            <Typography variant="h5" fontWeight="bold">
              {new Set(entries.map((e) => dayjs(e.log_date).format('YYYY-MM-DD'))).size}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Paper sx={{ ...card, minHeight: 100, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="body2" color="text.secondary">
              Top 3 Symptoms
            </Typography>
            {(() => {
              const symptomCounts: Record<string, number> = {};
              entries.forEach((e) => {
                if (e.symptoms) {
                  Object.entries(e.symptoms).forEach(([symptom, value]) => {
                    if (value && String(value).toLowerCase() !== 'no') {
                      symptomCounts[symptom] = (symptomCounts[symptom] || 0) + 1;
                    }
                  });
                }
              });
              const top3 = Object.entries(symptomCounts)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 3);

              return (
                <Box mt={1} display="flex" flexDirection="column" gap={0.5}>
                  {top3.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">
                      —
                    </Typography>
                  ) : (
                    top3.map(([symptom, count]) => (
                      <Typography key={symptom} variant="body2">
                        {symptom} ({count})
                      </Typography>
                    ))
                  )}
                </Box>
              );
            })()}
          </Paper>
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={2} mb={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ ...card, minHeight: 260 }}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Frequency by Intensity
            </Typography>
            <Box height={200}>
              <Bar data={barDataFrequency} options={chartOptions} />
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ ...card, minHeight: 260 }}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Total Duration by Intensity
            </Typography>
            <Box height={200}>
              <Bar data={barDataDuration} options={chartOptions} />
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12}>
          <Paper sx={{ ...card, minHeight: 260 }}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Daily Duration Over Time
            </Typography>
            <Box height={200}>
              <Line data={lineData} options={chartOptions} />
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Calendar Heatmap */}
      <Typography variant="h6" fontWeight="bold" gutterBottom>
        Symptom Intensity Calendar Heatmap
      </Typography>
      <Paper sx={{ ...card, mb: 3 }}>
        <Box display="flex" justifyContent="center" alignItems="center" mb={2} gap={2}>
          <Button variant="outlined" size="small" onClick={handlePreviousMonth}>
            Prev
          </Button>
          <Typography variant="h6" fontWeight="bold" sx={{ minWidth: 180, textAlign: 'center' }}>
            {currentMonth.format('MMMM YYYY')}
          </Typography>
          <Button variant="outlined" size="small" onClick={handleNextMonth}>
            Next
          </Button>
        </Box>

        <Grid container spacing={1} sx={{ mb: 1 }}>
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((wd) => (
            <Grid item xs={12 / 7 as any} key={wd}>
              <Typography variant="caption" fontWeight="bold">
                {wd}
              </Typography>
            </Grid>
          ))}
        </Grid>

        <Grid container spacing={1}>
          {calendarDays.map((day, idx) => {
            if (!day) return <Grid item xs={12 / 7 as any} key={`empty-${idx}`} />;
            const dateStr = day.format('YYYY-MM-DD');
            const severity = severityByDate[dateStr] || 0;
            const isSelected = selectedDate === dateStr;
            return (
              <Grid item xs={12 / 7 as any} key={dateStr}>
                <Tooltip title={`Severity Sum: ${severity}`} arrow>
                  <Paper
                    onClick={() => setSelectedDate(dateStr)}
                    sx={{
                      backgroundColor: getHeatColor(severity),
                      height: { xs: 36, sm: 44 },
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      cursor: 'pointer',
                      border: isSelected ? '2px solid #111' : '1px solid rgba(0,0,0,0.08)',
                      borderRadius: 2,
                      transition: 'transform 120ms ease',
                      '&:hover': { transform: 'translateY(-1px)' },
                    }}
                  >
                    <Typography variant="caption" fontWeight="bold">
                      {day.date()}
                    </Typography>
                  </Paper>
                </Tooltip>
              </Grid>
            );
          })}
        </Grid>

        <Divider sx={{ my: 2 }} />
        <Grid container spacing={2}>
          {[
            { c: '#E0E0E0', t: 'No Severity' },
            { c: '#D7EAF9', t: 'Mild (1–10)' },
            { c: '#A9D7EF', t: 'Moderate (11–20)' },
            { c: '#53B5E9', t: 'Severe (21–35)' },
            { c: '#0D8FD1', t: 'Extreme (36+)' },
          ].map((l) => (
            <Grid item key={l.t}>
              <Box display="flex" alignItems="center" gap={1}>
                <Box sx={{ width: 16, height: 16, bgcolor: l.c, borderRadius: '50%' }} />
                <Typography variant="caption">{l.t}</Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {selectedDate && (
        <Box mb={3}>
          <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>
            Entries for {dayjs(selectedDate).format('MMMM D, YYYY')}
          </Typography>
          <Grid container spacing={2} alignItems="stretch">
            {entries
              .filter((e) => dayjs(e.log_date).format('YYYY-MM-DD') === selectedDate)
              .map((entry) => (
                <Grid
                  item
                  xs={12}
                  md={6}
                  key={entry.log_id ?? `${entry.log_date}-${Math.random()}`}
                  sx={{ display: 'flex' }}
                >
                  <Paper
                    sx={{
                      ...card,
                      bgcolor: '#F2F8FD',
                      minHeight: ENTRY_MIN_HEIGHT,
                      flex: 1,
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                  >
                    <Typography variant="subtitle2" fontWeight="bold">
                      Intensity: {entry.intensity || '—'}
                    </Typography>
                    <Typography variant="body2">Duration: {entry.duration || '—'} hrs</Typography>
                    <Box mt={1} display="flex" flexWrap="wrap" gap={1}>
                      {(entry?.trigger?.potentialTrigger ? [entry.trigger.potentialTrigger] : [])
                        .concat(entry?.trigger?.weather ? [entry.trigger.weather] : [])
                        .concat(entry?.trigger?.food ? [entry.trigger.food] : [])
                        .concat(entry?.trigger?.activity ? [entry.trigger.activity] : [])
                        .filter(Boolean)
                        .map((t) => (
                          <Chip key={t as string} label={t as string} size="small" />
                        ))}
                      {(!entry.trigger || formatTrigger(entry.trigger) === '—') && (
                        <Chip label="No triggers" size="small" variant="outlined" />
                      )}
                    </Box>
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      <strong>Notes:</strong> {entry.notes || '—'}
                    </Typography>
                    <SymptomPills symptoms={entry.symptoms} />
                  </Paper>
                </Grid>
              ))}
          </Grid>
        </Box>
      )}

      <Typography variant="h5" fontWeight="bold" gutterBottom>
        All Entries
      </Typography>
      <Grid container spacing={2} alignItems="stretch">
        {entries
          .slice()
          .sort((a, b) => +new Date(a.log_date) - +new Date(b.log_date))
          .map((entry) => (
            <Grid
              item
              xs={12}
              md={6}
              key={entry.log_id ?? `${entry.log_date}-${Math.random()}`}
              sx={{ display: 'flex' }}
            >
              <Paper
                sx={{
                  ...card,
                  bgcolor: '#fafafa',
                  minHeight: ENTRY_MIN_HEIGHT,
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <Typography variant="subtitle1" fontWeight="bold">
                  {new Date(entry.log_date).toLocaleDateString()} — {entry.intensity || '—'}
                </Typography>
                <Typography variant="body2">Duration: {entry.duration || '—'} hrs</Typography>
                <Box mt={1} display="flex" flexWrap="wrap" gap={1}>
                  {(entry?.trigger?.potentialTrigger ? [entry.trigger.potentialTrigger] : [])
                    .concat(entry?.trigger?.weather ? [entry.trigger.weather] : [])
                    .concat(entry?.trigger?.food ? [entry.trigger.food] : [])
                    .concat(entry?.trigger?.activity ? [entry.trigger.activity] : [])
                    .filter(Boolean)
                    .map((t) => (
                      <Chip key={t as string} label={t as string} size="small" />
                    ))}
                  {(!entry.trigger || formatTrigger(entry.trigger) === '—') && (
                    <Chip label="No triggers" size="small" variant="outlined" />
                  )}
                </Box>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  <strong>Notes:</strong> {entry.notes || '—'}
                </Typography>
                <SymptomPills symptoms={entry.symptoms} />
              </Paper>
            </Grid>
          ))}
      </Grid>
    </Box>
  );
};

export default Visualization;
