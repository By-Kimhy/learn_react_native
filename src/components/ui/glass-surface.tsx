import { GlassView, isLiquidGlassAvailable } from 'expo-glass-effect';
import { useEffect, useState, type ReactNode } from 'react';
import {
  AccessibilityInfo,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { useColorScheme, useTheme } from '@/hooks/use-theme';

/**
 * Real Liquid Glass exists only on iOS 26 and up. Everywhere else — Android,
 * older iOS, web — `GlassView` renders a plain transparent `View`, so a
 * transparent fallback would be an invisible tab bar rather than a degraded
 * one. This component therefore decides between two designed surfaces rather
 * than letting the platform decide for us.
 */
function useGlassAvailable(): boolean {
  const [reduceTransparency, setReduceTransparency] = useState(false);

  // `isLiquidGlassAvailable()` is a plain `false` off iOS, so this is also the
  // switch that keeps the iOS-only accessibility APIs below from being called
  // anywhere else — react-native-web has no `isReduceTransparencyEnabled` at
  // all, and calling it there throws.
  const liquidGlass = isLiquidGlassAvailable();

  useEffect(() => {
    if (!liquidGlass) return;

    // Guarded rather than assumed: the method is documented iOS-only, so a
    // platform that reports glass support without it must not crash the chrome.
    if (typeof AccessibilityInfo.isReduceTransparencyEnabled !== 'function') return;

    let cancelled = false;

    AccessibilityInfo.isReduceTransparencyEnabled().then((value) => {
      if (!cancelled) setReduceTransparency(value);
    });

    const subscription = AccessibilityInfo.addEventListener?.(
      'reduceTransparencyChanged',
      setReduceTransparency
    );

    return () => {
      cancelled = true;
      subscription?.remove();
    };
  }, [liquidGlass]);

  return liquidGlass && !reduceTransparency;
}

export interface GlassSurfaceProps {
  children?: ReactNode;
  /** `clear` lets more of the content through — for chrome over dense screens. */
  effect?: 'regular' | 'clear';
  /** Interactive glass reacts to touch on iOS. Use on the tab bar and buttons. */
  interactive?: boolean;
  tintColor?: string;
  /** Matched by the fallback so both paths round identically. */
  radius?: number;
  style?: StyleProp<ViewStyle>;
}

export function GlassSurface({
  children,
  effect = 'regular',
  interactive = false,
  tintColor,
  radius,
  style,
}: GlassSurfaceProps) {
  const theme = useTheme();
  const scheme = useColorScheme();
  const glass = useGlassAvailable();

  const shape = radius === undefined ? null : { borderRadius: radius };

  if (glass) {
    return (
      <GlassView
        glassEffectStyle={effect}
        isInteractive={interactive}
        tintColor={tintColor}
        // The app has its own light/dark switch, so the material must follow
        // that rather than the system appearance it would default to.
        colorScheme={scheme}
        style={[shape, style]}>
        {children}
      </GlassView>
    );
  }

  return (
    <View
      style={[
        shape,
        {
          backgroundColor: tintColor ?? theme.glass,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: theme.glassBorder,
        },
        style,
      ]}>
      {children}
    </View>
  );
}
