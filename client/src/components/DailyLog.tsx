import React, { useState } from 'react';
import { Box, Typography, TextField, Button, MenuItem, RadioGroup } from '@mui/material';
import Radio from '@mui/material/Radio';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
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

  const [weatherTriggers, setWeatherTriggers] = useState<string[]>([]);
  const handleWeatherTrigger = (event: React.MouseEvent<HTMLElement>,newWeatherTriggers: string[]) => {setWeatherTriggers(newWeatherTriggers);
  setEntry(prev => ({ ...prev, trigger: newWeatherTriggers.join(', ') }));};

  const [foodTriggers, setFoodTriggers] = useState<string[]>([]);
  const handleFoodTrigger = (event: React.MouseEvent<HTMLElement>,newFoodTriggers: string[]) => {setFoodTriggers(newFoodTriggers);
  setEntry(prev => ({ ...prev, trigger: newFoodTriggers.join(', ') }));};

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

        <Typography variant="subtitle1" >
          Weather
        </Typography>

        

        <ToggleButtonGroup
          value={weatherTriggers}
          onChange={handleWeatherTrigger}
          aria-label="weather triggers"
        >
          <ToggleButton value="sunny" aria-label="sunny" sx={{ width: 100 }}>
            <Box display="flex" flexDirection="column" alignItems="center" gap={0.5}>
              <SunnyIcon />
              <Typography variant="caption" sx={{ textTransform: 'none' }}>
                Sunny
              </Typography>
            </Box>
          </ToggleButton>
          <ToggleButton value="cloudy" aria-label="cloudy" sx={{ width: 100 }}>
            <Box display="flex" flexDirection="column" alignItems="center" gap={0.5}>
              <WbCloudyIcon />
              <Typography variant="caption" sx={{ textTransform: 'none' }}>
                Cloudy
              </Typography>
            </Box>
          </ToggleButton>
          <ToggleButton value="thunder" aria-label="thunder" sx={{ width: 100 }}>
            <Box display="flex" flexDirection="column" alignItems="center" gap={0.5}>
              <ThunderstormIcon />
              <Typography variant="caption" sx={{ textTransform: 'none' }}>
                Thunderstorm
              </Typography>
            </Box>
          </ToggleButton>
          <ToggleButton value="windy" aria-label="windy" sx={{ width: 100 }}>
            <Box display="flex" flexDirection="column" alignItems="center" gap={0.5}>
              <AirIcon />
              <Typography variant="caption" sx={{ textTransform: 'none' }}>
                Windy
              </Typography>
            </Box>
          </ToggleButton>
          <ToggleButton value="rainy" aria-label="rainy" sx={{ width: 100 }}>
            <Box display="flex" flexDirection="column" alignItems="center" gap={0.5}>
              <WaterDropIcon />
              <Typography variant="caption" sx={{ textTransform: 'none' }}>
                Rainy
              </Typography>
            </Box>
          </ToggleButton>
          <ToggleButton value="snowy" aria-label="snowy" sx={{ width: 100 }}>
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
          }}
        >
          <ToggleButton value="alcohol" aria-label="alcohol" sx={{ width: 100, height: 75 }}>
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
          <ToggleButton value="caffeine" aria-label="caffeine" sx={{ width: 100, height: 75  }}>
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
          <ToggleButton value="citrus" aria-label="citrus" sx={{ width: 100, height: 75  }}>
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
          <ToggleButton value="banana" aria-label="banana" sx={{ width: 100, height: 75  }}>
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
          <ToggleButton value="avocado" aria-label="avocado" sx={{ width: 100, height: 75  }}>
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
          <ToggleButton value="cheese" aria-label="cheese" sx={{ width: 100, height: 75  }}>
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
          <ToggleButton value="milk" aria-label="milk" sx={{ width: 100, height: 75  }}>
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
          <ToggleButton value="yogurt" aria-label="yogurt" sx={{ width: 100, height: 75  }}>
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
          <ToggleButton value="icecream" aria-label="icecream" sx={{ width: 100, height: 75  }}>
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
          <ToggleButton value="chocolate" aria-label="chocolate" sx={{ width: 100, height: 75  }}>
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
          <ToggleButton value="peanutbutter" aria-label="peanutbutter" sx={{ width: 100, height: 75  }}>
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
          <ToggleButton value="nuts" aria-label="nuts" sx={{ width: 100, height: 75  }}>
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
          <ToggleButton value="processedmeats" aria-label="processedmeats" sx={{ width: 100, height: 75  }}>
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
          <ToggleButton value="fermentedfoods" aria-label="fermentedfoods" sx={{ width: 100, height: 75  }}>
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
          <ToggleButton value="msg" aria-label="msg" sx={{ width: 100, height: 75  }}>
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
