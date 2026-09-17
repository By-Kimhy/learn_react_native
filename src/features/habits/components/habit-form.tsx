import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { confirm } from '@/components/ui/confirm';
import { IconButton } from '@/components/ui/icon-button';
import { PressableScale } from '@/components/ui/pressable-scale';
import { Screen } from '@/components/ui/screen';
import { ScreenHeader } from '@/components/ui/screen-header';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { Text } from '@/components/ui/text';
import { TextField } from '@/components/ui/text-field';
import { TimeField } from '@/components/ui/time-field';
import { Radius, Spacing } from '@/constants/theme';
import { ReminderToggle } from '@/features/reminders/components/reminder-toggle';
import { useT } from '@/features/settings/store';
import { useTheme } from '@/hooks/use-theme';
import type { HabitFrequency } from '@/types';

/** A small, deliberately generic set — habits are personal, emoji carry the meaning. */
const EMOJI_CHOICES = [
  '🔥', '📚', '🏃', '💧', '🧘', '💪', '🥗', '😴',
  '💻', '✍️', '🎸', '🌱', '🧹', '💊', '🚭', '💰',
];

const WEEKLY_TARGETS = [1, 2, 3, 4, 5, 6];

export interface HabitFormValues {
  name: string;
  emoji: string;
  frequency: HabitFrequency;
  timesPerWeek: number;
  reminderTime?: string;
}

export interface HabitFormProps {
  mode: 'create' | 'edit';
  initialValues?: Partial<HabitFormValues>;
  onSubmit: (values: HabitFormValues) => void;
  onCancel: () => void;
  onDelete?: () => void;
  /** Streak stats, shown only when editing an existing habit. */
  stats?: { current: number; longest: number; total: number };
}

export function HabitForm({
  mode,
  initialValues,
  onSubmit,
  onCancel,
  onDelete,
  stats,
}: HabitFormProps) {
  const theme = useTheme();
  const t = useT();

  const [name, setName] = useState(initialValues?.name ?? '');
  const [emoji, setEmoji] = useState(initialValues?.emoji ?? '🔥');
  const [frequency, setFrequency] = useState<HabitFrequency>(initialValues?.frequency ?? 'daily');
  const [timesPerWeek, setTimesPerWeek] = useState(initialValues?.timesPerWeek ?? 3);
  const [reminderTime, setReminderTime] = useState<string | undefined>(initialValues?.reminderTime);
  const [error, setError] = useState<string>();

  const handleSubmit = () => {
    if (!name.trim()) {
      setError(t('habits.errorName'));
      return;
    }
    onSubmit({
      name: name.trim(),
      emoji,
      frequency,
      timesPerWeek: frequency === 'daily' ? 7 : timesPerWeek,
      reminderTime,
    });
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    const confirmed = await confirm({
      title: t('habits.deleteTitle'),
      message: t('habits.deleteBody'),
      confirmLabel: t('common.delete'),
      cancelLabel: t('common.cancel'),
      destructive: true,
    });
    if (confirmed) onDelete();
  };

  /** English needs the singular; Khmer doesn't inflect, so both keys match there. */
  const days = (count: number) => t(count === 1 ? 'habits.day' : 'habits.days', { count });

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScreenHeader
        title={mode === 'create' ? t('habits.newHabit') : t('habits.editHabit')}
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
          {stats ? (
            <View style={styles.stats}>
              <Stat label={t('habits.currentStreak')} value={days(stats.current)} />
              <Stat label={t('habits.longestStreak')} value={days(stats.longest)} />
              <Stat label={t('stats.total')} value={days(stats.total)} />
            </View>
          ) : null}

          <TextField
            label={t('habits.name')}
            value={name}
            onChangeText={(next) => {
              setName(next);
              if (error) setError(undefined);
            }}
            placeholder={t('habits.namePlaceholder')}
            error={error}
            autoFocus={mode === 'create'}
          />

          <View style={styles.field}>
            <Text variant="overline" color="textTertiary">
              {t('habits.icon').toUpperCase()}
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.emojiRow}>
                {EMOJI_CHOICES.map((choice) => {
                  const selected = choice === emoji;
                  return (
                    <PressableScale
                      key={choice}
                      accessibilityRole="button"
                      accessibilityState={{ selected }}
                      accessibilityLabel={choice}
                      onPress={() => setEmoji(choice)}
                      scaleTo={0.88}
                      style={[
                        styles.emojiTile,
                        {
                          backgroundColor: selected ? theme.primarySoft : theme.surfaceAlt,
                          borderColor: selected ? theme.primary : 'transparent',
                        },
                      ]}>
                      <Text variant="subheading">{choice}</Text>
                    </PressableScale>
                  );
                })}
              </View>
            </ScrollView>
          </View>

          <View style={styles.field}>
            <Text variant="overline" color="textTertiary">
              {t('habits.frequency').toUpperCase()}
            </Text>
            <SegmentedControl
              accessibilityLabel={t('habits.frequency')}
              options={[
                { value: 'daily', label: t('habits.daily') },
                { value: 'weekly', label: t('habits.weekly') },
              ]}
              value={frequency}
              onChange={(value) => setFrequency(value as HabitFrequency)}
            />

            {frequency === 'weekly' ? (
              <View style={styles.targets}>
                {WEEKLY_TARGETS.map((target) => {
                  const selected = target === timesPerWeek;
                  return (
                    <PressableScale
                      key={target}
                      accessibilityRole="button"
                      accessibilityState={{ selected }}
                      accessibilityLabel={t('habits.timesPerWeek', { count: target })}
                      onPress={() => setTimesPerWeek(target)}
                      scaleTo={0.9}
                      style={[
                        styles.target,
                        {
                          backgroundColor: selected ? theme.primary : theme.surfaceAlt,
                        },
                      ]}>
                      <Text
                        variant="captionStrong"
                        tint={selected ? theme.onPrimary : theme.textSecondary}>
                        {target}×
                      </Text>
                    </PressableScale>
                  );
                })}
              </View>
            ) : null}
          </View>

          <ReminderToggle
            enabled={reminderTime !== undefined}
            onToggle={(enabled) => setReminderTime(enabled ? (reminderTime ?? '09:00') : undefined)}>
            <TimeField label={t('reminders.reminder')} value={reminderTime} onChange={setReminderTime} />
          </ReminderToggle>
        </View>

        <Button
          label={t('habits.saveHabit')}
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

function Stat({ label, value }: { label: string; value: string }) {
  const theme = useTheme();
  return (
    <View style={[styles.stat, { backgroundColor: theme.surfaceAlt }]}>
      <Text variant="caption" color="textSecondary" numberOfLines={1}>
        {label}
      </Text>
      <Text variant="bodyStrong" numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { paddingTop: Spacing.lg },
  fields: { gap: Spacing.xl },
  field: { gap: Spacing.md },
  stats: { flexDirection: 'row', gap: Spacing.sm },
  stat: { flex: 1, gap: 2, padding: Spacing.md, borderRadius: Radius.md },
  emojiRow: { flexDirection: 'row', gap: Spacing.sm, paddingVertical: 2 },
  emojiTile: {
    width: 52,
    height: 52,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  targets: { flexDirection: 'row', gap: Spacing.sm },
  target: {
    flex: 1,
    minHeight: 40,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submit: { marginTop: Spacing.xxl },
});
