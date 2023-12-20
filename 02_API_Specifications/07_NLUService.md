# 自然言語理解

テキスト解析 Web API の自然言語理解は、入力された自然文を解析し、意図の解釈や情報の抽出を行います。

- 意図の解釈
  - 入力からユーザが何を求めているのかといった意図や目的を解釈します
- 重要な情報（エンティティ）の抽出
  - 入力から重要なキーワードや特定の情報を抽出します

例えば「明日の東京の天気を教えて」といった入力に対しては、下記のようなものを抽出します。

- 意図：天気情報の取得
- 重要なエンティティ：
  - 日付 - 明日
  - 場所 - 東京

この自然言語理解の機能は、意図にあわせてサービスを呼び出したり、チャットボットや音声アシスタントなどのアプリケーションでユーザと対話して楽しんだりしてもらうことを想定しています。

ここでは、自然言語理解の機能について、公式ページの情報の抜粋（基本情報）と「できること」視点での利用例をあげていきます。

公式ページ:

- 自然言語理解（V2）- Yahoo!デベロッパーネットワーク
  - https://developer.yahoo.co.jp/webapi/jlp/nlu/v2/index.html

## 基本情報

### リクエスト URL

```
https://jlp.yahooapis.jp/NLUService/V2/analyze
```

### リクエストパラメータ

| パラメータ                         | 値             | 説明                           |
| ---------------------------------- | -------------- | ------------------------------ |
| id（必須）                         | string,integer | 例: 1-234-D                    |
| jsonrpc（必須）                    | string         | 2.0（固定）                    |
| method（必須）                     | string         | jlp.nluservice.analyze（固定） |
| params（必須）                     | object         |                                |
| params/q（必須）                   | string         | 解析対象テキスト               |
| params/context（任意）             | object         |                                |
| params/context/sample\<n\>（任意） | string         | カスタムルール                 |
| params/context/dict\<n\>（任意）   | string         | カスタム辞書                   |

### レスポンスフィールド

#### 共通フィールド

| フィールド    | 値             | 説明                                                                                                                                                              |
| ------------- | -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| id            | string,integer | リクエストの id の値が返ります                                                                                                                                    |
| jsonrpc       | string         | 固定で「"2.0"」が返ります                                                                                                                                         |
| result        | object         | 意図解析の結果果                                                                                                                                                  |
| result/METHOD | string         | 応答ドメインの種類<br>SAY – 雑談系<br>SEARCH – 検索系<br>WEATHER – 天気系<br>ACTION – アプリ起動/操作系<br>TRANSIT – 路線系<br>MAP – 地図系<br>LOCAL – 地域情報系 |
| result/STATUS | string         | 応答ステータスの種類<br>200 - 正常、言語理解できて応答が返せる場合<br>201 - 正常、言語理解できず応答が返せない場合<br>400 - 異常、エラー                          |

（※）`result/METHOD` の結果が冒頭の「意図の抽出」部分にあたります。

#### 追加フィールド（一部抜粋）

応答内容によって変わるフィールドです。  
ここでは一部抜粋した情報を掲載します。抜粋していない全体の仕様を知りたい場合は下記を参照してください。
https://developer.yahoo.co.jp/webapi/jlp/nlu/v2/domain.html

##### 応答ドメインのサブカテゴリ（`result/PARAM_METHOD_SUBCAT`）

`result/METHOD` の内容によって、応答ドメインのサブカテゴリ（フィールド名 `result/PARAM_METHOD_SUBCAT`）も返却されます。  
ここでは、下記の場合のサブカテゴリ（`result/PARAM_METHOD_SUBCAT`の値）を一部抜粋して示します。

- `result/METHOD = WEATHER`（天気系）

| 値           | 説明                               |
| ------------ | ---------------------------------- |
| GENERAL      | 天気を知りたい                     |
| EARTHQUAKE   | 地震情報を知りたい                 |
| HIGH         | 最高気温を知りたい                 |
| HUMIDITY     | 湿度を知りたい                     |
| LOW          | 最低気温を知りたい                 |
| POLLEN       | 花粉情報を知りたい                 |
| RAIN         | 雨や雪が降るかを知りたい           |
| RAINY_SEASON | 梅雨入り・梅雨明けに関する情報要求 |

（※）`result/METHOD` に加え、こちらのフィールドも冒頭の「意図の抽出」部分にあたります。

##### 応答内容にあわせたエンティティ

応答内容（応答ドメインや応答ドメインサブカテゴリ）にあわせて、重要なエンティティを抽出します。  
ここでは、応答内容が下記の場合のエンティティを例として示します。

- `result/METHOD = WEATHER`
- `result/PARAM_METHOD_SUBCAT = GENERAL`

| フィールド                 | 値     | 説明                                         |
| -------------------------- | ------ | -------------------------------------------- |
| result/PARAM_DATETIME_FROM | string | 情報を取得したい時を指す表現<br>例："明日"   |
| result/PARAM_PLACE         | string | 情報を取得したい場所を指す表現<br>例："東京" |

（※）こちらが冒頭の「重要なエンティティの抽出」部分にあたります。

### サンプルリクエストとレスポンス

公式ページにあるサンプルリクエストです。

```json
{
  "id": "1234-1",
  "jsonrpc": "2.0",
  "method": "jlp.nluservice.analyze",
  "params": {
    "q": "新宿の天気"
  }
}
```

