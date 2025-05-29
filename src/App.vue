<script setup lang="ts">
import { useI18n } from 'vue-i18n'
const { t, locale } = useI18n()

function changeLanguage(lang: string) {
  locale.value = lang
}
</script>

<template>
  <main>
    <h1>{{ $t('greeting') }}</h1>
    <p>{{ $t('message.welcome') }}</p>
    <button type="button">{{ $t('button.submit') }}</button>
    <p class="error-message">{{ $t('error.required') }}</p>

    <h2>言語切り替え</h2>
    <button @click="changeLanguage('ja')">日本語</button>
    <button @click="changeLanguage('en')">English</button>
    <button @click="changeLanguage('fr')">Français</button>
    <button @click="changeLanguage('zh')">中文</button>
    <p>現在の言語: {{ locale }}</p>
  </main>
</template>

<style scoped>
/* スタイルは変更なしでOKですが、必要に応じて調整してください */
main {
  font-family: sans-serif;
  padding: 20px;
}
/* ... (他のスタイル定義) ... */
button {
  /* ... */
  margin-bottom: 5px; /* ボタンが多くなったので少しマージン調整 */
}
</style>
