import { createContext, useCallback, useContext, useMemo, type ReactNode } from 'react';

import { createId } from '@/lib/id';
import { StorageKeys } from '@/lib/storage';
import { usePersistedState } from '@/store/use-persisted-state';
import type { ChecklistItem, Note, NoteType } from '@/types';

/** Pinned notes float to the top; within a group, most recently edited first. */
function sortNotes(notes: Note[]): Note[] {
  return [...notes].sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    return a.updatedAt < b.updatedAt ? 1 : -1;
  });
}

function hydrateNotes(raw: unknown): Note[] {
  if (!Array.isArray(raw)) return [];

  const valid = raw
    .filter((item): item is Partial<Note> => typeof item === 'object' && item !== null)
    .filter((item) => typeof item.id === 'string')
    .map(
      (item): Note => ({
        id: item.id!,
        type: item.type === 'checklist' ? 'checklist' : 'text',
        title: item.title ?? '',
        body: item.body ?? '',
        checklist: Array.isArray(item.checklist) ? item.checklist : [],
        color: item.color ?? 'default',
        labels: Array.isArray(item.labels) ? item.labels : [],
        pinned: Boolean(item.pinned),
        archived: Boolean(item.archived),
        reminderAt: item.reminderAt,
        createdAt: item.createdAt ?? new Date().toISOString(),
        updatedAt: item.updatedAt ?? item.createdAt ?? new Date().toISOString(),
      })
    );

  return sortNotes(valid);
}

/** Module scope so the persisted-state load effect has a stable dependency. */
const NO_NOTES: Note[] = [];

export function createEmptyNote(type: NoteType = 'text'): Note {
  const now = new Date().toISOString();
  return {
    id: createId('note'),
    type,
    title: '',
    body: '',
    checklist: type === 'checklist' ? [createChecklistItem()] : [],
    color: 'default',
    labels: [],
    pinned: false,
    archived: false,
    createdAt: now,
    updatedAt: now,
  };
}

export function createChecklistItem(text = ''): ChecklistItem {
  return { id: createId('item'), text, done: false };
}

/** A note with no title, body and no filled checklist items is not worth saving. */
export function isNoteEmpty(note: Note): boolean {
  const hasTitle = note.title.trim().length > 0;
  const hasBody = note.body.trim().length > 0;
  const hasItems = note.checklist.some((item) => item.text.trim().length > 0);
  return !hasTitle && !hasBody && !hasItems;
}

export type NoteChanges = Partial<Omit<Note, 'id' | 'createdAt'>>;

interface NotesValue {
  notes: Note[];
  ready: boolean;
  activeNotes: Note[];
  archivedNotes: Note[];
  allLabels: string[];
  getNote: (id: string) => Note | undefined;
  saveNote: (note: Note) => void;
  updateNote: (id: string, changes: NoteChanges) => void;
  deleteNote: (id: string) => void;
  duplicateNote: (id: string, source?: Note) => Note | undefined;
}

const NotesContext = createContext<NotesValue | null>(null);

export function NotesProvider({ children }: { children: ReactNode }) {
  const [notes, setNotes, ready] = usePersistedState<Note[]>({
    key: StorageKeys.notes,
    initial: NO_NOTES,
    hydrate: hydrateNotes,
  });

  const getNote = useCallback((id: string) => notes.find((note) => note.id === id), [notes]);

  /** Upsert — the note editor works on a local draft and commits it on exit. */
  const saveNote = useCallback(
    (note: Note) => {
      setNotes((current) => {
        const stamped = { ...note, updatedAt: new Date().toISOString() };
        const exists = current.some((existing) => existing.id === note.id);
        const next = exists
          ? current.map((existing) => (existing.id === note.id ? stamped : existing))
          : [stamped, ...current];
        return sortNotes(next);
      });
    },
    [setNotes]
  );

  const updateNote = useCallback(
    (id: string, changes: NoteChanges) => {
      setNotes((current) =>
        sortNotes(
          current.map((note) =>
            note.id === id ? { ...note, ...changes, updatedAt: new Date().toISOString() } : note
          )
        )
      );
    },
    [setNotes]
  );

  const deleteNote = useCallback(
    (id: string) => setNotes((current) => current.filter((note) => note.id !== id)),
    [setNotes]
  );

  const duplicateNote = useCallback(
    (id: string, from?: Note) => {
      // Callers holding a live draft pass it in, so the copy matches the screen
      // rather than the last value committed to the store.
      const source = from ?? notes.find((note) => note.id === id);
      if (!source) return undefined;

      const now = new Date().toISOString();
      const copy: Note = {
        ...source,
        id: createId('note'),
        pinned: false,
        checklist: source.checklist.map((item) => ({ ...item, id: createId('item') })),
        createdAt: now,
        updatedAt: now,
      };

      setNotes((current) => sortNotes([copy, ...current]));
      return copy;
    },
    [notes, setNotes]
  );

  const activeNotes = useMemo(() => notes.filter((note) => !note.archived), [notes]);
  const archivedNotes = useMemo(() => notes.filter((note) => note.archived), [notes]);
  const allLabels = useMemo(
    () => [...new Set(notes.flatMap((note) => note.labels))].sort((a, b) => a.localeCompare(b)),
    [notes]
  );

  const value = useMemo(
    () => ({
      notes,
      ready,
      activeNotes,
      archivedNotes,
      allLabels,
      getNote,
      saveNote,
      updateNote,
      deleteNote,
      duplicateNote,
    }),
    [notes, ready, activeNotes, archivedNotes, allLabels, getNote, saveNote, updateNote, deleteNote, duplicateNote]
  );

  return <NotesContext.Provider value={value}>{children}</NotesContext.Provider>;
}

export function useNotes(): NotesValue {
  const value = useContext(NotesContext);
  if (!value) throw new Error('useNotes must be used inside <NotesProvider>');
  return value;
}

/** Searches title, body, checklist items and labels — everything the spec lists. */
export function searchNotes(notes: Note[], query: string): Note[] {
  const needle = query.trim().toLowerCase();
  if (!needle) return notes;

  return notes.filter((note) => {
    const haystack = [
      note.title,
      note.body,
      ...note.checklist.map((item) => item.text),
      ...note.labels,
    ]
      .join(' ')
      .toLowerCase();
    return haystack.includes(needle);
  });
}
