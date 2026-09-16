import { createContext, useCallback, useContext, useMemo, type ReactNode } from 'react';

import { createId } from '@/lib/id';
import { StorageKeys } from '@/lib/storage';
import { usePersistedState } from '@/store/use-persisted-state';
import type { QRCode, QRKind } from '@/types';

/** Module scope so the persisted-state load effect has a stable dependency. */
const NO_CODES: QRCode[] = [];

/** History is a convenience, not an archive — cap it so it can't grow forever. */
const HISTORY_LIMIT = 50;

function hydrateCodes(raw: unknown): QRCode[] {
  if (!Array.isArray(raw)) return [];

  return raw
    .filter((item): item is Partial<QRCode> => typeof item === 'object' && item !== null)
    .filter((item) => typeof item.id === 'string' && typeof item.value === 'string')
    .map(
      (item): QRCode => ({
        id: item.id!,
        value: item.value!,
        kind: item.kind === 'scanned' ? 'scanned' : 'generated',
        format: item.format,
        createdAt: item.createdAt ?? new Date().toISOString(),
        updatedAt: item.updatedAt ?? item.createdAt ?? new Date().toISOString(),
      })
    )
    .slice(0, HISTORY_LIMIT);
}

interface QRValue {
  codes: QRCode[];
  ready: boolean;
  /** Records a code, de-duplicating repeats of the same value and kind. */
  recordCode: (value: string, kind: QRKind, format?: string) => void;
  deleteCode: (id: string) => void;
  clearHistory: () => void;
}

const QRContext = createContext<QRValue | null>(null);

export function QRProvider({ children }: { children: ReactNode }) {
  const [codes, setCodes, ready] = usePersistedState<QRCode[]>({
    key: StorageKeys.qrCodes,
    initial: NO_CODES,
    hydrate: hydrateCodes,
  });

  const recordCode = useCallback(
    (value: string, kind: QRKind, format?: string) => {
      const trimmed = value.trim();
      if (!trimmed) return;

      setCodes((current) => {
        // Scanning the same code twice in a row should refresh it, not stack up.
        const rest = current.filter(
          (code) => !(code.value === trimmed && code.kind === kind)
        );
        const now = new Date().toISOString();
        const entry: QRCode = {
          id: createId('qr'),
          value: trimmed,
          kind,
          format,
          createdAt: now,
          updatedAt: now,
        };
        return [entry, ...rest].slice(0, HISTORY_LIMIT);
      });
    },
    [setCodes]
  );

  const deleteCode = useCallback(
    (id: string) => setCodes((current) => current.filter((code) => code.id !== id)),
    [setCodes]
  );

  const clearHistory = useCallback(() => setCodes(() => []), [setCodes]);

  const value = useMemo(
    () => ({ codes, ready, recordCode, deleteCode, clearHistory }),
    [codes, ready, recordCode, deleteCode, clearHistory]
  );

  return <QRContext.Provider value={value}>{children}</QRContext.Provider>;
}

export function useQRCodes(): QRValue {
  const value = useContext(QRContext);
  if (!value) throw new Error('useQRCodes must be used inside <QRProvider>');
  return value;
}
