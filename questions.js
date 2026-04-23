/**
 * 足球智商测试题库
 * 分类: rules(规则), history(历史), data(数据), tactics(战术), trivia(冷知识)
 * figure: 可选，内联SVG线稿插图
 */

// ── 插图 SVG ──
var FIGURES = {};

// VAR 回放屏幕
FIGURES[0] = '<svg viewBox="0 0 140 100" fill="none" stroke="#555" stroke-width="1.2" stroke-linecap="round"><rect x="20" y="10" width="100" height="65" rx="3"/><rect x="25" y="15" width="90" height="50" rx="1" fill="none" stroke-dasharray="3 2"/><line x1="55" y1="82" x2="85" y2="82"/><line x1="70" y1="75" x2="70" y2="82"/><text x="70" y="44" text-anchor="middle" font-size="9" fill="#999" stroke="none">VAR</text><circle cx="108" cy="38" r="4" fill="none" stroke="#c00" stroke-width="1.5"/><line x1="105" y1="35" x2="111" y2="41" stroke="#c00" stroke-width="1.5"/></svg>';

// 点球 — 球门正面 + 守门员 + 门线
FIGURES[1] = '<svg viewBox="0 0 140 100" fill="none" stroke="#555" stroke-width="1.2" stroke-linecap="round"><rect x="15" y="15" width="110" height="55" rx="2"/><line x1="15" y1="70" x2="125" y2="70" stroke="#333" stroke-width="2"/><text x="70" y="80" text-anchor="middle" font-size="7" fill="#999" stroke="none">← 门线 →</text><circle cx="70" cy="50" r="8"/><line x1="70" y1="42" x2="70" y2="35"/><line x1="62" y1="55" x2="56" y2="65"/><line x1="78" y1="55" x2="84" y2="65"/><line x1="62" y1="46" x2="52" y2="42"/><line x1="78" y1="46" x2="88" y2="42"/><circle cx="40" cy="88" r="5" fill="none"/><path d="M38 86 L42 86 L43 90 L37 90Z" fill="none"/></svg>';

// 越位 — 进攻球员与防守线
FIGURES[2] = '<svg viewBox="0 0 160 100" fill="none" stroke="#555" stroke-width="1.2" stroke-linecap="round"><line x1="80" y1="5" x2="80" y2="95" stroke-dasharray="4 3" stroke="#c00"/><text x="80" y="98" text-anchor="middle" font-size="7" fill="#c00" stroke="none">越位线</text><circle cx="60" cy="35" r="6" fill="none" stroke="#333"/><line x1="60" y1="41" x2="60" y2="58"/><line x1="60" y1="58" x2="54" y2="72"/><line x1="60" y1="58" x2="66" y2="72"/><line x1="60" y1="48" x2="50" y2="44"/><line x1="60" y1="48" x2="70" y2="44"/><text x="60" y="82" text-anchor="middle" font-size="7" fill="#999" stroke="none">防守员</text><circle cx="100" cy="30" r="6" fill="none" stroke="#06c"/><line x1="100" y1="36" x2="100" y2="53"/><line x1="100" y1="53" x2="94" y2="67"/><line x1="100" y1="53" x2="106" y2="67"/><line x1="100" y1="43" x2="90" y2="38"/><line x1="100" y1="43" x2="115" y2="35"/><text x="100" y="78" text-anchor="middle" font-size="7" fill="#06c" stroke="none">进攻员</text><path d="M108 32 L115 35 L112 28" fill="none" stroke="#06c" stroke-width="1"/><text x="113" y="24" font-size="6" fill="#06c" stroke="none">手臂</text></svg>';

// 换人牌
FIGURES[3] = '<svg viewBox="0 0 120 100" fill="none" stroke="#555" stroke-width="1.2" stroke-linecap="round"><rect x="20" y="8" width="35" height="50" rx="3" fill="none" stroke="#0a0"/><text x="37" y="38" text-anchor="middle" font-size="18" fill="#0a0" stroke="none">↑</text><rect x="65" y="8" width="35" height="50" rx="3" fill="none" stroke="#c00"/><text x="82" y="38" text-anchor="middle" font-size="18" fill="#c00" stroke="none">↓</text><text x="37" y="70" text-anchor="middle" font-size="7" fill="#999" stroke="none">换上</text><text x="82" y="70" text-anchor="middle" font-size="7" fill="#999" stroke="none">换下</text><text x="60" y="88" text-anchor="middle" font-size="8" fill="#666" stroke="none">第四官员换人牌</text></svg>';

