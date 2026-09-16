import { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { DateField } from '@/components/ui/date-field';
import { IconButton } from '@/components/ui/icon-button';
import { Screen } from '@/components/ui/screen';
import { ScreenHeader } from '@/components/ui/screen-header';
import { TextField } from '@/components/ui/text-field';
import { Spacing } from '@/constants/theme';
import { useT } from '@/features/settings/store';
import { confirm } from '@/components/ui/confirm';
import { todayISO } from '@/lib/date';
import type { Currency, ISODate, TransactionType } from '@/types';

import { buildConversion, parseAmount } from '../currency';
import type { TransactionDraft } from '../store';
import { AmountInput } from './amount-input';
import { CategoryPicker } from './category-picker';

export interface TransactionFormValues {
  amount: string;
  currency: Currency;
  categoryId: string | null;
  date: ISODate;
  note: string;
}

export interface TransactionFormProps {
  type: TransactionType;
  rate: number;
  initialValues?: Partial<TransactionFormValues>;
  onSubmit: (draft: TransactionDraft) => void;
  onCancel: () => void;
  onDelete?: () => void;
  mode: 'create' | 'edit';
}

interface Errors {
  amount?: string;
  category?: string;
}

/**
 * Shared by the add and edit screens. Validation runs on submit rather than on
 * every keystroke, so the form never shouts at a user mid-typing.
 */
export function TransactionForm({
  type,
  rate,
  initialValues,
  onSubmit,
  onCancel,
  onDelete,
  mode,
}: TransactionFormProps) {
  const t = useT();

  const [amount, setAmount] = useState(initialValues?.amount ?? '');
  const [currency, setCurrency] = useState<Currency>(initialValues?.currency ?? 'USD');
  const [categoryId, setCategoryId] = useState<string | null>(initialValues?.categoryId ?? null);
  const [date, setDate] = useState<ISODate>(initialValues?.date ?? todayISO());
  const [note, setNote] = useState(initialValues?.note ?? '');
  const [errors, setErrors] = useState<Errors>({});

  const isIncome = type === 'income';

  const title = isIncome
    ? mode === 'create'
      ? t('transaction.addIncome')
      : t('transaction.editIncome')
    : mode === 'create'
      ? t('transaction.addExpense')
      : t('transaction.editExpense');

  const handleSubmit = () => {
    const parsed = parseAmount(amount);
    const nextErrors: Errors = {};

    if (parsed === null || parsed <= 0) nextErrors.amount = t('transaction.errorAmount');
    if (!categoryId) nextErrors.category = t('transaction.errorCategory');

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    onSubmit({
      type,
      amount: parsed!,
      currency,
      categoryId: categoryId!,
      date,
      note: note.trim() || undefined,
      ...buildConversion(parsed!, currency, rate),
    });
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    const confirmed = await confirm({
      title: t('transaction.deleteTitle'),
      message: t('transaction.deleteBody'),
      confirmLabel: t('common.delete'),
      cancelLabel: t('common.cancel'),
      destructive: true,
    });
    if (confirmed) onDelete();
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScreenHeader
        title={title}
        onBack={onCancel}
        backLabel={t('common.cancel')}
        right={
          onDelete ? (
            <IconButton
              name="trash-outline"
              accessibilityLabel={t('common.delete')}
              onPress={handleDelete}
            />
          ) : null
        }
      />

      <Screen contentContainerStyle={styles.content}>
        <View style={styles.fields}>
          <AmountInput
            value={amount}
            onChangeValue={(next) => {
              setAmount(next);
              if (errors.amount) setErrors((current) => ({ ...current, amount: undefined }));
            }}
            currency={currency}
            onChangeCurrency={setCurrency}
            rate={rate}
            type={type}
            error={errors.amount}
            autoFocus={mode === 'create'}
          />

          <CategoryPicker
            type={type}
            value={categoryId}
            onChange={(next) => {
              setCategoryId(next);
              if (errors.category) setErrors((current) => ({ ...current, category: undefined }));
            }}
            label={t('transaction.category')}
            error={errors.category}
          />

          <DateField label={t('transaction.date')} value={date} onChange={setDate} />

          <TextField
            label={t('transaction.note')}
            value={note}
            onChangeText={setNote}
            placeholder={t('transaction.notePlaceholder')}
            hint={t('common.optional')}
            returnKeyType="done"
            onSubmitEditing={handleSubmit}
          />
        </View>

        <Button
          label={isIncome ? t('transaction.saveIncome') : t('transaction.saveExpense')}
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
  submit: { marginTop: Spacing.xxl },
});
