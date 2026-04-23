# Weather Dashboard API

Node.js Express API that fetches weather data from Open-Meteo public API and caches results in Redis. This is a backend-only service - the frontend is in the separate `web/` folder.

---

## Architecture Overview

```
┌─────────────┐     ┌──────────────┐     ┌─────────────────┐
│   Frontend  │────▶│ Express API  │────▶│  Open-Meteo API │
│  (web/)     │     │   (Node.js)  │     │  (External)     │
└─────────────┘     └──────┬───────┘     └─────────────────┘
                           │
                           ▼
                    ┌──────────────┐
                    │    Redis     │
                    │   (Cache)    │
                    └──────────────┘
```

---

## Tech Stack

| Component | Technology | Purpose |
|-----------|------------|---------|
| Runtime | Node.js 18+ | JavaScript runtime |
| Framework | Express 4.x | HTTP server & routing |
| Cache | Redis 6+ | In-memory data store for API response caching |
| CORS | cors | Cross-origin requests from frontend |
| External API | Open-Meteo | Free weather data (no API key required) |

---

## Project Structure

```
server/
├── server.js              # Application entry point
├── package.json           # Dependencies & scripts
├── .env.example           # Environment variables template
├── .env                   # Environment variables (gitignored)
├── Dockerfile             # Container configuration
├── config/
│   └── redis.js           # Redis client singleton
├── services/
│   └── weatherService.js  # Business logic, API calls, caching
└── routes/
    ├── index.js           # Route aggregator
    └── weather.js         # Weather endpoints
```

---

## Application Components

### 1. Entry Point (`server.js`)
- Initializes Express application
- Loads environment variables via `dotenv`
- Enables CORS for frontend communication
- Connects to Redis (required for startup)
- Mounts API routes
- Handles graceful shutdown on SIGTERM

### 2. Redis Client (`config/redis.js`)
- Singleton Redis client using `redis` npm package
- Connection settings from environment variables
- Event handlers for connection/error logging

### 3. Weather Service (`services/weatherService.js`)
**Core caching logic implementing Cache-Aside pattern:**
- `fetchWeatherData(lat, lon, city)` - Main function
  1. Generates cache key: `weather:${city.toLowerCase()}`
  2. Attempts Redis `GET` (cache hit returns immediately)
  3. On cache miss: fetches from Open-Meteo API
  4. Stores result in Redis with `SETEX` (TTL: 1800s / 30min)
  5. Returns formatted weather data

**Supported Cities (hardcoded coordinates):**
- yangon, mandalay, naypyitaw (Myanmar)
- bangkok, singapore, tokyo, london, new york

### 4. Routes (`routes/weather.js`)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/weather/cities` | GET | List all supported cities with coordinates |
| `/weather/:city` | GET | Get weather for city (cached or fresh) |
| `/weather/cache/:city` | DELETE | Manually invalidate cache for city |

---

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PORT` | No | 3000 | HTTP server port |
| `REDIS_HOST` | No | localhost | Redis server hostname |
| `REDIS_PORT` | No | 6379 | Redis server port |
| `REDIS_PASSWORD` | No | - | Redis AUTH password (if enabled) |
| `NODE_ENV` | No | development | Environment mode |

---

## Dependencies

```json
{
  "express": "^4.19.2",    // Web framework
  "redis": "^4.6.14",      // Redis client
  "dotenv": "^16.4.5"      // Environment config
}
```

**Dev Dependencies:**
- `nodemon` - Auto-restart during development

---

## Local Development

```bash
# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Ensure Redis is running locally
redis-cli ping  # Should return PONG

# Start development server
npm run dev

# Or production mode
npm start
```

**Access:**
- API Base: http://localhost:3000
- Health check: http://localhost:3000/health
- Example endpoint: http://localhost:3000/weather/yangon

---

## Redis Cache Details

**Key Pattern:** `weather:${city}` (lowercase)

**Example Keys:**
- `weather:yangon`
- `weather:london`
- `weather:tokyo`

**TTL:** 1800 seconds (30 minutes)

**Data Stored:** JSON string containing full weather response

**Manual Cache Operations:**
```bash
# Check if cached
redis-cli GET weather:yangon

# Clear specific city
redis-cli DEL weather:yangon

# Clear all weather keys
redis-cli KEYS "weather:*" | xargs redis-cli DEL

# Monitor Redis commands in real-time
redis-cli MONITOR
```

---

## External API Integration

**Provider:** Open-Meteo (https://open-meteo.com)

**Endpoint:** `https://api.open-meteo.com/v1/forecast`

**Parameters Used:**
- `latitude`, `longitude` - City coordinates
- `current_weather=true` - Current conditions
- `daily=temperature_2m_max,temperature_2m_min` - Forecast data
- `timezone=auto` - Local timezone

**Rate Limits:** None documented (free tier, no API key required)

---

## Health Check & Monitoring

**Health Endpoint:** `GET /health`

```json
{
  "status": "OK",
  "timestamp": "2024-01-15T14:30:00.000Z"
}
```

**Server Logs:**
- `Connected to Redis` - Successful Redis connection
- `Cache hit for ${city}` - Data served from Redis
- `Cache miss for ${city}, fetching from API...` - External API call
- `Cached weather data for ${city} (TTL: ${ttl}s)` - New cache entry

---

## Deployment Considerations (DevOps)

### Containerization

**Dockerfile requirements:**
- Node.js 18+ base image
- Copy all source files
- Run `npm ci --only=production`
- Expose port (default 3000)
- Start with `npm start`

**Note:** Redis should run as separate service/container. Do NOT run Redis in same container as app.

### Required Services

| Service | Type | Purpose |
|---------|------|---------|
| App Container | Node.js | Express API server |
| Redis | Cache | Data caching layer |

### Environment Configuration per Environment

**Development:**
- Local Redis instance
- `NODE_ENV=development`

**Staging/Production:**
- Managed Redis (AWS ElastiCache, Redis Cloud, etc.)
- `REDIS_HOST` = managed endpoint
- `REDIS_PASSWORD` = auth token
- `NODE_ENV=production`

### Security Considerations

- No authentication on API (public weather data)
- Redis password should be used in production
- Rate limiting recommended for production (prevent abuse)
- CORS is enabled for local development; configure `cors` options for production

### Scaling Notes

- **Stateless:** App can run multiple instances behind load balancer
- **Shared Cache:** All instances should connect to same Redis cluster
- **No Session State:** No user sessions to manage
- **Read-heavy:** Cache hit ratio should be high (>90%)

---

## Troubleshooting

| Issue | Cause | Solution |
|-------|-------|----------|
| `Failed to start server` | Redis connection failed | Check Redis is running, verify `REDIS_HOST`/`REDIS_PORT` |
| `City not supported` | City not in hardcoded list | Add coordinates to `cityCoordinates` in `weatherService.js` |
| `Weather API error` | Open-Meteo down | Check external API status, implement circuit breaker |
| Slow responses | Cache misses | Check Redis connection, monitor hit ratio |

---

## Future Enhancements (Optional)

- Add more cities via external geocoding API
- Implement circuit breaker for Open-Meteo
- Add rate limiting per IP
- Weather alerts/notifications
- Historical weather data storage
- GraphQL API layer
