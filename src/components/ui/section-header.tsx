import { StyleSheet, View } from 'react-native';

import { Spacing } from '@/constants/theme';

import { Icon, type IconName } from './icon';
import { PressableScale } from './pressable-scale';
import { Text } from './text';

export interface SectionHeaderProps {
  title: string;
  action?: { label: string; onPress: () => void; icon?: IconName };
}

export function SectionHeader({ title, action }: SectionHeaderProps) {
  return (
    <View style={styles.row}>
      <Text variant="heading">{title}</Text>

      {action ? (
        <PressableScale
          accessibilityRole="button"
          accessibilityLabel={action.label}
          onPress={action.onPress}
          hitSlop={8}
          style={styles.action}>
          <Text variant="captionStrong" color="primary">
            {action.label}
          </Text>
          <Icon name={action.icon ?? 'chevron-forward'} size={14} color="primary" />
        </PressableScale>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  action: { flexDirection: 'row', alignItems: 'center', gap: 2 },
});
