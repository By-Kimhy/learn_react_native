import { StyleSheet, useWindowDimensions, View } from 'react-native';

import { PressableScale } from '@/components/ui/pressable-scale';
import { Text } from '@/components/ui/text';
import { MaxContentWidth, Radius, Spacing } from '@/constants/theme';
import { useT } from '@/features/settings/store';
import { useTheme } from '@/hooks/use-theme';
import type { TransactionType } from '@/types';

import { categoriesFor } from '../categories';

export interface CategoryPickerProps {
  type: TransactionType;
  value: string | null;
  onChange: (categoryId: string) => void;
  label: string;
  error?: string;
}

/**
 * A tap-target grid rather than a dropdown: choosing a category is the slowest
 * step of logging an expense, and the spec asks for "a few taps" end to end.
 */
/** Screen padding the picker sits inside, mirroring <Screen>'s gutters. */
const HORIZONTAL_INSET = Spacing.lg * 2;
const GAP = Spacing.sm;
const IDEAL_TILE = 86;

export function CategoryPicker({ type, value, onChange, label, error }: CategoryPickerProps) {
  const theme = useTheme();
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
      <Text variant="captionStrong" color="textSecondary">
        {label}
      </Text>

      <View style={styles.grid}>
        {categories.map((category) => {
          const selected = category.id === value;

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
                  backgroundColor: selected ? theme.primarySoft : theme.surfaceAlt,
                  borderColor: selected ? theme.primary : 'transparent',
                },
              ]}>
              <Text variant="subheading">{category.emoji}</Text>
              <Text
                variant="caption"
                color={selected ? 'primary' : 'textSecondary'}
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
    minHeight: 84,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    paddingHorizontal: Spacing.xs,
    paddingVertical: Spacing.sm,
  },
});
