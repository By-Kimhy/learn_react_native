import { forwardRef } from 'react';
import { StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { MinTouchTarget, Radius, Spacing, Typography } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import { Text } from './text';

export interface TextFieldProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  hint?: string;
  error?: string;
  multiline?: boolean;
}

export const TextField = forwardRef<TextInput, TextFieldProps>(function TextField(
  { label, hint, error, multiline, ...rest },
  ref
) {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      {label ? (
        <Text variant="captionStrong" color="textSecondary">
          {label}
        </Text>
      ) : null}

      <TextInput
        ref={ref}
        style={[
          styles.input,
          Typography.body,
          {
            color: theme.text,
            backgroundColor: theme.surfaceAlt,
            borderColor: error ? theme.expense : 'transparent',
          },
          multiline && styles.multiline,
        ]}
        placeholderTextColor={theme.textTertiary}
        multiline={multiline}
        accessibilityLabel={label}
        {...rest}
      />

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
  container: { gap: Spacing.xs },
  input: {
    minHeight: MinTouchTarget + 4,
    borderRadius: Radius.md,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
  },
  multiline: { minHeight: 96, textAlignVertical: 'top' },
});
