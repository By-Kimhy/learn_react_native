import { useRouter, type Href } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Card } from '@/components/ui/card';
import { Divider } from '@/components/ui/divider';
import type { IconName } from '@/components/ui/icon';
import { ListRow } from '@/components/ui/list-row';
import { Screen } from '@/components/ui/screen';
import { Text } from '@/components/ui/text';
import { Spacing } from '@/constants/theme';
import { useNotes } from '@/features/notes/store';
import { useT } from '@/features/settings/store';
import type { TranslationKey } from '@/lib/i18n';

interface MoreEntry {
  labelKey: TranslationKey;
  icon: IconName;
  href?: Href;
  /** Phase 2/3 entries stay visible so the app's shape is clear from day one. */
  available: boolean;
}

const AVAILABLE: MoreEntry[] = [
  { labelKey: 'more.tasks', icon: 'checkbox-outline', href: '/tasks', available: true },
  { labelKey: 'more.habits', icon: 'flame-outline', href: '/habits', available: true },
  { labelKey: 'more.calendar', icon: 'calendar-outline', href: '/calendar', available: true },
  { labelKey: 'more.reminders', icon: 'alarm-outline', href: '/reminders', available: true },
  { labelKey: 'more.links', icon: 'link-outline', href: '/links', available: true },
  { labelKey: 'more.qr', icon: 'qr-code-outline', href: '/qr', available: true },
  { labelKey: 'more.statistics', icon: 'stats-chart-outline', href: '/statistics', available: true },
  { labelKey: 'transaction.history', icon: 'receipt-outline', href: '/transactions', available: true },
  { labelKey: 'more.archive', icon: 'archive-outline', href: '/archive', available: true },
  { labelKey: 'more.settings', icon: 'settings-outline', href: '/settings', available: true },
];

/** Phase 4+ lives here; the list is kept so the app's shape stays visible. */
const UPCOMING: MoreEntry[] = [];

export default function MoreScreen() {
  const router = useRouter();
  const t = useT();
  const insets = useSafeAreaInsets();
  const { archivedNotes } = useNotes();

  const renderGroup = (entries: MoreEntry[]) => (
    <Card style={styles.card}>
      {entries.map((entry, index) => (
        <View key={entry.labelKey}>
          {index > 0 ? <Divider inset={50} /> : null}
          <ListRow
            title={t(entry.labelKey)}
            icon={entry.icon}
            onPress={entry.href ? () => router.push(entry.href!) : undefined}
            showChevron={entry.available}
            disabled={!entry.available}
            value={
              !entry.available
                ? t('common.soon')
                : entry.labelKey === 'more.archive' && archivedNotes.length > 0
                  ? String(archivedNotes.length)
                  : undefined
            }
          />
        </View>
      ))}
    </Card>
  );

  return (
    <Screen withTabBar contentContainerStyle={{ paddingTop: insets.top + Spacing.md }}>
      <Text variant="title" style={styles.heading}>
        {t('more.title')}
      </Text>

      <View style={styles.sections}>
        <View style={styles.group}>
          <Text variant="overline" color="textSecondary">
            {t('more.phaseOne').toUpperCase()}
          </Text>
          {renderGroup(AVAILABLE)}
        </View>

        {UPCOMING.length > 0 ? (
          <View style={styles.group}>
            <Text variant="overline" color="textSecondary">
              {t('more.phaseTwo').toUpperCase()}
            </Text>
            {renderGroup(UPCOMING)}
          </View>
        ) : null}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  heading: { marginBottom: Spacing.xl },
  sections: { gap: Spacing.xl },
  group: { gap: Spacing.sm },
  card: { paddingVertical: Spacing.xs, paddingHorizontal: Spacing.lg },
});