// 欧冠奖杯
FIGURES[4] = '<svg viewBox="0 0 100 110" fill="none" stroke="#555" stroke-width="1.2" stroke-linecap="round"><path d="M35 25 C25 25 15 35 18 50 C20 60 30 55 35 50" /><path d="M65 25 C75 25 85 35 82 50 C80 60 70 55 65 50"/><path d="M35 20 Q50 5 65 20 L65 55 Q50 75 35 55Z" fill="none"/><rect x="42" y="75" width="16" height="8" rx="1"/><rect x="35" y="83" width="30" height="5" rx="1"/><line x1="50" y1="88" x2="50" y2="95"/><rect x="38" y="95" width="24" height="6" rx="2"/><text x="50" y="107" text-anchor="middle" font-size="7" fill="#999" stroke="none">大耳朵杯</text></svg>';

// 世界杯奖杯
FIGURES[5] = '<svg viewBox="0 0 100 110" fill="none" stroke="#555" stroke-width="1.2" stroke-linecap="round"><path d="M40 15 Q50 5 60 15"/><path d="M40 15 L38 55 Q50 70 62 55 L60 15"/><path d="M38 30 C25 28 20 40 30 48 C34 50 38 48 38 45"/><path d="M62 30 C75 28 80 40 70 48 C66 50 62 48 62 45"/><line x1="50" y1="68" x2="50" y2="78"/><ellipse cx="50" cy="80" rx="4" ry="2"/><rect x="38" y="82" width="24" height="5" rx="2"/><circle cx="50" cy="40" r="6" fill="none" stroke-dasharray="2 1.5"/><text x="50" y="100" text-anchor="middle" font-size="7" fill="#999" stroke="none">大力神杯</text></svg>';

// 4-3-3 阵型
FIGURES[15] = '<svg viewBox="0 0 140 110" fill="none" stroke="#555" stroke-width="1.2"><rect x="5" y="5" width="130" height="100" rx="2"/><line x1="70" y1="5" x2="70" y2="105" stroke-dasharray="3 2"/><circle cx="70" cy="55" r="12" fill="none" stroke-dasharray="3 2"/><text x="35" y="100" text-anchor="middle" font-size="7" fill="#999" stroke="none">4-3-3</text><text x="105" y="100" text-anchor="middle" font-size="7" fill="#999" stroke="none">4-2-3-1</text><circle cx="20" cy="85" r="4" fill="#ddd" stroke="#333"/><circle cx="30" cy="70" r="4" fill="#ddd" stroke="#333"/><circle cx="30" cy="40" r="4" fill="#ddd" stroke="#333"/><circle cx="20" cy="25" r="4" fill="#ddd" stroke="#333"/><circle cx="42" cy="40" r="4" fill="#ddd" stroke="#333"/><circle cx="42" cy="55" r="4" fill="#ddd" stroke="#333"/><circle cx="42" cy="70" r="4" fill="#ddd" stroke="#333"/><circle cx="58" cy="30" r="4" fill="#ddd" stroke="#333"/><circle cx="58" cy="55" r="4" fill="#ddd" stroke="#333"/><circle cx="58" cy="80" r="4" fill="#ddd" stroke="#333"/><circle cx="85" cy="85" r="4" fill="#b3d4fc" stroke="#06c"/><circle cx="95" cy="70" r="4" fill="#b3d4fc" stroke="#06c"/><circle cx="95" cy="40" r="4" fill="#b3d4fc" stroke="#06c"/><circle cx="85" cy="25" r="4" fill="#b3d4fc" stroke="#06c"/><circle cx="107" cy="65" r="4" fill="#b3d4fc" stroke="#06c"/><circle cx="107" cy="45" r="4" fill="#b3d4fc" stroke="#06c"/><circle cx="120" cy="30" r="4" fill="#b3d4fc" stroke="#06c"/><circle cx="120" cy="55" r="4" fill="#b3d4fc" stroke="#06c"/><circle cx="120" cy="80" r="4" fill="#b3d4fc" stroke="#06c"/><circle cx="130" cy="55" r="4" fill="#b3d4fc" stroke="#06c"/></svg>';

