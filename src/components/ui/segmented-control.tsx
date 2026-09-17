import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { Radius, ShadowColor, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import { Icon, type IconName } from './icon';
import { PressableScale } from './pressable-scale';
import { Text } from './text';

export interface SegmentedOption<T extends string> {
  value: T;
  label: string;
  icon?: IconName;
}

export interface SegmentedControlProps<T extends string> {
  options: SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  accessibilityLabel?: string;
  /** Tints the selected thumb — red for Expense, green for Income. */
  tint?: string;
  /** `pill` fully rounds both track and thumb; `rounded` keeps softer corners. */
  shape?: 'pill' | 'rounded';
  /** `above` stacks the icon over the label, for a taller, more tappable control. */
  iconPosition?: 'leading' | 'above';
  style?: StyleProp<ViewStyle>;
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  accessibilityLabel,
  tint,
  shape = 'pill',
  iconPosition = 'leading',
  style,
}: SegmentedControlProps<T>) {
  const theme = useTheme();

  const stacked = iconPosition === 'above';
  const trackRadius = shape === 'pill' ? Radius.pill : Radius.md;
  const thumbRadius = shape === 'pill' ? Radius.pill : Radius.sm;

  return (
    <View
      accessibilityRole="tablist"
      accessibilityLabel={accessibilityLabel}
      style={[styles.track, { backgroundColor: theme.surfaceAlt, borderRadius: trackRadius }, style]}>
      {options.map((option) => {
        const selected = option.value === value;
        const thumb = tint ?? theme.surface;
        const foreground = selected ? (tint ? theme.textInverted : theme.primary) : theme.textSecondary;

        return (
          <PressableScale
            key={option.value}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            accessibilityLabel={option.label}
            onPress={() => onChange(option.value)}
            scaleTo={0.96}
            style={[
              styles.segment,
              stacked && styles.segmentStacked,
              { borderRadius: thumbRadius },
              selected && { backgroundColor: thumb },
              selected && !tint && styles.thumbShadow,
            ]}>
            {option.icon ? <Icon name={option.icon} size={stacked ? 18 : 15} tint={foreground} /> : null}
            <Text variant="captionStrong" tint={foreground} numberOfLines={1}>
              {option.label}
            </Text>
          </PressableScale>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    padding: 4,
    gap: 4,
  },
  segment: {
    flex: 1,
    minHeight: 38,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.sm,
  },
  segmentStacked: { flexDirection: 'column', minHeight: 62, gap: 2, paddingVertical: Spacing.sm },
  thumbShadow: {
    shadowColor: ShadowColor,
    shadowOpacity: 0.07,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
});
