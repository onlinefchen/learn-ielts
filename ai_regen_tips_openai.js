const fs = require('fs').promises;
const path = require('path');
const https = require('https');

const MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';
const API_KEY = process.env.OPENAI_API_KEY || '';
const CHAPTER_FILE = path.join(__dirname, 'json_chapters', '自然地理.json');

function callOpenAI(messages) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      model: MODEL,
      messages,
      temperature: 0.7,
    });

    const req = https.request({
      hostname: 'api.openai.com',
      path: '/v1/chat/completions',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Length': Buffer.byteLength(data)
      }
    }, res => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        if (res.statusCode !== 200) {
          return reject(new Error(`OpenAI ${res.statusCode}: ${body}`));
        }
        try {
          const json = JSON.parse(body);
          const text = json.choices?.[0]?.message?.content?.trim() || '';
          resolve(text);
        } catch (e) { reject(e); }
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

function buildMessages(word, pos, meaning, phonetic) {
  const sys = `你是英语词汇教练，帮中国学生记忆学术词汇。输出中文记忆技巧，2-3条，短句，每条尽量不超过28个汉字，使用标签如【词根】/【前缀】/【后缀】/【联想】/【图像】/【谐音】。围绕该词的核心含义与构词法，避免生僻字和长段解释。仅输出技巧本身，用中文分号连接，不要额外说明或标题。`;
  const content = `单词: ${word}\n词性: ${pos}\n释义: ${meaning}\n音标: ${phonetic || ''}\n请按要求生成记忆技巧。`;
  return [
    { role: 'system', content: sys },
    { role: 'user', content }
  ];
}

async function main() {
  if (!API_KEY) {
    console.error('❌ OPENAI_API_KEY 未设置，无法调用 OpenAI 接口');
    process.exit(2);
  }

  const raw = await fs.readFile(CHAPTER_FILE, 'utf8');
  const data = JSON.parse(raw);
  let updated = 0, failed = 0;

  // sequential to be gentle with rate limits
  for (let i = 0; i < data.words.length; i++) {
    const item = data.words[i];
    const messages = buildMessages(item.word, item.pos, item.meaning, item.phonetic);

    try {
      const tips = await callOpenAI(messages);
      if (tips && typeof tips === 'string') {
        item.tips = tips.replace(/\n+/g, ' ').trim();
        updated++;
      }
    } catch (e) {
      failed++;
      // keep previous tips on failure
      // minimal backoff
      await new Promise(r => setTimeout(r, 500));
    }

    if ((i + 1) % 25 === 0) {
      console.log(`  ⏳ processed ${i + 1}/${data.words.length} ...`);
      // tiny delay to avoid burst
      await new Promise(r => setTimeout(r, 200));
    }
  }

  await fs.writeFile(CHAPTER_FILE, JSON.stringify(data, null, 2), 'utf8');
  console.log(`✅ 自然地理 记忆技巧更新完成: 更新 ${updated} 条，失败 ${failed} 条 (已保留原有)`);
}

main().catch(err => { console.error(err); process.exit(1); });

