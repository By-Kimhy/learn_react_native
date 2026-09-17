import { useRouter, type Href } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { BottomSheet } from '@/components/ui/bottom-sheet';
import { IconTile } from '@/components/ui/icon-tile';
import { PressableScale } from '@/components/ui/pressable-scale';
import { Text } from '@/components/ui/text';
import { Radius, Spacing, type AccentName } from '@/constants/theme';
import { useT } from '@/features/settings/store';
import { useTheme } from '@/hooks/use-theme';
import type { TranslationKey } from '@/lib/i18n';

interface CreateAction {
  labelKey: TranslationKey;
  icon: Parameters<typeof IconTile>[0]['icon'];
  /** Matches the colour the same feature uses on the More menu. */
  tone: AccentName;
  href?: Href;
  /** Phase 2/3 features appear greyed with a "Soon" badge instead of dead ends. */
  available: boolean;
}

const ACTIONS: CreateAction[] = [
  { labelKey: 'create.income', icon: 'trending-up', tone: 'green', href: '/transaction/new?type=income', available: true },
  { labelKey: 'create.expense', icon: 'trending-down', tone: 'red', href: '/transaction/new?type=expense', available: true },
  { labelKey: 'create.note', icon: 'document-text', tone: 'blue', href: '/note/new?type=text', available: true },
  { labelKey: 'create.task', icon: 'checkbox-outline', tone: 'blue', href: '/task/new', available: true },
  { labelKey: 'create.habit', icon: 'flame-outline', tone: 'amber', href: '/habit/new', available: true },
  { labelKey: 'create.reminder', icon: 'alarm-outline', tone: 'red', href: '/event/new?reminder=1', available: true },
  { labelKey: 'create.link', icon: 'link-outline', tone: 'teal', href: '/link/new', available: true },
  { labelKey: 'create.qr', icon: 'qr-code-outline', tone: 'purple', href: '/qr', available: true },
];

export interface CreateSheetProps {
  visible: boolean;
  onClose: () => void;
}

/** The sheet behind the tab bar's "+". Every quick-add path starts here. */
export function CreateSheet({ visible, onClose }: CreateSheetProps) {
  const theme = useTheme();
  const t = useT();
  const router = useRouter();

  return (
    <BottomSheet visible={visible} onClose={onClose} title={t('create.title')}>
      <View style={styles.grid}>
        {ACTIONS.map((action) => (
          <PressableScale
            key={action.labelKey}
            accessibilityRole="button"
            accessibilityLabel={t(action.labelKey)}
            accessibilityState={{ disabled: !action.available }}
            disabled={!action.available}
            scaleTo={0.94}
            onPress={() => {
              onClose();
              if (action.href) router.push(action.href);
            }}
            style={[
              styles.tile,
              { backgroundColor: theme.surface },
              !action.available && styles.unavailable,
            ]}>
            <IconTile icon={action.icon} tone={action.tone} size={40} shape="circle" />

            <Text variant="caption" align="center" numberOfLines={2} style={styles.label}>
              {t(action.labelKey)}
            </Text>

            {!action.available ? (
              <Text variant="caption" color="textTertiary" style={styles.soon}>
                {t('common.soon')}
              </Text>
            ) : null}
          </PressableScale>
        ))}
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, justifyContent: 'center' },
  tile: {
    width: '23%',
    minWidth: 78,
    // Tall enough for a two-line label plus the "Soon" note on the
    // not-yet-available actions, which otherwise clipped the second line.
    minHeight: 104,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.xs,
    paddingVertical: Spacing.md,
  },
  unavailable: { opacity: 0.55 },
  label: { fontSize: 11, lineHeight: 14 },
  soon: { fontSize: 9, lineHeight: 11 },
});
