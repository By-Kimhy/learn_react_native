import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { MinTouchTarget, Radius, Spacing, type AccentName } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import { Icon, type IconName } from './icon';
import { IconTile } from './icon-tile';
import { PressableScale } from './pressable-scale';
import { Text } from './text';

export interface ListRowProps {
  title: string;
  subtitle?: string;
  icon?: IconName;
  emoji?: string;
  /** Named accent for the leading badge. Falls back to grey. */
  tone?: AccentName;
  /** Escape hatches for badges whose colour comes from data, not the palette. */
  iconBackground?: string;
  iconTint?: string;
  iconShape?: 'rounded' | 'circle';
  /** A small status dot before the subtitle — "connected", "saved", and so on. */
  subtitleDot?: string;
  value?: string;
  right?: ReactNode;
  onPress?: () => void;
  showChevron?: boolean;
  disabled?: boolean;
  destructive?: boolean;
}

/** The settings/menu row used across More, Settings and link lists. */
export function ListRow({
  title,
  subtitle,
  icon,
  emoji,
  tone,
  iconBackground,
  iconTint,
  iconShape = 'rounded',
  subtitleDot,
  value,
  right,
  onPress,
  showChevron = false,
  disabled = false,
  destructive = false,
}: ListRowProps) {
  const theme = useTheme();

  const badgeTone =
    iconBackground || iconTint
      ? { soft: iconBackground ?? theme.surfaceAlt, tint: iconTint ?? theme.text }
      : destructive
        ? { soft: theme.expenseSoft, tint: theme.expense }
        : (tone ?? 'grey');

  const content = (
    <View style={[styles.row, disabled && styles.disabled]}>
      {icon || emoji ? (
        <IconTile icon={icon} emoji={emoji} tone={badgeTone} shape={iconShape} size={38} />
      ) : null}

      <View style={styles.copy}>
        <Text variant="bodyStrong" color={destructive ? 'expense' : 'text'} numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          subtitleDot ? (
            <View style={styles.subtitleRow}>
              <View style={[styles.dot, { backgroundColor: subtitleDot }]} />
              <Text variant="caption" tint={subtitleDot} numberOfLines={2} style={styles.subtitleText}>
                {subtitle}
              </Text>
            </View>
          ) : (
            <Text variant="caption" color="textSecondary" numberOfLines={2}>
              {subtitle}
            </Text>
          )
        ) : null}
      </View>

      {value ? (
        <Text variant="caption" color="textSecondary" numberOfLines={1}>
          {value}
        </Text>
      ) : null}

      {right}

      {showChevron ? <Icon name="chevron-forward" size={16} color="textTertiary" /> : null}
    </View>
  );

  if (!onPress || disabled) return content;

  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityHint={subtitle}
      onPress={onPress}
      scaleTo={0.985}>
      {content}
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    minHeight: MinTouchTarget + 10,
    paddingVertical: Spacing.sm,
  },
  disabled: { opacity: 0.45 },
  copy: { flex: 1, gap: 1 },
  subtitleRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  subtitleText: { flex: 1 },
  dot: { width: 7, height: 7, borderRadius: Radius.pill },
});
