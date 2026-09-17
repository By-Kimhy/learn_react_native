import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { useState } from 'react';
import { Platform, View } from 'react-native';

import { usePreferences, useT } from '@/features/settings/store';
import { useColorScheme } from '@/hooks/use-theme';
import { formatMediumDate, fromISODate, toISODate, todayISO } from '@/lib/date';
import type { ISODate } from '@/types';

import { BottomSheet } from './bottom-sheet';
import { Button } from './button';
import { FieldRow } from './field-row';
import { TextField } from './text-field';

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

  const display = formatMediumDate(fromISODate(value), preferences.language);

  return (
    <View>
      <FieldRow label={label} value={display} icon="calendar-outline" tone="blue" onPress={open} />

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
