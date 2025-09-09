#!/usr/bin/env python3
import json
import re
from pathlib import Path

def parse_vocabulary_file(file_path):
    chapters = {}
    current_chapter = None
    current_words = []
    
    with open(file_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    chapter_names = [
        "自然地理", "植物研究", "动物保护", "太空探索", "学校教育",
        "科技发明", "文化历史", "语言演化", "娱乐运动", "物品材料",
        "时尚潮流", "饮食健康", "建筑场所", "交通旅行", "国家政府",
        "社会经济", "法律法规", "沙场争锋", "社会角色", "行为动作",
        "身心健康", "时间日期"
    ]
    
    i = 0
    while i < len(lines):
        line = lines[i].strip()
        
        # Check if this is a chapter title
        if line in chapter_names:
            # Save previous chapter if exists
            if current_chapter and current_words:
                chapters[current_chapter] = current_words
            
            current_chapter = line
            current_words = []
            i += 1
            continue
        
        # Skip separators and empty lines
        if line in ['+++', '---', '==='] or not line:
            i += 1
            continue
        
        # Parse word entry
        if '|' in line:
            parts = line.split('|')
            if len(parts) >= 3:
                word = parts[0].strip()
                pos = parts[1].strip()  # part of speech
                meaning = parts[2].strip()
                
                # Get example sentence if exists
                example = ''
                note = ''
                if len(parts) > 3:
                    remaining = '|'.join(parts[3:])
                    # Check if there's a note (indicated by ||)
                    if '||' in remaining:
                        example_part, note_part = remaining.split('||', 1)
                        example = example_part.strip()
                        note = note_part.strip()
                    else:
                        example = remaining.strip()
                
                word_entry = {
                    'word': word,
                    'pos': pos,
                    'meaning': meaning
                }
                
                if example:
                    word_entry['example'] = example
                if note:
                    word_entry['note'] = note
                    
                current_words.append(word_entry)
        
        i += 1
    
    # Save the last chapter
    if current_chapter and current_words:
        chapters[current_chapter] = current_words
    
    return chapters

def save_chapters_as_json(chapters, output_dir='json_chapters'):
    # Create output directory
    Path(output_dir).mkdir(exist_ok=True)
    
    # Save each chapter as a separate JSON file
    for chapter_name, words in chapters.items():
        # Create safe filename
        safe_filename = chapter_name.replace('/', '_').replace(' ', '_')
        file_path = Path(output_dir) / f"{safe_filename}.json"
        
        chapter_data = {
            'chapter': chapter_name,
            'word_count': len(words),
            'words': words
        }
        
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(chapter_data, f, ensure_ascii=False, indent=2)
        
        print(f"Saved {chapter_name}: {len(words)} words to {file_path}")
    
    # Also save a master index file
    index_data = {
        'total_chapters': len(chapters),
        'chapters': [
            {
                'name': chapter_name,
                'word_count': len(words),
                'file': f"{chapter_name.replace('/', '_').replace(' ', '_')}.json"
            }
            for chapter_name, words in chapters.items()
        ]
    }
    
    index_path = Path(output_dir) / 'index.json'
    with open(index_path, 'w', encoding='utf-8') as f:
        json.dump(index_data, f, ensure_ascii=False, indent=2)
    
    print(f"\nSaved index file to {index_path}")
    print(f"Total chapters: {len(chapters)}")
    print(f"Total words: {sum(len(words) for words in chapters.values())}")

if __name__ == "__main__":
    # Parse the vocabulary file
    chapters = parse_vocabulary_file('vocabulary.txt')
    
    # Save as JSON files
    save_chapters_as_json(chapters)