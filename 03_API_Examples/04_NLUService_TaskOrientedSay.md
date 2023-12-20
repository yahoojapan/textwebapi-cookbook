# 自然言語理解を用いたタスク指向型システムの実装（雑談系の意図への対応）

本記事のコードは[こちら](./04_NLUService_TaskOrientedSay_src/nlu_task_oriented_system.ts)にあります。コードを参照しながら進めてください。

## 0. 準備

### プログラム実行方法

詳細な動作環境については[04_NLUService_TaskOrientedBase.md#動作環境](./04_NLUService_TaskOrientedBase.md#動作環境)をご覧ください。

ソースコードを実行するための手順は以下の通りです:

1. `my-nlu-project` ディレクトリのトップレベルに `src` ディレクトリを作成します
2. [nlu_task_oriented_system.ts](./04_NLUService_TaskOrientedSay_src/nlu_task_oriented_system.ts) を作成した `src` ディレクトリにコピーします
3. ソースコードにある `APPID='あなたの Client ID（アプリケーション ID）'`を設定します  
   （※）Client ID については[こちら](../02_API_Specifications/00_Overview.md#client-id%E3%82%A2%E3%83%97%E3%83%AA%E3%82%B1%E3%83%BC%E3%82%B7%E3%83%A7%E3%83%B3id)をご覧ください。
4. `my-nlu-project` ディレクトリのトップレベルから次のコマンドを実行します

```bash
npx ts-node src/nlu_task_oriented_system.ts
```

プログラムを実行すると、以下のプロンプトが表示されます。このプロンプトに続けてテキスト入力が可能です。

```bash
発話を入力:
```

### デモンストレーション

雑談系の意図の質問に対するシステムの応答について紹介します。

プロンプトに続けて「**富士山の高さは**」と入力すると、次の行にシステムからの応答が表示されます。

```bash
発話を入力: 富士山の高さは
3776mです。
発話を入力:
```

このように、「富士山の高さは」の質問に対する回答が返されました。

システムの応答の後に再び「発話を入力:」というプロンプトが表示され、同様の手順で入力を続けることができます。
プログラムを終了する際には、Ctrl-D（Unix/Linux）または Ctrl-Z（Windows）を入力します。

また、各ターン（ユーザ発話とシステム応答の組）ごとに、自然言語理解（NLU）と対話管理（DM）のログがそれぞれ nlu.log と dm.log に保存されます。
nlu.log には NLU クラスの analyze 関数（テキスト解析 Web API の自然言語理解で自然言語のテキストを解析する役割）の結果がログとして記録され、
dm.log には DM クラスの recognizeDA 関数（ユーザの発話に含まれる意図やパラメータを抽出し、適切な対話行為を決定する役割）の結果がログとして記録されます。

以上が、デモンストレーションの説明です。  
次の節では、対話処理を構成する自然言語理解（NLU）、対話管理（DM）、自然言語生成（NLG）について解説します。

## 1. 自然言語理解（NLU）

NLU クラスの analyze 関数の結果が記録された nlu.log を参照してください。

「富士山の高さは」と入力した場合の結果を見てみましょう。
以下のテーブルでは `METHOD` と `PARAM_TEXT` を nlu.log から抜き出して表示しています。

| パラメータ名 | 値           |
| ------------ | ------------ |
| METHOD       | SAY          |
| PARAM_TEXT   | 3776m です。 |

テキスト解析 Web API の自然言語理解から、ユーザの意図（雑談系の SAY 意図）とテキスト情報（"3776m です。"）が得られていることがわかります。

## 2. 対話管理（DM）

次に、システムがどのように行動すべきかを決めるための「対話行為タイプ（DialogueAct）」を定義します。
対話行為タイプを「雑談応答の要求（AskSay）」と定義し、その回答（response）をパラメータとして含めます。
今回は、テキスト情報の `PARAM_TEXT` を response パラメータとしています。

```ts
// 該当箇所: 04_NLUService_TaskOrientedSay_src/nlu_task_oriented_system.tsのl6-l26
/** 対話行為（DialogueAct）*/
type DAType = 'AskSay' | 'AskNotFound';
// 省略

// 雑談応答の要求
class AskSay implements DialogueAct {
  public type: DAType = 'AskSay';

  /**
   * @param response - 雑談応答
   */
  constructor(public response: string) {}
}

// 未対応のIntentに対する要求
class AskNotFound implements DialogueAct {
  public type: DAType = 'AskNotFound';
  constructor() {}
}

// 該当箇所: 04_NLUService_TaskOrientedSay_src/nlu_task_oriented_system.tsのl112-l135
/**
 * Dialogue Management（対話管理）
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
      case 'SAY': {
        const paramText = nluData?.result['PARAM_TEXT'];
        if (paramText) {
          return new AskSay(paramText);
        }
      }
      default: {
        return new AskNotFound();
      }
    }
  }
}
```

NLU の結果に基づいて、DM では適切な対話行為を決定します。
意図 `intent` が雑談系の `SAY` の場合は `AskSay` を返し、システムで未対応の意図の場合は `AskNotFound` を返します。

DM クラスの recognizeDA 関数の結果が記録された dm.log を参照してください。

```json
"富士山の高さは": {
  "response": "3776mです。",
  "type": "AskSay"
}
```

雑談応答の要求（AskSay）を対話行為とし、その回答（response）が「3776m です。」となることを示しています。

## 3. 自然言語生成（NLG）

DM の結果に基づいて、自然言語のテキストを生成します。
ここでは `AskSay` の `response` の情報をそのままユーザに応答として返すことを想定しています。

```ts
// 該当箇所: 04_NLUService_TaskOrientedSay_src/nlu_task_oriented_system.tsのl137-l153
/**
 * Natural Language Generation（自然言語生成）
 */
class NLG {
  /**
   * DialogueActに基づいて適切な自然文を生成する関数
   * @param da - DialogueAct
   * @returns 自然文
   */
  async generateResponse(da: DialogueAct): Promise<string> {
    if (isType<AskSay>(da, 'AskSay')) {
      return da.response;
    }

    return '応答文生成に失敗しました。';
  }
}
```

システム応答はコンソールを確認してください。

```bash
3776mです。
```

雑談系の意図への対応は以上です。  
次は、 [地図系の意図への対応](./04_NLUService_TaskOrientedMap.md)へ進んでください。

## 著者

LINEヤフー株式会社 言語処理エンジニア  
西山 育宏
