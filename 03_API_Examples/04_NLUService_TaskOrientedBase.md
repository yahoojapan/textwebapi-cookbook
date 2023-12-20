# 自然言語理解を用いたタスク指向型システムの実装（概要）

本記事では、テキスト解析 Web API の自然言語理解を利用したタスク指向型システムの実装について解説します。  
使用するプログラミング言語は TypeScript です。

## 概要

テキスト解析 Web API の自然言語理解を利用すると、ユーザの質問や要求を自然言語として理解し、その意図（Intent）や重要な情報を抽出できます。
例えば、「今日の東京の天気は？」という入力から、「天気」という意図、「東京」という場所情報、「今日」という日付情報を抽出できます。

得られた情報に基づき、システムはどのように行動すべきかを決定します。この行動は「対話行為タイプ（DialogueAct）」として定義します。
例えば、「今日の東京の天気は？」に対する対話行為タイプは、「天気情報の要求」です。
決定した DialogueAct に基づいて、システムは外部 API から情報を取得するなどして行動し、ユーザに返す自然言語のテキストを生成します。
この一連の流れを行うシステムを「タスク指向型システム」と呼びます。

ここでは、テキスト解析 Web API の自然言語理解を用いたタスク指向型システムの実装方法を紹介します。
さらに、文脈引き継ぎ機能やカスタマイズ機能を利用することで、システムを柔軟に拡張する方法も紹介します。

## 動作環境

Node.js と TypeScript を使用します。

### 1. Node.js のインストール

[公式ウェブサイト](https://nodejs.org/en/download)から最新版をダウンロードしてインストールします。

### 2. プロジェクトの作成

プロジェクトのディレクトリ `my-nlu-project` を作成します。

```bash
mkdir my-nlu-project
cd my-nlu-project
```

そのディレクトリ内で以下のコマンドを実行します。

```bash
npm init -y
npm install --save-dev typescript@5.1.6 ts-node@10.9.1
npx tsc --init
```

### 3. tsconfig.json の更新

`tsconfig.json` の内容を以下に置き換えてください。

```json
{
  "compilerOptions": {
    "target": "ES2021",
    "module": "commonjs",
    "sourceMap": true,
    "outDir": "./build",
    "rootDir": "./src",
    "removeComments": true,
    "strict": true,
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "esModuleInterop": true,
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    "forceConsistentCasingInFileNames": true
  }
}
```

これでプロジェクトがセットアップされました。

## 使用する API

- **テキスト解析 Web API の自然言語理解**: [公式ドキュメント](https://developer.yahoo.co.jp/webapi/jlp/nlu/v2/index.html)。ユーザからの自然言語のテキストを解析し、意図理解や情報抽出を行います。
- **コンテンツジオコーダ API**: [公式ドキュメント](https://developer.yahoo.co.jp/webapi/map/openlocalplatform/v1/contentsgeocoder.html)。場所に関するキーワードを検出し、その位置情報（緯度、経度等）を出力します。
- **気象情報 API**: [公式ドキュメント](https://developer.yahoo.co.jp/webapi/map/openlocalplatform/v1/weather.html)。指定した緯度経度の降水強度を取得する API です。現在時刻の降水強度実測値から、60 分後までの降水強度予測値を取得できます。

## プログラム構成

プログラムは以下の 3 つの部分から構成されます：

1. **自然言語理解（NLU）:** 人間の発話をコンピュータが理解する技術です。ユーザの要求や質問を解析し、その意図やキーワードを抽出します。
2. **対話管理（DM）:** NLU の結果を基に、システムがどのような行動をとるべきかを決定します。この結果は次に述べる NLG の入力です。
3. **自然言語生成（NLG）:** DM の結果に基づいて、自然言語のテキストを生成します。これはシステムがユーザに返すレスポンスを作成します。

ユーザの要求（例："今日の東京の天気は何ですか？"）を解析し（NLU）、システムの適切な行動を決定し（DM）、適切な応答を生成し（NLG）、それをユーザに伝えるという一連の処理を実現します。

## 各トピックの詳細

以下のリンクから、各トピックの詳細な解説と実装方法を確認できます。

| トピック                                                               | 各トピックへのリンク                                                               |
| ---------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| 雑談系の意図への対応                                                       | [04_NLUService_TaskOrientedSay.md](./04_NLUService_TaskOrientedSay.md)             |
| 地図系の意図への対応<br>- コンテンツジオコーダ API の利用                    | [04_NLUService_TaskOrientedMap.md](./04_NLUService_TaskOrientedMap.md)             |
| 天気系の意図への対応<br>- コンテンツジオコーダ API と気象情報 API の利用 | [04_NLUService_TaskOrientedWeather.md](./04_NLUService_TaskOrientedWeather.md)     |
| 文脈引き継ぎ機能の追加                                                       | [04_NLUService_TaskOrientedContext.md](./04_NLUService_TaskOrientedContext.md)     |
| レスポンスのカスタマイズ機能の追加                                               | [04_NLUService_TaskOrientedCustomize.md](./04_NLUService_TaskOrientedCustomize.md) |

このテーブルを参照して、タスク指向型システムの構築を進めてください。

## 著者

LINEヤフー株式会社 言語処理エンジニア  
西山 育宏
