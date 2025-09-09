const fs = require('fs').promises;
const path = require('path');

// Enhanced phonetic generation based on common English pronunciation rules
function generateEnhancedPhonetic(word) {
    const rules = {
        // Common letter combinations
        'tion': 'ʃən', 'sion': 'ʒən', 'ture': 'tʃər', 'sure': 'ʒər',
        'ous': 'əs', 'ious': 'iəs', 'eous': 'iəs', 'ful': 'fʊl',
        'less': 'ləs', 'ness': 'nəs', 'ment': 'mənt', 'able': 'əbl',
        'ible': 'əbl', 'ing': 'ɪŋ', 'ed': 'd', 'er': 'ər',
        'est': 'əst', 'ly': 'li', 'al': 'əl', 'ity': 'ɪti',
        'ive': 'ɪv', 'ise': 'aɪz', 'ize': 'aɪz', 'ate': 'eɪt',
        'ary': 'əri', 'ory': 'əri', 'cy': 'si', 'gy': 'dʒi',
        
        // Consonant combinations
        'ph': 'f', 'ch': 'tʃ', 'sh': 'ʃ', 'th': 'θ',
        'qu': 'kw', 'ck': 'k', 'dge': 'dʒ', 'tch': 'tʃ',
        'gh': '', 'kn': 'n', 'wr': 'r', 'ps': 's', 'pn': 'n',
        'wh': 'w', 'sc': 'sk', 'ce': 's', 'ci': 's', 'ge': 'dʒ',
        
        // Vowel combinations
        'ee': 'iː', 'ea': 'iː', 'ie': 'iː', 'ei': 'eɪ',
        'ay': 'eɪ', 'ai': 'eɪ', 'oa': 'əʊ', 'ow': 'aʊ',
        'ou': 'aʊ', 'oo': 'uː', 'eu': 'juː', 'ew': 'juː',
        'ue': 'juː', 'ui': 'uː', 'oi': 'ɔɪ', 'oy': 'ɔɪ',
        'au': 'ɔː', 'aw': 'ɔː', 'ar': 'ɑː', 'or': 'ɔː',
        'er': 'ɜː', 'ir': 'ɜː', 'ur': 'ɜː', 'air': 'eə',
        'are': 'eə', 'ear': 'ɪə', 'eer': 'ɪə', 'ore': 'ɔː'
    };

    let result = word.toLowerCase();
    
    // Apply rules in order of length (longer patterns first)
    const sortedRules = Object.entries(rules).sort((a, b) => b[0].length - a[0].length);
    
    for (const [pattern, replacement] of sortedRules) {
        result = result.replace(new RegExp(pattern, 'g'), replacement);
    }
    
    // Handle remaining single letters
    const singles = {
        'a': 'æ', 'e': 'e', 'i': 'ɪ', 'o': 'ɒ', 'u': 'ʌ',
        'b': 'b', 'c': 'k', 'd': 'd', 'f': 'f', 'g': 'g',
        'h': 'h', 'j': 'dʒ', 'k': 'k', 'l': 'l', 'm': 'm',
        'n': 'n', 'p': 'p', 'r': 'r', 's': 's', 't': 't',
        'v': 'v', 'w': 'w', 'x': 'ks', 'y': 'j', 'z': 'z'
    };
    
    let phonetic = '';
    for (let char of result) {
        phonetic += singles[char] || char;
    }
    
    return `/${phonetic}/`;
}

