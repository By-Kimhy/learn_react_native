import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';

import { usePreferences, useT } from '@/features/settings/store';
import { formatTime, parseTime, toTimeString } from '@/features/reminders/scheduler';
import { useColorScheme } from '@/hooks/use-theme';

import { BottomSheet } from './bottom-sheet';
import { Button } from './button';
import { FieldRow } from './field-row';
import { TextField } from './text-field';

export interface TimeFieldProps {
  label: string;
  /** Local `HH:mm`, or undefined when no time is set. */
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

/** The time counterpart of `DateField`, using each platform's native picker. */
export function TimeField({ label, value, onChange, placeholder }: TimeFieldProps) {
  const scheme = useColorScheme();
  const t = useT();
  const { preferences } = usePreferences();
  const [sheetVisible, setSheetVisible] = useState(false);
  const [draft, setDraft] = useState(() => toDate(value));

  if (Platform.OS === 'web') {
    return (
      <TextField
        label={label}
        value={value ?? ''}
        onChangeText={onChange}
        placeholder="09:00"
        autoCapitalize="none"
      />
    );
  }

  const open = () => {
    const current = toDate(value);

    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value: current,
        mode: 'time',
        onChange: (event, date) => {
          if (event.type === 'set' && date) onChange(toTimeString(date));
        },
      });
      return;
    }

    setDraft(current);
    setSheetVisible(true);
  };

  const display = value ? formatTime(value, preferences.language, preferences.timeFormat) : (placeholder ?? '—');

  return (
    <View>
      <FieldRow
        label={label}
        value={display}
        icon="time-outline"
        tone="indigo"
        muted={!value}
        onPress={open}
      />

      <BottomSheet visible={sheetVisible} onClose={() => setSheetVisible(false)} title={label}>
        <View style={styles.picker}>
          <DateTimePicker
            value={draft}
            mode="time"
            display="spinner"
            themeVariant={scheme}
            onChange={(_event, date) => {
              if (date) setDraft(date);
            }}
          />
        </View>
        <Button
          label={t('common.done')}
          fullWidth
          onPress={() => {
            onChange(toTimeString(draft));
            setSheetVisible(false);
          }}
        />
      </BottomSheet>
    </View>
  );
}

/** Defaults to 09:00 rather than "now", which is rarely the intended reminder. */
function toDate(value?: string): Date {
  const parsed = value ? parseTime(value) : null;
  const date = new Date();
  date.setHours(parsed?.hour ?? 9, parsed?.minute ?? 0, 0, 0);
  return date;
}

const styles = StyleSheet.create({
  picker: { alignItems: 'center' },
});
