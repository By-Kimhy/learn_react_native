import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Share, StyleSheet, Switch, View } from 'react-native';

import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Button } from '@/components/ui/button';
import { BrandMark } from '@/components/ui/brand-mark';
import { Card } from '@/components/ui/card';
import { confirm, notify } from '@/components/ui/confirm';
import { Divider } from '@/components/ui/divider';
import { Icon, type IconName } from '@/components/ui/icon';
import { ListRow } from '@/components/ui/list-row';
import { Screen } from '@/components/ui/screen';
import { ScreenHeader } from '@/components/ui/screen-header';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { Text } from '@/components/ui/text';
import { TextField } from '@/components/ui/text-field';
import { Radius, Spacing } from '@/constants/theme';
import { looksLikeCursorKey } from '@/features/ai/client';
import { maskKey, useAPIKey } from '@/features/ai/key-store';
import { Currencies, parseAmount } from '@/features/money/currency';
import { ensurePermission } from '@/features/reminders/notifications';
import { usePreferences, useT } from '@/features/settings/store';
import { useTheme } from '@/hooks/use-theme';
import { Languages } from '@/lib/i18n';
import { clearAll, exportAll, importAll, isExportBundle } from '@/lib/storage';
import { useDataVersion } from '@/store/data-version';
import type { AppearancePreference, TimeFormat } from '@/types';

type Sheet = 'none' | 'rate' | 'import' | 'aiKey';

