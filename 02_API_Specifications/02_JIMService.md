# かな漢字変換

テキスト解析 Web API のかな漢字変換は、ローマ字、ひらがなの文を文節に区切り、変換候補を提示します。

ここでは、かな漢字変換の機能について、公式ページの情報の抜粋（基本情報）と「できること」視点での利用例をあげていきます。

公式ページ:

- かな漢字変換（V2）- Yahoo!デベロッパーネットワーク
  - https://developer.yahoo.co.jp/webapi/jlp/jim/v2/conversion.html

## 基本情報

### リクエスト URL

```
https://jlp.yahooapis.jp/JIMService/V2/conversion
```

### リクエストパラメータ

| パラメータ                | 値              | 説明                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| ------------------------- | --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| id（必須）                | string,integer  | 例: 1-234-D                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| jsonrpc（必須）           | string          | 2.0（固定）                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| method（必須）            | string          | jlp.jimservice.conversion（固定）                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| params（必須）            | object          |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| params/q（必須）          | string          | 解析対象テキスト                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| params/format（任意）     | string          | q で指定したテキストフォーマットの指定<br>・"hiragana"を指定すると、変換対象となるテキスト情報はひらがなのみとなります。<br>・"roman"を指定すると、変換対象となるテキスト情報はひらがなと半角英小文字となります。                                                                                                                                                                                                                                                                |
| params/mode（任意）       | string          | かな漢字変換の処理の指定。<br>・"kanakanji"（default）: 通常の変換候補を返す通常変換を行います。<br>・"roman": ローマ字からひらがなに変換した結果のみを返すローマ字変換を行います。ただし指定変換候補（option）、辞書指定（dictionary）は使用できません。<br>・"predictive": 推測変換の候補を返します。ただし指定変換候補（option）、辞書指定（dictionary）は使用できません。                                                                                                    |
| params/option（任意）     | array（string） | 通常のかな漢字変換のほかに、指定の変換候補を返します。複数指定できます。<br>・"hiragana": 全角ひらがな変換の内容を Hiragana に返します。<br>・"katakana": 全角カタカナ変換の内容を Katakana に返します。<br>・"alphanumeric": 全角英数字変換の内容を Alphanumeric に返します。<br>・"half_katakana": 半角カタカナ変換の内容を HalfKatakana に返します。<br>・"half_alphanumeric": 半角英数字変換の内容を HalfAlphanumeric に返します。<br>無指定の場合は通常変換のみになります。 |
| params/dictionary（任意） | array（string） | 変換候補用の辞書を指定します。複数指定できます。<br>・"base": 一般辞書の候補を返します。<br>・"name": 人名辞書の候補を返します。<br>・"place": 地名辞書の候補を返します。<br>・"zip": 郵便番号辞書の候補を返します。<br>・"symbol": 顔文字、記号辞書の候補を返します。<br>無指定の場合は"base"になります。                                                                                                                                                                       |
| params/results（任意）    | integer         | 文節単位の変換候補の数を指定します。<br>無指定の場合は 999（最大値）になります。                                                                                                                                                                                                                                                                                                                                                                                                 |

### レスポンスフィールド

| フィールド                       | 値              | 説明                           |
| -------------------------------- | --------------- | ------------------------------ |
| id                               | string,integer  | リクエストの id の値が返ります |
| jsonrpc                          | string          | 固定で「"2.0"」が返ります      |
| result                           | object          | かな漢字変換結果               |
| result/segment                   | array（object） | 文節のリスト                   |
| result/segment/reading           | string          | 文節ごとの読みにあたる文字列   |
| result/segment/hiragana          | string          | 全角ひらがなの変換結果         |
| result/segment/katakana          | string          | 全角カタカナの変換結果         |
| result/segment/alphanumeric      | string          | 全角英数字の変換結果           |
| result/segment/half_katakana     | string          | 半角カタカナの変換結果         |
| result/segment/half_alphanumeric | string          | 半角英数字の変換結果           |
| result/segment/candidate         | array（string） | 変換候補                       |

### サンプルリクエストとレスポンス

```json
{
  "id": "1234-1",
  "jsonrpc": "2.0",
  "method": "jlp.jimservice.conversion",
  "params": {
    "q": "きょうはよいてんきです。"
  }
}
```

id は自由、jsonrpc は必ず "2.0"、method はかな漢字変換では "jlp.jimservice.conversion" です。
解析したいテキストを params/q にセットするだけです。

上記リクエストに対するレスポンスです。

