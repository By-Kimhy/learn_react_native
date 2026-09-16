import * as SecureStore from 'expo-secure-store';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { Platform } from 'react-native';

/**
 * The Claude API key lives in the device keychain (iOS) / keystore (Android),
 * never in AsyncStorage — it is the one secret this app holds, and it must not
 * end up in the plain-text export bundle alongside notes and transactions.
 *
 * SecureStore has no web implementation, so the web build simply has no AI.
 */

const KEY = 'lifehub.ai.apiKey';

const isSupported = Platform.OS !== 'web';

async function readKey(): Promise<string | null> {
  if (!isSupported) return null;
  try {
    return await SecureStore.getItemAsync(KEY);
  } catch (error) {
    console.warn('[ai] could not read the stored API key', error);
    return null;
  }
}

interface APIKeyValue {
  apiKey: string | null;
  /** False until the keychain read resolves, so the UI can avoid flicker. */
  ready: boolean;
  /** True when this platform can store a key at all. */
  supported: boolean;
  saveKey: (value: string) => Promise<boolean>;
  clearKey: () => Promise<void>;
}

const APIKeyContext = createContext<APIKeyValue | null>(null);

export function APIKeyProvider({ children }: { children: ReactNode }) {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [ready, setReady] = useState(!isSupported);

  useEffect(() => {
    let cancelled = false;
    readKey().then((value) => {
      if (cancelled) return;
      setApiKey(value);
      setReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const saveKey = useCallback(async (value: string) => {
    const trimmed = value.trim();
    if (!isSupported) return false;

    try {
      if (trimmed) await SecureStore.setItemAsync(KEY, trimmed);
      else await SecureStore.deleteItemAsync(KEY);
      setApiKey(trimmed || null);
      return true;
    } catch (error) {
      console.warn('[ai] could not store the API key', error);
      return false;
    }
  }, []);

  const clearKey = useCallback(async () => {
    if (!isSupported) return;
    try {
      await SecureStore.deleteItemAsync(KEY);
    } catch {
      // Nothing stored, or the keychain refused — either way there is no key now.
    }
    setApiKey(null);
  }, []);

  const value = useMemo(
    () => ({ apiKey, ready, supported: isSupported, saveKey, clearKey }),
    [apiKey, ready, saveKey, clearKey]
  );

  return <APIKeyContext.Provider value={value}>{children}</APIKeyContext.Provider>;
}

export function useAPIKey(): APIKeyValue {
  const value = useContext(APIKeyContext);
  if (!value) throw new Error('useAPIKey must be used inside <APIKeyProvider>');
  return value;
}

/** Masked for display: shows only enough to recognise which key is stored. */
export function maskKey(key: string): string {
  if (key.length <= 12) return '••••';
  return `${key.slice(0, 7)}…${key.slice(-4)}`;
}
