import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { MinTouchTarget, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import { Icon, type IconName } from './icon';
import { PressableScale } from './pressable-scale';
import { Text } from './text';

export interface ListRowProps {
  title: string;
  subtitle?: string;
  icon?: IconName;
  emoji?: string;
  /** Tint for the leading icon badge; defaults to the theme's soft primary. */
  iconBackground?: string;
  iconTint?: string;
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
  iconBackground,
  iconTint,
  value,
  right,
  onPress,
  showChevron = false,
  disabled = false,
  destructive = false,
}: ListRowProps) {
  const theme = useTheme();

  const content = (
    <View style={[styles.row, disabled && styles.disabled]}>
      {icon || emoji ? (
        <View style={[styles.badge, { backgroundColor: iconBackground ?? theme.surfaceAlt }]}>
          {emoji ? (
            <Text variant="body">{emoji}</Text>
          ) : (
            <Icon name={icon!} size={18} tint={iconTint ?? (destructive ? theme.expense : theme.text)} />
          )}
        </View>
      ) : null}

      <View style={styles.copy}>
        <Text variant="bodyStrong" color={destructive ? 'expense' : 'text'} numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text variant="caption" color="textSecondary" numberOfLines={2}>
            {subtitle}
          </Text>
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
    minHeight: MinTouchTarget + 8,
    paddingVertical: Spacing.sm,
  },
  disabled: { opacity: 0.45 },
  badge: {
    width: 38,
    height: 38,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: { flex: 1, gap: 1 },
});
