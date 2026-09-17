import * as Clipboard from 'expo-clipboard';
import { useRouter } from 'expo-router';
import { Fragment, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, Share, StyleSheet, View } from 'react-native';
import QRCodeView from 'react-native-qrcode-svg';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { confirm, notify } from '@/components/ui/confirm';
import { Divider } from '@/components/ui/divider';
import { IconButton } from '@/components/ui/icon-button';
import { ListRow } from '@/components/ui/list-row';
import { Screen } from '@/components/ui/screen';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { SectionLabel } from '@/components/ui/section-header';
import { ScreenHeader } from '@/components/ui/screen-header';
import { Text } from '@/components/ui/text';
import { TextField } from '@/components/ui/text-field';
import { Radius, Spacing } from '@/constants/theme';
import { isUrlLike } from '@/features/links/selectors';
import { qrFileName, shareQRImage } from '@/features/qr/save-qr';
import { useQRCodes } from '@/features/qr/store';
import { usePreferences, useT } from '@/features/settings/store';
import { useTheme } from '@/hooks/use-theme';
import { formatRelativeTimestamp } from '@/lib/date';

const QR_SIZE = 220;

/** `react-native-qrcode-svg` exposes its PNG through a callback-style ref. */
interface QRCodeRef {
  toDataURL: (callback: (base64: string) => void) => void;
}

export default function QRScreen() {
  const router = useRouter();
  const theme = useTheme();
  const t = useT();
  const { preferences } = usePreferences();
  const { codes, recordCode, clearHistory } = useQRCodes();

  const [value, setValue] = useState('');
  const qrRef = useRef<QRCodeRef | null>(null);

  const trimmed = value.trim();
  const hasValue = trimmed.length > 0;

  const captureBase64 = () =>
    new Promise<string | null>((resolve) => {
      const ref = qrRef.current;
      if (!ref) {
        resolve(null);
        return;
      }
      // The library never rejects; guard so a silent failure can't hang the UI.
      const timeout = setTimeout(() => resolve(null), 4000);
      ref.toDataURL((base64) => {
        clearTimeout(timeout);
        resolve(base64);
      });
    });

  const handleSave = async () => {
    const base64 = await captureBase64();
    if (!base64) {
      notify(t('qr.saveFailed'));
      return;
    }

    const ok = await shareQRImage(base64, qrFileName(trimmed));
    if (ok) recordCode(trimmed, 'generated');
    else notify(t('qr.saveFailed'));
  };

  const handleShareText = async () => {
    try {
      await Share.share({ message: trimmed });
      recordCode(trimmed, 'generated');
    } catch {
      // The user dismissed the share sheet.
    }
  };

  const handleCopy = async () => {
    await Clipboard.setStringAsync(trimmed);
    recordCode(trimmed, 'generated');
    notify(t('qr.copied'));
  };

  const handleClearHistory = async () => {
    const confirmed = await confirm({
      title: t('qr.clearHistoryTitle'),
      message: t('qr.clearHistoryBody'),
      confirmLabel: t('qr.clearHistory'),
      cancelLabel: t('common.cancel'),
      destructive: true,
    });
    if (confirmed) clearHistory();
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScreenHeader
        title={t('qr.title')}
        onBack={() => router.back()}
        right={
          <IconButton
            name="scan-outline"
            accessibilityLabel={t('qr.scan')}
            onPress={() => router.push('/qr/scan')}
          />
        }
      />

      <Screen contentContainerStyle={styles.content}>
        <View style={styles.sections}>
          <SegmentedControl
            accessibilityLabel={t('qr.title')}
            options={[
              { value: 'generate', label: t('qr.generate'), icon: 'qr-code-outline' },
              { value: 'scan', label: t('qr.scan'), icon: 'scan-outline' },
            ]}
            value="generate"
            onChange={(next) => {
              if (next === 'scan') router.push('/qr/scan');
            }}
          />

          <TextField
            label={t('qr.content')}
            meta={trimmed.length > 0 ? String(trimmed.length) : undefined}
            value={value}
            onChangeText={setValue}
            placeholder={t('qr.contentPlaceholder')}
            autoCapitalize="none"
            autoCorrect={false}
            multiline
            autoFocus
          />

          <Card style={styles.preview}>
            {hasValue ? (
              <>
                {/* White plate regardless of theme — QR contrast must not invert. */}
                <View style={styles.plate}>
                  <QRCodeView
                    value={trimmed}
                    size={QR_SIZE}
                    backgroundColor="#FFFFFF"
                    color="#000000"
                    getRef={(ref) => {
                      qrRef.current = ref as unknown as QRCodeRef | null;
                    }}
                  />
                </View>

                <Text variant="caption" color="textSecondary" align="center" numberOfLines={2}>
                  {trimmed}
                </Text>

                <View style={styles.actions}>
                  <Button label={t('qr.save')} icon="download-outline" variant="secondary" shape="pill" onPress={handleSave} />
                  <Button label={t('common.share')} icon="share-outline" variant="secondary" shape="pill" onPress={handleShareText} />
                  <Button label={t('qr.copy')} icon="copy-outline" variant="secondary" shape="pill" onPress={handleCopy} />
                </View>
              </>
            ) : (
              <View style={[styles.placeholder, { borderColor: theme.border }]}>
                <Text variant="body" color="textTertiary" align="center">
                  {t('qr.emptyGenerator')}
                </Text>
              </View>
            )}
          </Card>

          {codes.length > 0 ? (
            <View style={styles.history}>
              <SectionLabel
                label={t('qr.history')}
                right={
                  <IconButton
                    name="trash-outline"
                    size={18}
                    accessibilityLabel={t('qr.clearHistory')}
                    onPress={handleClearHistory}
                  />
                }
              />

              <Card style={styles.card}>
                {codes.map((code, index) => (
                  <Fragment key={code.id}>
                    {index > 0 ? <Divider inset={50} /> : null}
                    <ListRow
                      title={code.value}
                      subtitle={`${code.kind === 'scanned' ? t('qr.scanned') : t('qr.generated')} · ${formatRelativeTimestamp(
                        code.createdAt,
                        preferences.language,
                        { today: t('common.today'), yesterday: t('common.yesterday') },
                        preferences.timeFormat
                      )}`}
                      subtitleDot={code.kind === 'scanned' ? theme.income : theme.primary}
                      icon={code.kind === 'scanned' ? 'scan-outline' : 'qr-code-outline'}
                      tone={code.kind === 'scanned' ? 'green' : 'purple'}
                      iconShape="circle"
                      onPress={() => setValue(code.value)}
                      right={
                        isUrlLike(code.value) ? (
                          <IconButton
                            name="bookmark-outline"
                            size={18}
                            accessibilityLabel={t('qr.saveAsLink')}
                            onPress={() =>
                              router.push(`/link/new?url=${encodeURIComponent(code.value)}`)
                            }
                          />
                        ) : undefined
                      }
                    />
                  </Fragment>
                ))}
              </Card>
            </View>
          ) : null}
        </View>
      </Screen>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { paddingTop: Spacing.lg },
  sections: { gap: Spacing.xl },
  preview: { alignItems: 'center', gap: Spacing.lg },
  plate: { backgroundColor: '#FFFFFF', padding: Spacing.lg, borderRadius: Radius.md },
  placeholder: {
    width: '100%',
    height: QR_SIZE,
    borderRadius: Radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
  },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, justifyContent: 'center' },
  history: { gap: Spacing.sm },
  historyHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  card: { paddingVertical: Spacing.xs, paddingHorizontal: Spacing.lg },
});
