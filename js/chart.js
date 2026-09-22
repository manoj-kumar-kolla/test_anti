/**
 * SkyPulse Hourly Temperature Trend SVG Chart
 * Renders a smooth, interactive SVG spline chart showing 24-hour temperature fluctuation
 * and precipitation probability.
 */

export function renderHourlyChart(containerEl, hourlyData, unit = 'metric') {
  if (!containerEl || !hourlyData || !hourlyData.time || hourlyData.time.length === 0) {
    return;
  }

  // Take the next 24 hours of data
  const count = Math.min(24, hourlyData.time.length);
  const times = hourlyData.time.slice(0, count);
  const temps = hourlyData.temperature_2m.slice(0, count);
  const pops = (hourlyData.precipitation_probability || []).slice(0, count);

  // SVG Dimensions & Padding
  const width = 800;
  const height = 180;
  const padding = { top: 25, right: 30, bottom: 40, left: 35 };
  const graphWidth = width - padding.left - padding.right;
  const graphHeight = height - padding.top - padding.bottom;

  // Min and Max temperatures with margin
  const rawMin = Math.min(...temps);
  const rawMax = Math.max(...temps);
  const tempSpread = Math.max(2, rawMax - rawMin);
  const minTemp = Math.floor(rawMin - 1);
  const maxTemp = Math.ceil(rawMax + 1.5);
  const range = maxTemp - minTemp;

  // Scale functions
  const getX = (index) => padding.left + (index / (count - 1)) * graphWidth;
  const getY = (val) => padding.top + graphHeight - ((val - minTemp) / range) * graphHeight;

  // Points array
  const points = temps.map((temp, i) => ({
    x: getX(i),
    y: getY(temp),
    temp: temp,
    pop: pops[i] || 0,
    time: times[i]
  }));

  // Build smooth bezier SVG path
  let pathD = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const current = points[i];
    const next = points[i + 1];
    const cpX1 = current.x + (next.x - current.x) * 0.45;
    const cpY1 = current.y;
    const cpX2 = current.x + (next.x - current.x) * 0.55;
    const cpY2 = next.y;
    pathD += ` C ${cpX1.toFixed(1)} ${cpY1.toFixed(1)}, ${cpX2.toFixed(1)} ${cpY2.toFixed(1)}, ${next.x.toFixed(1)} ${next.y.toFixed(1)}`;
  }

  // Area path closing at bottom
  const areaD = `${pathD} L ${points[points.length - 1].x} ${height - padding.bottom} L ${points[0].x} ${height - padding.bottom} Z`;

  // Format hour label
  const formatHour = (isoStr) => {
    const date = new Date(isoStr);
    const h = date.getHours();
    return h === 0 ? '12 AM' : h === 12 ? '12 PM' : h > 12 ? `${h - 12} PM` : `${h} AM`;
  };

  const tempSymbol = unit === 'imperial' ? '°F' : '°C';

  // Generate X-axis labels every 3 or 4 hours
  const labelInterval = count > 18 ? 3 : 2;
  const labelsSvg = points.filter((_, i) => i % labelInterval === 0 || i === points.length - 1)
    .map(p => {
      return `
        <text x="${p.x.toFixed(1)}" y="${height - 12}" text-anchor="middle" class="chart-axis-label">
          ${formatHour(p.time)}
        </text>
        <line x1="${p.x.toFixed(1)}" y1="${padding.top}" x2="${p.x.toFixed(1)}" y2="${height - padding.bottom}" class="chart-grid-line" stroke-dasharray="3,3" />
      `;
    }).join('');

  // Interactive dots & tooltips
  const dotsSvg = points.map((p, i) => {
    const isSpecial = i % labelInterval === 0 || i === 0 || i === points.length - 1;
    return `
      <g class="chart-point-group" data-index="${i}" data-time="${formatHour(p.time)}" data-temp="${p.temp}${tempSymbol}" data-pop="${p.pop}%">
        <circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="${isSpecial ? 4.5 : 3}" class="chart-point" />
        <circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="14" class="chart-hit-area" />
        <text x="${p.x.toFixed(1)}" y="${(p.y - 10).toFixed(1)}" text-anchor="middle" class="chart-temp-label ${isSpecial ? 'visible' : ''}">
          ${Math.round(p.temp)}°
        </text>
      </g>
    `;
  }).join('');

  const svg = `
    <svg viewBox="0 0 ${width} ${height}" preserveAspectRatio="none" class="weather-trend-svg" aria-label="24-hour temperature trend">
      <defs>
        <linearGradient id="tempAreaGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="var(--accent-primary, #38bdf8)" stop-opacity="0.45" />
          <stop offset="70%" stop-color="var(--accent-primary, #38bdf8)" stop-opacity="0.08" />
          <stop offset="100%" stop-color="var(--accent-primary, #38bdf8)" stop-opacity="0.0" />
        </linearGradient>
        <linearGradient id="tempLineGradient" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="#38bdf8" />
          <stop offset="50%" stop-color="#818cf8" />
          <stop offset="100%" stop-color="#f472b6" />
        </linearGradient>
      </defs>

      <!-- Grid lines & X labels -->
      ${labelsSvg}

      <!-- Baseline axis -->
      <line x1="${padding.left}" y1="${height - padding.bottom}" x2="${width - padding.right}" y2="${height - padding.bottom}" class="chart-base-line" />

      <!-- Area fill -->
      <path d="${areaD}" fill="url(#tempAreaGradient)" />

      <!-- Temperature Spline -->
      <path d="${pathD}" fill="none" stroke="url(#tempLineGradient)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="chart-curve-line" />

      <!-- Data points & values -->
      ${dotsSvg}
    </svg>
  `;

  containerEl.innerHTML = svg;

  // Add interactive hover listeners for custom floating tooltip
  const pointGroups = containerEl.querySelectorAll('.chart-point-group');
  pointGroups.forEach(group => {
    group.addEventListener('mouseenter', (e) => {
      const time = group.getAttribute('data-time');
      const temp = group.getAttribute('data-temp');
      const pop = group.getAttribute('data-pop');
      showChartTooltip(e, time, temp, pop, containerEl);
    });

    group.addEventListener('mouseleave', () => {
      hideChartTooltip(containerEl);
    });
  });
}

function showChartTooltip(e, time, temp, pop, containerEl) {
  let tooltip = containerEl.querySelector('.chart-interactive-tooltip');
  if (!tooltip) {
    tooltip = document.createElement('div');
    tooltip.className = 'chart-interactive-tooltip';
    containerEl.appendChild(tooltip);
  }

  tooltip.innerHTML = `
    <div class="tooltip-time">${time}</div>
    <div class="tooltip-temp">${temp}</div>
    <div class="tooltip-pop">💧 ${pop} rain</div>
  `;

  const rect = containerEl.getBoundingClientRect();
  const circle = e.currentTarget.querySelector('.chart-point');
  const circleRect = circle.getBoundingClientRect();

  const left = circleRect.left - rect.left;
  const top = circleRect.top - rect.top - 60;

  tooltip.style.left = `${left}px`;
  tooltip.style.top = `${top}px`;
  tooltip.classList.add('visible');
}

function hideChartTooltip(containerEl) {
  const tooltip = containerEl.querySelector('.chart-interactive-tooltip');
  if (tooltip) {
    tooltip.classList.remove('visible');
  }
}
