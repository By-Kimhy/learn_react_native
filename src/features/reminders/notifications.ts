import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

/**
 * Everything that touches the OS notification APIs lives here, so the rest of
 * the app deals only in "give me an id" / "cancel this id".
 *
 * Phase 1 shipped without notifications, so every call is defensive: if the
 * user declines permission, or the platform refuses, scheduling returns
 * `undefined` and the feature that asked carries on unharmed.
 */

/**
 * A channel's importance and sound are fixed once Android has seen it — an app
 * may only lower importance afterwards. Changing either means publishing a new
 * channel id and retiring the old ones.
 */
const ANDROID_CHANNEL_ID = 'lifehub-reminders-v3';
const LEGACY_ANDROID_CHANNEL_IDS = ['lifehub-reminders', 'lifehub-reminders-v2'];

/** Bundled by the expo-notifications config plugin; referenced by bare filename. */
const ALARM_SOUND = 'reminder_alarm.wav';

/** Banners while the app is foregrounded — a reminder is useless if it's silent. */
export function configureNotificationHandler(): void {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

/** Android needs an explicit channel or scheduled notifications never appear. */
export async function ensureAndroidChannel(): Promise<void> {
  if (Platform.OS !== 'android') return;

  try {
    for (const legacy of LEGACY_ANDROID_CHANNEL_IDS) {
      await Notifications.deleteNotificationChannelAsync(legacy);
    }

    await Notifications.setNotificationChannelAsync(ANDROID_CHANNEL_ID, {
      name: 'Reminders',
      importance: Notifications.AndroidImportance.MAX,
      // Its own tone, so a reminder is never mistaken for a chat message.
      sound: ALARM_SOUND,
      // Alarm usage moves it onto the alarm volume stream: it still sounds when
      // the ringer is silenced, and it is loud enough to act on.
      audioAttributes: {
        usage: Notifications.AndroidAudioUsage.ALARM,
        contentType: Notifications.AndroidAudioContentType.SONIFICATION,
        flags: { enforceAudibility: true, requestHardwareAudioVideoSynchronization: false },
      },
      // Only takes effect once the user grants LifeHub Do Not Disturb access;
      // Android ignores it otherwise, which is a fine default.
      bypassDnd: true,
      enableVibrate: true,
      vibrationPattern: [0, 600, 300, 600, 300, 600],
    });
  } catch (error) {
    console.warn('[notifications] could not create the Android channel', error);
  }
}

export async function getPermissionStatus(): Promise<Notifications.PermissionStatus | null> {
  try {
    const { status } = await Notifications.getPermissionsAsync();
    return status;
  } catch {
    return null;
  }
}

/** Asks only when not already decided, so we never nag on every save. */
export async function ensurePermission(): Promise<boolean> {
  try {
    const current = await Notifications.getPermissionsAsync();
    if (current.granted) return true;
    if (!current.canAskAgain) return false;

    const next = await Notifications.requestPermissionsAsync({
      ios: { allowAlert: true, allowBadge: false, allowSound: true },
    });
    return next.granted;
  } catch (error) {
    console.warn('[notifications] permission request failed', error);
    return false;
  }
}

export interface ScheduleOnceParams {
  title: string;
  body?: string;
  fireAt: Date;
  data?: Record<string, unknown>;
}

/** One-shot notification at an absolute time. Returns the id to store. */
export async function scheduleOnce({
  title,
  body,
  fireAt,
  data,
}: ScheduleOnceParams): Promise<string | undefined> {
  // A trigger in the past fires immediately on some platforms, which would
  // ambush the user with a reminder for something already gone.
  if (fireAt.getTime() <= Date.now()) return undefined;

  try {
    return await Notifications.scheduleNotificationAsync({
      content: { title, body, data, sound: true },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: fireAt,
        channelId: ANDROID_CHANNEL_ID,
      },
    });
  } catch (error) {
    console.warn('[notifications] could not schedule', error);
    return undefined;
  }
}

export interface ScheduleDailyParams {
  title: string;
  body?: string;
  hour: number;
  minute: number;
  data?: Record<string, unknown>;
}

/** Repeating daily notification — used by habit reminders. */
export async function scheduleDaily({
  title,
  body,
  hour,
  minute,
  data,
}: ScheduleDailyParams): Promise<string | undefined> {
  try {
    return await Notifications.scheduleNotificationAsync({
      content: { title, body, data, sound: true },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour,
        minute,
        channelId: ANDROID_CHANNEL_ID,
      },
    });
  } catch (error) {
    console.warn('[notifications] could not schedule the daily reminder', error);
    return undefined;
  }
}

export async function cancel(notificationId: string | undefined): Promise<void> {
  if (!notificationId) return;
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  } catch {
    // Already fired or already cancelled — nothing to clean up.
  }
}

export async function cancelAll(): Promise<void> {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (error) {
    console.warn('[notifications] could not cancel scheduled notifications', error);
  }
}
