import { createContext, useCallback, useContext, useMemo, type ReactNode } from 'react';

import { createId } from '@/lib/id';
import { StorageKeys } from '@/lib/storage';
import { usePersistedState } from '@/store/use-persisted-state';
import type { Link } from '@/types';

/** Module scope so the persisted-state load effect has a stable dependency. */
const NO_LINKS: Link[] = [];

/** Favourites first, then alphabetical — a link list is browsed, not scrolled by date. */
function sortLinks(links: Link[]): Link[] {
  return [...links].sort((a, b) => {
    if (a.favorite !== b.favorite) return a.favorite ? -1 : 1;
    return a.title.localeCompare(b.title);
  });
}

function hydrateLinks(raw: unknown): Link[] {
  if (!Array.isArray(raw)) return [];

  const valid = raw
    .filter((item): item is Partial<Link> => typeof item === 'object' && item !== null)
    .filter((item) => typeof item.id === 'string' && typeof item.url === 'string')
    .map(
      (item): Link => ({
        id: item.id!,
        title: item.title?.trim() || item.url!,
        url: item.url!,
        category: item.category ?? '',
        note: item.note,
        favorite: Boolean(item.favorite),
        createdAt: item.createdAt ?? new Date().toISOString(),
        updatedAt: item.updatedAt ?? item.createdAt ?? new Date().toISOString(),
      })
    );

  return sortLinks(valid);
}

export type LinkDraft = Omit<Link, 'id' | 'createdAt' | 'updatedAt'>;
export type LinkChanges = Partial<Omit<Link, 'id' | 'createdAt'>>;

interface LinksValue {
  links: Link[];
  ready: boolean;
  categories: string[];
  getLink: (id: string) => Link | undefined;
  addLink: (draft: LinkDraft) => Link;
  updateLink: (id: string, changes: LinkChanges) => void;
  deleteLink: (id: string) => void;
  toggleFavorite: (id: string) => void;
}

const LinksContext = createContext<LinksValue | null>(null);

export function LinksProvider({ children }: { children: ReactNode }) {
  const [links, setLinks, ready] = usePersistedState<Link[]>({
    key: StorageKeys.links,
    initial: NO_LINKS,
    hydrate: hydrateLinks,
  });

  const getLink = useCallback((id: string) => links.find((link) => link.id === id), [links]);

  const addLink = useCallback(
    (draft: LinkDraft) => {
      const now = new Date().toISOString();
      const link: Link = { ...draft, id: createId('link'), createdAt: now, updatedAt: now };
      setLinks((current) => sortLinks([...current, link]));
      return link;
    },
    [setLinks]
  );

  const updateLink = useCallback(
    (id: string, changes: LinkChanges) => {
      setLinks((current) =>
        sortLinks(
          current.map((link) =>
            link.id === id ? { ...link, ...changes, updatedAt: new Date().toISOString() } : link
          )
        )
      );
    },
    [setLinks]
  );

  const deleteLink = useCallback(
    (id: string) => setLinks((current) => current.filter((link) => link.id !== id)),
    [setLinks]
  );

  const toggleFavorite = useCallback(
    (id: string) => {
      setLinks((current) =>
        sortLinks(
          current.map((link) =>
            link.id === id
              ? { ...link, favorite: !link.favorite, updatedAt: new Date().toISOString() }
              : link
          )
        )
      );
    },
    [setLinks]
  );

  /** Distinct non-empty categories, for the group headings and the picker. */
  const categories = useMemo(
    () =>
      [...new Set(links.map((link) => link.category.trim()).filter(Boolean))].sort((a, b) =>
        a.localeCompare(b)
      ),
    [links]
  );

  const value = useMemo(
    () => ({ links, ready, categories, getLink, addLink, updateLink, deleteLink, toggleFavorite }),
    [links, ready, categories, getLink, addLink, updateLink, deleteLink, toggleFavorite]
  );

  return <LinksContext.Provider value={value}>{children}</LinksContext.Provider>;
}

export function useLinks(): LinksValue {
  const value = useContext(LinksContext);
  if (!value) throw new Error('useLinks must be used inside <LinksProvider>');
  return value;
}
