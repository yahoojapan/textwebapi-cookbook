# 自然言語理解を用いたタスク指向型システムの実装（地図系の意図への対応）

本記事のコードは[こちら](./04_NLUService_TaskOrientedMap_src/nlu_task_oriented_system.ts)にあります。コードを参照しながら進めてください。

## 0. 準備

### プログラム実行方法

詳細な動作環境については[04_NLUService_TaskOrientedBase.md#動作環境](./04_NLUService_TaskOrientedBase.md#動作環境)をご覧ください。
また、本記事では[コンテンツジオコーダ API](https://developer.yahoo.co.jp/webapi/map/openlocalplatform/v1/contentsgeocoder.html)を使用します。

ソースコードを実行するための手順は以下の通りです:

1. `my-nlu-project` ディレクトリのトップレベルに `src` ディレクトリを作成します
2. [nlu_task_oriented_system.ts](./04_NLUService_TaskOrientedMap_src/nlu_task_oriented_system.ts) を作成した `src` ディレクトリにコピーします
3. ソースコードにある `APPID='あなたの Client ID（アプリケーション ID）'`を設定します （※）Client ID については[こちら](../02_API_Specifications/00_Overview.md#client-id%E3%82%A2%E3%83%97%E3%83%AA%E3%82%B1%E3%83%BC%E3%82%B7%E3%83%A7%E3%83%B3id)をご覧ください。
4. `my-nlu-project` ディレクトリのトップレベルから次のコマンドを実行します

```bash
npx ts-node src/nlu_task_oriented_system.ts
```

プログラムを実行すると、「発話を入力:」というプロンプトが表示されるので、このプロンプトに続けて入力してください。

```bash
発話を入力:
```

### デモンストレーション

地図系の意図の質問に対するシステムの応答について紹介します。

プロンプトに続けて「**東京ディズニーランドの地図**」と入力すると、次の行にシステムからの応答が表示されます。

```bash
発話を入力: 東京ディズニーランドの地図
東京ディズニーランド(lon=139.8813280,lat=35.6325460)の地図を表示します。
発話を入力:
```

このように、東京ディズニーランドの緯度経度情報を含めた応答が返されました。

システムの応答の後に再び「発話を入力:」というプロンプトが表示され、同様の手順で入力を続けることができます。
プログラムを終了する際には、Ctrl-D（Unix/Linux）または Ctrl-Z（Windows）を入力します。

また、各ターン（ユーザ発話とシステム応答の組）ごとに、自然言語理解（NLU）と対話管理（DM）のログがそれぞれ nlu.log と dm.log に保存されます。
nlu.log には NLU クラスの analyze 関数（テキスト解析 Web API の自然言語理解で自然言語のテキストを解析する役割）の結果がログとして記録され、
dm.log には DM クラスの recognizeDA 関数（ユーザの発話に含まれる意図やパラメータを抽出し、適切な対話行為を決定する役割）の結果がログとして記録されます。

以上が、デモンストレーションの説明です。  
次の節では、対話処理を構成する自然言語理解（NLU）、対話管理（DM）、自然言語生成（NLG）についてそれぞれ詳細に解説します。

## 1. 自然言語理解（NLU）

NLU クラスの analyze 関数の結果が記録された nlu.log を参照してください。

「東京ディズニーランドの地図」と入力した場合の結果を見てみましょう。
以下のテーブルでは `METHOD` と `PARAM_PLACE` を nlu.log から抜き出して表示しています。

| パラメータ名 | 値                   |
| ------------ | -------------------- |
| METHOD       | MAP                  |
| PARAM_PLACE  | 東京ディズニーランド |

テキスト解析 Web API の自然言語理解から、ユーザの意図（MAP 意図）と場所情報（"東京ディズニーランド"）が得られていることがわかります。

## 2. 対話管理（DM）

次に、システムがどのように行動すべきかを決めるための「対話行為タイプ（DialogueAct）」を定義します。
今回は対象の場所名の緯度経度情報を含めたテキスト形式の応答を返すことを想定しています。
場所名から緯度経度情報を取得するために[コンテンツジオコーダ API](https://developer.yahoo.co.jp/webapi/map/openlocalplatform/v1/contentsgeocoder.html)を使用します。
以上を踏まえて、対話行為タイプを場所情報の要求（AskMap）と定義し、その場所情報（place）をパラメータとして含めます。

```ts
// 該当箇所: 04_NLUService_TaskOrientedMap_src/nlu_task_oriented_system.tsのl6-l36
/** 対話行為（DialogueAct）*/
type DAType = 'AskSay' | 'AskMap' | 'AskNotFound';
interface DialogueAct {
  type: DAType;
}

// 省略

// 地図情報の要求
class AskMap implements DialogueAct {
  public type: DAType = 'AskMap';

  /**
   * @param place - 場所名
   */
  constructor(public place: string) {}
}

// 未対応のIntentに対する要求
class AskNotFound implements DialogueAct {
  public type: DAType = 'AskNotFound';
  constructor() {}
}

// 該当箇所: 04_NLUService_TaskOrientedMap_src/nlu_task_oriented_system.tsのl122-l151
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
      case 'MAP': {
        const place = nluData?.result['PARAM_PLACE'];
        if (place) {
          return new AskMap(place);
        }
      }
      default: {
        return new AskNotFound();
      }
    }
  }
}
```

NLU の結果から適切な対話行為を決定します。
意図が`MAP`の場合は `AskMap` を返し、対応していない意図がある場合は `AskNotFound` を返します。

DM クラスの recognizeDA 関数の結果が記録された dm.log を参照してください。
「東京ディズニーランドの地図」という質問に対する対話行為は次の通りです。

```json
"東京ディズニーランドの地図": {
  "place": "東京ディズニーランド",
  "type": "AskMap"
}
```

これは地図情報の要求（AskMap）を対話行為とし、その対象地点（place）が「東京ディズニーランド」となることを示しています。

## 3. 自然言語生成（NLG）

DM の結果に基づいて、自然言語のテキストを生成します。  
ここでは、「<場所名>(lon=<経度情報>,lat=<緯度情報>)の地図を表示します。」という形式でユーザに応答を返すことを想定しています。

```ts
// 該当箇所: 04_NLUService_TaskOrientedMap_src/nlu_task_oriented_system.tsのl153-l188
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
    if (isType<AskMap>(da, 'AskMap')) {
      const coordinates = await this.fetchCoordinatesForPlace(da.place);
      return coordinates
        ? `${da.place}(lon=${coordinates.lon},lat=${coordinates.lat})の地図を表示します。`
        : `「${da.place}」の情報が見つかりませんでした。`;
    }

    return '応答文生成に失敗しました。';
  }
  // 省略
}
```

システム応答はコンソールを確認してください。

```bash
東京ディズニーランド(lon=139.69181967,lat=35.68955124)の地図を表示します。
```

地図系の意図への対応は以上です。  
次は、 [天気系の意図への対応](./04_NLUService_TaskOrientedWeather.md)へ進んでください。

## 著者

LINEヤフー株式会社 言語処理エンジニア  
西山 育宏