export default function SettingsScreen() {
  const router = useRouter();
  const theme = useTheme();
  const t = useT();
  const { preferences, updatePreferences } = usePreferences();
  const { reload } = useDataVersion();
  const { apiKey, supported: aiSupported, saveKey, clearKey } = useAPIKey();

  const [sheet, setSheet] = useState<Sheet>('none');
  const [rateDraft, setRateDraft] = useState(String(preferences.exchangeRate));
  const [rateError, setRateError] = useState<string>();
  const [importDraft, setImportDraft] = useState('');
  const [importError, setImportError] = useState<string>();
  const [keyDraft, setKeyDraft] = useState('');
  const [keyError, setKeyError] = useState<string>();

  const appVersion = Constants.expoConfig?.version ?? '1.0.0';

  const saveRate = () => {
    const parsed = parseAmount(rateDraft);
    if (parsed === null || parsed <= 0) {
      setRateError(t('settings.exchangeRateError'));
      return;
    }
    updatePreferences({ exchangeRate: parsed });
    setRateError(undefined);
    setSheet('none');
  };

  /**
   * Turning the switch on is only meaningful if Android agrees, so ask for the
   * OS permission here. Otherwise the row reads "on" while every reminder is
   * silently dropped — the switch would be describing a wish, not the state.
   */
  const toggleNotifications = async (value: boolean) => {
    if (!value) {
      updatePreferences({ notificationsEnabled: false });
      return;
    }

    const ok = await ensurePermission();
    updatePreferences({ notificationsEnabled: ok });
    if (!ok) notify(t('reminders.permissionTitle'), t('reminders.permissionBody'));
  };

  const handleExport = async () => {
    try {
      const bundle = await exportAll();
      await Share.share({
        title: t('settings.exportTitle'),
        message: JSON.stringify(bundle, null, 2),
      });
    } catch {
      notify(t('settings.exportFailed'));
    }
  };

  const handleImport = async () => {
    try {
      const parsed: unknown = JSON.parse(importDraft);
      if (!isExportBundle(parsed)) {
        setImportError(t('settings.importInvalid'));
        return;
      }
      await importAll(parsed);
      // Every store re-reads from disk rather than holding stale memory state.
      reload();
      setImportDraft('');
      setImportError(undefined);
      setSheet('none');
      notify(t('settings.importSuccess'));
    } catch {
      setImportError(t('settings.importInvalid'));
    }
  };

  const saveApiKey = async () => {
    const trimmed = keyDraft.trim();
    // A light sanity check only — the real verdict comes from the first request.
    if (!looksLikeCursorKey(trimmed)) {
      setKeyError(t('ai.keyInvalid'));
      return;
    }

    const ok = await saveKey(trimmed);
    if (!ok) {
      setKeyError(t('ai.keySaveFailed'));
      return;
    }

    setKeyDraft('');
    setKeyError(undefined);
    setSheet('none');
    notify(t('ai.keySaved'));
  };

  const removeApiKey = async () => {
    const confirmed = await confirm({
      title: t('ai.removeKeyTitle'),
      message: t('ai.removeKeyBody'),
      confirmLabel: t('ai.removeKey'),
      cancelLabel: t('common.cancel'),
      destructive: true,
    });
    if (confirmed) await clearKey();
  };

  const handleClear = async () => {
    const confirmed = await confirm({
      title: t('settings.clearTitle'),
      message: t('settings.clearBody'),
      confirmLabel: t('settings.clearData'),
      cancelLabel: t('common.cancel'),
      destructive: true,
    });
    if (!confirmed) return;

    await clearAll();
    reload();
  };

  return (
    <>
      <ScreenHeader title={t('settings.title')} onBack={() => router.back()} />

      <Screen contentContainerStyle={styles.content}>
        <View style={styles.sections}>
          <Group title={t('settings.currency')}>
            <ListRow
              title={t('settings.preferredCurrency')}
              icon="wallet-outline"
              tone="blue"
              right={
                <SegmentedControl
                  accessibilityLabel={t('settings.preferredCurrency')}
                  options={Currencies.map((code) => ({ value: code, label: code }))}
                  value={preferences.displayCurrency}
                  onChange={(value) => updatePreferences({ displayCurrency: value })}
                  style={styles.inlineToggle}
                />
              }
            />

            <Divider inset={50} />

            <ListRow
              title={t('settings.exchangeRate')}
              subtitle={t('settings.exchangeRateHint', {
                rate: preferences.exchangeRate.toLocaleString('en-US'),
              })}
              icon="swap-horizontal-outline"
              tone="blue"
              showChevron
              onPress={() => {
                setRateDraft(String(preferences.exchangeRate));
                setRateError(undefined);
                setSheet('rate');
              }}
            />
          </Group>

          <Group title={t('settings.appearance')}>
            <SegmentedControl
              accessibilityLabel={t('settings.appearance')}
              iconPosition="above"
              shape="rounded"
              options={
                [
                  { value: 'light', label: t('settings.light'), icon: 'sunny-outline' },
                  { value: 'dark', label: t('settings.dark'), icon: 'moon-outline' },
                  { value: 'system', label: t('settings.system'), icon: 'phone-portrait-outline' },
                ] as { value: AppearancePreference; label: string; icon: IconName }[]
              }
              value={preferences.appearance}
              onChange={(value) => updatePreferences({ appearance: value })}
            />
          </Group>

          <Group title={t('settings.language')}>
            <SegmentedControl
              accessibilityLabel={t('settings.language')}
              options={Languages.map((language) => ({
                value: language.code,
                label: t(language.labelKey),
              }))}
              value={preferences.language}
              onChange={(value) => updatePreferences({ language: value })}
            />

            <Divider />

            {/* Kept beside language because it is a regional format, not a
                theme — and deliberately a choice, since plenty of people want
                a 24-hour clock in a locale that defaults to AM/PM. */}
            <ListRow
              title={t('settings.timeFormat')}
              icon="time-outline"
              tone="indigo"
              right={
                <SegmentedControl
                  accessibilityLabel={t('settings.timeFormat')}
                  options={
                    [
                      { value: '12h', label: t('settings.time12') },
                      { value: '24h', label: t('settings.time24') },
                    ] as { value: TimeFormat; label: string }[]
                  }
                  value={preferences.timeFormat}
                  onChange={(value) => updatePreferences({ timeFormat: value })}
                  style={styles.inlineToggle}
                />
              }
            />
          </Group>

          <Group title={t('settings.notifications')}>
            <ListRow
              title={t('settings.notificationsEnabled')}
              subtitle={t('settings.notificationsHint')}
              icon="notifications-outline"
              tone="green"
              right={
                <Switch
                  value={preferences.notificationsEnabled}
                  onValueChange={toggleNotifications}
                  trackColor={{ true: theme.primary, false: theme.surfaceSunken }}
                  accessibilityLabel={t('settings.notificationsEnabled')}
                />
              }
            />
          </Group>

          <Group title={t('ai.title')}>
            {aiSupported ? (
              <>
                <ListRow
                  title={t('ai.apiKey')}
                  subtitle={apiKey ? maskKey(apiKey) : t('ai.setupBody')}
                  subtitleDot={apiKey ? theme.income : undefined}
                  icon="key-outline"
                  tone="blue"
                  showChevron
                  onPress={() => {
                    setKeyDraft('');
                    setKeyError(undefined);
                    setSheet('aiKey');
                  }}
                />
                {apiKey ? (
                  <>
                    <Divider inset={50} />
                    <ListRow
                      title={t('ai.removeKey')}
                      icon="close-circle-outline"
                      destructive
                      onPress={removeApiKey}
                      right={<Icon name="close" size={18} tint={theme.expense} />}
                    />
                  </>
                ) : null}
              </>
            ) : (
              <ListRow title={t('ai.unsupported')} icon="sparkles-outline" disabled />
            )}
          </Group>

          <Group title={t('settings.data')}>
            <ListRow
              title={t('settings.exportData')}
              icon="share-outline"
              tone="teal"
              showChevron
              onPress={handleExport}
            />
            <Divider inset={50} />
            <ListRow
              title={t('settings.importData')}
              icon="download-outline"
              tone="cyan"
              showChevron
              onPress={() => {
                setImportError(undefined);
                setSheet('import');
              }}
            />
            <Divider inset={50} />
            <ListRow
              title={t('settings.clearData')}
              icon="trash-outline"
              destructive
              onPress={handleClear}
            />
          </Group>

          <View style={styles.footer}>
            <View style={[styles.footerMark, { backgroundColor: theme.primarySoft }]}>
              <BrandMark size={22} />
            </View>
            <Text variant="bodyStrong" align="center">
              LifeHub {appVersion}
            </Text>
            <Text variant="caption" color="textTertiary" align="center">
              {t('settings.about')}
            </Text>
          </View>
        </View>
      </Screen>

      <BottomSheet
        visible={sheet === 'rate'}
        onClose={() => setSheet('none')}
        title={t('settings.exchangeRateEdit')}>
        <View style={styles.sheetBody}>
          <TextField
            label="1 USD = ? KHR"
            value={rateDraft}
            onChangeText={(value) => {
              setRateDraft(value);
              setRateError(undefined);
            }}
            keyboardType="decimal-pad"
            inputMode="decimal"
            error={rateError}
            hint={t('settings.exchangeRateNote')}
            autoFocus
          />
          <Button label={t('common.save')} onPress={saveRate} fullWidth />
        </View>
      </BottomSheet>

      <BottomSheet
        visible={sheet === 'aiKey'}
        onClose={() => setSheet('none')}
        title={t('ai.setupTitle')}>
        <View style={styles.sheetBody}>
          <Text variant="caption" color="textSecondary">
            {t('ai.setupBody')}
          </Text>
          <TextField
            label={t('ai.apiKey')}
            value={keyDraft}
            onChangeText={(value) => {
              setKeyDraft(value);
              setKeyError(undefined);
            }}
            placeholder={t('ai.apiKeyPlaceholder')}
            autoCapitalize="none"
            autoCorrect={false}
            secureTextEntry
            error={keyError}
            hint={apiKey ? t('ai.apiKeyStored') : undefined}
            autoFocus
          />
          <Button
            label={t('ai.saveKey')}
            onPress={saveApiKey}
            disabled={!keyDraft.trim()}
            fullWidth
          />
        </View>
      </BottomSheet>

      <BottomSheet
        visible={sheet === 'import'}
        onClose={() => setSheet('none')}
        title={t('settings.importTitle')}>
        <View style={styles.sheetBody}>
          <Text variant="caption" color="textSecondary">
            {t('settings.importBody')}
          </Text>
          <TextField
            value={importDraft}
            onChangeText={(value) => {
              setImportDraft(value);
              setImportError(undefined);
            }}
            placeholder={t('settings.importPlaceholder')}
            autoCapitalize="none"
            autoCorrect={false}
            multiline
            error={importError}
          />
          <Button
            label={t('settings.importData')}
            onPress={handleImport}
            disabled={!importDraft.trim()}
            fullWidth
          />
        </View>
      </BottomSheet>
    </>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.group}>
      <Text variant="overline" color="textSecondary">
        {title.toUpperCase()}
      </Text>
      <Card style={styles.card}>{children}</Card>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: Spacing.lg },
  sections: { gap: Spacing.xl },
  group: { gap: Spacing.sm },
  card: { paddingVertical: Spacing.sm, paddingHorizontal: Spacing.lg, gap: Spacing.sm },
  field: { gap: Spacing.sm, paddingVertical: Spacing.xs },
  // Narrow enough to sit in a row beside its label without crowding it.
  inlineToggle: { width: 132 },
  footer: { alignItems: 'center', gap: Spacing.xs, paddingTop: Spacing.sm },
  footerMark: {
    width: 34,
    height: 34,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs,
  },
  sheetBody: { gap: Spacing.lg, paddingBottom: Spacing.sm },
});
