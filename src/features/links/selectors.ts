import type { Link } from '@/types';

export interface LinkGroup {
  category: string;
  links: Link[];
}

/**
 * Groups links under their category heading, favourites hoisted into their own
 * group first — that mirrors how the spec's mock-up reads ("Work", "Study").
 */
export function groupLinks(links: Link[], favoritesLabel: string, otherLabel: string): LinkGroup[] {
  const favorites = links.filter((link) => link.favorite);
  const rest = links.filter((link) => !link.favorite);

  const byCategory = new Map<string, Link[]>();
  for (const link of rest) {
    const key = link.category.trim() || otherLabel;
    const bucket = byCategory.get(key);
    if (bucket) bucket.push(link);
    else byCategory.set(key, [link]);
  }

  const groups: LinkGroup[] = [...byCategory.entries()]
    .map(([category, items]) => ({ category, links: items }))
    // Uncategorised sinks to the bottom rather than sorting in as a normal name.
    .sort((a, b) => {
      if (a.category === otherLabel) return 1;
      if (b.category === otherLabel) return -1;
      return a.category.localeCompare(b.category);
    });

  return favorites.length > 0
    ? [{ category: favoritesLabel, links: favorites }, ...groups]
    : groups;
}

export function searchLinks(links: Link[], query: string): Link[] {
  const needle = query.trim().toLowerCase();
  if (!needle) return links;

  return links.filter((link) =>
    [link.title, link.url, link.category, link.note ?? ''].join(' ').toLowerCase().includes(needle)
  );
}

/** Adds a scheme when the user typed a bare host, so the URL actually opens. */
export function normaliseUrl(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return '';
  if (/^[a-z][a-z0-9+.-]*:/i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

export function isUrlLike(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed || /\s/.test(trimmed)) return false;
  if (/^[a-z][a-z0-9+.-]*:\/\//i.test(trimmed)) return true;
  // A bare domain such as "example.com" or "sub.example.co.uk".
  return /^[\w-]+(\.[\w-]+)+(\/\S*)?$/.test(trimmed);
}

/** Host only, for the subtitle under a link's title. */
export function displayHost(url: string): string {
  try {
    return new URL(normaliseUrl(url)).host.replace(/^www\./, '');
  } catch {
    return url;
  }
}
