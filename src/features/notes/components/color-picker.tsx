import { ScrollView, StyleSheet, View } from 'react-native';

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
            // A ring around the swatch rather than a tick inside it: the colour
            // is the thing being chosen, so nothing should cover it.
            style={[styles.ring, selected && { borderColor: theme.primary }]}>
            <View
              style={[styles.swatch, { backgroundColor: swatch, borderColor: theme.border }]}
            />
          </PressableScale>
        );
      })}
      <View style={styles.tailSpace} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: Spacing.sm, alignItems: 'center', paddingVertical: Spacing.xs },
  ring: {
    width: 40,
    height: 40,
    borderRadius: Radius.pill,
    borderWidth: 2,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  swatch: {
    width: 30,
    height: 30,
    borderRadius: Radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
  },
  tailSpace: { width: Spacing.xs },
});
