import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url'; // <--- この行を追加
import Papa from 'papaparse';
import { dset } from 'dset';

console.log('--- Script execution started ---'); // <--- この行を追加

// ESM で __filename と __dirname を取得するための設定
const __filename = fileURLToPath(import.meta.url); // <--- この行を追加
const __dirname = path.dirname(__filename);       // <--- この行を追加

// --- 設定ここから ---
const CSV_FILE_PATH = path.resolve(__dirname, '../translations.csv'); // CSVファイルのパス (変更なし、上記で__dirnameが正しく設定される)
const OUTPUT_DIR = path.resolve(__dirname, '../src/locales');      // JSONファイルの出力先ディレクトリ (変更なし)
const KEY_COLUMN_NAME = 'key';                                     // キーが記述されている列のヘッダー名
// --- 設定ここまで ---

interface TranslationRow {
  [key: string]: string; // KEY_COLUMN_NAME と言語コードをキーに持つ
}

interface Translations {
  [language: string]: Record<string, any>; // ネストされたオブジェクトを許容
}

try {
  // 出力先ディレクトリが存在しない場合は作成
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    console.log(`Created directory: ${OUTPUT_DIR}`);
  }

  // CSVファイルを読み込み
  const csvFileContent: string = fs.readFileSync(CSV_FILE_PATH, 'utf8');

  // CSVをパース
  // Papa.parse<T> の T で行の型を指定
  const parseResult: Papa.ParseResult<TranslationRow> = Papa.parse<TranslationRow>(csvFileContent, {
    header: true, // 1行目をヘッダーとして扱う
    skipEmptyLines: true, // 空行をスキップ
  });

  if (parseResult.errors.length > 0) {
    console.error('CSV parsing errors:', parseResult.errors.map(err => err.message).join('\n'));
    process.exit(1);
  }

  const data: TranslationRow[] = parseResult.data;
  const headers: string[] = parseResult.meta.fields || [];
  const languages: string[] = headers.filter(field => field !== KEY_COLUMN_NAME);

  if (languages.length === 0) {
    console.error('No language columns found in CSV. Please check the header row.');
    process.exit(1);
  }

  console.log(`Found languages: ${languages.join(', ')}`);

  // 言語ごとにJSONオブジェクトを作成
  const translations: Translations = {};
  languages.forEach(lang => {
    translations[lang] = {};
  });

  data.forEach((row: TranslationRow) => {
    const key: string | undefined = row[KEY_COLUMN_NAME];
    if (!key) {
      console.warn('Skipping row with empty key:', row);
      return;
    }

    languages.forEach(lang => {
      const translationValue: string | undefined = row[lang];
      if (translationValue !== undefined && translationValue !== null && translationValue !== '') {
        // dset を使ってネストされたキーに値を設定
        // dset<T extends object, V>(obj: T, keys: Key, value: V): void;
        dset(translations[lang], key, translationValue);
      } else {
        console.warn(`Missing translation for key "${key}" in language "${lang}".`);
        // 空の文字列や特定のプレースホルダを設定することもできます
        // dset(translations[lang], key, ''); // 例: 空文字で設定
      }
    });
  });

  // 各言語のJSONファイルを出力
  languages.forEach(lang => {
    const outputFile: string = path.join(OUTPUT_DIR, `${lang}.json`);
    try {
      fs.writeFileSync(outputFile, JSON.stringify(translations[lang], null, 2), 'utf8');
      console.log(`Successfully generated ${outputFile}`);
    } catch (err) {
      console.error(`Error writing ${outputFile}:`, err);
    }
  });

  console.log('Translation files generated successfully!');

} catch (error: any) {
  console.error('An error occurred:'); // エラー発生を示すメッセージ
  if (error && typeof error === 'object') { // エラーオブジェクトが存在し、オブジェクト型であることを確認
    if ('message' in error) {
      console.error('Error Message:', error.message); // エラーメッセージ
    }
    if ('stack' in error) {
      console.error('Error Stack:', error.stack);   // スタックトレース
    }
  }
  console.error('Full Error Object:', error);     // エラーオブジェクト全体
  process.exit(1);
}
