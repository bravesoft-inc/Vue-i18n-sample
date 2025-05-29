# Vue.js i18n サンプルプロジェクト

このプロジェクトは、Vue.js 3, TypeScript, および `vue-i18n@next` を使用して多言語対応 (i18n) を実装したサンプルアプリケーションです。翻訳文言はCSVファイルで一元管理し、Node.jsスクリプトでJSON形式に変換します。

## 主な特徴

* **多言語対応**: `vue-i18n` による日本語、英語 (および拡張可能) のサポート。
* **TypeScript**: 型安全な開発。
* **Composition API**: Vue 3 の Composition API を活用。
* **翻訳データの一元管理**: `translations.csv` ファイルで翻訳文言を管理。
* **自動変換スクリプト**: CSVから各言語のJSONファイルを生成。
* **ESM環境**: プロジェクトは `"type": "module"` で構成。

## 技術スタック

* Vue.js 3
* TypeScript
* Vite
* `vue-i18n@next`
* `papaparse` (CSVパース用)
* `dset` (ネストオブジェクト設定用)
* `jiti` (TypeScriptスクリプト実行用)

## セットアップと実行

### 前提条件

* Node.js (v18.x LTS版以降推奨)
* npm (Node.js に同梱)

### 手順

1.  **リポジトリをクローン** (もしあれば):
    ```bash
    # git clone <repository-url>
    # cd vue-i18n-sample
    ```

2.  **依存関係をインストール**:
    ```bash
    npm install
    ```

3.  **開発サーバーを起動**:
    ```bash
    npm run dev
    ```
    ブラウザで `http://localhost:5173` (または表示されたポート) を開きます。

## 多言語対応 (i18n) の運用

### 1. 翻訳文言の管理 (`translations.csv`)

* プロジェクトルートにある `translations.csv` ファイルで、すべての翻訳文言を一元管理します。
* **フォーマット**:
    * 1行目: ヘッダー (`key,ja,en,fr,zh` のように、最初の列が `key`、以降が言語コード)
    * 2行目以降: 翻訳キーと各言語の翻訳文
    * 文字コード: **UTF-8**
    * 区切り文字: カンマ (`,`)。翻訳文中のカンマはダブルクォーテーションで囲ってください。

    **例:**
    ```csv
    key,ja,en
    greeting,こんにちは、世界！,"Hello, world!"
    message.welcome,Vue I18n サンプルへようこそ,Welcome to the Vue I18n Sample
    ```

### 2. 翻訳ファイルの生成

* `translations.csv` を編集・保存したら、以下のコマンドを実行して、`src/locales/` ディレクトリに各言語のJSONファイルを生成・更新します。
    ```bash
    npm run convert-translations
    ```
    このコマンドは、`scripts/convert-translations.ts` スクリプトを実行します (内部では `jiti` を使用)。

### 3. 新しい言語の追加手順

1.  **`translations.csv` の更新**:
    * 新しい言語の列ヘッダー (例: `fr`) と、各キーに対する翻訳文を追加します。
2.  **翻訳ファイルの再生成**:
    * `npm run convert-translations` を実行します。これにより `src/locales/fr.json` (例) が生成されます。
3.  **`src/main.ts` の更新**:
    * 新しく生成された言語ファイル (`fr.json` など) をインポートします。
    * `vue-i18n` の `createI18n` 関数に渡す `messages` オブジェクトと、型パラメータ (ジェネリクス内の言語コードリスト) に新しい言語を追加します。

        ```typescript
        // src/main.ts (抜粋)
        import en from './locales/en.json'
        import ja from './locales/ja.json'
        import fr from './locales/fr.json' // 新しい言語をインポート

        const messages = { en, ja, fr };

        const i18n = createI18n<[], 'en' | 'ja' | 'fr'>({ // 言語コードリストに追加
          // ... 他の設定
          messages,
        });
        ```
4.  **(任意) UIの更新**:
    * 言語切り替えメニューなどに新しい言語のオプションを追加します (例: `App.vue`)。

## 主要なnpmスクリプトコマンド

* `npm run dev`: 開発サーバーを起動します。
* `npm run build`: プロダクション用にプロジェクトをビルドします。
* `npm run preview`: ビルドされた成果物をローカルでプレビューします。
* `npm run convert-translations`: `translations.csv` から言語JSONファイルを生成します。
* `npm run lint`: ESLint でコードをチェック・修正します。
* `npm run format`: Prettier でコードをフォーマットします。

## ディレクトリ構造 (主要部分)

<pre>
.
├── public/
├── scripts/
│   └── convert-translations.ts  # CSVからJSONへの変換スクリプト
├── src/
│   ├── locales/                 # 生成されたJSON言語ファイル
│   ├── App.vue                  # メインVueコンポーネント
│   └── main.ts                  # アプリケーションエントリーポイント, i18n初期化
├── translations.csv             # 翻訳文言管理用CSV
├── package.json
├── tsconfig.json                # TypeScript設定 (ソリューションスタイル)
└── vite.config.ts               # Vite設定

</pre>
---

この `README.md` は、プロジェクトの概要と多言語対応の運用方法を簡潔にまとめたものです。より詳細な手順やトラブルシューティングについては、別途ドキュメントを参照してください (もしあれば)。