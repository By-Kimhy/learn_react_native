import { ActivityIndicator, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { MinTouchTarget, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import { Icon, type IconName } from './icon';
import { PressableScale } from './pressable-scale';
import { Text } from './text';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

export interface ButtonProps {
  label: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  icon?: IconName;
  /** Puts the icon after the label — for "Continue ›" style actions. */
  iconTrailing?: boolean;
  /** `pill` fully rounds the button; `rounded` keeps the softer card corner. */
  shape?: 'rounded' | 'pill';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  icon,
  iconTrailing = false,
  shape = 'rounded',
  disabled = false,
  loading = false,
  fullWidth = false,
  style,
}: ButtonProps) {
  const theme = useTheme();

  const background = {
    primary: theme.primary,
    secondary: theme.surfaceAlt,
    ghost: 'transparent',
    danger: theme.expenseSoft,
  }[variant];

  const foreground = {
    primary: theme.onPrimary,
    secondary: theme.text,
    ghost: theme.primary,
    danger: theme.expense,
  }[variant];

  const isDisabled = disabled || loading;
  const glyph = icon ? <Icon name={icon} size={18} tint={foreground} /> : null;

  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      onPress={onPress}
      style={[
        styles.button,
        { backgroundColor: background, borderRadius: shape === 'pill' ? Radius.pill : Radius.md },
        variant === 'primary' && !isDisabled && { shadowColor: theme.primary, ...styles.primaryGlow },
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
        style,
      ]}>
      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator size="small" color={foreground} />
        ) : (
          <>
            {iconTrailing ? null : glyph}
            <Text variant="bodyStrong" tint={foreground} numberOfLines={1}>
              {label}
            </Text>
            {iconTrailing ? glyph : null}
          </>
        )}
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: MinTouchTarget + 8,
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
  },
  // A tinted lift under the primary action, matching the raised "+" on the tab bar.
  primaryGlow: {
    shadowOpacity: 0.28,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
    elevation: 4,
  },
  fullWidth: {
    alignSelf: 'stretch',
  },
  disabled: {
    opacity: 0.45,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
});
