const fs = require('fs').promises;
const path = require('path');

// Stronger, unified memory tip generator
function generateStrongTips(word, meaning, pos) {
  const w = (word || '').toLowerCase();
  const out = [];

  // 1) Root-based cue
  const roots = {
    bio: '生命', geo: '地球', hydro: '水', aero: '空气/飞', astro: '星',
    photo: '光', thermo: '热', chrono: '时间', tele: '远', micro: '小', macro: '大',
    auto: '自己', graph: '写/画', scrib: '写', spect: '看', vis: '看', vid: '看',
    aud: '听', phon: '声音', port: '携带/运输', form: '形状', struct: '建造',
    tract: '拉/拖', mit: '送/发', ped: '脚/儿童', manu: '手', cred: '信任',
    dict: '说', log: '话语/学科', jur: '法律', eco: '环境/经济', soci: '社会'
  };
  for (const [r, zh] of Object.entries(roots)) {
    if (w.includes(r)) { out.push(`【词根】含“${r}(${zh})”，联想到“${meaning}”`); break; }
  }

  // 2) Prefix/Suffix cues
  const prefixes = { un:'否定', dis:'相反/否定', in:'否定/向内', im:'否定', re:'再/回', pre:'前', post:'后', sub:'下', super:'上/超', inter:'在…之间', trans:'穿过/转变', over:'过度', under:'不足' };
  for (const [p, zh] of Object.entries(prefixes)) {
    if (w.startsWith(p) && w.length > p.length + 2) { out.push(`【前缀】${p}-（${zh}）+ ${word.slice(p.length)}`); break; }
  }
  const suffixes = { tion:'名词：动作/状态', sion:'名词：动作/状态', ment:'名词：结果', ness:'名词：性质', ity:'名词：性质', able:'形容词：能够', ible:'形容词：能够', ous:'形容词：具有…性质', ful:'形容词：充满', less:'形容词：没有', ize:'动词：使…化', ify:'动词：使…化', ly:'副词', al:'形容词：…的' };
  for (const [s, zh] of Object.entries(suffixes)) {
    if (w.endsWith(s) && w.length > s.length + 2) { out.push(`【后缀】${word.slice(0, -s.length)} + ${s}（${zh}）`); break; }
  }

  // 3) Association + imagery
  const assoc = `【联想】在“${meaning}”的典型场景中频繁造句，用“${word}”描述关键动作/特征`;
  const imagery = `【图像】脑海中构建一个与“${meaning}”强相关的画面，并反复配音念出“${word}”`;
  out.push(assoc, imagery);

  // 4) Split by simple vowel-led chunks for pronunciation-orthography link
  const chunks = word.split(/(?=[AEIOUaeiou])/);
  if (chunks.length >= 2) out.push(`【拆分】${chunks.join('·')} → 逐段拼读+拼写，朗读3遍固化肌肉记忆`);

  // De-duplicate and keep top 3
  return Array.from(new Set(out)).slice(0, 3).join('；');
}

async function processChapter(filePath) {
  const raw = await fs.readFile(filePath, 'utf8');
  const data = JSON.parse(raw);
  let changed = 0;
  for (const item of data.words) {
    const newTips = generateStrongTips(item.word || '', item.meaning || '', item.pos || '');
    if (item.tips !== newTips) { item.tips = newTips; changed++; }
  }
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
  return { chapter: data.chapter, changed, total: data.words.length };
}

async function main() {
  const dir = path.join(__dirname, 'json_chapters');
  const files = (await fs.readdir(dir)).filter(f => f.endsWith('.json') && f !== 'index.json');
  console.log(`📂 Rewriting tips for ${files.length} chapters...`);
  let totalChanged = 0, totalWords = 0;
  for (const f of files) {
    const r = await processChapter(path.join(dir, f));
    totalChanged += r.changed; totalWords += r.total;
    console.log(`  ✅ ${r.chapter}: ${r.changed}/${r.total} tips updated`);
  }
  console.log(`\nSUMMARY: Updated ${totalChanged}/${totalWords} tips`);
}

main().catch(err => { console.error(err); process.exit(1); });

