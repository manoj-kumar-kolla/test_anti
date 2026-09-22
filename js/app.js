/**
 * SkyPulse Weather Forecast Web Application
 * Main Application Controller & UI State Engine
 */

import {
  fetchWeatherData,
  searchLocations,
  reverseGeocode,
  getWeatherInfo
} from './api.js';

import {
  getUnitSystem,
  setUnitSystem,
  getLastLocation,
  setLastLocation,
  getFavorites,
  isFavorite,
  toggleFavorite
} from './storage.js';

import { getWeatherIconSvg } from './icons.js';
import { renderHourlyChart } from './chart.js';
import { initWeatherAtmosphere } from './particles.js';

class SkyPulseApp {
  constructor() {
    this.state = {
      location: getLastLocation(),
      weatherData: null,
      isMockData: false,
      unit: getUnitSystem(), // 'metric' or 'imperial'
      searchQuery: '',
      searchResults: [],
      activeDropdownIndex: -1,
      isLoading: false
    };

    this.debounceTimer = null;
    this.atmosphere = null;

    this.initDOM();
    this.bindEvents();
    this.init();
  }

  initDOM() {
    this.elements = {
      body: document.body,
      brandLogo: document.getElementById('brand-logo'),
      searchInput: document.getElementById('search-input'),
      searchClearBtn: document.getElementById('search-clear-btn'),
      searchDropdown: document.getElementById('search-dropdown'),
      btnGeolocation: document.getElementById('btn-geolocation'),
      btnCelsius: document.getElementById('unit-celsius'),
      btnFahrenheit: document.getElementById('unit-fahrenheit'),
      favoritesBar: document.getElementById('favorites-bar'),
      
      // Hero Card
      currentCityName: document.getElementById('current-city-name'),
      btnToggleFavorite: document.getElementById('btn-toggle-favorite'),
      currentLocalTime: document.getElementById('current-local-time'),
      dataSourceText: document.getElementById('data-source-text'),
      currentTemp: document.getElementById('current-temp'),
      heroTempUnit: document.getElementById('hero-temp-unit'),
      feelsLikeTemp: document.getElementById('feels-like-temp'),
      todayHigh: document.getElementById('today-high'),
      todayLow: document.getElementById('today-low'),
      heroConditionIcon: document.getElementById('hero-condition-icon'),
      conditionName: document.getElementById('condition-name'),
      conditionCategory: document.getElementById('condition-category'),
      adviceIcon: document.getElementById('advice-icon'),
      adviceText: document.getElementById('advice-text'),

      // Forecasts
      hourlyChartContainer: document.getElementById('hourly-chart-container'),
      hourlyScrollContainer: document.getElementById('hourly-scroll-container'),
      dailyForecastList: document.getElementById('daily-forecast-list'),

      // Metrics
      valUv: document.getElementById('val-uv'),
      uvNeedle: document.getElementById('uv-needle'),
      uvRiskText: document.getElementById('uv-risk-text'),
      valWindSpeed: document.getElementById('val-wind-speed'),
      unitWind: document.getElementById('unit-wind'),
      valWindDir: document.getElementById('val-wind-dir'),
      valWindGusts: document.getElementById('val-wind-gusts'),
      windCompassArrow: document.getElementById('wind-compass-arrow'),
      sunArcFill: document.getElementById('sun-arc-fill'),
      valSunrise: document.getElementById('val-sunrise'),
      valSunset: document.getElementById('val-sunset'),
      valDaylightLeft: document.getElementById('val-daylight-left'),
      valHumidity: document.getElementById('val-humidity'),
      valDewPoint: document.getElementById('val-dew-point'),
      valPressure: document.getElementById('val-pressure'),
      valVisibility: document.getElementById('val-visibility'),
      valPrecipSum: document.getElementById('val-precip-sum'),
      unitPrecip: document.getElementById('unit-precip'),
      valCloudCover: document.getElementById('val-cloud-cover'),

      // Overlays
      loadingOverlay: document.getElementById('loading-overlay'),
      toast: document.getElementById('toast'),
      toastMessage: document.getElementById('toast-message')
    };
  }

