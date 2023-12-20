# This Python file uses the following encoding: utf-8
import json
from urllib import request

import fasttext
import numpy as np
from huggingface_hub import hf_hub_download


# テキスト解析 Web API（キーフレーズ抽出）を叩いて、キーフレーズとその重要度を取得する関数
def extract_keyphrases(query: str) -> list[dict]:
    client_id = "あなたの Client ID（アプリケーション ID）"
    url = "https://jlp.yahooapis.jp/KeyphraseService/V2/extract"

    headers = {
        "Content-Type": "application/json",
        "User-Agent": f"Yahoo AppID: {client_id}",
    }

    param_dic = {
        "id": "1234-1",
        "jsonrpc": "2.0",
        "params": {
            "q": query,
        },
        "method": "jlp.keyphraseservice.extract",
    }

    params = json.dumps(param_dic).encode()
    req = request.Request(url, params, headers)

    with request.urlopen(req) as res:
        body = res.read()

    return json.loads(body.decode())["result"]["phrases"]


# コサイン類似度を計算する関数
def cos_sim(v1: np.ndarray, v2: np.ndarray) -> float:
    return np.dot(v1, v2) / (np.linalg.norm(v1) * np.linalg.norm(v2))


# 長文類似度比較用のクラス
class TextualSimilarityForLongDocument:
    def __init__(self):
        # 単語埋め込みのロード
        fasttext_path = hf_hub_download(
            repo_id="facebook/fasttext-ja-vectors", filename="model.bin"
        )
        self.fasttext = fasttext.load_model(fasttext_path)

    # 長文同士の類似度を判定
    def __call__(self, s1: str, s2: str) -> float:
        # 各文書からキーフレーズを抽出して、単語集合を作成
        s1_phrases = [phrase["text"] for phrase in extract_keyphrases(s1)]
        s2_phrases = [phrase["text"] for phrase in extract_keyphrases(s2)]

        # 文書内の各フレーズをfastTextを用いてベクトル化
        s1_phrase_embeddings = np.array(
            [self.fasttext[phrase] for phrase in s1_phrases]
        )
        s2_phrase_embeddings = np.array(
            [self.fasttext[phrase] for phrase in s2_phrases]
        )

        # フレーズベクトルの平均を取ることで、文書ベクトルを計算
        s1_document_embedding = s1_phrase_embeddings.mean(axis=0)
        s2_document_embedding = s2_phrase_embeddings.mean(axis=0)

        # コサイン類似度を用いて、文書間の類似度を計算
        similarity = cos_sim(s1_document_embedding, s2_document_embedding)

        return similarity


