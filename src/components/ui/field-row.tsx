import type { ReactNode } from 'react';
import { StyleSheet } from 'react-native';

import { MinTouchTarget, Radius, Spacing, type AccentName } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import { Icon, type IconName } from './icon';
import { IconTile } from './icon-tile';
import { PressableScale } from './pressable-scale';
import { Text } from './text';

export interface FieldRowProps {
  label: string;
  value: string;
  icon: IconName;
  tone?: AccentName;
  /** Greys the value — for a field showing a placeholder rather than a choice. */
  muted?: boolean;
  accessibilityLabel?: string;
  onPress: () => void;
  right?: ReactNode;
}

/**
 * A tappable settings-style row used by the date and time fields: the label
 * sits beside the value rather than above it, which keeps a form of pickers
 * the same height as a form of list rows.
 */
export function FieldRow({
  label,
  value,
  icon,
  tone = 'blue',
  muted = false,
  accessibilityLabel,
  onPress,
  right,
}: FieldRowProps) {
  const theme = useTheme();

  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? `${label}, ${value}`}
      onPress={onPress}
      scaleTo={0.98}
      style={[styles.field, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      <IconTile icon={icon} tone={tone} size={36} />

      <Text variant="body" color="textSecondary" numberOfLines={1}>
        {label}
      </Text>

      <Text
        variant="bodyStrong"
        color={muted ? 'textTertiary' : 'text'}
        numberOfLines={1}
        align="right"
        style={styles.value}>
        {value}
      </Text>

      {right ?? <Icon name="chevron-forward" size={16} color="textTertiary" />}
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    minHeight: MinTouchTarget + 12,
    borderRadius: Radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: Spacing.md,
  },
  // The value takes the slack so it stays right-aligned against the chevron.
  value: { flex: 1 },
});
