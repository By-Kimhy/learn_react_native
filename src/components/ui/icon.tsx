import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';

import type { ThemeColor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type IconName = ComponentProps<typeof Ionicons>['name'];

export interface IconProps {
  name: IconName;
  size?: number;
  color?: ThemeColor;
  tint?: string;
}

/**
 * One icon set across the whole app. Going through a wrapper keeps theme
 * colours consistent and makes swapping the set a one-file change.
 */
export function Icon({ name, size = 20, color = 'text', tint }: IconProps) {
  const theme = useTheme();
  return <Ionicons name={name} size={size} color={tint ?? theme[color]} />;
}
