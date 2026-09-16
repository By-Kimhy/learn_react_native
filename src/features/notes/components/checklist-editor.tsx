import { useRef } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

import { IconButton } from '@/components/ui/icon-button';
import { Icon } from '@/components/ui/icon';
import { PressableScale } from '@/components/ui/pressable-scale';
import { Text } from '@/components/ui/text';
import { Spacing, Typography } from '@/constants/theme';
import { useT } from '@/features/settings/store';
import { useTheme } from '@/hooks/use-theme';
import type { ChecklistItem } from '@/types';

import { createChecklistItem } from '../store';

export interface ChecklistEditorProps {
  items: ChecklistItem[];
  onChange: (items: ChecklistItem[]) => void;
}

export function ChecklistEditor({ items, onChange }: ChecklistEditorProps) {
  const theme = useTheme();
  const t = useT();
  // Lets "submit" on one row jump focus straight into the row it creates.
  const inputs = useRef(new Map<string, TextInput>());

  const setText = (id: string, text: string) =>
    onChange(items.map((item) => (item.id === id ? { ...item, text } : item)));

  const toggle = (id: string) =>
    onChange(items.map((item) => (item.id === id ? { ...item, done: !item.done } : item)));

  const remove = (id: string) => onChange(items.filter((item) => item.id !== id));

  const appendAfter = (id?: string) => {
    const item = createChecklistItem();
    if (!id) {
      onChange([...items, item]);
    } else {
      const index = items.findIndex((existing) => existing.id === id);
      onChange([...items.slice(0, index + 1), item, ...items.slice(index + 1)]);
    }
    // The new input mounts on the next frame, so focus after the commit.
    requestAnimationFrame(() => inputs.current.get(item.id)?.focus());
  };

  return (
    <View style={styles.container}>
      {items.map((item) => (
        <View key={item.id} style={styles.row}>
          <PressableScale
            accessibilityRole="checkbox"
            accessibilityState={{ checked: item.done }}
            accessibilityLabel={item.text || t('notes.itemPlaceholder')}
            onPress={() => toggle(item.id)}
            scaleTo={0.85}
            hitSlop={8}
            style={styles.checkbox}>
            <Icon
              name={item.done ? 'checkbox' : 'square-outline'}
              size={22}
              tint={item.done ? theme.primary : theme.textSecondary}
            />
          </PressableScale>

          <TextInput
            ref={(node) => {
              if (node) inputs.current.set(item.id, node);
              else inputs.current.delete(item.id);
            }}
            value={item.text}
            onChangeText={(text) => setText(item.id, text)}
            onSubmitEditing={() => appendAfter(item.id)}
            placeholder={t('notes.itemPlaceholder')}
            placeholderTextColor={theme.textTertiary}
            blurOnSubmit={false}
            returnKeyType="next"
            accessibilityLabel={t('notes.itemPlaceholder')}
            style={[
              styles.input,
              Typography.body,
              { color: item.done ? theme.textTertiary : theme.text },
              item.done && styles.done,
            ]}
          />

          <IconButton
            name="close"
            size={18}
            accessibilityLabel={t('common.delete')}
            onPress={() => remove(item.id)}
            style={styles.remove}
          />
        </View>
      ))}

      <PressableScale
        accessibilityRole="button"
        accessibilityLabel={t('notes.addItem')}
        onPress={() => appendAfter()}
        style={styles.add}>
        <Icon name="add" size={20} color="textSecondary" />
        <Text variant="body" color="textSecondary">
          {t('notes.addItem')}
        </Text>
      </PressableScale>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: Spacing.xs },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  checkbox: { width: 30, height: 36, alignItems: 'center', justifyContent: 'center' },
  input: { flex: 1, paddingVertical: Spacing.sm, padding: 0 },
  done: { textDecorationLine: 'line-through' },
  remove: { minWidth: 34, minHeight: 34 },
  add: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingVertical: Spacing.sm, paddingLeft: 4 },
});
