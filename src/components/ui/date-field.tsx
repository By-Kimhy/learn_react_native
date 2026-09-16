import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';

import { MinTouchTarget, Radius, Spacing } from '@/constants/theme';
import { usePreferences, useT } from '@/features/settings/store';
import { useColorScheme, useTheme } from '@/hooks/use-theme';
import { formatMediumDate, fromISODate, toISODate, todayISO } from '@/lib/date';
import type { ISODate } from '@/types';

import { BottomSheet } from './bottom-sheet';
import { Button } from './button';
import { Icon } from './icon';
import { PressableScale } from './pressable-scale';
import { TextField } from './text-field';
import { Text } from './text';

export interface DateFieldProps {
  label: string;
  value: ISODate;
  onChange: (value: ISODate) => void;
}

/**
 * Date entry using each platform's own picker: a dialog on Android, an inline
 * calendar in a sheet on iOS, and a plain typed field on web where no native
 * picker exists.
 */
export function DateField({ label, value, onChange }: DateFieldProps) {
  const theme = useTheme();
  const scheme = useColorScheme();
  const t = useT();
  const { preferences } = usePreferences();
  const [sheetVisible, setSheetVisible] = useState(false);
  const [draft, setDraft] = useState(() => fromISODate(value));

  if (Platform.OS === 'web') {
    return (
      <TextField
        label={label}
        value={value}
        onChangeText={(text) => onChange(text)}
        placeholder={todayISO()}
        autoCapitalize="none"
      />
    );
  }

  const open = () => {
    const current = fromISODate(value);

    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value: current,
        mode: 'date',
        onChange: (event, date) => {
          if (event.type === 'set' && date) onChange(toISODate(date));
        },
      });
      return;
    }

    setDraft(current);
    setSheetVisible(true);
  };

  return (
    <View style={styles.container}>
      <Text variant="captionStrong" color="textSecondary">
        {label}
      </Text>

      <PressableScale
        accessibilityRole="button"
        accessibilityLabel={`${label}, ${formatMediumDate(fromISODate(value), preferences.language)}`}
        onPress={open}
        scaleTo={0.98}
        style={[styles.field, { backgroundColor: theme.surfaceAlt }]}>
        <Icon name="calendar-outline" size={18} color="textSecondary" />
        <Text variant="body" style={styles.value}>
          {formatMediumDate(fromISODate(value), preferences.language)}
        </Text>
        <Icon name="chevron-down" size={16} color="textTertiary" />
      </PressableScale>

      <BottomSheet visible={sheetVisible} onClose={() => setSheetVisible(false)} title={label}>
        <DateTimePicker
          value={draft}
          mode="date"
          display="inline"
          themeVariant={scheme}
          onChange={(_event, date) => {
            if (date) setDraft(date);
          }}
        />
        <Button
          label={t('common.done')}
          fullWidth
          onPress={() => {
            onChange(toISODate(draft));
            setSheetVisible(false);
          }}
        />
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: Spacing.xs },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    minHeight: MinTouchTarget + 4,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
  },
  value: { flex: 1 },
});
