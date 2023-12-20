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
