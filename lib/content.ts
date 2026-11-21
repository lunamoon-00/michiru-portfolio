// サイトに載せる中身（数字・作品）をまとめたファイル。
// 文章や数字を直したいときは、基本的にこのファイルだけを書き換えればよい。
// 数字はすべて 2026年11月時点の実際の値。
import { welfareSvg, videoAutomationSvg, aiLiveSvg, skillScopeSvg, shinkokuSvg } from './visuals';

/** お問い合わせ先 */
export const CONTACT_EMAIL = 'lumina.official.me@gmail.com';

/** どちらのモードで見せるか。eng = ENGINEERING、cre = CREATIVE、両方なら undefined */
export type Mode = 'eng' | 'cre';

// ------------------------------------------------------------------
// トップの「強み3つ」
// ------------------------------------------------------------------
export type HeroStat = { value: string; label: [string, string] };   // label は2行に分けて表示

export const heroStats: Record<Mode, HeroStat[]> = {
  eng: [
    { value: '7', label: ['福祉施設に導入した', '業務システム'] },
    { value: '1h→3min', label: ['作業報告に', 'かかる時間'] },
    { value: '−80%', label: ['動画1本の', '制作時間'] },
  ],
  cre: [
    { value: '12.4万', label: ['直近1年の', '視聴回数'] },
    { value: '165', label: ['チャンネル', '登録者'] },
    { value: '122', label: ['公開した', '動画'] },
  ],
};

// ------------------------------------------------------------------
// NUMBERS：画面を横切る大きな数字
// ------------------------------------------------------------------
export type BigNumber = {
  mode: Mode;
  value: number;      // カウントアップの行き先
  prefix?: string;    // 数字の前につく文字（例：−）
  suffix?: string;    // 数字の後ろにつく文字（例：%）
  unit: string;       // 英語の見出し
  text: string;       // 説明文
};

export const numbers: BigNumber[] = [
  { mode: 'eng', value: 7, unit: 'SYSTEMS', text: '福祉施設から依頼され、開発・導入した業務システムの数。' },
  { mode: 'eng', value: 80, prefix: '−', suffix: '%', unit: 'TIME CUT', text: '動画制作フローの自動化で減らした、1本あたりの制作時間。' },
  { mode: 'eng', value: 20, suffix: '+', unit: 'COURSES', text: 'AIスクールで制作した教材の本数。専門知識のない人にも伝わる言葉で書いています。' },
  { mode: 'eng', value: 4, unit: 'CLIENTS', text: '業務委託で取引している企業・団体の数。AIスクール、自治体DX、AI系企業、福祉施設。' },
  { mode: 'cre', value: 124000, unit: 'VIEWS / YEAR', text: 'I♥DOLLとオリジナルMV、2つのYouTubeチャンネルの直近1年間の視聴回数の合計（2026年11月時点）。' },
  { mode: 'cre', value: 165, unit: 'SUBSCRIBERS', text: 'ゼロから立ち上げたAIアイドル「I♥DOLL」のチャンネル登録者数（2026年11月時点）。' },
  { mode: 'cre', value: 318, unit: 'HOURS WATCHED', text: '2つのチャンネルが直近1年間に見られた時間の合計（約318時間）。' },
  { mode: 'cre', value: 122, unit: 'VIDEOS', text: 'I♥DOLLのチャンネルで公開した動画の本数（MV・ショート・短編ドラマ）。' },
];

// ------------------------------------------------------------------
// WORKS：作品カードと、押したときに開く詳しい説明
// ------------------------------------------------------------------
/** 詳しい説明の1ブロック。[英語の見出し, 日本語の見出し, 本文（文章 or 箇条書き）]。本文には <strong> を使える */
export type CaseBlock = [en: string, ja: string, body: string | string[]];

