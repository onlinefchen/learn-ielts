#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import json
import os
import glob
from pathlib import Path

def analyze_vocabulary_data():
    """Analyze all vocabulary JSON files and provide comprehensive statistics."""
    
    # Get all JSON files except index.json
    json_dir = "/home/feng/code/github/learn-ielts/json_chapters"
    json_files = glob.glob(os.path.join(json_dir, "*.json"))
    json_files = [f for f in json_files if not f.endswith("index.json")]
    json_files.sort()
    
    # Initialize counters
    total_words = 0
    total_with_phonetics = 0
    total_with_examples = 0
    total_with_example_translations = 0
    
    # Chapter analysis
    chapters_data = []
    
    print("=== IELTS Vocabulary Analysis Report ===\n")
    
    for json_file in json_files:
        chapter_name = os.path.basename(json_file).replace(".json", "")
        
        try:
            with open(json_file, 'r', encoding='utf-8') as f:
                data = json.load(f)
                
            words = data.get('words', [])
            word_count = len(words)
            
            # Count words with various attributes
            words_with_phonetics = 0
            words_with_examples = 0
            words_with_example_translations = 0
            missing_phonetics = []
            missing_examples = []
            
            for word in words:
                # Check phonetics
                if word.get('phonetic'):
                    words_with_phonetics += 1
                else:
                    missing_phonetics.append(word.get('word', 'unknown'))
                
                # Check examples
                if word.get('example'):
                    words_with_examples += 1
                    # Check if example translation exists and is not "[需要翻译]"
                    translation = word.get('example_translation', '')
                    if translation and translation != "[需要翻译]":
                        words_with_example_translations += 1
                else:
                    missing_examples.append(word.get('word', 'unknown'))
            
            # Store chapter data
            chapter_info = {
                'name': chapter_name,
                'total_words': word_count,
                'with_phonetics': words_with_phonetics,
                'with_examples': words_with_examples,
                'with_example_translations': words_with_example_translations,
                'missing_phonetics_count': len(missing_phonetics),
                'missing_examples_count': len(missing_examples),
                'missing_phonetics': missing_phonetics[:10],  # Show first 10
                'missing_examples': missing_examples[:10]  # Show first 10
            }
            chapters_data.append(chapter_info)
            
            # Update totals
            total_words += word_count
            total_with_phonetics += words_with_phonetics
            total_with_examples += words_with_examples
            total_with_example_translations += words_with_example_translations
            
        except Exception as e:
            print(f"Error processing {json_file}: {e}")
    
    # Print overall summary
    print("📊 OVERALL STATISTICS:")
    print(f"📚 Total chapters: {len(chapters_data)}")
    print(f"📖 Total words: {total_words}")
    print(f"🔊 Words with phonetics: {total_with_phonetics} ({total_with_phonetics/total_words*100:.1f}%)")
    print(f"📝 Words with examples: {total_with_examples} ({total_with_examples/total_words*100:.1f}%)")
    print(f"🌐 Words with example translations: {total_with_example_translations} ({total_with_example_translations/total_words*100:.1f}%)")
    print(f"❌ Missing phonetics: {total_words - total_with_phonetics}")
    print(f"❌ Missing examples: {total_words - total_with_examples}")
    print(f"❌ Missing example translations: {total_with_examples - total_with_example_translations}")
    
    # Print detailed chapter analysis
    print("\n📋 CHAPTER-BY-CHAPTER ANALYSIS:")
    print("-" * 100)
    print(f"{'Chapter':<15} {'Words':<8} {'Phonetics':<12} {'Examples':<11} {'Translations':<12} {'Missing':<20}")
    print(f"{'Name':<15} {'Total':<8} {'Count(%)':<12} {'Count(%)':<11} {'Count(%)':<12} {'Phon/Exam':<20}")
    print("-" * 100)
    
    for chapter in chapters_data:
        phonetic_pct = chapter['with_phonetics'] / chapter['total_words'] * 100
        example_pct = chapter['with_examples'] / chapter['total_words'] * 100
        translation_pct = chapter['with_example_translations'] / chapter['with_examples'] * 100 if chapter['with_examples'] > 0 else 0
        
        print(f"{chapter['name']:<15} {chapter['total_words']:<8} "
              f"{chapter['with_phonetics']}({phonetic_pct:.0f}%){'':<4} "
              f"{chapter['with_examples']}({example_pct:.0f}%){'':<4} "
              f"{chapter['with_example_translations']}({translation_pct:.0f}%){'':<4} "
              f"{chapter['missing_phonetics_count']}/{chapter['missing_examples_count']}")
    
    # Find chapters that need the most work
    print("\n🚨 CHAPTERS NEEDING MOST ATTENTION:")
    print("\n📢 Missing Phonetics (Top 10 chapters):")
    sorted_by_missing_phonetics = sorted(chapters_data, key=lambda x: x['missing_phonetics_count'], reverse=True)
    for i, chapter in enumerate(sorted_by_missing_phonetics[:10], 1):
        if chapter['missing_phonetics_count'] > 0:
            print(f"{i:2}. {chapter['name']}: {chapter['missing_phonetics_count']} missing phonetics")
            if chapter['missing_phonetics']:
                print(f"    Examples: {', '.join(chapter['missing_phonetics'])}")
    
    print("\n📝 Missing Examples (Top 10 chapters):")
    sorted_by_missing_examples = sorted(chapters_data, key=lambda x: x['missing_examples_count'], reverse=True)
    for i, chapter in enumerate(sorted_by_missing_examples[:10], 1):
        if chapter['missing_examples_count'] > 0:
            print(f"{i:2}. {chapter['name']}: {chapter['missing_examples_count']} missing examples")
            if chapter['missing_examples']:
                print(f"    Examples: {', '.join(chapter['missing_examples'])}")
    
    print("\n✅ CHAPTERS WITH COMPLETE DATA:")
    complete_chapters = [c for c in chapters_data if c['missing_phonetics_count'] == 0 and c['missing_examples_count'] == 0]
    if complete_chapters:
        for chapter in complete_chapters:
            print(f"✓ {chapter['name']}: {chapter['total_words']} words (100% complete)")
    else:
        print("None - all chapters need some work")
    
    print(f"\n📈 DATA COMPLETION RATES:")
    print(f"Phonetics completion: {total_with_phonetics/total_words*100:.1f}%")
    print(f"Examples completion: {total_with_examples/total_words*100:.1f}%")
    print(f"Translation completion: {total_with_example_translations/total_with_examples*100:.1f}% (of words with examples)")

if __name__ == "__main__":
    analyze_vocabulary_data()