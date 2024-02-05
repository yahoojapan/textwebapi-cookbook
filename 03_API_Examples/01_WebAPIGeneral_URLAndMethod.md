# リクエスト URL とリクエストパラメータの "method" の相互変換

リクエストパラメータの "method" とリクエスト URL は、一対一で対応しており、一方がわかればもう一方は自動的に決まります。

テキスト解析 Web API の各機能のリクエスト URL に含まれるサービス名（例: MAService）のプレフィックス（例: MA）は、
イニシャル語の場合は全て大文字（例: NLU）、
単語の場合は先頭だけ大文字（例: Kousei）となっています。
一方、 method ではすべて小文字です（例: nlu, kousei）。

リクエスト URL と method の一覧を表に示します。

|                    | method                       | リクエスト URL（パス名のみ） |
| ------------------ | ---------------------------- | ---------------------------- |
| 日本語形態素解析   | jlp.maservice.parse          | MAService/V2/parse           |
| かな漢字変換       | jlp.jimservice.conversion    | JIMService/V2/conversion     |
| ルビ振り           | jlp.furiganaservice.furigana | FuriganaService/V2/furigana  |
| 校正支援           | jlp.kouseiservice.kousei     | KouseiService/V2/kousei      |
| 日本語係り受け解析 | jlp.daservice.parse          | DAService/V2/parse           |
| キーフレーズ抽出   | jlp.keyphraseservice.extract | KeyphraseService/V2/extract  |
| 自然言語理解       | jlp.nluservice.analyze       | NLUService/V2/analyze        |
| 固有表現抽出       | jlp.nerservice.extract       | NERService/V1/extract        |

以下、正規表現による変換方法を説明します。

## リクエスト URL を method に変換する方法

URL からプロトコル名とドメイン名を除いたパス名を小文字に変換し、区切り文字を置き換えるだけです。

実装例（Perl）

```perl
$url = "https://jlp.yahooapis.jp/JIMService/V2/conversion";
my @cs = split("/", $url);
my $method = "jlp.".lc($cs[3]).".".$cs[5];
print "$method\n";
# 実行結果: jlp.jimservice.conversion
```

実装例（JavaScript）

```javascript
const url = 'https://jlp.yahooapis.jp/FuriganaService/V2/furigana';
const cs = url.split('/');
const method = 'jlp.' + cs[3].toLocaleLowerCase() + '.' + cs[5];
console.log(method);
// 実行結果: jlp.furiganaservice.furigana
```

## method をリクエスト URL に変換する方法

大まかなルールとして、サービス名のプレフィックスが3文字以内の場合は全て大文字、
4文字以上の場合は先頭だけ大文字とします。
また文字列 "service" の先頭も大文字にします。
なお「固有表現抽出」だけ "V1" で他は "V2" になるので注意。

実装例（Perl）

```perl
my $method = "jlp.maservice.parse";
$method =~ s/^jlp.(.{1,3})(service)/\U$1\E\u$2\E/;
$method =~ s/^jlp.(.{4,})(service)/\u$1\u$2\E/;
$method =~ s/(.+)\./"$1\/V".($1 =~ m{^NER} ? 1 : 2)."\/"/e;
print "https://jlp.yahooapis.jp/$method\n";
# 実行結果: https://jlp.yahooapis.jp/MAService/V2/parse
```

実装例（JavaScript）

```javascript
const method = 'jlp.keyphraseservice.extract';
let cs = method.split('.');
const m = cs[1].match(/^((.)(.+))service$/);
if (m[1].length <= 3) cs[1] = m[1].toUpperCase();
else cs[1] = m[2].toUpperCase() + m[3];
const version = cs[1].startsWith("NER") ? 1 :2;
const url = `https://jlp.yahooapis.jp/${cs[1]}Service/V${version}/${cs[2]}`;
console.log(url);
// 実行結果: https://jlp.yahooapis.jp/KeyphraseService/V2/extract
```

## 著者

LINEヤフー研究所  
山下 達雄（[@yto](https://x.com/yto)）
