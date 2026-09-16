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
  onPress?: () => void;
  onRemove?: () => void;
  removeLabel?: string;
}

export function Chip({ label, selected = false, emoji, icon, onPress, onRemove, removeLabel }: ChipProps) {
  const theme = useTheme();

  const body = (
    <>
      {emoji ? <Text variant="caption">{emoji}</Text> : null}
      {icon ? <Icon name={icon} size={14} tint={selected ? theme.onPrimary : theme.textSecondary} /> : null}
      <Text variant="captionStrong" tint={selected ? theme.onPrimary : theme.text} numberOfLines={1}>
        {label}
      </Text>
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

  const chipStyle = [
    styles.chip,
    { backgroundColor: selected ? theme.primary : theme.surfaceAlt },
  ];

  if (!onPress) return <View style={chipStyle}>{body}</View>;

  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={label}
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
    minHeight: 34,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.pill,
  },
});
