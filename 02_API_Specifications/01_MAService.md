# 日本語形態素解析

テキスト解析 Web API の日本語形態素解析は、日本語文を形態素に分割し、品詞の推定や活用処理、読みを付与します。
 
形態素とは、日本語として意味を持つ最小単位です。ただし、日本語形態素解析で扱う「形態素」は言語学的に厳密なものではありません。「辞書にある単語」くらいのイメージで捉えていただけると良いかと思います。

ここでは、日本語形態素解析の機能について、公式ページの情報の抜粋（基本情報）と「できること」視点での利用例をあげていきます。

公式ページ:

- 日本語形態素解析（V2）- Yahoo!デベロッパーネットワーク
  - https://developer.yahoo.co.jp/webapi/jlp/ma/v2/parse.html

## 基本情報

### リクエスト URL

```
https://jlp.yahooapis.jp/MAService/V2/parse
```

### リクエストパラメータ

| パラメータ                     | 値              | 説明                               |
| ------------------------------ | --------------- | ---------------------------------- |
| id（必須）                     | string,integer  | 例: 1-234-D                        |
| jsonrpc（必須）                | string          | 2.0（固定）                        |
| method（必須）                 | string          | jlp.maservice.parse（固定）        |
| params（必須）                 | object          |                                    |
| params/q（必須）               | string          | 解析対象テキスト                   |
| params/context（任意）         | object          |                                    |
| params/context/entries（任意） | array（string） | ユーザ辞書として追加したいエントリ |

### レスポンスフィールド

| フィールド      | 値             | 説明                           |
| --------------- | -------------- | ------------------------------ |
| id              | string,integer | リクエストの id の値が返ります |
| jsonrpc         | string         | 固定で「"2.0"」が返ります      |
| result          | object         | 形態素解析結果                 |
| result/tokens   | array（array） | 形態素情報のリスト             |
| result/tokens/0 | string         | （形態素情報）表記             |
| result/tokens/1 | string         | （形態素情報）読み             |
| result/tokens/2 | string         | （形態素情報）基本形表記       |
| result/tokens/3 | string         | （形態素情報）品詞             |
| result/tokens/4 | string         | （形態素情報）品詞細分類       |
| result/tokens/5 | string         | （形態素情報）活用型           |
| result/tokens/6 | string         | （形態素情報）活用形           |

### サンプルリクエストとレスポンス

公式ページにあるサンプルリクエストです。

```json
{
  "id": "1234-1",
  "jsonrpc": "2.0",
  "method": "jlp.maservice.parse",
  "params": {
    "q": "美しい水車小屋の娘"
  }
}
```

id は自由、jsonrpc は必ず "2.0"、method は日本語形態素解析では "jlp.maservice.parse" です。  
解析したいテキストを params/q にセットするだけです。

上記リクエストに対するレスポンスです。

```json
{
  "id": "1234-1",
  "jsonrpc": "2.0",
  "result": {
    "tokens": [
      ["美しい", "うつくしい", "美しい", "形容詞", "*", "イ形容詞イ段", "基本形"],
      ["水車", "すいしゃ", "水車", "名詞", "普通名詞", "*", "*"],
      ["小屋", "こや", "小屋", "名詞", "普通名詞", "*", "*"],
      ["の", "の", "の", "助詞", "接続助詞", "*", "*"],
      ["娘", "むすめ", "娘", "名詞", "普通名詞", "*", "*"]
    ]
  }
}
```

result/tokens が解析結果の形態素のリストです。
それぞれの形態素は表記、読み、基本形表記、品詞、品詞細分類、活用型、活用形の7つの要素をリストとして持っています。

## 利用例

curl と jq を用いて「できること」を実行していきます。

実行例:

```bash
curl -s -X POST \
-H "Content-Type: application/json" \
-H "User-Agent: Yahoo AppID: 'あなたの Client ID（アプリケーション ID）'" \
https://jlp.yahooapis.jp/MAService/V2/parse \
-d '{
  "id": "1",
  "jsonrpc": "2.0",
  "method": "jlp.maservice.parse",
  "params": {
    "q": "美しい水車小屋の娘"
  }
}' | jq -c '.result.tokens[]'
```

