/**
 * Collision-resistant enough for a local-first, single-device app. When a
 * backend arrives this is the one place that needs to change.
 */
export function createId(prefix = ''): string {
  const random = Math.random().toString(36).slice(2, 10);
  const time = Date.now().toString(36);
  return `${prefix}${prefix ? '_' : ''}${time}${random}`;
}
