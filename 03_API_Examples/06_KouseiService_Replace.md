# 校正支援の指摘対象の文字列を置換先候補に置き換える方法

テキスト解析 Web API の校正支援の指摘対象に置換先候補がある場合に、対象の文字列を置換先候補に置き換える方法を説明します。

置換の方法は次の2つがあります。

1. 置換先候補がある指摘対象全てを置換する
2. 指定した指摘対象のみを置換する

なお本プログラムは、[replace.js](./06_KouseiService_Replace_src/replace.js) にも置いていますのでご活用ください。

## 準備

ここでは JavaScript（Node.js v18）を使った実装例を紹介します。
Node.js は以下の URL からダウンロードしてください。

https://nodejs.org/en/download

## 実装例

replace.js

```javascript
const APPID = 'あなたの Client ID（アプリケーション ID）'

// テキスト解析 Web API（校正支援）へのリクエスト用関数
async function postRequest(query) {
  const url = 'https://jlp.yahooapis.jp/KouseiService/V2/kousei'
  const req = {
    id: '1',
    jsonrpc: '2.0', 
    method: 'jlp.kouseiservice.kousei',
    params: { q: query }
  }
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': `Yahoo AppID: ${APPID}`
    },
    body: JSON.stringify(req)
  })
  return await response.json()
}

// 1. 置換先候補がある指摘対象全てを置換
function replaceQuery(query, suggestions) {
  let replacedQuery = query
  for (const s of suggestions) {
    // 置換先候補がない場合は suggestion フィールドが空文字列になる
    // このときは指摘対象を置換しない
    if (s.suggestion == "") { continue }
    replacedQuery = replacedQuery.replace(s.word, s.suggestion)
    }
  return replacedQuery
}

// 2. 指定した指摘対象のみを置換
function replaceQueryByIndex(query, suggestions, index) {
  const s = suggestions[index - 1]
  const preTarget = query.substring(0, parseInt(s.offset))
  const postTarget = query.substring(parseInt(s.offset) + parseInt(s.length))
  return preTarget + s.suggestion + postTarget
}

// コマンドライン引数で校正対象の文字列などを受け取る
async function main() {
  // 校正対象の文字列
  const query = process.argv[2]

  // 先頭から何番目の指摘を置換するか指定
  // 指定がない場合は置換先候補がある指摘対象全てを置換
  const target = parseInt(process.argv[3]) || null

  const response = await postRequest(query)
  if (target) {
    console.log(replaceQueryByIndex(query, response.result.suggestions, target))
  } else {
    console.log(replaceQuery(query, response.result.suggestions))
  }
}

main()
```

（※）Client ID については[こちら](../02_API_Specifications/00_Overview.md#client-idアプリケーション-id)をご覧ください。

## 実行例

### 置換先候補がある指摘対象全てを置換する

`replaceQuery` 関数を利用して置換します。

例1: 「食べれる」を置換します。
「横槍」は「槍」が常用漢字表に含まれないことを指摘されますが、置換先候補がない指摘になります。

```
node replace.js "食べれる,横槍"
```

実行結果

```
食べられる,横槍
```

例2: 「気性庁」「週刊天気予報」「降水確立」を置換します。
```
node replace.js "気性庁が発表した週刊天気予報によると、週末の東京の降水確立は50%。"
```

実行結果

```
気象庁が発表した週間天気予報によると、週末の東京の降水確率は50%。
```

### 指定した指摘対象のみを置換する

`replaceQueryByIndex` 関数を利用して置換します。

以下の文の2番目の「食べれる」だけ「食べられる」に置換することを考えます。
```
「食べれる」は「食べれる」のら抜き言葉です。
```

校正支援からは指摘対象の入力文中の位置も得られるので、これを利用して2番目の指摘だけを置換先候補で置き換えます。

コマンドライン引数より置換対象の指摘を指定すると、指定した指摘のみを置換します。

```
node replace.js "「食べれる」は「食べれる」のら抜き言葉です。" 2
```

実行結果

```
「食べれる」は「食べられる」のら抜き言葉です。
```

## 使用しているテキスト解析 Web API

- [校正支援](../02_API_Specifications/04_KouseiService.md)

## 著者
LINEヤフー株式会社 言語処理エンジニア  
井上 裁都
