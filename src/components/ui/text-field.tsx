import { forwardRef, useState } from 'react';
import { StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { MinTouchTarget, Radius, Spacing, Typography } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import { Icon, type IconName } from './icon';
import { Text } from './text';

export interface TextFieldProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  hint?: string;
  error?: string;
  multiline?: boolean;
  /** A right-aligned note on the label row — a character count, say. */
  meta?: string;
  /** A glyph inside the field's leading edge — a magnifier on a search box. */
  icon?: IconName;
}

export const TextField = forwardRef<TextInput, TextFieldProps>(function TextField(
  { label, hint, error, multiline, meta, icon, onFocus, onBlur, ...rest },
  ref
) {
  const theme = useTheme();
  const [focused, setFocused] = useState(false);

  // The border carries three states — error, focus, resting — in that order of
  // precedence, so a focused field with an error still reads as an error.
  const borderColor = error ? theme.expense : focused ? theme.primary : theme.border;

  return (
    <View style={styles.container}>
      {label || meta ? (
        <View style={styles.labelRow}>
          {label ? (
            <Text variant="overline" color="textTertiary" numberOfLines={1} style={styles.label}>
              {label.toUpperCase()}
            </Text>
          ) : (
            <View style={styles.label} />
          )}

          {meta ? (
            <Text variant="caption" color="textTertiary" numberOfLines={1}>
              {meta}
            </Text>
          ) : null}
        </View>
      ) : null}

      <View
        style={[
          styles.field,
          { backgroundColor: theme.surface, borderColor },
          multiline && styles.fieldMultiline,
        ]}>
        {icon ? (
          <Icon name={icon} size={18} tint={focused ? theme.primary : theme.textTertiary} />
        ) : null}

        <TextInput
          ref={ref}
          style={[styles.input, Typography.body, { color: theme.text }, multiline && styles.multiline]}
          placeholderTextColor={theme.textTertiary}
          multiline={multiline}
          accessibilityLabel={label}
          onFocus={(event) => {
            setFocused(true);
            onFocus?.(event);
          }}
          onBlur={(event) => {
            setFocused(false);
            onBlur?.(event);
          }}
          {...rest}
        />
      </View>

      {error ? (
        <Text variant="caption" color="expense">
          {error}
        </Text>
      ) : hint ? (
        <Text variant="caption" color="textTertiary">
          {hint}
        </Text>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  container: { gap: Spacing.sm },
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  label: { flex: 1 },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    minHeight: MinTouchTarget + 8,
    borderRadius: Radius.md,
    borderWidth: 1,
    paddingHorizontal: Spacing.lg,
  },
  // A tall field aligns its glyph with the first line, not the middle.
  fieldMultiline: { alignItems: 'flex-start', paddingVertical: Spacing.md },
  input: { flex: 1, paddingVertical: Spacing.md },
  multiline: { minHeight: 104, paddingVertical: 0, textAlignVertical: 'top' },
});
