import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import { GlassSurface } from './glass-surface';
import { IconButton } from './icon-button';
import { Text } from './text';

export interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  backLabel?: string;
  right?: React.ReactNode;
  /** Modal screens sit below the status bar already; stacks don't. */
  withSafeArea?: boolean;
}

/**
 * The glass header on pushed and modal screens. We render our own rather than
 * using native stack headers so both platforms look identical.
 *
 * Unlike `<AppBar>`, this one stays in the layout flow: it is a sibling of
 * `<Screen>` on twenty-odd routes, several of which render their own lists, and
 * floating it would mean threading a content inset through all of them.
 */
export function ScreenHeader({
  title,
  subtitle,
  onBack,
  backLabel = 'Go back',
  right,
  withSafeArea = true,
}: ScreenHeaderProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <GlassSurface
      effect="regular"
      radius={0}
      style={[styles.container, withSafeArea && { paddingTop: insets.top }]}>
      <View style={styles.row}>
        <View style={styles.side}>
          {onBack ? (
            <IconButton name="chevron-back" accessibilityLabel={backLabel} onPress={onBack} />
          ) : null}
        </View>

        <View style={styles.titleGroup}>
          <Text variant="subheading" numberOfLines={1} align="center">
            {title}
          </Text>
          {subtitle ? (
            <Text variant="caption" color="textSecondary" numberOfLines={1} align="center">
              {subtitle}
            </Text>
          ) : null}
        </View>

        <View style={[styles.side, styles.rightSide]}>{right}</View>
      </View>

      <View style={[styles.hairline, { backgroundColor: theme.glassBorder }]} />
    </GlassSurface>
  );
}

const styles = StyleSheet.create({
  container: { overflow: 'hidden' },
  row: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingBottom: Spacing.xs,
  },
  // Fixed side widths keep the title optically centred regardless of actions.
  side: { minWidth: 84, flexDirection: 'row', alignItems: 'center' },
  rightSide: { justifyContent: 'flex-end' },
  titleGroup: { flex: 1, gap: 2 },
  hairline: { height: StyleSheet.hairlineWidth, width: '100%' },
});
