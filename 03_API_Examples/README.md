# 第3章　テキスト解析 Web API の活用サンプルコード

## 目次

- [3.1 　第3章の概要](./00_Overview.md)
- [3.2 　`テキスト解析 Web API 全般` 各プログラミング言語でのサンプルコード](./01_WebAPIGeneral_SampleCode.md)
- [3.3 　`テキスト解析 Web API 全般` リクエスト URL とリクエストパラメータの "method" の相互変換](./01_WebAPIGeneral_URLAndMethod.md)
- [3.4 　`テキスト解析 Web API 全般` バッチリクエストでクライアント側の HTTP 接続回数を減らす方法](./01_WebAPIGeneral_BatchRequest.md)
- [3.5 　`テキスト解析 Web API 全般` テキスト解析 Web API をウェブページから直接使う方法](./01_WebAPIGeneral_CORSProxy.md)
- [3.6 　`日本語形態素解析` 形態素や品詞の頻度を集計してグラフ化する](./02_MAService_FrequencyCount.md)
- [3.7 　`日本語形態素解析` 複数ワードを入力テキストにマッチさせる際に形態素解析を使い誤マッチ減少](./02_MAService_Sumapy.md)
- [3.8 　`日本語形態素解析` マルコフ連鎖による文生成](./02_MAService_MarkovChain.md)
- [3.9 　`キーフレーズ抽出` キーフレーズ抽出を用いた長文の類似度判定](./03_KeyphraseService_Similarity.md)
- [3.10　`キーフレーズ抽出` キーフレーズ抽出の結果の可視化](./03_KeyphraseService_Visualization.md)
- [3.11　`キーフレーズ抽出` キーフレーズを抽出してワードクラウドを作る](./03_KeyphraseService_Wordcloud.md)
- [3.12　`自然言語理解` 自然言語理解を用いたタスク指向型システムの実装（概要）](./04_NLUService_TaskOrientedBase.md)
- [3.13　`自然言語理解` 自然言語理解を用いたタスク指向型システムの実装（雑談系の意図への対応）](./04_NLUService_TaskOrientedSay.md)
- [3.14　`自然言語理解` 自然言語理解を用いたタスク指向型システムの実装（地図系の意図への対応）](./04_NLUService_TaskOrientedMap.md)
- [3.15　`自然言語理解` 自然言語理解を用いたタスク指向型システムの実装（天気系の意図への対応）](./04_NLUService_TaskOrientedWeather.md)
- [3.16　`自然言語理解` 自然言語理解を用いたタスク指向型システムの実装（文脈引き継ぎ機能の追加）](./04_NLUService_TaskOrientedContext.md)
- [3.17　`自然言語理解` 自然言語理解を用いたタスク指向型システムの実装（レスポンスのカスタマイズ機能の追加）](./04_NLUService_TaskOrientedCustomize.md)
- [3.18　`日本語係り受け解析` 係り受け解析を用いた簡単な文章要約](./05_DAService_Summary.md)
- [3.19　`日本語係り受け解析` 係り受け解析の結果を可視化](./05_DAService_Visualization.ipynb)
- [3.20　`校正支援` 1つの HTML ファイルだけで完結する校正支援 API デモページ](./06_KouseiService_CORSDemo.md)
- [3.21　`校正支援` 校正支援の指摘対象の文字列を置換先候補に置き換える方法](./06_KouseiService_Replace.md)
- [3.22　`ルビ振り` ブラウザで選択したテキストにルビを振る Chrome 拡張機能](./07_FuriganaService_ChromeExtension.md)
- [3.23　`ルビ振り` テキストの難易度判定](./07_FuriganaService_SentenceLevel.md)
- [3.24　`ルビ振り, かな漢字変換` ルビ振り・かな漢字変換を用いたクエリ拡張](./08_FuriganaServiceJIMService_QueryExpansion.ipynb) 

## 著者一覧

- 山下 達雄（LINEヤフー研究所 / [@yto](https://x.com/yto)）
- 岩間 寛悟（言語処理エンジニア）
- 井上 裁都（言語処理エンジニア）
- 伊奈 拓郎（言語処理エンジニア / [@tuna_takenoko](https://x.com/tuna_takenoko)）
- 仲村 祐希（言語処理エンジニア）
- 西山 育宏（言語処理エンジニア）
- 平子 潤（言語処理エンジニア）
- 牧野 恵（言語処理エンジニア）


