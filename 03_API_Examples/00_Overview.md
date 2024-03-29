# 概要

第3章では、テキスト解析 Web API 全般で使えるテクニックや、第2章で紹介した各機能の活用事例を紹介します。  


テキスト解析 Web API は、工夫次第で、身近なビジネス課題だけでなく、学術研究、個人のプロジェクト、教育用途など、幅広い領域での活用が可能です。第3章で紹介する具体的な事例を通じて、テキスト解析 Web API の活用イメージが広がり、新たな視点を得ることができるでしょう。本クックブックを参考に、ぜひテキスト解析 Web API の活用をご検討ください。

## 利用にあたっての留意点

本クックブックで紹介するサンプルコードは、初めて Web API を使用する方でも簡単に試せるように配慮しています。ただし、一部の事例では Python や Node.js などの環境構築が必要なものもありますので、ご自身の環境にあわせて環境設定をお願いします。

また、サンプルコード内で、各自の Client ID が必要となる部分には`'あなたの Client ID（アプリケーション ID）'`と記載しています。各自で Client ID を取得して、ご自身のものに置き換えてお使いください。Client ID の取得方法については[こちら](../02_API_Specifications/00_Overview.md#client-idアプリケーション-id)をご覧ください。

## テキスト解析 Web API の各機能の呼称について

テキスト解析 Web API では、日本語形態素解析、校正支援、キーフレーズ抽出など、様々な機能を提供しています。
本クックブックでは、これらの機能をテキスト中で表現する際に簡易的な表記を用いることがあります。

例えば『テキスト解析 Web API の「日本語形態素解析」』を、「日本語形態素解析 Web API」や「日本語形態素解析 API」や「形態素解析 API」、または単に「日本語形態素解析」と呼ぶことがあります。

他の機能についても同様です。これらの呼称はすべて、テキスト解析 Web API の一部の機能を指すものです。

