'use client';

import { useProfile } from '@/hooks/use-profile';
import { translations, type Locale, type TranslationKey } from '@/lib/i18n/translations';
import { createContext, useCallback, useContext, useMemo } from 'react';

type I18nContextValue = {
  locale: Locale;
  t: (key: TranslationKey) => string;
  setLocale: (locale: Locale) => Promise<void>;
};

const I18nContext = createContext<I18nContextValue | null>(null);

const DEFAULT_LOCALE: Locale = 'pt';

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const { profile, updateProfile } = useProfile();

  const locale: Locale = (profile?.preferred_language as Locale) || DEFAULT_LOCALE;
  const dict = translations[locale] ?? translations.en;

  const t = useCallback(
    (key: TranslationKey) => {
      return (dict[key] ?? (translations.en as typeof dict)[key] ?? key) as string;
    },
    [dict]
  );

  const setLocale = useCallback(
    async (newLocale: Locale) => {
      await updateProfile({ preferred_language: newLocale });
    },
    [updateProfile]
  );

  const value = useMemo<I18nContextValue>(() => ({ locale, t, setLocale }), [locale, t, setLocale]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
}
