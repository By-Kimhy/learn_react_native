import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View, type ScrollViewProps, type StyleProp, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MaxContentWidth, Spacing, TabBarHeight } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import { AppBarHeight } from './app-bar';

/**
 * The tab bar floats over the scene rather than sitting beside it, so a tab
 * screen has to clear the pill, its bottom inset and the margin under it —
 * otherwise the last row of every list hides behind the glass.
 */
export const TabBarClearance = TabBarHeight + Spacing.md + Spacing.xl;

export interface ScreenProps {
  children: ReactNode;
  /** `false` when the screen renders its own list — a FlatList must not nest in a ScrollView. */
  scroll?: boolean;
  /** Clears the floating tab bar on tab screens. Off for modal/stack screens. */
  withTabBar?: boolean;
  padded?: boolean;
  /**
   * Floating chrome drawn over the content — an `<AppBar>`. It is positioned
   * absolutely so the scroll passes beneath it, and the content is padded by
   * exactly its height so nothing starts underneath it.
   */
  header?: ReactNode;
  /** Modal screens sit below the status bar already; stacks don't. */
  headerWithSafeArea?: boolean;
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
  scrollProps?: Omit<ScrollViewProps, 'children' | 'contentContainerStyle'>;
}

export function Screen({
  children,
  scroll = true,
  withTabBar = false,
  padded = true,
  header,
  headerWithSafeArea = true,
  style,
  contentContainerStyle,
  scrollProps,
}: ScreenProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const content = <View style={[styles.inner, padded && styles.padded]}>{children}</View>;

  const topPadding = header
    ? AppBarHeight + (headerWithSafeArea ? insets.top : 0) + Spacing.lg
    : withTabBar
      ? insets.top + Spacing.md
      : Spacing.md;

  const bottomPadding = withTabBar
    ? TabBarClearance + insets.bottom
    : Spacing.xl + insets.bottom;

  const padding = { paddingTop: topPadding, paddingBottom: bottomPadding };

  return (
    <View style={[styles.flex, { backgroundColor: theme.background }, style]}>
      {scroll ? (
        <ScrollView
          style={styles.flex}
          contentContainerStyle={[padding, contentContainerStyle]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          // Keeps the scrollbar out from under the floating chrome.
          scrollIndicatorInsets={{ top: header ? AppBarHeight : 0 }}
          {...scrollProps}>
          {content}
        </ScrollView>
      ) : (
        <View style={[styles.flex, padding, contentContainerStyle]}>{content}</View>
      )}

      {header ? (
        <View style={styles.header}>
          {header}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  inner: { width: '100%', maxWidth: MaxContentWidth, alignSelf: 'center', flexGrow: 1 },
  padded: { paddingHorizontal: Spacing.lg },
  header: { position: 'absolute', top: 0, left: 0, right: 0, pointerEvents: 'box-none' },
});