export type WorkDetail = {
  img?: string;                       // 大きな画像（YouTubeのサムネイルなど）。無ければカードのイメージ図を使う
  dev?: boolean;                      // 開発中（画像の代わりに斜線の模様）
  stat: [value: string, label: string];
  blocks: CaseBlock[];
  tags: string[];
  links?: [href: string, en: string, ja: string][];
  note?: string;
};

export type Work = {
  mode?: Mode;                        // 片方のモードだけで見せるとき
  meta: string;                       // カード上の小さい英字（分類）
  title: string;
  num: string;                        // カードの数字
  numNote?: string;                   // 数字の横の説明
  gradient?: string;                  // 画像の後ろに敷くグラデーション
  svg?: string;                       // イメージ図（守秘義務のある開発案件）
  thumb?: string;                     // サムネイル画像
  dev?: boolean;
  detail: WorkDetail;
};

const yt = (id: string) => `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`;
const CONFIDENTIAL = '※ 守秘義務のため、画像は実際の画面ではなくイメージ図です。';

export const works: Work[] = [
  {
    mode: 'eng', meta: 'ENGINEERING / WELFARE', title: '福祉施設の業務システム ×7',
    num: '1h → 3min', numNote: '作業報告にかかる時間',
    gradient: 'radial-gradient(circle at 25% 30%,#3dffd0 0,#0b4f53 30%,#07121a 70%)', svg: welfareSvg,
    detail: {
      stat: ['1h → 3min', '作業報告にかかる時間'],
      blocks: [
        ['PROBLEM', '課題', '就労継続支援B型の事業所。清掃の現場で写真を撮り、事業所に戻ってExcelに入力し、Slackに投稿していました。支援記録は外部の福祉システムの中にあり、APIがないため、ほかの仕組みとつなげられない状態でした。'],
        ['BUILD', 'つくったもの', [
          'Slackのタスク通知：代表がタスクを管理し、メンバーが自分のタスクを確認できる',
          '<strong>作業報告書</strong>：現場で写真を撮って入力し、ボタン1つでSlackに送信',
          '<strong>支援記録の通知</strong>：書き出したPDFを読み取り、AIで要約して、毎朝8:30にSlackへ',
          '月末報告書の自動作成：たまった記録から、利用者さんごとに作成',
          '関係機関へのメール一括送信：パスワード付きファイルにして送る',
          '作業工程表（作成中）：静岡の現地を訪問し、内職作業の進み方を見て設計',
          '書類業務のAI要約：モニタリングや個別支援計画書に、Excelのアドインとして追加',
        ]],
        ['INSIGHT', '工夫', '支援記録の通知では、「体調不良」だけでは通知しないようにしました。体調の波をコントロールしながら働いている方が多いので、すべて通知すると数が多すぎて、本当に大事な情報が埋もれてしまいます。福祉の現場で3年働いた経験を、AIの判断基準に入れています。'],
        ['RESULT', '成果', [
          '作業報告が<strong>約1時間 → 約3分</strong>に。現場スタッフから「とても楽になった」との声',
          'PDFをGoogleドライブに入れるだけで、毎朝8:30に要注意事項が届く',
          '最初の1件から信頼をいただき、<strong>7件</strong>の開発につながった',
        ]],
      ],
      tags: ['ヒアリング', '現地訪問', '要件定義', 'Slack', 'Googleドライブ', 'PDF読み取り', 'AI要約', 'Excelアドイン'],
      note: CONFIDENTIAL,
    },
  },
  {
    mode: 'eng', meta: 'ENGINEERING / FULL STACK', title: 'SkillScope',
    num: '4 CLOUDS', numNote: 'Vercel・Supabase・Google Cloud・AWSを1つのシステムに',
    gradient: 'radial-gradient(circle at 30% 40%,#b388ff 0,#3a1d7a 35%,#0a0614 75%)', svg: skillScopeSvg,
    detail: {
      stat: ['33', '求人5件から抽出したスキルの種類'],
      blocks: [
        ['PROBLEM', '課題', '転職活動で「何を学べば採用に近づくか」が、求人を読んだときの感覚でしか分かりませんでした。学んだことを、面接でうまく説明できないという悩みもありました。'],
        ['BUILD', 'つくったもの', [
          '<strong>求人の分析</strong>：求人票を貼ると、AI（Gemini）がスキル名と「必須／歓迎」に分解して保存',
          '<strong>ダッシュボード</strong>：よく求められるスキルと、「需要が高いのに学習が足りないスキル」をSQLで集計',
          '<strong>週次の集計</strong>：Python（pandas）のバッチをDockerにして、Google Cloud Runで毎週月曜に自動実行',
          '<strong>面接コーチ</strong>：AWS Lambda と Amazon Bedrock で、学習ログから質問を作り、回答を「課題→手段→理由→成果」で採点',
          '<strong>スマホアプリ</strong>：Flutterで学習ログを記録。Webと同じデータベースを使う',
        ]],
        ['INSIGHT', '工夫', [
          '「自分のデータしか見えない」をデータベース側（RLS）で保証。画面のコードにミスがあっても、他人のデータは返らない',
          '強い鍵はブラウザに置かない。AWS側にも置かず、ログインの証明書でデータベースに問い合わせる',
          '本番でログインできない・通信できない（CORS）といったトラブルを、実際の通信の中身を確かめて原因を特定し、解決した',
        ]],
        ['RESULT', '成果', [
          '実際の求人5件を分析し、<strong>33種類</strong>のスキルを抽出',
          'Gemini が求人の<strong>60%</strong>、AIで開発する道具（Cursor・Claude Code・ChatGPT）が<strong>40%</strong>に登場。「生成AIを使って開発できること」が求められていると数字で分かった',
          'その上位のスキルを実際に使うシステムとして、このSkillScope自体を作った',
        ]],
      ],
      tags: ['Next.js', 'TypeScript', 'Supabase', 'PostgreSQL', 'Python', 'Docker', 'Google Cloud Run', 'AWS Lambda', 'Amazon Bedrock', 'Gemini', 'Flutter', 'Vercel'],
      links: [
        ['https://github.com/lunamoon-00/skill-scope', 'GITHUB', 'コードと設計を見る'],
        ['https://skill-scope-delta.vercel.app/', 'DEMO', 'アプリを開く（ログインが必要です）'],
      ],
      note: '※ 画像はイメージ図です。',
    },
  },
  {
    mode: 'eng', meta: 'ENGINEERING / AWS', title: '申告ノート',
    num: '1 PHOTO', numNote: 'LINEにレシートを送るだけで、帳簿から確定申告まで',
    gradient: 'radial-gradient(circle at 70% 35%,#7c5cff 0,#25124f 38%,#08050f 75%)', svg: shinkokuSvg,
    detail: {
      stat: ['249', 'API の自動テスト（税の計算・他人のデータが見えないことも確認）'],
      blocks: [
        ['PROBLEM', '課題', '2026年から、家族2人がフリーランスになりました。レシートの整理、科目分け、源泉徴収、控除、消費税…と、確定申告は「知らないこと」と「手間」のかたまりです。会計ソフトの借方・貸方の画面も、初心者にはむずかしいものでした。'],
        ['BUILD', 'つくったもの', [
          '<strong>LINEで記録</strong>：レシートや控除証明書の写真を送ると、AI（Gemini）が読み取って記録。自信があるものは自動で確定し、あやしいものだけ「確認待ち」に',
          '<strong>freee連携</strong>：確定した記録を、OAuthでつないだfreeeに自動登録。直したら送りなおし、消したらfreeeでも消す',
          '<strong>確定申告の準備</strong>：質問に答えると税額のめやすが出る。所得控除・減価償却・給与所得・インボイスの消費税（2割特例・簡易課税）まで',
          '<strong>銀行・カードのCSV</strong>と<strong>毎月の固定費</strong>も自動で記録。同じものは二度記録しない',
          '<strong>AWSをすべてコードで</strong>：CDKでCognito・API Gateway・Lambda・SQS・Aurora・S3・EventBridge・CloudWatchを組み、GitHub Actionsから鍵なし（OIDC）で自動公開',
        ]],
        ['INSIGHT', '工夫', [
          '税の数字（控除額・税率・償却率）は、記憶で書かずに国税庁・e-Govで確かめ、<strong>出典URLつき</strong>でデータベースに保存',
          '「借方の合計＝貸方の合計」はデータベースのトリガーで保証。自分のデータしか見えないことも、RLS（行レベルセキュリティ）とテストで二重に守る',
          'LINEは数秒で返事しないと失敗扱いになるので、受け取り係はキューに入れるだけにして、重い処理は裏で。失敗したらやりなおし、最後はメールで知らせる',
        ]],
        ['RESULT', '成果', [
          '設計から公開まで、<strong>8つのPhase・PR 18本</strong>で完成',
          '自動テスト：API <strong>249件</strong>・AWSの設定 25件・画面 40件（E2Eはスマホとパソコンの両方）',
          '本物のレシートをLINEで送り、約13秒で自動記録されるところまで確認。家族2人で2026年分の申告に使う',
        ]],
      ],
      tags: ['AWS CDK', 'Lambda', 'API Gateway', 'Cognito', 'Aurora PostgreSQL', 'SQS', 'EventBridge', 'CloudWatch', 'Python', 'Next.js', 'TypeScript', 'GitHub Actions', 'LINE API', 'freee API', 'Gemini'],
      links: [
        ['https://github.com/lunamoon-00/shinkoku-note', 'GITHUB', 'コードと設計を見る'],
      ],
      note: '※ 画像はイメージ図です。家族の税の情報をあつかうため、アプリは一般公開していません。',
    },
  },
  {
    mode: 'eng', meta: 'ENGINEERING / AUTOMATION', title: '動画制作の自動化',
    num: '−80%', numNote: '1本あたりの制作時間',
    gradient: 'linear-gradient(130deg,#091a2b,#1f6fff 55%,#5dffb5)', svg: videoAutomationSvg,
    detail: {
      stat: ['−80%', '動画1本あたりの制作時間（約5時間 → 30分〜1時間）'],
      blocks: [
        ['PROBLEM', '課題', 'AI系企業のコンテンツ制作。動画1本をつくるのに、約5時間かかっていました。'],
        ['BUILD', 'つくったもの', [
          '動画の編集作業を、Claude Code・Codexに任せる仕組み',
          '作業の流れをn8n（エヌエイトエヌ）でつなぎ、人が手を動かす場面を減らした',
          '必要なところは、After Effectsのスクリプトで自動化',
        ]],
        ['RESULT', '成果', ['1本あたり<strong>30分〜1時間</strong>で完成するように（約80%の削減）']],
      ],
      tags: ['Claude Code', 'Codex', 'n8n', 'After Effects'],
      note: CONFIDENTIAL,
    },
  },
  {
    meta: 'ENGINEERING × CREATIVE', title: 'I♥DOLL AI LIVE SYSTEM',
    num: '5 AI', numNote: 'キャラクターが自動で会話・配信',
    gradient: 'conic-gradient(from 200deg at 60% 40%,#ff4fd8,#4cc9ff,#5dffb5,#ff4fd8)', svg: aiLiveSvg,
    detail: {
      stat: ['5 AI', 'キャラクターが自動で会話・配信'],
      blocks: [
        ['CONCEPT', 'ねらい', 'オリジナルAIアイドル「I♥DOLL」の5人のキャラクターを、動画だけでなく、ライブ配信でも動かすための仕組みです。'],
        ['BUILD', 'つくったもの', ['Geminiで、キャラクターごとの会話を生成', 'OBSで、会話を配信画面に流す']],
        ['RESULT', '成果', ['5人のAIキャラクターが、自動で会話しながら配信できるように']],
      ],
      tags: ['Gemini', 'OBS', 'キャラクター設計'],
      note: '※ 画像はイメージ図です。',
    },
  },
  {
    mode: 'cre', meta: 'CREATIVE / ORIGINAL IP', title: 'I♥DOLL オリジナルAIアイドル',
    num: '10.5万回', numNote: '直近1年の視聴回数',
    gradient: 'radial-gradient(circle at 70% 35%,#ffb3e6 0,#7b2d6e 35%,#140814 75%)', thumb: yt('QbhDjxC6-uI'),
    detail: {
      img: yt('QbhDjxC6-uI'),
      stat: ['10.5万回', '直近1年の視聴回数（2026年11月時点）'],
      blocks: [
        ['CONCEPT', 'ねらい', 'オリジナルのAIアイドルIPを、ゼロから立ち上げました。'],
        ['ROLE', '担当', ['企画・世界観・5人のキャラクター設計', '作詞・AI音楽', 'MV・短編ドラマ', 'YouTubeの運用・分析・改善']],
        ['RESULT', '成果', [
          '直近1年で<strong>10.5万回</strong>の視聴、<strong>259時間</strong>の再生',
          'チャンネル登録者<strong>165人</strong>、公開した動画<strong>122本</strong>',
        ]],
      ],
      tags: ['企画', 'キャラクター設計', '作詞', 'AI音楽', 'MV', 'YouTube運用'],
      links: [
        ['https://www.youtube.com/watch?v=QbhDjxC6-uI', 'WATCH', 'いちばん見られた動画'],
        ['https://www.youtube.com/@IDOLL-Official-0713', 'CHANNEL', 'I♥DOLLのチャンネル'],
      ],
    },
  },
  {
    mode: 'cre', meta: 'CREATIVE / MUSIC VIDEO', title: 'オリジナルMV「ゆめこもち」',
    num: '1.9万回', numNote: '作詞・AI音楽・映像・編集をすべて担当',
    gradient: 'linear-gradient(200deg,#bfe6ff,#3d5bd6 45%,#0d0a2b)', thumb: yt('VErDrvOl2y0'),
    detail: {
      img: yt('VErDrvOl2y0'),
      stat: ['1.9万回', 'チャンネルの直近1年の視聴回数（2026年11月時点）'],
      blocks: [
        ['CONCEPT', 'ねらい', '人形劇の世界観でつくった、オリジナルのAI MVです。'],
        ['ROLE', '担当', ['作詞・AI音楽・映像・編集をすべて担当']],
        ['RESULT', '成果', ['チャンネル全体で、直近1年に<strong>1.9万回</strong>の視聴、<strong>58.6時間</strong>の再生']],
      ],
      tags: ['作詞', 'AI音楽', '映像', '編集'],
      links: [['https://youtu.be/VErDrvOl2y0', 'WATCH', 'MVを見る']],
    },
  },
  {
    mode: 'cre', meta: 'CREATIVE / AI DRAMA', title: 'I♥DOLL 短編AIドラマ',
    num: 'EP.1–2', numNote: 'キャラクターの関係性を物語で広げる',
    gradient: 'radial-gradient(circle at 40% 60%,#ff8fd1 0,#4a1450 40%,#0a0510 80%)', thumb: yt('4-vUrSAbY3I'),
    detail: {
      img: yt('4-vUrSAbY3I'),
      stat: ['EP.1–2', '公開中'],
      blocks: [
        ['CONCEPT', 'ねらい', 'I♥DOLLの世界観を広げるため、キャラクター同士の関係性を、短い物語で描いたシリーズです。'],
        ['RESULT', '成果', ['EP.1・EP.2を公開']],
      ],
      tags: ['AIドラマ', 'キャラクター', 'I♥DOLL'],
      links: [['https://www.youtube.com/watch?v=4-vUrSAbY3I', 'WATCH', 'ドラマを見る']],
    },
  },
];
