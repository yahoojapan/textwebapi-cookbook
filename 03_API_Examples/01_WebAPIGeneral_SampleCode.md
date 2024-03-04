# 各プログラミング言語でのサンプルコード

テキスト解析 Web API の簡単なサンプルプログラムを、
本クックブックで登場する各プログラミング言語ごとに紹介します。

言語は違えどサンプルプログラムの仕様は共通です。
日本語文をテキスト解析 Web API の日本語形態素解析に渡して形態素解析を行い、
解析結果から各形態素の表層文字列と品詞を取り出し表示します。

対象プログラミング言語は jq, Python, JavaScript, Perl, PHP です。
コードは[こちら](01_WebAPIGeneral_SampleCode_src/)から入手できます。

各プログラミングの実行環境の構築についてはここでは述べませんので、必要に応じて各自お調べください。

また、各コードに含まれる Client ID については[こちら](../02_API_Specifications/00_Overview.md#client-idアプリケーション-id)をご覧ください。

## jq

```bash
curl -s -X POST \
-H "Content-Type: application/json" \
-H "User-Agent: Yahoo AppID: あなたの Client ID（アプリケーション ID）" \
https://jlp.yahooapis.jp/MAService/V2/parse \
-d '{
  "id": "1",
  "jsonrpc": "2.0",
  "method": "jlp.maservice.parse",
  "params": {
    "q": "今日は良い天気です。"
  }
}' | jq -cr '[ .result.tokens[] | [.[0,3]] ]'
```

実行結果:

```json
[
  ["今日", "名詞"],
  ["は", "助詞"],
  ["良い", "形容詞"],
  ["天気", "名詞"],
  ["です", "判定詞"],
  ["。", "特殊"]
]
```

## Python

```python
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
```

実行結果:

```bash
$ python ma.py
[('今日', '名詞'), ('は', '助詞'), ('良い', '形容詞'), ('天気', '名詞'), ('です', '判定詞'), ('。', '特殊')]
```

## JavaScript（Node.js）

Node.js v18 で動作します。

```javascript
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
```

実行結果

```bash
$ node ma.js
[ '今日:名詞', 'は:助詞', '良い:形容詞', '天気:名詞', 'です:判定詞', '。:特殊' ]
```

## JavaScript（ウェブブラウザ）

HTML ファイル（ma.html など）として保存してウェブブラウザで開くと実行されます。

```html
<html lang="ja">
  <head>
    <script>
      async function postRequest(query) {
          const url = 'https://jlp.yahooapis.jp/MAService/V2/parse?appid=あなたの Client ID（アプリケーション ID）';
          const response = await fetch(url, {
              method: 'POST',
              mode: 'cors',
              body: JSON.stringify({
                  "id": "A123",
                  "jsonrpc" : "2.0",
                  "method": 'jlp.maservice.parse',
                  "params" : { "q" : query }
              }),
          });
          return await response.json();
      }
      async function main(query) {
          const response = await postRequest(query)
          document.write(response['result']['tokens'].map(x => [x[0], x[3]]))
      }
    </script>
  </head>
  <body onload="main('今日は良い天気です。')" />
</html>
```

実行結果

```
今日,名詞,は,助詞,良い,形容詞,天気,名詞,です,判定詞,。,特殊
```

# Perl

```perl
#!/usr/bin/env perl
use strict;
use warnings;
use LWP::UserAgent;
use JSON;
use utf8;
use open ':utf8';
binmode STDIN, ":utf8";
binmode STDOUT, ":utf8";

my $appid = "あなたの Client ID（アプリケーション ID）";
my $url = "https://jlp.yahooapis.jp/MAService/V2/parse";
my $ua = LWP::UserAgent->new;
$ua->default_header('Content-Type' => 'application/json');
$ua->default_header('User-Agent' => 'Yahoo AppID: '.$appid);

my $query = '今日は良い天気です。';
my $json_str = ma($query);
my $obj = JSON::decode_json($json_str);
print join(" ", (map {@$_[0,3]} @{$obj->{result}{tokens}}))."\n";

sub ma {
    my ($query) = @_;
    my $params = {
        "id" => "1",
        "jsonrpc" => "2.0",
        "method" => "jlp.maservice.parse",
        "params" => { "q" => $query }
    };
    my $response = $ua->post($url, content => JSON::encode_json($params));
    if ($response->is_success) {
        return $response->content;
    } else {
        die $response->status_line;
    }
}
```

実行結果

```bash
$ perl ma.pl
今日 名詞 は 助詞 良い 形容詞 天気 名詞 です 判定詞 。 特殊
```

## PHP

```php
<?php

$appid = "あなたの Client ID（アプリケーション ID）";
$ep = "https://jlp.yahooapis.jp/MAService/V2/parse";

$query = "今日は良い天気です。";

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $ep);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, ["Content-Type: application/json"]);
curl_setopt($ch, CURLOPT_USERAGENT, "Yahoo AppID: ".$appid);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
     "id" => "1",
     "jsonrpc" => "2.0",
     "method" => "jlp.maservice.parse",
     "params" => [ "q" => $query ]
]));
$obj = json_decode(curl_exec($ch), true);
curl_close($ch);

print(implode(" ", array_map(function($x) { return $x[0].":".$x[3]; }, $obj['result']['tokens'])));
print("\n");

?>
```

実行結果

```bash
$ php ma.php
今日:名詞 は:助詞 良い:形容詞 天気:名詞 です:判定詞 。:特殊
```

## 使用しているテキスト解析 Web API

- [日本語形態素解析](../02_API_Specifications/01_MAService.md)

## 著者

LINEヤフー研究所  
山下 達雄（[@yto](https://x.com/yto)）