  bindEvents() {
    // Search input typing with debounce
    this.elements.searchInput.addEventListener('input', (e) => {
      const val = e.target.value;
      this.elements.searchClearBtn.classList.toggle('visible', val.length > 0);
      
      clearTimeout(this.debounceTimer);
      if (val.trim().length < 2) {
        this.closeSearchDropdown();
        return;
      }

      this.debounceTimer = setTimeout(() => {
        this.handleLocationSearch(val);
      }, 250);
    });

    // Keyboard navigation in search
    this.elements.searchInput.addEventListener('keydown', (e) => {
      this.handleSearchKeydown(e);
    });

    // Clear search
    this.elements.searchClearBtn.addEventListener('click', () => {
      this.elements.searchInput.value = '';
      this.elements.searchClearBtn.classList.remove('visible');
      this.closeSearchDropdown();
      this.elements.searchInput.focus();
    });

    // Close search dropdown on click outside
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.search-wrapper')) {
        this.closeSearchDropdown();
      }
    });

    // Quick keyboard shortcut "/" to focus search
    document.addEventListener('keydown', (e) => {
      if (e.key === '/' && document.activeElement !== this.elements.searchInput) {
        e.preventDefault();
        this.elements.searchInput.focus();
        this.elements.searchInput.select();
      }
    });

    // Brand logo resets to initial location
    this.elements.brandLogo.addEventListener('click', () => {
      this.loadLocation(this.state.location, true);
    });

    // Geolocation trigger
    this.elements.btnGeolocation.addEventListener('click', () => {
      this.handleGeolocation();
    });

    // Unit toggle buttons
    this.elements.btnCelsius.addEventListener('click', () => {
      this.setUnit('metric');
    });

    this.elements.btnFahrenheit.addEventListener('click', () => {
      this.setUnit('imperial');
    });

    // Favorite bookmark toggle
    this.elements.btnToggleFavorite.addEventListener('click', () => {
      this.handleToggleFavorite();
    });
  }

  async init() {
    this.atmosphere = initWeatherAtmosphere('weather-canvas');
    this.updateUnitButtons();
    this.renderFavoritesBar();
    await this.loadLocation(this.state.location);
  }

  // --- Location Loading & Data Fetching ---

  async loadLocation(location, forceRefresh = false) {
    this.setLoading(true);
    this.state.location = location;
    setLastLocation(location);
    this.renderFavoritesBar();

    try {
      const result = await fetchWeatherData(location.latitude, location.longitude, location.timezone);
      this.state.weatherData = result.data;
      this.state.isMockData = result.isMock;

      this.render();
      if (result.isMock) {
        this.showToast('Using demo atmospheric feed for prototype preview.');
      }
    } catch (err) {
      console.error('Error fetching weather:', err);
      this.showToast('Failed to load weather data. Please try again.');
    } finally {
      this.setLoading(false);
    }
  }

  handleGeolocation() {
    if (!navigator.geolocation) {
      this.showToast('Geolocation is not supported by your browser.');
      return;
    }

    this.setLoading(true);
    this.showToast('Detecting your location...');

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        try {
          const locDetails = await reverseGeocode(lat, lon);
          this.loadLocation(locDetails);
          this.showToast(`Found: ${locDetails.name}`);
        } catch (e) {
          this.loadLocation({
            name: 'Current Location',
            country: '',
            latitude: lat,
            longitude: lon,
            timezone: 'auto'
          });
        }
      },
      (err) => {
        this.setLoading(false);
        let msg = 'Unable to retrieve location.';
        if (err.code === 1) msg = 'Location access permission was denied.';
        else if (err.code === 2) msg = 'Location position unavailable.';
        this.showToast(msg);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  }

  async handleLocationSearch(query) {
    const results = await searchLocations(query);
    this.state.searchResults = results;
    this.renderSearchDropdown(results);
  }

  renderSearchDropdown(results) {
    const dropdown = this.elements.searchDropdown;
    dropdown.innerHTML = '';
    this.state.activeDropdownIndex = -1;

    if (!results || results.length === 0) {
      const empty = document.createElement('li');
      empty.className = 'dropdown-item';
      empty.style.cursor = 'default';
      empty.style.color = 'var(--text-muted)';
      empty.textContent = 'No matching locations found.';
      dropdown.appendChild(empty);
      dropdown.classList.add('open');
      this.elements.searchInput.setAttribute('aria-expanded', 'true');
      return;
    }

    results.forEach((item, index) => {
      const li = document.createElement('li');
      li.className = 'dropdown-item';
      li.setAttribute('role', 'option');
      li.setAttribute('id', `dropdown-opt-${index}`);

      const left = document.createElement('div');
      left.innerHTML = `
        <span class="dropdown-city">${this.escapeHtml(item.name)}</span>
        ${item.admin1 ? `<span style="font-size: 0.8rem; color: var(--text-secondary); margin-left: 4px;">(${this.escapeHtml(item.admin1)})</span>` : ''}
      `;

      const right = document.createElement('div');
      right.className = 'dropdown-country';
      right.textContent = item.country || '';

      li.appendChild(left);
      li.appendChild(right);

      li.addEventListener('click', () => {
        this.selectSearchResult(item);
      });

      dropdown.appendChild(li);
    });

    dropdown.classList.add('open');
    this.elements.searchInput.setAttribute('aria-expanded', 'true');
  }

  selectSearchResult(location) {
    this.elements.searchInput.value = '';
    this.elements.searchClearBtn.classList.remove('visible');
    this.closeSearchDropdown();
    this.loadLocation(location);
  }

  handleSearchKeydown(e) {
    const items = this.elements.searchDropdown.querySelectorAll('.dropdown-item');
    if (!this.elements.searchDropdown.classList.contains('open') || items.length === 0) {
      if (e.key === 'Enter') {
        e.preventDefault();
        const val = this.elements.searchInput.value.trim();
        if (val) this.handleLocationSearch(val);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      this.state.activeDropdownIndex = (this.state.activeDropdownIndex + 1) % items.length;
      this.updateActiveDropdownItem(items);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      this.state.activeDropdownIndex = (this.state.activeDropdownIndex - 1 + items.length) % items.length;
      this.updateActiveDropdownItem(items);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (this.state.activeDropdownIndex >= 0 && this.state.searchResults[this.state.activeDropdownIndex]) {
        this.selectSearchResult(this.state.searchResults[this.state.activeDropdownIndex]);
      }
    } else if (e.key === 'Escape') {
      this.closeSearchDropdown();
    }
  }

  updateActiveDropdownItem(items) {
    items.forEach((it, idx) => {
      if (idx === this.state.activeDropdownIndex) {
        it.classList.add('active');
        it.scrollIntoView({ block: 'nearest' });
      } else {
        it.classList.remove('active');
      }
    });
  }

  closeSearchDropdown() {
    this.elements.searchDropdown.classList.remove('open');
    this.elements.searchInput.setAttribute('aria-expanded', 'false');
    this.state.activeDropdownIndex = -1;
  }

  // --- Units & Preferences ---

  setUnit(unit) {
    if (this.state.unit === unit) return;
    this.state.unit = unit;
    setUnitSystem(unit);
    this.updateUnitButtons();
    if (this.state.weatherData) {
      this.render();
    }
  }

  updateUnitButtons() {
    const isMetric = this.state.unit === 'metric';
    this.elements.btnCelsius.classList.toggle('active', isMetric);
    this.elements.btnCelsius.setAttribute('aria-pressed', isMetric);
    this.elements.btnFahrenheit.classList.toggle('active', !isMetric);
    this.elements.btnFahrenheit.setAttribute('aria-pressed', !isMetric);
    this.elements.heroTempUnit.textContent = isMetric ? '°C' : '°F';
    this.elements.unitWind.textContent = isMetric ? 'km/h' : 'mph';
    this.elements.unitPrecip.textContent = isMetric ? 'mm' : 'in';
  }

  // Unit conversion helpers
  cToF(val) {
    return Math.round((val * 9) / 5 + 32);
  }

  formatTemp(celsius) {
    if (celsius === undefined || celsius === null || isNaN(celsius)) return '--';
    const val = this.state.unit === 'imperial' ? this.cToF(celsius) : Math.round(celsius);
    return `${val}`;
  }

  formatSpeed(kmh) {
    if (kmh === undefined || kmh === null || isNaN(kmh)) return '--';
    if (this.state.unit === 'imperial') {
      return Math.round(kmh * 0.621371);
    }
    return Math.round(kmh);
  }

  formatPrecip(mm) {
    if (mm === undefined || mm === null || isNaN(mm)) return '0.0';
    if (this.state.unit === 'imperial') {
      return (mm * 0.0393701).toFixed(2);
    }
    return (Math.round(mm * 10) / 10).toFixed(1);
  }

  // --- Favorites Management ---

  handleToggleFavorite() {
    const res = toggleFavorite(this.state.location);
    this.updateFavoriteButtonState();
    this.renderFavoritesBar();
    this.showToast(res.added ? `Added ${this.state.location.name} to favorites` : `Removed ${this.state.location.name} from favorites`);
  }

  updateFavoriteButtonState() {
    const favorited = isFavorite(this.state.location);
    this.elements.btnToggleFavorite.classList.toggle('favorited', favorited);
    this.elements.btnToggleFavorite.setAttribute('aria-label', favorited ? 'Remove from favorites' : 'Add to favorites');
    this.elements.btnToggleFavorite.querySelector('svg').setAttribute('fill', favorited ? '#fbbf24' : 'none');
  }

  renderFavoritesBar() {
    const list = getFavorites();
    const bar = this.elements.favoritesBar;

    // keep label
    bar.innerHTML = '<span class="fav-label">Saved:</span>';

    list.forEach(item => {
      const chip = document.createElement('button');
      chip.className = 'fav-chip';
      const isCurrent = this.state.location && (
        (item.id && this.state.location.id && item.id === this.state.location.id) ||
        (Math.abs(item.latitude - this.state.location.latitude) < 0.05 && Math.abs(item.longitude - this.state.location.longitude) < 0.05)
      );
      if (isCurrent) chip.classList.add('active');

      chip.innerHTML = `<span>${this.escapeHtml(item.name)}</span>`;
      chip.addEventListener('click', () => {
        this.loadLocation(item);
      });

      bar.appendChild(chip);
    });
  }

  // --- Render Orchestration ---

  render() {
    if (!this.state.weatherData) return;
    const { current, hourly, daily } = this.state.weatherData;

    // Current weather info
    const info = getWeatherInfo(current.weather_code, current.is_day);

    // Apply Atmospheric Theme & Particle Animation
    this.applyAtmosphereTheme(info.category, current.is_day);

    // Update Hero Card
    this.renderHeroSection(current, daily, info);

    // Update Advice Banner
    this.renderAdviceBanner(current, daily, info);

    // Update Hourly Forecast & Interactive Chart
    this.renderHourlySection(hourly);

    // Update 7-Day Extended Forecast
    this.renderDailySection(daily);

    // Update Atmospheric Metric Cards
    this.renderMetrics(current, daily);

    // Update Favorite Button
    this.updateFavoriteButtonState();
  }

  applyAtmosphereTheme(category, isDay) {
    const body = document.body;
    body.className = ''; // clear previous classes

    let themeClass = 'theme-clear-day';
    if (!isDay) {
      themeClass = 'theme-clear-night';
    } else {
      switch (category) {
        case 'clear':
          themeClass = 'theme-clear-day';
          break;
        case 'partly-cloudy':
          themeClass = 'theme-partly-cloudy';
          break;
        case 'cloudy':
        case 'fog':
          themeClass = 'theme-cloudy';
          break;
        case 'rain':
          themeClass = 'theme-rain';
          break;
        case 'thunderstorm':
          themeClass = 'theme-thunderstorm';
          break;
        case 'snow':
          themeClass = 'theme-snow';
          break;
        default:
          themeClass = 'theme-clear-day';
      }
    }

    body.classList.add(themeClass);

    if (this.atmosphere) {
      this.atmosphere.setWeatherState(category, Boolean(isDay));
    }
  }

  renderHeroSection(current, daily, info) {
    const loc = this.state.location;
    const countryLabel = loc.countryCode ? `, ${loc.countryCode}` : (loc.country ? `, ${loc.country}` : '');
    this.elements.currentCityName.textContent = `${loc.name}${countryLabel}`;

    // Format local time
    const tz = this.state.weatherData.timezone || loc.timezone || 'UTC';
    try {
      const now = new Date();
      const timeStr = new Intl.DateTimeFormat('en-US', {
        timeZone: tz === 'auto' ? undefined : tz,
        weekday: 'long',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      }).format(now);
      this.elements.currentLocalTime.textContent = timeStr;
    } catch (e) {
      this.elements.currentLocalTime.textContent = new Date().toLocaleString();
    }

    this.elements.dataSourceText.textContent = this.state.isMockData ? 'Demo Atmospheric Feed' : 'Live Open-Meteo Feed';

    this.elements.currentTemp.textContent = this.formatTemp(current.temperature_2m);
    this.elements.feelsLikeTemp.textContent = `Feels like ${this.formatTemp(current.apparent_temperature)}°`;

    const high = daily.temperature_2m_max[0];
    const low = daily.temperature_2m_min[0];
    this.elements.todayHigh.textContent = `H: ${this.formatTemp(high)}°`;
    this.elements.todayLow.textContent = `L: ${this.formatTemp(low)}°`;

    this.elements.conditionName.textContent = info.label;
    this.elements.conditionCategory.textContent = info.category.replace('-', ' ');

    this.elements.heroConditionIcon.innerHTML = getWeatherIconSvg(info.icon, 80);
  }

  renderAdviceBanner(current, daily, info) {
    let icon = '✨';
    let text = 'Great atmospheric conditions today. Enjoy your day outdoors!';

    const popMax = daily.precipitation_probability_max ? daily.precipitation_probability_max[0] : 0;
    const uvMax = daily.uv_index_max ? daily.uv_index_max[0] : 0;
    const windKmh = current.wind_speed_10m;

    if (info.category === 'thunderstorm') {
      icon = '⚡';
      text = 'Thunderstorms detected in the region. Stay indoors and avoid open fields.';
    } else if (info.category === 'rain' || popMax >= 60) {
      icon = '☔';
      text = `High probability of precipitation (${popMax}%). Remember to grab an umbrella or raincoat!`;
    } else if (info.category === 'snow') {
      icon = '❄️';
      text = 'Snowy conditions observed. Keep warm and beware of icy roads.';
    } else if (uvMax >= 7) {
      icon = '☀️';
      text = `High UV exposure expected today (UV ${Math.round(uvMax)}). Wear SPF 30+ sunscreen and UV protection glasses.`;
    } else if (windKmh >= 35) {
      icon = '💨';
      text = `Breezy conditions with winds around ${this.formatSpeed(windKmh)} ${this.elements.unitWind.textContent}. Secure loose light outdoor items.`;
    } else if (current.temperature_2m <= 5) {
      icon = '🧣';
      text = 'Chilly temperatures today. Layer up before heading outside.';
    } else if (current.temperature_2m >= 32) {
      icon = '🥤';
      text = 'Hot weather ahead. Stay hydrated and avoid strenuous midday outdoor activity.';
    }

    this.elements.adviceIcon.textContent = icon;
    this.elements.adviceText.textContent = text;
  }

  renderHourlySection(hourly) {
    if (!hourly || !hourly.time) return;

    // 1. Render Interactive SVG Trend Chart
    renderHourlyChart(this.elements.hourlyChartContainer, hourly, this.state.unit);

    // 2. Render Scrollable Hourly Cards (24 hours)
    const container = this.elements.hourlyScrollContainer;
    container.innerHTML = '';

    const count = Math.min(24, hourly.time.length);
    for (let i = 0; i < count; i++) {
      const timeStr = hourly.time[i];
      const d = new Date(timeStr);
      const isDay = hourly.is_day ? hourly.is_day[i] : 1;
      const code = hourly.weather_code[i];
      const info = getWeatherInfo(code, isDay);
      const temp = hourly.temperature_2m[i];
      const pop = hourly.precipitation_probability ? hourly.precipitation_probability[i] : 0;

      const hourCard = document.createElement('div');
      hourCard.className = `hour-card ${i === 0 ? 'active-now' : ''}`;

      const h = d.getHours();
      const timeLabel = i === 0 ? 'Now' : (h === 0 ? '12 AM' : h === 12 ? '12 PM' : h > 12 ? `${h - 12} PM` : `${h} AM`);

      hourCard.innerHTML = `
        <span class="hour-time">${timeLabel}</span>
        <div class="hour-icon">${getWeatherIconSvg(info.icon, 30)}</div>
        <span class="hour-temp">${this.formatTemp(temp)}°</span>
        <span class="hour-pop">${pop > 10 ? `💧${pop}%` : '&nbsp;'}</span>
      `;

      container.appendChild(hourCard);
    }
  }

  renderDailySection(daily) {
    if (!daily || !daily.time) return;

    const list = this.elements.dailyForecastList;
    list.innerHTML = '';

    const daysCount = Math.min(7, daily.time.length);

    // Global min/max across all 7 days to size relative temperature bar
    const allMin = Math.min(...daily.temperature_2m_min);
    const allMax = Math.max(...daily.temperature_2m_max);
    const globalSpread = Math.max(1, allMax - allMin);

    const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    for (let i = 0; i < daysCount; i++) {
      const dateStr = daily.time[i];
      const d = new Date(dateStr + 'T00:00:00');
      const dayName = i === 0 ? 'Today' : (i === 1 ? 'Tomorrow' : weekdays[d.getDay()]);
      const dateFormatted = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

      const code = daily.weather_code[i];
      const info = getWeatherInfo(code, 1);
      const min = daily.temperature_2m_min[i];
      const max = daily.temperature_2m_max[i];
      const pop = daily.precipitation_probability_max ? daily.precipitation_probability_max[i] : 0;

      // Bar percentages
      const leftPct = ((min - allMin) / globalSpread) * 100;
      const widthPct = Math.max(8, ((max - min) / globalSpread) * 100);

      const row = document.createElement('div');
      row.className = 'daily-row';

      row.innerHTML = `
        <div class="daily-name-group">
          <span class="daily-day">${dayName}</span>
          <span class="daily-date">${dateFormatted}</span>
        </div>

        <div class="daily-icon-box">
          ${getWeatherIconSvg(info.icon, 34)}
        </div>

        <div class="daily-condition-text">
          <span>${info.label}</span>
          ${pop >= 25 ? `<span class="daily-pop-pill">💧 ${pop}%</span>` : ''}
        </div>

        <div class="daily-temp-bar-container">
          <span class="daily-min-text">${this.formatTemp(min)}°</span>
          <div class="daily-range-bar-track">
            <div class="daily-range-bar-fill" style="left: ${leftPct.toFixed(1)}%; width: ${widthPct.toFixed(1)}%;"></div>
          </div>
          <span class="daily-max-text">${this.formatTemp(max)}°</span>
        </div>
      `;

      list.appendChild(row);
    }
  }

  renderMetrics(current, daily) {
    // 1. UV Index
    const uv = daily.uv_index_max && daily.uv_index_max[0] !== undefined ? daily.uv_index_max[0] : 0;
    this.elements.valUv.textContent = uv.toFixed(1);
    const uvPct = Math.min(100, Math.max(0, (uv / 11) * 100));
    this.elements.uvNeedle.style.left = `${uvPct}%`;

    let uvText = 'Low exposure risk';
    if (uv >= 8) uvText = 'Very High - Take precautions';
    else if (uv >= 6) uvText = 'High - Sun protection required';
    else if (uv >= 3) uvText = 'Moderate exposure';
    this.elements.uvRiskText.textContent = uvText;

    // 2. Wind & Direction
    const windSpeed = current.wind_speed_10m;
    const windDir = current.wind_direction_10m || 0;
    const windGusts = current.wind_gusts_10m || windSpeed * 1.3;

    this.elements.valWindSpeed.textContent = this.formatSpeed(windSpeed);
    this.elements.windCompassArrow.style.transform = `rotate(${windDir}deg)`;
    this.elements.valWindDir.textContent = `${this.degToCompass(windDir)} (${Math.round(windDir)}°)`;
    this.elements.valWindGusts.textContent = `Gusts up to ${this.formatSpeed(windGusts)} ${this.elements.unitWind.textContent}`;

    // 3. Solar Daylight Cycle
    if (daily.sunrise && daily.sunrise[0] && daily.sunset && daily.sunset[0]) {
      const sunriseDate = new Date(daily.sunrise[0]);
      const sunsetDate = new Date(daily.sunset[0]);

      const timeFormat = (d) => d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
      this.elements.valSunrise.textContent = timeFormat(sunriseDate);
      this.elements.valSunset.textContent = timeFormat(sunsetDate);

      const now = new Date();
      const totalDaylightMs = sunsetDate.getTime() - sunriseDate.getTime();
      const elapsedMs = now.getTime() - sunriseDate.getTime();
      let pct = (elapsedMs / totalDaylightMs) * 100;
      pct = Math.max(0, Math.min(100, pct));
      this.elements.sunArcFill.style.width = `${pct}%`;

      if (now < sunriseDate) {
        this.elements.valDaylightLeft.textContent = 'Dawn approaching';
      } else if (now > sunsetDate) {
        this.elements.valDaylightLeft.textContent = 'Nighttime';
      } else {
        const remainingHours = Math.round((sunsetDate.getTime() - now.getTime()) / (1000 * 60 * 60));
        this.elements.valDaylightLeft.textContent = `${remainingHours}h daylight remaining`;
      }
    }

    // 4. Humidity & Dew Point
    const humidity = current.relative_humidity_2m;
    this.elements.valHumidity.textContent = Math.round(humidity);

    // Approximate dew point: T - ((100 - RH) / 5)
    const dewPointC = current.temperature_2m - ((100 - humidity) / 5);
    this.elements.valDewPoint.textContent = `Dew point is ${this.formatTemp(dewPointC)}°`;

    // 5. Pressure & Visibility
    const pressure = current.pressure_msl || current.surface_pressure || 1013;
    this.elements.valPressure.textContent = Math.round(pressure);

    const visibilityM = (this.state.weatherData.hourly && this.state.weatherData.hourly.visibility) ? this.state.weatherData.hourly.visibility[0] : 10000;
    const visibilityKm = Math.round(visibilityM / 1000);
    if (this.state.unit === 'imperial') {
      const visibilityMiles = Math.round(visibilityKm * 0.621371);
      this.elements.valVisibility.textContent = `Visibility: ${visibilityMiles} mi`;
    } else {
      this.elements.valVisibility.textContent = `Visibility: ${visibilityKm} km`;
    }

    // 6. Precipitation & Cloud Cover
    const precipSum = daily.precipitation_sum && daily.precipitation_sum[0] !== undefined ? daily.precipitation_sum[0] : 0;
    this.elements.valPrecipSum.textContent = this.formatPrecip(precipSum);
    this.elements.valCloudCover.textContent = `Cloud cover: ${Math.round(current.cloud_cover || 0)}%`;
  }

  degToCompass(num) {
    const val = Math.floor((num / 22.5) + 0.5);
    const arr = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    return arr[(val % 16)];
  }

  // --- Utility Methods ---

  setLoading(isLoading) {
    this.state.isLoading = isLoading;
    this.elements.loadingOverlay.classList.toggle('active', isLoading);
    this.elements.loadingOverlay.setAttribute('aria-hidden', !isLoading);
  }

  showToast(message, duration = 3200) {
    this.elements.toastMessage.textContent = message;
    this.elements.toast.classList.add('show');
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => {
      this.elements.toast.classList.remove('show');
    }, duration);
  }

  escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}

// Bootstrap SkyPulse on DOMContentLoaded
window.addEventListener('DOMContentLoaded', () => {
  new SkyPulseApp();
});
