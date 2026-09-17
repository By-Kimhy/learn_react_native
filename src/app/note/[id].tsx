import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, Share, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Chip } from '@/components/ui/chip';
import { confirm } from '@/components/ui/confirm';
import { Divider } from '@/components/ui/divider';
import { GlassSurface } from '@/components/ui/glass-surface';
import { IconButton } from '@/components/ui/icon-button';
import { ListRow } from '@/components/ui/list-row';
import { Screen } from '@/components/ui/screen';
import { ScreenHeader } from '@/components/ui/screen-header';
import { Text } from '@/components/ui/text';
import { Radius, Spacing, Typography } from '@/constants/theme';
import { AISheet } from '@/features/ai/components/ai-sheet';
import { ChecklistEditor } from '@/features/notes/components/checklist-editor';
import { ColorPicker } from '@/features/notes/components/color-picker';
import { LabelEditor } from '@/features/notes/components/label-editor';
import { createChecklistItem, createEmptyNote, isNoteEmpty, useNotes } from '@/features/notes/store';
import { usePreferences, useT } from '@/features/settings/store';
import { useNoteColor, useTheme } from '@/hooks/use-theme';
import { formatRelativeTimestamp } from '@/lib/date';
import type { Note, NoteType } from '@/types';

export default function NoteEditorScreen() {
  const router = useRouter();
  const theme = useTheme();
  const t = useT();
  const { preferences } = usePreferences();
  const insets = useSafeAreaInsets();
  const { id, type } = useLocalSearchParams<{ id: string; type?: string }>();
  const { getNote, saveNote, deleteNote, duplicateNote, allLabels } = useNotes();

  const isNew = id === 'new';
  const existing = isNew ? undefined : getNote(id);

  const [note, setNote] = useState<Note>(
    () => existing ?? createEmptyNote((type as NoteType) === 'checklist' ? 'checklist' : 'text')
  );
  const [sheet, setSheet] = useState<'none' | 'labels' | 'more' | 'ai'>('none');

  const background = useNoteColor(note.color);

  // The editor is the source of truth while open; it commits on the way out,
  // which also covers the iOS swipe-back gesture and the Android back button.
  const latest = useRef(note);
  const commit = useRef(saveNote);
  const discarded = useRef(false);

  // Declared before the commit effect so its cleanup still sees the last draft.
  useEffect(() => {
    latest.current = note;
    commit.current = saveNote;
  });

  useEffect(
    () => () => {
      if (discarded.current) return;
      if (isNoteEmpty(latest.current)) return;
      commit.current(latest.current);
    },
    []
  );

  const patch = (changes: Partial<Note>) => setNote((current) => ({ ...current, ...changes }));

  const close = () => router.back();

  const discardAnd = (action: () => void) => {
    discarded.current = true;
    action();
    close();
  };

  const handleDelete = async () => {
    const confirmed = await confirm({
      title: t('notes.deleteTitle'),
      message: t('notes.deleteBody'),
      confirmLabel: t('common.delete'),
      cancelLabel: t('common.cancel'),
      destructive: true,
    });
    if (!confirmed) return;

    setSheet('none');
    discardAnd(() => {
      if (!isNew) deleteNote(note.id);
    });
  };

  const handleShare = async () => {
    setSheet('none');
    const lines = [
      note.title,
      note.type === 'checklist'
        ? note.checklist
            .filter((item) => item.text.trim())
            .map((item) => `${item.done ? '☑' : '☐'} ${item.text}`)
            .join('\n')
        : note.body,
    ].filter((line) => line.trim().length > 0);

    if (lines.length === 0) return;

    try {
      await Share.share({ message: lines.join('\n\n') });
    } catch {
      // The user dismissed the share sheet; nothing to recover from.
    }
  };

  const handleDuplicate = () => {
    setSheet('none');
    // Commit the in-progress edits, and copy from the same draft.
    saveNote(note);
    duplicateNote(note.id, note);
    discarded.current = true;
    close();
  };

  const toggleType = () => {
    setSheet('none');
    if (note.type === 'text') {
      const items = note.body
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line) => createChecklistItem(line));
      patch({ type: 'checklist', body: '', checklist: items.length > 0 ? items : [createChecklistItem()] });
    } else {
      const body = note.checklist
        .filter((item) => item.text.trim())
        .map((item) => item.text)
        .join('\n');
      patch({ type: 'text', body, checklist: [] });
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.flex, { backgroundColor: background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScreenHeader
        title={note.pinned ? t('notes.pinned') : t('notes.title')}
        onBack={close}
        backLabel={t('common.close')}
        right={
          <>
            <IconButton
              name="sparkles-outline"
              accessibilityLabel={t('ai.action')}
              onPress={() => setSheet('ai')}
            />
            <IconButton
              name={note.pinned ? 'pin' : 'pin-outline'}
              accessibilityLabel={note.pinned ? t('common.unpin') : t('common.pin')}
              onPress={() => patch({ pinned: !note.pinned })}
            />
            <IconButton
              name="ellipsis-horizontal"
              accessibilityLabel={t('more.title')}
              onPress={() => setSheet('more')}
            />
          </>
        }
      />

      <Screen style={{ backgroundColor: background }} contentContainerStyle={styles.content}>
        <TextInput
          value={note.title}
          onChangeText={(title) => patch({ title })}
          placeholder={t('notes.titlePlaceholder')}
          placeholderTextColor={theme.textTertiary}
          accessibilityLabel={t('notes.titlePlaceholder')}
          style={[Typography.title, styles.title, { color: theme.text }]}
          multiline
        />

        {note.type === 'checklist' ? (
          <ChecklistEditor items={note.checklist} onChange={(checklist) => patch({ checklist })} />
        ) : (
          <TextInput
            value={note.body}
            onChangeText={(body) => patch({ body })}
            placeholder={t('notes.bodyPlaceholder')}
            placeholderTextColor={theme.textTertiary}
            accessibilityLabel={t('notes.bodyPlaceholder')}
            style={[Typography.body, styles.body, { color: theme.text }]}
            multiline
            textAlignVertical="top"
          />
        )}

        <View style={styles.labelRow}>
          {note.labels.map((label) => (
            <Chip key={label} label={`#${label}`} />
          ))}

          {/* Always present, so adding the first label doesn't require the
              overflow menu. */}
          <Chip label={t('notes.labels')} icon="add" onPress={() => setSheet('labels')} />
        </View>
      </Screen>

      <GlassSurface
        effect="regular"
        style={[styles.toolbar, { paddingBottom: insets.bottom + Spacing.sm }]}>
        <ColorPicker
          value={note.color}
          onChange={(color) => patch({ color })}
          accessibilityLabel={t('notes.color')}
        />

        <Text variant="caption" color="textTertiary" align="center">
          {t('notes.edited', {
            time: formatRelativeTimestamp(
              note.updatedAt,
              preferences.language,
              { today: t('common.today'), yesterday: t('common.yesterday') },
              preferences.timeFormat
            ),
          })}
        </Text>
      </GlassSurface>

      <BottomSheet visible={sheet === 'more'} onClose={() => setSheet('none')}>
        <View style={styles.menu}>
          <ListRow
            title={note.type === 'text' ? t('notes.convertToChecklist') : t('notes.convertToText')}
            icon={note.type === 'text' ? 'checkbox-outline' : 'document-text-outline'}
            onPress={toggleType}
          />
          <Divider inset={50} />
          <ListRow
            title={t('notes.labels')}
            icon="pricetag-outline"
            value={note.labels.length > 0 ? `${note.labels.length}` : undefined}
            onPress={() => setSheet('labels')}
          />
          <Divider inset={50} />
          <ListRow
            title={note.archived ? t('common.unarchive') : t('common.archive')}
            icon={note.archived ? 'arrow-up-circle-outline' : 'archive-outline'}
            onPress={() => {
              setSheet('none');
              patch({ archived: !note.archived });
            }}
          />
          <Divider inset={50} />
          <ListRow title={t('common.share')} icon="share-outline" onPress={handleShare} />
          <Divider inset={50} />
          <ListRow
            title={t('common.duplicate')}
            icon="copy-outline"
            onPress={handleDuplicate}
            disabled={isNew}
          />
          <Divider inset={50} />
          <ListRow title={t('common.delete')} icon="trash-outline" destructive onPress={handleDelete} />
        </View>
      </BottomSheet>

      <AISheet
        visible={sheet === 'ai'}
        onClose={() => setSheet('none')}
        title={note.title}
        body={
          note.type === 'checklist'
            ? note.checklist
                .filter((item) => item.text.trim())
                .map((item) => item.text)
                .join('\n')
            : note.body
        }
        onApplyTitle={(next) => patch({ title: next })}
      />

      <BottomSheet
        visible={sheet === 'labels'}
        onClose={() => setSheet('none')}
        title={t('notes.labels')}>
        <LabelEditor
          labels={note.labels}
          suggestions={allLabels}
          onChange={(labels) => patch({ labels })}
        />
      </BottomSheet>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { paddingTop: Spacing.lg },
  title: { padding: 0, marginBottom: Spacing.md },
  body: { padding: 0, minHeight: 200 },
  labelRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginTop: Spacing.lg },
  toolbar: {
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    overflow: 'hidden',
  },
  menu: { paddingBottom: Spacing.sm },
});