id は自由、jsonrpc は必ず "2.0"、method は自然言語理解では "jlp.nluservice.analyze" です。  
解析したいテキストを params/q にセットするだけです。

上記リクエストに対するレスポンスです。

```json
{
  "id": "1234-1",
  "jsonrpc": "2.0",
  "result": {
    "METHOD": "WEATHER",
    "NVM_THAT": "新宿",
    "PARAM_METHOD_SUBCAT": "GENERAL",
    "PARAM_PLACE": "新宿",
    "STATUS": "200",
    "VAR_CV1": "0.95",
    "VAR_INTEXT": "新宿の天気",
    "VAR_INTEXT_NORMALIZED": "新宿の天気",
    "VAR_INTEXT_TIMESTAMP": "1686881314",
    "VAR_TEST_BTSC": "34"
  }
}
```

- 意図の抽出結果
  - `result/METHOD = WEATHER`
    - ユーザの意図；「天気系」の情報がほしい
  - `result/PARAM_METHOD_SUBCAT = GENERAL`
    - ユーザの意図：「天気を知りたい」
- 重要エンティティの抽出結果
  - `result/PARAM_PLACE = 新宿`
    - 場所は「新宿」を指定しています

レスポンスの VAR_ や NVM_ はシステム内部で利用するものです。ここでは無視してください（参考：[出力仕様](https://developer.yahoo.co.jp/webapi/jlp/nlu/v2/response.html)）。

## 利用例

curl と jq を用いて「できること」を実行していきます。

実行例:

```bash
curl -s -X POST \
-H "Content-Type: application/json" \
-H "User-Agent: Yahoo AppID: 'あなたの Client ID（アプリケーション ID）'" \
https://jlp.yahooapis.jp/NLUService/V2/analyze \
-d '{
 "id": "1234-1",
 "jsonrpc": "2.0",
 "method": "jlp.nluservice.analyze",
 "params": {
   "q": "新宿の天気"
 }
}' | jq -r '.result.METHOD'
```

（※）Client ID については[こちら](../02_API_Specifications/00_Overview.md#client-id%E3%82%A2%E3%83%97%E3%83%AA%E3%82%B1%E3%83%BC%E3%82%B7%E3%83%A7%E3%83%B3id)をご覧ください。

実行結果（jq で results/METHOD のみを取り出しています）:

```
WEATHER
```

### 意図抽出の結果だけを取り出す

実行例:

```bash
curl -s -X POST \
-H "Content-Type: application/json" \
-H "User-Agent: Yahoo AppID: 'あなたの Client ID（アプリケーション ID）'" \
https://jlp.yahooapis.jp/NLUService/V2/analyze \
-d '{
 "id": "1",
 "jsonrpc": "2.0",
 "method": "jlp.nluservice.analyze",
 "params": {
   "q": "明日の東京の気温を教えて"
 }
}' | jq -c '.result | { METHOD: .METHOD, PARAM_METHOD_SUBCAT: .PARAM_METHOD_SUBCAT }'
```

実行結果:

```json
{ "METHOD": "WEATHER", "PARAM_METHOD_SUBCAT": "TEMPERATURE" }
```

意図抽出の結果 `METHOD=WEATHER`（天気情報）とサブカテゴリ `PARAM_METHOD_SUBCAT=TEMPERATURE`（気温情報）が抽出できました。

### 重要なエンティティ抽出の結果だけを取り出す

実行例:

```bash
curl -s -X POST \
-H "Content-Type: application/json" \
-H "User-Agent: Yahoo AppID: 'あなたの Client ID（アプリケーション ID）'" \
https://jlp.yahooapis.jp/NLUService/V2/analyze \
-d '{
 "id": "1234-1",
 "jsonrpc" : "2.0",
 "method" : "jlp.nluservice.analyze",
 "params" : {
   "q" : "明日の東京の天気"
 }
}' |
jq -c '.result | with_entries(select(.key | startswith("PARAM_") and . != "PARAM_METHOD_SUBCAT"))'
```

実行結果:

```json
{ "PARAM_DATETIME_FROM": "明日", "PARAM_PLACE": "東京" }
```

`PARAM_` から始まるエンティティ部分のみが抽出できました。

## こちらの機能の活用事例

- [自然言語理解を用いたタスク指向型システムの実装（概要）](../03_API_Examples/04_NLUService_TaskOrientedBase.md)
- [自然言語理解を用いたタスク指向型システムの実装（雑談系の意図への対応）](../03_API_Examples/04_NLUService_TaskOrientedSay.md)
- [自然言語理解を用いたタスク指向型システムの実装（地図系の意図への対応）](../03_API_Examples/04_NLUService_TaskOrientedMap.md)
- [自然言語理解を用いたタスク指向型システムの実装（天気系の意図への対応）](../03_API_Examples/04_NLUService_TaskOrientedWeather.md)
- [自然言語理解を用いたタスク指向型システムの実装（文脈引き継ぎ機能の追加）](../03_API_Examples/04_NLUService_TaskOrientedContext.md)
- [自然言語理解を用いたタスク指向型システムの実装（レスポンスのカスタマイズ機能の追加）](../03_API_Examples/04_NLUService_TaskOrientedCustomize.md)
