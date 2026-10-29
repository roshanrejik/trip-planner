import { LatLng, Place, Route, RouteStep } from '../types';
import { bearingToCompass, haversine } from '../utils/geo';

/**
 * Route provider.
 *
 * Uses the free public OSRM demo server (no API key needed) to get a real road route,
 * and falls back to an offline estimate (straight line + mock steps) if the request
 * fails, times out, or there's no road connection. That way the app always works,
 * even without a network connection.
 */
const OSRM_URL = 'https://router.project-osrm.org/route/v1/driving';
const TIMEOUT_MS = 8000;

type OsrmManeuver = {
  type: string;
  modifier?: string;
  bearing_after?: number;
  exit?: number;
};
type OsrmStep = { distance: number; name: string; maneuver: OsrmManeuver };
type OsrmResponse = {
  code: string;
  routes: {
    distance: number;
    duration: number;
    geometry: { coordinates: [number, number][] };
    legs: { steps: OsrmStep[] }[];
  }[];
};

export async function fetchRoute(from: Place, to: Place): Promise<Route> {
  try {
    return await fetchOsrmRoute(from, to);
  } catch (e) {
    console.warn('[routing] falling back to estimate:', (e as Error).message);
    return estimateRoute(from, to);
  }
}

async function fetchOsrmRoute(from: Place, to: Place): Promise<Route> {
  const coords = `${from.coords.longitude},${from.coords.latitude};${to.coords.longitude},${to.coords.latitude}`;
  const url = `${OSRM_URL}/${coords}?overview=full&geometries=geojson&steps=true`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = (await res.json()) as OsrmResponse;
    if (json.code !== 'Ok' || !json.routes?.length) throw new Error(`OSRM ${json.code}`);

    const route = json.routes[0];
    const rawSteps = route.legs[0]?.steps ?? [];
    return {
      distanceMeters: route.distance,
      durationSeconds: route.duration,
      geometry: route.geometry.coordinates.map(([lng, lat]) => ({ latitude: lat, longitude: lng })),
      steps: buildSteps(rawSteps, to),
      trafficNote: trafficNoteFor(to),
      source: 'osrm',
    };
  } finally {
    clearTimeout(timer);
  }
}

/** Turn OSRM maneuvers into human-readable instructions with a "then…" hint. */
function buildSteps(raw: OsrmStep[], destination: Place): RouteStep[] {
  // Drop zero-length noise steps but always keep the final "arrive" step.
  const filtered = raw.filter((s, i) => s.distance > 5 || i === raw.length - 1);
  const steps: RouteStep[] = filtered.map((s) => ({
    instruction: describe(s, destination),
    detail: '',
    distanceMeters: s.distance,
    maneuver: toManeuver(s.maneuver),
  }));
  steps.forEach((step, i) => {
    const next = steps[i + 1];
    if (!next) step.detail = destination.address;
    else if (next.maneuver === 'arrive') step.detail = `${destination.name} will be ahead`;
    else step.detail = `Then ${next.instruction.charAt(0).toLowerCase()}${next.instruction.slice(1)}`;
  });
  return steps;
}

function describe({ name, maneuver }: OsrmStep, destination: Place): string {
  const road = name || 'the road';
  const dir = maneuver.modifier ?? 'straight';
  switch (maneuver.type) {
    case 'depart':
      return `Head ${bearingToCompass(maneuver.bearing_after ?? 0)} on ${road}`;
    case 'arrive':
      return `Arrive at ${destination.name}`;
    case 'roundabout':
    case 'rotary':
      return maneuver.exit
        ? `At the roundabout, take exit ${maneuver.exit} onto ${road}`
        : `Go through the roundabout onto ${road}`;
    case 'fork':
      return `Keep ${dir.replace('slight ', '')} at the fork onto ${road}`;
    case 'merge':
      return `Merge onto ${road}`;
    case 'on ramp':
      return `Take the ramp onto ${road}`;
    case 'off ramp':
      return `Take the exit onto ${road}`;
    case 'new name':
    case 'continue':
      return dir === 'straight' ? `Continue onto ${road}` : `Keep ${dir.replace('slight ', '')} onto ${road}`;
    default:
      if (dir === 'uturn') return `Make a U-turn on ${road}`;
      if (dir === 'straight') return `Continue straight onto ${road}`;
      return `Turn ${dir.replace('sharp ', '')} onto ${road}`;
  }
}

function toManeuver(m: OsrmManeuver): RouteStep['maneuver'] {
  if (m.type === 'arrive') return 'arrive';
  switch (m.modifier) {
    case 'left':
    case 'sharp left':
      return 'left';
    case 'right':
    case 'sharp right':
      return 'right';
    case 'slight left':
      return 'slight-left';
    case 'slight right':
      return 'slight-right';
    case 'uturn':
      return 'uturn';
    default:
      return 'straight';
  }
}

/** Mock traffic insight shown as a chip on the map. */
function trafficNoteFor(to: Place): string {
  const text = `${to.name} ${to.address}`.toLowerCase();
  if (text.includes('marina')) return 'Heavy traffic near the marina';
  if (text.includes('airport')) return 'Expect delays near the airport';
  if (text.includes('corniche')) return 'Moderate traffic on the Corniche';
  return 'Light traffic on your route';
}

/** Offline fallback: straight-line route with a road-distance factor and simple steps. */
export function estimateRoute(from: Place, to: Place): Route {
  const straight = haversine(from.coords, to.coords);
  const distance = straight * 1.3; // typical detour factor for urban roads
  const duration = distance / 8; // ~29 km/h average urban speed
  const geometry: LatLng[] = Array.from({ length: 21 }, (_, i) => ({
    latitude: from.coords.latitude + ((to.coords.latitude - from.coords.latitude) * i) / 20,
    longitude: from.coords.longitude + ((to.coords.longitude - from.coords.longitude) * i) / 20,
  }));
  const bearing =
    (Math.atan2(to.coords.longitude - from.coords.longitude, to.coords.latitude - from.coords.latitude) *
      180) /
    Math.PI;

  return {
    distanceMeters: distance,
    durationSeconds: duration,
    geometry,
    steps: [
      {
        instruction: `Head ${bearingToCompass(bearing)} from ${from.name}`,
        detail: 'Keep right past the service road',
        distanceMeters: distance * 0.05,
        maneuver: 'straight',
      },
      {
        instruction: 'Turn right onto the main road',
        detail: 'Moderate traffic near the roundabout',
        distanceMeters: distance * 0.6,
        maneuver: 'right',
      },
      {
        instruction: 'Keep left towards your destination',
        detail: `${to.name} will be ahead`,
        distanceMeters: distance * 0.35,
        maneuver: 'slight-left',
      },
      {
        instruction: `Arrive at ${to.name}`,
        detail: to.address,
        distanceMeters: 0,
        maneuver: 'arrive',
      },
    ],
    trafficNote: trafficNoteFor(to),
    source: 'estimate',
  };
}
