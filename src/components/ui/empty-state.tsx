import { StyleSheet, View } from 'react-native';

import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import { Button } from './button';
import { Icon, type IconName } from './icon';
import { Text } from './text';

export interface EmptyStateProps {
  icon: IconName;
  title: string;
  body?: string;
  action?: { label: string; onPress: () => void; icon?: IconName };
  compact?: boolean;
  /** A dashed outline — for a placeholder inside a screen that has content elsewhere. */
  dashed?: boolean;
}

/** Every list in LifeHub gets one of these — never a blank screen. */
export function EmptyState({
  icon,
  title,
  body,
  action,
  compact = false,
  dashed = false,
}: EmptyStateProps) {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.container,
        compact && styles.compact,
        dashed && {
          borderWidth: 1,
          borderStyle: 'dashed',
          borderColor: theme.borderStrong,
          borderRadius: Radius.lg,
        },
      ]}>
      <View style={[styles.badge, { backgroundColor: theme.surfaceAlt }]}>
        <Icon name={icon} size={compact ? 22 : 26} color="textTertiary" />
      </View>

      <View style={styles.copy}>
        <Text variant={compact ? 'subheading' : 'heading'} align="center">
          {title}
        </Text>
        {body ? (
          <Text variant="body" color="textSecondary" align="center">
            {body}
          </Text>
        ) : null}
      </View>

      {action ? (
        <Button label={action.label} icon={action.icon} onPress={action.onPress} shape="pill" />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.lg,
    paddingVertical: Spacing.xxxl,
    paddingHorizontal: Spacing.lg,
  },
  compact: { paddingVertical: Spacing.xl, gap: Spacing.md },
  badge: {
    width: 60,
    height: 60,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: { gap: Spacing.xs, maxWidth: 320 },
});