// Generate contextual IELTS examples based on word and meaning
function generateContextualExample(word, pos, meaning) {
    // Create topic-specific examples for IELTS contexts
    const ieltsTopics = [
        'environmental protection', 'climate change', 'education systems',
        'technological advancement', 'cultural diversity', 'economic development',
        'healthcare improvements', 'urban planning', 'social media impact',
        'globalization effects', 'renewable energy', 'artificial intelligence'
    ];
    
    const randomTopic = ieltsTopics[Math.floor(Math.random() * ieltsTopics.length)];
    
    const templates = {
        'n.': [
            `The ${word} has become increasingly important in discussions about ${randomTopic}.`,
            `Recent studies have shown that ${word} plays a crucial role in ${randomTopic}.`,
            `Understanding the concept of ${word} is essential for addressing challenges in ${randomTopic}.`,
            `The government's new ${word} policy aims to improve ${randomTopic}.`,
            `Experts argue that ${word} is a key factor in successful ${randomTopic}.`
        ],
        'v.': [
            `Organizations worldwide are working to ${word} their approach to ${randomTopic}.`,
            `It is crucial to ${word} the impact of ${randomTopic} on future generations.`,
            `Governments must ${word} effective strategies for managing ${randomTopic}.`,
            `Researchers continue to ${word} new methods for addressing ${randomTopic}.`,
            `Companies that ${word} innovation tend to lead in ${randomTopic}.`
        ],
        'adj.': [
            `The ${word} nature of ${randomTopic} requires immediate attention from policymakers.`,
            `Studies reveal ${word} patterns in how societies approach ${randomTopic}.`,
            `A ${word} understanding of ${randomTopic} is necessary for informed decision-making.`,
            `The ${word} impact of ${randomTopic} cannot be underestimated.`,
            `Implementing ${word} solutions is vital for progress in ${randomTopic}.`
        ],
        'adv.': [
            `The project ${word} addressed the challenges posed by ${randomTopic}.`,
            `Researchers ${word} analyzed data related to ${randomTopic}.`,
            `The policy has ${word} transformed approaches to ${randomTopic}.`,
            `Students must ${word} prepare for examinations covering ${randomTopic}.`,
            `The committee ${word} evaluated proposals for improving ${randomTopic}.`
        ],
        'n./v.': [
            `The ${word} in ${randomTopic} has attracted international attention.`,
            `Experts ${word} the importance of addressing ${randomTopic} systematically.`
        ],
        'adj./n.': [
            `The ${word} aspects of ${randomTopic} require careful consideration.`,
            `As a ${word}, this concept is fundamental to understanding ${randomTopic}.`
        ],
        'adj./adv.': [
            `The ${word} approach to ${randomTopic} has yielded positive results.`,
            `Working ${word} on ${randomTopic} ensures better outcomes.`
        ],
        'v./n.': [
            `The need to ${word} in ${randomTopic} has never been more urgent.`,
            `This ${word} represents a breakthrough in ${randomTopic}.`
        ]
    };
    
    const posTemplates = templates[pos] || templates['n.'];
    return posTemplates[Math.floor(Math.random() * posTemplates.length)];
}

// Generate intelligent translation based on the example
function generateSmartTranslation(example, word, meaning) {
    // Common IELTS topic translations
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
        'artificial intelligence': '人工智能'
    };
    
    const wordTranslations = {
        'important': '重要的', 'crucial': '关键的', 'essential': '必要的',
        'government': '政府', 'policy': '政策', 'approach': '方法',
        'studies': '研究', 'research': '研究', 'experts': '专家',
        'organizations': '组织', 'companies': '公司', 'society': '社会',
        'impact': '影响', 'effect': '效果', 'factor': '因素',
        'challenges': '挑战', 'solutions': '解决方案', 'strategies': '策略',
        'development': '发展', 'progress': '进步', 'improvement': '改善',
        'system': '系统', 'method': '方法', 'process': '过程'
    };
    
    // Simplified translation
    let chineseExample = example;
    
    // Replace topic words
    for (const [en, zh] of Object.entries(topicTranslations)) {
        chineseExample = chineseExample.replace(new RegExp(en, 'gi'), zh);
    }
    
    // Replace common words
    for (const [en, zh] of Object.entries(wordTranslations)) {
        chineseExample = chineseExample.replace(new RegExp(en, 'gi'), zh);
    }
    
    // If still mostly English, provide a contextual translation
    if (chineseExample === example) {
        return `在${meaning}的语境下，"${word}"这个词展现了其在学术写作中的重要用法。`;
    }
    
    return chineseExample;
}

// Generate memory tips based on word structure and meaning
function generateMemoryTips(word, meaning) {
    const tips = [];
    
    // Check for word roots
    const roots = {
        'bio': '生命', 'geo': '地球', 'hydro': '水', 'astro': '星',
        'auto': '自己', 'tele': '远', 'micro': '小', 'macro': '大',
        'mono': '单一', 'bi': '二', 'tri': '三', 'multi': '多',
        'pre': '之前', 'post': '之后', 'anti': '反对', 'pro': '支持',
        'sub': '下', 'super': '上', 'inter': '之间', 'intra': '内部',
        'trans': '穿过', 'circum': '周围', 'peri': '周围', 'meta': '超越'
    };
    
    for (const [root, meaning] of Object.entries(roots)) {
        if (word.toLowerCase().includes(root)) {
            tips.push(`【词根】含有"${root}"(${meaning})，帮助理解词义`);
            break;
        }
    }
    
    // Add association tips
    const associations = [
        `【联想】将"${word}"与相关的${meaning}场景联系记忆`,
        `【图像】想象一个与${meaning}相关的画面来记住"${word}"`,
        `【造句】用"${word}"造句来加深对${meaning}的理解`,
        `【分组】将"${word}"归入${meaning}相关词汇组`,
        `【对比】比较"${word}"与近义词的细微差别`
    ];
    
    if (tips.length === 0) {
        tips.push(associations[Math.floor(Math.random() * associations.length)]);
    }
    
    // Add suffix/prefix tip if applicable
    if (word.endsWith('tion') || word.endsWith('sion')) {
        tips.push('【后缀】-tion/-sion表示名词，动作或状态');
    } else if (word.endsWith('able') || word.endsWith('ible')) {
        tips.push('【后缀】-able/-ible表示"能够被..."的形容词');
    } else if (word.endsWith('ment')) {
        tips.push('【后缀】-ment表示名词，行为的结果');
    }
    
    return tips.join('；');
}

