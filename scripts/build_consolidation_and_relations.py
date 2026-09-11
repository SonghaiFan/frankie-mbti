# -*- coding: utf-8 -*-
"""
Script to build scripts/apply_consolidation_and_relations.ts.
This script implements:
1. Series consolidation (cleaning up redundant/empty series and redirecting).
2. Trait classification and normalization.
3. Dimensions and Letters entity creation and linkage.
4. Two-letter and Three-letter Groups creation and linkage.
5. 16-to-16 Type dynamic relationships (Dual, Shadow, Shared-Dominant, Quasi-Identical, Author Pairs).
6. Cognitive Function Paired Axes and 8-role Beebe functional stack for all 16 Types.
"""

import json

# 1. Dimensions and Letters definition
dimensions_data = [
    {
        "name": "精力来源",
        "code": "EI",
        "poleA": "E",
        "poleB": "I",
        "poleAName": "外向",
        "poleBName": "内向",
        "poleADesc": "从外界吸能，喜欢互动与表达",
        "poleBDesc": "从独处回血，注重内在反省与宁静"
    },
    {
        "name": "获取信息",
        "code": "SN",
        "poleA": "S",
        "poleB": "N",
        "poleAName": "实感",
        "poleBName": "直觉",
        "poleADesc": "靠五官五感，脚踏实地看事实细节",
        "poleBDesc": "靠第六感与联想，见微知著看未来可能"
    },
    {
        "name": "做决定",
        "code": "TF",
        "poleA": "T",
        "poleB": "F",
        "poleAName": "思考",
        "poleBName": "情感",
        "poleADesc": "讲逻辑因果，秉持客观公正原则",
        "poleBDesc": "讲人情感受，注重同理共鸣与人际和谐"
    },
    {
        "name": "生活方式",
        "code": "JP",
        "poleA": "J",
        "poleB": "P",
        "poleAName": "判断",
        "poleBName": "知觉",
        "poleADesc": "有计划爱掌控，追求事情的确定与闭环",
        "poleBDesc": "随性自由派，拥抱变化保持开放结局"
    }
]

letters_data = [
    {
        "code": "E",
        "name": "外向 (Extraversion)",
        "nickname": "外界吸能派",
        "definition": "注意力聚焦于外部人事物，通过人际互动与现实行动汲取能量。",
        "dimensionName": "精力来源",
        "pole": "A"
    },
    {
        "code": "I",
        "name": "内向 (Introversion)",
        "nickname": "独处回血派",
        "definition": "注意力聚焦于内在思想与反思，通过独处与静谧空间恢复能量。",
        "dimensionName": "精力来源",
        "pole": "B"
    },
    {
        "code": "S",
        "name": "实感 (Sensing)",
        "nickname": "脚踏实地派",
        "definition": "偏好具体、有形、可见的现实信息，尊重经验细节与客观事实。",
        "dimensionName": "获取信息",
        "pole": "A"
    },
    {
        "code": "N",
        "name": "直觉 (Intuition)",
        "nickname": "脑补远见派",
        "definition": "偏好抽象概念、潜在线索与未来蓝图，善于在看似无关的事物间建立联系。",
        "dimensionName": "获取信息",
        "pole": "B"
    },
    {
        "code": "T",
        "name": "思考 (Thinking)",
        "nickname": "客观逻辑派",
        "definition": "运用严密逻辑、因果分析与效率原则进行理性决策，不徇私情。",
        "dimensionName": "做决定",
        "pole": "A"
    },
    {
        "code": "F",
        "name": "情感 (Feeling)",
        "nickname": "同理关怀派",
        "definition": "运用个人价值观、群体和谐度与他人感受进行决策，注重人文关怀。",
        "dimensionName": "做决定",
        "pole": "B"
    },
    {
        "code": "J",
        "name": "判断 (Judging)",
        "nickname": "秩序掌控派",
        "definition": "偏好井井有条、计划推进与明确截止日期，追求生活的可预测性与掌控感。",
        "dimensionName": "生活方式",
        "pole": "A"
    },
    {
        "code": "P",
        "name": "知觉 (Perceiving)",
        "nickname": "随性流淌派",
        "definition": "偏好自发弹性、随机应变与探索过程，享受未知的惊喜与自由度。",
        "dimensionName": "生活方式",
        "pole": "B"
    }
]

