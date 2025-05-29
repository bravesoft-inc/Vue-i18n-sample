import './assets/main.css'

import { createApp } from 'vue'
import { createI18n } from 'vue-i18n'
import App from './App.vue'

// 言語ファイルのインポート
import en from './locales/en.json'
import ja from './locales/ja.json'
import fr from './locales/fr.json' // <--- フランス語をインポート
import zh from './locales/zh.json' // <--- 中国語をインポート

const i18n = createI18n({
  legacy: false,
  locale: 'ja', // デフォルト言語 (必要に応じて変更)
  fallbackLocale: 'en',
  messages: {
    en,
    ja,
    fr, // <--- フランス語のメッセージを追加
    zh  // <--- 中国語のメッセージを追加
  }
})

const app = createApp(App)
app.use(i18n)
app.mount('#app')
