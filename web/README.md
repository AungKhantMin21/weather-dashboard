# Weather Dashboard - React Frontend

React frontend for the Weather Dashboard application. Built with Vite + React.

---

## Architecture

This is a **separate frontend application** that communicates with the Express backend API running on `localhost:3000`.

```
┌─────────────┐      HTTP API       ┌──────────────┐
│  React App  │ ◄──────────────────► │ Express API │
│  (Vite)     │   Port 3000         │  (server/)   │
│  Port 5173  │                     │              │
└─────────────┘                     └──────┬───────┘                                           │
                                           ▼
                                    ┌──────────────┐
                                    │    Redis     │
                                    └──────────────┘
```

---

## Project Structure

```
web/
├── src/
│   ├── components/
│   │   └── WeatherCard.jsx    # Weather display component
│   ├── App.jsx                # Main app component
│   ├── App.css                # Component styles
│   ├── index.css              # Global styles
│   └── main.jsx               # React entry point
├── index.html                 # HTML template
├── package.json
└── vite.config.js            # Vite configuration
```

---

## Components

### App.jsx
Main container component with:
- City dropdown selector (populated from API)
- Weather fetch logic
- Error handling
- Cache clear functionality

### WeatherCard.jsx
Presentation component displaying:
- City name and current temperature
- Weather condition (mapped from weather codes)
- Wind speed and direction
- 7-day forecast grid
- Data source indicator (Cache vs API)
- Manual cache clear button

---

## API Integration

**Base URL:** `http://localhost:3000`

| Endpoint | Method | Usage |
|----------|--------|-------|
| `/weather/cities` | GET | Load city dropdown options |
| `/weather/:city` | GET | Fetch weather data |
| `/weather/cache/:city` | DELETE | Clear cache for city |

---

## Development

```bash
# Install dependencies
npm install

# Start dev server (runs on port 5173)
npm run dev
```

**Note:** The backend server must be running on port 3000 for the frontend to work.

---

## Build for Production

```bash
npm run build
```

Creates a `dist/` folder with static files that can be served by any web server or the Express backend.

---

## API Response Format

**Weather endpoint:** `GET http://localhost:3000/weather/:city`

```json
{
  "success": true,
  "data": {
    "city": "Yangon",
    "latitude": 16.8661,
    "longitude": 96.1951,
    "current": {
      "temperature": 32.5,
      "windspeed": 8.2,
      "winddirection": 180,
      "weathercode": 1,
      "time": "2024-01-15T14:00"
    },
    "daily": {
      "maxTemps": [33, 34, 32, ...],
      "minTemps": [24, 25, 23, ...],
      "dates": ["2024-01-15", ...]
    },
    "cachedAt": "2024-01-15T14:05:00Z"
  }
}
```

---

## Styling

- CSS modules approach with separate `.css` files
- Gradient background (matching original design)
- Responsive card layout
- CSS Grid for forecast display
