#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import json
import os
import glob

# 音标数据库（常见雅思词汇）
PHONETICS_DB = {
    # 交通旅行
    "navigate": "/ˈnævɪɡeɪt/",
    "voyage": "/ˈvɔɪɪdʒ/",
    "aviation": "/ˌeɪviˈeɪʃn/",
    "journey": "/ˈdʒɜːni/",
    "travel": "/ˈtrævl/",
    "trip": "/trɪp/",
    "tour": "/tʊə(r)/",
    "expedition": "/ˌekspəˈdɪʃn/",
    "excursion": "/ɪkˈskɜːʃn/",
    "luggage": "/ˈlʌɡɪdʒ/",
    "baggage": "/ˈbæɡɪdʒ/",
    "vehicle": "/ˈviːəkl/",
    "automobile": "/ˈɔːtəməbiːl/",
    "transportation": "/ˌtrænspɔːˈteɪʃn/",
    "transit": "/ˈtrænzɪt/",
    "commute": "/kəˈmjuːt/",
    "departure": "/dɪˈpɑːtʃə(r)/",
    "arrival": "/əˈraɪvl/",
    "destination": "/ˌdestɪˈneɪʃn/",
    "itinerary": "/aɪˈtɪnərəri/",
    "route": "/ruːt/",
    "detour": "/ˈdiːtʊə(r)/",
    "terminal": "/ˈtɜːmɪnl/",
    "runway": "/ˈrʌnweɪ/",
    "highway": "/ˈhaɪweɪ/",
    "traffic": "/ˈtræfɪk/",
    "congestion": "/kənˈdʒestʃən/",
    "pedestrian": "/pəˈdestriən/",
    "passenger": "/ˈpæsɪndʒə(r)/",
    "pilot": "/ˈpaɪlət/",
    "captain": "/ˈkæptɪn/",
    "crew": "/kruː/",
    "steward": "/ˈstjuːəd/",
    "aboard": "/əˈbɔːd/",
    "embark": "/ɪmˈbɑːk/",
    "disembark": "/ˌdɪsɪmˈbɑːk/",
    "board": "/bɔːd/",
    "ferry": "/ˈferi/",
    "cruise": "/kruːz/",
    "sail": "/seɪl/",
    "anchor": "/ˈæŋkə(r)/",
    "harbor": "/ˈhɑːbə(r)/",
    "port": "/pɔːt/",
    "dock": "/dɒk/",
    "railway": "/ˈreɪlweɪ/",
    "platform": "/ˈplætfɔːm/",
    "carriage": "/ˈkærɪdʒ/",
    "compartment": "/kəmˈpɑːtmənt/",
    "fare": "/feə(r)/",
    "ticket": "/ˈtɪkɪt/",
    "reservation": "/ˌrezəˈveɪʃn/",
    "booking": "/ˈbʊkɪŋ/",
    "delay": "/dɪˈleɪ/",
    "cancel": "/ˈkænsl/",
    "postpone": "/pəˈspəʊn/",
    "turbulence": "/ˈtɜːbjələns/",
    "altitude": "/ˈæltɪtjuːd/",
    "velocity": "/vəˈlɒsəti/",
    "acceleration": "/əkˌseləˈreɪʃn/",
    "brake": "/breɪk/",
    "fuel": "/ˈfjuːəl/",
    "gasoline": "/ˈɡæsəliːn/",
    "diesel": "/ˈdiːzl/",
    "mileage": "/ˈmaɪlɪdʒ/",
    "odometer": "/əʊˈdɒmɪtə(r)/",
    "speedometer": "/spiːˈdɒmɪtə(r)/",
    "GPS": "/ˌdʒiː piː ˈes/",
    "radar": "/ˈreɪdɑː(r)/",
    "compass": "/ˈkʌmpəs/",
    "map": "/mæp/",
    "atlas": "/ˈætləs/",
    "brochure": "/ˈbrəʊʃə(r)/",
    "guidebook": "/ˈɡaɪdbʊk/",
    "customs": "/ˈkʌstəmz/",
    "immigration": "/ˌɪmɪˈɡreɪʃn/",
    "passport": "/ˈpɑːspɔːt/",
    "visa": "/ˈviːzə/",
    "embassy": "/ˈembəsi/",
    "consulate": "/ˈkɒnsjələt/",
    
    # 动物保护
    "animal": "/ˈænɪml/",
    "creature": "/ˈkriːtʃə(r)/",
    "species": "/ˈspiːʃiːz/",
    "mammal": "/ˈmæml/",
    "reptile": "/ˈreptaɪl/",
    "amphibian": "/æmˈfɪbiən/",
    "predator": "/ˈpredətə(r)/",
    "prey": "/preɪ/",
    "habitat": "/ˈhæbɪtæt/",
    "ecosystem": "/ˈiːkəʊsɪstəm/",
    "biodiversity": "/ˌbaɪəʊdaɪˈvɜːsəti/",
    "conservation": "/ˌkɒnsəˈveɪʃn/",
    "preservation": "/ˌprezəˈveɪʃn/",
    "extinction": "/ɪkˈstɪŋkʃn/",
    "endangered": "/ɪnˈdeɪndʒəd/",
    "vulnerable": "/ˈvʌlnərəbl/",
    "poaching": "/ˈpəʊtʃɪŋ/",
    "hunting": "/ˈhʌntɪŋ/",
    "wildlife": "/ˈwaɪldlaɪf/",
    "sanctuary": "/ˈsæŋktʃuəri/",
    "reserve": "/rɪˈzɜːv/",
    "captivity": "/kæpˈtɪvəti/",
    "breeding": "/ˈbriːdɪŋ/",
    "migration": "/maɪˈɡreɪʃn/",
    "hibernation": "/ˌhaɪbəˈneɪʃn/",
    "camouflage": "/ˈkæməflɑːʒ/",
    "nocturnal": "/nɒkˈtɜːnl/",
    "diurnal": "/daɪˈɜːnl/",
    "carnivore": "/ˈkɑːnɪvɔː(r)/",
    "herbivore": "/ˈhɜːbɪvɔː(r)/",
    "omnivore": "/ˈɒmnɪvɔː(r)/",
    "scavenger": "/ˈskævɪndʒə(r)/",
    "instinct": "/ˈɪnstɪŋkt/",
    "territory": "/ˈterətri/",
    "offspring": "/ˈɒfsprɪŋ/",
    "mammalian": "/məˈmeɪliən/",
    "aquatic": "/əˈkwætɪk/",
    "terrestrial": "/təˈrestriəl/",
    "marine": "/məˈriːn/",
    "fauna": "/ˈfɔːnə/",
    "flora": "/ˈflɔːrə/",
    "vegetation": "/ˌvedʒəˈteɪʃn/",
    "deforestation": "/diːˌfɒrɪˈsteɪʃn/",
    "reforestation": "/ˌriːfɒrɪˈsteɪʃn/",
    
    # 继续添加其他词汇...
}

