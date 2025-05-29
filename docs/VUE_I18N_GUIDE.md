# Vue.js 多言語対応 (i18n) 導入・運用ガイド

このドキュメントは、Vue.js (TypeScript) プロジェクトに `vue-i18n` を用いて多言語対応機能を導入し、スプレッドシート（CSV形式）で翻訳データを効率的に管理・運用する手順を解説します。

## 1. はじめに

現代のWebアプリケーションにおいて、多言語対応はより多くのユーザーにリーチするために重要な機能です。このガイドでは、Vue.jsプロジェクトで `vue-i18n` ライブラリを使用し、翻訳データのメンテナンスを容易にするための実践的なステップを紹介します。

**対象読者:**

* Vue.jsの基本的な知識をお持ちの方
* TypeScriptを使用したプロジェクトでの開発経験がある、または関心がある方
* 効率的な多言語対応の導入・管理方法を求めている方

## 2. 準備

### 2.1. 前提知識・環境

* Node.js (v18.x LTS版以降を推奨、本ガイドではv20.xで動作確認)
* npm (Node.jsに同梱) または yarn / pnpm
* Vue.js (v3) の基本的な知識
* TypeScript の基本的な知識

### 2.2. Vue.js プロジェクトの作成

まだプロジェクトがない場合は、Vue.jsの公式ツール `create-vue` を使用して新しいプロジェクトを作成します。TypeScriptを選択してください。

```bash
npm create vue@latest
```

## 3. vue-i18n の導入と基本設定

### 3.1. vue-i18n のインストール

プロジェクトのルートディレクトリで、以下のコマンドを実行して vue-i18n (Vue 3対応版) をインストールします。

```bash
npm install vue-i18n@next
```

### 3.2. main.ts での初期設定

src/main.ts ファイルを編集し、vue-i18n を初期化してVueアプリケーションに登録します。

```typescript
// src/main.ts
import './assets/main.css'

import { createApp } from 'vue'
import { createI18n } from 'vue-i18n' // Removed type imports for brevity, add if needed
import App from './App.vue'

// 言語ファイルのインポート (これらは変換スクリプトで生成されます)
import en from './locales/en.json'
import ja from './locales/ja.json'
// フランス語、中国語などを追加する場合はここにもインポートを追加
// import fr from './locales/fr.json'
// import zh from './locales/zh.json'

// メッセージオブジェクトの型を定義すると型安全性が向上します (任意)
// interface MessageSchema {
//   greeting: string;
//   message: { welcome: string; };
//   button: { submit: string; };
//   error: { required: string; };
// }

const messages = {
  en,
  ja,
  // fr, // 追加した言語のメッセージ
  // zh,
};

const i18n = createI18n<[], 'en' | 'ja' /* | 'fr' | 'zh' */>({ // 利用する言語コードを列挙
  legacy: false, // Composition API モードを使用
  locale: 'ja', // デフォルトの言語
  fallbackLocale: 'en', // 指定した言語の翻訳がない場合のフォールバック言語
  messages,
});

const app = createApp(App)

app.use(i18n)
app.mount('#app')
```

### 3.3. 初期言語ファイル (JSON) の作成

src フォルダ内に locales というフォルダを作成します。このフォルダに、各言語の翻訳メッセージを格納するJSONファイルが配置されます (例: en.json, ja.json)。

これらのファイルは、後述する「5. 翻訳データの一元管理と自動生成」のステップでスクリプトによって自動生成されるため、この段階では手動で作成する必要はありません。

## 4. コンポーネントでの vue-i18n の利用

### 4.1. テンプレートでの翻訳表示 ($t)

Vueコンポーネントの `<template>` 内では、$t() 関数を使用して翻訳されたテキストを表示します。

```vue
<template>
  <h1>{{ $t('greeting') }}</h1>
  <p>{{ $t('message.welcome') }}</p>
</template>
```

### 4.2. スクリプト (Composition API) での利用 (useI18n)

`<script setup lang="ts">` 内では、useI18n フックを使用して t 関数（翻訳関数）や locale（現在の言語）などを取得します。

```typescript
// src/App.vue の <script setup lang="ts"> 内
import { useI18n } from 'vue-i18n'

const { t, locale } = useI18n()

// スクリプト内で翻訳を使用
console.log(t('greeting'))
```

### 4.3. 言語切り替え機能の実装例

App.vue に簡単な言語切り替え機能を実装します。

