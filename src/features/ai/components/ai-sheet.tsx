import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Button } from '@/components/ui/button';
import { Divider } from '@/components/ui/divider';
import { EmptyState } from '@/components/ui/empty-state';
import { Icon } from '@/components/ui/icon';
import { ListRow } from '@/components/ui/list-row';
import { Text } from '@/components/ui/text';
import { Radius, Spacing } from '@/constants/theme';
import { useEvents } from '@/features/calendar/store';
import { usePreferences, useT } from '@/features/settings/store';
import { useTasks } from '@/features/tasks/store';
import { useTheme } from '@/hooks/use-theme';
import { formatMediumDate, fromISODate } from '@/lib/date';
import type { TranslationKey } from '@/lib/i18n';
import type { ISODate, Priority } from '@/types';

import { AIError, analyzeNote } from '../client';
import { useAPIKey } from '../key-store';
import type { NoteAnalysis } from '../schema';

/** Maps the client's failure kinds onto the message the user actually sees. */
const ERROR_COPY: Record<string, TranslationKey> = {
  offline: 'ai.offlineTitle',
  'no-key': 'ai.noKeyTitle',
  auth: 'ai.authError',
  'rate-limit': 'ai.rateLimited',
  empty: 'ai.emptyNote',
  unknown: 'ai.genericError',
};

export interface AISheetProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  body: string;
  onApplyTitle: (title: string) => void;
}

type Status = 'idle' | 'loading' | 'done' | 'error';

