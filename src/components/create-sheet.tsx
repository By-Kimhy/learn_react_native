import { useRouter, type Href } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Icon, type IconName } from '@/components/ui/icon';
import { PressableScale } from '@/components/ui/pressable-scale';
import { Text } from '@/components/ui/text';
import { Radius, Spacing } from '@/constants/theme';
import { useT } from '@/features/settings/store';
import { useTheme } from '@/hooks/use-theme';
import type { TranslationKey } from '@/lib/i18n';

interface CreateAction {
  labelKey: TranslationKey;
  icon: IconName;
  /** Tint token for the action's icon badge. */
  tone: 'income' | 'expense' | 'primary' | 'muted';
  href?: Href;
  /** Phase 2/3 features appear greyed with a "Soon" badge instead of dead ends. */
  available: boolean;
}

const ACTIONS: CreateAction[] = [
  { labelKey: 'create.income', icon: 'trending-up', tone: 'income', href: '/transaction/new?type=income', available: true },
  { labelKey: 'create.expense', icon: 'trending-down', tone: 'expense', href: '/transaction/new?type=expense', available: true },
  { labelKey: 'create.note', icon: 'document-text', tone: 'primary', href: '/note/new?type=text', available: true },
  { labelKey: 'create.task', icon: 'checkbox-outline', tone: 'primary', href: '/task/new', available: true },
  { labelKey: 'create.habit', icon: 'flame-outline', tone: 'primary', href: '/habit/new', available: true },
  { labelKey: 'create.reminder', icon: 'alarm-outline', tone: 'primary', href: '/event/new?reminder=1', available: true },
  { labelKey: 'create.link', icon: 'link-outline', tone: 'primary', href: '/link/new', available: true },
  { labelKey: 'create.qr', icon: 'qr-code-outline', tone: 'primary', href: '/qr', available: true },
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

  const tints = {
    income: { fg: theme.income, bg: theme.incomeSoft },
    expense: { fg: theme.expense, bg: theme.expenseSoft },
    primary: { fg: theme.primary, bg: theme.primarySoft },
    muted: { fg: theme.textTertiary, bg: theme.surfaceAlt },
  };

  return (
    <BottomSheet visible={visible} onClose={onClose} title={t('create.title')}>
      <View style={styles.grid}>
        {ACTIONS.map((action) => {
          const tint = tints[action.tone];

          return (
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
                { backgroundColor: theme.surfaceAlt },
                !action.available && styles.unavailable,
              ]}>
              <View style={[styles.badge, { backgroundColor: tint.bg }]}>
                <Icon name={action.icon} size={20} tint={tint.fg} />
              </View>

              <Text variant="caption" align="center" numberOfLines={2} style={styles.label}>
                {t(action.labelKey)}
              </Text>

              {!action.available ? (
                <Text variant="caption" color="textTertiary" style={styles.soon}>
                  {t('common.soon')}
                </Text>
              ) : null}
            </PressableScale>
          );
        })}
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
    minHeight: 112,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.xs,
    paddingVertical: Spacing.sm,
  },
  unavailable: { opacity: 0.55 },
  badge: { width: 38, height: 38, borderRadius: Radius.pill, alignItems: 'center', justifyContent: 'center' },
  label: { fontSize: 11, lineHeight: 14 },
  soon: { fontSize: 9, lineHeight: 11 },
});
