import type { ReactNode } from 'react';
import { StyleSheet, Switch, View } from 'react-native';

import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { Spacing } from '@/constants/theme';
import { usePreferences, useT } from '@/features/settings/store';
import { useTheme } from '@/hooks/use-theme';

export interface ReminderToggleProps {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  /** Revealed only when the reminder is on — a time picker, usually. */
  children?: ReactNode;
}

/**
 * Wraps any reminder control with its on/off switch, and explains itself when
 * notifications are globally disabled rather than silently doing nothing.
 */
export function ReminderToggle({ enabled, onToggle, children }: ReminderToggleProps) {
  const theme = useTheme();
  const t = useT();
  const { preferences } = usePreferences();

  const globallyOff = !preferences.notificationsEnabled;

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Icon name="notifications-outline" size={18} color="textSecondary" />
        <Text variant="bodyStrong" style={styles.label}>
          {t('reminders.reminder')}
        </Text>
        <Switch
          value={enabled}
          onValueChange={onToggle}
          trackColor={{ true: theme.primary, false: theme.surfaceSunken }}
          accessibilityLabel={t('reminders.reminder')}
        />
      </View>

      {enabled && globallyOff ? (
        <View style={[styles.warning, { backgroundColor: theme.expenseSoft }]}>
          <Icon name="alert-circle-outline" size={16} tint={theme.expense} />
          <Text variant="caption" tint={theme.expense} style={styles.warningText}>
            {t('reminders.disabledBody')}
          </Text>
        </View>
      ) : null}

      {enabled ? children : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: Spacing.md },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  label: { flex: 1 },
  warning: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: Spacing.md,
  },
  warningText: { flex: 1 },
});
