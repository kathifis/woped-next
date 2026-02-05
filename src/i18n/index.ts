import { createI18n } from 'vue-i18n'
import en from './locales/en'
import de from './locales/de'

export const i18n = createI18n({
  legacy: false, // Use Composition API
  locale: 'en',
  fallbackLocale: 'en',
  messages: {
    en,
    de,
  },
})

export function setLocale(locale: string) {
  i18n.global.locale.value = locale as 'en' | 'de'
}
