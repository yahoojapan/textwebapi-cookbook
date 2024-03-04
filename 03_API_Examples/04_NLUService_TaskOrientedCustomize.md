# 自然言語理解を用いたタスク指向型システムの実装（レスポンスのカスタマイズ機能の追加）

本記事のコードは[こちら](./04_NLUService_TaskOrientedCustomize_src/nlu_task_oriented_system.ts)にあります。コードを参照しながら進めてください。

## 0. 準備

### プログラム実行方法

詳細な動作環境については[04_NLUService_TaskOrientedBase.md#動作環境](./04_NLUService_TaskOrientedBase.md#動作環境)をご覧ください。

ソースコードを実行するための手順は以下の通りです:

1. `my-nlu-project` ディレクトリのトップレベルに `src` ディレクトリを作成します
2. [nlu_task_oriented_system.ts](./04_NLUService_TaskOrientedCustomize_src/nlu_task_oriented_system.ts) を作成した `src` ディレクトリにコピーします
3. ソースコードにある `APPID='あなたの Client ID（アプリケーション ID）'`を設定します  
   （※）Client ID については[こちら](../02_API_Specifications/00_Overview.md#client-idアプリケーション-id)をご覧ください。
4. `my-nlu-project` ディレクトリのトップレベルから次のコマンドを実行します

```bash
npx ts-node src/nlu_task_oriented_system.ts
```

プログラムを実行すると、以下のプロンプトが表示されます。このプロンプトに続けてテキスト入力が可能です。

```bash
発話を入力:
```

### デモンストレーション

### 旧暦から新暦への変換

ここでは、「睦月は何月」という質問に対するシステムの応答について紹介します。  
プロンプトに続けて「**睦月は何月**」と入力してみましょう。

```bash
発話を入力: 睦月は何月
1月です。
発話を入力:
```

「睦月は何月」と質問すると、新暦に変換された結果が返されました。

### 新暦から旧暦への変換

次に、「1月の旧暦は」という質問に対するシステムの応答について紹介します。  
プロンプトに続けて「**1月の旧暦は**」と入力してみましょう。

```bash
発話を入力: 1月の旧暦は
睦月です。
発話を入力:
```

「1月の旧暦は」と質問すると、旧暦に変換された結果が返されました。

以上が、デモンストレーションの説明です。  
次の節では、対話処理を構成する自然言語理解（NLU）、対話管理（DM）、自然言語生成（NLG）について解説します。

## 1. 自然言語理解（NLU）

### テキスト解析 Web API の自然言語理解のレスポンスをカスタマイズ方法

テキスト解析 Web API の自然言語理解のレスポンスをカスタマイズするために、カスタムルール（[公式ドキュメント](https://developer.yahoo.co.jp/webapi/jlp/nlu/v2/custom-rule.html)）とカスタム辞書（[公式ドキュメント](https://developer.yahoo.co.jp/webapi/jlp/nlu/v2/custom-dictionary.html)）を作成します。また、[カスタムルールを追加して API のレスポンスを変える](https://developer.yahoo.co.jp/webapi/jlp/nlu/v2/api.html)についての公式ドキュメントも参考にしてください。

具体的には、「1月の旧暦は」や「睦月は何月」といった質問に対してテキスト解析 Web API の自然言語理解のデフォルトの応答を変更します。デフォルトの応答では、どちらの質問も "METHOD": "SEARCH" を返すため、ユーザの意図（SEARCH 意図）とクエリ情報（"1月の旧暦は"もしくは"睦月は何月"）が得られます。これをカスタマイズして、「1月」を旧暦の形式に、「睦月」を新暦の形式に変換する情報を取得できるようにします。

カスタマイズは、「sample\<n>=<応答ドメイン>,<発話パターン>」という形式のリクエストパラメータを params/context に追加することで行います（\<n>は 0 から 999）。これにより、指定した<発話パターン>に対して<応答ドメイン>をレスポンスとして返すことができます。さらに、「dict\<m>=<辞書名>,<単語リスト>」というリクエストパラメータを使用すると、<発話パターン>で独自の辞書を参照できます（\<m>は 0 から 99）。

```ts
// 該当箇所: 04_NLUService_TaskOrientedCustomize_src/nlu_task_oriented_system.tsのl111-l225
/**
 * テキスト解析 Web API の自然言語理解のRequestEntity
 */
class NLURequestEntity {
  // 省略

  // カスタム辞書とカスタムルールの定義
  private static USER_DICT = {
    dict0: '$OLD_MONTH,睦月,如月,弥生,卯月,皐月,水無月,文月,葉月,長月,神無月,霜月,師走',
    sample0: 'ASK_CALENDAR,(?<MONTH>{$OLD_MONTH})は何月',
    sample1: 'ASK_OLD_CALENDAR,(?<MONTH>{$SYS.MONTH})の旧暦は?',
    sample2: 'ASK_OLD_CALENDAR,(?<MONTH>{$SYS.MONTH})の旧暦を{知りたい|教えて}',
  };

  // 省略

  /**
   * テキスト解析 Web API の自然言語理解のリクエストボディーを生成する関数
   * @returns リクエストボディーの文字列
   */
  private generateRequestBody(): string {
    return JSON.stringify({
      id: '1234-1',
      jsonrpc: '2.0',
      method: 'jlp.nluservice.analyze',
      params: {
        q: this.query,
        context: { ...NLURequestEntity.USER_DICT, ...this.formatContext(prevContexts) },
      },
    });
  }

  // 省略
}
```

以上のカスタマイズにより、テキスト解析 Web API の自然言語理解のレスポンスをより具体的で使いやすい形に変更できます。

### NLU の結果確認

NLU クラスの analyze 関数の結果が記録された nlu.log を参照してください。

まず、「睦月は何月」と入力した場合の結果を見てみましょう。
以下のテーブルでは `METHOD` と `PARAM_MONTH` を nlu.log から抜き出して表示しています。

| パラメータ名 | 値           |
| ------------ | ------------ |
| METHOD       | ASK_CALENDAR |
| PARAM_MONTH  | 睦月         |

テキスト解析 Web API の自然言語理解から、ユーザの意図（ASK_CALENDAR）と月情報（"睦月"）が取得できます。

次に、「睦月は何月」と入力した場合の結果を見てみましょう。
以下のテーブルでは `METHOD` と `PARAM_MONTH` を nlu.log から抜き出して表示しています。

| パラメータ名 | 値               |
| ------------ | ---------------- |
| METHOD       | ASK_OLD_CALENDAR |
| PARAM_MONTH  | 1月             |

テキスト解析 Web API の自然言語理解から、ユーザの意図（ASK_OLD_CALENDAR）と月情報（"1月"）が取得できます。

## 2. 対話管理（DM）

次に、システムがどのように行動すべきかを決めるための「対話行為タイプ（DialogueAct）」を定義します。
今回は、旧暦あるいは新暦への変換結果をテキスト形式で返すことを想定しており、その変換のためには旧暦変換辞書と新暦変換辞書のどちらを使用するかの確認が必要です。
以上を踏まえ、対話行為タイプは旧暦への変換要求（AskOldCalendar）と新暦への変換要求（AskNewCalendar）として定義し、それぞれに対象月（month）をパラメータとして含めます。

```ts
// 該当箇所: 04_NLUService_TaskOrientedCustomize_src/nlu_task_oriented_system.tsのl40-l99
/** 対話行為（DialogueAct）*/
type DAType = 'AskSay' | 'AskMap' | 'AskWeatherRain' | 'AskOldCalendar' | 'AskNewCalendar' | 'AskNotFound';

// 省略

// 旧暦への変換要求
class AskOldCalendar implements DialogueAct {
  public type: DAType = 'AskOldCalendar';

  /**
   * @param month - 月情報
   */
  constructor(public month: string) {}
}

// 新暦への変換要求
class AskNewCalendar implements DialogueAct {
  public type: DAType = 'AskNewCalendar';

  /**
   * @param month - 月情報
   */
  constructor(public month: string) {}
}

// 省略

// 該当箇所: 04_NLUService_TaskOrientedCustomize_src/nlu_task_oriented_system.tsのl227-l274
/**
 * Dialogue Management (対話管理)
 */
class DM {
  /**
   * NLUの結果に基づいて適切な対話行為（DialogueAct）を決定する関数
   * @param intent - 意図
   * @param nluData - NLUからのレスポンスデータ
   * @returns 対応するDialogueAct
   */
  async recognizeDA(intent: string, nluData: any): Promise<DialogueAct> {
    switch (intent) {
      // 省略
      case 'ASK_CALENDAR': {
        const month = nluData?.result['PARAM_MONTH'];
        if (month) {
          return new AskNewCalendar(month);
        }
      }
      case 'ASK_OLD_CALENDAR': {
        const month = nluData?.result['PARAM_MONTH'];
        if (month) {
          return new AskOldCalendar(month);
        }
      }
    }
    return new AskNotFound();
  }
}
```

NLU の結果から適切な対話行為を決定します。意図が `ASK_CALENDAR` の場合は `AskNewCalendar`を返し、`ASK_OLD_CALENDAR` の場合は `AskOldCalendar`を返し、対象月が存在しない場合や対応していない意図がある場合は `AskNotFound` を返します。

DM クラスの recognizeDA 関数の結果が記録された dm.log を参照してください。
「睦月は何月」という質問に対する対話行為は次の通りです。

```json
"睦月は何月": {
  "month": "睦月",
  "type": "AskNewCalendar"
}
```

これは新暦への変換要求（AskNewCalendar）を対話行為とし、その対象月（month）が「睦月」となることを示しています。

「1月の旧暦は」という質問に対する対話行為は次の通りです。

```json
"1月の旧暦は": {
  "month": "1月",
  "type": "AskOldCalendar"
}
```

これは旧暦への変換要求（AskOldCalendar）を対話行為とし、その対象月（month）が「1月」となることを示しています。

## 3. 自然言語生成（NLG）

DM の結果に基づいて、自然言語のテキストを生成します。  
この例では `AskOldCalendar` の場合は `NEW_TO_OLD_MONTH` の旧暦変換辞書を利用し、`AskNewCalendar` の場合は `OLD_TO_NEW_MONTH` の新暦変換辞書を利用し、レスポンスを生成します。

```ts
// 該当箇所: 04_NLUService_TaskOrientedCustomize_src/nlu_task_oriented_system.tsのl9-l38
/** 旧暦と新暦の変換辞書の定義 */
const OLD_TO_NEW_MONTH: Record<string, string> = {
  睦月: '1月',
  如月: '2月',
  弥生: '3月',
  卯月: '4月',
  皐月: '5月',
  水無月: '6月',
  文月: '7月',
  葉月: '8月',
  長月: '9月',
  神無月: '10月',
  霜月: '11月',
  師走: '12月',
};

const NEW_TO_OLD_MONTH: Record<string, string> = {
  '1月': '睦月',
  '2月': '如月',
  '3月': '弥生',
  '4月': '卯月',
  '5月': '皐月',
  '6月': '水無月',
  '7月': '文月',
  '8月': '葉月',
  '9月': '長月',
  '10月': '神無月',
  '11月': '霜月',
  '12月': '師走',
};

// 該当箇所: 04_NLUService_TaskOrientedCustomize_src/nlu_task_oriented_system.tsのl274-l374
/**
 * Natural Language Generation (自然言語生成)
 */
class NLG {
  /**
   * DialogueActに基づいて適切な自然文を生成する関数
   * @param da - DialogueAct
   * @returns 自然文
   */
  async generateResponse(da: DialogueAct): Promise<string> {
    // 省略

    if (isType<AskOldCalendar>(da, 'AskOldCalendar')) {
      return `${NEW_TO_OLD_MONTH[da.month]}です。`;
    }

    if (isType<AskNewCalendar>(da, 'AskNewCalendar')) {
      return `${OLD_TO_NEW_MONTH[da.month]}です。`;
    }

    return '応答文生成に失敗しました。';
  }
  // 省略
}
```

システム応答はコンソールを確認してください。

```bash
発話を入力: 睦月は何月
1月です。
発話を入力: 1月の旧暦は
睦月です。
```

レスポンスのカスタマイズ機能の追加は以上です。

## 著者

LINEヤフー株式会社 言語処理エンジニア  
西山 育宏
