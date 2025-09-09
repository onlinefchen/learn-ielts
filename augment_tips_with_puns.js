const fs = require('fs').promises;
const path = require('path');

// Curated confusable pairs/triples with memorable distinctions
const CONFUSABLES = {
  affect: '【易混】affect(动词-影响) vs effect(名词-效果)：A→Action(动作)，E→End(结果)',
  effect: '【易混】effect(名词-效果) vs affect(动词-影响)：E→End(结果)，A→Action(动作)',
  adopt: '【易混】adopt(采纳/收养) vs adapt(适应)：o→收养他人，a→适应环境',
  adapt: '【易混】adapt(适应) vs adopt(采纳/收养)：a→适应环境，o→收养他人',
  accept: '【易混】accept(接受) vs except(除外)：ac→朝里接收，ex→向外除去',
  except: '【易混】except(除外) vs accept(接受)：ex→出去除掉，ac→朝里接收',
  desert: '【易混】desert(沙漠/抛弃) vs dessert(甜点)：甜点dessert有两勺糖→两个s',
  dessert: '【易混】dessert(甜点) vs desert(沙漠/抛弃)：甜点更“甜”→两个s像两勺糖',
  principle: '【易混】principle(原则) vs principal(校长/主要的)：-ple表示原则，-pal像pal(伙伴)→人',
  principal: '【易混】principal(校长/主要的) vs principle(原则)：-pal像pal(伙伴)→人',
  personal: '【易混】personal(个人的) vs personnel(全体员工)：nel→很多人',
  personnel: '【易混】personnel(全体员工) vs personal(个人的)：nel→很多人(多人)',
  loose: '【易混】loose(宽松的) vs lose(失去)：loose有两个o→衣服“宽宽”的',
  lose: '【易混】lose(失去) vs loose(宽松的)：只有一个o→掉了一个o(失去)',
  quiet: '【易混】quiet(安静的) vs quite(相当)：quiet含字母e→e耳朵需要安静',
  quite: '【易混】quite(相当) vs quiet(安静的)：quite少了e→不关于“耳朵”',
  than: '【易混】than(比) vs then(然后)：a→比较/答题先后判断',
  then: '【易混】then(然后) vs than(比)：e→时间线then',
  their: '【易混】their(他们的) vs there(那里) vs they\'re(他们是)：ir→属于他们的',
  there: '【易混】there(那里) vs their(他们的) vs they\'re(他们是)：here在there里→地点',
  "they're": '【易混】they\'re=they are(他们是)；与their/there区分：有撇号表示动词be',
  whether: '【易混】whether(是否) vs weather(天气)：h→是否抉择(脑中有问号)',
  weather: '【易混】weather(天气) vs whether(是否)：ea→天空风云weather',
  later: '【易混】later(更晚) vs latter(后者)：t字母单/双—latter双t对应“两者中的后者”',
  latter: '【易混】latter(后者) vs later(更晚)：双t→两者中的“后”一个',
  economic: '【易混】economic(经济的) vs economical(节约的)：-al→注重“省钱”的',
  economical: '【易混】economical(节约的) vs economic(经济的)：-al→节省/经济实惠',
  historic: '【易混】historic(历史性的) vs historical(历史的)：-ic→具有“历史性意义”的事件',
  historical: '【易混】historical(历史的) vs historic(历史性的)：-ical→与历史相关的',
  classic: '【易混】classic(经典的) vs classical(古典的)：-al→古典流派',
  classical: '【易混】classical(古典的) vs classic(经典的)：-al→古典风格',
  compliment: '【易混】compliment(赞美) vs complement(补充)：i→夸你我，e→补全(complete同源)',
  complement: '【易混】complement(补充) vs compliment(赞美)：e→补全(complete同源)',
  imply: '【易混】imply(暗示) vs infer(推断)：说话者imply，听者infer',
  infer: '【易混】infer(推断) vs imply(暗示)：听者infer，说者imply',
  ensure: '【易混】ensure(确保) vs insure(保险) vs assure(使安心)：en-确保，in-保险，as-安慰',
  assure: '【易混】assure(使安心) vs ensure(确保) vs insure(保险)：as-安心',
  insure: '【易混】insure(保险) vs ensure/assure：in-保险业务',
  fewer: '【易混】fewer(可数更少) vs less(不可数更少)：fewer-可数，less-不可数',
  less: '【易混】less(不可数更少) vs fewer(可数更少)：less-不可数',
  farther: '【易混】farther(物理更远) vs further(程度更深/推进)：far-距离，fur-深入',
  further: '【易混】further(程度更深/推进) vs farther(物理更远)：fur-深入',
  borrow: '【易混】borrow(借入) vs lend(借出)：我borrow from，别人lend to',
  lend: '【易混】lend(借出) vs borrow(借入)：lend to，borrow from',
  emigrate: '【易混】emigrate(移出) vs immigrate(移入) vs migrate(迁移)：e(出)→出国，im(入)→入境',
  immigrate: '【易混】immigrate(移入) vs emigrate(移出)：im(入)→入境',
  migrate: '【易混】migrate(迁移) vs emigrate/immigrate：泛指迁徙',
  beside: '【易混】beside(在旁边) vs besides(此外)：s→多一个s表示“此外”',
  besides: '【易混】besides(此外) vs beside(在旁边)：多一个s→额外、另外',
  practice: '【易混】practice(名词) vs practise(动词，英式)：c→名词，s→动词',
  licence: '【易混】licence(名词，英式) vs license(动词/美式名词)：c→名词',
  license: '【易混】license(动词/美式名词) vs licence(名词，英式)：s→动词/美词',
  stationary: '【易混】stationary(静止的) vs stationery(文具)：ery→文具里有envelope(e)',
  stationery: '【易混】stationery(文具) vs stationary(静止的)：-ery→文具',
  aisle: '【易混】aisle(过道) vs isle(小岛)：a像走道拱门',
  isle: '【易混】isle(小岛) vs aisle(过道)：i小岛更“单薄”'
};

