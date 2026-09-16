import type { Category, TransactionType } from '@/types';

/**
 * Categories are a fixed, code-owned list in Phase 1. They are shaped as
 * entities (rather than a plain enum) so user-defined categories can be mixed
 * in later without touching every call site.
 */
export const IncomeCategories: Category[] = [
  { id: 'salary', labelKey: 'category.salary', emoji: '💼', type: 'income' },
  { id: 'freelance', labelKey: 'category.freelance', emoji: '🧑‍💻', type: 'income' },
  { id: 'business', labelKey: 'category.business', emoji: '🏪', type: 'income' },
  { id: 'gift', labelKey: 'category.gift', emoji: '🎁', type: 'income' },
  { id: 'investment', labelKey: 'category.investment', emoji: '📈', type: 'income' },
  { id: 'other-income', labelKey: 'category.otherIncome', emoji: '✨', type: 'income' },
];

export const ExpenseCategories: Category[] = [
  { id: 'food', labelKey: 'category.food', emoji: '🍔', type: 'expense' },
  { id: 'transport', labelKey: 'category.transport', emoji: '🛵', type: 'expense' },
  { id: 'shopping', labelKey: 'category.shopping', emoji: '🛍️', type: 'expense' },
  { id: 'bills', labelKey: 'category.bills', emoji: '🧾', type: 'expense' },
  { id: 'entertainment', labelKey: 'category.entertainment', emoji: '🎬', type: 'expense' },
  { id: 'health', labelKey: 'category.health', emoji: '💊', type: 'expense' },
  { id: 'education', labelKey: 'category.education', emoji: '📚', type: 'expense' },
  { id: 'work', labelKey: 'category.work', emoji: '💻', type: 'expense' },
  { id: 'travel', labelKey: 'category.travel', emoji: '✈️', type: 'expense' },
  { id: 'other-expense', labelKey: 'category.otherExpense', emoji: '📦', type: 'expense' },
];

export const AllCategories: Category[] = [...IncomeCategories, ...ExpenseCategories];

const byId = new Map(AllCategories.map((category) => [category.id, category]));

export function categoriesFor(type: TransactionType): Category[] {
  return type === 'income' ? IncomeCategories : ExpenseCategories;
}

const unknownCategory: Category = {
  id: 'unknown',
  labelKey: 'category.otherExpense',
  emoji: '📦',
  type: 'expense',
};

/** Never returns undefined — a transaction with a stale category still renders. */
export function getCategory(id: string): Category {
  return byId.get(id) ?? unknownCategory;
}
