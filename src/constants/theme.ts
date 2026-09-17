/**
 * LifeHub design system.
 *
 * A single source of truth for colour, spacing, radius and typography so every
 * feature screen looks like part of the same app. Feature code should never
 * hard-code a hex value — pull it from `useTheme()` or `useAccent()` instead.
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
  warningSoft: string;

  /**
   * Chrome that floats over content — the tab bar, app bars, sheets. `glass` is
   * the fill used when real Liquid Glass isn't available, so it is deliberately
   * near-opaque; `glassHighlight` is the specular top edge that sells the
   * material, and `glassBorder` the hairline that contains it.
   */
  glass: string;
  glassBorder: string;
  glassHighlight: string;

  /** A neutral wash for chips laid over a coloured surface, e.g. a note card. */
  tintOverlay: string;

  overlay: string;
  shadow: string;
}

const palette: Record<'light' | 'dark', ThemeColors> = {
  light: {
    /** App canvas — intentionally a hair off-white so white cards lift off it. */
    background: '#F4F5F7',
    surface: '#FFFFFF',
    surfaceAlt: '#EFF0F3',
    surfaceSunken: '#E7E9ED',
    border: '#E8E9ED',
    borderStrong: '#CFD2DA',

    text: '#0E1116',
    textSecondary: '#6A6F7A',
    textTertiary: '#9CA1AC',
    textInverted: '#FFFFFF',

    primary: '#2F6FED',
    primarySoft: '#E3ECFE',
    onPrimary: '#FFFFFF',

    income: '#0E9C63',
    incomeSoft: '#DEF5E8',
    expense: '#E03A4E',
    expenseSoft: '#FDE8EB',
    warning: '#D97706',
    warningSoft: '#FDF0D5',

    glass: 'rgba(252, 252, 253, 0.82)',
    glassBorder: 'rgba(14, 17, 22, 0.06)',
    glassHighlight: 'rgba(255, 255, 255, 0.9)',

    tintOverlay: 'rgba(14, 17, 22, 0.06)',

    overlay: 'rgba(14, 17, 22, 0.32)',
    shadow: '#0E1116',
  },
  dark: {
    background: '#0B0C0E',
    surface: '#17181B',
    surfaceAlt: '#212328',
    surfaceSunken: '#09090B',
    border: '#2A2C31',
    borderStrong: '#3B3E45',

    text: '#F4F5F7',
    textSecondary: '#A1A6B0',
    textTertiary: '#71757E',
    textInverted: '#0E1116',

    primary: '#5C93FF',
    primarySoft: '#16233D',
    onPrimary: '#06122A',

    income: '#3FD08A',
    incomeSoft: '#0F2A1E',
    expense: '#FF7080',
    expenseSoft: '#2E1519',
    warning: '#E9A73F',
    warningSoft: '#2C2112',

    glass: 'rgba(24, 25, 29, 0.82)',
    glassBorder: 'rgba(255, 255, 255, 0.10)',
    glassHighlight: 'rgba(255, 255, 255, 0.16)',

    tintOverlay: 'rgba(255, 255, 255, 0.09)',

    overlay: 'rgba(0, 0, 0, 0.55)',
    shadow: '#000000',
  },
};

export const Colors = palette;

export type ColorScheme = keyof typeof palette;
export type ThemeColor = keyof ThemeColors;

/**
 * Tinted icon badges — the rounded squares and circles behind every category,
 * menu entry and reminder source. `soft` is the fill, `tint` the glyph, and the
 * pair is contrast-checked in both schemes so either can be read on the other.
 */