# 2. Groups (Two-letter and Three-letter groups)
groups_data = [
    # 2-letter: Temperament
    {
        "code": "NT",
        "name": "分析家 / 紫人组",
        "type": "two_letter",
        "category": "temperament",
        "color": "purple",
        "keywords": "战略 · 理性 · 终极因果",
        "description": "追求真理底层逻辑与系统推演，具有极强的前瞻战略洞察力与傲慢底气。",
        "vividMetaphor": "端坐神庙的宏大观星者，手握物理引擎的底层代码编写者。"
    },
    {
        "code": "NF",
        "name": "理想家 / 绿人组",
        "type": "two_letter",
        "category": "temperament",
        "color": "green",
        "keywords": "纯真 · 悲悯 · 精神图腾",
        "description": "追求灵魂至纯自洽与人类大爱救赎，在受难与理想中守护人性最后的微光。",
        "vividMetaphor": "核废墟里护住纯白玫瑰的流浪王子，知世故而不世故的执剑菩萨。"
    },
    {
        "code": "SJ",
        "name": "守护者 / 蓝人组",
        "type": "two_letter",
        "category": "temperament",
        "color": "blue",
        "keywords": "秩序 · 责任 · 现实脊梁",
        "description": "人类社会对抗熵增的中流砥柱，用数十年如一日的履职尽责为生活兜底。",
        "vividMetaphor": "深埋地下数十米的坚固承重桩，三十年无声运作的恒温发电机。"
    },
    {
        "code": "SP",
        "name": "探索者 / 黄人组",
        "type": "two_letter",
        "category": "temperament",
        "color": "yellow",
        "keywords": "当下 · 自由 · 感官现充",
        "description": "活在当下的肉身自由客，敏锐捕捉物理现实刺激，拒绝内耗与虚伪装逼。",
        "vividMetaphor": "旷野上迎风狂飙的健美猎豹，漆黑夜空中引爆的灼热绚烂烟火。"
    },
    # 2-letter: Interaction / Decision
    {
        "code": "TJ",
        "name": "霸总执行组",
        "type": "two_letter",
        "category": "interaction",
        "color": "slate",
        "keywords": "铁血 · 控制 · 权利让渡",
        "description": "现实秩序的铁腕打造者，重结果讲效率；真爱唯一的标志是卸下武装让渡权力。",
        "vividMetaphor": "凯旋归来亲手奉上城门钥匙的铁血帝王。"
    },
    {
        "code": "TP",
        "name": "原理解构组",
        "type": "two_letter",
        "category": "interaction",
        "color": "cyan",
        "keywords": "极客 · 自由 · 寻找Bug",
        "description": "天生反感死板规矩，致力于拆解一切教条与机器，追求思想与操作的纯粹自由。",
        "vividMetaphor": "在引力坍塌废墟上跳踢踏舞的量子黑客。"
    },
    {
        "code": "FJ",
        "name": "博爱协调组",
        "type": "two_letter",
        "category": "interaction",
        "color": "rose",
        "keywords": "温暖 · 人情 · 情感大管家",
        "description": "把照顾全场人际氛围当成使命，情感敏锐度极高，常因过度忍让而委屈自己。",
        "vividMetaphor": "舞台上为全场端茶倒水、台下默默咽下泪水的苦修长者。"
    },
    {
        "code": "FP",
        "name": "纯真守炉组",
        "type": "two_letter",
        "category": "interaction",
        "color": "emerald",
        "keywords": "赤诚 · 真实 · 绝地反杀",
        "description": "以神圣自洽的道德良知为唯一灯塔，平日温良谦让，触碰逆鳞时玉石俱焚。",
        "vividMetaphor": "洞穴里看似毛茸茸的小兔，被逼急了能引爆原子弹同归于尽。"
    },
    # 2-letter: Lifestyle
    {
        "code": "IJ",
        "name": "内省定海针组",
        "type": "two_letter",
        "category": "lifestyle",
        "color": "indigo",
        "keywords": "深沉 · 稳健 · 晚熟大器",
        "description": "内心构建了严密的精神城堡，不随波逐流，年轻时易受孤立，岁月沉淀后展现王者底蕴。",
        "vividMetaphor": "窖藏半个世纪依然回甘无穷的绝世陈酿。"
    },
    {
        "code": "IP",
        "name": "独立工匠组",
        "type": "two_letter",
        "category": "lifestyle",
        "color": "teal",
        "keywords": "隐士 · 心流 · 极低能耗",
        "description": "在独处心流中深耕技艺，对外界喧嚣与八卦社交具有生理性免疫能力。",
        "vividMetaphor": "深山竹林里默默打造削铁利刃的隐居剑客。"
    },
    {
        "code": "EJ",
        "name": "秩序统帅组",
        "type": "two_letter",
        "category": "lifestyle",
        "color": "amber",
        "keywords": "号召 · 推进 · 现实督军",
        "description": "天生具备强大的团队号召力与执行推动力，带领团队开疆拓土、定规立制。",
        "vividMetaphor": "站在旗舰船头挥舞号令旗帜的铁血船长。"
    },
    {
        "code": "EP",
        "name": "拓荒风暴组",
        "type": "two_letter",
        "category": "lifestyle",
        "color": "orange",
        "keywords": "新鲜 · 变局 · 能量风暴",
        "description": "最擅长在动态变局中抓取机会，打破既定框架，永远在追逐下一个未知世界。",
        "vividMetaphor": "在狂风骤雨海浪尖上自如穿梭的弄潮儿。"
    },
    # 2-letter: Worldview / Energy
    {
        "code": "IN",
        "name": "精神隐士组",
        "type": "two_letter",
        "category": "worldview",
        "color": "violet",
        "keywords": "深海 · 异类 · 穿透虚伪",
        "description": "内向直觉高维感知者，天然看透世俗假面，容易在低维群体中被误解和针对。",
        "vividMetaphor": "泥土油灯洞穴里突然走入的发光异星人。"
    },
    {
        "code": "EN",
        "name": "破局造梦组",
        "type": "two_letter",
        "category": "worldview",
        "color": "sky",
        "keywords": "宏大 · 灵感 · 时代先锋",
        "description": "将脑中浩瀚的灵感火花向外投射，带领众人绘制新世界地图的梦想导师。",
        "vividMetaphor": "在黑暗大地上点燃第一簇篝火的盗火者普罗米修斯。"
    },
    {
        "code": "IS",
        "name": "沉默压舱组",
        "type": "two_letter",
        "category": "worldview",
        "color": "blue",
        "keywords": "细节 · 靠谱 · 默默守护",
        "description": "将所有深情注入现实后勤保障中，话最少但手脚最勤快的人间守望者。",
        "vividMetaphor": "风雨夜里默默为家人备好热汤与雨伞的扫地僧。"
    },
    {
        "code": "ES",
        "name": "人间现充组",
        "type": "two_letter",
        "category": "worldview",
        "color": "lime",
        "keywords": "鲜活 · 敏锐 · 生活的主人",
        "description": "身手敏捷、热情拥抱生活万象的大地之子，把每一个日子过得热气腾腾。",
        "vividMetaphor": "大口吃肉大碗喝酒、在阳光沙滩上开怀大笑的游侠。"
    },

    # 3-letter: Core Archetypes
    {
        "code": "xTJ",
        "name": "霸总四人组",
        "type": "three_letter",
        "category": "archetype",
        "color": "slate",
        "keywords": "权利让渡 · 终极忠诚 · 控制狂",
        "description": "INTJ, ENTJ, ISTJ, ESTJ四人组。现实权力的掌控者，爱上一个人是把刀柄递到对方手里。",
        "vividMetaphor": "摘下皇冠为伴侣筑起百米防震基座的护城主帅。"
    },
    {
        "code": "xTP",
        "name": "极客解构组",
        "type": "three_letter",
        "category": "archetype",
        "color": "cyan",
        "keywords": "纯粹逻辑 · 物理实操 · 破除教条",
        "description": "INTP, ENTP, ISTP, ESTP四人组。世间一切运转逻辑的拆解者，追求纯粹智力与实操自由。",
        "vividMetaphor": "戴着防风镜把复杂系统大卸八块后重装的超级发明家。"
    },
    {
        "code": "xNF",
        "name": "高敏共情组",
        "type": "three_letter",
        "category": "archetype",
        "color": "green",
        "keywords": "精神图腾 · 神圣自洽 · 执剑菩萨",
        "description": "INFP, ENFP, INFJ, ENFJ四人组。人类良知底线的守望者，在世俗泥潭中开出一品青莲。",
        "vividMetaphor": "受难千百度依然为一朵花掉眼泪的灵魂渡人舟。"
    },
    {
        "code": "xSF",
        "name": "温情陪伴组",
        "type": "three_letter",
        "category": "archetype",
        "color": "pink",
        "keywords": "现实温度 · 后勤天使 · 当下美学",
        "description": "ISFP, ESFP, ISFJ, ESFJ四人组。用具象的照料与感官体验让身边人感受到活着的幸福。",
        "vividMetaphor": "冬日里冒着热气的养胃汤与夏夜里一起奔向的晚霞。"
    },
    # 3-letter: Orientation
    {
        "code": "INx",
        "name": "深海异类高敏组",
        "type": "three_letter",
        "category": "orientation",
        "color": "violet",
        "keywords": "异类 · 测谎仪 · 被针对宿命",
        "description": "INTJ, INTP, INFJ, INFP四人组。自带穿透性磁场，看透世俗虚伪，常成平庸群体孤立靶子。",
        "vividMetaphor": "装睡人群中唯一睁着眼睛直视深渊的无辜孩童。"
    },
    {
        "code": "ENx",
        "name": "时代破局拓荒组",
        "type": "three_letter",
        "category": "orientation",
        "color": "sky",
        "keywords": "宏大叙事 · 破局者 · 混乱善良",
        "description": "ENTJ, ENTP, ENFJ, ENFP四人组。天生为颠覆旧秩序而生，带领众人在废墟上建造新世界。",
        "vividMetaphor": "大风暴中吹响冲锋号角的破晓先锋。"
    },
    {
        "code": "ISx",
        "name": "沉默基石守护组",
        "type": "three_letter",
        "category": "orientation",
        "color": "blue",
        "keywords": "定海神针 · 靠谱踏实 · 沉默后盾",
        "description": "ISTJ, ISFJ, ISTP, ISFP四人组。不求聚光灯，用双手和岁月默默为整个家庭与社会筑起护城河。",
        "vividMetaphor": "无声扎根在大地深处抗击风暴的参天古木。"
    },
    {
        "code": "ESx",
        "name": "人间烟火现充组",
        "type": "three_letter",
        "category": "orientation",
        "color": "lime",
        "keywords": "现充 · 迅猛 · 生命力爆发",
        "description": "ESTJ, ESFJ, ESTP, ESFP四人组。世俗舞台的核心力量，行动迅捷，尽情领略三维人间万千滋味。",
        "vividMetaphor": "阳光下纵情驰骋、把每个日子过得风风火火的弄潮客。"
    },
    # 3-letter: Fine Specific
    {
        "code": "NTJ",
        "name": "战略统帅组",
        "type": "three_letter",
        "category": "fine",
        "color": "purple",
        "keywords": "宏图 · 铁腕 · 终局落地",
        "description": "INTJ与ENTJ。明暗双帝王，算无遗策，以战略宏图重塑现实版图。"
    },
    {
        "code": "NTP",
        "name": "逻辑思辨组",
        "type": "three_letter",
        "category": "fine",
        "color": "purple",
        "keywords": "纯粹真理 · 思想实验 · 辩论破壁",
        "description": "INTP与ENTP。不受世俗常识捆绑，以宇宙级好奇心破译一切假象。"
    },
    {
        "code": "NFJ",
        "name": "精神导师组",
        "type": "three_letter",
        "category": "fine",
        "color": "green",
        "keywords": "天下大同 · 宏大悲悯 · 灵魂镜像",
        "description": "INFJ与ENFJ。照亮众生的太阳与镜面，以全员共赢为宿命愿景。"
    },
    {
        "code": "NFP",
        "name": "纯爱造梦组",
        "type": "three_letter",
        "category": "fine",
        "color": "green",
        "keywords": "永恒初恋 · 精神火花 · 赤子诗篇",
        "description": "INFP与ENFP。追逐灵性火花与至纯爱意，每一段感情都倾注百分之百真心。"
    },
    {
        "code": "STJ",
        "name": "秩序行政组",
        "type": "three_letter",
        "category": "fine",
        "color": "blue",
        "keywords": "规章制度 · 铁血执行 · 现实主心骨",
        "description": "ISTJ与ESTJ。社会的制度保障与铁律捍卫者，严守承诺，办事靠谱无懈可击。"
    },
    {
        "code": "STP",
        "name": "战术实操组",
        "type": "three_letter",
        "category": "fine",
        "color": "yellow",
        "keywords": "冷钢利刃 · 危机应变 · 现实捕手",
        "description": "ISTP与ESTP。物理实操大师与商战猎犬，在危机与突发状况中展现超神反应力。"
    },
    {
        "code": "SFJ",
        "name": "温暖守护组",
        "type": "three_letter",
        "category": "fine",
        "color": "blue",
        "keywords": "细致入微 · 人情周全 · 习惯性付出",
        "description": "ISFJ与ESFJ。润滑人际关系的活菩萨，用无私后勤为身边人带来家的安全感。"
    },
    {
        "code": "SFP",
        "name": "旷野美学组",
        "type": "three_letter",
        "category": "fine",
        "color": "yellow",
        "keywords": "感官盛宴 · 当下美学 · 真实通透",
        "description": "ISFP与ESFP。不许诺虚无的未来，用全额身心沉浸在当下的艺术与心跳中。"
    }
]

