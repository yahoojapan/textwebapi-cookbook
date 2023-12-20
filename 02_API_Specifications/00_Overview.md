# 概要

Yahoo! JAPAN が提供するテキスト解析 Web API は、下記の機能を提供しています。

- 「日本語形態素解析」- 日本語文を形態素に分割し品詞などの情報を付与する
- 「かな漢字変換」 - ローマ字・ひらがなの文を漢字交じり文に変換する
- 「ルビ振り」 - 読み仮名を振る
- 「校正支援」 - 入力ミスや言葉の誤用をチェックする
- 「日本語係り受け解析」 - 文節の係り受け関係を分析する
- 「キーフレーズ抽出」 - 特徴的なフレーズを取り出す
- 「自然言語理解」 - 入力文から意図を推測し対応する情報を返す

第2章ではテキスト解析 Web API の各機能の使い方を解説していきます。
各機能の解説では、リクエストパラメータ、レスポンスの概要と簡単な実行サンプルを掲載しています。
実行サンプルは curl と jq を用いており、
macOS や Linux などの UNIX系 OS のターミナルで実行できるようになっています。

## Client ID（アプリケーション ID）

Yahoo! JAPAN の Web サービス（Web API）を使うには Client ID（アプリケーション ID）が必要です。
以下の手順で取得できます。

