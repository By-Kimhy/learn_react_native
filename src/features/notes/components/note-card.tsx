import { StyleSheet, View } from 'react-native';

import { Icon } from '@/components/ui/icon';
import { PressableScale } from '@/components/ui/pressable-scale';
import { Text } from '@/components/ui/text';
import { Radius, Spacing } from '@/constants/theme';
import { useT } from '@/features/settings/store';
import { useColorScheme, useNoteColor, useTheme } from '@/hooks/use-theme';
import type { Note } from '@/types';

/** Enough to hint at the content without turning the grid into a wall of text. */
const PREVIEW_ITEMS = 5;
const PREVIEW_LINES = 6;

export interface NoteCardProps {
  note: Note;
  onPress: () => void;
}

export function NoteCard({ note, onPress }: NoteCardProps) {
  const theme = useTheme();
  const scheme = useColorScheme();
  const t = useT();
  const background = useNoteColor(note.color);

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
              <Icon
                name={item.done ? 'checkbox' : 'square-outline'}
                size={15}
                tint={item.done ? theme.textTertiary : theme.textSecondary}
              />
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

      {note.labels.length > 0 ? (
        <View style={styles.labels}>
          {note.labels.slice(0, 3).map((label) => (
            <View
              key={label}
              style={[
                styles.label,
                { backgroundColor: scheme === 'dark' ? 'rgba(255,255,255,0.09)' : 'rgba(0,0,0,0.06)' },
              ]}>
              <Text variant="caption" color="textSecondary" numberOfLines={1}>
                #{label}
              </Text>
            </View>
          ))}
        </View>
      ) : null}
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
  checkRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  checkText: { flex: 1 },
  done: { textDecorationLine: 'line-through' },
  counter: { marginTop: 2 },
  labels: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs },
  label: { paddingHorizontal: Spacing.sm, paddingVertical: 2, borderRadius: Radius.sm },
});
