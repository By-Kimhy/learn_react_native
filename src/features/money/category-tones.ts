import type { AccentName } from '@/constants/theme';

/**
 * Presentation-only colour per category, shared by the picker and every chart
 * so one category is the same hue wherever it appears. It lives here rather
 * than on the `Category` entity so the stored data stays free of styling.
 */
export const CategoryTones: Record<string, AccentName> = {
  salary: 'green',
  freelance: 'blue',
  business: 'purple',
  gift: 'pink',
  investment: 'teal',
  'other-income': 'grey',

  food: 'orange',
  transport: 'blue',
  shopping: 'pink',
  bills: 'indigo',
  entertainment: 'purple',
  health: 'green',
  education: 'cyan',
  work: 'teal',
  travel: 'amber',
  'other-expense': 'grey',
};

export function toneFor(categoryId: string): AccentName {
  return CategoryTones[categoryId] ?? 'grey';
}
