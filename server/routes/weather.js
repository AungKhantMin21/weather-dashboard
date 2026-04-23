const express = require('express');
const { fetchWeatherData, getCityCoordinates, getSupportedCities } = require('../services/weatherService');
const redisClient = require('../config/redis');

const router = express.Router();

router.get('/cities', (req, res) => {
  res.json({ cities: getSupportedCities() });
});

router.get('/:city', async (req, res) => {
  try {
    const { city } = req.params;
    const coordinates = getCityCoordinates(city);
    
    if (!coordinates) {
      return res.status(404).json({
        message: 'City not supported',
        supportedCities: getSupportedCities().map(c => c.name),
      });
    }
    
    const weatherData = await fetchWeatherData(coordinates.lat, coordinates.lon, city);
    
    res.json({
      success: true,
      data: weatherData,
      source: 'api',
    });
  } catch (error) {
    console.error('Error fetching weather:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch weather data',
      error: error.message,
    });
  }
});

router.delete('/cache/:city', async (req, res) => {
  try {
    const { city } = req.params;
    const cacheKey = `weather:${city.toLowerCase()}`;
    
    await redisClient.del(cacheKey);
    
    res.json({
      success: true,
      message: `Cache cleared for ${city}`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;
