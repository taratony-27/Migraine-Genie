import React, { useState } from 'react';
import { Box, Typography, TextField, Button, MenuItem, RadioGroup } from '@mui/material';
import Radio from '@mui/material/Radio';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';

const intensityLevels = ['Mild', 'Moderate', 'Severe'];
const triggers = [
  'Stress', 'Lack of sleep', 'Dehydration', 'Hormonal changes', 'Certain foods', 'Weather', 'Bright lights', 'Noise'
];

const DailyLog: React.FC = () => {
  const [entry, setEntry] = useState({
    date: '',
    duration: '',
    intensity: '',
    trigger: '',
    imbalance: '',
    soundDiscomfort: '',
    spinningSensation: '',
    lightsDiscomfort: '',
    lightheadedness: '',
    stress: '',
    headBodyDizziness: '',
    earPressure: '',
    visualSceneDizziness: '',
    motionSensitivity: '',
    walkingDifficulty: '',
    stairsDifficulty: '',
    reducedProductivity: '',
    concentratingDifficulty: '',
    sadness: '',
    socialSituationAvoidance: '',
    fallingFear: '',
    abnormalLifeFear: '',
    headaches: '',
    memoryDifficulty: '',
    nausea: '',
    headPressure: '',
    anxiety: '',
    movementSensation: '',
    fatigue: '',
    notes: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEntry(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    console.log('Diary entry submitted:', entry);
    alert("Migraine entry saved!");
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
            <MenuItem key={level} value={level}>
              {level}
            </MenuItem>
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
            <MenuItem key={trigger} value={trigger}>
              {trigger}
            </MenuItem>
          ))}
        </TextField>
        
        <FormControl>
          <FormLabel id="demo-row-radio-buttons-group-label">Imbalance</FormLabel>
          <RadioGroup
            row
            aria-labelledby="demo-row-radio-buttons-group-label"
            name="row-radio-buttons-group"
          >
            <FormControlLabel value="no problem" control={<Radio />} label="No problem" />
            <FormControlLabel value="mild problem" control={<Radio />} label="Mild problem" />
            <FormControlLabel value="moderate problem" control={<Radio />} label="Moderate problem" />
            <FormControlLabel value="severe problem" control={<Radio />} label="Severe problem" />
          </RadioGroup>
        </FormControl>

        <FormControl>
          <FormLabel id="demo-row-radio-buttons-group-label">Discomfort with loud sounds</FormLabel>
          <RadioGroup
            row
            aria-labelledby="demo-row-radio-buttons-group-label"
            name="row-radio-buttons-group"
          >
            <FormControlLabel value="no problem" control={<Radio />} label="No problem" />
            <FormControlLabel value="mild problem" control={<Radio />} label="Mild problem" />
            <FormControlLabel value="moderate problem" control={<Radio />} label="Moderate problem" />
            <FormControlLabel value="severe problem" control={<Radio />} label="Severe problem" />
          </RadioGroup>
        </FormControl>

        <FormControl>
          <FormLabel id="demo-row-radio-buttons-group-label">Spinning sensation</FormLabel>
          <RadioGroup
            row
            aria-labelledby="demo-row-radio-buttons-group-label"
            name="row-radio-buttons-group"
          >
            <FormControlLabel value="no problem" control={<Radio />} label="No problem" />
            <FormControlLabel value="mild problem" control={<Radio />} label="Mild problem" />
            <FormControlLabel value="moderate problem" control={<Radio />} label="Moderate problem" />
            <FormControlLabel value="severe problem" control={<Radio />} label="Severe problem" />
          </RadioGroup>
        </FormControl>

        <FormControl>
          <FormLabel id="demo-row-radio-buttons-group-label">Discomfort with bright lights</FormLabel>
          <RadioGroup
            row
            aria-labelledby="demo-row-radio-buttons-group-label"
            name="row-radio-buttons-group"
          >
            <FormControlLabel value="no problem" control={<Radio />} label="No problem" />
            <FormControlLabel value="mild problem" control={<Radio />} label="Mild problem" />
            <FormControlLabel value="moderate problem" control={<Radio />} label="Moderate problem" />
            <FormControlLabel value="severe problem" control={<Radio />} label="Severe problem" />
          </RadioGroup>
        </FormControl>

        <FormControl>
          <FormLabel id="demo-row-radio-buttons-group-label">Lightheadedness</FormLabel>
          <RadioGroup
            row
            aria-labelledby="demo-row-radio-buttons-group-label"
            name="row-radio-buttons-group"
          >
            <FormControlLabel value="no problem" control={<Radio />} label="No problem" />
            <FormControlLabel value="mild problem" control={<Radio />} label="Mild problem" />
            <FormControlLabel value="moderate problem" control={<Radio />} label="Moderate problem" />
            <FormControlLabel value="severe problem" control={<Radio />} label="Severe problem" />
          </RadioGroup>
        </FormControl>

        <FormControl>
          <FormLabel id="demo-row-radio-buttons-group-label">Stress</FormLabel>
          <RadioGroup
            row
            aria-labelledby="demo-row-radio-buttons-group-label"
            name="row-radio-buttons-group"
          >
            <FormControlLabel value="no problem" control={<Radio />} label="No problem" />
            <FormControlLabel value="mild problem" control={<Radio />} label="Mild problem" />
            <FormControlLabel value="moderate problem" control={<Radio />} label="Moderate problem" />
            <FormControlLabel value="severe problem" control={<Radio />} label="Severe problem" />
          </RadioGroup>
        </FormControl>

        <FormControl>
          <FormLabel id="demo-row-radio-buttons-group-label">Dizziness with head or body movement</FormLabel>
          <RadioGroup
            row
            aria-labelledby="demo-row-radio-buttons-group-label"
            name="row-radio-buttons-group"
          >
            <FormControlLabel value="no problem" control={<Radio />} label="No problem" />
            <FormControlLabel value="mild problem" control={<Radio />} label="Mild problem" />
            <FormControlLabel value="moderate problem" control={<Radio />} label="Moderate problem" />
            <FormControlLabel value="severe problem" control={<Radio />} label="Severe problem" />
          </RadioGroup>
        </FormControl>

        <FormControl>
          <FormLabel id="demo-row-radio-buttons-group-label">Ear pressure or ear fullness</FormLabel>
          <RadioGroup
            row
            aria-labelledby="demo-row-radio-buttons-group-label"
            name="row-radio-buttons-group"
          >
            <FormControlLabel value="no problem" control={<Radio />} label="No problem" />
            <FormControlLabel value="mild problem" control={<Radio />} label="Mild problem" />
            <FormControlLabel value="moderate problem" control={<Radio />} label="Moderate problem" />
            <FormControlLabel value="severe problem" control={<Radio />} label="Severe problem" />
          </RadioGroup>
        </FormControl>

        <FormControl>
          <FormLabel id="demo-row-radio-buttons-group-label">Dizziness with busy visual scenes, like a shopping mall or an intersection</FormLabel>
          <RadioGroup
            row
            aria-labelledby="demo-row-radio-buttons-group-label"
            name="row-radio-buttons-group"
          >
            <FormControlLabel value="no problem" control={<Radio />} label="No problem" />
            <FormControlLabel value="mild problem" control={<Radio />} label="Mild problem" />
            <FormControlLabel value="moderate problem" control={<Radio />} label="Moderate problem" />
            <FormControlLabel value="severe problem" control={<Radio />} label="Severe problem" />
          </RadioGroup>
        </FormControl>

        <FormControl>
          <FormLabel id="demo-row-radio-buttons-group-label">Motion sensitivity/motion sickness</FormLabel>
          <RadioGroup
            row
            aria-labelledby="demo-row-radio-buttons-group-label"
            name="row-radio-buttons-group"
          >
            <FormControlLabel value="no problem" control={<Radio />} label="No problem" />
            <FormControlLabel value="mild problem" control={<Radio />} label="Mild problem" />
            <FormControlLabel value="moderate problem" control={<Radio />} label="Moderate problem" />
            <FormControlLabel value="severe problem" control={<Radio />} label="Severe problem" />
          </RadioGroup>
        </FormControl>

        <FormControl>
          <FormLabel id="demo-row-radio-buttons-group-label">Difficulty walking around</FormLabel>
          <RadioGroup
            row
            aria-labelledby="demo-row-radio-buttons-group-label"
            name="row-radio-buttons-group"
          >
            <FormControlLabel value="no problem" control={<Radio />} label="No problem" />
            <FormControlLabel value="mild problem" control={<Radio />} label="Mild problem" />
            <FormControlLabel value="moderate problem" control={<Radio />} label="Moderate problem" />
            <FormControlLabel value="severe problem" control={<Radio />} label="Severe problem" />
          </RadioGroup>
        </FormControl>

        <FormControl>
          <FormLabel id="demo-row-radio-buttons-group-label">Difficulty using stairs</FormLabel>
          <RadioGroup
            row
            aria-labelledby="demo-row-radio-buttons-group-label"
            name="row-radio-buttons-group"
          >
            <FormControlLabel value="no problem" control={<Radio />} label="No problem" />
            <FormControlLabel value="mild problem" control={<Radio />} label="Mild problem" />
            <FormControlLabel value="moderate problem" control={<Radio />} label="Moderate problem" />
            <FormControlLabel value="severe problem" control={<Radio />} label="Severe problem" />
          </RadioGroup>
        </FormControl>

        <FormControl>
          <FormLabel id="demo-row-radio-buttons-group-label">Reduced productivity at work</FormLabel>
          <RadioGroup
            row
            aria-labelledby="demo-row-radio-buttons-group-label"
            name="row-radio-buttons-group"
          >
            <FormControlLabel value="no problem" control={<Radio />} label="No problem" />
            <FormControlLabel value="mild problem" control={<Radio />} label="Mild problem" />
            <FormControlLabel value="moderate problem" control={<Radio />} label="Moderate problem" />
            <FormControlLabel value="severe problem" control={<Radio />} label="Severe problem" />
          </RadioGroup>
        </FormControl>

        <FormControl>
          <FormLabel id="demo-row-radio-buttons-group-label">Difficulty concentrating</FormLabel>
          <RadioGroup
            row
            aria-labelledby="demo-row-radio-buttons-group-label"
            name="row-radio-buttons-group"
          >
            <FormControlLabel value="no problem" control={<Radio />} label="No problem" />
            <FormControlLabel value="mild problem" control={<Radio />} label="Mild problem" />
            <FormControlLabel value="moderate problem" control={<Radio />} label="Moderate problem" />
            <FormControlLabel value="severe problem" control={<Radio />} label="Severe problem" />
          </RadioGroup>
        </FormControl>

        <FormControl>
          <FormLabel id="demo-row-radio-buttons-group-label">Sadness</FormLabel>
          <RadioGroup
            row
            aria-labelledby="demo-row-radio-buttons-group-label"
            name="row-radio-buttons-group"
          >
            <FormControlLabel value="no problem" control={<Radio />} label="No problem" />
            <FormControlLabel value="mild problem" control={<Radio />} label="Mild problem" />
            <FormControlLabel value="moderate problem" control={<Radio />} label="Moderate problem" />
            <FormControlLabel value="severe problem" control={<Radio />} label="Severe problem" />
          </RadioGroup>
        </FormControl>

        <FormControl>
          <FormLabel id="demo-row-radio-buttons-group-label">Avoiding social situations</FormLabel>
          <RadioGroup
            row
            aria-labelledby="demo-row-radio-buttons-group-label"
            name="row-radio-buttons-group"
          >
            <FormControlLabel value="no problem" control={<Radio />} label="No problem" />
            <FormControlLabel value="mild problem" control={<Radio />} label="Mild problem" />
            <FormControlLabel value="moderate problem" control={<Radio />} label="Moderate problem" />
            <FormControlLabel value="severe problem" control={<Radio />} label="Severe problem" />
          </RadioGroup>
        </FormControl>

        <FormControl>
          <FormLabel id="demo-row-radio-buttons-group-label">Fear of falling</FormLabel>
          <RadioGroup
            row
            aria-labelledby="demo-row-radio-buttons-group-label"
            name="row-radio-buttons-group"
          >
            <FormControlLabel value="no problem" control={<Radio />} label="No problem" />
            <FormControlLabel value="mild problem" control={<Radio />} label="Mild problem" />
            <FormControlLabel value="moderate problem" control={<Radio />} label="Moderate problem" />
            <FormControlLabel value="severe problem" control={<Radio />} label="Severe problem" />
          </RadioGroup>
        </FormControl>

        <FormControl>
          <FormLabel id="demo-row-radio-buttons-group-label">Fear that life won't be normal again</FormLabel>
          <RadioGroup
            row
            aria-labelledby="demo-row-radio-buttons-group-label"
            name="row-radio-buttons-group"
          >
            <FormControlLabel value="no problem" control={<Radio />} label="No problem" />
            <FormControlLabel value="mild problem" control={<Radio />} label="Mild problem" />
            <FormControlLabel value="moderate problem" control={<Radio />} label="Moderate problem" />
            <FormControlLabel value="severe problem" control={<Radio />} label="Severe problem" />
          </RadioGroup>
        </FormControl>

        <FormControl>
          <FormLabel id="demo-row-radio-buttons-group-label">Headaches</FormLabel>
          <RadioGroup
            row
            aria-labelledby="demo-row-radio-buttons-group-label"
            name="row-radio-buttons-group"
          >
            <FormControlLabel value="no problem" control={<Radio />} label="No problem" />
            <FormControlLabel value="mild problem" control={<Radio />} label="Mild problem" />
            <FormControlLabel value="moderate problem" control={<Radio />} label="Moderate problem" />
            <FormControlLabel value="severe problem" control={<Radio />} label="Severe problem" />
          </RadioGroup>
        </FormControl>

        <FormControl>
          <FormLabel id="demo-row-radio-buttons-group-label">Trouble remembering things</FormLabel>
          <RadioGroup
            row
            aria-labelledby="demo-row-radio-buttons-group-label"
            name="row-radio-buttons-group"
          >
            <FormControlLabel value="no problem" control={<Radio />} label="No problem" />
            <FormControlLabel value="mild problem" control={<Radio />} label="Mild problem" />
            <FormControlLabel value="moderate problem" control={<Radio />} label="Moderate problem" />
            <FormControlLabel value="severe problem" control={<Radio />} label="Severe problem" />
          </RadioGroup>
        </FormControl>

        <FormControl>
          <FormLabel id="demo-row-radio-buttons-group-label">Nausea</FormLabel>
          <RadioGroup
            row
            aria-labelledby="demo-row-radio-buttons-group-label"
            name="row-radio-buttons-group"
          >
            <FormControlLabel value="no problem" control={<Radio />} label="No problem" />
            <FormControlLabel value="mild problem" control={<Radio />} label="Mild problem" />
            <FormControlLabel value="moderate problem" control={<Radio />} label="Moderate problem" />
            <FormControlLabel value="severe problem" control={<Radio />} label="Severe problem" />
          </RadioGroup>
        </FormControl>

        <FormControl>
          <FormLabel id="demo-row-radio-buttons-group-label">Head pressure</FormLabel>
          <RadioGroup
            row
            aria-labelledby="demo-row-radio-buttons-group-label"
            name="row-radio-buttons-group"
          >
            <FormControlLabel value="no problem" control={<Radio />} label="No problem" />
            <FormControlLabel value="mild problem" control={<Radio />} label="Mild problem" />
            <FormControlLabel value="moderate problem" control={<Radio />} label="Moderate problem" />
            <FormControlLabel value="severe problem" control={<Radio />} label="Severe problem" />
          </RadioGroup>
        </FormControl>

        <FormControl>
          <FormLabel id="demo-row-radio-buttons-group-label">Anxiety</FormLabel>
          <RadioGroup
            row
            aria-labelledby="demo-row-radio-buttons-group-label"
            name="row-radio-buttons-group"
          >
            <FormControlLabel value="no problem" control={<Radio />} label="No problem" />
            <FormControlLabel value="mild problem" control={<Radio />} label="Mild problem" />
            <FormControlLabel value="moderate problem" control={<Radio />} label="Moderate problem" />
            <FormControlLabel value="severe problem" control={<Radio />} label="Severe problem" />
          </RadioGroup>
        </FormControl>

        <FormControl>
          <FormLabel id="demo-row-radio-buttons-group-label">Sensation of movement, when you are NOT moving</FormLabel>
          <RadioGroup
            row
            aria-labelledby="demo-row-radio-buttons-group-label"
            name="row-radio-buttons-group"
          >
            <FormControlLabel value="no problem" control={<Radio />} label="No problem" />
            <FormControlLabel value="mild problem" control={<Radio />} label="Mild problem" />
            <FormControlLabel value="moderate problem" control={<Radio />} label="Moderate problem" />
            <FormControlLabel value="severe problem" control={<Radio />} label="Severe problem" />
          </RadioGroup>
        </FormControl>

        <FormControl>
          <FormLabel id="demo-row-radio-buttons-group-label">Fatigue</FormLabel>
          <RadioGroup
            row
            aria-labelledby="demo-row-radio-buttons-group-label"
            name="row-radio-buttons-group"
          >
            <FormControlLabel value="no problem" control={<Radio />} label="No problem" />
            <FormControlLabel value="mild problem" control={<Radio />} label="Mild problem" />
            <FormControlLabel value="moderate problem" control={<Radio />} label="Moderate problem" />
            <FormControlLabel value="severe problem" control={<Radio />} label="Severe problem" />
          </RadioGroup>
        </FormControl>
       
       

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
