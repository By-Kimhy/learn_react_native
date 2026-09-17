import { useRouter } from 'expo-router';
import { Fragment, useMemo, useState } from 'react';
import { Linking, StyleSheet, View } from 'react-native';

import { Card } from '@/components/ui/card';
import { notify } from '@/components/ui/confirm';
import { Divider } from '@/components/ui/divider';
import { EmptyState } from '@/components/ui/empty-state';
import { IconButton } from '@/components/ui/icon-button';
import { Screen } from '@/components/ui/screen';
import { SectionLabel } from '@/components/ui/section-header';
import { ScreenHeader } from '@/components/ui/screen-header';
import { TextField } from '@/components/ui/text-field';
import { Spacing } from '@/constants/theme';
import { LinkRow } from '@/features/links/components/link-row';
import { groupLinks, normaliseUrl, searchLinks } from '@/features/links/selectors';
import { useLinks } from '@/features/links/store';
import { useT } from '@/features/settings/store';

export default function LinksScreen() {
  const router = useRouter();
  const t = useT();
  const { links, toggleFavorite } = useLinks();

  const [query, setQuery] = useState('');

  const results = useMemo(() => searchLinks(links, query), [links, query]);
  const groups = useMemo(
    () => groupLinks(results, t('links.favorites'), t('links.uncategorised')),
    [results, t]
  );

  const open = async (url: string) => {
    try {
      await Linking.openURL(normaliseUrl(url));
    } catch {
      notify(t('links.openFailed'));
    }
  };

  const isSearching = query.trim().length > 0;

  return (
    <>
      <ScreenHeader
        title={t('links.title')}
        onBack={() => router.back()}
        right={
          <IconButton
            name="add"
            accessibilityLabel={t('links.newLink')}
            onPress={() => router.push('/link/new')}
          />
        }
      />

      <Screen contentContainerStyle={styles.content}>
        {links.length > 0 ? (
          <View style={styles.search}>
            <TextField
              value={query}
              onChangeText={setQuery}
              placeholder={t('links.searchPlaceholder')}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="search"
              clearButtonMode="while-editing"
            />
          </View>
        ) : null}

        {groups.length > 0 ? (
          <View style={styles.groups}>
            {groups.map((group) => (
              <View key={group.category} style={styles.group}>
                <SectionLabel label={group.category} meta={String(group.links.length)} />

                <Card style={styles.card}>
                  {group.links.map((link, index) => (
                    <Fragment key={link.id}>
                      {index > 0 ? <Divider inset={50} /> : null}
                      <LinkRow
                        link={link}
                        onOpen={() => open(link.url)}
                        onEdit={() => router.push(`/link/${link.id}`)}
                        onToggleFavorite={() => toggleFavorite(link.id)}
                      />
                    </Fragment>
                  ))}
                </Card>
              </View>
            ))}
          </View>
        ) : isSearching ? (
          <EmptyState
            icon="search-outline"
            title={t('links.noResults')}
            body={t('links.noResultsBody')}
          />
        ) : (
          <EmptyState
            icon="link-outline"
            title={t('links.empty')}
            body={t('links.emptyBody')}
            action={{
              label: t('links.newLink'),
              icon: 'add',
              onPress: () => router.push('/link/new'),
            }}
          />
        )}
      </Screen>
    </>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: Spacing.lg },
  search: { marginBottom: Spacing.lg },
  groups: { gap: Spacing.xl },
  group: { gap: Spacing.sm },
  card: { paddingVertical: Spacing.xs, paddingHorizontal: Spacing.lg },
});
