# 固有表現抽出

テキスト解析 Web API の固有表現抽出は、日本語文を解析し、下記の8種類の固有表現（※）を取り出します。

- 固有名詞的表現
  - ORGANIZATION（組織名）：会社、団体、政府機関の名前を指します。例：国連、東京大学
  - PERSON（人名）：人物の名前を指します。例：田中、山田太郎
  - LOCATION（地名）：地理的な場所や地域を指します。例：東京、サンフランシスコ
  - ARTIFACT（固有物名）：人間の活動によって作られた具体物、抽象物の名前を指します。例：憲法、ノーベル賞
- 時間表現
  - DATE（日付表現）：特定の日付を指します。例：2023年12月7日
  - TIME（時間表現）：特定の時刻を指します。例：23時
- 数値表現
  - MONEY（金額表現）：特定の金額を指します。例：100円、100ドル
  - PERCENT（割合表現）：特定の割合を指します。例：25％、0.5％

（※）IREX（Information Retrieval and Extraction Exercise）固有表現抽出課題の定義を参考にしています。

ここでは、固有表現抽出の機能について、公式ページの情報の抜粋（基本情報）と「できること」視点での利用例をあげていきます。

公式ページ:

- 固有表現抽出（V1）- Yahoo!デベロッパーネットワーク
  - https://developer.yahoo.co.jp/webapi/jlp/ner/v1/index.html

## 基本情報

### リクエスト URL

```
https://jlp.yahooapis.jp/NERService/V1/extract
```

### リクエストパラメータ

| パラメータ       | 値             | 説明                           |
| ---------------- | -------------- | ------------------------------ |
| id（必須）       | string,integer | 例: 1-234-D                    |
| jsonrpc（必須）  | string         | 2.0（固定）                    |
| method（必須）   | string         | jlp.nerservice.extract（固定） |
| params（必須）   | object         |                                |
| params/q（必須） | string         | 解析対象テキスト               |

### レスポンスフィールド

| フィールド               | 値              | 説明                                                                                                                                                                                                                          |
| ------------------------ | --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| id                       | string,integer  | リクエストの id の値が返ります                                                                                                                                                                                                |
| jsonrpc                  | string          | 固定で「"2.0"」が返ります                                                                                                                                                                                                     |
| result                   | object          | 固有表現の抽出結果                                                                                                                                                                                                            |
| result/entityList        | array（object） | 固有表現の抽出結果を含む配列<br/>抽出結果が存在しない場合は空となります                                                                                                                                                       |
| result/entityList/text   | string          | 固有表現のテキスト                                                                                                                                                                                                            |
| result/entityList/type   | string          | 固有表現の種類<br/>以下 8 つのいずれかを返します<br/>- ORGANIZATION：組織名<br>- PERSON：人名<br>- LOCATION：地名<br>- ARTIFACT：固有物名<br>- DATE：日付表現<br>- TIME：時間表現<br>- MONEY：金額表現<br>- PERCENT：割合表現 |
| result/entityList/offset | integer         | 固有表現の文字オフセット                                                                                                                                                                                                      |
| result/entityList/length | integer         | 固有表現の文字長                                                                                                                                                                                                              |

### サンプルリクエストとレスポンス

公式ページにあるサンプルリクエストです。

```json
{
  "id": "1234-1",
  "jsonrpc": "2.0",
  "method": "jlp.nerservice.extract",
  "params": {
    "q": "Xデータ株式会社の加藤さんは、10時に東京駅に到着しました。"
  }
}
```

id は自由、jsonrpc は必ず "2.0"、method は固有表現抽出では "jlp.nerservice.extract" です。  
解析したいテキストを params/q にセットするだけです。

上記リクエストに対するレスポンスです。

```json
{
  "id": "1234-1",
  "jsonrpc": "2.0",
  "result": {
    "entityList": [
      {
        "length": 8,
        "offset": 0,
        "text": "Xデータ株式会社",
        "type": "ORGANIZATION"
      },
      {
        "length": 2,
        "offset": 9,
        "text": "加藤",
        "type": "PERSON"
      },
      {
        "length": 3,
        "offset": 15,
        "text": "10時",
        "type": "TIME"
      },
      {
        "length": 3,
        "offset": 19,
        "text": "東京駅",
        "type": "LOCATION"
      }
    ]
  }
}
```

