import * as Location from 'expo-location';
import { LatLng, Place } from '../types';

/**
 * Thin wrapper around expo-location so screens don't deal with permissions/geocoding details.
 * Each function throws a user-friendly Error message on failure.
 */
export async function getCurrentPlace(): Promise<Place> {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') {
    throw new Error('Location permission was denied. You can still pick a place from the list or the map.');
  }
  const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
  const coords = { latitude: position.coords.latitude, longitude: position.coords.longitude };
  return {
    id: `current-${Date.now()}`,
    name: 'Current location',
    address: await describeCoords(coords),
    kind: 'current',
    coords,
  };
}

/** Reverse geocode to a short address; falls back to formatted coordinates. */
export async function describeCoords(coords: LatLng): Promise<string> {
  try {
    const [result] = await Location.reverseGeocodeAsync(coords);
    if (result) {
      const parts = [result.name ?? result.street, result.district ?? result.city].filter(
        (p): p is string => !!p,
      );
      const unique = parts.filter((p, i) => parts.indexOf(p) === i);
      if (unique.length) return unique.join(' · ');
    }
  } catch {
    // Geocoder unavailable (e.g. no Google Play services) – fall through.
  }
  return `${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)}`;
}

/** Forward geocode a free-text address typed by the user. */
export async function geocodeAddress(query: string): Promise<Place> {
  let results: Location.LocationGeocodedLocation[] = [];
  try {
    results = await Location.geocodeAsync(query);
  } catch {
    // handled below
  }
  if (!results.length) {
    throw new Error(`We couldn't find "${query}". Try a different address or pick it on the map.`);
  }
  const coords = { latitude: results[0].latitude, longitude: results[0].longitude };
  return {
    id: `custom-${Date.now()}`,
    name: query.trim(),
    address: await describeCoords(coords),
    kind: 'custom',
    coords,
  };
}
