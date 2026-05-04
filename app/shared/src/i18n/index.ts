import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import HttpBackend from 'i18next-http-backend'

export function initI18n(ns: string[] = ['common']) {
  if (i18n.isInitialized) return i18n

  i18n
    .use(HttpBackend)
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      fallbackLng: 'en',
      supportedLngs: ['en', 'de'],
      ns,
      defaultNS: 'common',
      interpolation: { escapeValue: false },
      detection: {
        order: ['localStorage', 'navigator'],
        caches: ['localStorage'],
      },
      backend: {
        loadPath: `${import.meta.env.BASE_URL}locales/{{lng}}/{{ns}}.json`,
      },
    })

  return i18n
}

export { i18n }
