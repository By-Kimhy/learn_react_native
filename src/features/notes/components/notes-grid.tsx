import { StyleSheet, View } from 'react-native';

import { Spacing } from '@/constants/theme';
import type { Note } from '@/types';

import { NoteCard } from './note-card';

export interface NotesGridProps {
  notes: Note[];
  onSelect: (note: Note) => void;
}

/**
 * Rough card height in arbitrary units. Measuring the real cards would mean a
 * layout pass and a visible reflow; this estimate is close enough to keep the
 * two columns balanced, which is all the layout needs.
 */
function estimateHeight(note: Note): number {
  let units = 3; // padding and the card's own chrome

  if (note.title.trim()) units += Math.min(Math.ceil(note.title.length / 18), 2) * 2;

  if (note.type === 'checklist') {
    const items = note.checklist.filter((item) => item.text.trim());
    units += Math.min(items.length, 5) * 2;
    if (items.length > 0) units += 2; // the "n of m done" counter
  } else if (note.body.trim()) {
    const lines = note.body.split('\n').reduce(
      (total, line) => total + Math.max(Math.ceil(line.length / 24), 1),
      0
    );
    units += Math.min(lines, 6) * 1.5;
  }

  if (note.labels.length > 0) units += 2;

  return units;
}

/**
 * Two staggered columns, Keep style. Each note goes to whichever column is
 * currently shorter, so a tall checklist on the left doesn't leave the right
 * column half empty.
 */
export function NotesGrid({ notes, onSelect }: NotesGridProps) {
  const columns: Note[][] = [[], []];
  const heights = [0, 0];

  for (const note of notes) {
    const target = heights[0] <= heights[1] ? 0 : 1;
    columns[target].push(note);
    heights[target] += estimateHeight(note);
  }

  return (
    <View style={styles.grid}>
      {columns.map((column, index) => (
        <View key={index} style={styles.column}>
          {column.map((note) => (
            <NoteCard key={note.id} note={note} onPress={() => onSelect(note)} />
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', gap: Spacing.md, alignItems: 'flex-start' },
  column: { flex: 1, gap: Spacing.md },
});
