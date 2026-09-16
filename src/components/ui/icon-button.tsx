import { StyleSheet, type StyleProp, type ViewStyle } from 'react-native';

import { MinTouchTarget, Radius } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import { Icon, type IconName } from './icon';
import { PressableScale } from './pressable-scale';

export interface IconButtonProps {
  name: IconName;
  onPress?: () => void;
  accessibilityLabel: string;
  size?: number;
  tint?: string;
  /** Adds a tinted circular backing — for icons over photos or coloured cards. */
  filled?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function IconButton({
  name,
  onPress,
  accessibilityLabel,
  size = 22,
  tint,
  filled = false,
  disabled = false,
  style,
}: IconButtonProps) {
  const theme = useTheme();

  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      hitSlop={8}
      scaleTo={0.9}
      style={[
        styles.button,
        filled && { backgroundColor: theme.surfaceAlt },
        disabled && styles.disabled,
        style,
      ]}>
      <Icon name={name} size={size} tint={tint ?? theme.text} />
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  button: {
    minWidth: MinTouchTarget,
    minHeight: MinTouchTarget,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: {
    opacity: 0.4,
  },
});