（※）Client ID については[こちら](../02_API_Specifications/00_Overview.md#client-idアプリケーション-id)をご覧ください。

実行結果（jq で results/tokens のみを取り出しています）:

```json
["美しい", "うつくしい", "美しい", "形容詞", "*", "イ形容詞イ段", "基本形"]
["水車", "すいしゃ", "水車", "名詞", "普通名詞", "*", "*"]
["小屋", "こや", "小屋", "名詞", "普通名詞", "*", "*"]
["の", "の", "の", "助詞", "接続助詞", "*", "*"]
["娘", "むすめ", "娘", "名詞", "普通名詞", "*", "*"]
```

### 形態素に区切る（分かち書き）

実行例:

```bash
curl -s -X POST \
-H "Content-Type: application/json" \
-H "User-Agent: Yahoo AppID: 'あなたの Client ID（アプリケーション ID）'" \
https://jlp.yahooapis.jp/MAService/V2/parse \
-d '{
  "id": "1",
  "jsonrpc": "2.0",
  "method": "jlp.maservice.parse",
  "params": {
    "q": "美しい水車小屋の娘"
  }
}' | jq -r '[ .result.tokens[] | .[0] ] | join(" ")'
```

実行結果:

```
美しい 水車 小屋 の 娘
```

### 読みを得る

実行例:

```bash
curl -s -X POST \
-H "Content-Type: application/json" \
-H "User-Agent: Yahoo AppID: 'あなたの Client ID（アプリケーション ID）'" \
https://jlp.yahooapis.jp/MAService/V2/parse \
-d '{
  "id": "1",
  "jsonrpc": "2.0",
  "method": "jlp.maservice.parse",
  "params": {
    "q": "東京特許許可局局長今日急遽休暇許可却下"
  }
}' | jq -r '[ .result.tokens[] | .[1] ] | join(" ")'
```

実行結果:

```
とうきょう とっきょ きょか きょく きょくちょう きょう きゅうきょ きゅうか きょか きゃっか
```

テキスト解析 Web API の[ルビ振り](./03_FuriganaService.md)と同等の出力が得られます。

### 品詞を得る

```bash
curl -s -X POST \
-H "Content-Type: application/json" \
-H "User-Agent: Yahoo AppID: 'あなたの Client ID（アプリケーション ID）'" \
https://jlp.yahooapis.jp/MAService/V2/parse \
-d '{
  "id": "1",
  "jsonrpc": "2.0",
  "method": "jlp.maservice.parse",
  "params": {
    "q": "吾輩はここで始めて人間というものを見た"
  }
}' | jq -r '[ .result.tokens[] | .[3] ] | join(" ")'
```

```
名詞 助詞 指示詞 助詞 動詞 名詞 助詞 動詞 名詞 助詞 動詞
```

これらは品詞の一番上位のカテゴリで、jq で .[4] を指定するともう一段詳細なもの（普通名詞、副助詞、名詞形態指示詞など）も得られます。

### 活用形の元の形（基本形）を得る

```bash
curl -s -X POST \
-H "Content-Type: application/json" \
-H "User-Agent: Yahoo AppID: 'あなたの Client ID（アプリケーション ID）'" \
https://jlp.yahooapis.jp/MAService/V2/parse \
-d '{
    "id":"1",
    "jsonrpc":"2.0",
    "method":"jlp.maservice.parse",
    "params":
        {"q":"ニャーニャー泣いていた事だけは記憶している"}
}' | jq -r '[ .result.tokens[] | .[2] ] | join(" ")'
```

```
ニャーニャー 泣く いる 事 だけ は 記憶 する いる
```

「泣いて」→「泣く」、「して」→「する」と基本形が得られます。

## ユーザ辞書エントリの追加

リクエストにユーザ辞書エントリを指定することで、ユーザ辞書を用いた形態素解析も行うことができます。

公式ページにあるサンプルリクエストです。

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "jlp.maservice.parse",
  "params": {
    "q": "東京スカイツリーから外濠公園が見えた。",
    "context": {
      "entries": [
        "東京スカイツリー",
        "外濠公園"
      ]
    }
  }
}
```

params/context/entries にユーザ辞書として使いたいエントリを設定します。  
サンプルでは "東京スカイツリー" と "外濠公園" がそのエントリに当たります。

上記リクエストに対するレスポンスです。

```json
{
  "id": 1,
  "jsonrpc": "2.0",
  "result": {
    "tokens": [
      ["東京スカイツリー", "とうきょうすかいつりー", "東京スカイツリー", "名詞", "固有名詞", "*", "*"],
      ["から", "から", "から", "助詞", "格助詞", "*", "*"],
      ["外濠公園", "はずごうこうえん", "外濠公園", "名詞", "固有名詞", "*", "*"],
      ["が", "が", "が", "助詞", "格助詞", "*", "*"],
      ["見えた", "みえた", "見える", "動詞", "*", "母音動詞", "タ形"],
      ["。", "。", "。", "特殊", "句点", "*", "*"]
    ]
  }
}
```

ユーザ辞書エントリ（params/context/entries）には「読み」も指定できます。下記は「外濠公園」に対して、「そとぼりこうえん」の読みを指定する例です。カンマ区切りで読みを与えます。

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "jlp.maservice.parse",
  "params": {
    "q": "東京スカイツリーから外濠公園が見えた。",
    "context": {
      "entries": [
        "東京スカイツリー",
        "外濠公園,そとぼりこうえん"
      ]
    }
  }
}
```

ユーザ辞書エントリは解析する際に毎回指定する必要があります。リクエストの最大サイズは 4KB となっていますので、辞書のサイズにはご注意ください。

### 簡単なアダルトコンテンツフィルター

ユーザ辞書にアダルトコンテンツ判定用のエントリ（読みにタグ "NG_WORD"）を設定して形態素解析を行います。

```bash
curl -s -X POST \
-H "Content-Type: application/json" \
-H "User-Agent: Yahoo AppID: 'あなたの Client ID（アプリケーション ID）'" \
https://jlp.yahooapis.jp/MAService/V2/parse \
-d '{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "jlp.maservice.parse",
  "params": {
    "q": "東京スカイツリーからラブホテルが見えた。",
    "context": {
      "entries": [
        "ラブホテル,NG_WORD",
        "アダルト,NG_WORD"
      ]
    }
  }
}' | jq -c '.result.tokens[] | select(.[1] | contains("NG_WORD"))'
```

出力結果の「読み」に文字列 "NG_WORD" が含まれていたら解析したテキストをアダルトコンテンツと見なします。

実行結果:

```json
["ラブホテル", "NG_WORD", "ラブホテル", "名詞", "固有名詞", "*", "*"]
```

## こちらの機能の活用事例

- [形態素や品詞の頻度を集計してグラフ化する](../03_API_Examples/02_MAService_FrequencyCount.md)
- [マルコフ連鎖による文生成](../03_API_Examples/02_MAService_MarkovChain.md)
- [複数ワードを入力テキストにマッチさせる際に形態素解析を使い誤マッチ減少](../03_API_Examples/02_MAService_Sumapy.md)
