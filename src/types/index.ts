import type { TranslationKey } from '@/lib/i18n/en';

/**
 * Core LifeHub entities.
 *
 * Every entity carries a string `id` plus ISO `createdAt`/`updatedAt` stamps so
 * the same shapes can be pushed to a backend later without a migration.
 */

export type Currency = 'USD' | 'KHR';

export type ISODateTime = string;
/** Calendar day, `YYYY-MM-DD`, always local to the user. */
export type ISODate = string;

export interface Entity {
  id: string;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
}

/* ------------------------------------------------------------------ money */

export type TransactionType = 'income' | 'expense';

export interface Transaction extends Entity {
  type: TransactionType;
  /** Exactly what the user typed, in the currency they typed it in. */
  amount: number;
  currency: Currency;
  /** Rate in effect when the transaction was saved (KHR per 1 USD). */
  exchangeRate: number;
  convertedAmount: number;
  convertedCurrency: Currency;
  categoryId: string;
  note?: string;
  date: ISODate;
}

export interface Category {
  id: string;
  /** Looked up per-locale, so category names translate with the rest of the UI. */
  labelKey: TranslationKey;
  emoji: string;
  type: TransactionType;
}

/* ------------------------------------------------------------------ notes */

export type NoteType = 'text' | 'checklist';

export interface ChecklistItem {
  id: string;
  text: string;
  done: boolean;
}

export interface Note extends Entity {
  type: NoteType;
  title: string;
  body: string;
  checklist: ChecklistItem[];
  color: string;
  labels: string[];
  pinned: boolean;
  archived: boolean;
  /** Phase 2 wires this into local notifications. */
  reminderAt?: ISODateTime;
}

export interface Label {
  id: string;
  name: string;
}

/* ------------------------------------------------- preferences & settings */

export type AppearancePreference = 'light' | 'dark' | 'system';
export type LanguageCode = 'en' | 'km';

export interface UserPreferences {
  displayCurrency: Currency;
  exchangeRate: number;
  appearance: AppearancePreference;
  language: LanguageCode;
  notificationsEnabled: boolean;
}

/* --------------------------------------------------------------- tasks */

export type Priority = 'low' | 'medium' | 'high';

export interface Task extends Entity {
  title: string;
  description?: string;
  dueDate?: ISODate;
  priority: Priority;
  /** When the local notification should fire. */
  reminderAt?: ISODateTime;
  /** Handle for the scheduled notification, so it can be cancelled or moved. */
  notificationId?: string;
  completed: boolean;
  completedAt?: ISODateTime;
}

/* -------------------------------------------------------------- habits */

export type HabitFrequency = 'daily' | 'weekly';

export interface Habit extends Entity {
  name: string;
  emoji: string;
  frequency: HabitFrequency;
  /** For weekly habits: how many days a week counts as done. */
  timesPerWeek: number;
  /** Local time of day, `HH:mm`. */
  reminderTime?: string;
  notificationId?: string;
  archived: boolean;
}

export interface HabitCompletion {
  id: string;
  habitId: string;
  date: ISODate;
  createdAt: ISODateTime;
}

/* ------------------------------------------------ calendar & reminders */

export type RepeatRule = 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';

/** Minutes before the event that the reminder fires. 0 means "at event time". */
export type ReminderOffset = 0 | 5 | 15 | 30 | 60 | 1440;

export const ReminderOffsets: ReminderOffset[] = [0, 5, 15, 30, 60, 1440];

export interface CalendarEvent extends Entity {
  title: string;
  date: ISODate;
  /** Local time, `HH:mm`. Absent means an all-day event. */
  time?: string;
  description?: string;
  reminderMinutesBefore?: ReminderOffset;
  notificationId?: string;
  repeat: RepeatRule;
}

/* ------------------------------------------------------- links & QR */

export interface Link extends Entity {
  title: string;
  url: string;
  /** Free-text grouping, e.g. "Work" or "Study". Empty means uncategorised. */
  category: string;
  note?: string;
  favorite: boolean;
}

export type QRKind = 'generated' | 'scanned';

export interface QRCode extends Entity {
  /** The encoded payload — a URL or arbitrary text. */
  value: string;
  kind: QRKind;
  /** Barcode symbology reported by the scanner, e.g. "qr". */
  format?: string;
}