# 3. 16-to-16 Type Dynamics relationships
type_relations_data = {
    "dual": [
        ("INTJ", "ESFP", "天作之合 / 极性互补", "Ni-Te-Fi-Se 与 Se-Fi-Te-Ni 终极四维完全镜像互补：深海灯塔找到狂欢暖阳，旷野巨星获得永恒定海锚。"),
        ("INTP", "ESFJ", "天作之合 / 极性互补", "Ti-Ne-Si-Fe 与 Fe-Si-Ne-Ti 极致互补：轮椅思想家被温柔拉入人间烟火，大管家从纯粹理性中获得笃定解脱。"),
        ("INFJ", "ESTP", "天作之合 / 极性互补", "Ni-Fe-Ti-Se 与 Se-Ti-Fe-Ni 极道合体：扫地僧获得破局猎犬的现实肉身冲劲，猎犬在迷茫时得到神明般的深渊指引。"),
        ("INFP", "ESTJ", "天作之合 / 极性互补", "Fi-Ne-Si-Te 与 Te-Si-Ne-Fi 铁骨柔情：小蝴蝶的纯洁精神殿堂被钢铁战车坚固守护，铁血督军在柔弱纯善前缴械投降。"),
        ("ENTP", "ISFJ", "天作之合 / 极性互补", "Ne-Ti-Fe-Si 与 Si-Fe-Ti-Ne 奇妙共生：拆弹狂徒的满天脑洞被恒温后勤温柔接纳，自责小护士在疯狂幽默中被彻底治愈。"),
        ("ENTJ", "ISFP", "天作之合 / 极性互补", "Te-Ni-Se-Fi 与 Fi-Se-Ni-Te 王者与灵雀：帝国开疆统帅为纯真艺术家劈开世俗污秽，艺术家的旷野灵性唤醒暴君深藏的柔情。"),
        ("ENFJ", "ISTP", "天作之合 / 极性互补", "Fe-Ni-Se-Ti 与 Ti-Se-Ni-Fe 救赎与冷锋：太阳君王用无限大爱融化孤狼刺客心底坚冰，冷面刺客用无声利刃为君王挡下明枪暗箭。"),
        ("ENFP", "ISTJ", "天作之合 / 极性互补", "Ne-Fi-Te-Si 与 Si-Te-Fi-Ne 初恋小狗与背景板：金色寻回犬把快乐与新鲜感注入古板长者生活，帝国背景板为小狗筑起永不塌方的现实金钟罩。")
    ],
    "shadow": [
        ("INTJ", "ENTP", "四维阴影转换", "Ni-Te-Fi-Se 对应 Ne-Ti-Fe-Si：主导直觉内外翻转，INTJ在极端应激时爆发为玩世不恭疯狂反抗的杠精毁灭者。"),
        ("INFJ", "ENFP", "四维阴影转换", "Ni-Fe-Ti-Se 对应 Ne-Fi-Te-Si：内敛神官应激翻转为狂暴整活的小太阳，表面放肆欢闹心底冷眼审判。"),
        ("INTP", "ENTJ", "四维阴影转换", "Ti-Ne-Si-Fe 对应 Te-Ni-Se-Fi：轮椅隐士被逼上绝路时唤醒冷血暴君人格，雷厉风行寸草不生。"),
        ("INFP", "ENFJ", "四维阴影转换", "Fi-Ne-Si-Te 对应 Fe-Ni-Se-Ti：纯情守炉人黑化为道德裹挟的救赎独裁者，以大爱之名行专制之实。"),
        ("ISTJ", "ESTP", "四维阴影转换", "Si-Te-Fi-Ne 对应 Se-Ti-Fe-Ni：按部就班的规矩守护者在体系崩溃后暴走为不计后果的疯狂赌徒。"),
        ("ISFJ", "ESFP", "四维阴影转换", "Si-Fe-Ti-Ne 对应 Se-Fi-Te-Ni：习惯性牺牲的老好人被逼至绝境后陷入极度利己的感官放纵与报复狂欢。"),
        ("ISTP", "ESTJ", "四维阴影转换", "Ti-Se-Ni-Fe 对应 Te-Si-Ne-Fi：独行刺客在面对失序危机时接管大局，化身为冷酷严苛的阵地督军。"),
        ("ISFP", "ESFJ", "四维阴影转换", "Fi-Se-Ni-Te 对应 Fe-Si-Ne-Ti：清冷自洽的旷野艺术家在绝望中被迫演变成过度讨好与控制全场的情感怨妇。")
    ],
    "dominant": [
        ("INTJ", "INFJ", "Ni-dom 英雄同盟", "共享内倾直觉Ni主导：一眼洞穿三十年因果宿命，心怀造物主完美蓝图，同受劣势Se身心解离之苦。"),
        ("ENTP", "ENFP", "Ne-dom 英雄同盟", "共享外倾直觉Ne主导：脑内宇宙大爆炸发生器，捕捉万物联想可能，对沉闷教条有着生理性排斥。"),
        ("ISTJ", "ISFJ", "Si-dom 英雄同盟", "共享内倾感觉Si主导：沉淀千年历史秩序与经验细节，社会的稳定压舱石，默默承受现实繁琐脏活。"),
        ("ESTP", "ESFP", "Se-dom 英雄同盟", "共享外倾感觉Se主导：毫秒级肉身感官捕捉与当下沉浸，不装不端的大地自由客，生命力极度旺盛。"),
        ("INTP", "ISTP", "Ti-dom 英雄同盟", "共享内倾思维Ti主导：追求宇宙终极纯粹自洽与逻辑解构，惜字如金的低能耗精神隐士。"),
        ("ENTJ", "ESTJ", "Te-dom 英雄同盟", "共享外倾思维Te主导：现实世界的高效铁腕管理者，结果导向不徇私情，以无可置疑的战绩说话。"),
        ("INFP", "ISFP", "Fi-dom 英雄同盟", "共享内倾情感Fi主导：坚守绝对不可触碰的内在道德神殿，温和包容却绝不出卖灵魂，赤子初心。"),
        ("ENFJ", "ESFJ", "Fe-dom 英雄同盟", "共享外倾情感Fe主导：社群凝聚力与人际润滑核心，本能照顾全场所有人，极度渴望被真诚看见。")
    ],
    "quasi": [
        ("INTJ", "INTP", "半同构智力伙伴", "仅生活方式 J/P 差异：一个收敛闭环建系统，一个发散破壁找漏洞；并肩坐在一起就能破译一切密码。"),
        ("INFJ", "INFP", "半同构心灵伙伴", "仅生活方式 J/P 差异：一个以宏观镜面度化众生，一个以纯粹自洽守卫神圣；深山幽谷里的惺惺相惜。"),
        ("ENTJ", "ENTP", "半同构破局盟友", "仅生活方式 J/P 差异：一个雷霆统帅攻城拔寨，一个混乱先锋炸开城门；双王联手天下莫敢争锋。"),
        ("ENFJ", "ENFP", "半同构太阳联盟", "仅生活方式 J/P 差异：一个搭建理想国大舞台，一个在舞台中心疯狂造梦点亮快乐；永不落幕的双子星。"),
        ("ISTJ", "ISTP", "半同构工匠战友", "仅生活方式 J/P 差异：一个严守制度与物资后勤，一个抄起工具解决突发物理故障；最踏实的现实保障。"),
        ("ISFJ", "ISFP", "半同构温柔天使", "仅生活方式 J/P 差异：一个细致入微端茶倒水，一个温润如玉抚平创伤；无声守护人间的两枚温润宝玉。"),
        ("ESTJ", "ESTP", "半同构现实先锋", "仅生活方式 J/P 差异：一个制定严格作战方略，一个化身特种战术尖刀前线突刺；铁血高效战无不胜。"),
        ("ESFJ", "ESFP", "半同构欢聚使者", "仅生活方式 J/P 差异：一个周全安排宴席礼数，一个闪耀舞台点燃全场狂欢；人间烟火最绚丽的盛会。")
    ],
    "author_pairs": [
        ("INTJ", "INFP", "安定虐恋组 / 终极互补", "表面看是INFP不安定，内核是INTJ不满足；INTJ早熟少年得志中年易陷虚无，INFP晚熟青年挣扎中年毛毛虫破茧成蝶；长处互为解药。"),
        ("INFP", "ISTP", "邪门倾斜组合 / 诗人与刺客", "第524条揭秘：吟游诗人在云端唱哭长夜，冷血刺客默默收刀入鞘点燃篝火；语言不通却能在无言凝视中互相托举，冷钢为纯洁灵魂劈开泥潭。"),
        ("ENTP", "INFJ", "智力博弈 / 拆弹专家与扫地僧", "拆弹狂徒的满天挑衅遇到扫地僧的深渊镜面；相互看穿对方的装逼与脆弱，在智力与灵魂深处棋逢对手、终生纠缠。"),
        ("INTJ", "ENTJ", "装王之争 / 幕后影子与台前大帝", "第507条揭秘：一个低调避世在脑中给所有人写判词，一个西装革履气场两米八用战绩碾压全场；双装王碰面，空气骤降十度。"),
        ("ENFJ", "ENFP", "太阳君王与初恋小狗", "太阳君王搭建宏大理想国，金色寻回犬热烈嗅过每一朵花；当小狗疲倦委屈时，君王是他唯一不设考核门槛的永恒避风港。"),
        ("ISTJ", "ISFJ", "现实定海双保险", "一个提供全部物资修好车锁，一个备齐防寒衣物端出热汤；不会甜言蜜语，却用日复一日的稳定为小家筑起金钟罩。"),
        ("ESTP", "ESFP", "旷野感官双星", "夏日沿海公路上踩满油门的狂飙者；拒绝一切宏大叙事与无病呻吟，真诚赤裸面对欲望，把每一个当下过成永恒。")
    ]
}