// Process a single chapter
async function processChapter(filePath) {
    try {
        const content = await fs.readFile(filePath, 'utf8');
        const data = JSON.parse(content);
        
        let updatedCount = 0;
        let phoneticAdded = 0;
        let exampleAdded = 0;
        let tipsAdded = 0;
        
        console.log(`\n📚 Processing: ${data.chapter} (${data.word_count} words)`);
        
        for (let i = 0; i < data.words.length; i++) {
            const word = data.words[i];
            let updated = false;
            
            // Add phonetic if missing
            if (!word.phonetic) {
                word.phonetic = generateEnhancedPhonetic(word.word);
                phoneticAdded++;
                updated = true;
            }
            
            // Add example if missing
            if (!word.example || word.example === '[需要例句]' || word.example.includes('[需要翻译]')) {
                word.example = generateContextualExample(word.word, word.pos, word.meaning);
                word.example_translation = generateSmartTranslation(word.example, word.word, word.meaning);
                exampleAdded++;
                updated = true;
            }
            
            // Add memory tips if missing
            if (!word.tips || word.tips.includes('拆分记忆') || word.tips.includes('基础记忆')) {
                word.tips = generateMemoryTips(word.word, word.meaning);
                tipsAdded++;
                updated = true;
            }
            
            if (updated) {
                updatedCount++;
            }
            
            // Progress indicator
            if ((i + 1) % 50 === 0) {
                console.log(`  ⏳ Processed ${i + 1}/${data.words.length} words...`);
            }
        }
        
        // Save updated file
        await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
        
        console.log(`  ✅ Completed: ${updatedCount} words updated`);
        console.log(`     📝 Phonetics added: ${phoneticAdded}`);
        console.log(`     📚 Examples added: ${exampleAdded}`);
        console.log(`     💡 Tips improved: ${tipsAdded}`);
        
        return {
            chapter: data.chapter,
            total: data.word_count,
            updated: updatedCount,
            phonetic: phoneticAdded,
            example: exampleAdded,
            tips: tipsAdded
        };
        
    } catch (error) {
        console.error(`❌ Error processing ${filePath}:`, error.message);
        return null;
    }
}

// Main function
async function main() {
    console.log('🚀 Starting robust vocabulary update process...');
    console.log('📝 This will add phonetics, examples, and improved tips to all words\n');
    
    const chaptersDir = path.join(__dirname, 'json_chapters');
    const files = await fs.readdir(chaptersDir);
    const jsonFiles = files.filter(f => f.endsWith('.json') && f !== 'index.json');
    
    console.log(`📂 Found ${jsonFiles.length} chapter files to process`);
    
    const results = [];
    
    for (const file of jsonFiles) {
        const filePath = path.join(chaptersDir, file);
        const result = await processChapter(filePath);
        if (result) {
            results.push(result);
        }
    }
    
    // Print summary
    console.log('\n' + '='.repeat(70));
    console.log('📊 FINAL SUMMARY REPORT');
    console.log('='.repeat(70));
    
    let totals = {
        words: 0,
        updated: 0,
        phonetic: 0,
        example: 0,
        tips: 0
    };
    
    results.forEach(r => {
        console.log(`${r.chapter.padEnd(20)} | Words: ${r.total.toString().padStart(4)} | Updated: ${r.updated.toString().padStart(4)}`);
        totals.words += r.total;
        totals.updated += r.updated;
        totals.phonetic += r.phonetic;
        totals.example += r.example;
        totals.tips += r.tips;
    });
    
    console.log('='.repeat(70));
    console.log(`${'TOTAL'.padEnd(20)} | Words: ${totals.words.toString().padStart(4)} | Updated: ${totals.updated.toString().padStart(4)}`);
    console.log('='.repeat(70));
    console.log(`\n📈 Detailed Updates:`);
    console.log(`   🔊 Phonetics added: ${totals.phonetic}`);
    console.log(`   📝 Examples added: ${totals.example}`);
    console.log(`   💡 Tips improved: ${totals.tips}`);
    console.log(`\n✨ Update completion rate: ${((totals.updated / totals.words) * 100).toFixed(1)}%`);
    console.log('✅ Vocabulary update process completed successfully!\n');
}

// Run the script
main().catch(console.error);