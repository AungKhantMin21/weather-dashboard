function WeatherCard({ weather, getWeatherDescription, onClearCache }) {
  const { city, current, daily, cachedAt } = weather

  return (
    <div className="weather-card">
      <h2>{city}</h2>

      <div className="weather-info">
        <div className="current">
          <span className="temperature">{current.temperature}°C</span>
          <span className="condition">
            {getWeatherDescription(current.weathercode)}
          </span>
        </div>

        <div className="details">
          <p>Windspeed: {current.windspeed} km/h</p>
          <p>Wind Direction: {current.winddirection}°</p>
          <p>Last Updated: {new Date(current.time).toLocaleString()}</p>
          <p className="source">
            Source: {cachedAt ? 'Redis Cache' : 'Open-Meteo API'}
          </p>
        </div>
      </div>

      {daily && (
        <div className="forecast">
          <h3>7-Day Forecast</h3>
          <div className="forecast-list">
            {daily.dates.slice(0, 7).map((date, i) => (
              <div key={date} className="forecast-day">
                <div className="date">
                  {new Date(date).toLocaleDateString(undefined, {
                    weekday: 'short',
                  })}
                </div>
                <div className="temp">{Math.round(daily.maxTemps[i])}°</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <button onClick={onClearCache} className="secondary">
        Clear Cache
      </button>
    </div>
  )
}

export default WeatherCard