# 4. Cognitive Function 4-Axes & Beebe 8-Role functional stack
function_axes = [
    {
        "funcA": "Ni",
        "funcB": "Se",
        "name": "感知轴：时间穿透与当下肉身",
        "category": "Perception",
        "description": "Ni负责远期因果收敛与本质穿透，Se负责即时物理现实与感官掌控；二者互为阴阳平衡，过度偏枯会导致脱离现实或深层焦虑。"
    },
    {
        "funcA": "Ne",
        "funcB": "Si",
        "name": "感知轴：可能性发散与历史经验锚定",
        "category": "Perception",
        "description": "Ne负责无边界联想与模式创新，Si负责历史细节沉淀与身体记忆；二者互为依托，缺乏Si则灵感空转，缺乏Ne则固步自封。"
    },
    {
        "funcA": "Ti",
        "funcB": "Fe",
        "name": "判断轴：内在自洽真理与外部人际场域",
        "category": "Judging",
        "description": "Ti负责个人内在逻辑模型精准性，Fe负责外部群体情感和谐与共鸣；二者对冲平衡，过度Ti显冷酷尖酸，过度Fe显无底线讨好。"
    },
    {
        "funcA": "Te",
        "funcB": "Fi",
        "name": "判断轴：客观组织效能与内在崇高真纯",
        "category": "Judging",
        "description": "Te负责外部系统资源高效调配与结果达成，Fi负责内在神圣道德准则与真我信仰；二者互为支撑，Te赋予Fi现实力量，Fi赋予Te灵魂方向。"
    }
]

