# 校正支援

テキスト解析 Web API の校正支援は、日本語文章の品質チェック（校正）を支援します。 

文字の入力ミス、言葉の誤用、わかりにくい表記、不適切な表現などをチェックして指摘します。
これらの処理は入力テキストを内部の辞書データに照合することで実現されています。
辞書データは人力で作成しているので抜け・漏れがあります。

ここでは、校正支援の機能について、公式ページの情報の抜粋（基本情報）と「できること」視点での利用例をあげていきます。

公式ページ:

- 校正支援（V2）- Yahoo!デベロッパーネットワーク
  - https://developer.yahoo.co.jp/webapi/jlp/kousei/v2/kousei.html

## 基本情報

### リクエスト URL

```
https://jlp.yahooapis.jp/KouseiService/V2/kousei
```

### リクエストパラメータ

| パラメータ       | 値             | 説明                             |
| ---------------- | -------------- | -------------------------------- |
| id（必須）       | string,integer | 例: 1-234-D                      |
| jsonrpc（必須）  | string         | 2.0（固定）                      |
| method（必須）   | string         | jlp.kouseiservice.kousei（固定） |
| params（必須）   | object         |                                  |
| params/q（必須） | string         | 校正対象テキスト                 |

### レスポンスフィールド

| フィールド                    | 値              | 説明                           |
| ----------------------------- | --------------- | ------------------------------ |
| id                            | string,integer  | リクエストの id の値が返ります |
| jsonrpc                       | string          | 固定で「"2.0"」が返ります      |
| result                        | object          | 校正結果                       |
| result/suggestions            | array（object） | 校正結果のリスト               |
| result/suggestions/word       | string          | 指摘対象                       |
| result/suggestions/suggestion | string          | 指摘対象の置換先候補           |
| result/suggestions/note       | string          | 指摘の補足情報                 |
| result/suggestions/rule       | string          | 指摘理由（注 1）               |
| result/suggestions/offset     | string          | マッチした部分の始まりの位置   |
| result/suggestions/length     | string          | マッチした部分の長さ           |

（注 1）指摘理由には以下の種類が存在しています。

1. 表記・表現の間違いや不適切な表現に関する指摘
   - 誤変換
   - 誤用
   - 使用注意
   - 不快語
   - 機種依存または拡張文字
   - 外国地名
   - 固有名詞
   - 人名
   - ら抜き
2. わかりやすい表記にするための指摘
   - 当て字
   - 表外漢字あり
   - 用字
3. 文章をよりよくするための指摘
   - 用語言い換え（商標など）
   - 二重否定
   - 助詞不足の可能性あり
   - 冗長表現
   - 略語

### サンプルリクエストとレスポンス

公式ページにあるサンプルリクエストです。

```json
{
  "id": "1234-1",
  "jsonrpc": "2.0",
  "method": "jlp.kouseiservice.kousei",
  "params": {
    "q": "セキュリティー,食べれる"
  }
}
```

id は自由、jsonrpc は必ず "2.0"、method は校正支援では "jlp.kouseiservice.kousei" です。  
解析したいテキストを params/q にセットします。

上記リクエストに対するレスポンスです。

```json
{
  "id": "1234-1",
  "jsonrpc": "2.0",
  "result": {
    "suggestions": [
      {
        "length": "7",
        "note": "語末が-tyだが昨今のネット上の慣習に準ず",
        "offset": "0",
        "rule": "用字",
        "suggestion": "セキュリティ",
        "word": "セキュリティー"
      },
      {
        "length": "4",
        "note": "",
        "offset": "8",
        "rule": "ら抜き",
        "suggestion": "食べられる",
        "word": "食べれる"
      }
    ]
  }
}
```

result/suggestions が校正による指摘のリストです。  
それぞれの指摘は対象の表記（word）、置換先候補（suggestion）、補足情報（note）、指摘理由（rule）、表記の始まり位置（offset）、表記の長さ（length）の6つの要素をもっています。

## 利用例

curl と jq を用いて「できること」を実行していきます。

実行例:

```bash
curl -s -X POST \
-H "Content-Type: application/json" \
-H "User-Agent: Yahoo AppID: 'あなたの Client ID（アプリケーション ID）'" \
https://jlp.yahooapis.jp/KouseiService/V2/kousei \
-d '{
  "id": "1",
  "jsonrpc": "2.0",
  "method": "jlp.kouseiservice.kousei",
  "params": {
    "q": "セキュリティーで食べれるのか"
  }
}' | jq -c '.result.suggestions[]'
```

（※）Client ID については[こちら](../02_API_Specifications/00_Overview.md#client-idアプリケーション-id)をご覧ください。

実行結果（jq で results/suggestions のみを取り出しています）:

```json
{"length": "7", "note": "語末が-tyだが昨今のネット上の慣習に準ず", "offset": "0", "rule": "用字", "suggestion": "セキュリティ", "word": "セキュリティー"}
{"length": "4", "note": "", "offset": "8", "rule": "ら抜き", "suggestion": "食べられる", "word": "食べれる"}
```

### 指摘対象と置換先候補を CSV で得る

実行例:

```bash
curl -s -X POST \
-H "Content-Type: application/json" \
-H "User-Agent: Yahoo AppID: 'あなたの Client ID（アプリケーション ID）'" \
https://jlp.yahooapis.jp/KouseiService/V2/kousei \
-d '{
  "id": "1",
  "jsonrpc": "2.0",
  "method": "jlp.kouseiservice.kousei",
  "params": {
    "q": "セキュリティーで食べれるのか"
  }
}' | jq -r '.result.suggestions[] | [.word,.suggestion] | @csv'
```

実行結果:

```
"セキュリティー","セキュリティ"
"食べれる","食べられる"
```

### 指摘対象、指摘理由、補足情報を CSV で得る

実行例:

```bash
curl -s -X POST \
-H "Content-Type: application/json" \
-H "User-Agent: Yahoo AppID: 'あなたの Client ID（アプリケーション ID）'" \
https://jlp.yahooapis.jp/KouseiService/V2/kousei \
-d '{
  "id": "1",
  "jsonrpc": "2.0",
  "method": "jlp.kouseiservice.kousei",
  "params": {
    "q": "セキュリティーで食べれるのか"
  }
}' | jq -r '.result.suggestions[] | [.word,.rule,.note] | @csv'
```

実行結果:

```
"セキュリティー","用字","語末が-tyだが昨今のネット上の慣習に準ず"
"食べれる","ら抜き",""
```

### 指摘の始まり位置、長さ、置換先候補を CSV で得る

実行例:

```bash
curl -s -X POST \
-H "Content-Type: application/json" \
-H "User-Agent: Yahoo AppID: 'あなたの Client ID（アプリケーション ID）'" \
https://jlp.yahooapis.jp/KouseiService/V2/kousei \
-d '{
  "id": "1",
  "jsonrpc": "2.0",
  "method": "jlp.kouseiservice.kousei",
  "params": {
    "q": "セキュリティーで食べれるのか"
  }
}' | jq -r '.result.suggestions[] | [.offset,.length,.suggestion] | @csv'
```

実行結果:

```
"0","7","セキュリティ"
"8","4","食べられる"
```

指摘対象がある位置の文字列を置換先候補に置換するといった使い方ができます。

## こちらの機能の活用事例

- [校正支援の指摘対象の文字列を置換先候補に置き換える方法](../03_API_Examples/06_KouseiService_Replace.md)
- [1つの HTML ファイルだけで完結する校正支援 API デモページ](../03_API_Examples/06_KouseiService_CORSDemo.md)
