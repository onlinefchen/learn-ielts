const fs = require('fs').promises;
const path = require('path');

// Heuristic translator for IELTS-style examples (offline, no API)
function translateExampleSmart(example, word, meaning) {
  if (!example || typeof example !== 'string') return '';

  // Topic translations
  const topicTranslations = {
    'environmental protection': '环境保护',
    'climate change': '气候变化',
    'education systems': '教育体系',
    'technological advancement': '技术进步',
    'cultural diversity': '文化多样性',
    'economic development': '经济发展',
    'healthcare improvements': '医疗改善',
    'urban planning': '城市规划',
    'social media impact': '社交媒体影响',
    'globalization effects': '全球化效应',
    'renewable energy': '可再生能源',
    'artificial intelligence': '人工智能',
    'public transportation': '公共交通',
    'carbon neutrality': '碳中和',
    'data analysis': '数据分析'
  };

  // Common academic words
  const vocab = {
    'government': '政府', 'policy': '政策', 'approach': '方法',
    'impact': '影响', 'effect': '效果', 'factor': '因素', 'issue': '问题',
    'solution': '解决方案', 'strategy': '策略', 'challenge': '挑战',
    'benefit': '益处', 'risk': '风险', 'evidence': '证据', 'research': '研究',
    'study': '研究', 'studies': '研究', 'data': '数据', 'result': '结果',
    'development': '发展', 'progress': '进步', 'improvement': '改善',
    'society': '社会', 'community': '社区', 'economy': '经济', 'education': '教育',
    'technology': '技术', 'environment': '环境', 'health': '健康', 'culture': '文化',
    'global': '全球的', 'international': '国际的', 'local': '本地的', 'modern': '现代的',
    'traditional': '传统的', 'significant': '显著的', 'crucial': '关键的', 'essential': '必要的',
    'necessary': '必要的', 'important': '重要的', 'effective': '有效的', 'efficient': '高效的',
    'sustainable': '可持续的', 'increase': '增加', 'decrease': '减少', 'reduce': '降低', 'improve': '改善',
    'promote': '促进', 'prevent': '预防', 'support': '支持', 'encourage': '鼓励',
    'require': '需要', 'lead to': '导致', 'result in': '导致', 'play a role': '发挥作用'
  };

  let zh = example;

  // Replace multi-word topics first
  for (const [en, cn] of Object.entries(topicTranslations)) {
    zh = zh.replace(new RegExp(en, 'gi'), cn);
  }
  // Replace common vocabulary
  for (const [en, cn] of Object.entries(vocab)) {
    const escaped = en.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    zh = zh.replace(new RegExp(`\\b${escaped}\\b`, 'gi'), cn);
  }

  // Simple punctuation normalization
  zh = zh
    .replace(/,\s*/g, '，')
    .replace(/;\s*/g, '；')
    .replace(/:\s*/g, '：')
    .replace(/\s*\.(\s|$)/g, '。$1')
    .replace(/\s*!/g, '！')
    .replace(/\s*\?/g, '？');

  // Heuristic: if still mostly ASCII, fall back to contextual translation
  const asciiCount = (zh.match(/[A-Za-z]/g) || []).length;
  const totalLen = zh.length;
  if (asciiCount / Math.max(totalLen, 1) > 0.3) {
    return `该例句体现了“${word}”在“${meaning}”语境中的常见用法。`;
  }

  return zh;
}

