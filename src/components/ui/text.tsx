import { StyleSheet, Text as RNText, type TextProps as RNTextProps, type TextStyle } from 'react-native';

import { Typography, type ThemeColor, type TypographyVariant } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export interface TextProps extends RNTextProps {
  variant?: TypographyVariant;
  color?: ThemeColor;
  /** Escape hatch for values that aren't theme tokens, e.g. a note's colour. */
  tint?: string;
  align?: TextStyle['textAlign'];
}

export function Text({
  variant = 'body',
  color = 'text',
  tint,
  align,
  style,
  ...rest
}: TextProps) {
  const theme = useTheme();

  return (
    <RNText
      style={[
        Typography[variant] as TextStyle,
        { color: tint ?? theme[color] },
        align ? { textAlign: align } : null,
        style,
      ]}
      {...rest}
    />
  );
}

/** Used for numbers that change often, so digits don't shift horizontally. */
export const tabularNumbers = StyleSheet.create({
  style: { fontVariant: ['tabular-nums'] },
}).style;