```vue
<script setup lang="ts">
import { useI18n } from 'vue-i18n'
const { t, locale } = useI18n()

function changeLanguage(lang: string) {
  locale.value = lang // localeの値を変更すると表示言語が切り替わる
}
</script>

<template>
  <main>
    <h1>{{ $t('greeting') }}</h1>
    <p>{{ $t('message.welcome') }}</p>
    <button type="button">{{ $t('button.submit') }}</button>
    <p class="error-message">{{ $t('error.required') }}</p>

    <hr />
    <h2>言語切り替え</h2>
    <button @click="changeLanguage('ja')">日本語</button>
    <button @click="changeLanguage('en')">English</button>
    <p>現在の言語: {{ locale }}</p>
  </main>
</template>

<style scoped>
/* スタイルは適宜調整してください */
.error-message { color: red; font-weight: bold; }
hr { margin: 20px 0; }
button { margin-right: 5px; margin-bottom: 5px;}
main { padding: 20px; font-family: sans-serif; }
h1, h2 { color: #34495e; }
p { color: #2c3e50; line-height: 1.6; }
button {
  background-color: #42b983;
  color: white;
  border: none;
  padding: 10px 15px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1em;
}
button:hover {
  background-color: #3aa876;
}
</style>
```

## 5. 翻訳データの一元管理と自動生成

翻訳対象の文言が増えると、複数のJSONファイルを手動で同期・更新するのは手間がかかり、ミスの原因にもなります。スプレッドシート（CSV形式）で文言を一元管理し、それを各言語のJSONファイルに自動変換するスクリプトを導入します。

### 5.1. なぜ一元管理か？

- 翻訳者（非エンジニア）との共同作業が容易になる。
- 翻訳漏れやキーの不整合を防ぎやすくなる。
- 全体の翻訳状況を把握しやすくなる。

### 5.2. 管理方法：スプレッドシート (CSV) + 変換スクリプト

### 5.3. translations.csv の準備

**ファイル作成場所:** プロジェクトのルートディレクトリ (例: vue-i18n-sample/translations.csv)。

**フォーマット:**

