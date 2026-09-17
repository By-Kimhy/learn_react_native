import { useRouter } from 'expo-router';
import { Fragment, useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Chip } from '@/components/ui/chip';
import { Divider } from '@/components/ui/divider';
import { EmptyState } from '@/components/ui/empty-state';
import { Icon } from '@/components/ui/icon';
import { IconTile } from '@/components/ui/icon-tile';
import { ListRow } from '@/components/ui/list-row';
import { Screen } from '@/components/ui/screen';
import { SectionLabel } from '@/components/ui/section-header';
import { ScreenHeader } from '@/components/ui/screen-header';
import { Text } from '@/components/ui/text';
import { Radius, Spacing, type AccentName } from '@/constants/theme';
import { useEvents } from '@/features/calendar/store';
import { useHabits } from '@/features/habits/store';
import { ensurePermission, getPermissionStatus } from '@/features/reminders/notifications';
import { collectReminders, isPast, type ReminderEntry } from '@/features/reminders/selectors';
import { formatTime } from '@/features/reminders/scheduler';
import { usePreferences, useT } from '@/features/settings/store';
import { useTasks } from '@/features/tasks/store';
import { useTheme } from '@/hooks/use-theme';
import { formatClock, formatDateHeading, toISODate } from '@/lib/date';
import type { TranslationKey } from '@/lib/i18n';
import type { TimeFormat } from '@/types';

type SourceFilter = 'all' | ReminderEntry['source'];

/** Filter chips, in the order they appear above the list. */
const FILTERS: { value: SourceFilter; labelKey: TranslationKey }[] = [
  { value: 'all', labelKey: 'common.all' },
  { value: 'task', labelKey: 'more.tasks' },
  { value: 'habit', labelKey: 'habits.title' },
  { value: 'event', labelKey: 'calendar.events' },
];

const SOURCE_LABELS: Record<ReminderEntry['source'], TranslationKey> = {
  task: 'reminders.fromTask',
  event: 'reminders.fromEvent',
  habit: 'reminders.fromHabit',
};

const SOURCE_TONES: Record<ReminderEntry['source'], AccentName> = {
  task: 'blue',
  event: 'indigo',
  habit: 'amber',
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
  const [filter, setFilter] = useState<SourceFilter>('all');

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

  const visible = filter === 'all' ? entries : entries.filter((entry) => entry.source === filter);
  const upcoming = visible.filter((entry) => !isPast(entry));
  const past = visible.filter(isPast);

  const counts = useMemo(
    () => ({
      task: entries.filter((entry) => entry.source === 'task').length,
      habit: entries.filter((entry) => entry.source === 'habit').length,
      event: entries.filter((entry) => entry.source === 'event').length,
    }),
    [entries]
  );

  const openSource = (entry: ReminderEntry) => {
    if (entry.source === 'task') router.push(`/task/${entry.sourceId}`);
    else if (entry.source === 'event') router.push(`/event/${entry.sourceId}`);
    else router.push(`/habit/${entry.sourceId}`);
  };

  const renderGroup = (group: ReminderEntry[]) => (
    <Card style={styles.card}>
      {group.map((entry, index) => (
        <Fragment key={entry.id}>
          {index > 0 ? <Divider inset={50} /> : null}
          <ListRow
            title={entry.title}
            subtitle={describe(entry, preferences.language, preferences.timeFormat, t)}
            icon={SOURCE_ICONS[entry.source]}
            emoji={entry.emoji}
            tone={SOURCE_TONES[entry.source]}
            iconShape="circle"
            value={t(SOURCE_LABELS[entry.source])}
            right={
              <IconTile
                icon="notifications"
                tone={SOURCE_TONES[entry.source]}
                size={26}
                shape="circle"
              />
            }
            showChevron
            onPress={() => openSource(entry)}
          />
        </Fragment>
      ))}
    </Card>
  );

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
            <>
              <View style={styles.filters}>
                {FILTERS.map((option) => (
                  <Chip
                    key={option.value}
                    label={t(option.labelKey)}
                    count={option.value === 'all' ? entries.length : counts[option.value]}
                    selected={filter === option.value}
                    onPress={() => setFilter(option.value)}
                  />
                ))}
              </View>

              {upcoming.length > 0 ? (
                <View style={styles.list}>
                  <SectionLabel label={t('reminders.upcoming')} meta={String(upcoming.length)} />
                  {renderGroup(upcoming)}
                </View>
              ) : null}

              {/* Past-due reminders keep their place rather than vanishing, so a
                  missed one is still findable — just visibly behind. */}
              {past.length > 0 ? (
                <View style={styles.list}>
                  <SectionLabel label={t('reminders.past')} meta={String(past.length)} />
                  <View style={styles.past}>{renderGroup(past)}</View>
                </View>
              ) : null}
            </>
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
  format: TimeFormat,
  t: (key: TranslationKey, values?: Record<string, string | number>) => string
): string {
  if (entry.dailyTime) {
    return t('reminders.everyDayAt', { time: formatTime(entry.dailyTime, language, format) });
  }
  if (!entry.fireAt) return t('reminders.none');

  const day = formatDateHeading(toISODate(entry.fireAt), language, {
    today: t('common.today'),
    yesterday: t('common.yesterday'),
  });

  return `${day} · ${formatClock(entry.fireAt, language, format)}`;
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
    <Card style={styles.notice}>
      {/* Concentric rings around the bell, so a screen the user has to act on
          reads as an invitation rather than as an error banner. */}
      <View style={[styles.noticeHalo, { backgroundColor: theme.warningSoft }]}>
        <View style={[styles.noticeIcon, { backgroundColor: theme.warning }]}>
          <Icon name="notifications-off" size={22} tint={theme.textInverted} />
        </View>
      </View>

      <View style={styles.noticeCopy}>
        <Text variant="heading" align="center">
          {title}
        </Text>
        <Text variant="body" color="textSecondary" align="center">
          {body}
        </Text>
      </View>

      <Button label={action.label} onPress={action.onPress} shape="pill" fullWidth />
    </Card>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: Spacing.lg },
  sections: { gap: Spacing.lg },
  list: { gap: Spacing.sm },
  filters: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  card: { paddingVertical: Spacing.xs, paddingHorizontal: Spacing.lg },
  past: { opacity: 0.5 },
  notice: { gap: Spacing.lg, alignItems: 'center', paddingVertical: Spacing.xl },
  noticeHalo: {
    width: 72,
    height: 72,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noticeIcon: {
    width: 48,
    height: 48,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noticeCopy: { gap: Spacing.xs, maxWidth: 320 },
});
