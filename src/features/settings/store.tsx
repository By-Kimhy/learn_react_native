import { createContext, useCallback, useContext, useMemo, type ReactNode } from 'react';

import { createTranslator, type Translator } from '@/lib/i18n';
import { StorageKeys } from '@/lib/storage';
import { usePersistedState } from '@/store/use-persisted-state';
import type { UserPreferences } from '@/types';

export const DEFAULT_EXCHANGE_RATE = 4000;

export const defaultPreferences: UserPreferences = {
  displayCurrency: 'USD',
  exchangeRate: DEFAULT_EXCHANGE_RATE,
  appearance: 'system',
  language: 'en',
  timeFormat: '12h',
  notificationsEnabled: true,
};

/** Merges stored preferences over the defaults so new keys appear on upgrade. */
function hydratePreferences(raw: unknown): UserPreferences {
  if (typeof raw !== 'object' || raw === null) return defaultPreferences;
  const stored = raw as Partial<UserPreferences>;

  return {
    ...defaultPreferences,
    ...stored,
    exchangeRate:
      typeof stored.exchangeRate === 'number' && stored.exchangeRate > 0
        ? stored.exchangeRate
        : DEFAULT_EXCHANGE_RATE,
  };
}

interface PreferencesValue {
  preferences: UserPreferences;
  ready: boolean;
  updatePreferences: (changes: Partial<UserPreferences>) => void;
  t: Translator;
}

const PreferencesContext = createContext<PreferencesValue | null>(null);

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences, ready] = usePersistedState({
    key: StorageKeys.preferences,
    initial: defaultPreferences,
    hydrate: hydratePreferences,
  });

  const updatePreferences = useCallback(
    (changes: Partial<UserPreferences>) => {
      setPreferences((current) => ({ ...current, ...changes }));
    },
    [setPreferences]
  );

  const t = useMemo(() => createTranslator(preferences.language), [preferences.language]);

  const value = useMemo(
    () => ({ preferences, ready, updatePreferences, t }),
    [preferences, ready, updatePreferences, t]
  );

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
}

export function usePreferences(): PreferencesValue {
  const value = useContext(PreferencesContext);
  if (!value) throw new Error('usePreferences must be used inside <PreferencesProvider>');
  return value;
}

/** Shorthand for the common case of needing only the translator. */
export function useT(): Translator {
  return usePreferences().t;
}
