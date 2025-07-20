
import { createI18n } from 'vue-i18n'
import en from '../locale/en'
import ja from '../locale/ja'
import de from '../locale/de'
import zhHans from '../locale/zhHans'
import deCH from '../locale/de-CH'

export default createI18n({
  legacy: false,
  locale: 'de',
  fallbackLocale: 'en',
  messages: {
    en: en,
    ja: ja,
    de: de,
    zhHans: zhHans,
    'de-CH': deCH,
  },
})