# 16 Types complete 8-Function Beebe Stack:
# Order: [Hero (1), Parent (2), Child (3), Inferior (4), Opposing (5), CriticalParent (6), Trickster (7), Demon (8)]
beebe_stacks = {
    "INTJ": ["Ni", "Te", "Fi", "Se", "Ne", "Ti", "Fe", "Si"],
    "INTP": ["Ti", "Ne", "Si", "Fe", "Te", "Ni", "Se", "Fi"],
    "ENTJ": ["Te", "Ni", "Se", "Fi", "Ti", "Ne", "Fi", "Fe"], # wait: ENTJ: Te, Ni, Se, Fi, Ti, Ne, Si, Fe
    "ENTP": ["Ne", "Ti", "Fe", "Si", "Ni", "Te", "Fi", "Se"],
    "INFJ": ["Ni", "Fe", "Ti", "Se", "Ne", "Fi", "Te", "Si"],
    "INFP": ["Fi", "Ne", "Si", "Te", "Fe", "Ni", "Se", "Ti"],
    "ENFJ": ["Fe", "Ni", "Se", "Ti", "Fi", "Ne", "Si", "Te"],
    "ENFP": ["Ne", "Fi", "Te", "Si", "Ni", "Fe", "Ti", "Se"],
    "ISTJ": ["Si", "Te", "Fi", "Ne", "Se", "Ti", "Fe", "Ni"],
    "ISFJ": ["Si", "Fe", "Ti", "Ne", "Se", "Fi", "Te", "Ni"],
    "ESTJ": ["Te", "Si", "Ne", "Fi", "Ti", "Se", "Ni", "Fe"],
    "ESFJ": ["Fe", "Si", "Ne", "Ti", "Fi", "Se", "Ni", "Te"],
    "ISTP": ["Ti", "Se", "Ni", "Fe", "Te", "Si", "Ne", "Fi"],
    "ISFP": ["Fi", "Se", "Ni", "Te", "Fe", "Si", "Ne", "Ti"],
    "ESTP": ["Se", "Ti", "Fe", "Ni", "Si", "Te", "Fi", "Ne"],
    "ESFP": ["Se", "Fi", "Te", "Ni", "Si", "Fe", "Ti", "Ne"]
}

