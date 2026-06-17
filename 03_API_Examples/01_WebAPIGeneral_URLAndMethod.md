# 共通リクエスト URL と旧リクエスト URL、"method" の関係

テキスト解析 Web API では、2026年6月16日にリクエスト URL の統合が案内されました
（[テキスト解析 Web API リクエストURL統合（新共通URL提供）のお知らせ](https://developer.yahoo.co.jp/changelog/2026-06-16-jlp.html)）。
現在は、各機能を共通のリクエスト URL から呼び出せます。

- 新共通リクエスト URL: `https://jlp.yahooapis.jp/jsonrpc`

今後はこの新共通リクエスト URL を使い、呼び出す API の切り替えはリクエスト JSON 内の `method` で指定する方式が基本になります。
新しい実装では、共通リクエスト URL を前提にするのがよいでしょう。

## 旧リクエスト URL を使っている既存コードについて

今回の対象 API では、旧リクエスト URL も引き続き受け付けられます。
ただし、本クックブックでは新共通リクエスト URL を基本形として扱います。

また、今後新しく追加・公開される API は、新共通リクエスト URL のみで提供されます。
そのため、旧リクエスト URLを使い続ける場合はご注意ください。

## 旧リクエスト URL と method の相互変換

旧リクエスト URL を使う既存コードや、過去の資料を読むときの参考として、旧リクエスト URL と `method` の対応も載せておきます。

|                    | method                       | 旧リクエスト URL（パス名のみ） |
| ------------------ | ---------------------------- | ------------------------------ |
| 日本語形態素解析   | jlp.maservice.parse          | MAService/V2/parse             |
| かな漢字変換       | jlp.jimservice.conversion    | JIMService/V2/conversion       |
| ルビ振り           | jlp.furiganaservice.furigana | FuriganaService/V2/furigana    |
| 校正支援           | jlp.kouseiservice.kousei     | KouseiService/V2/kousei        |
| 日本語係り受け解析 | jlp.daservice.parse          | DAService/V2/parse             |
| キーフレーズ抽出   | jlp.keyphraseservice.extract | KeyphraseService/V2/extract    |
| 自然言語理解       | jlp.nluservice.analyze       | NLUService/V2/analyze          |
| 固有表現抽出       | jlp.nerservice.extract       | NERService/V1/extract          |

### 旧リクエスト URL を method に変換する方法

旧リクエスト URL では、URL からプロトコル名とドメイン名を除いたパス名を小文字に変換し、区切り文字を置き換えるだけです。

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

### method を旧リクエスト URL に変換する方法

旧リクエスト URL では、サービス名のプレフィックスが3文字以内の場合は全て大文字、
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
(初版)  
LINEヤフー研究所  
山下 達雄（[@yto](https://x.com/yto)）

(2026/06/16 更新)  
LINEヤフー株式会社 言語処理エンジニア  
牧野 恵
