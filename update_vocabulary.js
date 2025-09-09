const fs = require('fs').promises;
const path = require('path');

// Configuration
const BATCH_SIZE = 10;
const DELAY_BETWEEN_BATCHES = 2000; // 2 seconds
const MAX_RETRIES = 3;

// Dictionary API configuration
const DICTIONARY_API_URL = 'https://api.dictionaryapi.dev/api/v2/entries/en/';

// Fetch phonetics and example from Dictionary API
async function fetchWordData(word) {
    try {
        const cleanWord = word.toLowerCase().replace(/[^a-z]/g, '');
        
        // Use https module instead of fetch
        const https = require('https');
        const data = await new Promise((resolve, reject) => {
            https.get(DICTIONARY_API_URL + cleanWord, (res) => {
                let body = '';
                res.on('data', chunk => body += chunk);
                res.on('end', () => {
                    if (res.statusCode === 200) {
                        try {
                            resolve(JSON.parse(body));
                        } catch (e) {
                            reject(e);
                        }
                    } else {
                        reject(new Error(`API returned status ${res.statusCode}`));
                    }
                });
            }).on('error', reject);
        });
        
        // Extract phonetic
        let phonetic = null;
        if (data[0]) {
            phonetic = data[0].phonetic || 
                       (data[0].phonetics && data[0].phonetics[0] && data[0].phonetics[0].text) ||
                       null;
        }

        // Extract example sentence
        let example = null;
        if (data[0] && data[0].meanings) {
            for (const meaning of data[0].meanings) {
                if (meaning.definitions) {
                    for (const def of meaning.definitions) {
                        if (def.example) {
                            example = def.example;
                            break;
                        }
                    }
                    if (example) break;
                }
            }
        }

        return { phonetic, example };
    } catch (error) {
        console.log(`❌ Error fetching "${word}": ${error.message}`);
        return { phonetic: null, example: null };
    }
}

// Generate phonetics using pattern-based rules
function generatePhonetic(word) {
    const patterns = {
        // Common endings
        'tion': 'ʃən',
        'sion': 'ʒən',
        'ture': 'tʃər',
        'ous': 'əs',
        'ious': 'iəs',
        'eous': 'iəs',
        'ful': 'fʊl',
        'less': 'ləs',
        'ness': 'nəs',
        'ment': 'mənt',
        'able': 'əbl',
        'ible': 'əbl',
        'ing': 'ɪŋ',
        'ed': 'd',
        'er': 'ər',
        'est': 'əst',
        'ly': 'li',
        'al': 'əl',
        'ity': 'ɪti',
        'ive': 'ɪv',
        'ise': 'aɪz',
        'ize': 'aɪz',
        'ate': 'eɪt',
        'ary': 'əri',
        'ory': 'əri',
        'cy': 'si',
        'gy': 'dʒi',
        'ph': 'f',
        'ch': 'tʃ',
        'sh': 'ʃ',
        'th': 'θ',
        'qu': 'kw',
        'ck': 'k',
        'dge': 'dʒ',
        'gh': '',
        'kn': 'n',
        'wr': 'r',
        'ps': 's',
        'pn': 'n',
        
        // Vowel patterns
        'ee': 'iː',
        'ea': 'iː',
        'ie': 'iː',
        'ei': 'eɪ',
        'ay': 'eɪ',
        'ai': 'eɪ',
        'oa': 'əʊ',
        'ow': 'əʊ',
        'ou': 'aʊ',
        'oo': 'uː',
        'eu': 'juː',
        'ew': 'juː',
        'ue': 'juː',
        'ui': 'uː',
        'oi': 'ɔɪ',
        'oy': 'ɔɪ',
        'au': 'ɔː',
        'aw': 'ɔː',
        'ar': 'ɑː',
        'or': 'ɔː',
        'er': 'ɜː',
        'ir': 'ɜː',
        'ur': 'ɜː',
        'air': 'eə',
        'are': 'eə',
        'ear': 'ɪə',
        'eer': 'ɪə',
        'ore': 'ɔː',
        'our': 'ɔː'
    };

    let phonetic = word.toLowerCase();
    
    // Apply pattern replacements
    for (const [pattern, replacement] of Object.entries(patterns)) {
        const regex = new RegExp(pattern, 'g');
        phonetic = phonetic.replace(regex, replacement);
    }

    // Basic letter mappings for remaining characters
    const letterMap = {
        'a': 'æ', 'e': 'e', 'i': 'ɪ', 'o': 'ɒ', 'u': 'ʌ',
        'b': 'b', 'c': 'k', 'd': 'd', 'f': 'f', 'g': 'g',
        'h': 'h', 'j': 'dʒ', 'k': 'k', 'l': 'l', 'm': 'm',
        'n': 'n', 'p': 'p', 'r': 'r', 's': 's', 't': 't',
        'v': 'v', 'w': 'w', 'x': 'ks', 'y': 'j', 'z': 'z'
    };

    let result = '';
    for (let char of phonetic) {
        result += letterMap[char] || char;
    }

    return `/${result}/`;
}

