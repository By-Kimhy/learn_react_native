import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { IconButton } from '@/components/ui/icon-button';
import { Screen } from '@/components/ui/screen';
import { ScreenHeader } from '@/components/ui/screen-header';
import { Text } from '@/components/ui/text';
import { Radius, Spacing } from '@/constants/theme';
import { HabitCard } from '@/features/habits/components/habit-card';
import { completionSet, todayHabitProgress } from '@/features/habits/selectors';
import { useHabits } from '@/features/habits/store';
import { useT } from '@/features/settings/store';
import { useTheme } from '@/hooks/use-theme';

export default function HabitsScreen() {
  const router = useRouter();
  const theme = useTheme();
  const t = useT();
  const { activeHabits, completions, toggleCompletion } = useHabits();

  const progress = useMemo(
    () => todayHabitProgress(activeHabits, completions),
    [activeHabits, completions]
  );

  // One pass over completions instead of one per habit card.
  const datesByHabit = useMemo(() => {
    const map = new Map<string, Set<string>>();
    for (const habit of activeHabits) map.set(habit.id, completionSet(completions, habit.id));
    return map;
  }, [activeHabits, completions]);

  const allDone = progress.total > 0 && progress.done === progress.total;

  return (
    <>
      <ScreenHeader
        title={t('habits.title')}
        onBack={() => router.back()}
        right={
          <IconButton
            name="add"
            accessibilityLabel={t('habits.newHabit')}
            onPress={() => router.push('/habit/new')}
          />
        }
      />

      <Screen contentContainerStyle={styles.content}>
        {activeHabits.length > 0 ? (
          <View style={styles.sections}>
            <Card style={styles.summary}>
              <View style={styles.summaryText}>
                <Text variant="bodyStrong">
                  {allDone
                    ? t('habits.allDone')
                    : t('habits.todayProgress', { done: progress.done, total: progress.total })}
                </Text>
                <View style={[styles.track, { backgroundColor: theme.surfaceAlt }]}>
                  <View
                    style={[
                      styles.fill,
                      {
                        width: `${Math.round((progress.done / progress.total) * 100)}%`,
                        backgroundColor: allDone ? theme.income : theme.primary,
                      },
                    ]}
                  />
                </View>
              </View>
            </Card>

            {activeHabits.map((habit) => (
              <HabitCard
                key={habit.id}
                habit={habit}
                dates={datesByHabit.get(habit.id) ?? new Set()}
                onToggleDay={(date) => toggleCompletion(habit.id, date)}
                onPress={() => router.push(`/habit/${habit.id}`)}
              />
            ))}
          </View>
        ) : (
          <EmptyState
            icon="flame-outline"
            title={t('habits.empty')}
            body={t('habits.emptyBody')}
            action={{
              label: t('habits.createHabit'),
              icon: 'add',
              onPress: () => router.push('/habit/new'),
            }}
          />
        )}
      </Screen>
    </>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: Spacing.lg },
  sections: { gap: Spacing.md },
  summary: { paddingVertical: Spacing.lg },
  summaryText: { gap: Spacing.sm },
  track: { height: 6, borderRadius: Radius.pill, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: Radius.pill },
});
