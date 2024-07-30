# テキスト解析 Web API クックブック

## 概要

Yahoo!デベロッパーネットワークの「[テキスト解析 Web API](https://developer.yahoo.co.jp/webapi/jlp/)」では以下の機能を提供しています。  
本クックブックでは、各機能の詳細な使い方や活用サンプルコードを載せています。ぜひご活用ください。

- テキスト解析 Web API が提供する機能
  - [日本語形態素解析](https://developer.yahoo.co.jp/webapi/jlp/ma/v2/parse.html)
  - [かな漢字変換](https://developer.yahoo.co.jp/webapi/jlp/jim/v2/conversion.html)
  - [ルビ振り](https://developer.yahoo.co.jp/webapi/jlp/furigana/v2/furigana.html)
  - [校正支援](https://developer.yahoo.co.jp/webapi/jlp/kousei/v2/kousei.html)
  - [日本語係り受け解析](https://developer.yahoo.co.jp/webapi/jlp/da/v2/parse.html)
  - [キーフレーズ抽出](https://developer.yahoo.co.jp/webapi/jlp/keyphrase/v2/extract.html)
  - [自然言語理解](https://developer.yahoo.co.jp/webapi/jlp/nlu/v2/index.html)
  - [固有表現抽出](https://developer.yahoo.co.jp/webapi/jlp/ner/v1/index.html)

## 目次

- [第1章　はじめに](./01_Overview/README.md)
  - [1.1　本クックブックの概要](./01_Overview/00_Overview.md)
- [第2章　テキスト解析 Web API の詳細な使い方](./02_API_Specifications/README.md)
  - [2.1　第2章の概要](./02_API_Specifications/00_Overview.md)
  - [2.2　日本語形態素解析](./02_API_Specifications/01_MAService.md)
  - [2.3　かな漢字変換](./02_API_Specifications/02_JIMService.md)
  - [2.4　ルビ振り](./02_API_Specifications/03_FuriganaService.md)
  - [2.5　校正支援](./02_API_Specifications/04_KouseiService.md)
  - [2.6　日本語係り受け解析](./02_API_Specifications/05_DAService.md)
  - [2.7　キーフレーズ抽出](./02_API_Specifications/06_KeyphraseService.md)
  - [2.8　自然言語理解](./02_API_Specifications/07_NLUService.md) 
  - [2.9　固有表現抽出](./02_API_Specifications/08_NERService.md)
- [第3章　テキスト解析 Web API の活用サンプルコード](./03_API_Examples/README.md)
  - [3.1 　第3章の概要](./03_API_Examples/00_Overview.md)
  - [3.2 　`テキスト解析 Web API 全般` 各プログラミング言語でのサンプルコード](./03_API_Examples/01_WebAPIGeneral_SampleCode.md)
  - [3.3 　`テキスト解析 Web API 全般` リクエスト URL とリクエストパラメータの "method" の相互変換](./03_API_Examples/01_WebAPIGeneral_URLAndMethod.md)
  - [3.4 　`テキスト解析 Web API 全般` バッチリクエストでクライアント側の HTTP 接続回数を減らす方法](./03_API_Examples/01_WebAPIGeneral_BatchRequest.md)
  - [3.5 　`テキスト解析 Web API 全般` テキスト解析 Web API をウェブページから直接使う方法](./03_API_Examples/01_WebAPIGeneral_CORSProxy.md)
  - [3.6 　`日本語形態素解析` 形態素や品詞の頻度を集計してグラフ化する](./03_API_Examples/02_MAService_FrequencyCount.md)
  - [3.7 　`日本語形態素解析` 複数ワードを入力テキストにマッチさせる際に形態素解析を使い誤マッチ減少](./03_API_Examples/02_MAService_Sumapy.md)
  - [3.8 　`日本語形態素解析` マルコフ連鎖による文生成](./03_API_Examples/02_MAService_MarkovChain.md)
  - [3.9 　`キーフレーズ抽出` キーフレーズ抽出を用いた長文の類似度判定](./03_API_Examples/03_KeyphraseService_Similarity.md)
  - [3.10　`キーフレーズ抽出` キーフレーズ抽出の結果の可視化](./03_API_Examples/03_KeyphraseService_Visualization.md)
  - [3.11　`キーフレーズ抽出` キーフレーズを抽出してワードクラウドを作る](./03_API_Examples/03_KeyphraseService_Wordcloud.md)
  - [3.12　`自然言語理解` 自然言語理解を用いたタスク指向型システムの実装（概要）](./03_API_Examples/04_NLUService_TaskOrientedBase.md)
  - [3.13　`自然言語理解` 自然言語理解を用いたタスク指向型システムの実装（雑談系の意図への対応）](./03_API_Examples/04_NLUService_TaskOrientedSay.md)
  - [3.14　`自然言語理解` 自然言語理解を用いたタスク指向型システムの実装（地図系の意図への対応）](./03_API_Examples/04_NLUService_TaskOrientedMap.md)
  - [3.15　`自然言語理解` 自然言語理解を用いたタスク指向型システムの実装（天気系の意図への対応）](./03_API_Examples/04_NLUService_TaskOrientedWeather.md)
  - [3.16　`自然言語理解` 自然言語理解を用いたタスク指向型システムの実装（文脈引き継ぎ機能の追加）](./03_API_Examples/04_NLUService_TaskOrientedContext.md)
  - [3.17　`自然言語理解` 自然言語理解を用いたタスク指向型システムの実装（レスポンスのカスタマイズ機能の追加）](./03_API_Examples/04_NLUService_TaskOrientedCustomize.md)
  - [3.18　`日本語係り受け解析` 係り受け解析を用いた簡単な文章要約](./03_API_Examples/05_DAService_Summary.md)
  - [3.19　`日本語係り受け解析` 係り受け解析の結果を可視化](./03_API_Examples/05_DAService_Visualization.ipynb)
  - [3.20　`校正支援` 1つの HTML ファイルだけで完結する校正支援 API デモページ](./03_API_Examples/06_KouseiService_CORSDemo.md)
  - [3.21　`校正支援` 校正支援の指摘対象の文字列を置換先候補に置き換える方法](./03_API_Examples/06_KouseiService_Replace.md)
  - [3.22　`ルビ振り` ブラウザで選択したテキストにルビを振る Chrome 拡張機能](./03_API_Examples/07_FuriganaService_ChromeExtension.md)
  - [3.23　`ルビ振り` テキストの難易度判定](./03_API_Examples/07_FuriganaService_SentenceLevel.md)
  - [3.24　`ルビ振り, かな漢字変換` ルビ振り・かな漢字変換を用いたクエリ拡張](./03_API_Examples/08_FuriganaServiceJIMService_QueryExpansion.ipynb)
  - [3.25　`固有表現抽出` テキスト中の固有表現に自動でハイパーリンクを張る](./03_API_Examples/09_NERService_CORSDemo.md) 

## Copyright / License

Copyright (c) 2023 LY Corporation. See [LICENSE](./LICENSE) for further details.