// 足球构造 — 五边形+六边形
FIGURES[17] = '<svg viewBox="0 0 120 120" fill="none" stroke="#555" stroke-width="1"><circle cx="60" cy="60" r="45"/><polygon points="60,25 72,38 68,53 52,53 48,38" fill="#ddd" stroke="#333" stroke-width="1.2"/><polygon points="72,38 88,38 90,53 78,60 68,53" fill="none"/><polygon points="48,38 32,38 30,53 42,60 52,53" fill="none"/><polygon points="68,53 78,60 75,77 60,82 45,77 42,60 52,53" fill="none"/><polygon points="75,77 90,77 95,62 90,53 78,60" fill="none"/><polygon points="45,77 30,77 25,62 30,53 42,60" fill="none"/><polygon points="60,82 75,77 72,92 60,98 48,92 45,77" fill="#ddd" stroke="#333" stroke-width="1.2"/><text x="60" y="115" text-anchor="middle" font-size="7" fill="#999" stroke="none">经典32块拼接</text></svg>';

// 红牌
FIGURES[18] = '<svg viewBox="0 0 100 100" fill="none" stroke="#555" stroke-width="1.2" stroke-linecap="round"><rect x="28" y="15" width="44" height="62" rx="4" fill="#fdd" stroke="#c00" stroke-width="2"/><text x="50" y="52" text-anchor="middle" font-size="28" fill="#c00" stroke="none" font-weight="bold">!</text><circle cx="50" cy="30" r="3" fill="#c00" stroke="none"/><text x="50" y="90" text-anchor="middle" font-size="8" fill="#999" stroke="none">红牌</text></svg>';