result/entityList が固有表現抽出の結果リストです。
抽出結果では、固有表現のテキスト、種類、文字オフセット、文字長が返ってきます。

## 利用例

curl と jq を用いて「できること」を実行していきます。

実行例:

```bash
curl -s -X POST \
-H "Content-Type: application/json" \
-H "User-Agent: Yahoo AppID: 'あなたの Client ID（アプリケーション ID）'" \
https://jlp.yahooapis.jp/NERService/V1/extract \
-d '{
  "id": "1",
  "jsonrpc": "2.0",
  "method": "jlp.nerservice.extract",
  "params": {
    "q": "Xデータ株式会社の加藤さんは、10時に東京駅に到着しました。"
  }
}' | jq -c  '.result.entityList[]'
```

（※）Client ID については[こちら](../02_API_Specifications/00_Overview.md#client-id%E3%82%A2%E3%83%97%E3%83%AA%E3%82%B1%E3%83%BC%E3%82%B7%E3%83%A7%E3%83%B3id)をご覧ください。

実行結果（jq で results/entityList のみを取り出しています）:

```json
{"length":8,"offset":0,"text":"Xデータ株式会社","type":"ORGANIZATION"}
{"length":2,"offset":9,"text":"加藤","type":"PERSON"}
{"length":3,"offset":15,"text":"10時","type":"TIME"}
{"length":3,"offset":19,"text":"東京駅","type":"LOCATION"}
```

### LOCATION（地名）だけを得る

実行例:

```bash
curl -s -X POST \
-H "Content-Type: application/json" \
-H "User-Agent: Yahoo AppID: 'あなたの Client ID（アプリケーション ID）'" \
https://jlp.yahooapis.jp/NERService/V1/extract \
-d '{
  "id": "1",
  "jsonrpc": "2.0",
  "method": "jlp.nerservice.extract",
  "params": {
    "q": "Xデータ株式会社の加藤さんは、10時に東京駅に到着しました。"
  }
}' | jq '.result.entityList[] | select(.type == "LOCATION")'
```

実行結果:

```
{"length":3,"offset":19,"text":"東京駅","type":"LOCATION"}
```

### 固有表現の種類とテキストだけを抜き出す

実行例:

```bash
curl -s -X POST \
-H "Content-Type: application/json" \
-H "User-Agent: Yahoo AppID: 'あなたの Client ID（アプリケーション ID）'" \
https://jlp.yahooapis.jp/NERService/V1/extract \
-d '{
  "id": "1",
  "jsonrpc": "2.0",
  "method": "jlp.nerservice.extract",
  "params": {
    "q": "12月25日、星宝株式会社の加藤さんは、新製品「DotAstroPhone」のプロモーションのため、8時に名古屋駅を出発し、12時に東京駅に到着しました。その日は30000円以上の購入で10%オフになる特別なキャンペーンを実施しました。"
  }
}' |  jq -r '.result.entityList[] | [.type, .text] | join(" ")'
```

実行結果:

```
DATE 12月25日
ORGANIZATION 星宝株式会社
PERSON 加藤
ARTIFACT DotAstroPhone
TIME 8時
LOCATION 名古屋駅
TIME 12時
LOCATION 東京駅
MONEY 30000円
PERCENT 10%
```

### 固有表現の種類別に出現回数をカウントする

```bash
curl -s -X POST \
-H "Content-Type: application/json" \
-H "User-Agent: Yahoo AppID: 'あなたの Client ID（アプリケーション ID）'" \
https://jlp.yahooapis.jp/NERService/V1/extract \
-d '{
  "id": "1",
  "jsonrpc": "2.0",
  "method": "jlp.nerservice.extract",
  "params": {
    "q": "12月25日、星宝株式会社の加藤さんは、新製品「DotAstroPhone」のプロモーションのため、8時に名古屋駅を出発し、12時に東京駅に到着しました。その日は30000円以上の購入で10%オフになる特別なキャンペーンを実施しました。"
  }
}' | jq -r '[.result.entityList[]] | group_by(.type) | map({type: .[0].type, count: length}) |.[] | [.type, .count] | join(" ")'
```

```
ARTIFACT 1
DATE 1
LOCATION 2
MONEY 1
ORGANIZATION 1
PERCENT 1
PERSON 1
TIME 2
```

## こちらの機能の活用事例

- （今後追加予定）
