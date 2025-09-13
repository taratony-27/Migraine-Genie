import React, { useState, useEffect } from 'react';
import {
  Box, TextField, Typography, Button, MenuItem, FormControl, FormLabel,
  Slider, Switch, FormControlLabel, Radio, RadioGroup,
  Snackbar, Alert
} from '@mui/material';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import SunnyIcon from '@mui/icons-material/WbSunny';
import WbCloudyIcon from '@mui/icons-material/WbCloudy';
import ThunderstormIcon from '@mui/icons-material/Thunderstorm';
import AirIcon from '@mui/icons-material/Air';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import GrainIcon from '@mui/icons-material/Grain';
import api from '../services/api';

const intensityLevels = ['Mild', 'Moderate', 'Severe'];

const problemOptions = [
  { label: "No problem", value: 0 },
  { label: "Mild problem", value: 1 },
  { label: "Moderate problem", value: 2 },
  { label: "Severe problem", value: 3 }
];

const symptomInputs = [
  { key: 'imbalance', label: 'Imbalance', type: 'slider' },
  { key: 'spinningSensation', label: 'Spinning sensation', type: 'slider' },
  { key: 'headBodyDizziness', label: 'Dizziness with head or body movement', type: 'radio' },
  { key: 'visualSceneDizziness', label: 'Dizziness with busy visual scenes', type: 'radio' },
  { key: 'motionSensitivity', label: 'Motion sensitivity/motion sickness', type: 'radio' },
  { key: 'soundDiscomfort', label: 'Discomfort with loud sounds', type: 'dropdown' },
  { key: 'lightsDiscomfort', label: 'Discomfort with bright lights', type: 'dropdown' },
  { key: 'lightheadedness', label: 'Lightheadedness', type: 'radio' },
  { key: 'earPressure', label: 'Ear pressure or ear fullness', type: 'radio' },
  { key: 'nausea', label: 'Nausea', type: 'radio' },
  { key: 'fatigue', label: 'Fatigue', type: 'slider' },
  { key: 'headPressure', label: 'Head pressure', type: 'slider' },
  { key: 'headaches', label: 'Headaches', type: 'slider' },
  { key: 'memoryDifficulty', label: 'Trouble remembering things', type: 'dropdown' },
  { key: 'movementSensation', label: 'Sensation of movement when not moving', type: 'dropdown' },
  { key: 'walkingDifficulty', label: 'Difficulty walking around', type: 'slider' },
  { key: 'stairsDifficulty', label: 'Difficulty using stairs', type: 'dropdown' },
  { key: 'reducedProductivity', label: 'Reduced productivity at work', type: 'dropdown' },
  { key: 'concentratingDifficulty', label: 'Difficulty concentrating', type: 'dropdown' },
  { key: 'stress', label: 'Stress', type: 'slider' },
  { key: 'sadness', label: 'Sadness', type: 'slider' },
  { key: 'anxiety', label: 'Anxiety', type: 'dropdown' },
  { key: 'abnormalLifeFear', label: "Fear that life won't be normal again", type: 'dropdown' },
  { key: 'fallingFear', label: 'Fear of falling', type: 'switch' },
  { key: 'socialSituationAvoidance', label: 'Avoiding social situations', type: 'switch' },
];

type DailyLogProps = {
  userId?: number | string | null;
};

const severityLabels = ['No', 'Mild', 'Moderate', 'Severe'];