# Fix ENTJ 8-stack:
beebe_stacks["ENTJ"] = ["Te", "Ni", "Se", "Fi", "Ti", "Ne", "Si", "Fe"]

# Archetype roles for slots 1-8
beebe_roles = [
    {"slot": 1, "role": "Hero", "cnRole": "英雄 / 主导功能", "desc": "最自然、最自如的意识呼吸方式，个体信心的根本支柱"},
    {"slot": 2, "role": "Parent", "cnRole": "好父母 / 辅助功能", "desc": "关照自我与护佑他人的健康工具，连接主导与现实的桥梁"},
    {"slot": 3, "role": "Child", "cnRole": "永恒神童 / 第三功能", "desc": "玩乐、创造力与深层自卑不安全感的源泉，极易盲目自负"},
    {"slot": 4, "role": "Inferior", "cnRole": "阿尼玛/劣势功能", "desc": "最脆弱的软肋与阿喀琉斯之踵，终生修行的门槛与自性化钥匙"},
    {"slot": 5, "role": "Opposing", "cnRole": "相对角色 / 第五功能", "desc": "阴影入口，在受到主导功能威胁时本能激起的防卫对抗特质"},
    {"slot": 6, "role": "CriticalParent", "cnRole": "苛刻长辈/魔女 / 第六功能", "desc": "内心无情的审判者，对自己苛责挑剔，对他人无情批判"},
    {"slot": 7, "role": "Trickster", "cnRole": "欺诈者/盲点 / 第七功能", "desc": "最盲目的短板与误解发生器，常常以荒诞方式制造麻烦"},
    {"slot": 8, "role": "Demon", "cnRole": "恶魔转化者 / 第八功能", "desc": "极限应激下的自毁深渊，亦是破茧重生的终极潜能转化炉"}
]

print("Built comprehensive definitions for graph consolidation & relations.")

