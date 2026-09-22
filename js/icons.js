/**
 * SkyPulse Weather Icons Library
 * High-performance, animated SVG weather icons with vector styling.
 */

export function getWeatherIconSvg(iconName, size = 48) {
  const s = size;

  switch (iconName) {
    case 'sun':
      return `
        <svg width="${s}" height="${s}" viewBox="0 0 64 64" fill="none" class="weather-svg-icon icon-sun">
          <circle cx="32" cy="32" r="14" fill="#fbbf24" class="sun-core" />
          <g stroke="#f59e0b" stroke-width="3.5" stroke-linecap="round" class="sun-rays">
            <line x1="32" y1="6" x2="32" y2="12" />
            <line x1="32" y1="52" x2="32" y2="58" />
            <line x1="6" y1="32" x2="12" y2="32" />
            <line x1="52" y1="32" x2="58" y2="32" />
            <line x1="13.6" y1="13.6" x2="17.8" y2="17.8" />
            <line x1="46.2" y1="46.2" x2="50.4" y2="50.4" />
            <line x1="13.6" y1="50.4" x2="17.8" y2="46.2" />
            <line x1="46.2" y1="17.8" x2="50.4" y2="13.6" />
          </g>
        </svg>
      `;

    case 'moon':
      return `
        <svg width="${s}" height="${s}" viewBox="0 0 64 64" fill="none" class="weather-svg-icon icon-moon">
          <path d="M44 38C41 45 32 48 24 45C16 42 12 33 15 25C17 20 21 16 26 14C24 18 24 23 27 27C30 32 36 34 41 33C42 35 43 36 44 38Z" 
            fill="#e2e8f0" stroke="#94a3b8" stroke-width="2" class="moon-body" />
          <circle cx="48" cy="18" r="1.5" fill="#f8fafc" class="star star-1" />
          <circle cx="16" cy="16" r="1.5" fill="#f8fafc" class="star star-2" />
          <circle cx="44" cy="46" r="1.2" fill="#f8fafc" class="star star-3" />
        </svg>
      `;

    case 'sun-cloud':
    case 'cloud-sun':
      return `
        <svg width="${s}" height="${s}" viewBox="0 0 64 64" fill="none" class="weather-svg-icon icon-sun-cloud">
          <circle cx="40" cy="22" r="10" fill="#fbbf24" class="sun-behind" />
          <g stroke="#f59e0b" stroke-width="2.5" stroke-linecap="round" class="sun-behind-rays">
            <line x1="40" y1="6" x2="40" y2="9" />
            <line x1="54" y1="22" x2="57" y2="22" />
            <line x1="50" y1="12" x2="52" y2="10" />
            <line x1="50" y1="32" x2="52" y2="34" />
          </g>
          <path d="M22 46H42C46.4 46 50 42.4 50 38C50 33.6 46.4 30 42 30C41.5 30 41 30.1 40.5 30.2C39.2 24.4 34.1 20 28 20C21.4 20 16 25.4 16 32C16 32.7 16.1 33.3 16.2 34C13.8 35.1 12 37.4 12 40C12 43.3 14.7 46 18 46" 
            fill="#e2e8f0" stroke="#cbd5e1" stroke-width="2" class="cloud-front" />
        </svg>
      `;

    case 'moon-cloud':
      return `
        <svg width="${s}" height="${s}" viewBox="0 0 64 64" fill="none" class="weather-svg-icon icon-moon-cloud">
          <path d="M42 24C40 28 34 30 30 28C26 26 24 21 26 17C27 14 29 12 32 11C30 13 30 16 32 18C34 21 37 22 40 21C41 22 42 23 42 24Z" 
            fill="#cbd5e1" class="moon-behind" />
          <path d="M22 46H42C46.4 46 50 42.4 50 38C50 33.6 46.4 30 42 30C41.5 30 41 30.1 40.5 30.2C39.2 24.4 34.1 20 28 20C21.4 20 16 25.4 16 32C16 32.7 16.1 33.3 16.2 34C13.8 35.1 12 37.4 12 40C12 43.3 14.7 46 18 46" 
            fill="#64748b" stroke="#475569" stroke-width="2" class="cloud-front" />
        </svg>
      `;

    case 'cloud':
      return `
        <svg width="${s}" height="${s}" viewBox="0 0 64 64" fill="none" class="weather-svg-icon icon-cloud">
          <path d="M20 46H46C51.5 46 56 41.5 56 36C56 30.8 52 26.5 47 26.1C45.8 19.2 39.8 14 32.5 14C24.7 14 18.3 19.8 17.2 27.5C13.2 28.5 10 32.1 10 36.5C10 41.7 14.5 46 20 46Z" 
            fill="#94a3b8" stroke="#cbd5e1" stroke-width="2" class="cloud-main" />
        </svg>
      `;

    case 'rain-light':
    case 'drizzle':
      return `
        <svg width="${s}" height="${s}" viewBox="0 0 64 64" fill="none" class="weather-svg-icon icon-rain-light">
          <path d="M20 38H44C48.4 38 52 34.4 52 30C52 25.9 48.9 22.5 45 22.1C44 16.8 39.4 12.8 33.8 12.8C27.8 12.8 22.8 17.3 22 23.2C18.9 24 16.5 26.8 16.5 30.3C16.5 34.5 20 38 20 38Z" 
            fill="#64748b" class="cloud-rain" />
          <line x1="24" y1="44" x2="20" y2="54" stroke="#38bdf8" stroke-width="2.5" stroke-linecap="round" class="rain-streak r1" />
          <line x1="34" y1="44" x2="30" y2="54" stroke="#38bdf8" stroke-width="2.5" stroke-linecap="round" class="rain-streak r2" />
          <line x1="44" y1="44" x2="40" y2="54" stroke="#38bdf8" stroke-width="2.5" stroke-linecap="round" class="rain-streak r3" />
        </svg>
      `;

    case 'rain':
    case 'rain-heavy':
      return `
        <svg width="${s}" height="${s}" viewBox="0 0 64 64" fill="none" class="weather-svg-icon icon-rain-heavy">
          <path d="M18 36H46C51 36 55 32 55 27C55 22.3 51.6 18.5 47 18.1C45.8 12.5 40.8 8.5 34.5 8.5C28 8.5 22.5 13.2 21.6 19.5C18.2 20.4 15.5 23.5 15.5 27.5C15.5 32.2 18 36 18 36Z" 
            fill="#475569" class="cloud-dark" />
          <line x1="22" y1="42" x2="17" y2="56" stroke="#0ea5e9" stroke-width="3" stroke-linecap="round" class="rain-streak r1" />
          <line x1="32" y1="42" x2="27" y2="56" stroke="#0ea5e9" stroke-width="3" stroke-linecap="round" class="rain-streak r2" />
          <line x1="42" y1="42" x2="37" y2="56" stroke="#0ea5e9" stroke-width="3" stroke-linecap="round" class="rain-streak r3" />
          <line x1="28" y1="46" x2="23" y2="58" stroke="#38bdf8" stroke-width="2.5" stroke-linecap="round" class="rain-streak r4" />
        </svg>
      `;

    case 'thunderstorm':
    case 'thunderstorm-hail':
      return `
        <svg width="${s}" height="${s}" viewBox="0 0 64 64" fill="none" class="weather-svg-icon icon-thunderstorm">
          <path d="M18 34H46C51 34 55 30 55 25C55 20.3 51.6 16.5 47 16.1C45.8 10.5 40.8 6.5 34.5 6.5C28 6.5 22.5 11.2 21.6 17.5C18.2 18.4 15.5 21.5 15.5 25.5C15.5 30.2 18 34 18 34Z" 
            fill="#334155" class="cloud-storm" />
          <path d="M33 34L25 46H32L29 58L41 44H33L36 34H33Z" fill="#fbbf24" stroke="#f59e0b" stroke-width="1.5" class="lightning-bolt" />
        </svg>
      `;

    case 'snow':
    case 'snow-light':
    case 'snow-heavy':
    case 'sleet':
      return `
        <svg width="${s}" height="${s}" viewBox="0 0 64 64" fill="none" class="weather-svg-icon icon-snow">
          <path d="M18 34H46C51 34 55 30 55 25C55 20.3 51.6 16.5 47 16.1C45.8 10.5 40.8 6.5 34.5 6.5C28 6.5 22.5 11.2 21.6 17.5C18.2 18.4 15.5 21.5 15.5 25.5C15.5 30.2 18 34 18 34Z" 
            fill="#94a3b8" class="cloud-snow" />
          <!-- Snowflakes -->
          <circle cx="23" cy="46" r="2.5" fill="#e0f2fe" class="snowflake s1" />
          <circle cx="34" cy="52" r="3" fill="#e0f2fe" class="snowflake s2" />
          <circle cx="45" cy="45" r="2.5" fill="#e0f2fe" class="snowflake s3" />
        </svg>
      `;

    case 'fog':
      return `
        <svg width="${s}" height="${s}" viewBox="0 0 64 64" fill="none" class="weather-svg-icon icon-fog">
          <line x1="16" y1="26" x2="48" y2="26" stroke="#cbd5e1" stroke-width="3" stroke-linecap="round" class="fog-line f1" />
          <line x1="12" y1="34" x2="52" y2="34" stroke="#e2e8f0" stroke-width="3.5" stroke-linecap="round" class="fog-line f2" />
          <line x1="18" y1="42" x2="46" y2="42" stroke="#94a3b8" stroke-width="3" stroke-linecap="round" class="fog-line f3" />
          <line x1="22" y1="50" x2="42" y2="50" stroke="#cbd5e1" stroke-width="2.5" stroke-linecap="round" class="fog-line f4" />
        </svg>
      `;

    default:
      return `
        <svg width="${s}" height="${s}" viewBox="0 0 64 64" fill="none" class="weather-svg-icon">
          <circle cx="32" cy="32" r="16" fill="#38bdf8" />
        </svg>
      `;
  }
}