export const Accents = {
  light: {
    blue: { soft: '#E3ECFE', tint: '#2F6FED' },
    indigo: { soft: '#E7E6FD', tint: '#5B54D6' },
    purple: { soft: '#F1E6FD', tint: '#8B46D9' },
    pink: { soft: '#FCE4F0', tint: '#D63C87' },
    red: { soft: '#FDE5E7', tint: '#DC3B45' },
    orange: { soft: '#FDEADA', tint: '#C2601A' },
    amber: { soft: '#FBF0D4', tint: '#A57708' },
    green: { soft: '#DEF5E8', tint: '#0E9C63' },
    teal: { soft: '#D8F3F0', tint: '#0D8B82' },
    cyan: { soft: '#DCEFFA', tint: '#0E7FA8' },
    grey: { soft: '#EDEEF1', tint: '#6A6F7A' },
  },
  dark: {
    blue: { soft: '#16233D', tint: '#5C93FF' },
    indigo: { soft: '#1E1D3A', tint: '#8C86FF' },
    purple: { soft: '#271A3A', tint: '#BD86FF' },
    pink: { soft: '#331B28', tint: '#FF7FC0' },
    red: { soft: '#331519', tint: '#FF7080' },
    orange: { soft: '#2E1D10', tint: '#F09250' },
    amber: { soft: '#2C2112', tint: '#E9A73F' },
    green: { soft: '#0F2A1E', tint: '#3FD08A' },
    teal: { soft: '#0D2724', tint: '#3ECFC3' },
    cyan: { soft: '#0D242F', tint: '#4BB8E4' },
    grey: { soft: '#212328', tint: '#A1A6B0' },
  },
} as const;

export type AccentName = keyof (typeof Accents)['light'];
export interface Accent {
  soft: string;
  tint: string;
}

/** Subtle note backgrounds, Google Keep style. Never loud enough to fight the text. */
export const NoteColors = {
  default: { light: '#FFFFFF', dark: '#17181B' },
  coral: { light: '#FCE6E2', dark: '#3A2523' },
  sand: { light: '#F7F0E2', dark: '#39301D' },
  mint: { light: '#DFF3E6', dark: '#1D3327' },
  sky: { light: '#DDEBFA', dark: '#1B2B3C' },
  lavender: { light: '#EAE4FA', dark: '#272338' },
  blush: { light: '#FBE3EF', dark: '#38222F' },
  slate: { light: '#E5E8EE', dark: '#24282D' },
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

/**
 * Corners nest: a tile inside a card uses the step below its parent, so the
 * curves stay concentric instead of drifting apart at the corner.
 */
export const Radius = {
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 26,
  pill: 999,
} as const;

/** 44pt is the smallest comfortable touch target on both platforms. */
export const MinTouchTarget = 44;

/**
 * Shadows are cast in one colour whatever the scheme — dark mode drops their
 * opacity to zero rather than recolouring them. Exported as a constant so
 * `StyleSheet.create`, which cannot read the theme, still has no bare hex.
 */
export const ShadowColor = '#0E1116';

/** Height of the floating tab bar pill, excluding its bottom inset. */
export const TabBarHeight = 64;

export const Fonts = Platform.select({
  ios: { sans: 'system-ui', rounded: 'ui-rounded', mono: 'ui-monospace' },
  web: { sans: 'var(--font-display)', rounded: 'var(--font-rounded)', mono: 'var(--font-mono)' },
  default: { sans: 'normal', rounded: 'normal', mono: 'monospace' },
})!;

export const Typography = {
  display: { fontSize: 34, lineHeight: 40, fontWeight: '800' },
  title: { fontSize: 28, lineHeight: 34, fontWeight: '800' },
  heading: { fontSize: 20, lineHeight: 26, fontWeight: '700' },
  subheading: { fontSize: 17, lineHeight: 23, fontWeight: '600' },
  body: { fontSize: 15, lineHeight: 21, fontWeight: '400' },
  bodyStrong: { fontSize: 15, lineHeight: 21, fontWeight: '600' },
  caption: { fontSize: 13, lineHeight: 18, fontWeight: '400' },
  captionStrong: { fontSize: 13, lineHeight: 18, fontWeight: '600' },
  overline: { fontSize: 11, lineHeight: 14, fontWeight: '700', letterSpacing: 0.8 },
  /** Money. Tabular by default so digits don't shift as amounts change. */
  amount: { fontSize: 32, lineHeight: 38, fontWeight: '800' },
  amountLarge: { fontSize: 42, lineHeight: 50, fontWeight: '800' },
} as const;

export type TypographyVariant = keyof typeof Typography;

export const MaxContentWidth = 720;
