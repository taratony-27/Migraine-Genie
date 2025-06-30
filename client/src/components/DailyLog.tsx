import React, { useState } from 'react';
import {
  Box, Typography, TextField, Button, MenuItem,
  Slider, Switch, FormControl, FormLabel, FormControlLabel,
  Radio, RadioGroup
} from '@mui/material';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import SunnyIcon from '@mui/icons-material/WbSunny';
import WbCloudyIcon from '@mui/icons-material/WbCloudy';
import ThunderstormIcon from '@mui/icons-material/Thunderstorm';
import AirIcon from '@mui/icons-material/Air';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import GrainIcon from '@mui/icons-material/Grain';

const intensityLevels = ['Mild', 'Moderate', 'Severe'];
const triggers = [
  'Stress', 'Lack of sleep', 'Dehydration', 'Hormonal changes',
  'Certain foods', 'Weather', 'Bright lights', 'Noise'
];

const problemOptions = ['No problem', 'Mild problem', 'Moderate problem', 'Severe problem'];

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

const DailyLog: React.FC = () => {
  const [entry, setEntry] = useState<any>({
    date: '',
    duration: '',
    intensity: '',
    trigger: '',
    notes: '',
    ...Object.fromEntries(symptomInputs.map(({ key }) => [key, '']))
  });

  const [weatherTriggers, setWeatherTriggers] = useState<string[]>([]);
  const handleWeatherTrigger = (
    event: React.MouseEvent<HTMLElement>,
    newWeatherTriggers: string[]
  ) => {
    setWeatherTriggers(newWeatherTriggers);
    setEntry((prev: any) => ({
      ...prev,
      trigger: newWeatherTriggers.join(', '),
    }));
  };
  const [foodTriggers, setFoodTriggers] = useState<string[]>([]);
  const handleFoodTrigger = (
    event: React.MouseEvent<HTMLElement>,
    newFoodTriggers: string[]
  ) => {
    setFoodTriggers(newFoodTriggers);
    setEntry((prev: any) => ({
      ...prev,
      trigger: newFoodTriggers.join(', '),
    }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEntry((prev: typeof entry) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      const { date, duration, intensity, trigger, notes, ...symptoms } = entry;

      const payload = {
        log_id: Math.floor(Math.random() * 100000),
        user_id: 1,
        log_date: date,
        duration,
        intensity,
        trigger,
        notes,
        created_at: new Date().toISOString(),
        symptoms
      };

      await fetch('http://localhost:3001/api/daily-inputs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      alert('Migraine entry saved!');
    } catch (error) {
      console.error('Failed to save log', error);
      alert('Failed to save entry.');
    }
  };

  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<any[]>([]);

  const toggleHistory = async () => {
    if (!showHistory) {
      try {
        const response = await fetch('http://localhost:3001/api/daily-inputs');
        const data = await response.json();
        setHistory(data);
      } catch (err) {
        console.error('Failed to load history', err);
      }
    }
    setShowHistory(prev => !prev);
  };

  return (
    <Box width="100%">
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4" fontWeight="bold" color="#1565c0"
        sx={{
          fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' }, // Adjust font size for different screen sizes
        }}>
          Migraine Diary Entry
        </Typography>
        <Button
          variant="outlined"
          onClick={toggleHistory}
          sx={{
            width: { xs: '85px', sm: 'fit-content' }, // Smaller width for phones, fit-content for larger screens
            fontSize: { xs: '0.6rem', sm: '1rem' }, // Smaller font size for phones
            padding: { xs: '4px 8px', sm: '6px 12px' }, // Adjust padding for smaller screens
          }}
        >
          {showHistory ? 'Hide History' : 'View History'}
        </Button>
      </Box>

      {showHistory ? (
        <Box mb={4} p={2} border="1px solid #ccc" borderRadius={2}>
          <Typography variant="h6" gutterBottom>
            Entry History
          </Typography>
          {history.length === 0 ? (
            <Typography>No past entries found.</Typography>
          ) : (
            history.map((log, idx) => (
              <Box key={idx} mb={2} p={1} border="1px dashed #aaa" borderRadius={1}>
                <Typography variant="subtitle2">Date: {log.log_date?.substring(0, 10)}</Typography>
                <Typography variant="body2">Duration: {log.duration} hours</Typography>
                <Typography variant="body2">Intensity: {log.intensity}</Typography>
                <Typography variant="body2">Trigger: {log.trigger}</Typography>
                <Typography variant="body2">Notes: {log.notes || '-'}</Typography>
              </Box>
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
        width: { xs: 90, md: 100 }, // Smaller width for phones, larger for laptops
        height: { xs: 60, md: 75 }, // Smaller height for phones, larger for laptops
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
        width: { xs: 90, md: 100 }, // Smaller width for phones, larger for laptops
        height: { xs: 60, md: 75 }, // Smaller height for phones, larger for laptops
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
        width: { xs: 90, md: 100 }, // Smaller width for phones, larger for laptops
        height: { xs: 60, md: 75 }, // Smaller height for phones, larger for laptops
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
        width: { xs: 90, md: 100 }, // Smaller width for phones, larger for laptops
        height: { xs: 60, md: 75 }, // Smaller height for phones, larger for laptops
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
        width: { xs: 90, md: 100 }, // Smaller width for phones, larger for laptops
        height: { xs: 60, md: 75 }, // Smaller height for phones, larger for laptops
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
        width: { xs: 90, md: 100 }, // Smaller width for phones, larger for laptops
        height: { xs: 60, md: 75 }, // Smaller height for phones, larger for laptops
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
        width: { xs: 90, md: 100 }, // Smaller width for phones, larger for laptops
        height: { xs: 70, md: 75 }, // Smaller height for phones, larger for laptops
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
        width: { xs: 90, md: 100 }, // Smaller width for phones, larger for laptops
        height: { xs: 70, md: 75 }, // Smaller height for phones, larger for laptops
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
        width: { xs: 90, md: 100 }, // Smaller width for phones, larger for laptops
        height: { xs: 70, md: 75 }, // Smaller height for phones, larger for laptops
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
        width: { xs: 90, md: 100 }, // Smaller width for phones, larger for laptops
        height: { xs: 70, md: 75 }, // Smaller height for phones, larger for laptops
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
        width: { xs: 90, md: 100 }, // Smaller width for phones, larger for laptops
        height: { xs: 70, md: 75 }, // Smaller height for phones, larger for laptops
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
        width: { xs: 90, md: 100 }, // Smaller width for phones, larger for laptops
        height: { xs: 70, md: 75 }, // Smaller height for phones, larger for laptops
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
        width: { xs: 90, md: 100 }, // Smaller width for phones, larger for laptops
        height: { xs: 70, md: 75 }, // Smaller height for phones, larger for laptops
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
        width: { xs: 90, md: 100 }, // Smaller width for phones, larger for laptops
        height: { xs: 70, md: 75 }, // Smaller height for phones, larger for laptops
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
        width: { xs: 90, md: 100 }, // Smaller width for phones, larger for laptops
        height: { xs: 70, md: 75 }, // Smaller height for phones, larger for laptops
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
        width: { xs: 90, md: 100 }, // Smaller width for phones, larger for laptops
        height: { xs: 70, md: 75 }, // Smaller height for phones, larger for laptops
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
        width: { xs: 90, md: 100 }, // Smaller width for phones, larger for laptops
        height: { xs: 70, md: 75 }, // Smaller height for phones, larger for laptops
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
        width: { xs: 90, md: 100 }, // Smaller width for phones, larger for laptops
        height: { xs: 70, md: 75 }, // Smaller height for phones, larger for laptops
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
        width: { xs: 90, md: 100 }, // Smaller width for phones, larger for laptops
        height: { xs: 70, md: 75 }, // Smaller height for phones, larger for laptops
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
        width: { xs: 90, md: 100 }, // Smaller width for phones, larger for laptops
        height: { xs: 70, md: 75 }, // Smaller height for phones, larger for laptops
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
        width: { xs: 90, md: 100 }, // Smaller width for phones, larger for laptops
        height: { xs: 70, md: 75 }, // Smaller height for phones, larger for laptops
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
                        <MenuItem key={opt} value={opt}>{opt}</MenuItem>
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
                      value={entry[key]}
                      onChange={handleChange}
                      sx={{
                      flexDirection: { xs: 'column', sm: 'row', lg: 'row' } // Vertical for phones, horizontal for laptops
                      }}
                    >
                      {problemOptions.map(opt => (
                      <FormControlLabel key={opt} value={opt} control={<Radio />} label={opt} />
                      ))}
                    </RadioGroup>
                    </Box>
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
      )}      
    </Box>
  );
};

export default DailyLog;
