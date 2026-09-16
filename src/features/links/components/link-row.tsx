import { StyleSheet, View } from 'react-native';

import { Icon } from '@/components/ui/icon';
import { IconButton } from '@/components/ui/icon-button';
import { PressableScale } from '@/components/ui/pressable-scale';
import { Text } from '@/components/ui/text';
import { Radius, Spacing } from '@/constants/theme';
import { useT } from '@/features/settings/store';
import { useTheme } from '@/hooks/use-theme';
import type { Link } from '@/types';

import { displayHost } from '../selectors';

export interface LinkRowProps {
  link: Link;
  onOpen: () => void;
  onEdit: () => void;
  onToggleFavorite: () => void;
}

export function LinkRow({ link, onOpen, onEdit, onToggleFavorite }: LinkRowProps) {
  const theme = useTheme();
  const t = useT();

  return (
    <View style={styles.row}>
      <PressableScale
        accessibilityRole="link"
        accessibilityLabel={`${link.title}, ${displayHost(link.url)}`}
        accessibilityHint={t('links.open')}
        onPress={onOpen}
        onLongPress={onEdit}
        scaleTo={0.99}
        style={styles.main}>
        <View style={[styles.badge, { backgroundColor: theme.primarySoft }]}>
          <Icon name="globe-outline" size={18} tint={theme.primary} />
        </View>

        <View style={styles.copy}>
          <Text variant="bodyStrong" numberOfLines={1}>
            {link.title}
          </Text>
          <Text variant="caption" color="textSecondary" numberOfLines={1}>
            {displayHost(link.url)}
          </Text>
          {link.note ? (
            <Text variant="caption" color="textTertiary" numberOfLines={1}>
              {link.note}
            </Text>
          ) : null}
        </View>
      </PressableScale>

      <IconButton
        name={link.favorite ? 'star' : 'star-outline'}
        size={18}
        accessibilityLabel={t('links.favorite')}
        tint={link.favorite ? theme.warning : theme.textTertiary}
        onPress={onToggleFavorite}
      />

      <IconButton
        name="ellipsis-horizontal"
        size={18}
        accessibilityLabel={t('common.edit')}
        onPress={onEdit}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.sm },
  main: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  badge: {
    width: 38,
    height: 38,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: { flex: 1, gap: 1 },
});
