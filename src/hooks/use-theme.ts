import { useColorScheme as useSystemColorScheme } from 'react-native';

import { Colors, NoteColors, type ColorScheme, type NoteColorKey, type ThemeColors } from '@/constants/theme';
import { usePreferences } from '@/features/settings/store';

/**
 * The scheme actually in effect: the user's explicit choice, or the system's
 * when they've left it on "System".
 */
export function useColorScheme(): ColorScheme {
  const system = useSystemColorScheme();
  const { preferences } = usePreferences();

  if (preferences.appearance === 'system') return system === 'dark' ? 'dark' : 'light';
  return preferences.appearance;
}

export function useTheme(): ThemeColors {
  return Colors[useColorScheme()];
}

/** Resolves a note's stored colour key against the active scheme. */
export function useNoteColor(key: string): string {
  const scheme = useColorScheme();
  const entry = NoteColors[key as NoteColorKey] ?? NoteColors.default;
  return entry[scheme];
}
