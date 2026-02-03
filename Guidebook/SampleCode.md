# テキスト解析 Web API ガイドブック サンプルコード集

## 目次
- [はじめにお読みください](#はじめにお読みください)
- [第2章 テキスト解析 Web API の利用準備](#第2章-テキスト解析-web-api-の利用準備)
- [第3章 テキスト解析 Web API ハンズオン](#第3章-テキスト解析-web-api-ハンズオン)
  - [3.1 日本語形態素解析](#31-日本語形態素解析)
  - [3.2 固有表現抽出](#32-固有表現抽出)
  - [3.3 キーフレーズ抽出](#33-キーフレーズ抽出)
- [第4章 テキスト解析 Web API ハック例](#第4章-テキスト解析-web-api-ハック例)
  - [4.1 日本語形態素解析 API を用いたハック例](#41-日本語形態素解析-api-を用いたハック例)
  - [4.2 固有表現抽出 API を用いたハック例](#42-固有表現抽出-api-を用いたハック例)
  - [4.3 キーフレーズ抽出 API を用いたハック例](#43-キーフレーズ抽出-api-を用いたハック例)
- [付録 演習問題略解](#付録-演習問題略解)

## はじめにお読みください
- サンプルコードの実行にはガイドブック第2章に記載の利用準備が必要です
- Client ID が必要なサンプルコードでは，変数`APPID`に Client ID が設定されているものとします
- 変数`APPID`は以下のように設定してください
```bash
APPID="あなたの Client ID（アプリケーション ID）"
```
- 第4章のサンプルコードは個別に Client ID の置き換えが必要なためご注意ください

## 第2章 テキスト解析 Web API の利用準備

### 2.2	ツールの準備

jq をインストール (MacOS でのやり方)
```bash
brew install jq
```

curl を使用して日本語形態素解析の Web API にリクエストを送信
```bash
curl -s \
-X POST \
-H "Content-Type: application/json" \
-H "User-Agent: Yahoo AppID: $APPID" \
https://jlp.yahooapis.jp/MAService/V2/parse \
-d '{
  "id": "1234-1",
  "jsonrpc": "2.0",
  "method": "jlp.maservice.parse",
  "params": {
    "q": "美しい水車小屋の娘"
  }
}' > sample.json
```

レスポンスを表示
```bash
cat sample.json
```

jq で形態素の表記のみを取り出す
```bash
cat sample.json | jq '.result.tokens[] | .[0]'
```

## 第3章 テキスト解析 Web API ハンズオン

### 3.1 日本語形態素解析

#### 3.1.3 実行例

全形態素の情報を抽出
```bash
curl -s -X POST \
-H "Content-Type: application/json" \
-H "User-Agent: Yahoo AppID: $APPID" \
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

分かち書き
```bash
curl -s -X POST \
-H "Content-Type: application/json" \
-H "User-Agent: Yahoo AppID: $APPID" \
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

品詞を得る
```bash
curl -s -X POST \
-H "Content-Type: application/json" \
-H "User-Agent: Yahoo AppID: $APPID" \
https://jlp.yahooapis.jp/MAService/V2/parse \
-d '{
  "id": "1",
  "jsonrpc": "2.0",
  "method": "jlp.maservice.parse",
  "params": {
    "q": "美しい水車小屋の娘"
  }
}' | jq -r '[ .result.tokens[] | .[3] ] | join(" ")'
```

ユーザ辞書エントリの追加
```bash
curl -s -X POST \
-H "Content-Type: application/json" \
-H "User-Agent: Yahoo AppID: $APPID" \
https://jlp.yahooapis.jp/MAService/V2/parse \
-d '{
  "id": "1",
  "jsonrpc": "2.0",
  "method": "jlp.maservice.parse",
  "params": {
    "q": "美しい水車小屋の娘",
    "context": {
      "entries": [
        "水車小屋,すいしゃごや",
        "東京スカイツリー"
      ]
    }
  }
}' | jq -c '.result.tokens[]'
```

### 3.2 固有表現抽出

#### 3.2.3 実行例

固有表現の一覧を抽出
```bash
curl -s -X POST \
-H "Content-Type: application/json" \
-H "User-Agent: Yahoo AppID: $APPID" \
https://jlp.yahooapis.jp/NERService/V1/extract \
-d '{
    "id": "1",
    "jsonrpc": "2.0",
    "method": "jlp.nerservice.extract",
    "params": {
      "q": "Xデータ株式会社の加藤さんは、10時に東京駅に到着しました。"
    }
}' | jq -c '.result.entityList[]'
```

LOCATION（地名）だけを取得する
```bash
curl -s -X POST \
-H "Content-Type: application/json" \
-H "User-Agent: Yahoo AppID: $APPID" \
https://jlp.yahooapis.jp/NERService/V1/extract \
-d '{
    "id": "1",
    "jsonrpc": "2.0",
    "method": "jlp.nerservice.extract",
    "params": {
      "q": "Xデータ株式会社の加藤さんは、10時に東京駅に到着しました。"
    }
}' | jq -c '.result.entityList[] | select(.type == "LOCATION")'
```

固有表現の種類とテキストだけを抜き出す
```bash
curl -s -X POST \
-H "Content-Type: application/json" \
-H "User-Agent: Yahoo AppID: $APPID" \
https://jlp.yahooapis.jp/NERService/V1/extract \
-d '{
    "id": "1",
    "jsonrpc": "2.0",
    "method": "jlp.nerservice.extract",
    "params": {
      "q": "12月25日、星宝株式会社の加藤さんは、新製品「DotAstroPhone」のプロモーションのため、8時に名古屋駅を
            出発し、12時に東京駅に到着しました。その日は30000円以上の購入で10%オフになる特別なキャンペーンを実施
            しました。"
    }
}' | jq -r '.result.entityList[] | [.type, .text] | join(" ")'
```

固有表現の種類別に出現回数をカウントする
```bash
curl -s -X POST \
-H "Content-Type: application/json" \
-H "User-Agent: Yahoo AppID: $APPID" \
https://jlp.yahooapis.jp/NERService/V1/extract \
-d '{
    "id": "1",
    "jsonrpc": "2.0",
    "method": "jlp.nerservice.extract",
    "params": {
      "q": "12月25日、星宝株式会社の加藤さんは、新製品「DotAstroPhone」のプロモーションのため、8時に名古屋駅を
            出発し、12時に東京駅に到着しました。その日は30000円以上の購入で10%オフになる特別なキャンペーンを実施
            しました。"
    }
}' | jq -r '[.result.entityList[]] | group_by(.type) | map({type: .[0].type, count: length}) |.[] | [.type, .count] | join(" ")'
```

### 3.3 キーフレーズ抽出

#### 3.3.3 実行例

キーフレーズの一覧を抽出
```bash
curl -s -X POST \
-H "Content-Type: application/json" \
-H "User-Agent: Yahoo AppID: $APPID" \
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

スコア上位 5 件のキーフレーズを取得する
```bash
curl -s -X POST \
-H "Content-Type: application/json" \
-H "User-Agent: Yahoo AppID: $APPID" \
https://jlp.yahooapis.jp/KeyphraseService/V2/extract \
-d '{
    "id": "1",
    "jsonrpc": "2.0",
    "method": "jlp.keyphraseservice.extract",
    "params": {
      "q": "誕生日プレゼントに時計をもらいました。スマートウォッチで、とても多彩な機能があり、その中でも健康管理が
            お気に入りです。防水仕様なのでちょっとしたアウトドアスポーツでも使うことができます。"
    }
}' | jq -r 'limit(5; .result.phrases[].text)'
```

## 第4章 テキスト解析 Web API ハック例

### 4.1 日本語形態素解析 API を用いたハック例

#### 4.1.1 形態素や品詞の頻度を集計してグラフ化する

##### ソースコードの解説
```python
import pandas as pd
import json
from urllib import request
import japanize_matplotlib
```

```bash
!pip install japanize_matplotlib
```

```python
APPID = "あなたの Client ID（アプリケーション ID）"  # ←A: Client IDの定義
URL = "https://jlp.yahooapis.jp/MAService/V2/parse"

headers = {
    "Content-Type": "application/json",
    "User-Agent": "Yahoo AppID: {}".format(APPID),
}

param_dic = {
    "id": "1234-1",
    "jsonrpc": "2.0",
    "params": {}
}

def ma(query): # ←B: 日本語形態素解析のAPIにリクエストする関数の定義
    param_dic['params']['q'] = query
    param_dic['method'] = "jlp.maservice.parse"
    params = json.dumps(param_dic).encode()
    req = request.Request(URL, params, headers)
    with request.urlopen(req) as res:
        body = res.read()
    return body.decode()
```

##### 動作確認

```python
# 日本語テキストを渡して形態素解析します
text = "国会は、国権の最高機関であって、国の唯一の立法機関である。\
国会は、衆議院及び参議院の両議院でこれを構成する。\
両議院は、全国民を代表する選挙された議員でこれを組織する。\
両議院の議員の定数は、法律でこれを定める。\
両議院の議員及びその選挙人の資格は、法律でこれを定める。\
但し、人種、信条、性別、社会的身分、門地、教育、財産又は収入によって差別してはならない。"
response = ma(text)

# 解析結果の JSON 文字列をオブジェクトに変換します
obj = json.loads(response)
```

```python
df = pd.DataFrame(
    obj['result']['tokens'],
    columns=['表記','読み','基本形','品詞','品詞細分類','活用型','活用形']
)
df.head()
```

```python
df['品詞'].value_counts().head()
```

```python
df['品詞'].value_counts().plot.pie(label='')
```

```python
df[df['品詞'] == '名詞']['表記'].value_counts().head()
```

```python
df[df['品詞'] == '名詞']['表記'].value_counts().plot.bar()
```

### 4.2 固有表現抽出 API を用いたハック例

#### 4.2.1 テキスト中の固有表現に自動でハイパーリンクを貼る

##### ソースコードの解説

```html
<!DOCTYPE html>
<html lang="ja">
  <head>
    <meta http-equiv="Content-Type" content="text/html;charset=UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>テキスト解析Web API固有表現抽出デモ</title>
    <style>
      * { box-sizing: border-box; }
      textarea, div { width: 100%; margin-top: 1rem; padding: 0.5rem; font-size: 1rem; }
      #view { border: dashed 2px gray; }
    </style>

    <script>
      const ClientID = 'あなたの Client ID（アプリケーション ID）'; // ←A: ClientIDの定義

      async function do_henkan() { // ←B: yapiner関数で解析しHTMLリンクを生成する関数の定義
          document.querySelector("#view").innerHTML = '';
          const text = document.querySelector("#input-text").value;
          const obj = await yapiner(text);
          if (! obj?.result?.entityList) return;
          make_view(text, obj);
      }
      async function yapiner(query) { // ←C: 固有表現抽出のAPIにリクエストする関数の定義
          const url = "https://jlp.yahooapis.jp/NERService/V1/extract?appid=" +
                            encodeURIComponent(ClientID);
          const res = await fetch(url, {
              method: 'POST',
              mode: 'cors',
              body: JSON.stringify({
                  "id": "A123",
                  "jsonrpc" : "2.0",
                  "method" : "jlp.nerservice.extract",
                  "params" : { "q" : query }
              }),
          });
          return res.json();
      }

      function make_view(text, obj) { // ←D: HTMLリンクを生成する関数の定義
          [...obj.result.entityList].reverse().forEach(s => {
              const pre = text.substring(0, parseInt(s.offset));
              const post = text.substring(parseInt(s.offset) + parseInt(s.length));
              if (! /^(ORGANIZATION|PERSON|LOCATION|ARTIFACT)$/.test(s.type)) return;
              const url = (/^LOCATION$/.test(s.type) ?
                           'https://map.yahoo.co.jp/search?q=' :
                           'https://ja.wikipedia.org/w/index.php?search=')
                    + encodeURIComponent(s.text);
              text = `${pre}<a target="_blank" href="${url}">${s.text}</a>${post}`;
          });
          document.querySelector("#view").innerHTML = text.replaceAll('\n', '<br>\n');
      }
    </script>
  </head>

  <body> <!-- ←E: HTML構造の基本部分-->
    <h1>テキスト解析Web API固有表現抽出デモ</h1>
    <textarea id="input-text" placeholder="入力エリア"></textarea>
    <button onclick="do_henkan()">実行</button>
    <div id="view">出力エリア</div>

    <div style="text-align: right">
      <!-- Begin Yahoo! JAPAN Web Services Attribution Snippet -->
      <span style="margin:15px 15px 15px 15px">
        <a href="https://developer.yahoo.co.jp/sitemap/">Web Services by Yahoo! JAPAN</a></span>
      <!-- End Yahoo! JAPAN Web Services Attribution Snippet -->
    </div>
  </body>
</html>
```

### 4.3 キーフレーズ抽出 API を用いたハック例

#### 4.3.1 キーフレーズを抽出してワードクラウドを作る

##### ソースコードの解説

```python
import json
from urllib import request

APPID = "あなたの Client ID（アプリケーション ID）" # ←A: Client IDの定義
URL = "https://jlp.yahooapis.jp/KeyphraseService/V2/extract"
headers = {
    "Content-Type": "application/json",
    "User-Agent": "Yahoo AppID: {}".format(APPID),
}
param_dic = {
    "id": "1234-1",
    "jsonrpc": "2.0",
    "params": {}
}

def keyphrase_service(query): # ←B: キーフレーズ抽出のAPIにリクエストする関数の定義
    param_dic['params']['q'] = query
    param_dic['method'] = "jlp.keyphraseservice.extract"
    params = json.dumps(param_dic).encode()
    req = request.Request(URL, params, headers)
    with request.urlopen(req) as res:
        body = res.read()
    return json.loads(body.decode())['result']['phrases']
```

##### 動作確認

```python
keyphrase_service('そういえば夏休みに東京タワーに行ったのを思い出しました')
```

```python
sentences = [
  "国会は、国権の最高機関であって、国の唯一の立法機関である。",
  "国会は、衆議院及び参議院の両議院でこれを構成する。",
  "両議院は、全国民を代表する選挙された議員でこれを組織する。",
  "両議院の議員の定数は、法律でこれを定める。",
  "両議院の議員及びその選挙人の資格は、法律でこれを定める。",
  "但し、人種、信条、性別、社会的身分、門地、教育、財産又は収入によって差別してはならない。",
]
```

```python
# リスト要素ごとにキーフレーズ抽出を行う
kps_list = [keyphrase_service(sentence) for sentence in sentences]

# キーフレーズのテキストのみを取り出す
all_keyphrases = [kp['text'] for kps in kps_list for kp in kps]

# キーフレーズの出現頻度を計算する
import collections
ct_keyphrases = collections.Counter(all_keyphrases)
```

```python
import matplotlib.pyplot as plt
from wordcloud import WordCloud

wordcloud = WordCloud(
    font_path='C:/Windows/Fonts/HGRSGU.TTC',
    background_color="white", width=600, height=400,
    collocations=False, colormap='Dark2', random_state=0
)
wordcloud.generate_from_frequencies(ct_keyphrases)

fig, ax = plt.subplots(1,1, figsize=(10,10))
ax.axes.xaxis.set_visible(False)
ax.axes.yaxis.set_visible(False)
ax.imshow(wordcloud)
```

font_pathの設定

| 環境 | font_path | 補足 |
| ---- | --------- | ---- |
| Google Colaboratory | `/usr/share/fonts/opentype/ipafont-gothic/ipagp.ttf` | 事前に以下のコマンドを実行する <br> `!apt-get -y install fonts-ipafont-gothic` |
| Windows | `C:/Windows/Fonts/HGRSGU.TTC` | |
| Windows（WSL） | `/mnt/c/Windows/Fonts/HGRSGU.TTC` | Windows のフォントを WSL から参照 |
| macOS | `/Library/Fonts/Arial Unicode.ttf` | |
| Linux | `/usr/share/fonts/ipa-gothic/ipag.ttf` | `fc-list` コマンドでパスを確認可能 |

## 付録 演習問題略解

### 形態素解析（3.1.5）

```bash
curl -s -X POST \
-H "Content-Type: application/json" \
-H "User-Agent: Yahoo AppID: $APPID" \
https://jlp.yahooapis.jp/MAService/V2/parse \
-d '{
  "id": "1",
  "jsonrpc": "2.0",
  "method": "jlp.maservice.parse",
  "params": {
    "q": "日本の切手は…"
  }
}' | jq -r '[.result.tokens[] | select(.[3] == "名詞") | .[0] ] | group_by(.) | map ({key: .[0], value: length}) | sort_by(.value) | reverse'
```

### 固有表現抽出（3.2.5）

```bash
curl -s -X POST \
-H "Content-Type: application/json" \
-H "User-Agent: Yahoo AppID: $APPID" \
https://jlp.yahooapis.jp/NERService/V1/extract \
-d '{
  "id": "1",
  "jsonrpc": "2.0",
  "method": "jlp.nerservice.extract",
  "params": {
    "q": "札幌市時計台（さっぽろしとけいだい）は、…"
  }
}' | jq -r '.result.entityList[] | select(.type == "LOCATION") | "https://map.yahoo.co.jp/search?q=\(.text)"' |sort -u
```

### キーフレーズ抽出（3.3.5）

```bash
curl -s -X POST \
-H "Content-Type: application/json" \
-H "User-Agent: Yahoo AppID: $APPID" \
https://jlp.yahooapis.jp/KeyphraseService/V2/extract \
-d '{
  "id": "1",
  "jsonrpc": "2.0",
  "method": "jlp.keyphraseservice.extract",
  "params": {
    "q": "幕末の…"
  }
}' | jq -rc '.result.phrases[] | "<span style=\"font-size: \(.score)% \">\(.text)</span>"' \
> a.html
```
