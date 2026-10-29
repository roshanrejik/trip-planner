import { TravelMode } from '../types';

export function formatDuration(seconds: number): string {
  const totalMin = Math.max(1, Math.round(seconds / 60));
  if (totalMin < 60) return `${totalMin} min`;
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return m ? `${h} h ${m} min` : `${h} h`;
}

export function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.max(10, Math.round(meters / 10) * 10)} m`;
  return `${(meters / 1000).toFixed(meters < 100_000 ? 1 : 0)} km`;
}

export function formatClock(date: Date): string {
  const h = date.getHours().toString().padStart(2, '0');
  const m = date.getMinutes().toString().padStart(2, '0');
  return `${h}:${m}`;
}

export function arrivalTime(durationSeconds: number, from: Date = new Date()): string {
  return formatClock(new Date(from.getTime() + durationSeconds * 1000));
}

/**
 * Travel time per mode. The routing service only gives us a driving duration,
 * so bike ("Ride") and walking times are derived from the route distance.
 */
const SPEED_MPS: Record<Exclude<TravelMode, 'drive'>, number> = {
  ride: 4.2, // ~15 km/h cycling
  walk: 1.35, // ~5 km/h walking
};

export function durationForMode(mode: TravelMode, driveSeconds: number, meters: number): number {
  if (mode === 'drive') return driveSeconds;
  return meters / SPEED_MPS[mode];
}
