import json
from urllib import request

import markovify

APPID = "あなたの Client ID（アプリケーション ID）"
URL = "https://jlp.yahooapis.jp/MAService/V2/parse"


# テキスト解析 Web API の日本語形態素解析へリクエストする
def post(query: str):
    headers = {
        "Content-Type": "application/json",
        "User-Agent": "Yahoo AppID: {}".format(APPID),
    }
    param_dic = {
        "id": "1234-1",
        "jsonrpc": "2.0",
        "method": "jlp.maservice.parse",
        "params": {"q": query},
    }
    params = json.dumps(param_dic).encode()
    req = request.Request(URL, params, headers)
    with request.urlopen(req) as res:
        body = res.read()
    return body.decode()


# 与えられたテキストを形態素に分割する（形態素の表層形をスペース区切りにして返す）
def tokenize_text(text: str):
    response = json.loads(post(text))
    return " ".join(token[0] for token in response["result"]["tokens"])


# コーパスからマルコフモデルを作成する
def generate_model(corpus: list[str]):
    tokenized_corpus = ""
    for text in corpus:
        tokenized_text = tokenize_text(text) + "\n"
        tokenized_corpus += tokenized_text
    markov_model = markovify.NewlineText(
        tokenized_corpus, state_size=1, retain_original=False
    )
    return markov_model


if __name__ == "__main__":
    corpus = [
        "犬が嫌い。",
        "私は猫が好き。",
        "私は鳥が好き。",
        "私は犬が好き。",
        "僕は猿が好き。",
    ]
    markov_model = generate_model(corpus)
    for _ in range(3):
        sentence = markov_model.make_sentence().replace(" ", "")
        print(sentence)
