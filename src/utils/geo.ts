import { LatLng } from '../types';

const EARTH_RADIUS_M = 6_371_000;
const toRad = (deg: number) => (deg * Math.PI) / 180;

/** Great-circle distance in metres. */
export function haversine(a: LatLng, b: LatLng): number {
  const dLat = toRad(b.latitude - a.latitude);
  const dLng = toRad(b.longitude - a.longitude);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.latitude)) * Math.cos(toRad(b.latitude)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_M * Math.asin(Math.sqrt(h));
}

/** Cumulative distance (m) at each vertex of a polyline. */
export function cumulativeDistances(line: LatLng[]): number[] {
  const out = [0];
  for (let i = 1; i < line.length; i++) out.push(out[i - 1] + haversine(line[i - 1], line[i]));
  return out;
}

/** Point located `meters` along a polyline (linear interpolation between vertices). */
export function pointAlong(line: LatLng[], cumulative: number[], meters: number): LatLng {
  if (line.length === 0) return { latitude: 0, longitude: 0 };
  if (meters <= 0) return line[0];
  const total = cumulative[cumulative.length - 1];
  if (meters >= total) return line[line.length - 1];
  let i = 1;
  while (cumulative[i] < meters) i++;
  const segment = cumulative[i] - cumulative[i - 1] || 1;
  const t = (meters - cumulative[i - 1]) / segment;
  return {
    latitude: line[i - 1].latitude + (line[i].latitude - line[i - 1].latitude) * t,
    longitude: line[i - 1].longitude + (line[i].longitude - line[i - 1].longitude) * t,
  };
}

const COMPASS = ['north', 'northeast', 'east', 'southeast', 'south', 'southwest', 'west', 'northwest'];

export function bearingToCompass(bearing: number): string {
  return COMPASS[Math.round((((bearing % 360) + 360) % 360) / 45) % 8];
}
