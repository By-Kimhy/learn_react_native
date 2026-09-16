import { ScrollView, StyleSheet, View } from 'react-native';

import { Icon } from '@/components/ui/icon';
import { PressableScale } from '@/components/ui/pressable-scale';
import { NoteColorKeys, NoteColors, Radius, Spacing } from '@/constants/theme';
import { useColorScheme, useTheme } from '@/hooks/use-theme';

export interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  accessibilityLabel: string;
}

export function ColorPicker({ value, onChange, accessibilityLabel }: ColorPickerProps) {
  const theme = useTheme();
  const scheme = useColorScheme();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      accessibilityLabel={accessibilityLabel}
      contentContainerStyle={styles.row}>
      {NoteColorKeys.map((key) => {
        const selected = key === value;
        const swatch = NoteColors[key][scheme];

        return (
          <PressableScale
            key={key}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            accessibilityLabel={key}
            onPress={() => onChange(key)}
            scaleTo={0.88}
            style={[
              styles.swatch,
              {
                backgroundColor: swatch,
                borderColor: selected ? theme.primary : theme.border,
                borderWidth: selected ? 2 : StyleSheet.hairlineWidth,
              },
            ]}>
            {selected ? <Icon name="checkmark" size={16} color="primary" /> : null}
          </PressableScale>
        );
      })}
      <View style={styles.tailSpace} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: Spacing.sm, alignItems: 'center', paddingVertical: Spacing.xs },
  swatch: {
    width: 38,
    height: 38,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tailSpace: { width: Spacing.xs },
});
