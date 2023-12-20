import json
from urllib import request
APPID = "あなたの Client ID（アプリケーション ID）"
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
def ma(query):
    param_dic['params']['q'] = query
    param_dic['method'] = "jlp.maservice.parse"
    params = json.dumps(param_dic).encode()
    req = request.Request(URL, params, headers)
    with request.urlopen(req) as res:
        body = res.read()
    return body.decode()

sentence = '今日は良い天気です。'
response = ma(sentence)
obj = json.loads(response)
tokens = [(x[0], x[3]) for x in obj['result']['tokens']]
print(tokens)
