import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { Radius, Spacing, type AccentName } from '@/constants/theme';
import { useAccents, useTheme } from '@/hooks/use-theme';

import { Icon, type IconName } from './icon';
import { Text } from './text';

export interface BadgeProps {
  label: string;
  /** A named accent, or an explicit pair for tokens that live on the theme. */
  tone?: AccentName | { soft: string; tint: string };
  icon?: IconName;
  /** `solid` fills with the tint and inverts the label — for counts on chrome. */
  variant?: 'soft' | 'solid' | 'outline';
  style?: StyleProp<ViewStyle>;
}

/** The small pills: streak counts, deltas, "2 notes", "Live sync". */
export function Badge({ label, tone = 'grey', icon, variant = 'soft', style }: BadgeProps) {
  const theme = useTheme();
  const accents = useAccents();
  const { soft, tint } = typeof tone === 'string' ? accents[tone] : tone;

  const background = { soft, solid: tint, outline: 'transparent' }[variant];
  const foreground = variant === 'solid' ? theme.surface : tint;

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: background,
          borderWidth: variant === 'outline' ? StyleSheet.hairlineWidth : 0,
          borderColor: variant === 'outline' ? theme.border : 'transparent',
        },
        style,
      ]}>
      {icon ? <Icon name={icon} size={12} tint={foreground} /> : null}
      <Text variant="captionStrong" tint={foreground} numberOfLines={1} style={styles.label}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: Radius.pill,
    alignSelf: 'flex-start',
  },
  label: { fontSize: 12 },
});
