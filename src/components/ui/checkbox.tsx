import { StyleSheet } from 'react-native';

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

export function Checkbox({ checked, onToggle, accessibilityLabel, size = 24, tint }: CheckboxProps) {
  const theme = useTheme();

  return (
    <PressableScale
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      accessibilityLabel={accessibilityLabel}
      onPress={onToggle}
      hitSlop={10}
      scaleTo={0.85}
      style={styles.button}>
      <Icon
        name={checked ? 'checkmark-circle' : 'ellipse-outline'}
        size={size}
        tint={checked ? (tint ?? theme.primary) : theme.textTertiary}
      />
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  button: { alignItems: 'center', justifyContent: 'center' },
});
