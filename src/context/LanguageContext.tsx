import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  DIRECTION_BY_LANGUAGE,
  LANGUAGE_STORAGE_KEY,
  LOCALE_BY_LANGUAGE,
  translations,
  type Language,
} from "../i18n/translations";

type TranslationParams = Record<string, number | string>;

type LanguageContextValue = {
  language: Language;
  setLanguage: (nextLanguage: Language) => void;
  t: (key: string, params?: TranslationParams) => string;
  locale: string;
  direction: "ltr" | "rtl";
};

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

const interpolate = (template: string, params?: TranslationParams): string => {
  if (!params) {
    return template;
  }

  return Object.entries(params).reduce((output, [paramKey, value]) => {
    return output.replaceAll(`{${paramKey}}`, String(value));
  }, template);
};

const getInitialLanguage = (): Language => {
  if (typeof window === "undefined") {
    return "fr";
  }

  const savedLanguage = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
  if (savedLanguage === "fr" || savedLanguage === "en" || savedLanguage === "ar") {
    return savedLanguage;
  }

  return "fr";
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => getInitialLanguage());

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = DIRECTION_BY_LANGUAGE[language];
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  }, [language]);

  const t = useCallback(
    (key: string, params?: TranslationParams) => {
      const translatedValue = translations[language][key] ?? translations.fr[key] ?? key;
      return interpolate(translatedValue, params);
    },
    [language]
  );

  const contextValue = useMemo<LanguageContextValue>(
    () => ({
      language,
      setLanguage,
      t,
      locale: LOCALE_BY_LANGUAGE[language],
      direction: DIRECTION_BY_LANGUAGE[language],
    }),
    [language, t]
  );

  return <LanguageContext.Provider value={contextValue}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used inside LanguageProvider");
  }
  return context;
}
