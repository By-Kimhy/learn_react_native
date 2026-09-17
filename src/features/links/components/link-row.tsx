import { StyleSheet, View } from 'react-native';

import { IconButton } from '@/components/ui/icon-button';
import { PressableScale } from '@/components/ui/pressable-scale';
import { Text } from '@/components/ui/text';
import { Radius, Spacing, type AccentName } from '@/constants/theme';
import { useT } from '@/features/settings/store';
import { useAccents, useTheme } from '@/hooks/use-theme';
import type { Link } from '@/types';

import { displayHost } from '../selectors';

/**
 * A stable colour per link, derived from its host so the same site keeps the
 * same badge across sessions without storing anything.
 */
const BADGE_TONES: AccentName[] = ['blue', 'green', 'purple', 'orange', 'teal', 'pink', 'indigo', 'cyan'];

function toneForHost(host: string): AccentName {
  let hash = 0;
  for (let index = 0; index < host.length; index += 1) {
    hash = (hash * 31 + host.charCodeAt(index)) % 100000;
  }
  return BADGE_TONES[hash % BADGE_TONES.length];
}

export interface LinkRowProps {
  link: Link;
  onOpen: () => void;
  onEdit: () => void;
  onToggleFavorite: () => void;
}

export function LinkRow({ link, onOpen, onEdit, onToggleFavorite }: LinkRowProps) {
  const theme = useTheme();
  const accents = useAccents();
  const t = useT();

  const host = displayHost(link.url);
  const badge = accents[toneForHost(host)];
  const initial = (link.title.trim()[0] ?? host[0] ?? '?').toUpperCase();

  return (
    <View style={styles.row}>
      <PressableScale
        accessibilityRole="link"
        accessibilityLabel={`${link.title}, ${host}`}
        accessibilityHint={t('links.open')}
        onPress={onOpen}
        onLongPress={onEdit}
        scaleTo={0.99}
        style={styles.main}>
        <View style={[styles.badge, { backgroundColor: badge.soft }]}>
          <Text variant="subheading" tint={badge.tint}>
            {initial}
          </Text>
        </View>

        <View style={styles.copy}>
          <Text variant="bodyStrong" numberOfLines={1}>
            {link.title}
          </Text>
          <Text variant="caption" color="textSecondary" numberOfLines={1}>
            {host}
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
    width: 40,
    height: 40,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: { flex: 1, gap: 1 },
});
