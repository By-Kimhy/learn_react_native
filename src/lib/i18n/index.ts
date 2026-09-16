import type { LanguageCode } from '@/types';

import { en, type TranslationKey } from './en';
import { km } from './km';

export type { TranslationKey };

const dictionaries: Record<LanguageCode, Partial<Record<TranslationKey, string>>> = { en, km };

export const Languages: { code: LanguageCode; labelKey: TranslationKey }[] = [
  { code: 'en', labelKey: 'settings.english' },
  { code: 'km', labelKey: 'settings.khmer' },
];

export type TranslateValues = Record<string, string | number>;

/**
 * Looks up `key` in `language`, falls back to English, and finally to the key
 * itself — a missing string shows up as a visible key instead of a blank space.
 */
export function translate(
  language: LanguageCode,
  key: TranslationKey,
  values?: TranslateValues
): string {
  const template = dictionaries[language]?.[key] ?? en[key] ?? key;
  if (!values) return template;

  return template.replace(/\{(\w+)\}/g, (match, name: string) =>
    name in values ? String(values[name]) : match
  );
}

export type Translator = (key: TranslationKey, values?: TranslateValues) => string;

export function createTranslator(language: LanguageCode): Translator {
  return (key, values) => translate(language, key, values);
}
