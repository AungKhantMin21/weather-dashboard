import { useState, useEffect } from 'react'
import WeatherCard from './components/WeatherCard'
import './App.css'

const API_URL = 'http://localhost:3000'

const weatherCodes = {
  0: 'Clear sky',
  1: 'Mainly clear', 2: 'Partly cloudy', 3: 'Overcast',
  45: 'Fog', 48: 'Depositing rime fog',
  51: 'Light drizzle', 53: 'Moderate drizzle', 55: 'Dense drizzle',
  61: 'Slight rain', 63: 'Moderate rain', 65: 'Heavy rain',
  71: 'Slight snow', 73: 'Moderate snow', 75: 'Heavy snow',
  95: 'Thunderstorm', 96: 'Thunderstorm with hail',
}

function App() {
  const [cities, setCities] = useState([])
  const [selectedCity, setSelectedCity] = useState('')
  const [weather, setWeather] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchCities()
  }, [])

  const fetchCities = async () => {
    try {
      const response = await fetch(`${API_URL}/weather/cities`)
      const data = await response.json()
      setCities(data.cities)
    } catch (err) {
      setError('Failed to load cities')
    }
  }

  const fetchWeather = async () => {
    if (!selectedCity) {
      setError('Please select a city')
      return
    }

    setLoading(true)
    setError(null)
    setWeather(null)

    try {
      const response = await fetch(`${API_URL}/weather/${selectedCity}`)
      const data = await response.json()

      if (!data.success) {
        throw new Error(data.message)
      }

      setWeather(data.data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const clearCache = async () => {
    if (!selectedCity) return

    try {
      const response = await fetch(`${API_URL}/weather/cache/${selectedCity}`, {
        method: 'DELETE'
      })
      const data = await response.json()
      alert(data.message)
    } catch (err) {
      setError('Failed to clear cache')
    }
  }

  const getWeatherDescription = (code) => weatherCodes[code] || 'Unknown'

  return (
    <div className="container">
      <h1>Weather Dashboard</h1>

      <div className="city-selector">
        <label htmlFor="city">Select a city:</label>
        <select
          id="city"
          value={selectedCity}
          onChange={(e) => setSelectedCity(e.target.value)}
        >
          <option value="">-- Choose a city --</option>
          {cities.map((city) => (
            <option key={city.name} value={city.name.toLowerCase()}>
              {city.name}
            </option>
          ))}
        </select>
        <button onClick={fetchWeather} disabled={loading}>
          {loading ? 'Loading...' : 'Get Weather'}
        </button>
      </div>

      {error && <div className="error">{error}</div>}

      {weather && (
        <WeatherCard
          weather={weather}
          getWeatherDescription={getWeatherDescription}
          onClearCache={clearCache}
        />
      )}
    </div>
  )
}

export default App
