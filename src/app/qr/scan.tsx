import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Clipboard from 'expo-clipboard';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Linking, Platform, Share, StyleSheet, View } from 'react-native';

import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Button } from '@/components/ui/button';
import { notify } from '@/components/ui/confirm';
import { EmptyState } from '@/components/ui/empty-state';
import { Screen } from '@/components/ui/screen';
import { ScreenHeader } from '@/components/ui/screen-header';
import { Text } from '@/components/ui/text';
import { Radius, Spacing } from '@/constants/theme';
import { isUrlLike, normaliseUrl } from '@/features/links/selectors';
import { useQRCodes } from '@/features/qr/store';
import { createEmptyNote, useNotes } from '@/features/notes/store';
import { useT } from '@/features/settings/store';
import { useTheme } from '@/hooks/use-theme';

export default function QRScanScreen() {
  const router = useRouter();
  const theme = useTheme();
  const t = useT();
  const [permission, requestPermission] = useCameraPermissions();
  const { recordCode } = useQRCodes();
  const { saveNote } = useNotes();

  const [scanned, setScanned] = useState<string | null>(null);

  const isUrl = scanned !== null && isUrlLike(scanned);

  const handleScan = (data: string, format?: string) => {
    // The camera fires continuously; ignore everything until the sheet closes.
    if (scanned !== null) return;
    setScanned(data);
    recordCode(data, 'scanned', format);
  };

  const reset = () => setScanned(null);

  const openResult = async () => {
    if (!scanned) return;
    try {
      await Linking.openURL(normaliseUrl(scanned));
    } catch {
      notify(t('links.openFailed'));
    }
  };

  const shareResult = async () => {
    if (!scanned) return;
    try {
      await Share.share({ message: scanned });
    } catch {
      // The user dismissed the share sheet.
    }
  };

  const copyResult = async () => {
    if (!scanned) return;
    await Clipboard.setStringAsync(scanned);
    notify(t('qr.copied'));
  };

  const saveAsLink = () => {
    if (!scanned) return;
    const value = scanned;
    reset();
    router.push(`/link/new?url=${encodeURIComponent(value)}`);
  };

  const saveAsNote = () => {
    if (!scanned) return;
    const note = createEmptyNote('text');
    saveNote({ ...note, body: scanned });
    reset();
    notify(t('qr.savedAsNote'));
  };

  if (Platform.OS === 'web') {
    return (
      <>
        <ScreenHeader title={t('qr.scanTitle')} onBack={() => router.back()} />
        <Screen>
          <EmptyState icon="camera-outline" title={t('qr.scan')} body={t('qr.notAvailableWeb')} />
        </Screen>
      </>
    );
  }

  if (!permission) {
    // Permissions are still loading — render nothing rather than flashing a prompt.
    return (
      <>
        <ScreenHeader title={t('qr.scanTitle')} onBack={() => router.back()} />
        <Screen>
          <View />
        </Screen>
      </>
    );
  }

  if (!permission.granted) {
    return (
      <>
        <ScreenHeader title={t('qr.scanTitle')} onBack={() => router.back()} />
        <Screen>
          <EmptyState
            icon="camera-outline"
            title={t('qr.permissionTitle')}
            body={permission.canAskAgain ? t('qr.permissionBody') : t('qr.permissionDenied')}
            action={
              permission.canAskAgain
                ? { label: t('qr.permissionAction'), icon: 'camera', onPress: requestPermission }
                : undefined
            }
          />
        </Screen>
      </>
    );
  }

  return (
    <View style={styles.flex}>
      <ScreenHeader title={t('qr.scanTitle')} onBack={() => router.back()} />

      <View style={styles.cameraWrap}>
        <CameraView
          style={StyleSheet.absoluteFill}
          facing="back"
          barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
          onBarcodeScanned={({ data, type }) => handleScan(data, type)}
        />

        {/* Reticle: a plain framed cut-out so the user knows where to aim. */}
        <View style={styles.overlay} pointerEvents="none">
          <View style={[styles.reticle, { borderColor: theme.onPrimary }]} />
          <View style={[styles.hint, { backgroundColor: theme.overlay }]}>
            <Text variant="caption" tint={theme.onPrimary} align="center">
              {t('qr.scanHint')}
            </Text>
          </View>
        </View>
      </View>

      <BottomSheet visible={scanned !== null} onClose={reset} title={t('qr.result')}>
        <View style={styles.sheet}>
          <View style={[styles.resultBox, { backgroundColor: theme.surfaceAlt }]}>
            <Text variant="body" numberOfLines={4}>
              {scanned}
            </Text>
          </View>

          <View style={styles.actions}>
            {isUrl ? (
              <>
                <Button label={t('links.open')} icon="open-outline" onPress={openResult} />
                <Button
                  label={t('qr.saveAsLink')}
                  icon="bookmark-outline"
                  variant="secondary"
                  onPress={saveAsLink}
                />
              </>
            ) : (
              <>
                <Button label={t('qr.copy')} icon="copy-outline" onPress={copyResult} />
                <Button
                  label={t('qr.saveAsNote')}
                  icon="document-text-outline"
                  variant="secondary"
                  onPress={saveAsNote}
                />
              </>
            )}
            <Button
              label={t('common.share')}
              icon="share-outline"
              variant="secondary"
              onPress={shareResult}
            />
          </View>

          <Button label={t('qr.scanAgain')} icon="scan-outline" variant="ghost" onPress={reset} />
        </View>
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  cameraWrap: { flex: 1, overflow: 'hidden' },
  overlay: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xl,
  },
  reticle: {
    width: 240,
    height: 240,
    borderWidth: 3,
    borderRadius: Radius.xl,
    opacity: 0.9,
  },
  hint: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm, borderRadius: Radius.pill },
  sheet: { gap: Spacing.lg, paddingBottom: Spacing.sm },
  resultBox: { padding: Spacing.lg, borderRadius: Radius.md },
  actions: { gap: Spacing.sm },
});
