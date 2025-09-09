#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import json
import os
import glob

def add_phonetic_if_missing(word_obj):
    """为缺少音标的单词添加音标"""
    word = word_obj.get("word", "").strip()
    
    # 常见植物研究词汇音标
    plant_phonetics = {
        "photosynthesis": "/ˌfəʊtəʊˈsɪnθəsɪs/",
        "respire": "/rɪˈspaɪə(r)/",
        "dioxide": "/daɪˈɒksaɪd/",
        "chlorophyll": "/ˈklɔːrəfɪl/",
        "cellulose": "/ˈseljʊləʊs/",
        "glucose": "/ˈɡluːkəʊs/",
        "starch": "/stɑːtʃ/",
        "protein": "/ˈprəʊtiːn/",
        "enzyme": "/ˈenzaɪm/",
        "molecule": "/ˈmɒlɪkjuːl/",
        "cell": "/sel/",
        "tissue": "/ˈtɪʃuː/",
        "organ": "/ˈɔːɡən/",
        "organism": "/ˈɔːɡənɪzəm/",
        "species": "/ˈspiːʃiːz/",
        "genus": "/ˈdʒiːnəs/",
        "family": "/ˈfæməli/",
        "order": "/ˈɔːdə(r)/",
        "class": "/klɑːs/",
        "kingdom": "/ˈkɪŋdəm/",
        "taxonomy": "/tækˈsɒnəmi/",
        "classification": "/ˌklæsɪfɪˈkeɪʃn/",
        "botany": "/ˈbɒtəni/",
        "botanical": "/bəˈtænɪkl/",
        "flora": "/ˈflɔːrə/",
        "vegetation": "/ˌvedʒəˈteɪʃn/",
        "foliage": "/ˈfəʊliɪdʒ/",
        "leaf": "/liːf/",
        "leaves": "/liːvz/",
        "stem": "/stem/",
        "root": "/ruːt/",
        "branch": "/brɑːntʃ/",
        "trunk": "/trʌŋk/",
        "bark": "/bɑːk/",
        "flower": "/ˈflaʊə(r)/",
        "blossom": "/ˈblɒsəm/",
        "bloom": "/bluːm/",
        "petal": "/ˈpetl/",
        "sepal": "/ˈsepəl/",
        "stamen": "/ˈsteɪmən/",
        "pistil": "/ˈpɪstɪl/",
        "pollen": "/ˈpɒlən/",
        "nectar": "/ˈnektə(r)/",
        "seed": "/siːd/",
        "fruit": "/fruːt/",
        "berry": "/ˈberi/",
        "nut": "/nʌt/",
        "grain": "/ɡreɪn/",
        "pod": "/pɒd/",
        "kernel": "/ˈkɜːnl/",
        "sprout": "/spraʊt/",
        "germinate": "/ˈdʒɜːmɪneɪt/",
        "cultivate": "/ˈkʌltɪveɪt/",
        "harvest": "/ˈhɑːvɪst/",
        "crop": "/krɒp/",
        "agriculture": "/ˈæɡrɪkʌltʃə(r)/",
        "horticulture": "/ˈhɔːtɪkʌltʃə(r)/",
        "forestry": "/ˈfɒrɪstri/",
        "plantation": "/plænˈteɪʃn/",
        "orchard": "/ˈɔːtʃəd/",
        "garden": "/ˈɡɑːdn/",
        "greenhouse": "/ˈɡriːnhaʊs/",
        "nursery": "/ˈnɜːsəri/",
        "fertilizer": "/ˈfɜːtəlaɪzə(r)/",
        "pesticide": "/ˈpestɪsaɪd/",
        "herbicide": "/ˈhɜːbɪsaɪd/",
        "irrigation": "/ˌɪrɪˈɡeɪʃn/",
        "soil": "/sɔɪl/",
        "compost": "/ˈkɒmpɒst/",
        "mulch": "/mʌltʃ/",
        "pruning": "/ˈpruːnɪŋ/",
        "grafting": "/ˈɡrɑːftɪŋ/",
        "transplant": "/trænsˈplɑːnt/",
        "pollinate": "/ˈpɒləneɪt/",
        "reproduce": "/ˌriːprəˈdjuːs/",
        "propagate": "/ˈprɒpəɡeɪt/",
        "hybrid": "/ˈhaɪbrɪd/",
        "mutation": "/mjuːˈteɪʃn/",
        "adaptation": "/ˌædæpˈteɪʃn/",
        "evolution": "/ˌiːvəˈluːʃn/",
        "ecology": "/iˈkɒlədʒi/",
        "ecosystem": "/ˈiːkəʊsɪstəm/",
        "habitat": "/ˈhæbɪtæt/",
        "environment": "/ɪnˈvaɪrənmənt/",
        "climate": "/ˈklaɪmət/",
        "weather": "/ˈweðə(r)/",
        "seasonal": "/ˈsiːznəl/",
        "perennial": "/pəˈreniəl/",
        "annual": "/ˈænjuəl/",
        "biennial": "/baɪˈeniəl/",
        "deciduous": "/dɪˈsɪdjuəs/",
        "evergreen": "/ˈevəɡriːn/",
        "coniferous": "/kəˈnɪfərəs/",
        "hardwood": "/ˈhɑːdwʊd/",
        "softwood": "/ˈsɒftwʊd/",
        "timber": "/ˈtɪmbə(r)/",
        "lumber": "/ˈlʌmbə(r)/",
        "wood": "/wʊd/",
        "woody": "/ˈwʊdi/",
        "herbaceous": "/hɜːˈbeɪʃəs/",
        "shrub": "/ʃrʌb/",
        "bush": "/bʊʃ/",
        "tree": "/triː/",
        "grass": "/ɡrɑːs/",
        "weed": "/wiːd/",
        "moss": "/mɒs/",
        "fern": "/fɜːn/",
        "algae": "/ˈældʒiː/",
        "fungus": "/ˈfʌŋɡəs/",
        "fungi": "/ˈfʌŋɡaɪ/",
        "mushroom": "/ˈmʌʃruːm/",
        "lichen": "/ˈlaɪkən/",
        "vine": "/vaɪn/",
        "climber": "/ˈklaɪmə(r)/",
        "creeper": "/ˈkriːpə(r)/",
        "cactus": "/ˈkæktəs/",
        "succulent": "/ˈsʌkjələnt/",
        "herb": "/hɜːb/",
        "spice": "/spaɪs/",
        "medicinal": "/məˈdɪsɪnl/",
        "aromatic": "/ˌærəˈmætɪk/",
        "fragrant": "/ˈfreɪɡrənt/",
        "scent": "/sent/",
        "aroma": "/əˈrəʊmə/",
        "perfume": "/ˈpɜːfjuːm/",
        "toxic": "/ˈtɒksɪk/",
        "poisonous": "/ˈpɔɪzənəs/",
        "edible": "/ˈedəbl/",
        "nutritious": "/njuːˈtrɪʃəs/",
        "vitamin": "/ˈvɪtəmɪn/",
        "mineral": "/ˈmɪnərəl/",
        "fiber": "/ˈfaɪbə(r)/",
        "fibre": "/ˈfaɪbə(r)/",
        "carbohydrate": "/ˌkɑːbəʊˈhaɪdreɪt/",
        "fat": "/fæt/",
        "oil": "/ɔɪl/",
        "resin": "/ˈrezɪn/",
        "sap": "/sæp/",
        "latex": "/ˈleɪteks/",
        "rubber": "/ˈrʌbə(r)/",
        "cotton": "/ˈkɒtn/",
        "linen": "/ˈlɪnən/",
        "hemp": "/hemp/",
        "bamboo": "/bæmˈbuː/",
        "palm": "/pɑːm/",
        "pine": "/paɪn/",
        "oak": "/əʊk/",
        "maple": "/ˈmeɪpl/",
        "willow": "/ˈwɪləʊ/",
        "birch": "/bɜːtʃ/",
        "cedar": "/ˈsiːdə(r)/",
        "cherry": "/ˈtʃeri/",
        "apple": "/ˈæpl/",
        "orange": "/ˈɒrɪndʒ/",
        "lemon": "/ˈlemən/",
        "banana": "/bəˈnɑːnə/",
        "grape": "/ɡreɪp/",
        "strawberry": "/ˈstrɔːbəri/",
        "tomato": "/təˈmɑːtəʊ/",
        "potato": "/pəˈteɪtəʊ/",
        "carrot": "/ˈkærət/",
        "onion": "/ˈʌnjən/",
        "garlic": "/ˈɡɑːlɪk/",
        "lettuce": "/ˈletɪs/",
        "cabbage": "/ˈkæbɪdʒ/",
        "spinach": "/ˈspɪnɪtʃ/",
        "broccoli": "/ˈbrɒkəli/",
        "cauliflower": "/ˈkɒliˌflaʊə(r)/",
        "cucumber": "/ˈkjuːkʌmbə(r)/",
        "pepper": "/ˈpepə(r)/",
        "corn": "/kɔːn/",
        "wheat": "/wiːt/",
        "rice": "/raɪs/",
        "barley": "/ˈbɑːli/",
        "oats": "/əʊts/",
        "rye": "/raɪ/",
        "bean": "/biːn/",
        "pea": "/piː/",
        "lentil": "/ˈlentɪl/",
        "soybean": "/ˈsɔɪbiːn/",
        "sunflower": "/ˈsʌnflaʊə(r)/",
        "rose": "/rəʊz/",
        "tulip": "/ˈtuːlɪp/",
        "daisy": "/ˈdeɪzi/",
        "lily": "/ˈlɪli/",
        "orchid": "/ˈɔːkɪd/",
        "jasmine": "/ˈdʒæzmɪn/",
        "lavender": "/ˈlævəndə(r)/",
        "mint": "/mɪnt/",
        "basil": "/ˈbæzl/",
        "thyme": "/taɪm/",
        "rosemary": "/ˈrəʊzməri/",
        "parsley": "/ˈpɑːsli/",
        "sage": "/seɪdʒ/",
        "oregano": "/ɒrɪˈɡɑːnəʊ/",
        "coriander": "/ˌkɒriˈændə(r)/",
        "cilantro": "/sɪˈlæntrəʊ/",
        "dill": "/dɪl/",
        "fennel": "/ˈfenl/",
        "ginger": "/ˈdʒɪndʒə(r)/",
        "turmeric": "/ˈtɜːmərɪk/",
        "cinnamon": "/ˈsɪnəmən/",
        "clove": "/kləʊv/",
        "nutmeg": "/ˈnʌtmeɡ/",
        "vanilla": "/vəˈnɪlə/",
        "cocoa": "/ˈkəʊkəʊ/",
        "coffee": "/ˈkɒfi/",
        "tea": "/tiː/",
        "sugar": "/ˈʃʊɡə(r)/",
        "honey": "/ˈhʌni/",
        "syrup": "/ˈsɪrəp/",
        "nectar": "/ˈnektə(r)/"
    }
    
    if "phonetic" not in word_obj and word in plant_phonetics:
        word_obj["phonetic"] = plant_phonetics[word]
    
    return word_obj

