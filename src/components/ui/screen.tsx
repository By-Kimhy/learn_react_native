import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View, type ScrollViewProps, type StyleProp, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

/**
 * The tab bar is a sibling of the tab scenes, not an overlay, so a scene
 * already stops above it. This only clears the "+" button, which overhangs the
 * bar by a little over 20pt.
 */
export const TabBarClearance = 32;

export interface ScreenProps {
  children: ReactNode;
  /** `false` when the screen renders its own list — a FlatList must not nest in a ScrollView. */
  scroll?: boolean;
  /** Clears the raised "+" button on tab screens. Off for modal/stack screens. */
  withTabBar?: boolean;
  padded?: boolean;
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
  scrollProps?: Omit<ScrollViewProps, 'children' | 'contentContainerStyle'>;
}

export function Screen({
  children,
  scroll = true,
  withTabBar = false,
  padded = true,
  style,
  contentContainerStyle,
  scrollProps,
}: ScreenProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const content = (
    <View style={[styles.inner, padded && styles.padded]}>{children}</View>
  );

  // Tab scenes end at the tab bar, which carries its own safe-area padding;
  // only stack and modal screens reach the bottom of the display.
  const bottomPadding = withTabBar ? TabBarClearance : Spacing.xl + insets.bottom;

  if (!scroll) {
    return (
      <View style={[styles.flex, { backgroundColor: theme.background }, style]}>
        <View style={[styles.flex, { paddingBottom: bottomPadding }, contentContainerStyle]}>
          {content}
        </View>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.flex, { backgroundColor: theme.background }, style]}
      contentContainerStyle={[{ paddingBottom: bottomPadding }, contentContainerStyle]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      {...scrollProps}>
      {content}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  inner: { width: '100%', maxWidth: MaxContentWidth, alignSelf: 'center', flexGrow: 1 },
  padded: { paddingHorizontal: Spacing.lg },
});
