import type { Language } from "./translations";

type TranslationParams = Record<string, number | string>;

type PerLanguageDictionary = Record<Language, Record<string, string>>;

function interpolate(template: string, params?: TranslationParams): string {
  if (!params) {
    return template;
  }

  return Object.entries(params).reduce((output, [key, value]) => {
    return output.replaceAll(`{${key}}`, String(value));
  }, template);
}

export function makeTranslator(language: Language, dictionary: PerLanguageDictionary) {
  return (source: string, params?: TranslationParams): string => {
    const translated = language === "fr" ? source : dictionary[language][source] ?? source;
    return interpolate(translated, params);
  };
}
