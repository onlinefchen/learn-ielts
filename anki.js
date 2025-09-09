// ANKI-style spaced repetition algorithm
class AnkiAlgorithm {
    constructor() {
        // Review intervals in hours
        this.intervals = {
            0: 0.01,    // 1 minute (for new words)
            1: 0.1,     // 6 minutes
            2: 1,       // 1 hour
            3: 6,       // 6 hours
            4: 24,      // 1 day
            5: 72,      // 3 days
            6: 168,     // 1 week
            7: 336,     // 2 weeks
            8: 720,     // 1 month
            9: 2160,    // 3 months
            10: 4320    // 6 months
        };
    }

    // Calculate next review time based on review count
    getNextReviewTime(reviewCount) {
        const now = new Date();
        let hoursToAdd = this.intervals[Math.min(reviewCount, 10)];
        
        // Add some randomness to avoid all words appearing at once
        hoursToAdd *= (0.9 + Math.random() * 0.2);
        
        now.setHours(now.getHours() + hoursToAdd);
        return now.toISOString();
    }

    // Check if a word needs review
    needsReview(wordData) {
        if (!wordData || wordData.mastered) {
            return false;
        }
        
        if (!wordData.nextReview) {
            return true;
        }
        
        return new Date(wordData.nextReview) <= new Date();
    }

    // Calculate priority score for ANKI sorting
    getPriorityScore(wordData) {
        if (!wordData) {
            return 1000; // New words get highest priority
        }
        
        if (wordData.mastered) {
            return -1; // Mastered words have lowest priority
        }
        
        const now = new Date();
        const nextReview = wordData.nextReview ? new Date(wordData.nextReview) : now;
        const overdue = (now - nextReview) / (1000 * 60 * 60); // Hours overdue
        
        // Higher score = higher priority
        // Overdue words get higher priority
        // Words with fewer reviews also get higher priority
        return overdue * 10 + (10 - Math.min(wordData.reviewCount || 0, 10));
    }

    // Sort words by ANKI algorithm
    sortByAnki(wordsWithData) {
        return wordsWithData.sort((a, b) => {
            const scoreA = this.getPriorityScore(a.progress);
            const scoreB = this.getPriorityScore(b.progress);
            return scoreB - scoreA; // Higher score first
        });
    }

    // Get statistics for a chapter
    getChapterStats(chapterProgress, totalWords) {
        const stats = {
            mastered: 0,
            learning: 0,
            needReview: 0,
            new: 0
        };

        const processedWords = new Set();
        
        for (const word in chapterProgress) {
            const data = chapterProgress[word];
            processedWords.add(word);
            
            if (data.mastered) {
                stats.mastered++;
            } else if (this.needsReview(data)) {
                stats.needReview++;
            } else {
                stats.learning++;
            }
        }
        
        stats.new = totalWords - processedWords.size;
        
        return stats;
    }
}

// Export for use in other files
window.ankiAlgorithm = new AnkiAlgorithm();