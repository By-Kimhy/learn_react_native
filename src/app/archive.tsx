import { useRouter } from 'expo-router';

import { EmptyState } from '@/components/ui/empty-state';
import { Screen } from '@/components/ui/screen';
import { ScreenHeader } from '@/components/ui/screen-header';
import { NotesGrid } from '@/features/notes/components/notes-grid';
import { useNotes } from '@/features/notes/store';
import { useT } from '@/features/settings/store';

export default function ArchiveScreen() {
  const router = useRouter();
  const t = useT();
  const { archivedNotes } = useNotes();

  return (
    <>
      <ScreenHeader title={t('notes.archive')} onBack={() => router.back()} />

      <Screen>
        {archivedNotes.length > 0 ? (
          <NotesGrid notes={archivedNotes} onSelect={(note) => router.push(`/note/${note.id}`)} />
        ) : (
          <EmptyState
            icon="archive-outline"
            title={t('notes.archiveEmpty')}
            body={t('notes.archiveEmptyBody')}
          />
        )}
      </Screen>
    </>
  );
}
