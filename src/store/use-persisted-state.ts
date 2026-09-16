import { useEffect, useState } from 'react';

import { readJSON, writeJSON } from '@/lib/storage';

import { useDataVersion } from './data-version';

const MISSING = Symbol('missing');

export interface PersistedStateOptions<T> {
  /** AsyncStorage key. */
  key: string;
  /**
   * Value to use when nothing is stored yet. Must be referentially stable — it
   * is a dependency of the load effect — so define it at module scope.
   */
  initial: T;
  /**
   * Validates and upgrades whatever was on disk. Also must be stable; module
   * scope keeps it so.
   */
  hydrate?: (raw: unknown) => T;
}

/**
 * `useState` that hydrates from AsyncStorage and writes back on every change.
 *
 * Writes are fire-and-forget: the in-memory value is what the UI renders, so a
 * failed write logs and lets the user carry on rather than blocking them.
 */
export function usePersistedState<T>({
  key,
  initial,
  hydrate,
}: PersistedStateOptions<T>): [T, React.Dispatch<React.SetStateAction<T>>, boolean] {
  const [state, setState] = useState<T>(initial);
  const [ready, setReady] = useState(false);
  const { version } = useDataVersion();

  useEffect(() => {
    let cancelled = false;

    readJSON<unknown>(key, MISSING).then((raw) => {
      if (cancelled) return;

      if (raw === MISSING) {
        // Nothing stored: a first launch, or the data was just cleared. Falling
        // back to `initial` is what makes "Clear all data" actually stick —
        // keeping the old in-memory value would write it straight back.
        setState(initial);
      } else {
        setState(hydrate ? hydrate(raw) : (raw as T));
      }

      setReady(true);
    });

    return () => {
      cancelled = true;
    };
  }, [key, version, initial, hydrate]);

  useEffect(() => {
    if (!ready) return;
    writeJSON(key, state).catch(() => {
      // Already logged in the storage layer; nothing useful to do in the UI.
    });
  }, [key, state, ready]);

  return [state, setState, ready];
}