// High-frequency IELTS words (subset present across chapters)
const HIGH_FREQ = new Set([
  'increase','decrease','reduce','improve','promote','prevent','support','encourage',
  'require','affect','effect','benefit','risk','challenge','strategy','policy',
  'education','student','teacher','research','evidence','result','method','process',
  'technology','environment','sustainable','development','economic','economical',
  'global','international','local','modern','traditional','significant','essential',
  'efficient','effective','health','culture','society','social'
]);

// Add pun/rhythm style line for HF words
function buildPunLine(word, phonetic, meaning) {
  const ipa = phonetic ? `按音标${phonetic}分节朗读` : '按重音节奏分段朗读';
  return `【谐音/押韵】${ipa}，自拟中文谐音词组并代入“${meaning}”场景造句×3`;
}

function shouldAppend(line, tips) {
  return tips && !tips.includes('【谐音') && !tips.includes('【押韵') && !tips.includes('【易混】');
}

async function processChapter(filePath) {
  const raw = await fs.readFile(filePath, 'utf8');
  const data = JSON.parse(raw);
  let updated = 0;

  for (const item of data.words) {
    const w = (item.word || '').toLowerCase();
    let tips = item.tips || '';

    // Confusable hint
    if (CONFUSABLES[w] && !tips.includes('【易混】')) {
      tips = tips ? `${tips}；${CONFUSABLES[w]}` : CONFUSABLES[w];
      updated++;
    }

    // Pun/rhyme augmentation for high-frequency words
    if (HIGH_FREQ.has(w) && shouldAppend('pun', tips)) {
      const pun = buildPunLine(item.word, item.phonetic, item.meaning);
      tips = tips ? `${tips}；${pun}` : pun;
      updated++;
    }

    item.tips = tips;
  }

  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
  return { chapter: data.chapter, updated };
}

async function main() {
  const dir = path.join(__dirname, 'json_chapters');
  const files = (await fs.readdir(dir)).filter(f => f.endsWith('.json') && f !== 'index.json');
  console.log(`📂 Augmenting tips for ${files.length} chapters...`);
  let total = 0;
  for (const f of files) {
    const r = await processChapter(path.join(dir, f));
    total += r.updated;
    console.log(`  ✅ ${r.chapter}: +${r.updated}`);
  }
  console.log(`\nSUMMARY: Tips augmented (added lines): ${total}`);
}

main().catch(e => { console.error(e); process.exit(1); });