# IELTS 例句模板和翻译
IELTS_EXAMPLES = {
    "navigate": {
        "example": "Modern GPS technology has revolutionized how we navigate through unfamiliar cities, making paper maps almost obsolete.",
        "translation": "现代GPS技术彻底改变了我们在陌生城市中导航的方式，使纸质地图几乎过时了。"
    },
    "voyage": {
        "example": "The historic voyage of Christopher Columbus in 1492 fundamentally changed the course of world history.",
        "translation": "克里斯托弗·哥伦布1492年的历史性航行从根本上改变了世界历史的进程。"
    },
    "aviation": {
        "example": "The aviation industry has faced unprecedented challenges due to the global pandemic, with many airlines struggling to survive.",
        "translation": "由于全球疫情，航空业面临着前所未有的挑战，许多航空公司都在努力求生。"
    },
    "journey": {
        "example": "The journey to achieving carbon neutrality requires collective efforts from governments, businesses, and individuals alike.",
        "translation": "实现碳中和的历程需要政府、企业和个人的共同努力。"
    },
    "habitat": {
        "example": "Climate change poses a significant threat to polar bears' natural habitat, as Arctic ice continues to melt at an alarming rate.",
        "translation": "气候变化对北极熊的自然栖息地构成了重大威胁，因为北极冰层正以惊人的速度持续融化。"
    },
    "conservation": {
        "example": "Wildlife conservation efforts have successfully brought several species back from the brink of extinction.",
        "translation": "野生动物保护工作已经成功地将几个物种从灭绝边缘拯救回来。"
    },
    "extinction": {
        "example": "Scientists warn that we are currently experiencing the sixth mass extinction event in Earth's history.",
        "translation": "科学家警告说，我们目前正在经历地球历史上第六次大规模灭绝事件。"
    },
    "endangered": {
        "example": "The number of endangered species on the IUCN Red List has increased dramatically over the past decade.",
        "translation": "在过去十年中，世界自然保护联盟红色名录上的濒危物种数量急剧增加。"
    }
}

