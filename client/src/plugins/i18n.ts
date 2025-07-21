
import { createI18n } from 'vue-i18n'
import en from '../locale/en'
import ja from '../locale/ja'
import de from '../locale/de'
import zhHans from '../locale/zhHans'
import deCH from '../locale/de-CH'

// Get saved locale from localStorage or default to 'de'
const savedLocale = localStorage.getItem('kubero.locale') || 'de'

const i18n = createI18n({
  legacy: false,
  locale: savedLocale,
  fallbackLocale: 'en',
  messages: {
    en: en,
    ja: ja,
    de: de,
    zhHans: zhHans,
    'de-CH': deCH,
  },
})

export default i18n