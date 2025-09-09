const fs = require('fs').promises;
const path = require('path');
const https = require('https');

// Dictionary API configuration
const DICTIONARY_API_URL = 'https://api.dictionaryapi.dev/api/v2/entries/en/';

// Fetch phonetics and example from Dictionary API
async function fetchWordData(word) {
    try {
        const cleanWord = word.toLowerCase().replace(/[^a-z]/g, '');
        
        const data = await new Promise((resolve, reject) => {
            https.get(DICTIONARY_API_URL + cleanWord, (res) => {
                let body = '';
                res.on('data', chunk => body += chunk);
                res.on('end', () => {
                    if (res.statusCode === 200) {
                        try {
                            resolve(JSON.parse(body));
                        } catch (e) {
                            console.log(`  ⚠️  API parse error for "${word}"`);
                            resolve(null);
                        }
                    } else {
                        console.log(`  ⚠️  API status ${res.statusCode} for "${word}"`);
                        resolve(null);
                    }
                });
            }).on('error', (err) => {
                console.log(`  ⚠️  Network error for "${word}": ${err.message}`);
                resolve(null);
            });
        });

        if (!data) return { phonetic: null, example: null };
        
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

        console.log(`  ✅ Found data for "${word}": phonetic=${!!phonetic}, example=${!!example}`);
        return { phonetic, example };
    } catch (error) {
        console.log(`  ❌ Error fetching "${word}": ${error.message}`);
        return { phonetic: null, example: null };
    }
}

// Generate simple phonetic
function generatePhonetic(word) {
    // Simple phonetic generation
    const vowels = ['a', 'e', 'i', 'o', 'u'];
    let result = '/';
    
    for (let char of word.toLowerCase()) {
        if (vowels.includes(char)) {
            result += char === 'a' ? 'æ' : 
                     char === 'e' ? 'e' :
                     char === 'i' ? 'ɪ' :
                     char === 'o' ? 'ɒ' :
                     char === 'u' ? 'ʌ' : char;
        } else {
            result += char;
        }
    }
    
    return result + '/';
}

// Generate IELTS example
function generateIELTSExample(word, pos) {
    const examples = {
        'n.': `The ${word} plays a crucial role in modern society.`,
        'v.': `Students need to ${word} their skills for academic success.`,
        'adj.': `The ${word} approach has proven effective in many contexts.`,
        'adv.': `The project was ${word} completed on schedule.`
    };
    
    return examples[pos] || `The term "${word}" is commonly used in academic contexts.`;
}

// Test with one file
async function test() {
    const testFile = path.join(__dirname, 'json_chapters', '时间日期.json');
    
    console.log('🧪 Testing vocabulary update with 时间日期 chapter...\n');
    
    const content = await fs.readFile(testFile, 'utf8');
    const data = JSON.parse(content);
    
    console.log(`📚 Chapter: ${data.chapter}`);
    console.log(`📊 Total words: ${data.word_count}\n`);
    
    // Test with first 5 words
    const testWords = data.words.slice(0, 5);
    
    for (const word of testWords) {
        console.log(`\n🔍 Processing: "${word.word}" (${word.pos})`);
        console.log(`  Current phonetic: ${word.phonetic || 'none'}`);
        console.log(`  Current example: ${word.example ? 'exists' : 'none'}`);
        
        if (!word.phonetic || !word.example) {
            // Fetch from API
            const apiData = await fetchWordData(word.word);
            
            // Update phonetic
            if (!word.phonetic) {
                word.phonetic = apiData.phonetic || generatePhonetic(word.word);
                console.log(`  New phonetic: ${word.phonetic} (${apiData.phonetic ? 'from API' : 'generated'})`);
            }
            
            // Update example
            if (!word.example) {
                word.example = apiData.example || generateIELTSExample(word.word, word.pos);
                console.log(`  New example: "${word.example.substring(0, 50)}..." (${apiData.example ? 'from API' : 'generated'})`);
            }
        }
        
        // Add delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    // Save test results
    const testOutput = {
        chapter: data.chapter,
        word_count: 5,
        words: testWords
    };
    
    await fs.writeFile('test_output.json', JSON.stringify(testOutput, null, 2));
    console.log('\n✅ Test completed! Results saved to test_output.json');
}

test().catch(console.error);