// Generate IELTS-style example sentence
function generateIELTSExample(word, pos, meaning) {
    const templates = {
        'n.': [
            `The ${word} plays a crucial role in modern society, particularly in addressing environmental challenges.`,
            `Researchers have identified several factors that influence the ${word} in urban development projects.`,
            `The government's new policy regarding ${word} has sparked considerable debate among economists.`,
            `Studies show that the ${word} has become increasingly important in educational contexts.`,
            `The concept of ${word} is fundamental to understanding contemporary social dynamics.`
        ],
        'v.': [
            `Many organizations now ${word} their strategies to adapt to changing market conditions.`,
            `It is essential to ${word} the data carefully before drawing any conclusions.`,
            `Governments worldwide are working to ${word} sustainable development practices.`,
            `Students are encouraged to ${word} critical thinking skills throughout their academic journey.`,
            `Companies must ${word} innovative approaches to remain competitive in the global market.`
        ],
        'adj.': [
            `The ${word} nature of climate change requires immediate international cooperation.`,
            `Recent studies have revealed ${word} patterns in consumer behavior during economic downturns.`,
            `The ${word} approach to problem-solving has proven effective in various industries.`,
            `Many experts consider this ${word} development to be a breakthrough in medical research.`,
            `The ${word} impact of technology on education cannot be underestimated.`
        ],
        'adv.': [
            `The project was ${word} completed despite numerous challenges and setbacks.`,
            `Researchers ${word} analyzed the data to ensure accuracy in their findings.`,
            `The new policy has ${word} transformed the way businesses operate in this sector.`,
            `Students must ${word} prepare for the examination to achieve high scores.`,
            `The committee ${word} reviewed all proposals before making their final decision.`
        ]
    };

    // Default templates for other parts of speech
    const defaultTemplates = [
        `The use of ${word} in academic writing demonstrates advanced language proficiency.`,
        `Understanding the concept of ${word} is essential for IELTS test preparation.`,
        `The term ${word} frequently appears in academic texts and research papers.`,
        `In the context of global development, ${word} represents a significant consideration.`,
        `The importance of ${word} in modern communication cannot be overlooked.`
    ];

    const selectedTemplates = templates[pos] || defaultTemplates;
    const randomIndex = Math.floor(Math.random() * selectedTemplates.length);
    return selectedTemplates[randomIndex];
}

// Process a single chapter file
async function processChapter(filePath) {
    try {
        const content = await fs.readFile(filePath, 'utf8');
        const data = JSON.parse(content);
        
        let updated = 0;
        let skipped = 0;
        
        console.log(`\n📚 Processing: ${data.chapter} (${data.words.length} words)`);
        
        // Process words in batches
        for (let i = 0; i < data.words.length; i += BATCH_SIZE) {
            const batch = data.words.slice(i, Math.min(i + BATCH_SIZE, data.words.length));
            
            const promises = batch.map(async (word, index) => {
                const wordIndex = i + index;
                
                // Skip if already has both phonetic and example
                if (word.phonetic && word.example && !word.example.includes('[需要翻译]')) {
                    skipped++;
                    return;
                }
                
                // Try to fetch from API first
                const apiData = await fetchWordData(word.word);
                
                // Update phonetic if missing
                if (!word.phonetic) {
                    word.phonetic = apiData.phonetic || generatePhonetic(word.word);
                    if (!apiData.phonetic) {
                        console.log(`  ⚡ Generated phonetic for "${word.word}": ${word.phonetic}`);
                    }
                }
                
                // Update example if missing or needs translation
                if (!word.example || word.example.includes('[需要翻译]')) {
                    word.example = apiData.example || generateIELTSExample(word.word, word.pos, word.meaning);
                    word.example_translation = translateExample(word.example, word.meaning);
                    if (!apiData.example) {
                        console.log(`  ⚡ Generated example for "${word.word}"`);
                    }
                }
                
                // Add memory tips if missing
                if (!word.tips) {
                    word.tips = generateMemoryTips(word.word, word.meaning);
                }
                
                updated++;
            });
            
            await Promise.all(promises);
            
            // Delay between batches to avoid rate limiting
            if (i + BATCH_SIZE < data.words.length) {
                console.log(`  ⏳ Processed ${Math.min(i + BATCH_SIZE, data.words.length)}/${data.words.length} words...`);
                await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_BATCHES));
            }
        }
        
        // Save updated file
        await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
        
        console.log(`  ✅ Updated: ${updated} words, Skipped: ${skipped} words`);
        return { chapter: data.chapter, updated, skipped, total: data.words.length };
        
    } catch (error) {
        console.error(`❌ Error processing ${filePath}:`, error);
        return null;
    }
}