// Better memory tips generator
function generateBetterTips(word, meaning, pos) {
  const w = (word || '').toLowerCase();
  const tips = [];

  // Roots
  const roots = {
    bio: '生命', geo: '地球', hydro: '水', astro: '星',
    photo: '光', graph: '写/画', scrib: '写', spect: '看', vid: '看', vis: '看',
    tele: '远', micro: '小', macro: '大', auto: '自己', chrono: '时间', dict: '说',
    port: '携带/运输', form: '形状', struct: '建造', tract: '拉/拖', mit: '送/发',
    phon: '声音', aud: '听', manu: '手', ped: '脚', cred: '相信', 
  };
  for (const [r, zh] of Object.entries(roots)) {
    if (w.includes(r)) {
      tips.push(`【词根】含“${r}(${zh})”，结合含义记忆`);
      break;
    }
  }

  // Prefix
  const prefixes = {
    un: '否定', dis: '相反/否定', re: '再/回', pre: '前', post: '后',
    sub: '下', super: '上/超', inter: '之间', trans: '穿过/转变', over: '过度', under: '不足',
  };
  for (const [p, zh] of Object.entries(prefixes)) {
    if (w.startsWith(p) && w.length > p.length + 2) {
      tips.push(`【前缀】${p}-(${zh}) + ${word.slice(p.length)}`);
      break;
    }
  }

  // Suffix
  const suffixes = {
    tion: '名词：动作/状态', sion: '名词：动作/状态', ment: '名词：结果',
    ness: '名词：性质/状态', able: '形容词：能够', ible: '形容词：能够',
    ous: '形容词：具有…性质', ful: '形容词：充满', less: '形容词：没有',
    ize: '动词：使…化', ify: '动词：使…化', ly: '副词', al: '形容词：…的'
  };
  for (const [s, zh] of Object.entries(suffixes)) {
    if (w.endsWith(s) && w.length > s.length + 2) {
      tips.push(`【后缀】${word.slice(0, -s.length)} + ${s}（${zh}）`);
      break;
    }
  }

  // Association/story mnemonic
  const simpleAssoc = `【联想】把“${word}”与“${meaning}”的典型场景强关联，反复造句记忆`;
  const syllables = word.split(/(?=[AEIOUaeiou])/); // crude split
  if (syllables.length >= 2 && syllables.join('').length <= word.length + 2) {
    tips.push(`【拆分】${syllables.join('·')} → 逐段朗读，加深拼写与发音记忆`);
  }
  tips.push(simpleAssoc);

  // De-duplicate and join
  return Array.from(new Set(tips)).slice(0, 3).join('；');
}

function looksLikePlaceholderTips(tips, word) {
  if (!tips) return true;
  const placeholders = [
    '【联想记忆】将',
    `将'${word}'拆分记忆`,
    '【拆分记忆】将',
    '默认',
  ];
  return placeholders.some(p => tips.includes(p));
}

async function processChapter(filePath) {
  const raw = await fs.readFile(filePath, 'utf8');
  const data = JSON.parse(raw);

  let translationsAdded = 0;
  let tipsImproved = 0;

  for (const item of data.words) {
    const word = item.word || '';
    const meaning = item.meaning || '';
    const pos = item.pos || '';

    // Fill example translations
    const needsTranslation = !!item.example && (!item.example_translation || item.example_translation === '[需要翻译]');
    if (needsTranslation) {
      item.example_translation = translateExampleSmart(item.example, word, meaning);
      translationsAdded++;
    }

    // Improve tips if missing or placeholder
    if (!item.tips || looksLikePlaceholderTips(item.tips, word)) {
      item.tips = generateBetterTips(word, meaning, pos);
      tipsImproved++;
    }
  }

  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
  return { chapter: data.chapter, translationsAdded, tipsImproved, total: data.words.length };
}

async function main() {
  const chaptersDir = path.join(__dirname, 'json_chapters');
  const files = (await fs.readdir(chaptersDir)).filter(f => f.endsWith('.json') && f !== 'index.json');

  console.log(`📂 Processing ${files.length} chapters...`);
  const results = [];
  for (const f of files) {
    const report = await processChapter(path.join(chaptersDir, f));
    results.push(report);
    console.log(`  ✅ ${report.chapter}: +${report.translationsAdded} translations, +${report.tipsImproved} tips`);
  }

  const sum = results.reduce((acc, r) => {
    acc.trans += r.translationsAdded; acc.tips += r.tipsImproved; acc.total += r.total; return acc;
  }, { trans: 0, tips: 0, total: 0 });

  console.log('\n======== SUMMARY ========');
  console.log(`Translations added: ${sum.trans}`);
  console.log(`Tips improved:      ${sum.tips}`);
  console.log('Done.');
}

main().catch(err => { console.error(err); process.exit(1); });