- Yahoo! JAPAN ID が必須ですので、まずはこれを取得してください
- 「[アプリケーションの管理](https://e.developer.yahoo.co.jp/register)」にアクセスし、Yahoo! JAPAN ID でログインします（既に Yahoo! JAPAN ID でログインしている場合は、「新しいアプリケーションを開発」の画面が表示されます）
- 必要な項目を入力すると Client ID が発行されます

詳しくこちらのページをご覧ください:

- [Client ID（アプリケーション ID）とは](https://support.yahoo-net.jp/PccDeveloper/s/article/H000006122)

Client ID は例えば下記のような文字列です（この Client ID は例示のためのものであり、実際には無効です）。

- `gUxspU.xg66pvU7W5OJMz0vH11FYB.FT5sWcQomZrtmPF6sG.14VlAuMdCHoBuIeMyOpRtlJAlc-`

本クックブックのサンプルコードでは Client ID が必要な部分に
`'あなたの Client ID（アプリケーション ID）'` と書かれています。
取得した Client ID に置き換えてご利用ください。

## クレジットの表示

テキスト解析 Web API を使ったアプリケーションを公開する場合には
クレジット表示が必要となります。

詳しくはこちらのページをご覧ください:

- [クレジット表示](https://developer.yahoo.co.jp/attribution/)

本クックブックに掲載しているサンプルコードは、あくまでサンプルコードであり、アプリケーションとして公開しているものではないためクレジット表記は省略しています。
もし、本クックブックのサンプルコードをベースにアプリケーションを開発し、それを公開する場合にはクレジット表示をお忘れなくお願いします。

## 本章で使用するコマンドラインツール

本章では、Web API へのリクエストサンプルには curl を、Web API のレスポンス JSON を加工するためには jq を使用します。これらはいずれもコマンドラインから使用するツールです。以下でそれぞれの
基本的な使い方を説明します。

### curl

curl はサーバーへのデータ転送を行うコマンドラインツールです。本章では、Web API へのリクエストのサンプルに curl を使用しています。

サンプルでは下記のようなオプション構成で curl をコマンドラインで実行します。

```bash
curl -s \
-X POST \
-H "Content-Type: application/json" \
-H "User-Agent: Yahoo AppID: 'あなたの Client ID（アプリケーション ID）'" \
https://jlp.yahooapis.jp/MAService/V2/parse \
-d '{
  "id": "1234-1",
  "jsonrpc" : "2.0",
  "method" : "jlp.maservice.parse",
  "params" : {
    "q" : "美しい水車小屋の娘"
  }
}'
```

それぞれのオプションを説明していきます。

リクエストパラメータは POST メソッドで JSON 形式で渡す必要があります。
"-X" オプションで POST メソッドを指定します。
"-H" オプション（リスクエストヘッダーの設定）で "Content-Type" に "application/json" をセットし、JSON を渡すことを明示します。

Web API を使うには Client ID（アプリケーション ID）が必要です。
"-H" オプションを再度用いて "User-Agent" に
"Yahoo AppID: 'あなたの Client ID（アプリケーション ID）'"
をセットします。

実際には下記のようになります:

- `-H "User-Agent: Yahoo AppID: gUxspU.xg6...6sG.14V...Alc-"`

なお、このようにヘッダーで渡す方式ではなく[パラメータで Client ID を渡す](https://developer.yahoo.co.jp/appendix/request/#%E3%82%A2%E3%83%97%E3%83%AA%E3%82%B1%E3%83%BC%E3%82%B7%E3%83%A7%E3%83%B3ID%E3%81%AB%E3%81%A4%E3%81%84%E3%81%A6)こともできます。CORS 対応においては必須となります。

JSON 形式のリクエストパラメータは "-d" オプションで指定します。
クオート内では改行が含まれていても大丈夫です。

ダウンロードの進捗やエラー出力を表示させないように "-s" オプションを指定します。

Web API のリクエスト URL はオプションではなく引数として指定します。
日本語形態素解析の場合は "https://jlp.yahooapis.jp/MAService/V2/parse" です。

### jq

jq は JSON から必要な部分だけ取り出したり、整形して読みやすくしたりできる JSON 操作コマンドです。
詳細は [jq の公式サイト](https://jqlang.github.io/jq/) をご覧ください。

本章のサンプルで Web API のレスポンス JSON を加工するために用いています。
ここではサンプルで使用している最小限の使い方のみ説明します。

#### 整形

```bash
echo '{"A":1, "B":3, "C":5}' | jq
```

```json
{
  "A": 1,
  "B": 3,
  "C": 5
}
```

```bash
echo '[{"name":"Abc","val":1},{"name":"Def","val":2}]' | jq
```

```json
[
  {
    "name": "Abc",
    "val": 1
  },
  {
    "name": "Def",
    "val": 2
  }
]
```

#### キーを指定しての抽出

```bash
echo '{"A":1, "B":3, "C":5}' | jq '.B'
```

```json
3
```

#### 配列の抽出

```bash
echo '{"A":1, "B":[7,8,9]}' | jq '.B[]'
```

```json
7
8
9
```

```bash
echo '{"B":[{"name":"Abc","val":1},{"name":"Def","val":2}]}' | jq '.B[]'
```

```json
{
  "name": "Abc",
  "val": 1
}
{
  "name": "Def",
  "val": 2
}
```

#### 配列の要素を抽出しキー指定で値を抜き出してリストにする

```bash
echo '{"B":[{"name":"Abc","val":1},{"name":"Def","val":2}]}' | jq '.B[] | .name'
```

```json
"Abc"
"Def"
```

#### 配列の n 番目の要素の抽出してリストにする

```bash
echo '{"B":[[1,2,3],[4,5,6],[7,8,9]]}' | jq '.B[] | .[0]'
```

```json
1
4
7
```

```bash
echo '{"B":[[1,2,3],[4,5,6],[7,8,9]]}' | jq '.B[] | .[2]'
```

```json
3
6
9
```

#### テキスト解析 Web API での使用例

curl の説明で用いたサンプルの出力 JSON をファイル "samp.json" に保存して、例として用います。

```bash
curl -s -X POST \
-H "Content-Type: application/json" \
-H "User-Agent: Yahoo AppID: 'あなたの Client ID（アプリケーション ID）'" \
https://jlp.yahooapis.jp/MAService/V2/parse \
-d '{
  "id": "1234-1",
  "jsonrpc": "2.0",
  "method": "jlp.maservice.parse",
  "params": {
    "q": "美しい水車小屋の娘"
  }
}' > samp.json
```

samp.json: 適宜改行を入れています

```json:samp.json
{"id":"1234-1","jsonrpc":"2.0","result":{"tokens":[
["美しい","うつくしい","美しい","形容詞","*","イ形容詞イ段","基本形"],
["水車","すいしゃ","水車","名詞","普通名詞","*","*"],
["小屋","こや","小屋","名詞","普通名詞","*","*"],
["の","の","の","助詞","接続助詞","*","*"],
["娘","むすめ","娘","名詞","普通名詞","*","*"]]}}
```

##### キーを指定しての抽出

```bash
cat samp.json | jq '.id, .jsonrpc'
```

```json
"1234-1"
"2.0"
```

##### 配列の n 番目の要素の抽出してリストにする

```bash
cat samp.json | jq '.result.tokens[] | .[0]'
```

```json
"美しい"
"水車"
"小屋"
"の"
"娘"
```
