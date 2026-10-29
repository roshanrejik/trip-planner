import { useCallback, useEffect, useState } from 'react';
import { fetchRoute } from '../services/routing';
import { Place, Route } from '../types';

type State = { route: Route | null; loading: boolean };

/** Loads a route between two places and exposes a retry function. */
export function useRoute(from: Place | null, to: Place | null) {
  const [state, setState] = useState<State>({ route: null, loading: true });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!from || !to) return;
    let cancelled = false;
    setState((s) => ({ ...s, loading: true }));
    fetchRoute(from, to).then((route) => {
      if (!cancelled) setState({ route, loading: false });
    });
    return () => {
      cancelled = true; // ignore results if the screen unmounts or inputs change
    };
  }, [from, to, attempt]);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);
  return { ...state, retry };
}
