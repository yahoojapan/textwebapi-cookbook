async function postRequest(query) {
    const url = 'https://jlp.yahooapis.jp/MAService/V2/parse'
    const req = {
        id: '1',
        jsonrpc: '2.0',
        method: 'jlp.maservice.parse',
        params: { q: query }
    }
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'Yahoo AppID: ' + APPID
        },
        body: JSON.stringify(req)
    })
    return await response.json()
}

async function main() {
    const query = '今日は良い天気です。'
    const response = await postRequest(query)
    console.log(response['result']['tokens'].map(x => x[0] + ':' + x[3]))
}

const APPID = 'あなたの Client ID（アプリケーション ID）';
main()
