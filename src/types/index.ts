export type LatLng = { latitude: number; longitude: number };

export type PlaceKind = 'saved' | 'recent' | 'current' | 'map' | 'custom';

export type Place = {
  id: string;
  name: string;
  address: string;
  kind: PlaceKind;
  coords: LatLng;
};

export type LocationField = 'pickup' | 'dropoff';

export type TravelMode = 'drive' | 'ride' | 'walk';

export type RouteStep = {
  instruction: string; // "Turn right onto Al Istiqlal St"
  detail: string; // secondary hint under the instruction
  distanceMeters: number;
  maneuver: 'straight' | 'left' | 'right' | 'slight-left' | 'slight-right' | 'uturn' | 'arrive';
};

export type Route = {
  distanceMeters: number;
  durationSeconds: number; // driving duration
  geometry: LatLng[];
  steps: RouteStep[];
  trafficNote: string;
  source: 'osrm' | 'estimate';
};
