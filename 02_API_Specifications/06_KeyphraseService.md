# キーフレーズ抽出

テキスト解析 Web API のキーフレーズ抽出は、入力文から内容をよく表現している特徴的なフレーズを取り出します。 

例えば、「誕生日プレゼントに時計をもらいました。」という文では、「誕生日プレゼント」や「時計」がキーフレーズとして抽出されます。このようにキーフレーズは、一単語からなるもの（「時計」）や連続する複数の単語からなるもの（「誕生日 / プレゼント」）があります。またキーフレーズ抽出という用語になじみがない方は、キーワードを取り出すといったイメージで捉えていただけると良いでしょう。

ここでは、キーフレーズ抽出の機能について、公式ページの情報の抜粋（基本情報）と「できること」視点での利用例をあげていきます。

公式ページ:

- キーフレーズ抽出（V2）- Yahoo!デベロッパーネットワーク
  - https://developer.yahoo.co.jp/webapi/jlp/keyphrase/v2/extract.html

## 基本情報

### リクエスト URL

```
https://jlp.yahooapis.jp/KeyphraseService/V2/extract
```

### リクエストパラメータ

| パラメータ       | 値             | 説明                                 |
| ---------------- | -------------- | ------------------------------------ |
| id（必須）       | string,integer | 例: 1-234-D                          |
| jsonrpc（必須）  | string         | 2.0（固定）                          |
| method（必須）   | string         | jlp.keyphraseservice.extract（固定） |
| params（必須）   | object         |                                      |
| params/q（必須） | string         | 解析対象テキスト                     |

### レスポンスフィールド

| フィールド                   | 値              | 説明                           |
| ---------------------------- | --------------- | ------------------------------ |
| id                           | string,integer  | リクエストの id の値が返ります |
| jsonrpc                      | string          | 固定で「"2.0"」が返ります      |
| result                       | object          | キーフレーズ抽出結果           |
| result/phrases（注1）       | array（object） | キーフレーズ抽出結果のリスト   |
| result/phrases/score（注2） | integer         | キーフレーズの重要度           |
| result/phrases/text          | string          | キーフレーズ                   |

（注1）result/phrases（キーフレーズ抽出結果の配列）は、最大20です。  
（注2）result/phrases/score は、キーフレーズの重要度を示す目安の数値です。最大値を100とし、以下相対的な重要度に応じて 100以下の値が割り当てられます。

### サンプルリクエストとレスポンス

公式ページにあるサンプルリクエストです。

```json
{
  "id": "1234-1",
  "jsonrpc": "2.0",
  "method": "jlp.keyphraseservice.extract",
  "params": {
    "q": "東京ミッドタウンから国立新美術館まで歩いて5分で着きます。"
  }
}
```

id は自由、jsonrpc は必ず "2.0"、method はキーフレーズ抽出では "jlp.keyphraseservice.extract" です。  
解析したいテキストを params/q にセットするだけです。

上記リクエストに対するレスポンスです。

```json
{
  "id": "1234-1",
  "jsonrpc": "2.0",
  "result": {
    "phrases": [
      {
        "score": 100,
        "text": "東京ミッドタウン"
      },
      {
        "score": 73,
        "text": "国立新美術館"
      },
      {
        "score": 37,
        "text": "5分"
      }
    ]
  }
}
```

result/phrases がキーフレーズ抽出の結果（リスト）です。  
それぞれの抽出結果は、score（重要度）、text（キーフレーズの表記）を持っています。

## 利用例

curl と jq を用いて「できること」を実行していきます。

実行例:

```bash
curl -s -X POST \
-H "Content-Type: application/json" \
-H "User-Agent: Yahoo AppID: 'あなたの Client ID（アプリケーション ID）'" \
https://jlp.yahooapis.jp/KeyphraseService/V2/extract \
-d '{
  "id": "1",
  "jsonrpc": "2.0",
  "method": "jlp.keyphraseservice.extract",
  "params": {
    "q": "東京ミッドタウンから国立新美術館まで歩いて5分で着きます。"
  }
}' | jq -c '.result.phrases[]'
```

（※）Client ID については[こちら](../02_API_Specifications/00_Overview.md#client-id%E3%82%A2%E3%83%97%E3%83%AA%E3%82%B1%E3%83%BC%E3%82%B7%E3%83%A7%E3%83%B3id)をご覧ください。

実行結果（jq で score（スコア）と text（キーフレーズ）を取り出しています）:

```json
{"score": 100, "text": "東京ミッドタウン"}
{"score": 73, "text": "国立新美術館"}
{"score": 37, "text": "5分"}
```

### キーフレーズ Top 5 を取り出す

実行例:

```bash
curl -s -X POST \
-H "Content-Type: application/json" \
-H "User-Agent: Yahoo AppID: 'あなたの Client ID（アプリケーション ID）'" \
https://jlp.yahooapis.jp/KeyphraseService/V2/extract \
-d '{
  "id": "1",
  "jsonrpc": "2.0",
  "method": "jlp.keyphraseservice.extract",
  "params": {
    "q": "誕生日プレゼントに時計をもらいました。スマートウォッチで、とても多彩な機能があり、その中でも健康管理がお気に入りです。防水仕様なのでちょっとしたアウトドアスポーツでも使うことができます。"
  }
}' | jq -r 'limit(5; .result.phrases[].text)'
```

実行結果:

```
スマートウォッチ
防水仕様
時計
アウトドアスポーツ
誕生日プレゼント
```

抽出されるキーフレーズは最大20個となっています。
スコア降順で並び替えた結果が返却されますので、上から5つ取り出すことで、Top 5 のキーフレーズに絞ることができます。

## こちらの機能の活用事例

- [キーフレーズ抽出を用いた長文の類似度判定](../03_API_Examples/03_KeyphraseService_Similarity.md)
- [キーフレーズ抽出の結果の可視化](../03_API_Examples/03_KeyphraseService_Visualization.md)
- [キーフレーズを抽出してワードクラウドを作る](../03_API_Examples/03_KeyphraseService_Wordcloud.md)
