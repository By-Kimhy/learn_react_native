import { StyleSheet, useWindowDimensions, View } from 'react-native';

import { IconTile } from '@/components/ui/icon-tile';
import { PressableScale } from '@/components/ui/pressable-scale';
import { Text } from '@/components/ui/text';
import { MaxContentWidth, Radius, Spacing } from '@/constants/theme';
import { useT } from '@/features/settings/store';
import { useAccents, useTheme } from '@/hooks/use-theme';
import type { TransactionType } from '@/types';

import { categoriesFor } from '../categories';
import { toneFor } from '../category-tones';

export interface CategoryPickerProps {
  type: TransactionType;
  value: string | null;
  onChange: (categoryId: string) => void;
  label: string;
  error?: string;
}

/** Screen padding the picker sits inside, mirroring <Screen>'s gutters. */
const HORIZONTAL_INSET = Spacing.lg * 2;
const GAP = Spacing.sm;
const IDEAL_TILE = 86;

/**
 * A tap-target grid rather than a dropdown: choosing a category is the slowest
 * step of logging an expense, and the spec asks for "a few taps" end to end.
 */
export function CategoryPicker({ type, value, onChange, label, error }: CategoryPickerProps) {
  const theme = useTheme();
  const accents = useAccents();
  const t = useT();
  const { width } = useWindowDimensions();
  const categories = categoriesFor(type);

  // Tiles are sized to fill the row exactly rather than left-aligned at a fixed
  // width, which would leave a ragged gutter on wider phones.
  const available = Math.min(width, MaxContentWidth) - HORIZONTAL_INSET;
  const columns = Math.max(3, Math.min(5, Math.floor((available + GAP) / (IDEAL_TILE + GAP))));
  const tileWidth = (available - GAP * (columns - 1)) / columns;

  return (
    <View style={styles.container}>
      <Text variant="overline" color="textTertiary">
        {label.toUpperCase()}
      </Text>

      <View style={styles.grid}>
        {categories.map((category) => {
          const selected = category.id === value;
          const tone = toneFor(category.id);
          const accent = accents[tone];

          return (
            <PressableScale
              key={category.id}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              accessibilityLabel={t(category.labelKey)}
              onPress={() => onChange(category.id)}
              scaleTo={0.94}
              style={[
                styles.tile,
                {
                  width: tileWidth,
                  backgroundColor: selected ? accent.soft : theme.surface,
                  borderColor: selected ? accent.tint : theme.border,
                },
              ]}>
              <IconTile emoji={category.emoji} tone={tone} size={40} shape="circle" />
              <Text
                variant="caption"
                tint={selected ? accent.tint : theme.textSecondary}
                numberOfLines={2}
                align="center">
                {t(category.labelKey)}
              </Text>
            </PressableScale>
          );
        })}
      </View>

      {error ? (
        <Text variant="caption" color="expense">
          {error}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: Spacing.sm },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: GAP },
  tile: {
    minHeight: 96,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.xs,
    paddingVertical: Spacing.sm,
  },
});
