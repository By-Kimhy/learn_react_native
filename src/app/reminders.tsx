import { useRouter } from 'expo-router';
import { Fragment, useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Divider } from '@/components/ui/divider';
import { EmptyState } from '@/components/ui/empty-state';
import { Icon } from '@/components/ui/icon';
import { ListRow } from '@/components/ui/list-row';
import { Screen } from '@/components/ui/screen';
import { ScreenHeader } from '@/components/ui/screen-header';
import { Text } from '@/components/ui/text';
import { Radius, Spacing } from '@/constants/theme';
import { useEvents } from '@/features/calendar/store';
import { useHabits } from '@/features/habits/store';
import { ensurePermission, getPermissionStatus } from '@/features/reminders/notifications';
import { collectReminders, isPast, type ReminderEntry } from '@/features/reminders/selectors';
import { formatTime } from '@/features/reminders/scheduler';
import { usePreferences, useT } from '@/features/settings/store';
import { useTasks } from '@/features/tasks/store';
import { useTheme } from '@/hooks/use-theme';
import { formatDateHeading, toISODate } from '@/lib/date';
import type { TranslationKey } from '@/lib/i18n';

const SOURCE_LABELS: Record<ReminderEntry['source'], TranslationKey> = {
  task: 'reminders.fromTask',
  event: 'reminders.fromEvent',
  habit: 'reminders.fromHabit',
};

const SOURCE_ICONS = {
  task: 'checkbox-outline',
  event: 'calendar-outline',
  habit: 'flame-outline',
} as const;

export default function RemindersScreen() {
  const router = useRouter();
  const t = useT();
  const { preferences, updatePreferences } = usePreferences();
  const { tasks } = useTasks();
  const { events } = useEvents();
  const { habits } = useHabits();

  const [granted, setGranted] = useState<boolean | null>(null);

  useEffect(() => {
    getPermissionStatus().then((status) => setGranted(status === 'granted'));
  }, []);

  const entries = useMemo(
    () => collectReminders({ tasks, events, habits }),
    [tasks, events, habits]
  );

  const requestPermission = async () => {
    const ok = await ensurePermission();
    setGranted(ok);
    if (ok && !preferences.notificationsEnabled) {
      updatePreferences({ notificationsEnabled: true });
    }
  };

  const openSource = (entry: ReminderEntry) => {
    if (entry.source === 'task') router.push(`/task/${entry.sourceId}`);
    else if (entry.source === 'event') router.push(`/event/${entry.sourceId}`);
    else router.push(`/habit/${entry.sourceId}`);
  };

  return (
    <>
      <ScreenHeader title={t('reminders.title')} onBack={() => router.back()} />

      <Screen contentContainerStyle={styles.content}>
        <View style={styles.sections}>
          {/* Two different ways a reminder can silently fail; both are worth saying out loud. */}
          {granted === false ? (
            <Notice
              tone="warning"
              title={t('reminders.permissionTitle')}
              body={t('reminders.permissionBody')}
              action={{ label: t('reminders.permissionAction'), onPress: requestPermission }}
            />
          ) : null}

          {!preferences.notificationsEnabled ? (
            <Notice
              tone="warning"
              title={t('reminders.disabledTitle')}
              body={t('reminders.disabledBody')}
              action={{
                label: t('settings.notificationsEnabled'),
                onPress: () => updatePreferences({ notificationsEnabled: true }),
              }}
            />
          ) : null}

          {entries.length > 0 ? (
            <View style={styles.list}>
              <Text variant="overline" color="textSecondary">
                {t('reminders.upcoming').toUpperCase()}
              </Text>

              <Card style={styles.card}>
                {entries.map((entry, index) => (
                  <Fragment key={entry.id}>
                    {index > 0 ? <Divider inset={50} /> : null}
                    <View style={isPast(entry) && styles.past}>
                      <ListRow
                        title={entry.title}
                        subtitle={describe(entry, preferences.language, t)}
                        icon={SOURCE_ICONS[entry.source]}
                        emoji={entry.emoji}
                        value={t(SOURCE_LABELS[entry.source])}
                        showChevron
                        onPress={() => openSource(entry)}
                      />
                    </View>
                  </Fragment>
                ))}
              </Card>
            </View>
          ) : (
            <EmptyState
              icon="alarm-outline"
              title={t('reminders.empty')}
              body={t('reminders.emptyBody')}
              action={{
                label: t('create.reminder'),
                icon: 'add',
                onPress: () => router.push('/event/new?reminder=1'),
              }}
            />
          )}
        </View>
      </Screen>
    </>
  );
}

function describe(
  entry: ReminderEntry,
  language: string,
  t: (key: TranslationKey, values?: Record<string, string | number>) => string
): string {
  if (entry.dailyTime) {
    return t('reminders.everyDayAt', { time: formatTime(entry.dailyTime, language) });
  }
  if (!entry.fireAt) return t('reminders.none');

  const day = formatDateHeading(toISODate(entry.fireAt), language, {
    today: t('common.today'),
    yesterday: t('common.yesterday'),
  });

  try {
    const time = new Intl.DateTimeFormat(language === 'km' ? 'km-KH' : 'en-US', {
      hour: 'numeric',
      minute: '2-digit',
    }).format(entry.fireAt);
    return `${day} · ${time}`;
  } catch {
    return day;
  }
}

function Notice({
  tone,
  title,
  body,
  action,
}: {
  tone: 'warning';
  title: string;
  body: string;
  action: { label: string; onPress: () => void };
}) {
  const theme = useTheme();

  return (
    <Card style={[styles.notice, { backgroundColor: theme.expenseSoft }]}>
      <View style={styles.noticeHeader}>
        <Icon name="notifications-off-outline" size={18} tint={theme.expense} />
        <Text variant="bodyStrong" tint={theme.expense} style={styles.noticeTitle}>
          {title}
        </Text>
      </View>
      <Text variant="caption" tint={theme.expense}>
        {body}
      </Text>
      <Button label={action.label} variant="secondary" onPress={action.onPress} />
    </Card>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: Spacing.lg },
  sections: { gap: Spacing.lg },
  list: { gap: Spacing.sm },
  card: { paddingVertical: Spacing.xs, paddingHorizontal: Spacing.lg },
  past: { opacity: 0.5 },
  notice: { gap: Spacing.sm, borderRadius: Radius.lg },
  noticeHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  noticeTitle: { flex: 1 },
});