def add_memory_tip_if_missing(word_obj):
    """为缺少记忆技巧的单词添加记忆技巧"""
    word = word_obj.get("word", "").strip()
    
    plant_tips = {
        "photosynthesis": "【词根记忆】photo(光) + synthesis(合成) = 光合作用。plants use light to make food",
        "respire": "【词根记忆】re(再) + spir(呼吸) + e = 重复呼吸。植物和动物都需要呼吸",
        "chlorophyll": "【词根记忆】chloro(绿色) + phyll(叶子) = 叶绿素，让叶子呈现绿色的物质",
        "cellulose": "【词根记忆】cell(细胞) + ulose = 纤维素，植物细胞壁的主要成分",
        "glucose": "【词根记忆】gluc(甜) + ose(糖类后缀) = 葡萄糖，最基本的糖类",
        "starch": "【联想记忆】starch像'start吃'，淀粉是能量的开始",
        "enzyme": "【联想记忆】en(内) + zyme(酵母) = 酶，体内的生化催化剂",
        "molecule": "【词根记忆】mol(堆) + ecule(小) = 分子，原子堆成的小单位",
        "tissue": "【联想记忆】像tissue paper(薄纸)一样薄的组织",
        "organism": "【词根记忆】organ(器官) + ism = 有机体，由器官组成的生物体",
        "taxonomy": "【词根记忆】tax(排列) + onomy(学科) = 分类学",
        "classification": "【词根记忆】class(分类) + ification = 分类，分门别类",
        "botany": "【词根记忆】botan(植物) + y = 植物学",
        "vegetation": "【词根记忆】veget(生长) + ation = 植被，生长的植物总称",
        "foliage": "【词根记忆】foli(叶子) + age = 叶子，树叶总称",
        "germinate": "【词根记忆】germ(芽) + inate = 发芽，种子长出嫩芽",
        "cultivate": "【词根记忆】cult(耕作) + ivate = 培养，耕作栽培",
        "harvest": "【联想记忆】harvest像'哈维斯特'，丰收的季节",
        "agriculture": "【词根记忆】agri(田地) + culture(培养) = 农业，田地里的培养",
        "horticulture": "【词根记忆】horti(花园) + culture = 园艺，花园栽培",
        "plantation": "【词根记忆】plant(种植) + ation = 种植园",
        "orchard": "【联想记忆】or(或者) + chard = 果园，各种果树的园子",
        "fertilizer": "【词根记忆】fertile(肥沃) + izer = 肥料，使土地肥沃的物质",
        "pesticide": "【词根记忆】pest(害虫) + icide(杀死) = 杀虫剂",
        "irrigation": "【词根记忆】irrig(浇水) + ation = 灌溉",
        "pollinate": "【词根记忆】pollen(花粉) + ate = 授粉，传播花粉",
        "propagate": "【词根记忆】prop(向前) + agate = 繁殖，向前传播",
        "hybrid": "【词根记忆】hybr(杂交) + id = 杂交品种",
        "perennial": "【词根记忆】per(通过) + ennial(年) = 多年生的",
        "deciduous": "【词根记忆】decid(落下) + uous = 落叶的",
        "evergreen": "【组合记忆】ever(永远) + green(绿) = 常绿的",
        "coniferous": "【词根记忆】coni(圆锥) + ferous(带有) = 针叶的，带圆锥果的",
        "herbaceous": "【词根记忆】herb(草) + aceous(有...性质) = 草本的",
        "succulent": "【词根记忆】succ(汁液) + ulent = 多汁的，多肉植物",
        "aromatic": "【词根记忆】aroma(香味) + tic = 芳香的",
        "fragrant": "【词根记忆】fragr(香) + ant = 香的，芳香的",
        "poisonous": "【词根记忆】poison(毒) + ous = 有毒的",
        "nutritious": "【词根记忆】nutri(营养) + tious = 有营养的",
        "medicinal": "【词根记忆】medicin(医学) + al = 药用的",
        "carbohydrate": "【词根记忆】carbo(碳) + hydrate(水化物) = 碳水化合物"
    }
    
    if word in plant_tips:
        word_obj["tips"] = plant_tips[word]
    elif "tips" not in word_obj or word_obj["tips"] == f"【联想记忆】将'{word}'拆分记忆，结合词根词缀理解其含义。":
        # 生成基础记忆技巧
        if len(word) <= 4:
            word_obj["tips"] = f"【基础记忆】{word} - 常用基础词汇，多次重复加深印象"
        elif "tion" in word:
            word_obj["tips"] = f"【后缀记忆】{word} - 以tion结尾的名词，表示动作或状态"
        elif word.endswith("ing"):
            word_obj["tips"] = f"【后缀记忆】{word} - 以ing结尾，表示正在进行或状态"
        elif word.endswith("ous"):
            word_obj["tips"] = f"【后缀记忆】{word} - 以ous结尾的形容词，表示'有...性质的'"
        elif word.endswith("al"):
            word_obj["tips"] = f"【后缀记忆】{word} - 以al结尾的形容词，表示'与...有关的'"
        elif word.endswith("ate"):
            word_obj["tips"] = f"【后缀记忆】{word} - 以ate结尾的动词，表示'使...'"
        else:
            word_obj["tips"] = f"【拆分记忆】将'{word}'按音节拆分，结合语境反复练习记忆"
    
    return word_obj