- 1行目: ヘッダー行。最初の列は key、以降の列は言語コード (例: en, ja, fr, zh)。
- 2行目以降: 各行に翻訳キーと対応する各言語の翻訳文を記述。
- 文字コード: UTF-8 で保存してください。
- CSV区切り文字: カンマ(,)。翻訳文にカンマが含まれる場合は、翻訳文全体をダブルクォーテーション(")で囲ってください。

例 (translations.csv):

```csv
key,ja,en
greeting,こんにちは、世界！,"Hello, world!"
message.welcome,Vue I18n サンプルへようこそ,Welcome to the Vue I18n Sample
button.submit,送信,Submit
error.required,この項目は必須です。,This field is required.
```

### 5.4. 変換スクリプト (scripts/convert-translations.ts) の準備

**必要なライブラリのインストール:**

プロジェクトのルートディレクトリで以下を実行します。

```bash
npm install papaparse dset --save-dev
npm install @types/papaparse --save-dev # papaparseの型定義
```

**スクリプトファイルの作成:**

プロジェクトのルートに scripts フォルダを作成し、その中に convert-translations.ts という名前で以下のスクリプトを保存します。

```typescript
// scripts/convert-translations.ts
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url'; // ESMで__dirnameの代替のため
import Papa from 'papaparse';
import { dset } from 'dset';

console.log('--- Script execution started (convert-translations.ts) ---');

// ESM で __filename と __dirname を取得
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- 設定 ---
const CSV_FILE_PATH = path.resolve(__dirname, '../translations.csv');
const OUTPUT_DIR = path.resolve(__dirname, '../src/locales');
const KEY_COLUMN_NAME = 'key';

interface TranslationRow {
  [key: string]: string;
}

interface Translations {
  [language: string]: Record<string, any>;
}

try {
  console.log(`Attempting to read CSV file from: ${CSV_FILE_PATH}`);
  if (!fs.existsSync(CSV_FILE_PATH)) {
    throw new Error(`CSV file not found at: ${CSV_FILE_PATH}`);
  }

  if (!fs.existsSync(OUTPUT_DIR)) {
    console.log(`Output directory not found. Creating: ${OUTPUT_DIR}`);
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const csvFileContent: string = fs.readFileSync(CSV_FILE_PATH, 'utf8');
  console.log('CSV file read successfully.');

  const parseResult: Papa.ParseResult<TranslationRow> = Papa.parse<TranslationRow>(csvFileContent, {
    header: true,
    skipEmptyLines: true,
  });

  if (parseResult.errors.length > 0) {
    console.error('CSV parsing errors:', parseResult.errors.map(err => `${err.message} (Row: ${err.row})`).join('\n'));
    // 必要に応じてここでエラーをスローして処理を停止
    // throw new Error('CSV parsing failed due to errors.');
  }
  if (!parseResult.data || parseResult.data.length === 0) {
    throw new Error('No data found in CSV file after parsing, or all rows were skipped.');
  }
  console.log(`CSV parsing successful. Found ${parseResult.data.length} data rows.`);

  const data: TranslationRow[] = parseResult.data;
  const headers: string[] = parseResult.meta.fields || [];
  const languages: string[] = headers.filter(field => field && field.trim() !== '' && field !== KEY_COLUMN_NAME);

  if (languages.length === 0) {
    throw new Error(`No language columns found in CSV header. Ensure columns like "en", "ja" exist and are not empty. Header was: [${headers.join(', ')}]`);
  }
  console.log(`Found languages: ${languages.join(', ')}`);

  const translations: Translations = {};
  languages.forEach(lang => {
    translations[lang] = {};
  });

  data.forEach((row: TranslationRow, rowIndex: number) => {
    const key: string | undefined = row[KEY_COLUMN_NAME]?.trim(); // キーの前後の空白を除去
    if (!key) {
      console.warn(`Skipping row ${rowIndex + 2} (CSV row number) due to empty key:`, JSON.stringify(row)); // rowIndexは0-indexed, CSVはヘッダ含めると+2
      return;
    }

    languages.forEach(lang => {
      const translationValue: string | undefined = row[lang];
      // 翻訳文が undefined, null, または空文字(空白のみも含む)でない場合のみ設定
      if (translationValue !== undefined && translationValue !== null && translationValue.trim() !== '') {
        dset(translations[lang], key, translationValue.trim()); // 翻訳文の前後の空白も除去
      } else {
        // 翻訳がないキーに対する警告（必要に応じてコメントアウト解除）
        // console.warn(`Missing or empty translation for key "${key}" in language "${lang}" at CSV row ${rowIndex + 2}.`);
      }
    });
  });

  languages.forEach(lang => {
    const outputFile: string = path.join(OUTPUT_DIR, `${lang}.json`);
    try {
      const jsonData = translations[lang] || {};
      if (Object.keys(jsonData).length === 0) {
        console.warn(`No translations found for language "${lang}". Generating an empty JSON file: ${outputFile}`);
      }
      fs.writeFileSync(outputFile, JSON.stringify(jsonData, null, 2), 'utf8');
      console.log(`Successfully generated ${outputFile}`);
    } catch (err) {
      console.error(`Error writing ${outputFile}:`);
      // エラーオブジェクトを上位のcatchに渡すため再スロー
      if (err instanceof Error) throw err;
      else throw new Error(String(err));
    }
  });

  console.log('Translation files generated successfully!');

} catch (error: any) {
  console.error('An error occurred during script execution:');
  if (error && typeof error === 'object') {
    if ('message' in error) {
      console.error('Error Message:', error.message);
    }
    if ('stack' in error) {
      console.error('Error Stack:', error.stack);
    }
  }
  console.error('Full Error Object:', error);
  process.exit(1);
}
```

### 5.5. 変換スクリプトの実行設定

**package.json の編集:**

package.json ファイルの scripts セクションに、変換スクリプトを実行するためのコマンドを追加します。プロジェクトがESM ("type": "module") で設定されているため、TypeScriptファイルを直接実行するには jiti や ts-node などのツールが必要です。jiti の方が設定がシンプルな場合があります。

**jiti を使用する場合 (推奨):**

jiti が devDependencies に含まれていることを確認してください（Vue CLIやViteのプロジェクトには含まれていることがあります。なければ `npm install jiti --save-dev`）。

```json
{
  "scripts": {
    "convert-translations": "jiti ./scripts/convert-translations.ts"
  }
}
```

**ts-node を使用する場合 (補足):**

ts-node と @types/node が devDependencies にインストールされていることを確認してください。

```json
{
  "scripts": {
    "convert-translations": "node --enable-source-maps --loader ts-node/esm scripts/convert-translations.ts"
  }
}
```

また、tsconfig.node.json (または関連する tsconfig ファイル) の include 配列に "scripts/**/*.ts" を追加して、スクリプトがTypeScriptのコンパイル対象に含まれるようにしてください。

**コマンド実行:**

ターミナルで以下のコマンドを実行すると、translations.csv からJSONファイルが生成されます。

```bash
npm run convert-translations
```

成功すると、src/locales ディレクトリ内に各言語のJSONファイル (例: en.json, ja.json) が作成/更新されます。

## 6. 新しい言語の追加 (例: フランス語、中国語)

### translations.csv の更新

translations.csv ファイルに、新しい言語の列 (例: fr、zh) を追加し、各キーに対応する翻訳文を記入します。

```csv
key,ja,en,fr,zh
greeting,こんにちは、世界！,"Hello, world!",Bonjour le monde !,你好，世界！
message.welcome,Vue I18n サンプルへようこそ,Welcome to the Vue I18n Sample,Bienvenue à l'exemple Vue I18n,欢迎来到 Vue I18n 示例
button.submit,送信,Submit,Soumettre,提交
error.required,この項目は必須です。,This field is required.,Ce champ est requis.,此字段是必需的。
```

### 変換スクリプトの再実行

```bash
npm run convert-translations
```

これにより、src/locales/fr.json と src/locales/zh.json が生成されます。

### src/main.ts の更新

生成された新しい言語のJSONファイルをインポートし、createI18n の messages オプションと型パラメータ（ジェネリクス）に追加します。

```typescript
// src/main.ts
import './assets/main.css'

import { createApp } from 'vue'
import { createI18n } from 'vue-i18n'
import App from './App.vue'

// 言語ファイルのインポート
import en from './locales/en.json'
import ja from './locales/ja.json'
import fr from './locales/fr.json' // フランス語をインポート
import zh from './locales/zh.json' // 中国語をインポート

// interface MessageSchema { /* ... (必要なら定義・更新) ... */ }

const messages = {
  en,
  ja,
  fr,
  zh
};

// createI18n の型パラメータにも言語コードを追加
const i18n = createI18n<[], 'en' | 'ja' | 'fr' | 'zh'>({
  legacy: false,
  locale: 'ja', // デフォルト言語
  fallbackLocale: 'en',
  messages,
});

const app = createApp(App)
app.use(i18n)
app.mount('#app')
```

### 言語切り替えUIの更新 (App.vue)

App.vue に新しい言語に切り替えるためのボタンを追加します。

```vue
<template>
  <!-- 既存のボタン -->
  <button @click="changeLanguage('ja')">日本語</button>
  <button @click="changeLanguage('en')">English</button>
  <!-- 新しい言語のボタン -->
  <button @click="changeLanguage('fr')">Français</button>
  <button @click="changeLanguage('zh')">中文</button>
</template>
```

## 7. トラブルシューティング・FAQ

### 変換スクリプト実行時エラー

**TypeError: Unknown file extension ".ts" (主に ts-node 使用時):**

Node.jsがESMモード ("type": "module" が package.json にある) で .ts ファイルを直接解釈しようとして失敗しています。package.json のスクリプト実行コマンドで `node --loader ts-node/esm ...` や `node --import ts-node/esm ...` を使用するか、より設定の少ない `jiti ./scripts/your-script.ts` を試してください。

**Error: Cannot find module 'module-name' (例: papaparse, dset):**

必要なnpmパッケージがインストールされていないか、node_modules ディレクトリに不整合がある可能性があります。

1. `npm install module-name --save-dev` で対象モジュールをインストール。
2. それでも解決しない場合は、依存関係をクリーンアップして再インストールします:

```bash
rm -rf node_modules
rm package-lock.json  # yarnの場合はyarn.lock, pnpmの場合はpnpm-lock.yaml
npm install           # yarnの場合はyarn install, pnpmの場合はpnpm install
```

**スクリプト内で [Object: null prototype] や詳細不明なエラー:**

スクリプト内部でキャッチされていないエラーが発生している可能性があります。

- スクリプト内の try...catch ブロックで、`console.error(error.message, error.stack, error)` のように詳細なエラー情報を出力するようにしてください（本ガイドのスクリプト例では対応済み）。
- ESM環境では `__dirname` や `__filename` は直接利用できません。`import { fileURLToPath } from 'url';` と `const __filename = fileURLToPath(import.meta.url); const __dirname = path.dirname(__filename);` を使用してパスを解決してください（本ガイドのスクリプト例では対応済み）。
- CSVファイルのパス (CSV_FILE_PATH) が正しいか、ファイルが存在するか確認してください。

**CSVファイルの文字コード:**

CSVファイルは UTF-8 エンコーディングで保存してください。異なるエンコーディングの場合、文字化けや変換スクリプトのパースエラーの原因となります。

**jiti または ts-node が見つからないエラー:**

`npm install jiti --save-dev` または `npm install ts-node @types/node --save-dev` でローカルにインストールされているか確認してください。

## 8. まとめ

このガイドでは、Vue.jsプロジェクトで多言語対応を導入し、翻訳データを効率的に管理するための手順を解説しました。vue-i18n の基本的な使い方から、CSVファイルと変換スクリプトを用いた翻訳ワークフローの構築、さらには新しい言語の追加方法までをカバーしました。

このアプローチにより、開発の初期段階からスケーラブルな多言語対応基盤を整えることができます。