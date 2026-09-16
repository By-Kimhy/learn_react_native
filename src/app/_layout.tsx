import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import { Stack } from 'expo-router/stack';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import * as SystemUI from 'expo-system-ui';
import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { APIKeyProvider } from '@/features/ai/key-store';
import { EventsProvider, useEvents } from '@/features/calendar/store';
import { HabitsProvider, useHabits } from '@/features/habits/store';
import { LinksProvider, useLinks } from '@/features/links/store';
import { TransactionsProvider, useTransactions } from '@/features/money/store';
import { NotesProvider, useNotes } from '@/features/notes/store';
import {
  configureNotificationHandler,
  ensureAndroidChannel,
} from '@/features/reminders/notifications';
import { QRProvider, useQRCodes } from '@/features/qr/store';
import { PreferencesProvider, usePreferences } from '@/features/settings/store';
import { TasksProvider, useTasks } from '@/features/tasks/store';
import { useColorScheme, useTheme } from '@/hooks/use-theme';
import { DataVersionProvider } from '@/store/data-version';

SplashScreen.preventAutoHideAsync();

// Module scope: the handler is global to the process, not to any one screen.
configureNotificationHandler();

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <DataVersionProvider>
        <PreferencesProvider>
          <TransactionsProvider>
            <NotesProvider>
              <TasksProvider>
                <HabitsProvider>
                  <EventsProvider>
                    <LinksProvider>
                      <QRProvider>
                        <APIKeyProvider>
                          <AppShell />
                        </APIKeyProvider>
                      </QRProvider>
                    </LinksProvider>
                  </EventsProvider>
                </HabitsProvider>
              </TasksProvider>
            </NotesProvider>
          </TransactionsProvider>
        </PreferencesProvider>
      </DataVersionProvider>
    </GestureHandlerRootView>
  );
}

/**
 * Split from the providers so it can read them: it holds the splash screen
 * until every store has hydrated, which avoids a flash of empty dashboards.
 */
function AppShell() {
  const scheme = useColorScheme();
  const theme = useTheme();
  const { ready: preferencesReady } = usePreferences();
  const { ready: transactionsReady } = useTransactions();
  const { ready: notesReady } = useNotes();
  const { ready: tasksReady } = useTasks();
  const { ready: habitsReady } = useHabits();
  const { ready: eventsReady } = useEvents();
  const { ready: linksReady } = useLinks();
  const { ready: qrReady } = useQRCodes();

  const ready =
    preferencesReady &&
    transactionsReady &&
    notesReady &&
    tasksReady &&
    habitsReady &&
    eventsReady &&
    linksReady &&
    qrReady;

  useEffect(() => {
    if (ready) SplashScreen.hideAsync();
  }, [ready]);

  useEffect(() => {
    ensureAndroidChannel();
  }, []);

  useEffect(() => {
    SystemUI.setBackgroundColorAsync(theme.background);
  }, [theme.background]);

  const navigationTheme = scheme === 'dark' ? DarkTheme : DefaultTheme;

  return (
    <ThemeProvider
      value={{
        ...navigationTheme,
        colors: {
          ...navigationTheme.colors,
          background: theme.background,
          card: theme.surface,
          text: theme.text,
          border: theme.border,
          primary: theme.primary,
        },
      }}>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />

      <Stack
        screenOptions={{
          // Every screen draws its own <ScreenHeader> so modals and pushed
          // screens look the same on iOS and Android.
          headerShown: false,
          contentStyle: { backgroundColor: theme.background },
        }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="transaction/new" options={{ presentation: 'modal' }} />
        <Stack.Screen name="transaction/[id]" options={{ presentation: 'modal' }} />
        <Stack.Screen name="note/[id]" options={{ presentation: 'modal' }} />
        <Stack.Screen name="task/[id]" options={{ presentation: 'modal' }} />
        <Stack.Screen name="habit/[id]" options={{ presentation: 'modal' }} />
        <Stack.Screen name="event/[id]" options={{ presentation: 'modal' }} />
        <Stack.Screen name="link/[id]" options={{ presentation: 'modal' }} />
        <Stack.Screen name="settings" />
        <Stack.Screen name="tasks" />
        <Stack.Screen name="habits" />
        <Stack.Screen name="calendar" />
        <Stack.Screen name="reminders" />
        <Stack.Screen name="links" />
        <Stack.Screen name="qr" />
        <Stack.Screen name="qr/scan" />
        <Stack.Screen name="transactions" />
        <Stack.Screen name="statistics" />
        <Stack.Screen name="archive" />
      </Stack>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
