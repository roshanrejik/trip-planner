import { LatLng, Place } from '../types';

/** Mock saved & recent places (Doha, Qatar) — mirrors the list shown in the Figma design. */
export const SUGGESTED_PLACES: Place[] = [
  {
    id: 'home',
    name: 'Home',
    address: 'Villa 12, Street 840, Zone 61 · West Bay',
    kind: 'saved',
    coords: { latitude: 25.3262, longitude: 51.5153 },
  },
  {
    id: 'office',
    name: 'Marina Office Tower',
    address: 'Level 14, Al Fardan Rd · Lusail Marina',
    kind: 'saved',
    coords: { latitude: 25.3813, longitude: 51.5491 },
  },
  {
    id: 'ferry',
    name: 'Corniche Ferry Terminal',
    address: 'Gate 3, Corniche Promenade',
    kind: 'recent',
    coords: { latitude: 25.2961, longitude: 51.5402 },
  },
  {
    id: 'msheireb',
    name: 'Msheireb Metro Station',
    address: 'Al Kinana St · Msheireb Downtown',
    kind: 'recent',
    coords: { latitude: 25.2866, longitude: 51.5265 },
  },
  {
    id: 'airport',
    name: 'Hamad International Airport',
    address: 'Departures · Terminal 1',
    kind: 'recent',
    coords: { latitude: 25.2609, longitude: 51.6138 },
  },
  {
    id: 'katara',
    name: 'Katara Cultural Village',
    address: 'Building 12 · Katara',
    kind: 'recent',
    coords: { latitude: 25.3602, longitude: 51.5254 },
  },
  {
    id: 'pearl',
    name: 'The Pearl-Qatar',
    address: 'Porto Arabia · Medina Centrale',
    kind: 'recent',
    coords: { latitude: 25.3711, longitude: 51.5508 },
  },
];

/** Default map centre (West Bay, Doha). */
export const DEFAULT_REGION: LatLng = { latitude: 25.3239, longitude: 51.5310 };

/** Case-insensitive search across name and address. */
export function searchPlaces(query: string, places: Place[] = SUGGESTED_PLACES): Place[] {
  const q = query.trim().toLowerCase();
  if (!q) return places;
  return places.filter(
    (p) => p.name.toLowerCase().includes(q) || p.address.toLowerCase().includes(q),
  );
}

/** Short label used on the route screen: "Home · Villa 12, Street 840". */
export function shortLabel(place: Place): string {
  const firstAddressPart = place.address.split(/[·]/)[0].split(',').slice(0, 2).join(',').trim();
  return firstAddressPart ? `${place.name} · ${firstAddressPart}` : place.name;
}
