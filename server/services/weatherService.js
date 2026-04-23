const redisClient = require('../config/redis');

const OPEN_METEO_URL = 'https://api.open-meteo.com/v1/forecast';
const CACHE_TTL = 1800;

async function fetchWeatherData(latitude, longitude, city) {
  const cacheKey = `weather:${city.toLowerCase()}`;
  
  const cachedData = await redisClient.get(cacheKey);
  if (cachedData) {
    console.log(`Cache hit for ${city}`);
    return JSON.parse(cachedData);
  }
  
  console.log(`Cache miss for ${city}, fetching from API...`);
  
  const url = `${OPEN_METEO_URL}?latitude=${latitude}&longitude=${longitude}&current_weather=true&daily=temperature_2m_max,temperature_2m_min&timezone=auto`;
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Weather API error: ${response.status}`);
  }
  
  const data = await response.json();
  
  const weatherData = {
    city: city,
    latitude: latitude,
    longitude: longitude,
    current: {
      temperature: data.current_weather.temperature,
      windspeed: data.current_weather.windspeed,
      winddirection: data.current_weather.winddirection,
      weathercode: data.current_weather.weathercode,
      time: data.current_weather.time,
    },
    daily: data.daily ? {
      maxTemps: data.daily.temperature_2m_max,
      minTemps: data.daily.temperature_2m_min,
      dates: data.daily.time,
    } : null,
    cachedAt: new Date().toISOString(),
  };
  
  await redisClient.setEx(cacheKey, CACHE_TTL, JSON.stringify(weatherData));
  console.log(`Cached weather data for ${city} (TTL: ${CACHE_TTL}s)`);
  
  return weatherData;
}

const cityCoordinates = {
  'yangon': { lat: 16.8661, lon: 96.1951 },
  'mandalay': { lat: 21.9747, lon: 96.0836 },
  'naypyitaw': { lat: 19.7633, lon: 96.0785 },
  'bangkok': { lat: 13.7563, lon: 100.5018 },
  'singapore': { lat: 1.3521, lon: 103.8198 },
  'tokyo': { lat: 35.6762, lon: 139.6503 },
  'london': { lat: 51.5074, lon: -0.1278 },
  'new york': { lat: 40.7128, lon: -74.0060 },
};

function getCityCoordinates(city) {
  const normalizedCity = city.toLowerCase();
  return cityCoordinates[normalizedCity] || null;
}

function getSupportedCities() {
  return Object.keys(cityCoordinates).map(city => ({
    name: city.charAt(0).toUpperCase() + city.slice(1),
    coordinates: cityCoordinates[city],
  }));
}

module.exports = {
  fetchWeatherData,
  getCityCoordinates,
  getSupportedCities,
};
