// ABOUT・HOW I BUILD ページの中身。文章を直すときはここを書き換える。
// 公開サイトに載るので、本名・旧姓・取引先の社名・報酬などは書かない。

// ------------------------------------------------------------------
// ABOUT
// ------------------------------------------------------------------
export const facts = [
  { value: '7', label: '福祉施設に導入した\n業務システム' },
  { value: '20+', label: 'AIスクールで\n制作した教材' },
  { value: '4', label: '業務委託で\n取引している企業・団体' },
  { value: '3年', label: '福祉の現場で\n働いた経験' },
];

export type CareerItem = { when: string; title: string; text?: string; points?: string[]; now?: boolean };

export const career: CareerItem[] = [
  {
    when: '2026.01 — NOW', now: true,
    title: 'フリーランス（業務委託で4社と取引）',
    points: [
      '福祉施設（就労継続支援B型）：業務システムの開発・導入（7件）',
      'AIスクール：受講生のチャット・テクニカルサポート、教材制作（20本以上）、問い合わせ対応の仕組みづくり、イベント出演',
      '自治体DXの人材育成スクール：教材制作',
      'AI系企業：Claude Code・Codex を使った動画制作の自動化',
    ],
  },
  {
    when: '2025.10',
    title: '生成AIの学習を始める',
    text: '趣味で触り始めたAIが大好きになり、3か月後にはAIスクールで働き始めました。',
  },
  {
    when: '約3年',
    title: '福祉事業所（自立訓練）の生活支援員・リーダー',
    text: '立ち上げメンバーとして、代表と2人の体制から参加し、4人体制まで拡大。利用者さんの支援・面談、支援記録、書類・請求業務、プログラム作成、マニュアル整備、関係機関との連携を担当しました。',
  },
  {
    when: '約1年',
    title: '医療事務・カスタマーサポート（リーダー）',
    text: '患者さんの対応、予約管理、問い合わせ対応、関係部署との連携を担当しました。',
  },
  {
    when: '約3年',
    title: 'フリーライター（美容・医療系）',
    text: '薬機法の厳しいルールの中で、言っていい表現・ダメな表現を判断しながら記事を書いてきました。',
  },
];

export const skills: { group: string; items: string[] }[] = [
  { group: 'LANGUAGES', items: ['Python', 'TypeScript', 'Google Apps Script', 'SQL'] },
  { group: 'CLOUD / DATA', items: ['Google Cloud（Cloud Run）', 'Supabase（PostgreSQL）', 'AWS', 'Docker'] },
  { group: 'AI', items: ['LLM API', 'RAG', 'AIエージェント', 'MCP', 'プロンプト設計', 'Claude Code', 'Codex'] },
  { group: 'AUTOMATION', items: ['n8n', 'Make', 'Excel（マクロ・アドイン）', 'API連携', 'Slack'] },
  { group: 'WEB', items: ['Next.js', 'React', 'three.js', 'Git / GitHub', 'Vercel'] },
  { group: 'CREATIVE', items: ['After Effects', 'Premiere Pro', 'Suno', 'ElevenLabs', 'Midjourney', 'Kling'] },
];

export const values = [
  {
    title: '理由まで伝える',
    text: '「なぜそうするのか」が分かれば、手順書にない場面でも自分で判断できます。だから説明するときは、手順だけでなく理由まで伝えます。相手がどこでつまずきそうかも、先回りして考えます。',
  },
  {
    title: 'AIは補助、責任は人',
    text: 'AIは優秀で、大好きな道具です。それでも、責任を負うのは人間です。AIの出したものは確かめ、最後のチェックは必ず自分でします。',
  },
  {
    title: '数字で確かめる',
    text: '仕組みを入れる前と後の作業時間を、自分で計っておきます。「楽になった気がする」ではなく、「1時間が3分になった」と言えるようにするためです。',
  },
  {
    title: '言っていいこと・ダメなことに敏感に',
    text: 'ライター時代の薬機法、福祉の現場での言葉選び。どの仕事でも「この表現は大丈夫か？」と立ち止まれることを大事にしています。',
  },
];

// ------------------------------------------------------------------
// HOW I BUILD
// ------------------------------------------------------------------
export type Step = { en: string; title: string; text: string; example: string };

export const steps: Step[] = [
  {
    en: 'LISTEN', title: '現場の話を聞く',
    text: '何に時間がかかっているのか、誰が・いつ・どこで使うのかを聞きます。話だけで分からないときは、実際に現場へ行きます。',
    example: '内職作業の工程表をつくるとき、静岡の事業所を訪問し、作業の進み方を見てから設計しました。',
  },
  {
    en: 'DEFINE', title: '「本当に必要なもの」を言葉にする',
    text: '作り始める前に、相手が何を求めているのかを確かめます。以前はスピードを優先して作り直しが多かったので、いまはここに時間をかけています。',
    example: '支援記録の通知では、「体調不良」だけでは通知しないと決めました。体調の波と付き合いながら働いている方が多く、すべて通知すると本当に大事な情報が埋もれるからです。',
  },
  {
    en: 'DESIGN', title: 'いつもの道具の中に組み込む',
    text: '新しいアプリを覚えてもらうより、スタッフさんが毎日使っているSlackやExcelの中で完結する形を選びます。ノーコードで十分か、コードを書くべきかも、ここで決めます。',
    example: '書類業務へのAI要約は、使い慣れたExcelのアドインとして追加しました。',
  },
  {
    en: 'BUILD', title: 'Claude Code と一緒に作る',
    text: 'コードは Claude Code や Codex と一緒に書きます。ただし、AIに書かせて終わりにはしません。何をしているかを説明できる状態にして、最後の確認は自分でします。',
    example: 'APIのない福祉向けシステムは、書き出したPDFを読み取る仕組みを作り、AIで要約してSlackに届けています。',
  },
  {
    en: 'MEASURE', title: '計って、直して、次へ',
    text: '導入したら、前と後の作業時間を計ります。使ってもらいながら直し、信頼をいただけたら、次の困りごとへ進みます。',
    example: '作業報告は約1時間から約3分に。最初の1件から、7件のシステム開発につながりました。',
  },
];

export const toolbox = [
  {
    title: 'まずはノーコード・GAS',
    text: '小さく早く試したいときは、Make・n8n・Google Apps Script で組みます。',
    items: ['Make', 'n8n', 'Google Apps Script'],
  },
  {
    title: '重い処理はコードとクラウド',
    text: 'ノーコードでは難しい処理は Python で書き、Google Cloud の Cloud Run で動かします。データの保存には Supabase を使います。',
    items: ['Python', 'Cloud Run', 'Supabase'],
  },
  {
    title: '判断はAIに、確認は人に',
    text: '要約や仕分けなど「読んで判断する」作業は、LLM API に任せます。そのときの判断基準には、現場で働いた経験を入れています。',
    items: ['LLM API', 'RAG', 'プロンプト設計'],
  },
];
