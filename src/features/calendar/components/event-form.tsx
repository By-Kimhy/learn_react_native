import { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { confirm } from '@/components/ui/confirm';
import { DateField } from '@/components/ui/date-field';
import { IconButton } from '@/components/ui/icon-button';
import { ListRow } from '@/components/ui/list-row';
import { Screen } from '@/components/ui/screen';
import { ScreenHeader } from '@/components/ui/screen-header';
import { Text } from '@/components/ui/text';
import { TextField } from '@/components/ui/text-field';
import { TimeField } from '@/components/ui/time-field';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Divider } from '@/components/ui/divider';
import { Spacing } from '@/constants/theme';
import { ReminderToggle } from '@/features/reminders/components/reminder-toggle';
import { useT } from '@/features/settings/store';
import { todayISO } from '@/lib/date';
import type { TranslationKey } from '@/lib/i18n';
import { ReminderOffsets, type ISODate, type ReminderOffset, type RepeatRule } from '@/types';

const REPEAT_LABELS: Record<RepeatRule, TranslationKey> = {
  none: 'calendar.repeatNone',
  daily: 'calendar.repeatDaily',
  weekly: 'calendar.repeatWeekly',
  monthly: 'calendar.repeatMonthly',
  yearly: 'calendar.repeatYearly',
};

const OFFSET_LABELS: Record<ReminderOffset, TranslationKey> = {
  0: 'reminders.atTime',
  5: 'reminders.min5',
  15: 'reminders.min15',
  30: 'reminders.min30',
  60: 'reminders.hour1',
  1440: 'reminders.day1',
};

export interface EventFormValues {
  title: string;
  date: ISODate;
  time?: string;
  description: string;
  repeat: RepeatRule;
  reminderMinutesBefore?: ReminderOffset;
}

export interface EventFormProps {
  mode: 'create' | 'edit';
  initialValues?: Partial<EventFormValues>;
  onSubmit: (values: EventFormValues) => void;
  onCancel: () => void;
  onDelete?: () => void;
}

export function EventForm({ mode, initialValues, onSubmit, onCancel, onDelete }: EventFormProps) {
  const t = useT();

  const [title, setTitle] = useState(initialValues?.title ?? '');
  const [date, setDate] = useState<ISODate>(initialValues?.date ?? todayISO());
  const [time, setTime] = useState<string | undefined>(initialValues?.time);
  const [description, setDescription] = useState(initialValues?.description ?? '');
  const [repeat, setRepeat] = useState<RepeatRule>(initialValues?.repeat ?? 'none');
  const [offset, setOffset] = useState<ReminderOffset | undefined>(
    initialValues?.reminderMinutesBefore
  );
  const [sheet, setSheet] = useState<'none' | 'repeat' | 'offset'>('none');
  const [error, setError] = useState<string>();

  const handleSubmit = () => {
    if (!title.trim()) {
      setError(t('calendar.errorTitle'));
      return;
    }
    onSubmit({
      title: title.trim(),
      date,
      time,
      description: description.trim(),
      repeat,
      reminderMinutesBefore: offset,
    });
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    const confirmed = await confirm({
      title: t('calendar.deleteTitle'),
      message: t('calendar.deleteBody'),
      confirmLabel: t('common.delete'),
      cancelLabel: t('common.cancel'),
      destructive: true,
    });
    if (confirmed) onDelete();
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScreenHeader
        title={mode === 'create' ? t('calendar.newEvent') : t('calendar.editEvent')}
        onBack={onCancel}
        backLabel={t('common.cancel')}
        right={
          onDelete ? (
            <IconButton name="trash-outline" accessibilityLabel={t('common.delete')} onPress={handleDelete} />
          ) : null
        }
      />

      <Screen contentContainerStyle={styles.content}>
        <View style={styles.fields}>
          <TextField
            label={t('calendar.eventTitle')}
            value={title}
            onChangeText={(next) => {
              setTitle(next);
              if (error) setError(undefined);
            }}
            placeholder={t('calendar.eventTitlePlaceholder')}
            error={error}
            autoFocus={mode === 'create'}
          />

          <DateField label={t('calendar.date')} value={date} onChange={setDate} />

          <View style={styles.field}>
            <TimeField
              label={t('calendar.time')}
              value={time}
              onChange={setTime}
              placeholder={t('calendar.allDay')}
            />
            {time ? (
              <Button
                label={t('calendar.allDay')}
                icon="close-circle-outline"
                variant="ghost"
                style={styles.clearTime}
                onPress={() => {
                  setTime(undefined);
                  // An all-day event has no instant to count a reminder back from.
                  setOffset(undefined);
                }}
              />
            ) : null}
          </View>

          <TextField
            label={t('calendar.description')}
            value={description}
            onChangeText={setDescription}
            placeholder={t('calendar.descriptionPlaceholder')}
            hint={t('common.optional')}
            multiline
          />

          <View style={styles.field}>
            <Text variant="overline" color="textTertiary">
              {t('calendar.repeat').toUpperCase()}
            </Text>
            <ListRow
              title={t(REPEAT_LABELS[repeat])}
              icon="repeat"
              showChevron
              onPress={() => setSheet('repeat')}
            />
          </View>

          <ReminderToggle
            enabled={offset !== undefined}
            onToggle={(enabled) => setOffset(enabled ? (offset ?? 0) : undefined)}>
            <ListRow
              title={offset !== undefined ? t(OFFSET_LABELS[offset]) : t('reminders.none')}
              icon="alarm-outline"
              showChevron
              onPress={() => setSheet('offset')}
            />
          </ReminderToggle>
        </View>

        <Button
          label={t('calendar.saveEvent')}
          icon="checkmark"
          onPress={handleSubmit}
          fullWidth
          shape="pill"
          style={styles.submit}
        />
      </Screen>

      <BottomSheet
        visible={sheet === 'repeat'}
        onClose={() => setSheet('none')}
        title={t('calendar.repeat')}>
        <View style={styles.menu}>
          {(Object.keys(REPEAT_LABELS) as RepeatRule[]).map((rule, index) => (
            <View key={rule}>
              {index > 0 ? <Divider /> : null}
              <ListRow
                title={t(REPEAT_LABELS[rule])}
                icon={rule === repeat ? 'checkmark-circle' : 'ellipse-outline'}
                onPress={() => {
                  setRepeat(rule);
                  setSheet('none');
                }}
              />
            </View>
          ))}
        </View>
      </BottomSheet>

      <BottomSheet
        visible={sheet === 'offset'}
        onClose={() => setSheet('none')}
        title={t('reminders.reminder')}>
        <View style={styles.menu}>
          {ReminderOffsets.map((value, index) => (
            <View key={value}>
              {index > 0 ? <Divider /> : null}
              <ListRow
                title={t(OFFSET_LABELS[value])}
                icon={value === offset ? 'checkmark-circle' : 'ellipse-outline'}
                onPress={() => {
                  setOffset(value);
                  setSheet('none');
                }}
              />
            </View>
          ))}
        </View>
      </BottomSheet>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { paddingTop: Spacing.lg },
  fields: { gap: Spacing.xl },
  field: { gap: Spacing.sm },
  clearTime: { alignSelf: 'flex-start', paddingHorizontal: Spacing.sm },
  submit: { marginTop: Spacing.xxl },
  menu: { paddingBottom: Spacing.sm },
});