# 记忆技巧生成
MEMORY_TIPS = {
    "navigate": "【词根记忆】nav(船) + ig + ate(动词后缀) = 驾驶船只航行 → 导航。联想：navy(海军)也是nav开头，都与航海有关。",
    "voyage": "【联想记忆】voy看作boy(男孩) + age(年龄) → 男孩到了一定年龄要出海远航 → 航行。注意与journey(陆地旅行)和flight(空中旅行)的区别。",
    "aviation": "【词根记忆】avi(鸟) + ation(名词后缀) = 像鸟一样飞行的行业 → 航空业。联想：aviary(鸟舍)也是avi开头。",
    "journey": "【词源记忆】来自法语journée(一天的行程)，jour=day → 古时一天能走的路程 → 旅程。记住：journey强调过程，destination强调目的地。",
    "habitat": "【词根记忆】habit(习惯) + at → 习惯居住的地方 → 栖息地。联想：inhabit(居住)、inhabitant(居民)都是同源词。",
    "conservation": "【词根记忆】con(共同) + serv(保持) + ation → 共同保持 → 保护。联想：preserve(保存)、reserve(保留)都含有serv。",
    "extinction": "【词根记忆】ex(出) + tinct(刺、灭) + ion → 完全熄灭 → 灭绝。联想：extinct volcano(死火山)，都表示完全消失。",
    "endangered": "【组合记忆】en(使) + danger(危险) + ed → 使处于危险中 → 濒危的。记住搭配：endangered species(濒危物种)。"
}

def enhance_word_data(word_obj):
    """增强单词数据：添加音标、IELTS例句和记忆技巧"""
    word = word_obj.get("word", "")
    
    # 添加音标（如果还没有）
    if "phonetic" not in word_obj and word in PHONETICS_DB:
        word_obj["phonetic"] = PHONETICS_DB[word]
    
    # 更新或添加IELTS例句
    if word in IELTS_EXAMPLES:
        word_obj["example"] = IELTS_EXAMPLES[word]["example"]
        word_obj["example_translation"] = IELTS_EXAMPLES[word]["translation"]
    elif "example" in word_obj:
        # 为现有例句添加翻译（如果没有）
        if "example_translation" not in word_obj:
            word_obj["example_translation"] = "[需要翻译]"
    
    # 更新或添加记忆技巧
    if word in MEMORY_TIPS:
        word_obj["tips"] = MEMORY_TIPS[word]
    elif "tips" not in word_obj:
        # 生成默认记忆技巧
        word_obj["tips"] = f"【联想记忆】将'{word}'拆分记忆，结合词根词缀理解其含义。"
    
    return word_obj

def process_chapter_file(filepath):
    """处理单个章节文件"""
    print(f"Processing: {filepath}")
    
    with open(filepath, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    # 统计
    updated_count = 0
    
    # 处理每个单词
    for i, word_obj in enumerate(data["words"]):
        original = word_obj.copy()
        enhanced = enhance_word_data(word_obj)
        
        if enhanced != original:
            data["words"][i] = enhanced
            updated_count += 1
    
    # 保存更新后的文件
    if updated_count > 0:
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        print(f"  Updated {updated_count} words in {filepath}")
    else:
        print(f"  No updates needed for {filepath}")
    
    return updated_count

def main():
    """主函数：处理所有章节文件"""
    json_dir = "json_chapters"
    total_updated = 0
    
    # 获取所有章节文件（排除index.json）
    chapter_files = glob.glob(os.path.join(json_dir, "*.json"))
    chapter_files = [f for f in chapter_files if not f.endswith("index.json")]
    
    print(f"Found {len(chapter_files)} chapter files to process\n")
    
    for filepath in chapter_files:
        updated = process_chapter_file(filepath)
        total_updated += updated
    
    print(f"\nTotal updates: {total_updated} words enhanced across all chapters")
    print("\nEnhancement complete!")
    print("Note: This is a demonstration with limited vocabulary.")
    print("For production use, you would need:")
    print("1. Complete phonetics database for all words")
    print("2. AI-generated IELTS examples for all words")
    print("3. Personalized memory tips for each word")

if __name__ == "__main__":
    main()