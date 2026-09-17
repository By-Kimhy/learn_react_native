import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppBar, AppBarBrand } from '@/components/ui/app-bar';
import { BrandMark } from '@/components/ui/brand-mark';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Chip } from '@/components/ui/chip';
import { EmptyState } from '@/components/ui/empty-state';
import { Icon } from '@/components/ui/icon';
import { IconButton } from '@/components/ui/icon-button';
import { PageTitle } from '@/components/ui/page-title';
import { PressableScale } from '@/components/ui/pressable-scale';
import { Screen, TabBarClearance } from '@/components/ui/screen';
import { SectionLabel } from '@/components/ui/section-header';
import { Text } from '@/components/ui/text';
import { TextField } from '@/components/ui/text-field';
import { Radius, ShadowColor, Spacing } from '@/constants/theme';
import { NotesGrid } from '@/features/notes/components/notes-grid';
import { searchNotes, useNotes } from '@/features/notes/store';
import { useT } from '@/features/settings/store';
import { useTheme } from '@/hooks/use-theme';

export default function NotesScreen() {
  const router = useRouter();
  const theme = useTheme();
  const t = useT();
  const insets = useSafeAreaInsets();
  const { activeNotes, archivedNotes, allLabels } = useNotes();

  const [query, setQuery] = useState('');
  const [label, setLabel] = useState<string | null>(null);
  const [newNoteSheet, setNewNoteSheet] = useState(false);

  const filtered = useMemo(() => {
    const byLabel = label ? activeNotes.filter((note) => note.labels.includes(label)) : activeNotes;
    return searchNotes(byLabel, query);
  }, [activeNotes, label, query]);

  const pinned = filtered.filter((note) => note.pinned);
  const others = filtered.filter((note) => !note.pinned);

  const isFiltering = query.trim().length > 0 || label !== null;

  const openNote = (id: string) => router.push(`/note/${id}`);
  const createNote = (type: 'text' | 'checklist') => {
    setNewNoteSheet(false);
    router.push(`/note/new?type=${type}`);
  };

  return (
    <>
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
        <PageTitle
          title={t('notes.title')}
          actions={
            archivedNotes.length > 0 ? (
              <IconButton
                name="archive-outline"
                accessibilityLabel={t('notes.archive')}
                onPress={() => router.push('/archive')}
                filled
              />
            ) : undefined
          }
        />

        <View style={styles.search}>
          <TextField
            value={query}
            onChangeText={setQuery}
            placeholder={t('notes.searchPlaceholder')}
            icon="search"
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
            clearButtonMode="while-editing"
          />
        </View>

        {allLabels.length > 0 ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.labels}
            contentContainerStyle={styles.labelsTrack}>
            <Chip
              label={t('common.all')}
              count={activeNotes.length}
              selected={label === null}
              onPress={() => setLabel(null)}
            />
            {allLabels.map((name) => (
              <Chip
                key={name}
                label={`#${name}`}
                selected={label === name}
                onPress={() => setLabel(label === name ? null : name)}
              />
            ))}
          </ScrollView>
        ) : null}

        {filtered.length === 0 ? (
          isFiltering ? (
            <EmptyState
              icon="search-outline"
              title={t('notes.noResults')}
              body={t('notes.noResultsBody')}
            />
          ) : (
            <EmptyState
              icon="document-text-outline"
              title={t('notes.empty')}
              body={t('notes.emptyBody')}
              action={{ label: t('notes.createNote'), icon: 'add', onPress: () => setNewNoteSheet(true) }}
            />
          )
        ) : (
          <View style={styles.sections}>
            {pinned.length > 0 ? (
              <View style={styles.section}>
                <SectionLabel label={t('notes.pinned')} meta={t('notes.count', { count: pinned.length })} />
                <NotesGrid notes={pinned} onSelect={(note) => openNote(note.id)} />
              </View>
            ) : null}

            {others.length > 0 ? (
              <View style={styles.section}>
                {pinned.length > 0 ? (
                  <SectionLabel label={t('notes.others')} meta={t('notes.count', { count: others.length })} />
                ) : null}
                <NotesGrid notes={others} onSelect={(note) => openNote(note.id)} />
              </View>
            ) : null}
          </View>
        )}
      </Screen>

      {/* Sits above the floating tab bar so creating a note is always one tap away. */}
      <PressableScale
        accessibilityRole="button"
        accessibilityLabel={t('notes.createNote')}
        onPress={() => setNewNoteSheet(true)}
        scaleTo={0.92}
        style={[
          styles.fab,
          {
            backgroundColor: theme.surface,
            borderColor: theme.border,
            bottom: TabBarClearance + insets.bottom,
          },
        ]}>
        <Icon name="create-outline" size={22} color="primary" />
      </PressableScale>

      <BottomSheet
        visible={newNoteSheet}
        onClose={() => setNewNoteSheet(false)}
        title={t('notes.createNote')}>
        <View style={styles.sheetActions}>
          <PressableScale
            accessibilityRole="button"
            accessibilityLabel={t('notes.newTextNote')}
            onPress={() => createNote('text')}
            style={[styles.sheetAction, { backgroundColor: theme.surfaceAlt }]}>
            <Icon name="document-text-outline" size={24} color="primary" />
            <Text variant="bodyStrong">{t('notes.newTextNote')}</Text>
          </PressableScale>

          <PressableScale
            accessibilityRole="button"
            accessibilityLabel={t('notes.newChecklist')}
            onPress={() => createNote('checklist')}
            style={[styles.sheetAction, { backgroundColor: theme.surfaceAlt }]}>
            <Icon name="checkbox-outline" size={24} color="primary" />
            <Text variant="bodyStrong">{t('notes.newChecklist')}</Text>
          </PressableScale>
        </View>
      </BottomSheet>
    </>
  );
}

const styles = StyleSheet.create({
  search: { marginBottom: Spacing.md },
  // Bleeds to the screen edge so the row reads as scrollable.
  labels: { marginHorizontal: -Spacing.lg, marginBottom: Spacing.lg },
  labelsTrack: { flexDirection: 'row', gap: Spacing.sm, paddingHorizontal: Spacing.lg },
  sections: { gap: Spacing.xl },
  section: { gap: Spacing.sm },
  fab: {
    position: 'absolute',
    right: Spacing.lg,
    width: 56,
    height: 56,
    borderRadius: Radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: ShadowColor,
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  sheetActions: { flexDirection: 'row', gap: Spacing.md },
  sheetAction: {
    flex: 1,
    minHeight: 96,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    padding: Spacing.md,
  },
});