```json
{
  "id": "1234-1",
  "jsonrpc": "2.0",
  "result": {
    "segment": [
      {
        "candidate": [
          "今日は",
          "きょうは",
          "教派",
          "興は",
          "京は",
          "強は",
          "経は",
          "教は",
          "境は",
          "凶は",
          "卿は",
          "峡は",
          "協は",
          "香は",
          "恭は",
          "享は"
        ],
        "reading": "きょうは"
      },
      {
        "candidate": [
          "よい",
          "良い",
          "宵",
          "酔い",
          "四位",
          "４位",
          "余威",
          "好い",
          "善い",
          "佳い",
          "吉い",
          "快い",
          "佳",
          "可",
          "嘉",
          "儀",
          "義",
          "誼",
          "吉",
          "慶",
          "好",
          "淑",
          "酔",
          "善",
          "良",
          "俶",
          "懿",
          "譱",
          "臧",
          "醉"
        ],
        "reading": "よい"
      },
      {
        "candidate": [
          "天気です。",
          "転機です。",
          "転記です。",
          "転帰です。",
          "天機です。",
          "てんきです。"
        ],
        "reading": "てんきです。"
      }
    ]
  }
}
```

result/segment がかな漢字変換の文節ごとの結果です。
それぞれの結果は読みがな、変換候補を持っています。

## 利用例

curl と jq を用いて「できること」を実行していきます。

実行例:

```bash
curl -s -X POST \
-H "Content-Type: application/json" \
-H "User-Agent: Yahoo AppID: 'あなたの Client ID（アプリケーション ID）'" \
https://jlp.yahooapis.jp/JIMService/V2/conversion \
-d '{
  "id": "1",
  "jsonrpc": "2.0",
  "method": "jlp.jimservice.conversion",
  "params": {
    "q": "きょうはよいてんきです。"
  }
}' | jq -r '[.result.segment[].candidate[0]] | join("")'
```

（※）Client ID については[こちら](../02_API_Specifications/00_Overview.md#client-idアプリケーション-id)をご覧ください。

実行結果（jq でかな漢字変換の変換候補の一番目を取り出しています）:

```
今日はよい天気です。
```

### ローマ字をひらがなに変換

実行例:

```bash
curl -s -X POST \
-H "Content-Type: application/json" \
-H "User-Agent: Yahoo AppID: 'あなたの Client ID（アプリケーション ID）'" \
https://jlp.yahooapis.jp/JIMService/V2/conversion \
-d '{
  "id": "1",
  "jsonrpc": "2.0",
  "method": "jlp.jimservice.conversion",
  "params": {
    "q": "kyouhaiitenkidesu.",
    "format": "roman",
    "mode": "roman"
  }
}' | jq -r '.result.segment[].reading'
```

実行結果:

```
きょうはいいてんきです。
```

### 入力途中の文から予測変換

実行例:

```bash
curl -s -X POST \
-H "Content-Type: application/json" \
-H "User-Agent: Yahoo AppID: 'あなたの Client ID（アプリケーション ID）'" \
https://jlp.yahooapis.jp/JIMService/V2/conversion \
-d '{
  "id": "1",
  "jsonrpc": "2.0",
  "method": "jlp.jimservice.conversion",
  "params": {
    "q": "きょ",
    "mode": "predictive",
    "results": 10
  }
}' | jq -cr '.result.segment[].candidate'
```

実行結果:

```json
["きょ", "協同", "きょう", "京", "今日", "教育", "協会", "境界", "教会", "供給"]
```

「きょ」から予測される変換候補を取得しています。

### ひらがなを全角カタカナに変換

実行例:

```bash
curl -s -X POST \
-H "Content-Type: application/json" \
-H "User-Agent: Yahoo AppID: 'あなたの Client ID（アプリケーション ID）'" \
https://jlp.yahooapis.jp/JIMService/V2/conversion \
-d '{
  "id": "1",
  "jsonrpc": "2.0",
  "method": "jlp.jimservice.conversion",
  "params": {
    "q": "しょーとけーき",
    "option": [
      "katakana"
    ]
  }
}' | jq -r '[.result.segment[].katakana] | join(" ")'
```

実行結果:

```
ショート ケーキ
```

リクエストパラメータの params/option に `katakana` を追記することで、レスポンスフィールドに `katakana` が追加されます。

### かな漢字変換に地名辞書を利用

実行例:

```bash
curl -s -X POST \
-H "Content-Type: application/json" \
-H "User-Agent: Yahoo AppID: 'あなたの Client ID（アプリケーション ID）'" \
https://jlp.yahooapis.jp/JIMService/V2/conversion \
-d '{
  "id": "1",
  "jsonrpc": "2.0",
  "method": "jlp.jimservice.conversion",
  "params": {
    "q": "はなてん",
    "dictionary": [
      "place"
    ]
  }
}' | jq -r '.result.segment[].candidate[]'
```

実行結果:

```
放出
はなてん
```

リクエストパラメータの params/dictionary に `place` を追記することで、地名辞書を使った変換が行われます。

## こちらの機能の活用事例

- [ルビ振り・かな漢字変換を用いたクエリ拡張](../03_API_Examples/08_FuriganaServiceJIMService_QueryExpansion.ipynb)
