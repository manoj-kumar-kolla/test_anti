/**
 * SkyPulse Local Storage Management
 * Persists user preferences: unit system, favorites, last visited location, and history.
 */

const STORAGE_KEYS = {
  UNIT_SYSTEM: 'skypulse_unit_system',
  LAST_LOCATION: 'skypulse_last_location',
  FAVORITES: 'skypulse_favorites',
  RECENT_SEARCHES: 'skypulse_recent_searches'
};

const DEFAULT_FAVORITES = [
  { id: 'london', name: 'London', country: 'United Kingdom', countryCode: 'GB', latitude: 51.5074, longitude: -0.1278, timezone: 'Europe/London' },
  { id: 'newyork', name: 'New York', country: 'United States', countryCode: 'US', latitude: 40.7128, longitude: -74.0060, timezone: 'America/New_York' },
  { id: 'tokyo', name: 'Tokyo', country: 'Japan', countryCode: 'JP', latitude: 35.6762, longitude: 139.6503, timezone: 'Asia/Tokyo' },
  { id: 'paris', name: 'Paris', country: 'France', countryCode: 'FR', latitude: 48.8566, longitude: 2.3522, timezone: 'Europe/Paris' },
  { id: 'bengaluru', name: 'Bengaluru', country: 'India', countryCode: 'IN', latitude: 12.9716, longitude: 77.5946, timezone: 'Asia/Kolkata' }
];

export function getUnitSystem() {
  try {
    return localStorage.getItem(STORAGE_KEYS.UNIT_SYSTEM) || 'metric'; // 'metric' or 'imperial'
  } catch (e) {
    return 'metric';
  }
}

export function setUnitSystem(unit) {
  try {
    localStorage.setItem(STORAGE_KEYS.UNIT_SYSTEM, unit);
  } catch (e) {
    console.warn('Could not save unit system preference:', e);
  }
}

export function getLastLocation() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.LAST_LOCATION);
    return raw ? JSON.parse(raw) : DEFAULT_FAVORITES[0];
  } catch (e) {
    return DEFAULT_FAVORITES[0];
  }
}

export function setLastLocation(location) {
  try {
    localStorage.setItem(STORAGE_KEYS.LAST_LOCATION, JSON.stringify(location));
    addToRecentSearches(location);
  } catch (e) {
    console.warn('Could not save last location:', e);
  }
}

export function getFavorites() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.FAVORITES);
    if (!raw) return DEFAULT_FAVORITES;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_FAVORITES;
  } catch (e) {
    return DEFAULT_FAVORITES;
  }
}

export function isFavorite(location) {
  const list = getFavorites();
  return list.some(item => 
    (item.id && location.id && item.id === location.id) ||
    (Math.abs(item.latitude - location.latitude) < 0.05 && Math.abs(item.longitude - location.longitude) < 0.05)
  );
}

export function toggleFavorite(location) {
  let list = getFavorites();
  const existsIndex = list.findIndex(item => 
    (item.id && location.id && item.id === location.id) ||
    (Math.abs(item.latitude - location.latitude) < 0.05 && Math.abs(item.longitude - location.longitude) < 0.05)
  );

  let added = false;
  if (existsIndex >= 0) {
    list.splice(existsIndex, 1);
    added = false;
  } else {
    const favItem = {
      id: location.id || `${location.name.toLowerCase()}-${Date.now()}`,
      name: location.name,
      country: location.country || '',
      countryCode: location.countryCode || '',
      admin1: location.admin1 || '',
      latitude: location.latitude,
      longitude: location.longitude,
      timezone: location.timezone || 'auto'
    };
    list.push(favItem);
    added = true;
  }

  try {
    localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(list));
  } catch (e) {
    console.warn('Could not persist favorites:', e);
  }

  return { added, favorites: list };
}

export function getRecentSearches() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.RECENT_SEARCHES);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export function addToRecentSearches(location) {
  try {
    let recent = getRecentSearches();
    recent = recent.filter(r => 
      !(Math.abs(r.latitude - location.latitude) < 0.05 && Math.abs(r.longitude - location.longitude) < 0.05)
    );
    recent.unshift({
      name: location.name,
      country: location.country || '',
      countryCode: location.countryCode || '',
      latitude: location.latitude,
      longitude: location.longitude,
      timezone: location.timezone || 'auto'
    });
    // keep top 6
    if (recent.length > 6) recent = recent.slice(0, 6);
    localStorage.setItem(STORAGE_KEYS.RECENT_SEARCHES, JSON.stringify(recent));
  } catch (e) {
    console.warn('Could not update recent searches:', e);
  }
}
