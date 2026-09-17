import { useRouter, type Href } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { AppBar, AppBarBrand } from '@/components/ui/app-bar';
import { BrandMark } from '@/components/ui/brand-mark';
import { Card } from '@/components/ui/card';
import { Divider } from '@/components/ui/divider';
import type { IconName } from '@/components/ui/icon';
import { IconButton } from '@/components/ui/icon-button';
import { ListRow } from '@/components/ui/list-row';
import { PageTitle } from '@/components/ui/page-title';
import { Screen } from '@/components/ui/screen';
import { SectionLabel } from '@/components/ui/section-header';
import { Text } from '@/components/ui/text';
import { Spacing, type AccentName } from '@/constants/theme';
import { useNotes } from '@/features/notes/store';
import { useT } from '@/features/settings/store';
import type { TranslationKey } from '@/lib/i18n';

interface MoreEntry {
  labelKey: TranslationKey;
  icon: IconName;
  /** Each entry keeps its own colour so the list is scannable by hue. */
  tone: AccentName;
  href?: Href;
  /** Phase 2/3 entries stay visible so the app's shape is clear from day one. */
  available: boolean;
}

const AVAILABLE: MoreEntry[] = [
  { labelKey: 'more.tasks', icon: 'checkbox-outline', tone: 'blue', href: '/tasks', available: true },
  { labelKey: 'more.habits', icon: 'flame-outline', tone: 'amber', href: '/habits', available: true },
  { labelKey: 'more.calendar', icon: 'calendar-outline', tone: 'indigo', href: '/calendar', available: true },
  { labelKey: 'more.reminders', icon: 'alarm-outline', tone: 'red', href: '/reminders', available: true },
  { labelKey: 'more.links', icon: 'link-outline', tone: 'teal', href: '/links', available: true },
  { labelKey: 'more.qr', icon: 'qr-code-outline', tone: 'purple', href: '/qr', available: true },
  { labelKey: 'more.statistics', icon: 'stats-chart-outline', tone: 'cyan', href: '/statistics', available: true },
  { labelKey: 'transaction.history', icon: 'receipt-outline', tone: 'green', href: '/transactions', available: true },
  { labelKey: 'more.archive', icon: 'archive-outline', tone: 'orange', href: '/archive', available: true },
  { labelKey: 'more.settings', icon: 'settings-outline', tone: 'grey', href: '/settings', available: true },
];

/** Phase 4+ lives here; the list is kept so the app's shape stays visible. */
const UPCOMING: MoreEntry[] = [];

export default function MoreScreen() {
  const router = useRouter();
  const t = useT();
  const { archivedNotes } = useNotes();

  const renderGroup = (entries: MoreEntry[]) => (
    <Card style={styles.card}>
      {entries.map((entry, index) => (
        <View key={entry.labelKey}>
          {index > 0 ? <Divider inset={50} /> : null}
          <ListRow
            title={t(entry.labelKey)}
            icon={entry.icon}
            tone={entry.tone}
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
    <Screen
      withTabBar
      header={
        <AppBar
          title="LifeHub"
          leading={
            <AppBarBrand>
              <BrandMark size={22} />
            </AppBarBrand>
          }
          actions={
            <IconButton
              name="settings-outline"
              accessibilityLabel={t('settings.title')}
              onPress={() => router.push('/settings')}
              filled
            />
          }
        />
      }>
      <PageTitle overline={t('more.phaseOne')} title={t('more.title')} />

      <View style={styles.sections}>
        {renderGroup(AVAILABLE)}

        {UPCOMING.length > 0 ? (
          <View style={styles.group}>
            <SectionLabel label={t('more.phaseTwo')} />
            {renderGroup(UPCOMING)}
          </View>
        ) : null}

        <Text variant="caption" color="textTertiary" align="center">
          LifeHub 1.0.0
        </Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  sections: { gap: Spacing.xl },
  group: { gap: Spacing.sm },
  card: { paddingVertical: Spacing.xs, paddingHorizontal: Spacing.lg },
});