# Generate scripts/apply_consolidation_and_relations.ts
ts_code = f"""import fs from "node:fs";
import path from "node:path";
import neo4j from "neo4j-driver";

const rootDir = process.cwd();

function loadEnv() {{
  const envFiles = [".env.local", ".env"];
  for (const file of envFiles) {{
    const fullPath = path.join(rootDir, file);
    if (fs.existsSync(fullPath)) {{
      const content = fs.readFileSync(fullPath, "utf-8");
      content.split("\\n").forEach((line) => {{
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) return;
        const eqIdx = trimmed.indexOf("=");
        if (eqIdx > 0) {{
          const key = trimmed.slice(0, eqIdx).trim();
          let val = trimmed.slice(eqIdx + 1).trim();
          if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {{
            val = val.slice(1, -1);
          }}
          if (!process.env[key]) {{
            process.env[key] = val;
          }}
        }}
      }});
    }}
  }}
}}

const dimensionsData = {json.dumps(dimensions_data, ensure_ascii=False, indent=2)};
const lettersData = {json.dumps(letters_data, ensure_ascii=False, indent=2)};
const groupsData = {json.dumps(groups_data, ensure_ascii=False, indent=2)};
const typeRelationsData = {json.dumps(type_relations_data, ensure_ascii=False, indent=2)};
const functionAxes = {json.dumps(function_axes, ensure_ascii=False, indent=2)};
const beebeStacks = {json.dumps(beebe_stacks, ensure_ascii=False, indent=2)};
const beebeRoles = {json.dumps(beebe_roles, ensure_ascii=False, indent=2)};

async function applyConsolidationAndRelations() {{
  loadEnv();

  const uri = process.env.NEO4J_URI || process.env.NEXT_PUBLIC_NEO4J_URI;
  const username = process.env.NEO4J_USERNAME || process.env.NEXT_PUBLIC_NEO4J_USERNAME;
  const password = process.env.NEO4J_PASSWORD || process.env.NEXT_PUBLIC_NEO4J_PASSWORD;

  if (!uri || !username || !password) {{
    throw new Error("Missing Neo4j connection parameters in environment variables!");
  }}

  console.log(`Connecting to Neo4j at ${{uri}}...`);
  const driver = neo4j.driver(uri, neo4j.auth.basic(username, password));
  const session = driver.session();

  try {{
    console.log("=== 1. CONSOLIDATING SERIES NODES ===");
    // Redirect duplicate Series to canonical Series
    await session.run(`
      MATCH (ins:Insight)-[r:BELONGS_TO_SERIES]->(sOld:Series)
      WHERE sOld.name IN ['亲密关系与恋爱全流程', '亲密关系与恋爱真相']
      MATCH (sNew:Series {name: '亲密关系与情感解构'})
      MERGE (ins)-[:BELONGS_TO_SERIES]->(sNew)
      DELETE r
    `);
    await session.run(`
      MATCH (ins:Insight)-[r:BELONGS_TO_SERIES]->(sOld:Series)
      WHERE sOld.name IN ['四大组别的终极心性修行', '高阶心性修炼']
      MATCH (sNew:Series {name: '进阶提升与成长指南'})
      MERGE (ins)-[:BELONGS_TO_SERIES]->(sNew)
      DELETE r
    `);
    await session.run(`
      MATCH (ins:Insight)-[r:BELONGS_TO_SERIES]->(sOld:Series)
      WHERE sOld.name = '误测与形态代偿'
      MATCH (sNew:Series {name: '误测与形态自救'})
      MERGE (ins)-[:BELONGS_TO_SERIES]->(sNew)
      DELETE r
    `);

    // Clean up empty Series nodes
    const delRes = await session.run(`
      MATCH (s:Series)
      WHERE NOT (s)<-[:BELONGS_TO_SERIES]-()
      DELETE s
      RETURN count(s) AS deletedCount
    `);
    console.log(`Consolidated series. Removed ${{delRes.records[0].get("deletedCount").toNumber()}} empty Series nodes.`);

    console.log("\\n=== 2. CATEGORIZING AND STRUCTURING TRAIT NODES ===");
    // Categorize traits into strength, weakness, surface, actual
    await session.run(`
      MATCH (tr:Trait)
      SET tr.category = CASE
        WHEN tr.name =~ '.*(易|不|难|怕|差|累|焦虑|固执|强迫|拖延|脆弱|纠结|内耗|自卑|自责).*' THEN 'weakness'
        WHEN tr.name =~ '.*(善于|擅于|强|准|快|好|敏锐|坚定|独立|果断|深刻|洞察|专注|自律|执着).*' THEN 'strength'
        WHEN tr.name =~ '.*(表面|礼貌|活泼|随和|热情|假笑|冷淡|客观|温和|客气).*' THEN 'surface'
        ELSE 'actual'
      END
    `);
    const traitStat = await session.run(`
      MATCH (tr:Trait)
      RETURN tr.category AS cat, count(tr) AS cnt
    `);
    console.log("Trait Category Breakdown:");
    traitStat.records.forEach(r => console.log(` - ${{r.get("cat")}}: ${{r.get("cnt").toNumber()}}`));

    console.log("\\n=== 3. CREATING DIMENSIONS AND LETTERS ENTITIES ===");
    // 3.1 Dimensions
    for (const d of dimensionsData) {{
      await session.run(
        `MERGE (dim:Dimension {name: $name})
         SET dim.code = $code,
             dim.poleA = $poleA,
             dim.poleB = $poleB,
             dim.poleAName = $poleAName,
             dim.poleBName = $poleBName,
             dim.poleADesc = $poleADesc,
             dim.poleBDesc = $poleBDesc,
             dim.updatedAt = datetime()`,
        d
      );
    }}
    console.log("Ensured 4 Dimension nodes.");

    // 3.2 Letters
    for (const l of lettersData) {{
      await session.run(
        `MERGE (let:Letter {code: $code})
         SET let.name = $name,
             let.nickname = $nickname,
             let.definition = $definition,
             let.pole = $pole,
             let.updatedAt = datetime()
         WITH let
         MATCH (dim:Dimension {name: $dimensionName})
         MERGE (let)-[:BELONGS_TO_DIMENSION]->(dim)`,
        l
      );
    }}
    console.log("Ensured 8 Letter nodes and linked to Dimensions.");

    // 3.3 Link all 16 Types to their 4 constituent Letters
    const typesRes = await session.run(`MATCH (t:Type) RETURN t.code AS code`);
    for (const rec of typesRes.records) {{
      const code = rec.get("code");
      if (typeof code === "string" && code.length === 4) {{
        const [l1, l2, l3, l4] = code.split("");
        await session.run(
          `MATCH (t:Type {code: $code})
           MATCH (let1:Letter {code: $l1})
           MATCH (let2:Letter {code: $l2})
           MATCH (let3:Letter {code: $l3})
           MATCH (let4:Letter {code: $l4})
           MERGE (t)-[:COMPOSED_OF {slot: 1}]->(let1)
           MERGE (t)-[:COMPOSED_OF {slot: 2}]->(let2)
           MERGE (t)-[:COMPOSED_OF {slot: 3}]->(let3)
           MERGE (t)-[:COMPOSED_OF {slot: 4}]->(let4)`,
          {{ code, l1, l2, l3, l4 }}
        );
      }}
    }}
    console.log("Linked all 16 Types to their 4 constituent Letters.");

    console.log("\\n=== 4. CREATING TWO-LETTER AND THREE-LETTER GROUPS ===");
    for (const g of groupsData) {{
      await session.run(
        `MERGE (grp:Group {code: $code})
         SET grp.name = $name,
             grp.type = $type,
             grp.category = $category,
             grp.color = $color,
             grp.keywords = $keywords,
             grp.description = $description,
             grp.vividMetaphor = $vividMetaphor,
             grp.updatedAt = datetime()`,
        {{
          code: g.code,
          name: g.name,
          type: g.type,
          category: g.category,
          color: g.color || "slate",
          keywords: g.keywords || "",
          description: g.description || "",
          vividMetaphor: g.vividMetaphor || ""
        }}
      );
    }}
    console.log(`Ensured ${{groupsData.length}} Group nodes (Two-letter & Three-letter).`);

    // Connect Types to Groups based on pattern matching
    const allTypes = ["INTJ", "INTP", "ENTJ", "ENTP", "INFJ", "INFP", "ENFJ", "ENFP", "ISTJ", "ISFJ", "ESTJ", "ESFJ", "ISTP", "ISFP", "ESTP", "ESFP"];
    for (const tCode of allTypes) {{
      for (const g of groupsData) {{
        let isMatch = false;
        const gCode = g.code;

        if (g.type === "two_letter") {{
          // 2 letters: check if both letters are in tCode
          const [c1, c2] = gCode.split("");
          if (tCode.includes(c1) && tCode.includes(c2)) {{
            isMatch = true;
          }}
        }} else if (g.type === "three_letter") {{
          if (gCode.startsWith("x")) {{
            // e.g. xTJ -> check if ends with TJ
            const suffix = gCode.slice(1);
            if (tCode.endsWith(suffix) || (tCode.includes(suffix[0]) && tCode.includes(suffix[1]))) {{
              isMatch = true;
            }}
          }} else if (gCode.endsWith("x")) {{
            // e.g. INx -> check if starts with IN
            const prefix = gCode.slice(0, 2);
            if (tCode.startsWith(prefix)) {{
              isMatch = true;
            }}
          }} else {{
            // exact 3 letters subset: e.g. NTJ, NTP, NFJ...
            const [c1, c2, c3] = gCode.split("");
            if (tCode.includes(c1) && tCode.includes(c2) && tCode.includes(c3)) {{
              isMatch = true;
            }}
          }}
        }}

        if (isMatch) {{
          await session.run(
            `MATCH (t:Type {code: $tCode})
             MATCH (g:Group {code: $gCode})
             MERGE (t)-[r:BELONGS_TO_GROUP]->(g)
             SET r.category = $category, r.type = $type`,
            {{ tCode, gCode, category: g.category, type: g.type }}
          );
        }}
      }}
    }}
    console.log("Interconnected all 16 Types to Two-letter & Three-letter Groups.");

    console.log("\\n=== 5. BUILDING 16-TO-16 TYPE DYNAMIC RELATIONSHIPS ===");
    // 5.1 Dual Complements
    for (const [t1, t2, name, desc] of typeRelationsData.dual) {{
      await session.run(
        `MATCH (a:Type {code: $t1}), (b:Type {code: $t2})
         MERGE (a)-[r1:DUAL_COMPLEMENT]->(b)
         SET r1.name = $name, r1.description = $desc
         MERGE (b)-[r2:DUAL_COMPLEMENT]->(a)
         SET r2.name = $name, r2.description = $desc`,
        {{ t1, t2, name, desc }}
      );
    }}
    console.log("Built 8 Dual Complement pairs (16 relationships).");

    // 5.2 Shadow Mirrors
    for (const [t1, t2, name, desc] of typeRelationsData.shadow) {{
      await session.run(
        `MATCH (a:Type {code: $t1}), (b:Type {code: $t2})
         MERGE (a)-[r1:SHADOW_MIRROR]->(b)
         SET r1.name = $name, r1.description = $desc
         MERGE (b)-[r2:SHADOW_MIRROR]->(a)
         SET r2.name = $name, r2.description = $desc`,
        {{ t1, t2, name, desc }}
      );
    }}
    console.log("Built 8 Shadow Mirror pairs (16 relationships).");

    // 5.3 Shared Dominant Heroes
    for (const [t1, t2, name, desc] of typeRelationsData.dominant) {{
      await session.run(
        `MATCH (a:Type {code: $t1}), (b:Type {code: $t2})
         MERGE (a)-[r1:SHARED_DOMINANT]->(b)
         SET r1.name = $name, r1.description = $desc
         MERGE (b)-[r2:SHARED_DOMINANT]->(a)
         SET r2.name = $name, r2.description = $desc`,
        {{ t1, t2, name, desc }}
      );
    }}
    console.log("Built 8 Shared Dominant pairs (16 relationships).");

    // 5.4 Quasi-Identical Partners
    for (const [t1, t2, name, desc] of typeRelationsData.quasi) {{
      await session.run(
        `MATCH (a:Type {code: $t1}), (b:Type {code: $t2})
         MERGE (a)-[r1:QUASI_IDENTICAL]->(b)
         SET r1.name = $name, r1.description = $desc
         MERGE (b)-[r2:QUASI_IDENTICAL]->(a)
         SET r2.name = $name, r2.description = $desc`,
        {{ t1, t2, name, desc }}
      );
    }}
    console.log("Built 8 Quasi-Identical pairs (16 relationships).");

    // 5.5 Author Pairs
    for (const [t1, t2, name, desc] of typeRelationsData.author_pairs) {{
      await session.run(
        `MATCH (a:Type {code: $t1}), (b:Type {code: $t2})
         MERGE (a)-[r1:PAIR_DYNAMIC]->(b)
         SET r1.name = $name, r1.description = $desc
         MERGE (b)-[r2:PAIR_DYNAMIC]->(a)
         SET r2.name = $name, r2.description = $desc`,
        {{ t1, t2, name, desc }}
      );
    }}
    console.log("Built 7 Author Special Pair Dynamics (14 relationships).");

    console.log("\\n=== 6. JUNG COGNITIVE AXES & BEEBE 8-FUNCTION STACK ===");
    // 6.1 Paired Axes
    for (const ax of functionAxes) {{
      await session.run(
        `MATCH (a:Function {code: $funcA}), (b:Function {code: $funcB})
         MERGE (a)-[r1:PAIRED_AXIS]->(b)
         SET r1.name = $name, r1.category = $category, r1.description = $description
         MERGE (b)-[r2:PAIRED_AXIS]->(a)
         SET r2.name = $name, r2.category = $category, r2.description = $description`,
        ax
      );
    }}
    console.log("Built 4 Functional Paired Axes (8 relationships).");

    // 6.2 Full 8-Function Beebe Stack for all 16 Types
    for (const tCode of allTypes) {{
      const stack = beebeStacks[tCode];
      for (let i = 0; i < 8; i++) {{
        const slot = i + 1;
        const funcCode = stack[i];
        const roleInfo = beebeRoles[i];

        await session.run(
          `MATCH (t:Type {code: $tCode})
           MATCH (f:Function {code: $funcCode})
           MERGE (t)-[r:HAS_FUNCTION_SLOT {slot: $slot}]->(f)
           SET r.role = $role,
               r.cnRole = $cnRole,
               r.desc = $desc`,
          {{
            tCode,
            funcCode,
            slot,
            role: roleInfo.role,
            cnRole: roleInfo.cnRole,
            desc: roleInfo.desc
          }}
        );
      }}
    }}
    console.log("Connected all 16 Types to full 8-Function Beebe Stack (128 slot relationships).");

    // 7. Final DB Stats Check
    const countRes = await session.run(`
      MATCH (n)
      WITH count(n) AS totalNodes
      MATCH ()-[r]->()
      RETURN totalNodes, count(r) AS totalRels
    `);
    const nodeCount = countRes.records[0].get("totalNodes").toNumber();
    const relCount = countRes.records[0].get("totalRels").toNumber();

    console.log("\\n===================================================================");
    console.log("=== GRAPH CONSOLIDATION & MULTI-LEVEL RELATIONS COMPLETE! ===");
    console.log("===================================================================");
    console.log(`Live Neo4j AuraDB Stats: ${{nodeCount}} Nodes, ${{relCount}} Relationships.`);
  }} finally {{
    await session.close();
    await driver.close();
  }}
}}

applyConsolidationAndRelations().catch((err) => {{
  console.error("Consolidation and relations failed:", err);
  process.exit(1);
}});
"""

with open("scripts/apply_consolidation_and_relations.ts", "w", encoding="utf-8") as f:
    f.write(ts_code)

print("Successfully generated scripts/apply_consolidation_and_relations.ts!")
