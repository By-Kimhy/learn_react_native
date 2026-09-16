import { createContext, useCallback, useContext, useMemo, type ReactNode } from 'react';

import { createId } from '@/lib/id';
import { StorageKeys } from '@/lib/storage';
import { usePersistedState } from '@/store/use-persisted-state';
import type { CalendarEvent } from '@/types';

/** Module scope so the persisted-state load effect has a stable dependency. */
const NO_EVENTS: CalendarEvent[] = [];

/** Chronological: by day, then by time, with all-day events first. */
function sortEvents(events: CalendarEvent[]): CalendarEvent[] {
  return [...events].sort((a, b) => {
    if (a.date !== b.date) return a.date < b.date ? -1 : 1;
    const aTime = a.time ?? '';
    const bTime = b.time ?? '';
    if (aTime !== bTime) return aTime < bTime ? -1 : 1;
    return a.createdAt < b.createdAt ? -1 : 1;
  });
}

function hydrateEvents(raw: unknown): CalendarEvent[] {
  if (!Array.isArray(raw)) return [];

  const valid = raw
    .filter((item): item is Partial<CalendarEvent> => typeof item === 'object' && item !== null)
    .filter((item) => typeof item.id === 'string' && typeof item.date === 'string')
    .map(
      (item): CalendarEvent => ({
        id: item.id!,
        title: item.title ?? '',
        date: item.date!,
        time: item.time,
        description: item.description,
        reminderMinutesBefore: item.reminderMinutesBefore,
        notificationId: item.notificationId,
        repeat: item.repeat ?? 'none',
        createdAt: item.createdAt ?? new Date().toISOString(),
        updatedAt: item.updatedAt ?? item.createdAt ?? new Date().toISOString(),
      })
    );

  return sortEvents(valid);
}

export type EventDraft = Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'>;
export type EventChanges = Partial<Omit<CalendarEvent, 'id' | 'createdAt'>>;

interface EventsValue {
  events: CalendarEvent[];
  ready: boolean;
  getEvent: (id: string) => CalendarEvent | undefined;
  addEvent: (draft: EventDraft) => CalendarEvent;
  updateEvent: (id: string, changes: EventChanges) => void;
  deleteEvent: (id: string) => void;
}

const EventsContext = createContext<EventsValue | null>(null);

export function EventsProvider({ children }: { children: ReactNode }) {
  const [events, setEvents, ready] = usePersistedState<CalendarEvent[]>({
    key: StorageKeys.events,
    initial: NO_EVENTS,
    hydrate: hydrateEvents,
  });

  const getEvent = useCallback((id: string) => events.find((event) => event.id === id), [events]);

  const addEvent = useCallback(
    (draft: EventDraft) => {
      const now = new Date().toISOString();
      const event: CalendarEvent = { ...draft, id: createId('evt'), createdAt: now, updatedAt: now };
      setEvents((current) => sortEvents([...current, event]));
      return event;
    },
    [setEvents]
  );

  const updateEvent = useCallback(
    (id: string, changes: EventChanges) => {
      setEvents((current) =>
        sortEvents(
          current.map((event) =>
            event.id === id ? { ...event, ...changes, updatedAt: new Date().toISOString() } : event
          )
        )
      );
    },
    [setEvents]
  );

  const deleteEvent = useCallback(
    (id: string) => setEvents((current) => current.filter((event) => event.id !== id)),
    [setEvents]
  );

  const value = useMemo(
    () => ({ events, ready, getEvent, addEvent, updateEvent, deleteEvent }),
    [events, ready, getEvent, addEvent, updateEvent, deleteEvent]
  );

  return <EventsContext.Provider value={value}>{children}</EventsContext.Provider>;
}

export function useEvents(): EventsValue {
  const value = useContext(EventsContext);
  if (!value) throw new Error('useEvents must be used inside <EventsProvider>');
  return value;
}
