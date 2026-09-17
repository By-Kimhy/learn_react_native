import { StyleSheet, View } from 'react-native';

import { Radius } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import { Icon } from './icon';
import { PressableScale } from './pressable-scale';

export interface CheckboxProps {
  checked: boolean;
  onToggle: () => void;
  accessibilityLabel: string;
  size?: number;
  /** Overrides the checked tint — priority colours on tasks, for instance. */
  tint?: string;
}

/**
 * A drawn disc rather than a glyph pair: a filled circle with a white tick
 * reads as "done" at a glance, where two outline glyphs differ only in detail.
 */
export function Checkbox({ checked, onToggle, accessibilityLabel, size = 24, tint }: CheckboxProps) {
  const theme = useTheme();
  const fill = tint ?? theme.primary;

  return (
    <PressableScale
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      accessibilityLabel={accessibilityLabel}
      onPress={onToggle}
      hitSlop={10}
      scaleTo={0.85}
      style={styles.button}>
      <View
        style={[
          styles.box,
          {
            width: size,
            height: size,
            backgroundColor: checked ? fill : theme.surfaceAlt,
            borderColor: checked ? fill : theme.borderStrong,
          },
        ]}>
        {checked ? <Icon name="checkmark" size={Math.round(size * 0.62)} tint={theme.onPrimary} /> : null}
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  button: { alignItems: 'center', justifyContent: 'center' },
  box: {
    borderRadius: Radius.pill,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