var QUESTIONS = [
  // ── 规则题 ──
  {
    category: 'rules',
    tag: '规则达人',
    text: 'VAR介入后，主裁判必须亲自去场边看回放吗？',
    figure: 0,
    options: [
      { text: '必须亲自看', correct: false },
      { text: '不一定，可以直接采纳VAR建议', correct: true },
      { text: '只有红牌才需要亲自看', correct: false }
    ]
  },
  {
    category: 'rules',
    tag: '规则达人',
    text: '点球大战中，守门员扑点时双脚必须在门线上吗？',
    figure: 1,
    options: [
      { text: '双脚都必须在线上', correct: false },
      { text: '至少一只脚触线即可', correct: true },
      { text: '没有限制，可以随意站位', correct: false }
    ]
  },
  {
    category: 'rules',
    tag: '规则达人',
    text: '越位判罚中，以下哪个身体部位不算越位？',
    figure: 2,
    options: [
      { text: '手臂', correct: true },
      { text: '头', correct: false },
      { text: '膝盖', correct: false }
    ]
  },
  {
    category: 'rules',
    tag: '规则达人',
    text: '一场比赛中，一支球队最多可以换几个人？（常规90分钟，现行规则）',
    figure: 3,
    options: [
      { text: '3人', correct: false },
      { text: '5人', correct: true },
      { text: '4人', correct: false }
    ]
  },
  // ── 历史题 ──
  {
    category: 'history',
    tag: '足球历史',
    text: '哪支球队是第一支成功卫冕欧冠冠军的球队？',
    figure: 4,
    options: [
      { text: 'AC米兰', correct: false },
      { text: '皇家马德里', correct: true },
      { text: '巴塞罗那', correct: false }
    ]
  },
  {
    category: 'history',
    tag: '足球历史',
    text: '世界杯历史上，哪个国家夺冠次数最多？',
    figure: 5,
    options: [
      { text: '德国', correct: false },
      { text: '意大利', correct: false },
      { text: '巴西', correct: true }
    ]
  },
  {
    category: 'history',
    tag: '足球历史',
    text: '"伊斯坦布尔奇迹"发生在哪一年的欧冠决赛？',
    options: [
      { text: '2003年', correct: false },
      { text: '2005年', correct: true },
      { text: '2007年', correct: false }
    ]
  },
  {
    category: 'history',
    tag: '足球历史',
    text: '中国男足唯一一次打进世界杯决赛圈是哪一届？',
    options: [
      { text: '1998年法国', correct: false },
      { text: '2002年韩日', correct: true },
      { text: '2006年德国', correct: false }
    ]
  },
  // ── 数据题 ──
  {
    category: 'data',
    tag: '数据控',
    text: '梅西职业生涯一共获得过几次金球奖？',
    options: [
      { text: '7次', correct: false },
      { text: '8次', correct: true },
      { text: '6次', correct: false }
    ]
  },
  {
    category: 'data',
    tag: '数据控',
    text: 'C罗职业生涯俱乐部+国家队总进球数大约是多少？',
    options: [
      { text: '约700球', correct: false },
      { text: '约900球', correct: true },
      { text: '约600球', correct: false }
    ]
  },
  {
    category: 'data',
    tag: '数据控',
    text: '英超单赛季进球纪录（38轮制）是多少球？',
    options: [
      { text: '31球', correct: false },
      { text: '34球', correct: false },
      { text: '32球（萨拉赫）', correct: true }
    ]
  },
  {
    category: 'data',
    tag: '数据控',
    text: '世界杯单届进球纪录保持者是谁？',
    options: [
      { text: '盖德·穆勒', correct: false },
      { text: '朱斯特·方丹', correct: true },
      { text: '罗纳尔多', correct: false }
    ]
  },
  // ── 战术题 ──
  {
    category: 'tactics',
    tag: '战术大师',
    text: '"Tiki-Taka"传控战术最具代表性的球队是？',
    options: [
      { text: '皇家马德里', correct: false },
      { text: '巴塞罗那', correct: true },
      { text: '拜仁慕尼黑', correct: false }
    ]
  },
  {
    category: 'tactics',
    tag: '战术大师',
    text: '"catenaccio"（链式防守）起源于哪个国家？',
    options: [
      { text: '德国', correct: false },
      { text: '意大利', correct: true },
      { text: '阿根廷', correct: false }
    ]
  },
  {
    category: 'tactics',
    tag: '战术大师',
    text: '"False 9"（伪九号）战术中，中锋的主要职责是？',
    options: [
      { text: '站桩抢点', correct: false },
      { text: '回撤拿球，为两翼创造空间', correct: true },
      { text: '盯防对方后腰', correct: false }
    ]
  },
  {
    category: 'tactics',
    tag: '战术大师',
    text: '4-3-3和4-2-3-1阵型的核心区别在于？',
    figure: 15,
    options: [
      { text: '后卫人数不同', correct: false },
      { text: '中场结构不同，后者多一个前腰', correct: true },
      { text: '前锋人数不同', correct: false }
    ]
  },
  // ── 冷知识 ──
  {
    category: 'trivia',
    tag: '冷知识王',
    text: '梅西职业生涯一共吃过几张红牌？',
    options: [
      { text: '0张', correct: false },
      { text: '3张', correct: true },
      { text: '1张', correct: false }
    ]
  },
  {
    category: 'trivia',
    tag: '冷知识王',
    text: '足球比赛用球标准有多少块皮组成？（经典款）',
    figure: 17,
    options: [
      { text: '32块', correct: true },
      { text: '24块', correct: false },
      { text: '28块', correct: false }
    ]
  },
  {
    category: 'trivia',
    tag: '冷知识王',
    text: '世界杯历史上最快的红牌出现在开场多久？',
    figure: 18,
    options: [
      { text: '56秒', correct: true },
      { text: '2分钟', correct: false },
      { text: '30秒', correct: false }
    ]
  },
  {
    category: 'trivia',
    tag: '冷知识王',
    text: '哪位球员被称为"外星人"？',
    options: [
      { text: '齐达内', correct: false },
      { text: '罗纳尔多（大罗）', correct: true },
      { text: '罗纳尔迪尼奥', correct: false }
    ]
  }
];

var CATEGORIES = {
  rules:   { name: '规则认知', label: '规则' },
  history: { name: '历史知识', label: '历史' },
  data:    { name: '数据记忆', label: '数据' },
  tactics: { name: '战术理解', label: '战术' },
  trivia:  { name: '冷知识储备', label: '冷知识' }
};

var CATEGORY_KEYS = ['rules', 'history', 'data', 'tactics', 'trivia'];
