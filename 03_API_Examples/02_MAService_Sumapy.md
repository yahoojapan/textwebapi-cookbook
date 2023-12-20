# 複数ワードを入力テキストにマッチさせる際に形態素解析を使い誤マッチ減少

自然言語処理の中でも需要の高いタスクとして、
複数の語からなる辞書のエントリが入力テキスト内のどこに現れるかを調べるというものがあります。

具体的な応用としては

- ウェブページ内のテキストに現れる専門用語（専門用語辞書エントリ）に専門用語解説ページへのハイパーリンクを挿入する
- テキスト内に NG ワード（NG ワード辞書エントリ）が現れているかをチェックする

などがあります。

本記事では、
まず簡単な文字列マッチでの実装とその問題点を説明します。
次にそれらの問題を解決する手段として形態素解析を用いた方法を示します。

テキスト解析 Web API の日本語形態素解析を Python で使います。

## 簡単な文字列マッチとその問題点

例として、入力文「ピエトロ氏、ドレッシングはピエロ事件。」に対して、
辞書エントリ（表層文字列） `エロ`, `シング`, `ピエトロ`, `良い天気`, `事件`
をマッチさせることを考えます。

以下に、正規表現を用いた単純なマッチングを行うプログラムを示します。

```python
### 入力文とマッチさせる辞書
sentence = 'ピエトロ氏、ドレッシングはピエロ事件。'
dic = {
    'エロ': 'ero',
    'シング': 'sing',
    'ピエトロ': 'pietro',
    '良い天気': 'yoitenki',
    '事件': 'jiken',
}
print('入力文:', sentence)

### （C1）正規表現でマッチさせる
import re
pattern = '|'.join(map(
    lambda x: re.escape(x),
    sorted(dic.keys(), key=len, reverse=True)
))
for m in re.finditer(pattern, sentence):
    print("MATCH!", m.span(), m.string[m.start():m.end()])
```

実行結果:

```
入力文: ピエトロ氏、ドレッシングはピエロ事件。
MATCH! (0, 4) ピエトロ
MATCH! (9, 12) シング
MATCH! (14, 16) エロ
MATCH! (16, 18) 事件
```

辞書エントリを `|` でつなげて（`join()`）正規表現にしてそれを用いて入力文字列にマッチさせています。

- 辞書エントリに `ABC` と `AB` があった場合、入力テキスト「ABCDE」には `AB` よりも `ABC` をマッチさせたいので（最長一致）、`join()` する前に文字列長の降順で並べ替えます
- 辞書エントリに正規表現に用いる文字（`*`, `+` など）が入っている場合に備えて re.escape() でエスケープ (`*` → `\*` など) します

さて例では、
入力文「ピエトロ氏、ドレッシングはピエロ事件。」
に対して辞書エントリ `ピエトロ`, `シング`, `エロ`, `事件` がマッチしました。
しかし、`シング` は「ドレッシング」の一部、`エロ` は「ピエロ」の一部であり、
マッチしてほしくない「誤マッチ」です。
特にアダルトフィルターで `エロ` にマッチしたテキストをアダルト判定する方針の場合、
「ピエロ」で誤マッチしてしまうのはよろしくありません。
「ヒエログリフ」（古代エジプトの象形文字）や「エロル・ガーナー」（ジャズピアニスト）にも誤マッチしてしまいます。

## 形態素境界を用いて誤マッチを減らす

辞書エントリ `エロ` が「ピエロ」にマッチしてしまう問題の原因は、
単語の区切り、つまり形態素境界を無視したマッチだからです。
そこで、「マッチさせる辞書エントリは形態素境界から始まり形態素境界で終わる」
という**形態素境界ルール**を導入し、この問題を解決します。

例文「ピエトロ氏、ドレッシングはピエロ事件。」を形態素に分割すると
`ピエトロ`, `氏`, `、`, `ドレッシング`, `は`, `ピエロ`, `事件`, `。`
となります。
形態素境界ルールを適用すると辞書エントリ `エロ` は「ピエロ」にマッチしなくなります。
辞書エントリ `シング` も「ドレッシング」にマッチしなくなります。
また、もし辞書エントリに `ピエトロ氏` や `ピエロ事件` があったとすればマッチしますが、
`トロ氏` や `ピエ` があったとしてもマッチしません。

