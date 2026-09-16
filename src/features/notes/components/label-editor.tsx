import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Chip } from '@/components/ui/chip';
import { IconButton } from '@/components/ui/icon-button';
import { Text } from '@/components/ui/text';
import { TextField } from '@/components/ui/text-field';
import { Spacing } from '@/constants/theme';
import { useT } from '@/features/settings/store';

export interface LabelEditorProps {
  labels: string[];
  /** Labels already used elsewhere, offered as one-tap suggestions. */
  suggestions: string[];
  onChange: (labels: string[]) => void;
}

/** Normalised so `#Work`, `work ` and `Work` never become three labels. */
function normalise(raw: string): string {
  return raw.trim().replace(/^#/, '').replace(/\s+/g, ' ');
}

export function LabelEditor({ labels, suggestions, onChange }: LabelEditorProps) {
  const t = useT();
  const [draft, setDraft] = useState('');

  const add = (raw: string) => {
    const label = normalise(raw);
    if (!label) return;
    const exists = labels.some((existing) => existing.toLowerCase() === label.toLowerCase());
    if (!exists) onChange([...labels, label]);
    setDraft('');
  };

  const remove = (label: string) => onChange(labels.filter((existing) => existing !== label));

  const unused = suggestions.filter(
    (suggestion) => !labels.some((label) => label.toLowerCase() === suggestion.toLowerCase())
  );

  return (
    <View style={styles.container}>
      {labels.length > 0 ? (
        <View style={styles.chips}>
          {labels.map((label) => (
            <Chip
              key={label}
              label={`#${label}`}
              selected
              onRemove={() => remove(label)}
              removeLabel={`${t('common.delete')} ${label}`}
            />
          ))}
        </View>
      ) : null}

      <View style={styles.inputRow}>
        <View style={styles.input}>
          <TextField
            value={draft}
            onChangeText={setDraft}
            onSubmitEditing={() => add(draft)}
            placeholder={t('notes.labelPlaceholder')}
            returnKeyType="done"
            autoCapitalize="none"
          />
        </View>
        <IconButton
          name="add"
          accessibilityLabel={t('notes.addLabel')}
          onPress={() => add(draft)}
          disabled={!normalise(draft)}
          filled
        />
      </View>

      {unused.length > 0 ? (
        <View style={styles.suggestions}>
          <Text variant="caption" color="textTertiary">
            {t('notes.labels')}
          </Text>
          <View style={styles.chips}>
            {unused.map((suggestion) => (
              <Chip key={suggestion} label={`#${suggestion}`} onPress={() => add(suggestion)} />
            ))}
          </View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: Spacing.md },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  inputRow: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm },
  input: { flex: 1 },
  suggestions: { gap: Spacing.sm },
});
