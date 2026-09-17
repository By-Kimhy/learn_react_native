import { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { confirm } from '@/components/ui/confirm';
import { DateField } from '@/components/ui/date-field';
import { IconButton } from '@/components/ui/icon-button';
import { Screen } from '@/components/ui/screen';
import { ScreenHeader } from '@/components/ui/screen-header';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { Text } from '@/components/ui/text';
import { TextField } from '@/components/ui/text-field';
import { TimeField } from '@/components/ui/time-field';
import { Spacing } from '@/constants/theme';
import { ReminderToggle } from '@/features/reminders/components/reminder-toggle';
import { useT } from '@/features/settings/store';
import { todayISO } from '@/lib/date';
import type { ISODate, Priority } from '@/types';

export interface TaskFormValues {
  title: string;
  description: string;
  dueDate?: ISODate;
  priority: Priority;
  reminderTime?: string;
}

export interface TaskFormProps {
  mode: 'create' | 'edit';
  initialValues?: Partial<TaskFormValues>;
  onSubmit: (values: TaskFormValues) => void;
  onCancel: () => void;
  onDelete?: () => void;
}

export function TaskForm({ mode, initialValues, onSubmit, onCancel, onDelete }: TaskFormProps) {
  const t = useT();

  const [title, setTitle] = useState(initialValues?.title ?? '');
  const [description, setDescription] = useState(initialValues?.description ?? '');
  const [dueDate, setDueDate] = useState<ISODate | undefined>(initialValues?.dueDate);
  const [priority, setPriority] = useState<Priority>(initialValues?.priority ?? 'medium');
  const [reminderTime, setReminderTime] = useState<string | undefined>(initialValues?.reminderTime);
  const [error, setError] = useState<string>();

  const handleSubmit = () => {
    if (!title.trim()) {
      setError(t('tasks.errorTitle'));
      return;
    }
    onSubmit({ title: title.trim(), description: description.trim(), dueDate, priority, reminderTime });
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    const confirmed = await confirm({
      title: t('tasks.deleteTitle'),
      message: t('tasks.deleteBody'),
      confirmLabel: t('common.delete'),
      cancelLabel: t('common.cancel'),
      destructive: true,
    });
    if (confirmed) onDelete();
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScreenHeader
        title={mode === 'create' ? t('tasks.newTask') : t('tasks.editTask')}
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
            label={t('tasks.titleLabel')}
            value={title}
            onChangeText={(next) => {
              setTitle(next);
              if (error) setError(undefined);
            }}
            placeholder={t('tasks.titlePlaceholder')}
            error={error}
            autoFocus={mode === 'create'}
            returnKeyType="next"
          />

          <TextField
            label={t('tasks.description')}
            value={description}
            onChangeText={setDescription}
            placeholder={t('tasks.descriptionPlaceholder')}
            hint={t('common.optional')}
            multiline
          />

          <View style={styles.field}>
            <Text variant="overline" color="textTertiary">
              {t('tasks.priority').toUpperCase()}
            </Text>
            <SegmentedControl
              accessibilityLabel={t('tasks.priority')}
              options={[
                { value: 'low', label: t('tasks.low') },
                { value: 'medium', label: t('tasks.medium') },
                { value: 'high', label: t('tasks.high') },
              ]}
              value={priority}
              onChange={(value) => setPriority(value as Priority)}
            />
          </View>

          <View style={styles.field}>
            <SegmentedControl
              accessibilityLabel={t('tasks.dueDate')}
              options={[
                { value: 'none', label: t('tasks.noDueDate') },
                { value: 'date', label: t('tasks.dueDate') },
              ]}
              value={dueDate ? 'date' : 'none'}
              onChange={(value) => setDueDate(value === 'date' ? (dueDate ?? todayISO()) : undefined)}
            />

            {dueDate ? (
              <DateField label={t('tasks.dueDate')} value={dueDate} onChange={setDueDate} />
            ) : null}
          </View>

          {/* A reminder needs a day to fire on, so it follows the due date. */}
          {dueDate ? (
            <ReminderToggle
              enabled={reminderTime !== undefined}
              onToggle={(enabled) => setReminderTime(enabled ? (reminderTime ?? '09:00') : undefined)}>
              <TimeField
                label={t('reminders.reminder')}
                value={reminderTime}
                onChange={setReminderTime}
              />
            </ReminderToggle>
          ) : null}
        </View>

        <Button
          label={t('tasks.saveTask')}
          icon="checkmark"
          onPress={handleSubmit}
          fullWidth
          shape="pill"
          style={styles.submit}
        />
      </Screen>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { paddingTop: Spacing.lg },
  fields: { gap: Spacing.xl },
  field: { gap: Spacing.md },
  submit: { marginTop: Spacing.xxl },
});
