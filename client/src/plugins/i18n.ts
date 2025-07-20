import { createI18n } from 'vue-i18n'
import { de, en, ja, zhHans } from '../locale/locale'

export default createI18n({
  legacy: false,
  locale: 'de',
  fallbackLocale: 'en',
  messages: {
    en: en,
    ja: ja,
    de: de,
    zhHans: zhHans,
  },
})