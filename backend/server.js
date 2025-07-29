const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const WEATHER_API_KEY = process.env.OPENWEATHER_WEATHER_API_KEY;

app.use(cors());

// Current weather endpoints
app.get('/api/weather', async (req, res) => {
  try {
    const { city } = req.query;
    if (!city) return res.status(400).json({ error: 'City is required' });

    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${WEATHER_API_KEY}&units=metric`
    );
    res.json(response.data);
  } catch (error) {
    console.error('City fetch error:', error.message);
    res.status(404).json({ error: 'City not found' });
  }
});

app.get('/api/weather/coords', async (req, res) => {
  try {
    const { lat, lon } = req.query;
    if (!lat || !lon) return res.status(400).json({ error: 'Coordinates required' });

    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}&units=metric`
    );
    res.json(response.data);
  } catch (error) {
    console.error('Coords fetch error:', error.message);
    res.status(404).json({ error: 'Location not found' });
  }
});

// Forecast endpoint (using onecall API)
app.get('/api/forecast', async (req, res) => {
  try {
    const { lat, lon } = req.query;
    if (!lat || !lon) return res.status(400).json({ error: 'Coordinates required' });

    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/onecall`,
      {
        params: {
          lat,
          lon,
          exclude: 'minutely,hourly,current,alerts',
          appid: WEATHER_API_KEY,
          units: 'metric'
        }
      }
    );
    res.json(response.data);
  } catch (error) {
    console.error('Forecast error:', error.message);
    
    // Fallback to 5-day forecast if onecall fails
    try {
      const fallbackResponse = await axios.get(
        `https://api.openweathermap.org/data/2.5/forecast`,
        {
          params: {
            lat: req.query.lat,
            lon: req.query.lon,
            appid: WEATHER_API_KEY,
            units: 'metric'
          }
        }
      );
      res.json(fallbackResponse.data);
    } catch (fallbackError) {
      console.error('Fallback forecast error:', fallbackError.message);
      res.status(500).json({ error: 'Failed to fetch forecast data' });
    }
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server is running at http://localhost:${PORT}`);
});