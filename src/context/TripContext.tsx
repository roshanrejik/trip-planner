import React, { createContext, ReactNode, useCallback, useContext, useMemo, useState } from 'react';
import { LocationField, Place, TravelMode } from '../types';

/**
 * Global trip state shared across screens:
 *  - the signed-in user (mock auth)
 *  - selected pickup / drop-off
 *  - preferred travel mode
 *
 * React Context is enough here — the state is small and only a few screens consume it,
 * so a library like Redux/Zustand would add complexity without real benefit.
 */
type TripState = {
  userEmail: string | null;
  pickup: Place | null;
  dropoff: Place | null;
  mode: TravelMode;
};

type TripContextValue = TripState & {
  signIn: (email: string) => void;
  signOut: () => void;
  setLocation: (field: LocationField, place: Place | null) => void;
  swapLocations: () => void;
  setMode: (mode: TravelMode) => void;
  resetTrip: () => void;
};

const initialState: TripState = { userEmail: null, pickup: null, dropoff: null, mode: 'drive' };

const TripContext = createContext<TripContextValue | undefined>(undefined);

export function TripProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<TripState>(initialState);

  const signIn = useCallback((email: string) => setState((s) => ({ ...s, userEmail: email })), []);
  const signOut = useCallback(() => setState(initialState), []);

  const setLocation = useCallback(
    (field: LocationField, place: Place | null) => setState((s) => ({ ...s, [field]: place })),
    [],
  );

  const swapLocations = useCallback(
    () => setState((s) => ({ ...s, pickup: s.dropoff, dropoff: s.pickup })),
    [],
  );

  const setMode = useCallback((mode: TravelMode) => setState((s) => ({ ...s, mode })), []);
  const resetTrip = useCallback(
    () => setState((s) => ({ ...s, pickup: null, dropoff: null, mode: 'drive' })),
    [],
  );

  const value = useMemo(
    () => ({ ...state, signIn, signOut, setLocation, swapLocations, setMode, resetTrip }),
    [state, signIn, signOut, setLocation, swapLocations, setMode, resetTrip],
  );

  return <TripContext.Provider value={value}>{children}</TripContext.Provider>;
}

export function useTrip(): TripContextValue {
  const ctx = useContext(TripContext);
  if (!ctx) throw new Error('useTrip must be used inside <TripProvider>');
  return ctx;
}
