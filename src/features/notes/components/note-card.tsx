import { StyleSheet, View } from 'react-native';

import { Icon } from '@/components/ui/icon';
import { PressableScale } from '@/components/ui/pressable-scale';
import { Text } from '@/components/ui/text';
import { Radius, Spacing, type AccentName } from '@/constants/theme';
import { usePreferences, useT } from '@/features/settings/store';
import { formatDayMonth } from '@/lib/date';
import { useAccents, useNoteColor, useTheme } from '@/hooks/use-theme';
import type { Note } from '@/types';

/**
 * Which accent a note's tick marks take, so a checklist's ticks belong to the
 * card they sit on rather than all being the same blue.
 */
const CHECK_TONES: Record<string, AccentName> = {
  default: 'blue',
  coral: 'red',
  sand: 'amber',
  mint: 'green',
  sky: 'blue',
  lavender: 'purple',
  blush: 'pink',
  slate: 'grey',
};

/** Enough to hint at the content without turning the grid into a wall of text. */
const PREVIEW_ITEMS = 5;
const PREVIEW_LINES = 6;

export interface NoteCardProps {
  note: Note;
  onPress: () => void;
}

export function NoteCard({ note, onPress }: NoteCardProps) {
  const theme = useTheme();
  const t = useT();
  const { preferences } = usePreferences();
  const background = useNoteColor(note.color);
  const accents = useAccents();
  const check = accents[CHECK_TONES[note.color] ?? 'blue'];

  const visibleItems = note.checklist.filter((item) => item.text.trim().length > 0);
  const doneCount = visibleItems.filter((item) => item.done).length;
  const hiddenItems = Math.max(visibleItems.length - PREVIEW_ITEMS, 0);

  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={note.title || note.body || t('notes.title')}
      onPress={onPress}
      scaleTo={0.97}
      style={[
        styles.card,
        {
          backgroundColor: background,
          // Default-coloured cards need an outline to separate from the canvas.
          borderColor: note.color === 'default' ? theme.border : 'transparent',
        },
      ]}>
      {note.pinned ? (
        <View style={styles.pin}>
          <Icon name="pin" size={13} color="textSecondary" />
        </View>
      ) : null}

      {note.title.trim() ? (
        <Text variant="bodyStrong" numberOfLines={2} style={styles.title}>
          {note.title}
        </Text>
      ) : null}

      {note.type === 'checklist' ? (
        <View style={styles.checklist}>
          {visibleItems.slice(0, PREVIEW_ITEMS).map((item) => (
            <View key={item.id} style={styles.checkRow}>
              <View
                style={[
                  styles.check,
                  item.done
                    ? { backgroundColor: check.tint, borderColor: check.tint }
                    : { borderColor: theme.textTertiary },
                ]}>
                {item.done ? <Icon name="checkmark" size={11} tint={theme.textInverted} /> : null}
              </View>
              <Text
                variant="caption"
                color={item.done ? 'textTertiary' : 'text'}
                numberOfLines={1}
                style={[styles.checkText, item.done && styles.done]}>
                {item.text}
              </Text>
            </View>
          ))}

          {hiddenItems > 0 ? (
            <Text variant="caption" color="textTertiary">
              +{hiddenItems}
            </Text>
          ) : null}

          {visibleItems.length > 0 ? (
            <Text variant="caption" color="textTertiary" style={styles.counter}>
              {t('notes.checkedCount', { done: doneCount, total: visibleItems.length })}
            </Text>
          ) : null}
        </View>
      ) : note.body.trim() ? (
        <Text variant="caption" color="textSecondary" numberOfLines={PREVIEW_LINES}>
          {note.body}
        </Text>
      ) : null}

      <View style={styles.footer}>
        <View style={styles.labels}>
          {note.labels.slice(0, 3).map((label) => (
            <View
              key={label}
              style={[
                styles.label,
                { backgroundColor: theme.tintOverlay },
              ]}>
              <Text variant="caption" color="textSecondary" numberOfLines={1}>
                #{label}
              </Text>
            </View>
          ))}
        </View>

        <Text variant="caption" color="textTertiary" numberOfLines={1} style={styles.date}>
          {formatDayMonth(new Date(note.updatedAt), preferences.language)}
        </Text>
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  pin: { position: 'absolute', top: Spacing.sm, right: Spacing.sm },
  title: { paddingRight: Spacing.lg },
  checklist: { gap: Spacing.xs },
  checkRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  check: {
    width: 16,
    height: 16,
    borderRadius: 5,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkText: { flex: 1 },
  done: { textDecorationLine: 'line-through' },
  counter: { marginTop: 2 },
  footer: { flexDirection: 'row', alignItems: 'flex-end', gap: Spacing.sm, marginTop: 2 },
  // The labels take the slack and wrap; the date keeps its intrinsic width so
  // neither can squeeze the other down to an unreadable sliver.
  labels: { flex: 1, flexShrink: 1, flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs },
  date: { flexShrink: 0 },
  label: { maxWidth: '100%', paddingHorizontal: Spacing.sm, paddingVertical: 2, borderRadius: Radius.sm },
});
