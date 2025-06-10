import React, { useState } from 'react';
import {
  Box, Typography, TextField, Button, MenuItem,
  Slider, Switch, FormControl, FormLabel, FormControlLabel,
  Radio, RadioGroup
} from '@mui/material';

const intensityLevels = ['Mild', 'Moderate', 'Severe'];
// Change to icons
// Source: https://mui.com/material-ui/material-icons/
const triggers = [
  'Stress', 'Lack of sleep', 'Dehydration', 'Hormonal changes',
  'Certain foods', 'Weather', 'Bright lights', 'Noise'
];

// There are required ones for top 4
// The rest to be split into 3 pages for now

const problemOptions = ['No problem', 'Mild problem', 'Moderate problem', 'Severe problem'];

const symptomInputs = [
  // Physical Balance & Sensory
  { key: 'imbalance', label: 'Imbalance', type: 'slider' },
  { key: 'spinningSensation', label: 'Spinning sensation', type: 'slider' },
  { key: 'headBodyDizziness', label: 'Dizziness with head or body movement', type: 'radio' },
  { key: 'visualSceneDizziness', label: 'Dizziness with busy visual scenes', type: 'radio' },
  { key: 'motionSensitivity', label: 'Motion sensitivity/motion sickness', type: 'radio' },

  // Sensory Sensitivities
  { key: 'soundDiscomfort', label: 'Discomfort with loud sounds', type: 'dropdown' },
  { key: 'lightsDiscomfort', label: 'Discomfort with bright lights', type: 'dropdown' },

  // Physical Symptoms
  { key: 'lightheadedness', label: 'Lightheadedness', type: 'radio' },
  { key: 'earPressure', label: 'Ear pressure or ear fullness', type: 'radio' },
  { key: 'nausea', label: 'Nausea', type: 'radio' },
  { key: 'fatigue', label: 'Fatigue', type: 'slider' },
  { key: 'headPressure', label: 'Head pressure', type: 'slider' },
  { key: 'headaches', label: 'Headaches', type: 'slider' },
  { key: 'memoryDifficulty', label: 'Trouble remembering things', type: 'dropdown' },
  { key: 'movementSensation', label: 'Sensation of movement when not moving', type: 'dropdown' },

  // Functional Impact
  { key: 'walkingDifficulty', label: 'Difficulty walking around', type: 'slider' },
  { key: 'stairsDifficulty', label: 'Difficulty using stairs', type: 'dropdown' },
  { key: 'reducedProductivity', label: 'Reduced productivity at work', type: 'dropdown' },
  { key: 'concentratingDifficulty', label: 'Difficulty concentrating', type: 'dropdown' },

  // Emotional & Psychological
  { key: 'stress', label: 'Stress', type: 'slider' },
  { key: 'sadness', label: 'Sadness', type: 'slider' },
  { key: 'anxiety', label: 'Anxiety', type: 'dropdown' },
  { key: 'abnormalLifeFear', label: "Fear that life won't be normal again", type: 'dropdown' },
  { key: 'fallingFear', label: 'Fear of falling', type: 'switch' },
  { key: 'socialSituationAvoidance', label: 'Avoiding social situations', type: 'switch' },
];

const DailyLog: React.FC = () => {
  const [entry, setEntry] = useState<any>({
    //Need to change date to calendar library
    date: '',
    duration: '',
    intensity: '',
    trigger: '',
    notes: '',
    ...Object.fromEntries(symptomInputs.map(({ key }) => [key, '']))
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEntry((prev: typeof entry) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    console.log('Diary entry submitted:', entry);
    alert('Migraine entry saved!');
  };

  return (
    <Box width="100%">
      <Typography variant="h4" fontWeight="bold" color="#1565c0" mb={3}>
        Migraine Diary Entry
      </Typography>

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
          select
          label="Trigger"
          fullWidth
          name="trigger"
          value={entry.trigger}
          onChange={handleChange}
        >
          {triggers.map(trigger => (
            <MenuItem key={trigger} value={trigger}>{trigger}</MenuItem>
          ))}
        </TextField>

        {symptomInputs.map(({ key, label, type }) => (
          <FormControl key={key} fullWidth>
            <FormLabel>{label}</FormLabel>
            {type === 'slider' ? (
              <Slider
                name={key}
                value={parseInt(entry[key]) || 0}
                onChange={(_, val) => setEntry((prev: typeof entry) => ({ ...prev, [key]: String(val) }))}
                step={1}
                min={0}
                max={3}
                marks={[
                  { value: 0, label: 'No' },
                  { value: 1, label: 'Mild' },
                  { value: 2, label: 'Moderate' },
                  { value: 3, label: 'Severe' },
                ]}
              />
            ) : type === 'dropdown' ? (
              <TextField
                select
                name={key}
                value={entry[key]}
                onChange={handleChange}
              >
                {problemOptions.map(opt => (
                  <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                ))}
              </TextField>
            ) : type === 'radio' ? (
              <RadioGroup
                row
                name={key}
                value={entry[key]}
                onChange={handleChange}
              >
                {problemOptions.map(opt => (
                  <FormControlLabel key={opt} value={opt} control={<Radio />} label={opt} />
                ))}
              </RadioGroup>
            ) : type === 'switch' ? (
              <FormControlLabel
                control={
                  <Switch
                    checked={entry[key] === 'Yes'}
                    onChange={e => setEntry((prev: typeof entry) => ({ ...prev, [key]: e.target.checked ? 'Yes' : 'No' }))}
                    name={key}
                  />
                }
                label={entry[key] === 'Yes' ? 'Yes' : 'No'}
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
    </Box>
  );
};

export default DailyLog;