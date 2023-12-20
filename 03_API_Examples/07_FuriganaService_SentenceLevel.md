# テキストの難易度判定
テキスト解析 Web API の[ルビ振り](../02_API_Specifications/03_FuriganaService.md)では、リクエストパラメータに grade を指定して、例えば小学1年生で習う漢字にはルビを振らない等の設定を行うことができます。<br>
そのため、grade の値を変更してルビ振り API にリクエストを投げると、実行結果が変わることもあります。

「お花」を例で実行結果を見てみます。<br>
grade に1を指定してリクエストを投げると

```bash
curl -s -X POST \
-H "Content-Type: application/json" \
-H "User-Agent: Yahoo AppID: 'あなたの Client ID（アプリケーション ID）'" \
https://jlp.yahooapis.jp/FuriganaService/V2/furigana \
-d '{
  "id": "1",
  "jsonrpc": "2.0",
  "method": "jlp.furiganaservice.furigana",
  "params": {
    "q": "お花",
    "grade": 1
  }
}' | jq -c '.result.word[]'
```

実行結果は「お花」にルビが振られています。

```
{"furigana":"おはな","roman":"ohana","subword":[{"furigana":"お","roman":"o","surface":"お"},{"furigana":"はな","roman":"hana","surface":"花"}],"surface":"お花"}
```

grade に2を指定してリクエストを投げると

```bash
curl -s -X POST \
-H "Content-Type: application/json" \
-H "User-Agent: Yahoo AppID: 'あなたの Client ID（アプリケーション ID）'" \
https://jlp.yahooapis.jp/FuriganaService/V2/furigana \
-d '{
  "id": "1",
  "jsonrpc": "2.0",
  "method": "jlp.furiganaservice.furigana",
  "params": {
    "q": "お花",
    "grade": 2
  }
}' | jq -c '.result.word[]'
```

実行結果は先ほどと違い「お花」にルビが振られていません。

```
{"surface":"お花"}
```

実行結果の違いから「お花」は小学1年生で習う漢字で構成されていることがわかります。

これを利用することで解析対象テキストの難易度判定を行うことができます。

## シェルスクリプト

解析対象テキストの難易度判定のサンプル実装です。

[script.sh](./07_FuriganaService_SentenceLevel_src/script.sh)

```shell
query=$1

if [ ! "$1" ]; then
  echo "クエリはセットされていません."
  exit 1
fi

for i in {1..8}; do
  n_furigana=`curl -s -X POST \
    -H "Content-Type: application/json" \
    -H "User-Agent: Yahoo AppID: $APPID" \
    https://jlp.yahooapis.jp/FuriganaService/V2/furigana \
    -d '{
      "id": "1", "jsonrpc": "2.0", "method": "jlp.furiganaservice.furigana",
      "params": {"q": "'$query'", "grade": '$i'}
    }' | jq -cr '[.result.word[] | .furigana ] | join("") | length '`
  if [ $n_furigana -eq 0 ] && [ $i -eq 1 ]; then
    echo "「$1」には漢字が含まれていません。"
    break
  elif [ $n_furigana -eq 0 ] && [ $i -lt 8 ]; then
    echo "「$1」は小学校$(($i-1))年生以下で習う漢字・熟語で構成されています。"
    break
  elif [ $n_furigana -eq 0 ] && [ $i -eq 8 ]; then
    echo "「$1」は中学校以下で習う漢字・熟語が含まれています。"
  elif [ $i -eq 8 ]; then
    echo "「$1」には常用漢字以外が含まれています。"
  fi
done
```

実行前には APPID を環境変数として設定しておきます。

```
export APPID='あなたの Client ID（アプリケーション ID）'
```

（※）Client ID については[こちら](../02_API_Specifications/00_Overview.md#client-id%E3%82%A2%E3%83%97%E3%83%AA%E3%82%B1%E3%83%BC%E3%82%B7%E3%83%A7%E3%83%B3id)をご覧ください。

コマンドライン引数に解析対象テキストを与え、実行すると下記のような結果になります。

例1: 小学3年生で習う「美」を含む場合

```
bash script.sh 花は美しい
```

実行結果

```
「花は美しい」は小学校3年生以下で習う漢字・熟語で構成されています。
```

例2: 中学生で習う「囲碁」を含む場合

```
bash script.sh 囲碁で遊ぶ
```

実行結果

```
「囲碁で遊ぶ」は中学校で習う漢字・熟語が含まれています。
```

例3: 常用漢字に含まれない「薔薇」を含む場合

```
bash script.sh 薔薇は美しい
```

実行結果

```
「薔薇は美しい」には常用漢字以外が含まれています。
```

## 使用しているテキスト解析 Web API

- [ルビ振り](../02_API_Specifications/03_FuriganaService.md)

## 著者

LINEヤフー株式会社 言語処理エンジニア  
伊奈 拓郎（[@tuna_takenoko](https://x.com/tuna_takenoko)）
