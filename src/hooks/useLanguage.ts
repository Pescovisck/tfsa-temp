import { useState, useEffect, useCallback } from 'react';
import { translations, type Language, type TranslationKey } from '../i18n/translations';

const STORAGE_KEY = 'tf_lang';

function getInitialLanguage(): Language {
  if (typeof window === 'undefined') return 'en';

  const stored = localStorage.getItem(STORAGE_KEY) as Language | null;
  if (stored && (stored === 'en' || stored === 'pt' || stored === 'es')) {
    return stored;
  }

  const navLang = (navigator.language || '').toLowerCase();
  if (navLang.startsWith('pt')) return 'pt';
  if (navLang.startsWith('es')) return 'es';
  return 'en';
}

export function useLanguage() {
  const [language, setLanguageState] = useState<Language>(getInitialLanguage);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, language);
    document.documentElement.lang = language;
  }, [language]);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
  }, []);

  const t = useCallback((key: TranslationKey, fallback?: string): string => {
    const langDict = translations[language] || translations.en;
    return (langDict as any)[key] ?? (translations.en as any)[key] ?? fallback ?? key;
  }, [language]);

  return {
    language,
    setLanguage,
    t,
  };
}
