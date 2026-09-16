import { useRouter } from 'expo-router';
import { Fragment, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Card } from '@/components/ui/card';
import { Divider } from '@/components/ui/divider';
import { EmptyState } from '@/components/ui/empty-state';
import { IconButton } from '@/components/ui/icon-button';
import { Screen } from '@/components/ui/screen';
import { ScreenHeader } from '@/components/ui/screen-header';
import { Text } from '@/components/ui/text';
import { Spacing } from '@/constants/theme';
import { EventRow } from '@/features/calendar/components/event-row';
import { MonthGrid } from '@/features/calendar/components/month-grid';
import { daysWithEvents, eventsOn, monthGrid } from '@/features/calendar/selectors';
import { useEvents } from '@/features/calendar/store';
import { usePreferences, useT } from '@/features/settings/store';
import { addMonths, currentMonthKey, formatDateHeading, monthKey, formatMonth, todayISO } from '@/lib/date';

export default function CalendarScreen() {
  const router = useRouter();
  const t = useT();
  const { preferences } = usePreferences();
  const { events } = useEvents();

  const [selected, setSelected] = useState(todayISO());
  const [month, setMonth] = useState(currentMonthKey());

  const cells = useMemo(() => {
    const first = `${month}-01`;
    const [year, monthNumber] = month.split('-').map(Number);
    const lastDay = new Date(year, monthNumber, 0).getDate();
    // The grid bleeds into neighbouring months, so scan a week either side.
    const withEvents = daysWithEvents(events, shift(first, -7), shift(`${month}-${lastDay}`, 7));
    return monthGrid(month, withEvents);
  }, [events, month]);

  const dayEvents = useMemo(() => eventsOn(events, selected), [events, selected]);

  const selectDate = (date: string) => {
    setSelected(date);
    // Tapping a bleed-through day should follow it into its own month.
    if (monthKey(date) !== month) setMonth(monthKey(date));
  };

  return (
    <>
      <ScreenHeader
        title={t('calendar.title')}
        onBack={() => router.back()}
        right={
          <IconButton
            name="add"
            accessibilityLabel={t('calendar.newEvent')}
            onPress={() => router.push(`/event/new?date=${selected}`)}
          />
        }
      />

      <Screen contentContainerStyle={styles.content}>
        <View style={styles.sections}>
          <Card style={styles.calendarCard}>
            <View style={styles.monthBar}>
              <IconButton
                name="chevron-back"
                accessibilityLabel={t('common.previousMonth')}
                onPress={() => setMonth((current) => addMonths(current, -1))}
              />
              <Text variant="subheading" align="center" style={styles.monthLabel}>
                {formatMonth(month, preferences.language)}
              </Text>
              <IconButton
                name="chevron-forward"
                accessibilityLabel={t('common.nextMonth')}
                onPress={() => setMonth((current) => addMonths(current, 1))}
              />
            </View>

            <MonthGrid cells={cells} selected={selected} onSelect={selectDate} />
          </Card>

          <View style={styles.dayHeader}>
            <Text variant="heading">
              {formatDateHeading(selected, preferences.language, {
                today: t('common.today'),
                yesterday: t('common.yesterday'),
              })}
            </Text>
            {dayEvents.length > 0 ? (
              <Text variant="caption" color="textSecondary">
                {t('calendar.eventsCount', { count: dayEvents.length })}
              </Text>
            ) : null}
          </View>

          {dayEvents.length > 0 ? (
            <Card style={styles.eventsCard}>
              {dayEvents.map((occurrence, index) => (
                <Fragment key={`${occurrence.event.id}-${occurrence.date}`}>
                  {index > 0 ? <Divider inset={74} /> : null}
                  <EventRow
                    event={occurrence.event}
                    isRepeat={occurrence.isRepeat}
                    onPress={() => router.push(`/event/${occurrence.event.id}`)}
                  />
                </Fragment>
              ))}
            </Card>
          ) : (
            <Card padded={false}>
              <EmptyState
                icon="calendar-outline"
                title={t('calendar.noEvents')}
                body={t('calendar.noEventsBody')}
                action={{
                  label: t('calendar.createEvent'),
                  icon: 'add',
                  onPress: () => router.push(`/event/new?date=${selected}`),
                }}
                compact
              />
            </Card>
          )}
        </View>
      </Screen>
    </>
  );
}

/** Shifts a `YYYY-MM-DD` string by whole days, staying in local time. */
function shift(iso: string, days: number): string {
  const [year, month, day] = iso.split('-').map(Number);
  const date = new Date(year, month - 1, day + days);
  return `${date.getFullYear()}-${`${date.getMonth() + 1}`.padStart(2, '0')}-${`${date.getDate()}`.padStart(2, '0')}`;
}

const styles = StyleSheet.create({
  content: { paddingTop: Spacing.lg },
  sections: { gap: Spacing.lg },
  calendarCard: { gap: Spacing.sm, paddingHorizontal: Spacing.sm, paddingVertical: Spacing.md },
  monthBar: { flexDirection: 'row', alignItems: 'center' },
  monthLabel: { flex: 1 },
  dayHeader: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', gap: Spacing.md },
  eventsCard: { paddingVertical: Spacing.xs, paddingHorizontal: Spacing.lg },
});
