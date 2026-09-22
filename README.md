# SkyPulse — Modern Weather Forecast Web App Prototype

A responsive, glassmorphic weather forecasting web application prototype built with modern web technologies and real-time atmospheric data.

![SkyPulse Weather Prototype](preview.png)

---

## 🌟 Key Features

1. **Real-Time Weather Data (Open-Meteo API)**:
   - Live atmospheric updates without any API keys or registration required.
   - Intelligent fallback to offline mock data for seamless offline demos.

2. **Smart Global Search & Geolocation**:
   - Debounced search bar with instant autocomplete for cities and regions across the globe.
   - Quick "Locate Me" GPS button using the HTML5 Geolocation API.
   - Quick-access saved locations bar with local persistence.

3. **Dynamic Atmospheric Themes & Backgrounds**:
   - Adaptive color palettes reflecting live weather conditions: Clear Day, Starry Night, Overcast, Rain/Drizzle, Thunderstorm, and Snow.
   - Interactive HTML5 canvas particle engine simulating rainfall, drifting snowflakes, twinkling stars, and ambient sunlight motes.

4. **24-Hour Hourly Forecast with Interactive SVG Trend Curve**:
   - Horizontal hourly timeline showing temperatures, weather icons, and rain probabilities.
   - Smooth SVG bezier curve visualizing temperature fluctuations with hover tooltips.

5. **7-Day Extended Outlook**:
   - Daily cards showing weather icons, precipitation chances, and normalized relative temperature range bars.

6. **Key Atmospheric Metric Cards**:
   - **UV Index**: Numeric gauge, color-coded risk meter, and sun protection recommendations.
   - **Wind & Direction**: Wind speed, gust estimates, and animated directional compass dial.
   - **Solar Cycle**: Sunrise, sunset times, and visual daylight progress bar.
   - **Humidity & Dew Point**: Moisture levels with calculated comfort metrics.
   - **Atmospheric Pressure & Visibility**: Barometric readings and distance.
   - **Precipitation & Cloud Cover**: Total rain/snow volume and cloud cover percentage.

7. **Unit System & User Preferences**:
   - Instant toggle between **Metric (°C, km/h, mm)** and **Imperial (°F, mph, in)** with reactive updates without re-fetching.
   - Saved favorites and last-visited location persisted in `localStorage`.
   - Keyboard shortcut: Press `/` anywhere to focus the search bar.

---

## 🚀 Getting Started

### Option 1: Run with Node.js dev server

```bash
cd C:\Users\SUDHEER\.gemini\antigravity\scratch\weather-forecast-app
npm start
```
Then open [http://localhost:3000](http://localhost:3000) in your web browser.

### Option 2: Open Directly in Browser
Because the app uses standard ES modules, you can serve it with any local static server (e.g. `npx serve`, VS Code Live Server, or Python `python -m http.server 3000`).

---

## 📂 Project Architecture

```
weather-forecast-app/
├── index.html           # Semantic HTML5 layout with accessibility tags
├── package.json         # Project metadata and npm start script
├── server.js            # Zero-dependency local Node.js static web server
├── css/
│   ├── style.css        # Glassmorphic styling, CSS variables, responsive grid
│   └── animations.css   # Keyframe animations and weather icon micro-interactions
└── js/
    ├── api.js           # Open-Meteo Weather & Geocoding API client & WMO mapper
    ├── app.js           # Main application state controller and event orchestration
    ├── chart.js         # Interactive SVG temperature curve and spline generator
    ├── icons.js         # Crisp, animated vector SVG weather icons
    ├── particles.js     # Canvas-based ambient weather particle atmosphere
    └── storage.js       # LocalStorage preference and favorites manager
```