def add_ielts_example_if_missing(word_obj):
    """为缺少IELTS例句的单词添加例句"""
    word = word_obj.get("word", "").strip()
    
    plant_examples = {
        "photosynthesis": {
            "example": "Photosynthesis is essential for life on Earth, as it produces oxygen and converts carbon dioxide into organic compounds.",
            "translation": "光合作用对地球上的生命至关重要，因为它产生氧气并将二氧化碳转化为有机化合物。"
        },
        "respire": {
            "example": "Plants respire continuously, taking in oxygen and releasing carbon dioxide, especially during the night.",
            "translation": "植物持续进行呼吸，吸收氧气并释放二氧化碳，特别是在夜间。"
        },
        "chlorophyll": {
            "example": "The green color of leaves comes from chlorophyll, which is crucial for capturing sunlight during photosynthesis.",
            "translation": "叶子的绿色来自叶绿素，这对光合作用过程中捕获阳光至关重要。"
        },
        "germinate": {
            "example": "Seeds require the right temperature, moisture, and light conditions to germinate successfully.",
            "translation": "种子需要适当的温度、湿度和光照条件才能成功发芽。"
        },
        "cultivate": {
            "example": "Modern farmers use advanced techniques to cultivate crops more efficiently and sustainably.",
            "translation": "现代农民使用先进技术更高效、可持续地种植作物。"
        },
        "irrigation": {
            "example": "Drip irrigation systems help conserve water while ensuring plants receive adequate moisture.",
            "translation": "滴灌系统有助于节约用水，同时确保植物获得充足的水分。"
        },
        "fertilizer": {
            "example": "Organic fertilizers improve soil health and provide essential nutrients for plant growth.",
            "translation": "有机肥料改善土壤健康，为植物生长提供必需的营养。"
        },
        "ecosystem": {
            "example": "Forest ecosystems support incredible biodiversity and play a vital role in climate regulation.",
            "translation": "森林生态系统支持令人难以置信的生物多样性，在气候调节中发挥重要作用。"
        }
    }
    
    if word in plant_examples and ("example" not in word_obj or not word_obj["example"]):
        word_obj["example"] = plant_examples[word]["example"]
        word_obj["example_translation"] = plant_examples[word]["translation"]
    elif "example" in word_obj and "example_translation" not in word_obj:
        word_obj["example_translation"] = "[需要翻译]"
    
    return word_obj

