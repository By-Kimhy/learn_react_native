import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import { Icon, type IconName } from './icon';
import { PressableScale } from './pressable-scale';
import { Text } from './text';

export interface SectionHeaderProps {
  title: string;
  /** A short right-hand note — "Total: $815.50", "Wed, Sep 17". */
  meta?: string;
  action?: { label: string; onPress: () => void; icon?: IconName };
  /** Adds the small accent bar that marks a heading inside a card. */
  accent?: boolean;
  /** Tighter bottom margin for headings that sit inside a card. */
  inCard?: boolean;
}

export function SectionHeader({ title, meta, action, accent = false, inCard = false }: SectionHeaderProps) {
  const theme = useTheme();

  return (
    <View style={[styles.row, inCard && styles.inCard]}>
      <View style={styles.titleGroup}>
        {accent ? <View style={[styles.accent, { backgroundColor: theme.primary }]} /> : null}
        <Text variant="heading" numberOfLines={1} style={styles.title}>
          {title}
        </Text>
      </View>

      {meta ? (
        <Text variant="caption" color="textSecondary" numberOfLines={1}>
          {meta}
        </Text>
      ) : null}

      {action ? (
        <PressableScale
          accessibilityRole="button"
          accessibilityLabel={action.label}
          onPress={action.onPress}
          hitSlop={8}
          style={styles.action}>
          <Text variant="captionStrong" color="primary" numberOfLines={1}>
            {action.label}
          </Text>
          <Icon name={action.icon ?? 'chevron-forward'} size={14} color="primary" />
        </PressableScale>
      ) : null}
    </View>
  );
}

/**
 * The small all-caps label above a group — "PINNED", "UPCOMING", "DATA" —
 * with an optional count or action on the right.
 */
export function SectionLabel({
  label,
  meta,
  right,
}: {
  label: string;
  meta?: string;
  right?: ReactNode;
}) {
  return (
    <View style={styles.labelRow}>
      <Text variant="overline" color="textTertiary" numberOfLines={1} style={styles.title}>
        {label.toUpperCase()}
      </Text>

      {meta ? (
        <Text variant="caption" color="textTertiary" numberOfLines={1}>
          {meta}
        </Text>
      ) : null}

      {right}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  inCard: { marginBottom: Spacing.sm },
  titleGroup: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  // The heading shrinks before the action does — "See all" must stay readable.
  title: { flexShrink: 1 },
  accent: { width: 4, height: 18, borderRadius: Radius.pill },
  action: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
});