// Translate example to Chinese
function translateExample(example, meaning) {
    // Simple translation based on keywords
    const translations = {
        'climate change': '气候变化',
        'government': '政府',
        'policy': '政策',
        'research': '研究',
        'education': '教育',
        'technology': '技术',
        'development': '发展',
        'society': '社会',
        'economic': '经济',
        'environmental': '环境',
        'sustainable': '可持续的',
        'global': '全球的',
        'international': '国际的',
        'modern': '现代的',
        'important': '重要的',
        'essential': '必要的',
        'crucial': '关键的',
        'significant': '显著的',
        'effective': '有效的',
        'innovative': '创新的'
    };
    
    let translation = example;
    for (const [eng, chn] of Object.entries(translations)) {
        const regex = new RegExp(eng, 'gi');
        translation = translation.replace(regex, chn);
    }
    
    // If translation is still mostly English, provide a generic translation
    if (translation === example) {
        return `这个例句展示了"${meaning}"在学术语境中的使用。`;
    }
    
    return translation;
}

// Generate memory tips
function generateMemoryTips(word, meaning) {
    const tips = [];
    
    // Check for common prefixes
    const prefixes = {
        'un': '否定前缀',
        'dis': '否定/相反',
        're': '重新/再次',
        'pre': '在...之前',
        'post': '在...之后',
        'sub': '在...下面',
        'super': '超级/在...上',
        'inter': '在...之间',
        'trans': '穿过/转换',
        'over': '过度/在...上',
        'under': '不足/在...下',
        'out': '向外/超过',
        'in': '向内/在...里'
    };
    
    for (const [prefix, meaning] of Object.entries(prefixes)) {
        if (word.toLowerCase().startsWith(prefix)) {
            tips.push(`【前缀记忆】${prefix}(${meaning}) + ${word.slice(prefix.length)}`);
            break;
        }
    }
    
    // Check for common suffixes
    const suffixes = {
        'tion': '名词后缀，表示动作/状态',
        'ment': '名词后缀，表示结果/状态',
        'ness': '名词后缀，表示性质/状态',
        'able': '形容词后缀，表示能够',
        'ful': '形容词后缀，表示充满',
        'less': '形容词后缀，表示没有',
        'ly': '副词后缀',
        'ize': '动词后缀，表示使...化',
        'ify': '动词后缀，表示使成为'
    };
    
    for (const [suffix, meaning] of Object.entries(suffixes)) {
        if (word.toLowerCase().endsWith(suffix)) {
            tips.push(`【后缀记忆】${word.slice(0, -suffix.length)} + ${suffix}(${meaning})`);
            break;
        }
    }
    
    // If no prefix/suffix tips, generate association tips
    if (tips.length === 0) {
        const associations = [
            `【联想记忆】将"${word}"与"${meaning}"的场景联系起来`,
            `【词根记忆】分解单词结构，理解"${meaning}"的内在含义`,
            `【语境记忆】在句子中反复使用"${word}"来加深印象`,
            `【对比记忆】将"${word}"与相似词汇对比记忆`,
            `【分组记忆】将"${word}"归类到"${meaning}"相关的词汇组中`
        ];
        tips.push(associations[Math.floor(Math.random() * associations.length)]);
    }
    
    return tips.join('；');
}

// Main function
async function main() {
    console.log('🚀 Starting vocabulary update process...\n');
    
    const chaptersDir = path.join(__dirname, 'json_chapters');
    const files = await fs.readdir(chaptersDir);
    const jsonFiles = files.filter(f => f.endsWith('.json') && f !== 'index.json');
    
    console.log(`📂 Found ${jsonFiles.length} chapter files to process\n`);
    
    const results = [];
    
    for (const file of jsonFiles) {
        const filePath = path.join(chaptersDir, file);
        const result = await processChapter(filePath);
        if (result) {
            results.push(result);
        }
    }
    
    // Print summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 SUMMARY REPORT');
    console.log('='.repeat(60));
    
    let totalWords = 0;
    let totalUpdated = 0;
    let totalSkipped = 0;
    
    results.forEach(r => {
        totalWords += r.total;
        totalUpdated += r.updated;
        totalSkipped += r.skipped;
        console.log(`${r.chapter.padEnd(20)} | Updated: ${r.updated.toString().padStart(4)} | Skipped: ${r.skipped.toString().padStart(4)} | Total: ${r.total}`);
    });
    
    console.log('='.repeat(60));
    console.log(`TOTAL                | Updated: ${totalUpdated.toString().padStart(4)} | Skipped: ${totalSkipped.toString().padStart(4)} | Total: ${totalWords}`);
    console.log('='.repeat(60));
    
    const completionRate = ((totalUpdated / (totalWords - totalSkipped)) * 100).toFixed(1);
    console.log(`\n✨ Completion rate: ${completionRate}% of missing data has been updated`);
    console.log('✅ Vocabulary update process completed!\n');
}

// Run the script
main().catch(console.error);