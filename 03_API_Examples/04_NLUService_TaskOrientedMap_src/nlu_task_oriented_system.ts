import readline from 'readline';
import fs from 'fs';

const APPID = 'あなたの Client ID（アプリケーション ID）';

/** 対話行為（DialogueAct）*/
type DAType = 'AskSay' | 'AskMap' | 'AskNotFound';
interface DialogueAct {
  type: DAType;
}

// 雑談応答の要求
class AskSay implements DialogueAct {
  public type: DAType = 'AskSay';

  /**
   * @param response - 雑談応答
   */
  constructor(public response: string) {}
}

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

/**
 * Type Guardの定義
 * @param da - チェック対象のオブジェクト
 * @param daType - チェックするタイプ
 * @returns daがタイプTである場合にtrue、それ以外の場合にfalseを返す
 */
function isType<T extends DialogueAct>(da: DialogueAct, daType: DAType): da is T {
  return da.type === daType;
}

/**
 * Natural Language Understanding (自然言語理解)
 */
class NLU {
  /**
   * テキスト解析 Web API の自然言語理解で自然言語のテキストを解析する
   * @param input - 自然言語のテキスト
   * @returns テキスト解析 Web API の自然言語理解のリクエスト結果
   */
  async analyze(input: string): Promise<any> {
    const nluRequestEntity = new NLURequestEntity(input);
    return nluRequestEntity.request();
  }
}

/**
 * テキスト解析 Web API の自然言語理解のRequestEntity
 */
class NLURequestEntity {
  private static baseUri = 'https://jlp.yahooapis.jp/NLUService/V2/analyze';
  private static headers = {
    'Content-Type': 'application/json',
    'User-Agent': `Yahoo AppID: ${APPID}`,
  };

  /**
   * @param query - 自然言語のテキスト
   */
  constructor(private query: string) {}

  /**
   * テキスト解析 Web API の自然言語理解にリクエストする関数
   * @returns テキスト解析 Web API の自然言語理解のリクエスト結果
   */
  async request(): Promise<any> {
    try {
      const response = await fetch(NLURequestEntity.baseUri, {
        method: 'POST',
        headers: NLURequestEntity.headers,
        body: this.generateRequestBody(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data?.result?.['STATUS'] !== '200') {
        throw new Error(`API error! status: ${data?.result?.['STATUS']}`);
      }

      return data;
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  }

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
      },
    });
  }
}

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
      case 'SAY': {
        const paramText = nluData?.result['PARAM_TEXT'];
        if (paramText) {
          return new AskSay(paramText);
        }
      }
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
    if (isType<AskSay>(da, 'AskSay')) {
      return da.response;
    }

    if (isType<AskMap>(da, 'AskMap')) {
      const coordinates = await this.fetchCoordinatesForPlace(da.place);
      return coordinates
        ? `${da.place}(lon=${coordinates.lon},lat=${coordinates.lat})の地図を表示します。`
        : `「${da.place}」の情報が見つかりませんでした。`;
    }

    return '応答文生成に失敗しました。';
  }

  /**
   * 場所名から緯度経度情報を取得
   * @param place - 場所名
   * @returns 経度と緯度の情報
   */
  private async fetchCoordinatesForPlace(place: string): Promise<{ lon: string; lat: string } | undefined> {
    const entity = new ContentGeoCoderRequestEntity(place);
    const contentData = await entity.request();
    const coordinates = contentData?.Feature?.[0]?.Geometry?.Coordinates?.split(',');
    return coordinates ? { lon: coordinates[0], lat: coordinates[1] } : undefined;
  }
}

/**
 * getリクエストのためのインタフェース
 */
interface GetRequestEntity {
  request(): Promise<any>;
}

/**
 * コンテンツジオコーダAPIのRequestEntity
 */
class ContentGeoCoderRequestEntity implements GetRequestEntity {
  private static baseUri = 'https://map.yahooapis.jp/geocode/cont/V1/contentsGeoCoder';
  private static headers = { 'Content-Type': 'application/json' };

  /**
   * @param place - 場所名
   */
  constructor(private place: string) {}

  /**
   * コンテンツジオコーダAPIへのリクエスト処理
   * @returns APIのレスポンス結果
   */
  async request(): Promise<any> {
    const response = await fetch(this.buildRequestParams(), {
      method: 'GET',
      headers: ContentGeoCoderRequestEntity.headers,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  /**
   * コンテンツジオコーダAPIへのリクエストパラメータを生成
   * @returns リクエストURLの文字列
   */
  private buildRequestParams(): string {
    const url = new URL(ContentGeoCoderRequestEntity.baseUri);
    url.searchParams.append('appid', APPID);
    url.searchParams.append('query', this.place);
    url.searchParams.append('category', 'landmark');
    url.searchParams.append('output', 'json');

    return url.toString();
  }
}

/**
 * 対話処理を行うクラス
 */
class DialogProcessor {
  /**
   * 対話処理のメイン関数
   */
  async process() {
    while (true) {
      const intext = await this.input('発話を入力');

      // Natural Language Understanding (自然言語理解)
      const nlu = new NLU();
      const nluData = await nlu.analyze(intext);
      this.saveLog('nlu.log', intext, JSON.stringify(nluData, null, 2));
      const intent = nluData?.result['METHOD'];

      // Dialogue Management (対話管理)
      const dm = new DM();
      const dialogueAct = await dm.recognizeDA(intent, nluData);
      this.saveLog('dm.log', intext, JSON.stringify(dialogueAct, null, 2));

      // Natural Language Generation (自然言語生成)
      const nlg = new NLG();
      const response = await nlg.generateResponse(dialogueAct);
      console.log(response);
    }
  }

  /**
   * ユーザからの発話を取得するための関数
   * @param prompt - ユーザに表示するプロンプトメッセージ
   * @returns ユーザの入力を含むテキスト
   */
  private input(prompt: string): Promise<string> {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    return new Promise((resolve, _) => {
      rl.question(`${prompt}: `, async (intext) => {
        rl.close();
        resolve(intext);
      });
    });
  }

  /**
   * ログファイルに保存するための関数
   * @param filename - ファイル名
   * @param key - 保存するデータの識別キー
   * @param data - 保存するデータ
   */
  private saveLog(filename: string, key: string, data: any) {
    fs.appendFile(filename, `"${key}": ${data}\n`, (err) => {
      if (err) {
        console.error('ログの保存中にエラーが発生しました。', err);
      }
    });
  }
}

/** メイン処理 */
const dialogProcessor = new DialogProcessor();
dialogProcessor.process();
