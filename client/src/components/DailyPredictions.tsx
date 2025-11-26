import React, { useEffect, useState } from 'react';
import { Box, Typography, Grid, Paper, CircularProgress } from '@mui/material';
import api from '../services/api';

// ---- Types for API responses ----

// What the AI prediction endpoint returns on success
export interface PredictionData {
  triggers: { icon: string; label: string; risk: string }[];
  forecast: { day: string; risk: string }[];
  recommendations: string[];
}

// What the prediction endpoint can return if there isn't enough data yet
interface NotEnoughDataResponse {
  notEnoughData: true;
  currentCount: number;
  message: string;
}

// Union type for the backend response
type PredictionApiResponse = PredictionData | NotEnoughDataResponse;

// Type guard to tell TS when it's a real prediction
function isPredictionData(data: PredictionApiResponse): data is PredictionData {
  return (
    (data as PredictionData).forecast !== undefined &&
    (data as PredictionData).triggers !== undefined &&
    Array.isArray((data as PredictionData).forecast) &&
    Array.isArray((data as PredictionData).triggers)
  );
}

// Helper: format a Date as YYYY-MM-DD
const formatYMD = (d: Date) => d.toISOString().slice(0, 10);

const DailyPredictions: React.FC<{ userId: string | number | null }> = ({ userId }) => {
  // State for data
  const [entryCount, setEntryCount] = useState<number | null>(null);
  const [predictions, setPredictions] = useState<PredictionData | null>(null);

  // State for UI status
  const [loadingCount, setLoadingCount] = useState(true);
  const [generatingAI, setGeneratingAI] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;

    const initData = async () => {
      try {
        setLoadingCount(true);
        setErrorMsg(null);
        setPredictions(null);

        // 1. Check how many entries user has (total count)
        const countRes = await api.get<{ count: number }>(
          `/api/daily-inputs/my/count?userId=${userId}`
        );
        const count = countRes.data.count;
        setEntryCount(count);

        console.log(`[DailyPredictions] User ${userId} has ${count} total entries.`);

        // 2. If 10+, fetch the AI prediction
        if (count >= 10) {
          await generatePredictions();
        }
      } catch (e) {
        console.error('[DailyPredictions] Initialization error:', e);
        setEntryCount(0);
        setErrorMsg('Failed to load your logs. Please try again later.');
      } finally {
        setLoadingCount(false);
      }
    };

    initData();
  }, [userId]);

  const generatePredictions = async () => {
    if (!userId) return;

    try {
      setGeneratingAI(true);
      setErrorMsg(null);

      console.log('[DailyPredictions] 📡 Calling AI Backend for predictions...');
      const res = await api.get<PredictionApiResponse>(
        `/api/predictions/generate?userId=${userId}`
      );

      console.log('[DailyPredictions] ✅ Raw AI Response:', res.data);
      const body = res.data;

      // Handle "not enough data" from backend
      if ('notEnoughData' in body && body.notEnoughData) {
        console.warn('[DailyPredictions] Backend says: Not enough recent data to generate.');
        setPredictions(null);
        if (typeof body.currentCount === 'number') {
          setEntryCount(body.currentCount);
        }
        setErrorMsg(body.message || 'Not enough data for predictions yet.');
        return;
      }

      // Narrow to PredictionData
      if (isPredictionData(body)) {
        console.log(
          '[DailyPredictions] 📊 Using prediction forecast (index 0=today):',
          body.forecast
        );
        setPredictions(body);
      } else {
        console.error('[DailyPredictions] Invalid data format received:', body);
        setErrorMsg('Received incomplete data from Migraine Genie.');
        setPredictions(null);
      }
    } catch (error) {
      console.error('[DailyPredictions] ❌ Error getting AI predictions:', error);
      setErrorMsg('Failed to load predictions. Please try again later.');
      setPredictions(null);
    } finally {
      setGeneratingAI(false);
    }
  };

  // --- RENDER 1: Initial Loading ---
  if (loadingCount) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  // --- RENDER 2: Not Enough Entries ---
  if (entryCount !== null && entryCount < 10) {
    return (
      <Box display="flex" flexDirection="column" alignItems="center" mt={4}>
        <Typography variant="h6" color="textSecondary">
          Current Entries: {entryCount} / 10
        </Typography>
        <Typography variant="body1">
          Log {Math.max(0, 10 - entryCount)} more days to unlock AI predictions.
        </Typography>
        {errorMsg && (
          <Typography variant="body2" color="error" mt={1}>
            {errorMsg}
          </Typography>
        )}
      </Box>
    );
  }

  // --- RENDER 3: AI is thinking (only if we don't have predictions yet) ---
  if (generatingAI && !predictions) {
    return (
      <Box display="flex" flexDirection="column" alignItems="center" p={4}>
        <CircularProgress size={24} />
        <Typography variant="body2" mt={2}>
          Consulting the Migraine Genie...
        </Typography>
      </Box>
    );
  }

  // --- RENDER 4: Main Content ---
  // Precompute today's date once
  const today = new Date();
  const todayYMD = formatYMD(today);

  return (
    <Box display="flex" flexDirection="column" gap={2}>
      <Typography variant="h6" fontWeight="bold" color="primary">
        AI Forecast
      </Typography>

      {/* ERROR MESSAGE DISPLAY */}
      {errorMsg && (
        <Paper sx={{ p: 2, bgcolor: '#ffebee', border: '1px solid #ffcdd2' }}>
          <Typography color="error" variant="body2">
            ⚠️ {errorMsg}
          </Typography>
        </Paper>
      )}

      {/* PREDICTION CONTENT */}
      {predictions && (
        <>
          {/* Triggers */}
          <Typography variant="body2" color="textSecondary">
            Potential Triggers:
          </Typography>
          <Grid container spacing={2}>
            {predictions.triggers.map((trigger, index) => (
              <Grid item xs={12} sm={4} key={index}>
                <Paper sx={{ p: 1, textAlign: 'center', bgcolor: '#f9f9f9' }}>
                  <Typography variant="h3">{trigger.icon}</Typography>
                  <Typography variant="subtitle2" fontWeight="bold">
                    {trigger.label}
                  </Typography>
                  <Typography
                    variant="caption"
                    color={
                      trigger.risk.toLowerCase().includes('high')
                        ? 'error'
                        : 'textSecondary'
                    }
                  >
                    {trigger.risk}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>

          {/* Week Forecast */}
          <Box mt={3}>
            <Typography variant="subtitle1" fontWeight="bold">
              7-Day Forecast
            </Typography>
            <Grid container spacing={1} justifyContent="center">
              {predictions.forecast.map((item, index) => {
                // Treat index 0 as TODAY, 1 as tomorrow, etc.
                const forecastDate = new Date(today);
                forecastDate.setDate(today.getDate() + index);

                const forecastYMD = formatYMD(forecastDate);
                const dayLabel = forecastDate.toLocaleDateString(undefined, {
                  weekday: 'short',
                });
                const dateLabel = forecastDate.toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                });

                const riskVal = parseInt(item.risk) || 0;
                const isHigh = riskVal > 50;
                const isNext3 = index < 3; // today + next 2 days

                console.log('[DailyPredictions] Rendering day', {
                  index,
                  risk: item.risk,
                  date: forecastYMD,
                  isNext3,
                });

                return (
                  <Grid item key={index}>
                    <Paper
                      sx={{
                        p: 1,
                        width: 70,
                        height: 70,
                        borderRadius: '50%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: isNext3
                          ? '2px solid #1976d2' // highlight next 3 days in blue
                          : isHigh
                          ? '2px solid #ff5252'
                          : '1px solid #ddd',
                        bgcolor: isNext3
                          ? '#e3f2fd'
                          : isHigh
                          ? '#fff0f0'
                          : '#fff',
                      }}
                    >
                      <Typography variant="body2" fontWeight="bold">
                        {item.risk}
                      </Typography>
                      <Typography variant="caption">{dayLabel}</Typography>
                      <Typography variant="caption" sx={{ fontSize: '0.65rem' }}>
                        {dateLabel}
                      </Typography>
                    </Paper>
                  </Grid>
                );
              })}
            </Grid>
          </Box>

          {/* Recommendations */}
          <Box mt={3}>
            <Typography variant="subtitle1" fontWeight="bold">
              Genie's Advice
            </Typography>
            <ul>
              {predictions.recommendations.map((rec, i) => (
                <li key={i}>
                  <Typography variant="body2">{rec}</Typography>
                </li>
              ))}
            </ul>
          </Box>
        </>
      )}

      {/* Fallback if somehow nothing is there */}
      {!predictions && !generatingAI && !errorMsg && (
        <Typography variant="body2" color="textSecondary">
          No predictions available yet. Try adding more logs or refreshing later.
        </Typography>
      )}
    </Box>
  );
};

export default DailyPredictions;