const DailyLog: React.FC<DailyLogProps> = ({ userId }) => {
  const currentUserId =
    userId ??
    (() => {
      try {
        const u = localStorage.getItem('user');
        if (u) {
          const j = JSON.parse(u);
          return j?.user_id ?? j?.id ?? j?._id ?? 1;
        }
      } catch {}
      return 1;
    })();

  // attach token to shared client if present
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }, []);

  const [entry, setEntry] = useState<any>({
    date: '',
    duration: '',
    intensity: '',
    sleep: '',
    screentime: '',
    potentialTrigger: '',
    weather: '',
    food: '',
    activity: '',
    ...Object.fromEntries(symptomInputs.map(({ key }) => [key, ''])),
    notes: '',
  });

  // ====== Toast state & helper ======
  const [toast, setToast] = useState<{open: boolean; message: string; severity: 'success' | 'error' | 'warning' | 'info'}>({
    open: false,
    message: '',
    severity: 'success'
  });
  const notify = (message: string, severity: 'success' | 'error' | 'warning' | 'info' = 'success') =>
    setToast({ open: true, message, severity });

  const [potentialTriggers, setPotentialTriggers] = useState<string[]>([]);
  const handlePotentialTrigger = (_: any, newVals: string[]) => {
    setPotentialTriggers(newVals);
    setEntry((prev: any) => ({ ...prev, potentialTrigger: newVals.join(', ') }));
  };
  const [weatherTriggers, setWeatherTriggers] = useState<string[]>([]);
  const handleWeatherTrigger = (_: any, newVals: string[]) => {
    setWeatherTriggers(newVals);
    setEntry((prev: any) => ({ ...prev, weather: newVals.join(', ') }));
  };
  const [foodTriggers, setFoodTriggers] = useState<string[]>([]);
  const handleFoodTrigger = (_: any, newVals: string[]) => {
    setFoodTriggers(newVals);
    setEntry((prev: any) => ({ ...prev, food: newVals.join(', ') }));
  };
  const [activityTriggers, setActivityTriggers] = useState<string[]>([]);
  const handleActivityTrigger = (_: any, newVals: string[]) => {
    setActivityTriggers(newVals);
    setEntry((prev: any) => ({ ...prev, activity: newVals.join(', ') }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEntry((prev: typeof entry) => ({ ...prev, [name]: value }));
  };

  const buildPayload = (src: any, isEdit: boolean) => {
    const {
      date, duration, intensity, sleep, screentime, notes,
      potentialTrigger, weather, food, activity, _id, user_id, log_id, ...symptomsRaw
    } = src;

    const symptoms: Record<string, string> = {};
    for (const { key, type } of symptomInputs) {
      const raw = symptomsRaw[key];
      if (type === 'switch') {
        symptoms[key] = Number(raw) === 1 ? 'Yes' : 'No';
      } else {
        const idx = Number(raw) || 0;
        symptoms[key] = severityLabels[idx] ?? 'No';
      }
    }

    return {
      user_id: isEdit ? (user_id ?? currentUserId) : currentUserId,
      log_id: isEdit ? log_id : Date.now(),
      log_date: date ? `${date}T00:00:00` : undefined,
      duration: duration === '' ? null : String(duration),
      intensity: intensity || null,
      sleep: sleep === '' ? null : Number(sleep),
      screentime: screentime === '' ? null : Number(screentime),
      trigger: {
        potentialTrigger: potentialTrigger || (potentialTriggers.length ? potentialTriggers.join(', ') : null),
        weather: weather || (weatherTriggers.length ? weatherTriggers.join(', ') : null),
        food: food || (foodTriggers.length ? foodTriggers.join(', ') : null),
        activity: activity || (activityTriggers.length ? activityTriggers.join(', ') : null),
      },
      symptoms,
      notes: notes || null,
    };
  };

  const [canPredict, setCanPredict] = useState<boolean | null>(null);
  const refreshCount = async () => {
    try {
      const { data } = await api.get('/api/daily-inputs/my/count', { params: { userId: currentUserId } });
      setCanPredict(Boolean(data?.canPredict));
    } catch {
      setCanPredict(null);
    }
  };
  useEffect(() => { refreshCount(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<any[]>([]);

  const handleSubmit = async () => {
    try {
      if (!entry.date) return notify('Date is required.', 'warning');
      if (entry.duration === '') return notify('Duration is required.', 'warning');
      if (!entry.intensity) return notify('Intensity is required.', 'warning');

      const isEdit = Boolean(entry._id);
      const payload = buildPayload(entry, isEdit);

      const res = isEdit
        ? await api.put(`/api/daily-inputs/${entry._id}`, payload, { params: { userId: currentUserId } })
        : await api.post('/api/daily-inputs', payload, { params: { userId: currentUserId } });

      const saved = res.data;
      setHistory(prev => (isEdit ? prev.map(l => (l._id === saved._id ? saved : l)) : [saved, ...prev]));

      setEntry({
        date: '', duration: '', intensity: '', sleep: '', screentime: '',
        potentialTrigger: '', weather: '', food: '', activity: '',
        ...Object.fromEntries(symptomInputs.map(({ key }) => [key, ''])),
        notes: '',
      });
      setPotentialTriggers([]); setWeatherTriggers([]); setFoodTriggers([]); setActivityTriggers([]);

      notify('Migraine diary entry saved successfully!', 'success');
      await refreshCount();
    } catch (error: any) {
      console.error('Error submitting entry:', error);
      const msg = error?.response?.data?.message || 'An error occurred while submitting the entry. Please try again.';
      notify(msg, 'error');
    }
  };

  const toggleHistory = async () => {
    if (!showHistory) {
      try {
        const { data } = await api.get('/api/daily-inputs', { params: { userId: currentUserId } });
        setHistory(data);
      } catch (err) {
        console.error('Failed to load history', err);
      }
    }
    setShowHistory(prev => !prev);
  };

  const handleEdit = (log:any) => {
    setEntry({
      ...log,
      date: log.log_date ? String(log.log_date).substring(0, 10) : '',
    });
    const trig = log.trigger || {};
    setPotentialTriggers((trig.potentialTrigger || '').split(',').map((s:string) => s.trim()).filter(Boolean));
    setWeatherTriggers((trig.weather || '').split(',').map((s:string) => s.trim()).filter(Boolean));
    setFoodTriggers((trig.food || '').split(',').map((s:string) => s.trim()).filter(Boolean));
    setActivityTriggers((trig.activity || '').split(',').map((s:string) => s.trim()).filter(Boolean));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (item: any) => {
    const logId = typeof item === 'string' || typeof item === 'number' ? item : item?._id;
    if (!logId) return;
    const confirmDelete = window.confirm('Are you sure you want to delete this entry?');
    if (!confirmDelete) return;

    try {
      await api.delete(`/api/daily-inputs/${logId}`, { params: { userId: currentUserId } });
      setHistory((prevHistory) => prevHistory.filter((log) => log._id !== logId));
      if (entry._id === logId) {
        setEntry({
          date: '', duration: '', intensity: '', sleep: '', screentime: '',
          potentialTrigger: '', weather: '', food: '', activity: '',
          ...Object.fromEntries(symptomInputs.map(({ key }) => [key, ''])),
          notes: '',
        });
        setPotentialTriggers([]); setWeatherTriggers([]); setFoodTriggers([]); setActivityTriggers([]);
      }
      notify('Entry deleted.', 'success');
      await refreshCount();
    } catch (error) {
      console.error('Error deleting log:', error);
      notify('Failed to delete entry.', 'error');
    }
  };

  return (
    <Box width="100%">
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4" fontWeight="bold" color="#1565c0"
        sx={{
          fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' },
        }}>
          Migraine Diary Entry
        </Typography>
        <Button
          variant="outlined"
          onClick={toggleHistory}
          sx={{
            width: { xs: '85px', sm: 'fit-content' },
            fontSize: { xs: '0.6rem', sm: '1rem' },
            padding: { xs: '4px 8px', sm: '6px 12px' },
          }}
        >
          {showHistory ? 'Hide History' : 'View History'}
        </Button>
      </Box>

      {/* Prediction banner (non-blocking) */} {/* [MODIFIED] */}
      {canPredict !== null && (
        <Box mb={2} p={2} borderRadius={2} bgcolor={canPredict ? '#E8F5E9' : '#FFF3E0'}>
          <Typography>
            {canPredict ? 'Your prediction for today is ready.' : 'Keep filling out more data.'}
          </Typography>
        </Box>
      )}

      {showHistory ? (
        <Box mb={4} p={2} border="1px solid #ccc" borderRadius={2}>
          <Typography variant="h6" gutterBottom>
            Entry History
          </Typography>
          {history.length === 0 ? (
            <Typography>No past entries found.</Typography>
          ) : (
            history.map((log, idx) => (
              <React.Fragment key={idx}>
              <Box key={idx} mb={2} p={1} border="1px dashed #aaa" borderRadius={1} position="relative">
                {/* Buttons in the top-right corner */}
                <Box position="absolute" top={8} right={8} display="flex" gap={1}>
                  <Button variant="outlined" size="small" color="primary"
                  onClick={() => handleEdit(log)}
                  >Edit</Button>
                  <Button variant="outlined" size="small" color="secondary"
                  onClick={() => handleDelete(log)}
                  >Delete</Button>
                </Box>

                <Typography variant="subtitle2">Date: {String(log.log_date || '').substring(0, 10) || '-'}</Typography>
                <Typography variant="body2">Duration: {log.duration ?? '-'} hours</Typography>
                <Typography variant="body2">Intensity: {log.intensity ?? '-'}</Typography>
                <Typography variant="body2">Sleep: {log.sleep ?? '-'}</Typography>
                <Typography variant="body2">Screentime: {log.screentime ?? '-'}</Typography>
                <Typography variant="body2">Potential Trigger: {log.trigger?.potentialTrigger || '-'}</Typography>
                <Typography variant="body2">Weather: {log.trigger?.weather || '-'}</Typography>
                <Typography variant="body2">Food: {log.trigger?.food || '-'}</Typography>
                <Typography variant="body2">Activity: {log.trigger?.activity || '-'}</Typography>

                {log.symptoms && Object.keys(log.symptoms).length > 0 ? (
            <>
              <Typography variant="subtitle2" mt={1}>Symptoms:</Typography>
              {Object.entries(log.symptoms)
                .filter(([_, value]) => value !== '')
                .map(([symptom, value]) => (
                  <Typography key={symptom} variant="body2">
                    {symptom}: {String(value || '-')}
                  </Typography>
                ))}
            </>
          ) : (
            <Typography variant="body2">Symptoms: None</Typography>
          )}
            <Typography variant="body2">Notes: {log.notes || '-'}</Typography>
              </Box>

            </React.Fragment>

          
            ))
          )}
        </Box>
      ) : (
        <Box display="flex" flexDirection="column" gap={2}>
              <TextField
                label="Date"
                type="date"
                fullWidth
                name="date"
                value={entry.date}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
              />

              <TextField
                label="Duration (in hours)"
                type="number"
                fullWidth
                name="duration"
                value={entry.duration}
                onChange={handleChange}
              />

              <TextField
                select
                label="Intensity"
                fullWidth
                name="intensity"
                value={entry.intensity}
                onChange={handleChange}
              >
                {intensityLevels.map(level => (
                  <MenuItem key={level} value={level}>{level}</MenuItem>
                ))}
              </TextField>
            
              <TextField
              label="Sleep (in hours)"
              type="number"
              fullWidth
              name="sleep"
              value={entry.sleep}
              onChange={handleChange}
            />

              <TextField
                label="Screentime (in hours)"
                type="number"
                fullWidth
                name="screentime"
                value={entry.screentime}
                onChange={handleChange}
              />
              

<Typography variant="subtitle1" >
      Potential Triggers
    </Typography>
    <ToggleButtonGroup
      value={potentialTriggers}
      onChange={handlePotentialTrigger}
      aria-label="potential triggers"
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'flex-start', 
      }}
    >
      <ToggleButton value="stress" aria-label="stress" 
      sx={{
        width: { xs: 90, md: 100 }, 
        height: { xs: 70, md: 75 }, 
      }}>
        <Box display="flex" flexDirection="column" alignItems="center" gap={0.5}>
        <img
          src="/icons/stress.png"
          alt="Stress"
          style={{ width: 24, height: 24 }}
        />
          <Typography variant="caption" sx={{ textTransform: 'none' }}>
            Stress
          </Typography>
        </Box>
      </ToggleButton>
      <ToggleButton value="lesssleep" aria-label="lesssleep" 
      sx={{
        width: { xs: 90, md: 100 }, 
        height: { xs: 70, md: 75 }, 
      }}>
        <Box display="flex" flexDirection="column" alignItems="center" gap={0.5}>
        <img
          src="/icons/exhausted-man.png"
          alt="Less Sleep"
          style={{ width: 24, height: 24 }}
        />
          <Typography variant="caption" sx={{ textTransform: 'none' }}>
            Less Sleep
          </Typography>
        </Box>
      </ToggleButton>
      <ToggleButton value="dehydration" aria-label="dehydration" 
      sx={{
        width: { xs: 90, md: 100 },
        height: { xs: 70, md: 75 },
      }}>
        <Box display="flex" flexDirection="column" alignItems="center" gap={0.5}>
        <img
          src="/icons/no-water.png"
          alt="Dehydration"
          style={{ width: 24, height: 24 }}
        />
          <Typography variant="caption" sx={{ textTransform: 'none' }}>
            Dehydration
          </Typography>
        </Box>
      </ToggleButton>
      <ToggleButton value="hormonalchanges" aria-label="hormonalchanges" 
      sx={{
        width: { xs: 90, md: 100 }, 
        height: { xs: 70, md: 75 }, 
      }}>
        <Box display="flex" flexDirection="column" alignItems="center" gap={0.5}>
        <img
          src="/icons/pad.png"
          alt="Hormonal Changes"
          style={{ width: 24, height: 24 }}
        />
          <Typography variant="caption" sx={{ textTransform: 'none' }}>
            Hormonal Changes
          </Typography>
        </Box>
      </ToggleButton>
      <ToggleButton value="certainfoods" aria-label="certainfoods" 
      sx={{
        width: { xs: 90, md: 100 }, 
        height: { xs: 70, md: 75 }, 
      }}>
        <Box display="flex" flexDirection="column" alignItems="center" gap={0.5}>
        <img
          src="/icons/restaurant.png"
          alt="Certain Foods"
          style={{ width: 24, height: 24 }}
        />
          <Typography variant="caption" sx={{ textTransform: 'none' }}>
            Certain Foods
          </Typography>
        </Box>
      </ToggleButton>
      <ToggleButton value="weather" aria-label="weather" 
      sx={{
        width: { xs: 90, md: 100 }, 
        height: { xs: 70, md: 75 }, 
      }}>
        <Box display="flex" flexDirection="column" alignItems="center" gap={0.5}>
        <img
          src="/icons/weather.png"
          alt="Weather"
          style={{ width: 24, height: 24 }}
        />
          <Typography variant="caption" sx={{ textTransform: 'none' }}>
            Weather
          </Typography>
        </Box>
      </ToggleButton>
      <ToggleButton value="lights" aria-label="lights" 
      sx={{
        width: { xs: 90, md: 100 }, 
        height: { xs: 70, md: 75 }, 
      }}>
        <Box display="flex" flexDirection="column" alignItems="center" gap={0.5}>
        <img
          src="/icons/lamp.png"
          alt="Lights"
          style={{ width: 24, height: 24 }}
        />
          <Typography variant="caption" sx={{ textTransform: 'none' }}>
            Bright Lights
          </Typography>
        </Box>
      </ToggleButton>
      <ToggleButton value="noise" aria-label="noise" 
      sx={{
        width: { xs: 90, md: 100 }, 
        height: { xs: 70, md: 75 }, 
      }}>
        <Box display="flex" flexDirection="column" alignItems="center" gap={0.5}>
        <img
          src="/icons/noise.png"
          alt="Noise"
          style={{ width: 24, height: 24 }}
        />
          <Typography variant="caption" sx={{ textTransform: 'none' }}>
            Noise
          </Typography>
        </Box>
      </ToggleButton>
      <ToggleButton value="scents" aria-label="scents" 
      sx={{
        width: { xs: 90, md: 100 }, 
        height: { xs: 70, md: 75 }, 
      }}>
        <Box display="flex" flexDirection="column" alignItems="center" gap={0.5}>
        <img
          src="/icons/perfume.png"
          alt="Scents"
          style={{ width: 24, height: 24 }}
        />
          <Typography variant="caption" sx={{ textTransform: 'none' }}>
            Strong Scents
          </Typography>
        </Box>
      </ToggleButton>
    </ToggleButtonGroup>
    
    <Typography variant="subtitle1" >
      Weather
    </Typography>
    <ToggleButtonGroup
      value={weatherTriggers}
      onChange={handleWeatherTrigger}
      aria-label="weather triggers"
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'flex-start', 
      }}
    >
      <ToggleButton value="sunny" aria-label="sunny" 
       sx={{
        width: { xs: 90, md: 100 },
        height: { xs: 60, md: 75 },
      }}>
        <Box display="flex" flexDirection="column" alignItems="center" gap={0.5}>
          <SunnyIcon />
          <Typography variant="caption" sx={{ textTransform: 'none' }}>
            Sunny
          </Typography>
        </Box>
      </ToggleButton>
      <ToggleButton value="cloudy" aria-label="cloudy" 
       sx={{
        width: { xs: 90, md: 100 },
        height: { xs: 60, md: 75 },
      }}>
        <Box display="flex" flexDirection="column" alignItems="center" gap={0.5}>
          <WbCloudyIcon />
          <Typography variant="caption" sx={{ textTransform: 'none' }}>
            Cloudy
          </Typography>
        </Box>
      </ToggleButton>
      <ToggleButton value="thunder" aria-label="thunder" 
       sx={{
        width: { xs: 90, md: 100 },
        height: { xs: 60, md: 75 },
      }}>
        <Box display="flex" flexDirection="column" alignItems="center" gap={0.5}>
          <ThunderstormIcon />
          <Typography variant="caption" sx={{ textTransform: 'none' }}>
            Thunderstorm
          </Typography>
        </Box>
      </ToggleButton>
      <ToggleButton value="windy" aria-label="windy" 
       sx={{
        width: { xs: 90, md: 100 },
        height: { xs: 60, md: 75 },
      }}>
        <Box display="flex" flexDirection="column" alignItems="center" gap={0.5}>
          <AirIcon />
          <Typography variant="caption" sx={{ textTransform: 'none' }}>
            Windy
          </Typography>
        </Box>
      </ToggleButton>
      <ToggleButton value="rainy" aria-label="rainy" 
       sx={{
        width: { xs: 90, md: 100 },
        height: { xs: 60, md: 75 },
      }}>
        <Box display="flex" flexDirection="column" alignItems="center" gap={0.5}>
          <WaterDropIcon />
          <Typography variant="caption" sx={{ textTransform: 'none' }}>
            Rainy
          </Typography>
        </Box>
      </ToggleButton>
      <ToggleButton value="snowy" aria-label="snowy" 
       sx={{
        width: { xs: 90, md: 100 },
        height: { xs: 60, md: 75 },
      }}>
        <Box display="flex" flexDirection="column" alignItems="center" gap={0.5}>
          <GrainIcon />
          <Typography variant="caption" sx={{ textTransform: 'none' }}>
            Snowy
          </Typography>
        </Box>
      </ToggleButton>
    </ToggleButtonGroup>

    <Typography variant="subtitle1" >
      Food
    </Typography>
    <ToggleButtonGroup
      value={foodTriggers}
      onChange={handleFoodTrigger}
      aria-label="food triggers"
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'flex-start',
      }}
    >
      <ToggleButton value="alcohol" aria-label="alcohol" 
      sx={{
        width: { xs: 90, md: 100 },
        height: { xs: 70, md: 75 },
      }}>
        <Box display="flex" flexDirection="column" alignItems="center" gap={0.5}>
        <img
          src="/icons/alcohol.svg"
          alt="Alcohol"
          style={{ width: 24, height: 24 }}
        />
          <Typography variant="caption" sx={{ textTransform: 'none' }}>
            Alcohol
          </Typography>
        </Box>
      </ToggleButton>
      <ToggleButton value="caffeine" aria-label="caffeine" 
      sx={{
        width: { xs: 90, md: 100 },
        height: { xs: 70, md: 75 },
      }}>
        <Box display="flex" flexDirection="column" alignItems="center" gap={0.5}>
        <img
          src="/icons/caffeine.svg"
          alt="Caffeine"
          style={{ width: 24, height: 24 }}
        />
          <Typography variant="caption" sx={{ textTransform: 'none' }}>
            Caffeine
          </Typography>
        </Box>
      </ToggleButton>
      <ToggleButton value="citrus" aria-label="citrus" 
      sx={{
        width: { xs: 90, md: 100 },
        height: { xs: 70, md: 75 },
      }}>
        <Box display="flex" flexDirection="column" alignItems="center" gap={0.5}>
        <img
          src="/icons/citrus.svg"
          alt="Citrus"
          style={{ width: 24, height: 24 }}
        />
          <Typography variant="caption" sx={{ textTransform: 'none' }}>
            Citrus Fruits
          </Typography>
        </Box>
      </ToggleButton>
      <ToggleButton value="banana" aria-label="banana" 
      sx={{
        width: { xs: 90, md: 100 },
        height: { xs: 70, md: 75 },
      }}>
        <Box display="flex" flexDirection="column" alignItems="center" gap={0.5}>
        <img
          src="/icons/banana.png"
          alt="Banana"
          style={{ width: 24, height: 24 }}
        />
          <Typography variant="caption" sx={{ textTransform: 'none' }}>
            Banana
          </Typography>
        </Box>
      </ToggleButton>
      <ToggleButton value="avocado" aria-label="avocado" 
      sx={{
        width: { xs: 90, md: 100 },
        height: { xs: 70, md: 75 },
      }}>
        <Box display="flex" flexDirection="column" alignItems="center" gap={0.5}>
        <img
          src="/icons/avocado.png"
          alt="Avocado"
          style={{ width: 24, height: 24 }}
        />
          <Typography variant="caption" sx={{ textTransform: 'none' }}>
            Avocado
          </Typography>
        </Box>
      </ToggleButton>
      <ToggleButton value="cheese" aria-label="cheese" 
      sx={{
        width: { xs: 90, md: 100 },
        height: { xs: 70, md: 75 },
      }}>
        <Box display="flex" flexDirection="column" alignItems="center" gap={0.5}>
        <img
          src="/icons/cheese.svg"
          alt="Cheese"
          style={{ width: 24, height: 24 }}
        />
          <Typography variant="caption" sx={{ textTransform: 'none' }}>
            Cheese
          </Typography>
        </Box>
      </ToggleButton>
      <ToggleButton value="milk" aria-label="milk" 
      sx={{
        width: { xs: 90, md: 100 },
        height: { xs: 70, md: 75 },
      }}>
        <Box display="flex" flexDirection="column" alignItems="center" gap={0.5}>
        <img
          src="/icons/milk.svg"
          alt="Milk"
          style={{ width: 24, height: 24 }}
        />
          <Typography variant="caption" sx={{ textTransform: 'none' }}>
            Milk
          </Typography>
        </Box>
      </ToggleButton>
      <ToggleButton value="yogurt" aria-label="yogurt" 
      sx={{
        width: { xs: 90, md: 100 },
        height: { xs: 70, md: 75 },
      }}>
        <Box display="flex" flexDirection="column" alignItems="center" gap={0.5}>
        <img
          src="/icons/yogurt.svg"
          alt="Yogurt"
          style={{ width: 24, height: 24 }}
        />
          <Typography variant="caption" sx={{ textTransform: 'none' }}>
            Yogurt
          </Typography>
        </Box>
      </ToggleButton>
      <ToggleButton value="icecream" aria-label="icecream" 
      sx={{
        width: { xs: 90, md: 100 },
        height: { xs: 70, md: 75 },
      }}>
        <Box display="flex" flexDirection="column" alignItems="center" gap={0.5}>
        <img
          src="/icons/icecream.svg"
          alt="Icecream"
          style={{ width: 24, height: 24 }}
        />
          <Typography variant="caption" sx={{ textTransform: 'none' }}>
            Ice cream
          </Typography>
        </Box>
      </ToggleButton>
      <ToggleButton value="chocolate" aria-label="chocolate" 
      sx={{
        width: { xs: 90, md: 100 },
        height: { xs: 70, md: 75 },
      }}>
        <Box display="flex" flexDirection="column" alignItems="center" gap={0.5}>
        <img
          src="/icons/chocolate.svg"
          alt="Chocolate"
          style={{ width: 24, height: 24 }}
        />
          <Typography variant="caption" sx={{ textTransform: 'none' }}>
            Chocolate
          </Typography>
        </Box>
      </ToggleButton>
      <ToggleButton value="peanutbutter" aria-label="peanutbutter" 
      sx={{
        width: { xs: 90, md: 100 },
        height: { xs: 70, md: 75 },
      }}>
        <Box display="flex" flexDirection="column" alignItems="center" gap={0.5}>
        <img
          src="/icons/peanutbutter.svg"
          alt="Peanutbutter"
          style={{ width: 24, height: 24 }}
        />
          <Typography variant="caption" sx={{ textTransform: 'none' }}>
            Peanut butter
          </Typography>
        </Box>
      </ToggleButton>
      <ToggleButton value="nuts" aria-label="nuts" 
      sx={{
        width: { xs: 90, md: 100 },
        height: { xs: 70, md: 75 },
      }}>
        <Box display="flex" flexDirection="column" alignItems="center" gap={0.5}>
        <img
          src="/icons/nuts.png"
          alt="Nuts"
          style={{ width: 24, height: 24 }}
        />
          <Typography variant="caption" sx={{ textTransform: 'none' }}>
            Nuts
          </Typography>
        </Box>
      </ToggleButton>
      <ToggleButton value="processedmeats" aria-label="processedmeats" 
      sx={{
        width: { xs: 90, md: 100 },
        height: { xs: 70, md: 75 },
      }}>
        <Box display="flex" flexDirection="column" alignItems="center" gap={0.5}>
        <img
          src="/icons/processedmeats.svg"
          alt="Processedmeats"
          style={{ width: 24, height: 24 }}
        />
          <Typography variant="caption" sx={{ textTransform: 'none' }}>
            Processsed meats
          </Typography>
        </Box>
      </ToggleButton>
      <ToggleButton value="fermentedfoods" aria-label="fermentedfoods" 
      sx={{
        width: { xs: 90, md: 100 },
        height: { xs: 70, md: 75 },
      }}>
        <Box display="flex" flexDirection="column" alignItems="center" gap={0.5}>
        <img
          src="/icons/pickle.png"
          alt="Fermented foods"
          style={{ width: 24, height: 24 }}
        />
          <Typography variant="caption" sx={{ textTransform: 'none' }}>
            Fermented foods
          </Typography>
        </Box>
      </ToggleButton>
      <ToggleButton value="msg" aria-label="msg" 
      sx={{
        width: { xs: 90, md: 100 },
        height: { xs: 70, md: 75 },
      }}>
        <Box display="flex" flexDirection="column" alignItems="center" gap={0.5}>
        <img
          src="/icons/chips.png"
          alt="msg"
          style={{ width: 24, height: 24 }}
        />
          <Typography variant="caption" sx={{ textTransform: 'none' }}>
            Foods with MSG
          </Typography>
        </Box>
      </ToggleButton>
    </ToggleButtonGroup>

    <Typography variant="subtitle1" >
      Activity
    </Typography>
    <ToggleButtonGroup
      value={activityTriggers}
      onChange={handleActivityTrigger}
      aria-label="activity triggers"
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'flex-start', 
      }}
    >
      <ToggleButton value="reading" aria-label="reading" 
      sx={{
        width: { xs: 90, md: 100 }, 
        height: { xs: 70, md: 75 }, 
      }}>
        <Box display="flex" flexDirection="column" alignItems="center" gap={0.5}>
        <img
          src="/icons/book.png"
          alt="Reading"
          style={{ width: 24, height: 24 }}
        />
          <Typography variant="caption" sx={{ textTransform: 'none' }}>
            Reading
          </Typography>
        </Box>
      </ToggleButton>
      <ToggleButton value="excersing" aria-label="excersing" 
      sx={{
        width: { xs: 90, md: 100 }, 
        height: { xs: 70, md: 75 }, 
      }}>
        <Box display="flex" flexDirection="column" alignItems="center" gap={0.5}>
        <img
          src="/icons/running-excersice.png"
          alt="Reading"
          style={{ width: 24, height: 24 }}
        />
          <Typography variant="caption" sx={{ textTransform: 'none' }}>
            Excercising
          </Typography>
        </Box>
      </ToggleButton>
      <ToggleButton value="traveling" aria-label="traveling" 
      sx={{
        width: { xs: 90, md: 100 }, 
        height: { xs: 70, md: 75 }, 
      }}>
        <Box display="flex" flexDirection="column" alignItems="center" gap={0.5}>
        <img
          src="/icons/car.png"
          alt="Traveling"
          style={{ width: 24, height: 24 }}
        />
          <Typography variant="caption" sx={{ textTransform: 'none' }}>
            Traveling
          </Typography>
        </Box>
      </ToggleButton>
      <ToggleButton value="socializing" aria-label="socializing" 
      sx={{
        width: { xs: 90, md: 100 }, 
        height: { xs: 70, md: 75 }, 
      }}>
        <Box display="flex" flexDirection="column" alignItems="center" gap={0.5}>
        <img
          src="/icons/speak.png"
          alt="Socializing"
          style={{ width: 24, height: 24 }}
        />
          <Typography variant="caption" sx={{ textTransform: 'none' }}>
            Socializing
          </Typography>
        </Box>
      </ToggleButton>
      <ToggleButton value="chores" aria-label="chores" 
      sx={{
        width: { xs: 90, md: 100 }, 
        height: { xs: 70, md: 75 }, 
      }}>
        <Box display="flex" flexDirection="column" alignItems="center" gap={0.5}>
        <img
          src="/icons/sweeping.png"
          alt="Chores"
          style={{ width: 24, height: 24 }}
        />
          <Typography variant="caption" sx={{ textTransform: 'none' }}>
            Chores
          </Typography>
        </Box>
      </ToggleButton>
      <ToggleButton value="shopping" aria-label="shopping" 
      sx={{
        width: { xs: 90, md: 100 }, 
        height: { xs: 70, md: 75 }, 
      }}>
        <Box display="flex" flexDirection="column" alignItems="center" gap={0.5}>
        <img
          src="/icons/shopping-cart.png"
          alt="Shopping"
          style={{ width: 24, height: 24 }}
        />
          <Typography variant="caption" sx={{ textTransform: 'none' }}>
            Shopping
          </Typography>
        </Box>
      </ToggleButton>
      <ToggleButton value="outside" aria-label="outside" 
      sx={{
        width: { xs: 90, md: 100 }, 
        height: { xs: 70, md: 75 }, 
      }}>
        <Box display="flex" flexDirection="column" alignItems="center" gap={0.5}>
        <img
          src="/icons/park.png"
          alt="Outside"
          style={{ width: 24, height: 24 }}
        />
          <Typography variant="caption" sx={{ textTransform: 'none' }}>
            Time Outside
          </Typography>
        </Box>
      </ToggleButton>
      <ToggleButton value="headphones" aria-label="headphones" 
      sx={{
        width: { xs: 90, md: 100 }, 
        height: { xs: 70, md: 75 }, 
      }}>
        <Box display="flex" flexDirection="column" alignItems="center" gap={0.5}>
        <img
          src="/icons/headphones.png"
          alt="Headphones"
          style={{ width: 24, height: 24 }}
        />
          <Typography variant="caption" sx={{ textTransform: 'none' }}>
            Wearing Headphones
          </Typography>
        </Box>
      </ToggleButton>
      <ToggleButton value="crowd" aria-label="crowd" 
      sx={{
        width: { xs: 90, md: 100 }, 
        height: { xs: 70, md: 75 }, 
      }}>
        <Box display="flex" flexDirection="column" alignItems="center" gap={0.5}>
        <img
          src="/icons/crowd-of-users.png"
          alt="Crowd"
          style={{ width: 24, height: 24 }}
        />
          <Typography variant="caption" sx={{ textTransform: 'none' }}>
            Being in Crowds
          </Typography>
        </Box>
      </ToggleButton>
    </ToggleButtonGroup>
          {symptomInputs.map(({ key, label, type }) => (
            <FormControl key={key} fullWidth>
              <FormLabel>{label}</FormLabel>
              {type === 'slider' ? (
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',    // Align items vertically
                    width: '100%',           // Ensure the container takes full width
                    padding: { xs: 1, md: 2 }, // Add padding for phones and larger screens
                  }}
                >
                <Slider
                  name={key}
                  value={Number.isFinite(Number(entry[key])) ? Number(entry[key]) : 0} // [MODIFIED] keep controlled numeric
                  onChange={(_, val) => {
                    const numericValue = Number(val);
                    setEntry((prev: typeof entry) => ({ ...prev, [key]: numericValue }));
                  }}
                  step={1}
                  min={0}
                  max={3}
                  marks={[
                    { value: 0, label: 'No' },
                    { value: 1, label: 'Mild' },
                    { value: 2, label: 'Moderate' },
                    { value: 3, label: 'Severe' },
                  ]}
                  sx={{
                    width: { xs: '90%', md: '90%' }, // Shrink slider width for phones
                    height: { xs: 4, md: 8 },        // Adjust slider height for phones
                  }}
                />
                </Box>
              ) : type === 'dropdown' ? (
                <TextField
                  select
                  name={key}
                  value={entry[key]}
                  onChange={handleChange}
                >
                  {problemOptions.map(opt => (
                    <MenuItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </MenuItem>
                  ))}

                </TextField>
              ) : type === 'radio' ? (
                <Box 
                sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: 1 }}>
                <RadioGroup
                  name={key}
                  value={Number.isFinite(Number(entry[key])) ? Number(entry[key]) : 0} // [MODIFIED] keep controlled numeric
                  onChange={(_, val) => {
                    const numericValue = Number(val);
                    setEntry((prev: typeof entry) => ({ ...prev, [key]: numericValue }));
                  }}
                  sx={{
                  flexDirection: { xs: 'column', sm: 'row', lg: 'row' } // Vertical for phones, horizontal for laptops
                  }}
                >
                  {problemOptions.map(opt => (
                  <FormControlLabel key={opt.value} value={opt.value} control={<Radio />} label={opt.label} />
                  ))}
                </RadioGroup>
                </Box>
              ) : type === 'switch' ? (
                <FormControlLabel
                  control={
                    <Switch
                      checked={entry[key] === 1}
                      onChange={e =>
                        setEntry((prev: typeof entry) => ({
                          ...prev,
                          [key]: e.target.checked ? 1 : 0
                        }))
                      }
                      name={key}
                    />
                  }
                  label={entry[key] === 1 ? 'Yes' : 'No'}
                />
              ) : null}
            </FormControl>
          ))}

          <TextField
            label="Additional Notes"
            name="notes"
            value={entry.notes}
            onChange={handleChange}
            fullWidth
            multiline
            minRows={3}
          />

          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={handleSubmit}
            sx={{ backgroundColor: '#1565c0', '&:hover': { backgroundColor: '#0d47a1' } }}
          >
            Save Entry
          </Button>
        </Box>
      )}
      {/* Snackbar */}
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
    </Box>
  );
};

export default DailyLog;
