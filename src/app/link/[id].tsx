import * as Clipboard from 'expo-clipboard';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Linking, Platform, Share, StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Chip } from '@/components/ui/chip';
import { confirm, notify } from '@/components/ui/confirm';
import { IconButton } from '@/components/ui/icon-button';
import { Screen } from '@/components/ui/screen';
import { ScreenHeader } from '@/components/ui/screen-header';
import { Text } from '@/components/ui/text';
import { TextField } from '@/components/ui/text-field';
import { Spacing } from '@/constants/theme';
import { isUrlLike, normaliseUrl } from '@/features/links/selectors';
import { useLinks } from '@/features/links/store';
import { useT } from '@/features/settings/store';

export default function LinkEditorScreen() {
  const router = useRouter();
  const t = useT();
  const { id, url: presetUrl } = useLocalSearchParams<{ id: string; url?: string }>();
  const { getLink, addLink, updateLink, deleteLink, categories } = useLinks();

  const isNew = id === 'new';
  const link = isNew ? undefined : getLink(id);

  const [title, setTitle] = useState(link?.title ?? '');
  const [url, setUrl] = useState(link?.url ?? presetUrl ?? '');
  const [category, setCategory] = useState(link?.category ?? '');
  const [note, setNote] = useState(link?.note ?? '');
  const [favorite, setFavorite] = useState(link?.favorite ?? false);
  const [errors, setErrors] = useState<{ title?: string; url?: string }>({});

  const handleSubmit = () => {
    const next: { title?: string; url?: string } = {};
    if (!title.trim()) next.title = t('links.errorTitle');
    if (!isUrlLike(url)) next.url = t('links.errorUrl');

    setErrors(next);
    if (Object.keys(next).length > 0) return;

    const fields = {
      title: title.trim(),
      url: normaliseUrl(url),
      category: category.trim(),
      note: note.trim() || undefined,
      favorite,
    };

    if (link) updateLink(link.id, fields);
    else addLink(fields);

    router.back();
  };

  const handleDelete = async () => {
    if (!link) return;
    const confirmed = await confirm({
      title: t('links.deleteTitle'),
      message: t('links.deleteBody'),
      confirmLabel: t('common.delete'),
      cancelLabel: t('common.cancel'),
      destructive: true,
    });
    if (!confirmed) return;

    deleteLink(link.id);
    router.back();
  };

  const copyUrl = async () => {
    await Clipboard.setStringAsync(normaliseUrl(url));
    notify(t('links.copied'));
  };

  const shareLink = async () => {
    try {
      await Share.share({ message: normaliseUrl(url), title: title.trim() || undefined });
    } catch {
      // The user dismissed the share sheet.
    }
  };

  const openLink = async () => {
    try {
      await Linking.openURL(normaliseUrl(url));
    } catch {
      notify(t('links.openFailed'));
    }
  };

  const canAct = isUrlLike(url);

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScreenHeader
        title={isNew ? t('links.newLink') : t('links.editLink')}
        onBack={() => router.back()}
        backLabel={t('common.cancel')}
        right={
          link ? (
            <IconButton name="trash-outline" accessibilityLabel={t('common.delete')} onPress={handleDelete} />
          ) : null
        }
      />

      <Screen contentContainerStyle={styles.content}>
        <View style={styles.fields}>
          <TextField
            label={t('links.linkTitle')}
            value={title}
            onChangeText={(next) => {
              setTitle(next);
              if (errors.title) setErrors((current) => ({ ...current, title: undefined }));
            }}
            placeholder={t('links.titlePlaceholder')}
            error={errors.title}
            autoFocus={isNew && !presetUrl}
          />

          <TextField
            label={t('links.url')}
            value={url}
            onChangeText={(next) => {
              setUrl(next);
              if (errors.url) setErrors((current) => ({ ...current, url: undefined }));
            }}
            placeholder={t('links.urlPlaceholder')}
            error={errors.url}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
            inputMode="url"
          />

          <View style={styles.field}>
            <TextField
              label={t('links.category')}
              value={category}
              onChangeText={setCategory}
              placeholder={t('links.categoryPlaceholder')}
              hint={t('common.optional')}
            />

            {/* Existing categories as one-tap chips, so groups stay consistent. */}
            {categories.length > 0 ? (
              <View style={styles.chips}>
                {categories.map((name) => (
                  <Chip
                    key={name}
                    label={name}
                    selected={category.trim() === name}
                    onPress={() => setCategory(category.trim() === name ? '' : name)}
                  />
                ))}
              </View>
            ) : null}
          </View>

          <TextField
            label={t('links.note')}
            value={note}
            onChangeText={setNote}
            placeholder={t('links.notePlaceholder')}
            hint={t('common.optional')}
            multiline
          />

          <View style={styles.favoriteRow}>
            <Chip
              label={t('links.favorite')}
              icon={favorite ? 'star' : 'star-outline'}
              selected={favorite}
              onPress={() => setFavorite((current) => !current)}
            />
          </View>

          {canAct ? (
            <View style={styles.actions}>
              <Button label={t('links.open')} icon="open-outline" variant="secondary" onPress={openLink} />
              <Button label={t('links.copyUrl')} icon="copy-outline" variant="secondary" onPress={copyUrl} />
              <Button label={t('common.share')} icon="share-outline" variant="secondary" onPress={shareLink} />
            </View>
          ) : (
            <Text variant="caption" color="textTertiary">
              {t('links.errorUrl')}
            </Text>
          )}
        </View>

        <Button
          label={t('links.saveLink')}
          icon="checkmark"
          onPress={handleSubmit}
          fullWidth
          style={styles.submit}
        />
      </Screen>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { paddingTop: Spacing.lg },
  fields: { gap: Spacing.xl },
  field: { gap: Spacing.sm },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  favoriteRow: { flexDirection: 'row' },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  submit: { marginTop: Spacing.xxl },
});
