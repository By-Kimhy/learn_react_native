import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { Spacing } from '@/constants/theme';

import { Text } from './text';

export interface PageTitleProps {
  title: string;
  /** Small all-caps kicker above the title. */
  overline?: string;
  subtitle?: string;
  actions?: ReactNode;
}

/**
 * The large in-scroll title. It lives in the content rather than the app bar so
 * it scrolls away under the glass, the way large titles do on iOS.
 */
export function PageTitle({ title, overline, subtitle, actions }: PageTitleProps) {
  return (
    <View style={styles.row}>
      <View style={styles.copy}>
        {overline ? (
          <Text variant="overline" color="textTertiary" numberOfLines={1}>
            {overline.toUpperCase()}
          </Text>
        ) : null}

        <Text variant="title" numberOfLines={2}>
          {title}
        </Text>

        {subtitle ? (
          <Text variant="caption" color="textSecondary" numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>

      {actions ? <View style={styles.actions}>{actions}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  copy: { flex: 1, gap: 2 },
  actions: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
});
