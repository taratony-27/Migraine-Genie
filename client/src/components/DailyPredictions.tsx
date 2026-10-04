import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Paper, 
  CircularProgress, 
  Card, 
  CardContent, 
  Chip, 
  Stack, 
  LinearProgress,
  useTheme
} from '@mui/material';
import {
  Monitor,
  Lightbulb,
  SelfImprovement
} from '@mui/icons-material';
import api from '../services/api';

// ---- Types for API responses ----
export interface PredictionData {
  triggers: { icon: string; label: string; risk: string }[];
  forecast: { day: string; risk: string }[];
  recommendations: string[];
}

interface NotEnoughDataResponse {
  notEnoughData: true;
  currentCount: number;
  message: string;
}

type PredictionApiResponse = PredictionData | NotEnoughDataResponse;

function isPredictionData(data: PredictionApiResponse): data is PredictionData {
  return (
    (data as PredictionData).forecast !== undefined &&
    (data as PredictionData).triggers !== undefined &&
    Array.isArray((data as PredictionData).forecast) &&
    Array.isArray((data as PredictionData).triggers)
  );
}

// --- UI Helper: Get color key based on Risk String ---
const getRiskColorKey = (risk: string): 'error' | 'warning' | 'success' => {
  const r = risk.toLowerCase();
  if (r.includes('high')) return 'error';
  if (r.includes('medium') || r.includes('moderate')) return 'warning';
  return 'success';
};

