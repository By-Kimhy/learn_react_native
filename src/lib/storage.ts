import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Thin typed wrapper over AsyncStorage. Every read is defensive: a corrupt or
 * half-written value must never stop the app from launching, so we fall back to
 * the caller's default and move on.
 */

const NAMESPACE = 'lifehub';

export const StorageKeys = {
  preferences: `${NAMESPACE}:preferences`,
  transactions: `${NAMESPACE}:transactions`,
  notes: `${NAMESPACE}:notes`,
  tasks: `${NAMESPACE}:tasks`,
  habits: `${NAMESPACE}:habits`,
  habitCompletions: `${NAMESPACE}:habit-completions`,
  events: `${NAMESPACE}:events`,
  links: `${NAMESPACE}:links`,
  qrCodes: `${NAMESPACE}:qr-codes`,
} as const;

export type StorageKey = (typeof StorageKeys)[keyof typeof StorageKeys];

export async function readJSON<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (raw == null) return fallback;
    return JSON.parse(raw) as T;
  } catch (error) {
    console.warn(`[storage] could not read "${key}"`, error);
    return fallback;
  }
}

export async function writeJSON(key: string, value: unknown): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn(`[storage] could not write "${key}"`, error);
    throw error;
  }
}

export async function clearAll(): Promise<void> {
  await AsyncStorage.multiRemove(Object.values(StorageKeys));
}

export interface ExportBundle {
  app: 'lifehub';
  version: 1;
  exportedAt: string;
  data: Record<string, unknown>;
}

export async function exportAll(): Promise<ExportBundle> {
  const entries = await AsyncStorage.multiGet(Object.values(StorageKeys));
  const data: Record<string, unknown> = {};

  for (const [key, raw] of entries) {
    if (raw == null) continue;
    try {
      data[key] = JSON.parse(raw);
    } catch {
      // Skip unreadable slices rather than failing the whole export.
    }
  }

  return { app: 'lifehub', version: 1, exportedAt: new Date().toISOString(), data };
}

export function isExportBundle(value: unknown): value is ExportBundle {
  if (typeof value !== 'object' || value === null) return false;
  const bundle = value as Partial<ExportBundle>;
  return bundle.app === 'lifehub' && typeof bundle.data === 'object' && bundle.data !== null;
}

export async function importAll(bundle: ExportBundle): Promise<void> {
  const known = new Set<string>(Object.values(StorageKeys));
  const pairs = Object.entries(bundle.data)
    .filter(([key]) => known.has(key))
    .map(([key, value]) => [key, JSON.stringify(value)] as [string, string]);

  if (pairs.length === 0) throw new Error('Backup contains no LifeHub data');
  await AsyncStorage.multiSet(pairs);
}