if __name__ == "__main__":
    # 文書の類似度を計算するクラスのインスタンスを作成
    textual_similarity = TextualSimilarityForLongDocument()

    # 野球1に関するニュース記事
    baseball1 = "2日、広島×阪神戦において、阪神の敗戦が決定した瞬間、中日が4年ぶりのリーグ優勝を果たした。  同夜、日本テレビ「NEWS ZERO」には、落合博満監督が生出演。野球評論家・長嶋一茂氏がインタビューを行った。  「（ライバルは）5チームですよ。結局、ヤクルトには負け越しした。でも、最終的に（ゲームが）残ったのはヤクルトでしょ。一番難しい戦いだった。今日決まってくれて、よかった。明日恐らく負けるよ」とおどけてみせた落合監督。  ビールかけでは、一年間禁酒していたことを明かしたが、その理由を「去年の負けがよっぽど悔しかった。12ゲームでしょ。でも、去年と今年勝ってる数が一緒なんだよ。79勝で。何かしなきゃ勝てないだろうって、一番いいのは酒やめる」と語った。  また、長嶋氏から名古屋ドームで51勝を挙げていることに触れられると、「狭い球場ってバッティング雑になるでしょ。広い球場って、しっかり打たなきゃ入らない。でも、その感覚でここ（名古屋ドーム）にきちゃうから。“あっ、いった”ってヤツはここは入らない。恐らく雑になるでしょ。どっちみち、うちはホームラン打てないんだから。だから鉄板野球になっちゃう。“なんだ面白くねえな。初回から送りバントかよ”と。でも、そういうゲーム運びをしないとここでは勝てない」と持論を展開した落合監督は、「野手で今年一年間で休んだの、オールスター休み二日間だけだから。あとは休ませてないから。下手なチーム、野球休んだら、もっと置いていかれる。下手なヤツは練習しなきゃ」と続けるのだった。"

    # 野球2に関するニュース記事
    baseball2 = "21日、西武ドームで行われた埼玉西武ライオンズvs中日ドラゴンズの一戦は、中島の満塁本塁打などにより、13-4で西武が大差の勝利を挙げた。  中でも、中日の右腕・小熊は打者18人に対し、3本の本塁打を打たれ、7失点。その間、落合監督から途中交代を命じられることもなく、火ダルマになりながら3回を投げた。  この落合采配に同調したのが、プロ野球解説者・野村克也氏だった。同夜放送された、TBS「S1」番組内「ノムさんのボヤキ部屋」コーナーでこの試合に触れると、「俺と同じことやってんの、落合。代えないでしょ？ 僕は11点取られても代えなかった」と切り出した。  その理由について、「いや、もうゲームを壊しているから。自分で責任を取れっていう。ゲームが決まっちゃっているのに、次出てくるピッチャーの気持ちを考えたら、最後まで責任を取って貰わないと。こんな後に出される方が大変ですよ」と明かした野村氏。  番組MCの魔裟斗から「愛のムチ？」と訊かれるや、「そういうね、恥をかかせるっていう一つの育成法なんですよ。恥をかかなきゃ、本物になっていかない。いい薬ですよ。その辺は落合もちゃんと計算に入っているよね」と答えたのだった。"

    # サッカーに関するニュース記事
    soccer = "優勝候補筆頭の開催国ドイツを破り、準決勝で強豪スウェーデンと対戦するなでしこジャパン。日本時間の14日午前3：45にキックオフされる試合は、フジテレビでの緊急生中継が決まるなど、日本国内での注目度も急速に高まっている。スポーツニュースでの扱いも決して大きくなかった女子W杯だが、なでしこジャパンのひたむきな姿勢による快進撃が、世論を突き動かしている。  その中心にいるのが、キャプテンの澤穂希だ。驚異的な運動量でピッチを縦横無尽に走り回り、相手のチャンスの芽をことごとく潰し、チャンスと見るや前線へ顔を出し、決定的な仕事をする。グループリーグのメキシコ戦ではセンターハーフながらハットトリックを達成し、ドイツ戦では丸山桂里奈の決勝ゴールをアシストした。  そのプレーのレベルの高さだけでも、すでに女子サッカー界のレジェンド的存在であるが、何よりも特筆すべきはその精神力だ。自著『ほまれ』の中では、その精神力を証明する驚異的な逸話を明かしている。  アテネオリンピック女子最終予選、対北朝鮮戦。大勢の観客で埋まった聖地国立でのこの試合において、澤は右ひざ半月板損傷のケガを負いながらも、痛み止めの注射に加え、座薬を入れて出場。普通の人間であれば立っているのだけでもつらい状況の中、キックオフ直後に相手エースをショルダータックルで吹っ飛ばし、カウンターの好機につなげた。そして、その後のことはまったく覚えていないという。  結局その試合に勝利し、五輪への出場権獲得を成し遂げた澤は、さらに驚くことに、その2日後の中国戦にも出場している。痛みに耐え、プレーでチームを牽引するその姿は、さしずめ日本のジャンヌ・ダルク。ベスト4入りした2008年の北京五輪でも「苦しいときは私の背中を見なさい」と仲間を引っ張り、なでしこジャパンを高みに導いた。  14日の試合でスウェーデンに勝利すれば、日本女子サッカー史上初のメダル確定、そして決勝進出となる。鉄人澤に率いられたなでしこジャパンが新たな歴史を紡ぐ瞬間を、心待ちにしたい。"

    # 各ニュース記事間の類似度を算出
    print(f"野球1と野球2の類似度: {textual_similarity(baseball1, baseball2):.2f}")
    print(f"野球1とサッカーの類似度: {textual_similarity(baseball1, soccer):.2f}")
    print(f"野球2とサッカーの類似度: {textual_similarity(baseball2, soccer):.2f}")
