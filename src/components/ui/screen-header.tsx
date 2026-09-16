import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

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
 * A lightweight in-screen header. We render our own rather than using native
 * stack headers so modal and pushed screens look identical on both platforms.
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
    <View
      style={[
        styles.container,
        { backgroundColor: theme.background, borderBottomColor: theme.border },
        withSafeArea && { paddingTop: insets.top + Spacing.sm },
      ]}>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingBottom: Spacing.sm,
    paddingHorizontal: Spacing.sm,
  },
  row: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
  },
  // Fixed side widths keep the title optically centred regardless of actions.
  side: { minWidth: 88, flexDirection: 'row', alignItems: 'center' },
  rightSide: { justifyContent: 'flex-end' },
  titleGroup: { flex: 1, gap: 2 },
});
