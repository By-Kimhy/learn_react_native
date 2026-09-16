import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

/**
 * Bumping the version makes every persisted store re-read from disk. Used after
 * a data import or a "clear all data", where the on-disk truth changed behind
 * the stores' backs.
 */
interface DataVersionValue {
  version: number;
  reload: () => void;
}

const DataVersionContext = createContext<DataVersionValue>({ version: 0, reload: () => {} });

export function DataVersionProvider({ children }: { children: ReactNode }) {
  const [version, setVersion] = useState(0);
  const reload = useCallback(() => setVersion((current) => current + 1), []);
  const value = useMemo(() => ({ version, reload }), [version, reload]);

  return <DataVersionContext.Provider value={value}>{children}</DataVersionContext.Provider>;
}

export function useDataVersion() {
  return useContext(DataVersionContext);
}
