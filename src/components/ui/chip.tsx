import { StyleSheet, View } from 'react-native';

import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import { Icon, type IconName } from './icon';
import { PressableScale } from './pressable-scale';
import { Text } from './text';

export interface ChipProps {
  label: string;
  selected?: boolean;
  emoji?: string;
  icon?: IconName;
  /** A trailing count — the "6" on an "All" filter. */
  count?: number;
  onPress?: () => void;
  onRemove?: () => void;
  removeLabel?: string;
}

export function Chip({
  label,
  selected = false,
  emoji,
  icon,
  count,
  onPress,
  onRemove,
  removeLabel,
}: ChipProps) {
  const theme = useTheme();

  const foreground = selected ? theme.onPrimary : theme.text;

  const body = (
    <>
      {emoji ? <Text variant="caption">{emoji}</Text> : null}
      {icon ? <Icon name={icon} size={14} tint={selected ? theme.onPrimary : theme.textSecondary} /> : null}
      <Text variant="captionStrong" tint={foreground} numberOfLines={1}>
        {label}
      </Text>

      {count !== undefined ? (
        <Text
          variant="captionStrong"
          tint={selected ? theme.onPrimary : theme.textTertiary}
          style={styles.count}>
          {count}
        </Text>
      ) : null}

      {onRemove ? (
        <PressableScale
          accessibilityRole="button"
          accessibilityLabel={removeLabel ?? `Remove ${label}`}
          onPress={onRemove}
          hitSlop={8}
          scaleTo={0.85}>
          <Icon name="close" size={14} tint={selected ? theme.onPrimary : theme.textSecondary} />
        </PressableScale>
      ) : null}
    </>
  );

  const chipStyle = [styles.chip, { backgroundColor: selected ? theme.primary : theme.surfaceAlt }];

  if (!onPress) return <View style={chipStyle}>{body}</View>;

  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={count === undefined ? label : `${label}, ${count}`}
      onPress={onPress}
      scaleTo={0.94}
      style={chipStyle}>
      {body}
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    minHeight: 36,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radius.pill,
  },
  count: { opacity: 0.75 },
});
