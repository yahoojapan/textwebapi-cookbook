# 自然言語理解を用いたタスク指向型システムの実装（天気系の意図への対応）

本記事のコードは[こちら](./04_NLUService_TaskOrientedWeather_src/nlu_task_oriented_system.ts)にあります。コードを参照しながら進めてください。

## 0. 準備

### プログラム実行方法

詳細な動作環境については[04_NLUService_TaskOrientedBase.md#動作環境](./04_NLUService_TaskOrientedBase.md#動作環境)をご覧ください。
また、本記事では[コンテンツジオコーダ API](https://developer.yahoo.co.jp/webapi/map/openlocalplatform/v1/contentsgeocoder.html) と[気象情報 API](https://developer.yahoo.co.jp/webapi/map/openlocalplatform/v1/weather.html) を使用します。

ソースコードを実行するための手順は以下の通りです:

1. `my-nlu-project` ディレクトリのトップレベルに `src` ディレクトリを作成します
2. [nlu_task_oriented_system.ts](./04_NLUService_TaskOrientedWeather_src/nlu_task_oriented_system.ts) を作成した `src` ディレクトリにコピーします
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

天気系の意図の質問に対するシステムの応答について紹介します。

プロンプトに続けて「**東京ディズニーランドの天気**」と入力すると、次の行にシステムからの応答が表示されます。

```bash
発話を入力: 東京ディズニーランドの天気
東京ディズニーランドは1時間は雨が降らなさそうです。
発話を入力:
```

このように、東京ディズニーランド付近の雨予報の応答が返されました。

システムの応答の後に再び「発話を入力:」というプロンプトが表示され、同様の手順で入力を続けることができます。
以下に示すように、異なる地点の雨予報についても質問してみましょう。
ただし、応答は入力した時間帯によって変わることもあるため、必ずしも一致しないことはご理解ください。

```bash
発話を入力: 東京ディズニーランドの天気
東京ディズニーランドは1時間は雨が降らなさそうです。
発話を入力: 大分は雨降ってる？
大分は10分後から雨が降ります。
発話を入力: 宮島の天気はどう？
宮島は50分後から雨が強くなります。
発話を入力: 札幌は傘必要？
東京ディズニーランドは今雨が降ってますが、10分後に晴れそうです。
発話を入力:
```

プログラムを終了する際には、Ctrl-D（Unix/Linux）または Ctrl-Z（Windows）を入力します。

また、各ターン（ユーザ発話とシステム応答の組）ごとに、自然言語理解（NLU）と対話管理（DM）のログがそれぞれ nlu.log と dm.log に保存されます。
nlu.log には NLU クラスの analyze 関数（テキスト解析 Web API の自然言語理解で自然言語のテキストを解析する役割）の結果がログとして記録され、
dm.log には DM クラスの recognizeDA 関数（ユーザの発話に含まれる意図やパラメータを抽出し、適切な対話行為を決定する役割）の結果がログとして記録されます。

以上が、デモンストレーションの説明です。  
次の節では、対話処理を構成する自然言語理解（NLU）、対話管理（DM）、自然言語生成（NLG）について解説します。

## 1. 自然言語理解（NLU）

NLU クラスの analyze 関数の結果が記録された nlu.log を参照してください。

「東京ディズニーランドの天気」と入力した場合の結果を見てみましょう。
以下のテーブルでは `METHOD` と `PARAM_PLACE` を nlu.log から抜き出して表示しています。

| パラメータ名 | 値                   |
| ------------ | -------------------- |
| METHOD       | WEATHER              |
| PARAM_PLACE  | 東京ディズニーランド |

テキスト解析 Web API の自然言語理解から、ユーザの意図（天気系の WEATHER 意図）と場所情報（"東京ディズニーランド"）が得られていることがわかります。

## 2. 対話管理（DM）

次に、システムがどのように行動すべきかを決めるための「対話行為タイプ（DialogueAct）」を定義します。
「東京ディズニーランドの天気」に対する適切な応答として、東京ディズニーランドの気温や降水確率などの天気情報を返すことが考えられます。ここでは、指定した緯度経度の雨の強さを返す[気象情報 API](https://developer.yahoo.co.jp/webapi/map/openlocalplatform/v1/weather.html) を使用し、1 時間以内の雨予報をテキスト形式で返すことを想定しています。

気象情報 API には緯度経度情報が必要なため、場所名から緯度経度情報を取得する[コンテンツジオコーダ API](https://developer.yahoo.co.jp/webapi/map/openlocalplatform/v1/contentsgeocoder.html)も使用します。

以上を踏まえて、対話行為タイプを天気情報の要求（AskWeatherRain）と定義し、場所情報（place）をパラメータとして含めます。

```ts
// 該当箇所: 04_NLUService_TaskOrientedWeather_src/nlu_task_oriented_system.tsのl6-l45
/** 対話行為（DialogueAct）*/
type DAType = 'AskSay' | 'AskMap' | 'AskWeatherRain' | 'AskNotFound';

// 省略

// 天気情報の要求
class AskWeatherRain implements DialogueAct {
  public type: DAType = 'AskWeatherRain';
  /**
   * @param place - 天気情報を要求する場所の名前
   */
  constructor(public place: string) {}
}

// 未対応のIntentに対する要求
class AskNotFound implements DialogueAct {
  public type: DAType = 'AskNotFound';
  constructor() {}
}

// 該当箇所: 04_NLUService_TaskOrientedWeather_src/nlu_task_oriented_system.tsのl132-l166
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
      case 'WEATHER': {
        const place = nluData?.result['PARAM_PLACE'];
        if (place) {
          return new AskWeatherRain(place);
        }
      }
      default: {
        return new AskNotFound();
      }
    }
  }
}
```

NLU の結果から適切な対話行為を決定します。意図が `WEATHER` の場合は `AskWeatherRain` を返し、対応していない意図がある場合は `AskNotFound` を返します。

DM クラスの recognizeDA 関数の結果が記録された dm.log を参照してください。
「東京ディズニーランドの天気」という質問に対する対話行為は次の通りです。

```json
"東京ディズニーランドの天気": {
  "place": "東京ディズニーランド",
  "type": "AskWeatherRain"
}
```

これは天気情報の要求（AskWeatherRain）を対話行為とし、その対象地点（place）が「東京ディズニーランド」となることを示しています。

## 3. 自然言語生成（NLG）

DM の結果に基づいて、自然言語のテキストを生成します。  
現在の雨状態と気象情報 API の結果に応じて応答を柔軟に変更することが可能です。
応答文生成の詳細については、buildRainForecastResponse 関数を参照してください。

```ts
// 該当箇所: 04_NLUService_TaskOrientedWeather_src/nlu_task_oriented_system.tsのl168-l260
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
    if (isType<AskWeatherRain>(da, 'AskWeatherRain')) {
      const coordinates = await this.fetchCoordinatesForPlace(da.place);
      if (!coordinates) {
        return `「${da.place}」の天気情報が見つかりませんでした。`;
      }

      const rainList = await this.fetchWeatherRainList(coordinates.lon, coordinates.lat);
      return rainList
        ? `${da.place}は${this.buildRainForecastResponse(rainList)}`
        : `「${da.place}」の天気情報が見つかりませんでした。`;
    }

    return '応答文生成に失敗しました。';
  }

  // 省略

  /**
   * 応答文生成
   * @param data - 降水強度データ
   * @returns 60分間の雨予報のテキスト
   */
  private buildRainForecastResponse(data: any): string {
    const NO_RAINFALL = 0;
    const INTERVAL_MINUTES = 10;
    const FORECAST_RANGE = 6;

    const currentRainfall = data[0].Rainfall;

    for (let index = 1; index <= FORECAST_RANGE; index++) {
      const forecastRainfall = data[index].Rainfall;

      if (forecastRainfall === currentRainfall) {
        continue;
      }

      const forecastMinutes = index * INTERVAL_MINUTES;
      if (forecastRainfall === NO_RAINFALL) {
        return `今雨が降ってますが、${forecastMinutes}分後に晴れそうです。`;
      } else if (forecastRainfall > currentRainfall) {
        return `${forecastMinutes}分後から雨が強くなります。`;
      } else {
        return `${forecastMinutes}分後から雨が降ります。`;
      }
    }

    return '1時間は雨が降らなさそうです。';
  }
}
```

システム応答はコンソールを確認してください。

```bash
東京ディズニーランドは1時間は雨が降らなさそうです。
東京ディズニーランドは10分後から雨が降ります。
東京ディズニーランドは50分後から雨が強くなります。
東京ディズニーランドは今雨が降ってますが、10分後に晴れそうです。
```

天気系の意図への対応は以上です。  
次は、 [文脈引き継ぎ機能の追加](./04_NLUService_TaskOrientedContext.md)へ進んでください。

## 著者

LINEヤフー株式会社 言語処理エンジニア  
西山 育宏