def process_word(word_obj):
    """处理单个单词"""
    word_obj = add_phonetic_if_missing(word_obj)
    word_obj = add_memory_tip_if_missing(word_obj)
    word_obj = add_ielts_example_if_missing(word_obj)
    return word_obj

def process_chapter_file(filepath):
    """处理单个章节文件"""
    print(f"Processing: {filepath}")
    
    with open(filepath, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    updated_count = 0
    
    for i, word_obj in enumerate(data["words"]):
        original = json.dumps(word_obj, sort_keys=True)
        enhanced = process_word(word_obj)
        if json.dumps(enhanced, sort_keys=True) != original:
            data["words"][i] = enhanced
            updated_count += 1
    
    # 保存更新后的文件
    if updated_count > 0:
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        print(f"  Enhanced {updated_count} words")
    else:
        print(f"  No enhancements needed")
    
    return updated_count

def main():
    """主函数：处理所有章节文件"""
    json_dir = "json_chapters"
    total_updated = 0
    
    # 获取所有章节文件（排除index.json）
    chapter_files = glob.glob(os.path.join(json_dir, "*.json"))
    chapter_files = [f for f in chapter_files if not f.endswith("index.json")]
    
    print(f"Found {len(chapter_files)} chapter files to enhance\n")
    
    for filepath in chapter_files:
        updated = process_chapter_file(filepath)
        total_updated += updated
    
    print(f"\nTotal enhancements: {total_updated} words enhanced")
    print("Complete enhancement finished!")

if __name__ == "__main__":
    main()