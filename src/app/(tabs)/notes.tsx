import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Chip } from '@/components/ui/chip';
import { EmptyState } from '@/components/ui/empty-state';
import { Icon } from '@/components/ui/icon';
import { IconButton } from '@/components/ui/icon-button';
import { PressableScale } from '@/components/ui/pressable-scale';
import { Screen } from '@/components/ui/screen';
import { Text } from '@/components/ui/text';
import { TextField } from '@/components/ui/text-field';
import { Radius, Spacing } from '@/constants/theme';
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
      <Screen withTabBar contentContainerStyle={{ paddingTop: insets.top + Spacing.md }}>
        <View style={styles.header}>
          <Text variant="title" style={styles.headerTitle}>
            {t('notes.title')}
          </Text>
          {archivedNotes.length > 0 ? (
            <IconButton
              name="archive-outline"
              accessibilityLabel={t('notes.archive')}
              onPress={() => router.push('/archive')}
              filled
            />
          ) : null}
        </View>

        <View style={styles.search}>
          <TextField
            value={query}
            onChangeText={setQuery}
            placeholder={t('notes.searchPlaceholder')}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
            clearButtonMode="while-editing"
          />
        </View>

        {allLabels.length > 0 ? (
          <View style={styles.labels}>
            <Chip label={t('common.all')} selected={label === null} onPress={() => setLabel(null)} />
            {allLabels.map((name) => (
              <Chip
                key={name}
                label={`#${name}`}
                selected={label === name}
                onPress={() => setLabel(label === name ? null : name)}
              />
            ))}
          </View>
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
                <Text variant="overline" color="textSecondary">
                  {t('notes.pinned').toUpperCase()}
                </Text>
                <NotesGrid notes={pinned} onSelect={(note) => openNote(note.id)} />
              </View>
            ) : null}

            {others.length > 0 ? (
              <View style={styles.section}>
                {pinned.length > 0 ? (
                  <Text variant="overline" color="textSecondary">
                    {t('notes.others').toUpperCase()}
                  </Text>
                ) : null}
                <NotesGrid notes={others} onSelect={(note) => openNote(note.id)} />
              </View>
            ) : null}
          </View>
        )}
      </Screen>

      {/* Sits above the tab bar so creating a note is always one tap away. */}
      <PressableScale
        accessibilityRole="button"
        accessibilityLabel={t('notes.createNote')}
        onPress={() => setNewNoteSheet(true)}
        scaleTo={0.92}
        style={[
          styles.fab,
          { backgroundColor: theme.surface, borderColor: theme.border },
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
  header: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.lg },
  headerTitle: { flex: 1 },
  search: { marginBottom: Spacing.md },
  labels: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.lg },
  sections: { gap: Spacing.xl },
  section: { gap: Spacing.sm },
  fab: {
    position: 'absolute',
    right: Spacing.lg,
    // The scene ends at the tab bar, so this clears the raised "+" button only.
    bottom: Spacing.xxl,
    width: 56,
    height: 56,
    borderRadius: Radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
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