以上をふまえた形態素境界ルールによるプログラムです。

```python
### テキスト解析 Web API の日本語形態素解析を用いて、テキストを形態素の表層文字列のリストに変換
def sentence_to_tokens(query):
    import json
    from urllib import request
    APPID = "あなたの Client ID（アプリケーション ID）"
    URL = "https://jlp.yahooapis.jp/MAService/V2/parse"
    params = json.dumps({
        "id": "1234-1",
        "jsonrpc": "2.0",
        "method": "jlp.maservice.parse",
        "params": {"q": query}
    }).encode()
    headers = {
        "Content-Type": "application/json",
        "User-Agent": "Yahoo AppID: {}".format(APPID),
    }
    req = request.Request(URL, params, headers)
    with request.urlopen(req) as res:
        body = res.read()
    obj = json.loads(body.decode())
    return [x[0] for x in obj['result']['tokens']]


### 入力文とマッチさせる辞書
sentence = 'ピエトロ氏、ドレッシングはピエロ事件。'
dic = {
    'エロ': 'ero',
    'シング': 'sing',
    'ピエトロ': 'pietro',
    '良い天気': 'yoitenki',
    '事件': 'jiken',
}
print('入力文:', sentence)

### （M1）文を形態素に分割
tokens = sentence_to_tokens(sentence)
print('形態素:', tokens)

### （M2）形態素区切り位置を保存
kugiri_positions = set(sum(len(token) for token in tokens[:i])
                       for i in range(0, len(tokens) + 1))
print('区切り位置:', kugiri_positions)

### （M3）辞書にマッチさせる
for current_position in kugiri_positions:
    for entry in dic.keys():
        end_position = current_position + len(entry)
        if end_position not in kugiri_positions:
            continue
        if sentence[current_position:].startswith(entry):
            print("MATCH!", (current_position, end_position), entry, dic[entry])
```

実行結果:

```
入力文: ピエトロ氏、ドレッシングはピエロ事件。
形態素: ['ピエトロ', '氏', '、', 'ドレッシング', 'は', 'ピエロ', '事件', '。']
区切り位置: {0, 4, 5, 6, 12, 13, 16, 18, 19} 
MATCH! (0, 4) ピエトロ pietro
MATCH! (16, 18) 事件 jiken
```

（※）Client ID については[こちら](../02_API_Specifications/00_Overview.md#client-id%E3%82%A2%E3%83%97%E3%83%AA%E3%82%B1%E3%83%BC%E3%82%B7%E3%83%A7%E3%83%B3id)をご覧ください。

プログラムの冒頭はテキストを形態素の表層文字列のリストに変換して返す関数
`sentence_to_tokens()`
です。
内部でテキスト解析 Web API の日本語形態素解析を使っています。
この関数を用いて文を形態素に分割し（M1）、
形態素境界の位置を保存します（M2）。
そしてこれをベースに形態素境界ルールで辞書にマッチさせていきます（M3）。
形態素境界の位置から各辞書エントリを前方一致でマッチさせ、
エントリ終了位置も形態素境界であればマッチ成功とします。

## おわりに

この手法で誤マッチをかなり減少できますが、もちろん完全ではありません。

辞書エントリと形態素解析の分割方針の違いでうまくマッチできないこともあります。
例えばテキスト解析 Web API の形態素解析では「エロビデオ」「エロサイト」は1つの形態素となるため辞書エントリ `エロ` にマッチしません。
形態素解析の間違い、未知語が一塊になる、などの要因で失敗することもあります。

とはいえ、単純な文字列マッチと比べると格段に実用性が高いです。
あとは、品詞情報などを追加で使ったり、キャンセルリストで調整したりすることで、
より高性能なツールとなるかと思います。

コードはこちらから入手できます:

- [MAService_Sumapy.ipynb](02_MAService_Sumapy_src/MAService_Sumapy.ipynb)

## 使用しているテキスト解析 Web API

- [日本語形態素解析](../02_API_Specifications/01_MAService.md)

## 著者

LINEヤフー研究所  
山下 達雄（[@yto](https://x.com/yto)）