const DailyPredictions: React.FC<{ userId: string | number | null }> = ({ userId }) => {
  const theme = useTheme();
  const [entryCount, setEntryCount] = useState<number | null>(null);
  const [predictions, setPredictions] = useState<PredictionData | null>(null);
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

        const countRes = await api.get<{ count: number }>(`/api/daily-inputs/my/count?userId=${userId}`);
        const count = countRes.data.count;
        setEntryCount(count);

        if (count >= 10) {
          await generatePredictions();
        }
      } catch (e) {
        console.error('[DailyPredictions] Initialization error:', e);
        setEntryCount(0);
        setErrorMsg('Failed to load your logs.');
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
      const res = await api.get<PredictionApiResponse>(`/api/predictions/generate?userId=${userId}`);
      const body = res.data;

      if ('notEnoughData' in body && body.notEnoughData) {
        setPredictions(null);
        if (typeof body.currentCount === 'number') setEntryCount(body.currentCount);
        setErrorMsg(body.message || 'Not enough data yet.');
        return;
      }

      if (isPredictionData(body)) {
        setPredictions(body);
      } else {
        setErrorMsg('Received incomplete data from service.');
        setPredictions(null);
      }
    } catch (error) {
      console.error('[DailyPredictions] Error:', error);
      setErrorMsg('Service unavailable. Please try again later.');
    } finally {
      setGeneratingAI(false);
    }
  };

  // --- RENDER STATES ---

  if (loadingCount) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={300}>
        <CircularProgress thickness={4} />
      </Box>
    );
  }

  if (entryCount !== null && entryCount < 10) {
    return (
      <Paper elevation={0} variant="outlined" sx={{ p: 4, textAlign: 'center', borderRadius: 3, bgcolor: '#f8f9fa' }}>
        <Typography variant="h5" fontWeight="600" color="text.primary" gutterBottom>
          Gathering Insights
        </Typography>
        <Typography variant="body1" color="text.secondary" mb={3}>
          We need a bit more data to build your personalized model.
        </Typography>
        <LinearProgress variant="determinate" value={(entryCount / 10) * 100} sx={{ height: 10, borderRadius: 5, mb: 2 }} />
        <Typography variant="caption" fontWeight="bold" color="primary">
          {entryCount} / 10 Entries Logged
        </Typography>
      </Paper>
    );
  }

  if (generatingAI && !predictions) {
    return (
      <Paper elevation={0} variant="outlined" sx={{ p: 5, textAlign: 'center', borderRadius: 3 }}>
        <CircularProgress size={40} thickness={4} sx={{ mb: 2 }} />
        <Typography variant="h6" color="text.primary">Analyzing Patterns...</Typography>
        <Typography variant="body2" color="text.secondary">Consulting the Migraine Genie</Typography>
      </Paper>
    );
  }

  // --- MAIN DASHBOARD RENDER ---
  const today = new Date();

  return (
    <Box sx={{ width: '100%', maxWidth: 900, mx: 'auto' }}>
      
      {/* Header */}
      <Box mb={3} display="flex" alignItems="center" gap={1}>
        <Monitor color="primary" />
        <Typography variant="h5" fontWeight="700" color="text.primary">
          Forecast Dashboard
        </Typography>
      </Box>

      {errorMsg && (
        <Paper sx={{ p: 2, mb: 3, bgcolor: '#fff4f4', borderLeft: '4px solid #d32f2f' }}>
          <Typography color="error" variant="body2" fontWeight="500">
            {errorMsg}
          </Typography>
        </Paper>
      )}

      {predictions && (
        (parseInt(predictions.forecast[0]?.risk as any) || 0) > 50 ||
        predictions.triggers.some((t) => getRiskColorKey(t.risk) === 'error')
      ) && (
        <Paper
          elevation={0}
          sx={{
            p: 2.5,
            mb: 3,
            bgcolor: '#f3e8fd',
            border: '1px solid #e1bee7',
            borderRadius: 2,
            display: 'flex',
            alignItems: 'flex-start',
            gap: 1.5,
          }}
        >
          <SelfImprovement sx={{ color: '#6a1b9a', mt: 0.25 }} />
          <Box>
            <Typography variant="subtitle1" fontWeight="700" color="#6a1b9a" gutterBottom>
              A heads-up, not a guarantee
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
              Some of what's below is showing elevated risk — that's a pattern-based estimate, not a
              certainty. Plenty of elevated-risk days pass without a migraine at all. It's a good day to
              be a little extra kind to yourself: stay hydrated, ease up on screens, and keep an eye on
              early symptoms. You're already ahead of it by tracking your data.
            </Typography>
          </Box>
        </Paper>
      )}

      {predictions && (
        <Grid container spacing={3}>
          
          {/* Section 1: Potential Triggers (UPDATED DESIGN: NO ICONS) */}
          <Grid item xs={12}>
            <Typography variant="subtitle2" textTransform="uppercase" letterSpacing={1} color="text.secondary" mb={1}>
              Risk Factors Analysis
            </Typography>
            <Grid container spacing={2}>
              {predictions.triggers.map((trigger, index) => {
                const colorKey = getRiskColorKey(trigger.risk);
                const colorHex = theme.palette[colorKey].main;
                const lightBg = colorKey === 'error' ? '#fff5f5' : colorKey === 'warning' ? '#fffbf2' : '#f6fff8';

                return (
                  <Grid item xs={12} sm={4} key={index}>
                    <Card 
                      elevation={0} 
                      sx={{ 
                        height: '100%', 
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 2,
                        // Aesthetic Left Border
                        borderLeft: `6px solid ${colorHex}`, 
                        transition: '0.2s',
                        bgcolor: '#fff',
                        '&:hover': { 
                          transform: 'translateY(-2px)',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                          bgcolor: lightBg 
                        }
                      }}
                    >
                      <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 1, p: 2 }}>
                        <Typography variant="caption" fontWeight="bold" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
                          Detected Trigger
                        </Typography>
                        
                        <Typography variant="h6" fontWeight="700" align="left" sx={{ lineHeight: 1.2 }}>
                          {trigger.label}
                        </Typography>
                        
                        <Box sx={{ flexGrow: 1 }} /> {/* Spacer to push chip to bottom */}
                        
                        <Chip 
                          label={trigger.risk} 
                          size="small"
                          sx={{ 
                            fontWeight: 'bold', 
                            mt: 1,
                            bgcolor: lightBg,
                            color: theme.palette[colorKey].dark,
                            border: `1px solid ${theme.palette[colorKey].light}`
                          }}
                        />
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          </Grid>

          {/* Section 2: 7-Day Forecast Strip */}
          <Grid item xs={12}>
            <Typography variant="subtitle2" textTransform="uppercase" letterSpacing={1} color="text.secondary" mb={1} mt={2}>
              7-Day Outlook
            </Typography>
            <Card elevation={0} variant="outlined" sx={{ borderRadius: 2, overflowX: 'auto' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', minWidth: 600, p: 2 }}>
                {predictions.forecast.map((item, index) => {
                  const forecastDate = new Date(today);
                  forecastDate.setDate(today.getDate() + index);
                  const dayName = forecastDate.toLocaleDateString('en-US', { weekday: 'short' });
                  const dayNum = forecastDate.toLocaleDateString('en-US', { day: 'numeric' });
                  
                  const riskVal = parseInt(item.risk) || 0;
                  const isHigh = riskVal > 50;
                  const isToday = index === 0;

                  return (
                    <Box 
                      key={index}
                      sx={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center', 
                        flex: 1,
                        position: 'relative',
                        p: 1,
                        bgcolor: isToday ? 'action.hover' : 'transparent',
                        borderRadius: 1
                      }}
                    >
                      {isToday && (
                        <Typography variant="caption" color="primary" fontWeight="bold" sx={{ mb: 0.5 }}>
                          TODAY
                        </Typography>
                      )}
                      <Typography variant="body2" color="text.secondary">{dayName}</Typography>
                      <Typography variant="h6" fontWeight="bold">{dayNum}</Typography>
                      
                      {/* Custom Bar for Risk */}
                      <Box sx={{ mt: 1.5, width: '6px', height: '40px', bgcolor: '#e0e0e0', borderRadius: 4, position: 'relative', overflow: 'hidden' }}>
                        <Box sx={{ 
                          position: 'absolute', 
                          bottom: 0, 
                          left: 0, 
                          right: 0, 
                          height: `${Math.min(riskVal, 100)}%`, 
                          bgcolor: isHigh ? theme.palette.error.main : theme.palette.success.main,
                          transition: 'height 1s ease'
                        }} />
                      </Box>
                      
                      <Typography 
                        variant="caption" 
                        fontWeight="bold" 
                        color={isHigh ? 'error.main' : 'text.primary'} 
                        mt={1}
                      >
                        {item.risk}
                      </Typography>
                    </Box>
                  );
                })}
              </Box>
            </Card>
          </Grid>

          {/* Section 3: Recommendations */}
          <Grid item xs={12}>
            <Card 
              elevation={0} 
              sx={{ 
                bgcolor: '#e3f2fd', 
                color: '#0d47a1', 
                borderRadius: 2, 
                border: '1px solid #bbdefb' 
              }}
            >
              <CardContent>
                <Box display="flex" alignItems="center" gap={1.5} mb={2}>
                  <Lightbulb color="primary" />
                  <Typography variant="h6" fontWeight="bold">
                    Genie's Recommendations
                  </Typography>
                </Box>
                <Stack spacing={1.5}>
                  {predictions.recommendations.map((rec, i) => (
                    <Box key={i} display="flex" alignItems="flex-start" gap={1.5}>
                      <Box 
                        sx={{ 
                          minWidth: 6, 
                          height: 6, 
                          bgcolor: 'primary.main', 
                          borderRadius: '50%', 
                          mt: 1 
                        }} 
                      />
                      <Typography variant="body1" sx={{ lineHeight: 1.6 }}>
                        {rec}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Empty State */}
      {!predictions && !generatingAI && !errorMsg && (
        <Typography variant="body2" color="textSecondary" align="center" mt={4}>
          No forecast available. Please ensure logs are up to date.
        </Typography>
      )}
    </Box>
  );
};

export default DailyPredictions;