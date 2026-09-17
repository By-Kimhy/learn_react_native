import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MaxContentWidth, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import { GlassSurface } from './glass-surface';
import { IconButton } from './icon-button';
import { Text } from './text';

export interface AppBarProps {
  title?: string;
  subtitle?: string;
  onBack?: () => void;
  backLabel?: string;
  /** Rendered on the left when there's no back button — a brand mark, say. */
  leading?: ReactNode;
  actions?: ReactNode;
  /** Modal screens sit below the status bar already; stacks don't. */
  withSafeArea?: boolean;
}

/**
 * The glass bar that floats at the top of every screen. Content scrolls under
 * it, so it is positioned absolutely by its parent rather than taking up space
 * in the layout — `AppBarHeight` is what the scroll view pads by.
 */
export const AppBarHeight = 56;

export function AppBar({
  title,
  subtitle,
  onBack,
  backLabel = 'Go back',
  leading,
  actions,
  withSafeArea = true,
}: AppBarProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const centred = Boolean(onBack);

  return (
    <GlassSurface
      effect="regular"
      radius={0}
      style={[styles.bar, withSafeArea && { paddingTop: insets.top }]}>
      {/* The specular top edge: the single detail that reads as glass rather
          than as a translucent rectangle. */}
      <View style={[styles.highlight, { backgroundColor: theme.glassHighlight }]} />

      <View style={styles.row}>
        <View style={[styles.side, centred && styles.sideFixed]}>
          {onBack ? (
            <IconButton name="chevron-back" accessibilityLabel={backLabel} onPress={onBack} />
          ) : (
            leading
          )}
        </View>

        {title ? (
          <View style={[styles.titleGroup, centred ? styles.titleCentred : styles.titleLeading]}>
            <Text variant="subheading" numberOfLines={1} align={centred ? 'center' : 'left'}>
              {title}
            </Text>
            {subtitle ? (
              <Text
                variant="caption"
                color="textSecondary"
                numberOfLines={1}
                align={centred ? 'center' : 'left'}>
                {subtitle}
              </Text>
            ) : null}
          </View>
        ) : (
          <View style={styles.titleGroup} />
        )}

        <View style={[styles.side, styles.sideRight, centred && styles.sideFixed]}>{actions}</View>
      </View>
    </GlassSurface>
  );
}

const styles = StyleSheet.create({
  bar: { overflow: 'hidden' },
  highlight: { height: StyleSheet.hairlineWidth, width: '100%' },
  row: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    minHeight: AppBarHeight,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    gap: Spacing.xs,
  },
  side: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  // A fixed side width keeps a centred title optically centred whatever the
  // actions are; a leading title doesn't need it and shouldn't be indented.
  sideFixed: { minWidth: 72 },
  sideRight: { justifyContent: 'flex-end' },
  titleGroup: { flex: 1, gap: 1 },
  titleCentred: { alignItems: 'center' },
  titleLeading: { paddingHorizontal: Spacing.xs },
});

/** The rounded brand mark that sits at the left of the tab screens' app bar. */
export function AppBarBrand({ children }: { children: ReactNode }) {
  const theme = useTheme();
  return <View style={[brand.tile, { backgroundColor: theme.primarySoft }]}>{children}</View>;
}

const brand = StyleSheet.create({
  tile: {
    width: 34,
    height: 34,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: Spacing.xs,
  },
});
