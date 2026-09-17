import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { Radius } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export interface ProgressBarProps {
  /** 0–1. Values outside the range are clamped rather than overflowing the track. */
  value: number;
  tint?: string;
  track?: string;
  height?: number;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
}

export function ProgressBar({
  value,
  tint,
  track,
  height = 8,
  accessibilityLabel,
  style,
}: ProgressBarProps) {
  const theme = useTheme();
  const clamped = Math.max(0, Math.min(1, Number.isFinite(value) ? value : 0));

  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel={accessibilityLabel}
      accessibilityValue={{ min: 0, max: 100, now: Math.round(clamped * 100) }}
      style={[
        styles.track,
        { backgroundColor: track ?? theme.surfaceSunken, height, borderRadius: Radius.pill },
        style,
      ]}>
      <View
        style={{
          width: `${clamped * 100}%`,
          height: '100%',
          borderRadius: Radius.pill,
          backgroundColor: tint ?? theme.primary,
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: { width: '100%', overflow: 'hidden' },
});