export function AISheet({ visible, onClose, title, body, onApplyTitle }: AISheetProps) {
  const theme = useTheme();
  const t = useT();
  const router = useRouter();
  const { preferences } = usePreferences();
  const { apiKey, supported } = useAPIKey();
  const { addTask } = useTasks();
  const { addEvent } = useEvents();

  const [status, setStatus] = useState<Status>('idle');
  const [analysis, setAnalysis] = useState<NoteAnalysis | null>(null);
  const [errorKind, setErrorKind] = useState<string>('unknown');
  /** Ids of suggestions already applied, so buttons can't be double-tapped. */
  const [applied, setApplied] = useState<Set<string>>(new Set());

  const markApplied = (key: string) =>
    setApplied((current) => new Set(current).add(key));

  const run = async () => {
    setStatus('loading');
    setApplied(new Set());

    try {
      const result = await analyzeNote({ apiKey: apiKey ?? '', title, body });
      setAnalysis(result);
      setStatus('done');
    } catch (error) {
      setErrorKind(error instanceof AIError ? error.kind : 'unknown');
      setStatus('error');
    }
  };

  const close = () => {
    onClose();
    // Reset so reopening starts fresh rather than showing a stale analysis.
    setStatus('idle');
    setAnalysis(null);
  };

  const addOneTask = (task: NoteAnalysis['tasks'][number], key: string) => {
    addTask({
      title: task.title,
      dueDate: (task.dueDate as ISODate | null) ?? undefined,
      priority: task.priority as Priority,
    });
    markApplied(key);
  };

  const addAllTasks = () => {
    analysis?.tasks.forEach((task, index) => {
      if (applied.has(`task-${index}`)) return;
      addOneTask(task, `task-${index}`);
    });
  };

  const addOneEvent = (event: NoteAnalysis['events'][number], key: string) => {
    addEvent({
      title: event.title,
      date: event.date as ISODate,
      time: event.time ?? undefined,
      repeat: 'none',
      // Detected events get a reminder at the time by default — the whole point
      // of pulling an event out of a note is not to forget it.
      reminderMinutesBefore: event.time ? 0 : undefined,
    });
    markApplied(key);
  };

  const hasFindings =
    analysis !== null && (analysis.tasks.length > 0 || analysis.events.length > 0);

  return (
    <BottomSheet visible={visible} onClose={close} title={`✨ ${t('ai.title')}`}>
      <View style={styles.sheet}>
        {!supported ? (
          <EmptyState icon="sparkles-outline" title={t('ai.unsupported')} compact />
        ) : !apiKey ? (
          <EmptyState
            icon="key-outline"
            title={t('ai.noKeyTitle')}
            body={t('ai.noKeyBody')}
            action={{
              label: t('ai.openSettings'),
              icon: 'settings-outline',
              onPress: () => {
                close();
                router.push('/settings');
              },
            }}
            compact
          />
        ) : status === 'idle' ? (
          <View style={styles.intro}>
            <Text variant="body" color="textSecondary">
              {t('ai.costNote')}
            </Text>
            <Button label={t('ai.analyse')} icon="sparkles" onPress={run} fullWidth />
          </View>
        ) : status === 'loading' ? (
          <View style={styles.loading}>
            <ActivityIndicator color={theme.primary} />
            <Text variant="body" color="textSecondary">
              {t('ai.analysing')}
            </Text>
          </View>
        ) : status === 'error' ? (
          <View style={styles.intro}>
            <EmptyState
              icon={errorKind === 'offline' ? 'cloud-offline-outline' : 'alert-circle-outline'}
              title={t(ERROR_COPY[errorKind] ?? 'ai.genericError')}
              body={errorKind === 'offline' ? t('ai.offlineBody') : undefined}
              compact
            />
            <Button label={t('ai.retry')} icon="refresh" variant="secondary" onPress={run} fullWidth />
          </View>
        ) : analysis ? (
          <View style={styles.results}>
            {analysis.summary.trim() ? (
              <View style={styles.block}>
                <Text variant="overline" color="textSecondary">
                  {t('ai.summary').toUpperCase()}
                </Text>
                <View style={[styles.summaryBox, { backgroundColor: theme.surfaceAlt }]}>
                  <Text variant="body">{analysis.summary}</Text>
                </View>
              </View>
            ) : null}

            {analysis.title.trim() ? (
              <View style={styles.block}>
                <Text variant="overline" color="textSecondary">
                  {t('ai.suggestedTitle').toUpperCase()}
                </Text>
                <ListRow
                  title={analysis.title}
                  icon="text-outline"
                  right={
                    applied.has('title') ? (
                      <Icon name="checkmark-circle" size={20} color="income" />
                    ) : (
                      <Button
                        label={t('ai.useTitle')}
                        variant="secondary"
                        onPress={() => {
                          onApplyTitle(analysis.title);
                          markApplied('title');
                        }}
                      />
                    )
                  }
                />
              </View>
            ) : null}

            {analysis.tasks.length > 0 ? (
              <View style={styles.block}>
                <View style={styles.blockHeader}>
                  <Text variant="overline" color="textSecondary">
                    {t('ai.tasksFound').toUpperCase()}
                  </Text>
                  <Button
                    label={t('ai.addAllTasks')}
                    variant="ghost"
                    onPress={addAllTasks}
                  />
                </View>

                {analysis.tasks.map((task, index) => {
                  const key = `task-${index}`;
                  const done = applied.has(key);

                  return (
                    <View key={key}>
                      {index > 0 ? <Divider /> : null}
                      <ListRow
                        title={task.title}
                        subtitle={
                          task.dueDate
                            ? formatMediumDate(fromISODate(task.dueDate), preferences.language)
                            : undefined
                        }
                        icon="checkbox-outline"
                        right={
                          done ? (
                            <Icon name="checkmark-circle" size={20} color="income" />
                          ) : (
                            <Button
                              label={t('ai.addTask')}
                              variant="secondary"
                              onPress={() => addOneTask(task, key)}
                            />
                          )
                        }
                      />
                    </View>
                  );
                })}
              </View>
            ) : null}

            {analysis.events.length > 0 ? (
              <View style={styles.block}>
                <Text variant="overline" color="textSecondary">
                  {t('ai.eventsFound').toUpperCase()}
                </Text>

                {analysis.events.map((event, index) => {
                  const key = `event-${index}`;
                  const done = applied.has(key);

                  return (
                    <View key={key}>
                      {index > 0 ? <Divider /> : null}
                      <ListRow
                        title={event.title}
                        subtitle={[
                          formatMediumDate(fromISODate(event.date), preferences.language),
                          event.time,
                        ]
                          .filter(Boolean)
                          .join(' · ')}
                        icon="calendar-outline"
                        right={
                          done ? (
                            <Icon name="checkmark-circle" size={20} color="income" />
                          ) : (
                            <Button
                              label={t('ai.addEvent')}
                              variant="secondary"
                              onPress={() => addOneEvent(event, key)}
                            />
                          )
                        }
                      />
                    </View>
                  );
                })}
              </View>
            ) : null}

            {!hasFindings && !analysis.summary.trim() ? (
              <EmptyState
                icon="sparkles-outline"
                title={t('ai.nothingFound')}
                body={t('ai.nothingFoundBody')}
                compact
              />
            ) : null}
          </View>
        ) : null}
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  sheet: { paddingBottom: Spacing.sm },
  intro: { gap: Spacing.lg },
  loading: { alignItems: 'center', gap: Spacing.md, paddingVertical: Spacing.xxl },
  results: { gap: Spacing.xl },
  block: { gap: Spacing.sm },
  blockHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  summaryBox: { padding: Spacing.lg, borderRadius: Radius.md },
});
