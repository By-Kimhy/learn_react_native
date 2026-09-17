import { Platform, StyleSheet, View, type ViewProps } from 'react-native';

import { Radius, ShadowColor, Spacing } from '@/constants/theme';
import { useColorScheme, useTheme } from '@/hooks/use-theme';

export interface CardProps extends ViewProps {
  padded?: boolean;
  /** `flat` drops the shadow — for cards sitting inside another card. */
  variant?: 'raised' | 'flat';
  background?: string;
}

export function Card({
  padded = true,
  variant = 'raised',
  background,
  style,
  ...rest
}: CardProps) {
  const theme = useTheme();
  const dark = useColorScheme() === 'dark';

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: background ?? theme.surface },
        padded && styles.padded,
        // Dark mode reads better with a hairline border than with a shadow, but
        // both schemes set the same style keys and vary only the values. Adding
        // or removing `elevation` on a view that also has `overflow: 'hidden'`
        // makes Android rebuild the outline it clips children against, and the
        // children stay clipped away — a blank card — until the view is
        // recreated. Keeping the keys stable turns the switch into a plain
        // value update.
        variant === 'raised' && {
          borderWidth: dark ? StyleSheet.hairlineWidth : 0,
          borderColor: dark ? theme.border : 'transparent',
          ...Platform.select({
            ios: {
              shadowColor: ShadowColor,
              shadowOpacity: dark ? 0 : 0.05,
              shadowRadius: 14,
              shadowOffset: { width: 0, height: 4 },
            },
            android: { elevation: dark ? 0 : 1 },
            default: {},
          }),
        },
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.lg,
    overflow: 'hidden',
  },
  padded: {
    padding: Spacing.lg,
  },
});
