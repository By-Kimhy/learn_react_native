/**
 * LifeHub design system.
 *
 * A single source of truth for colour, spacing, radius and typography so every
 * feature screen looks like part of the same app. Feature code should never
 * hard-code a hex value — pull it from `useTheme()` instead.
 */

import '@/global.css';

import { Platform } from 'react-native';

/**
 * Both schemes share one shape, declared up front so `ThemeColors` is a plain
 * set of colour slots rather than a union of two literal palettes.
 */
export interface ThemeColors {
  background: string;
  surface: string;
  surfaceAlt: string;
  surfaceSunken: string;
  border: string;
  borderStrong: string;

  text: string;
  textSecondary: string;
  textTertiary: string;
  textInverted: string;

  primary: string;
  primarySoft: string;
  onPrimary: string;

  income: string;
  incomeSoft: string;
  expense: string;
  expenseSoft: string;
  warning: string;

  overlay: string;
  shadow: string;
}

const palette: Record<'light' | 'dark', ThemeColors> = {
  light: {
    /** App canvas — intentionally a hair off-white so white cards lift off it. */
    background: '#F5F5F7',
    surface: '#FFFFFF',
    surfaceAlt: '#EFEFF2',
    surfaceSunken: '#E8E8EC',
    border: '#E2E2E7',
    borderStrong: '#CFCFD6',

    text: '#111113',
    textSecondary: '#63666E',
    textTertiary: '#9A9DA5',
    textInverted: '#FFFFFF',

    primary: '#2F6FED',
    primarySoft: '#E8F0FE',
    onPrimary: '#FFFFFF',

    income: '#128A4B',
    incomeSoft: '#E3F5EB',
    expense: '#C8363A',
    expenseSoft: '#FBEAEA',
    warning: '#B26A00',

    overlay: 'rgba(17, 17, 19, 0.35)',
    shadow: '#000000',
  },
  dark: {
    background: '#0C0C0E',
    surface: '#171719',
    surfaceAlt: '#212124',
    surfaceSunken: '#0A0A0B',
    border: '#2A2A2F',
    borderStrong: '#3A3A41',

    text: '#F5F5F7',
    textSecondary: '#A2A5AD',
    textTertiary: '#71747C',
    textInverted: '#111113',

    primary: '#6098FF',
    primarySoft: '#15233F',
    onPrimary: '#0B1220',

    income: '#4ED18B',
    incomeSoft: '#12291E',
    expense: '#F2787C',
    expenseSoft: '#2E1618',
    warning: '#E0A458',

    overlay: 'rgba(0, 0, 0, 0.55)',
    shadow: '#000000',
  },
};

export const Colors = palette;

export type ColorScheme = keyof typeof palette;
export type ThemeColor = keyof ThemeColors;

/** Subtle note backgrounds, Google Keep style. Never loud enough to fight the text. */
export const NoteColors = {
  default: { light: '#FFFFFF', dark: '#171719' },
  coral: { light: '#FAE3E1', dark: '#3A2523' },
  sand: { light: '#FBEEDA', dark: '#39301D' },
  mint: { light: '#DFF2E4', dark: '#1D3327' },
  sky: { light: '#DCEBFA', dark: '#1B2B3C' },
  lavender: { light: '#E7E3F7', dark: '#272338' },
  blush: { light: '#F9E1EE', dark: '#38222F' },
  slate: { light: '#E5E8EC', dark: '#24282D' },
} as const;

export type NoteColorKey = keyof typeof NoteColors;
export const NoteColorKeys = Object.keys(NoteColors) as NoteColorKey[];

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
  xxxl: 40,
} as const;

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 22,
  pill: 999,
} as const;

/** 44pt is the smallest comfortable touch target on both platforms. */
export const MinTouchTarget = 44;

export const Fonts = Platform.select({
  ios: { sans: 'system-ui', rounded: 'ui-rounded', mono: 'ui-monospace' },
  web: { sans: 'var(--font-display)', rounded: 'var(--font-rounded)', mono: 'var(--font-mono)' },
  default: { sans: 'normal', rounded: 'normal', mono: 'monospace' },
})!;

export const Typography = {
  display: { fontSize: 34, lineHeight: 40, fontWeight: '700' },
  title: { fontSize: 26, lineHeight: 32, fontWeight: '700' },
  heading: { fontSize: 20, lineHeight: 26, fontWeight: '700' },
  subheading: { fontSize: 17, lineHeight: 23, fontWeight: '600' },
  body: { fontSize: 15, lineHeight: 21, fontWeight: '400' },
  bodyStrong: { fontSize: 15, lineHeight: 21, fontWeight: '600' },
  caption: { fontSize: 13, lineHeight: 18, fontWeight: '400' },
  captionStrong: { fontSize: 13, lineHeight: 18, fontWeight: '600' },
  overline: { fontSize: 11, lineHeight: 14, fontWeight: '700', letterSpacing: 0.6 },
} as const;

export type TypographyVariant = keyof typeof Typography;

export const MaxContentWidth = 720;
