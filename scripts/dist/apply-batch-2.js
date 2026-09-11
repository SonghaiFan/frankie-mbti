import fs from "node:fs";
import path from "node:path";
import neo4j from "neo4j-driver";
const rootDir = process.cwd();
function loadEnv() {
    const envFiles = [".env.local", ".env"];
    for (const file of envFiles) {
        const fullPath = path.join(rootDir, file);
        if (fs.existsSync(fullPath)) {
            const content = fs.readFileSync(fullPath, "utf-8");
            content.split("\n").forEach((line) => {
                const trimmed = line.trim();
                if (!trimmed || trimmed.startsWith("#"))
                    return;
                const eqIdx = trimmed.indexOf("=");
                if (eqIdx > 0) {
                    const key = trimmed.slice(0, eqIdx).trim();
                    let val = trimmed.slice(eqIdx + 1).trim();
                    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
                        val = val.slice(1, -1);
                    }
                    if (!process.env[key]) {
                        process.env[key] = val;
                    }
                }
            });
        }
    }
}
const batch2Data = [
    {
        id: "insight_batch2_21",
        sourceIndex: 21,
        types: ["ISTP"],
        series: "深度画像与本命天赋",
        title: "钻头鉴赏家：行动至上与情感防火墙",
        archetype: "独行手艺人 / 鉴赏家 / 突发危机处理大师",
        analogy: "身上插满工具与防风镜的机械匠人；面对情感是一堵墙；情绪是垃圾，扫成小山最后一把火烧掉；你若安好便是晴天",
        coreParadox: "极度精益求精能做但极度不会说；在群体中被孤立了几年都浑然不知，反而乐在其中享受独处的心流",
        energyMechanism: "主导Ti逻辑拆解 + 辅助Se敏捷实操应对突发 + 第三Ni应激短视 + 劣势Fe抗拒迁就与情感死机",
        quote: "他的爱不是每天你侬我侬，他就是那种'你若安好便是晴天'。追他不要试探，私底下直接打直球。",
        cleanedText: "ISTP的辅助功能是外倾实感（Se），分析和想法比INTP更加实际。插画形象是身上各种装备、钻头、扳手和防电焊眼镜。平衡状态下的钻头非常喜欢拥抱小众爱好，比如手碟、吉他、户外、锻铁。他被称为'鉴赏家'，是因为他在家欣赏宝贝就能进入心流状态，幸福完全由自己定义。第三功能Ni（内倾直觉）处于应激时要么盲目相信直觉，要么完全不考虑长远。第四劣势功能Fe让他不屑于讨好迁就，觉得每个人做好自己的事即可。面对情感像一堵墙，把情绪当成垃圾扫成小山，攒多了就一把火烧掉。职场上极度适合外科医生、消防员、顶级奢侈品修复匠人这种需要随机应变的岗位，但会做不会说极度吃亏。追他千万不要弯弯绕绕试探，私底下直接打直球。他也可以把伴侣当成精密系统，输入指令学习反馈来克服情感短板。",
        actionableAdvice: "适当融入人群并主动汇报展示成果；追ISTP私下直球表白；ISTP理解伴侣可将情感作为'输入关怀指令即获开心反馈'的程序系统来练习Fe。",
    },
    {
        id: "insight_batch2_22",
        sourceIndex: 22,
        types: ["INTJ", "ENTP", "ESTJ", "ISTJ", "ISFP", "ESFP", "INFP", "ENFP"],
        series: "四大名著的人格镜像",
        title: "四大名著与MBTI四大组别的宿命映照",
        archetype: "文学史诗人格映射",
        analogy: "紫人三国、蓝人西游、黄人水浒、绿人红楼",
        coreParadox: "不同历史命运剧本的碰撞：谋略争霸 vs 秩序取经 vs 快意恩仇 vs 灵魂挽歌",
        quote: "紫儿是《三国演义》，蓝儿是《西游记》，黄儿是《水浒传》，绿儿是《红楼梦》。",
        cleanedText: "紫人组（NT）是《三国演义》：讲谋略与现实价值，群雄逐鹿攻城掠地实现远大理想，INTJ是运筹帷幄的诸葛亮，ENTP是乱世之枭雄曹操。蓝人组（SJ）是《西游记》：给一个既定目标就能一路西天取经，在森严的等级秩序和千百次平凡磨难中修成正果。黄人组（SP）是《水浒传》：梁山一百单八将，个个身怀绝技，快意恩仇，路见不平拔刀相助，不爽就打翻桌子。绿人组（NF）是《红楼梦》：情感与细腻心理看不见摸不着，是名著中唯二以情感和女性命运为灵魂的名著之首，也是天下最深的浪漫。",
        actionableAdvice: "理解四大组别的底层驱动叙事，不要用《西游记》的规矩去苛求《水浒传》的侠客，也不要用《三国演义》的利益去算计《红楼梦》的心灵。",
    },
    {
        id: "insight_batch2_23",
        sourceIndex: 23,
        types: ["INFJ", "ENFJ", "ISFJ", "ESFJ", "INTJ", "ENTJ", "ISTJ", "ESTJ"],
        series: "冲锋与兜底的阴阳平衡",
        title: "FJ兜底与TJ冲锋：看见铠甲下的软肋",
        archetype: "生命后盾 vs 战场将军",
        analogy: "FJ润物细无声成功不邀功；TJ先斩后奏皇权特许攻击力拉满",
        coreParadox: "奉献者亦有自私边界，强大者亦有脆弱时刻；不可过度吸血FJ，亦需接住失控的TJ",
        quote: "这世界上没有一直无私的人，也没有一直强大的人。允许FJ在面前无理取闹，允许TJ在面前展现软弱，才算真正走进他的内心。",
        cleanedText: "FJ人适合兜底：天然感知他人需求，成功时不邀功微笑陪伴，低谷时用最柔软的方式为你回血；但他出于自愿，厌恶被命令照顾人，被过度吸血也会决绝离开。TJ人适合冲锋：你干不了的事他干，下不了的决心他替你下，攻击力与执行力拉满，先斩后奏皇权特许。然而真相是：FJ奉献且自私，TJ强大且弱小。如果你只看到TJ的强，他的反面就会刺伤你；允许FJ抒发情绪并在你这里无理取闹，允许TJ在你面前脱下铠甲显露软弱，你才算真正走进他们的内心。",
        actionableAdvice: "面对FJ切忌命令索取情感，要主动反馈感激；面对TJ要敏锐察觉他的疲惫，稳稳接住他的脆弱失控。",
    },
    {
        id: "insight_batch2_24",
        sourceIndex: 24,
        types: ["INFP", "ENFP", "INFJ", "ENFJ", "INTJ", "ENTJ", "ISTP", "ESTP"],
        series: "亲密关系与恋爱全流程",
        title: "亲密关系的阴阳法则：接受优点的阴影",
        analogy: "天平两端：享受他的光芒，就必须接纳他伴随的暗面",
        coreParadox: "FP的细腻伴随情绪深陷，TJ的强大伴随情感回避，老头的稳重伴随固执难懂",
        quote: "如果你因为某个优点选择了他，那你一定要学会慢慢接受这个优点带来的那个缺点。",
        cleanedText: "恋爱中要学会接受不完美恋人：享受FP的情绪价值与细腻，就要接受他偶尔的情绪深陷与脆弱；享受FJ的温和包容，就要接受他容易和稀泥与决策模糊；享受SJ蓝人的踏实可靠，就要承受日子的平淡少刺激；享受SP黄人的自由洒脱，就要接受他的迟钝粗线条与抗拒束缚；享受TJ人的果敢强大，就要承受他对人对己的高要求与情感回避；享受EJ领袖带来的安全感，就要面对他的忙碌与掌控欲；享受老头的神秘稳重，就要接纳他的固执难懂；享受NP疯子的生命力感染力，就要面对他的不着调与三分钟热度。",
        actionableAdvice: "在亲密关系中学会知足，认识到'优点即缺点'的同构性，不把对方的短板当成攻击目标。",
    },
    {
        id: "insight_batch2_25",
        sourceIndex: 25,
        types: ["INTJ", "INFJ", "ENTJ", "ENFJ", "INTP", "INFP", "ENTP", "ENFP"],
        series: "大减法与大加法",
        title: "NJ的大减法 vs NP的大加法：深度与宽度的互相救赎",
        archetype: "终极执念追光者 vs 繁星体验官",
        analogy: "NJ把所有可能压缩成一个愿景原子一条路走到黑；NP点亮漫天繁星都想尝尝咸淡",
        coreParadox: "NJ易困于目标是海市蜃楼的虚无，NP易困于忙活一生不属于任何一颗星星的漂泊",
        quote: "NJ用一生的身体力行去兑换一个原子的模糊愿景；NP用一生的不确定性去体验点亮漫天繁星的所有可能性。",
        cleanedText: "NJ活的是人生重大的模糊愿景，NP兑现的是众多可能性。NJ心中永远有一个模糊但笃定的方向，无论起落都要站到那里，用一辈子的身体力行去做大减法：世界那么大，我只去一个地方做成一件事，只要成功一次就够。NP则是满天繁星每一个都想去点亮尝尝咸淡，做大加法：世界那么大，每个地方都想去看看，用一生的不确定性去体验所有可能性。NJ常嫌NP三分钟热度三心二意，NP常笑NJ一条路走到黑枯燥执拗。但世界既需要深度也需要宽度，NJ需要NP提醒'世界不止一条路'带来变通，NP需要NJ叮嘱'走了再多地方也记得找一块归属的栖息地'。",
        actionableAdvice: "NJ在执念死磕时向NP借一份变通与灵动；NP在漂泊迷茫时向NJ借一份锚定与深耕定力。",
    },
    {
        id: "insight_batch2_26",
        sourceIndex: 26,
        types: ["INTJ", "INTP", "ENTJ", "ENTP"],
        series: "商业搞钱与战略破局",
        title: "紫人社交指南：省劲高效与等价交换",
        archetype: "效率理性主义者",
        analogy: "社交黑客：大道至简，直来直往，以眼还眼，各自搞钱",
        coreParadox: "看似高冷算计，实则经历复杂后的极简；不怕被利用，只怕毫无价值的无效消耗",
        quote: "紫儿社交很简单，这层简单是复杂过后的真理。真诚直接省劲，不要天天粘在一起，你没有自己的钱要去赚吗？",
        cleanedText: "和紫人（NT）相处其实极其简单：真诚、直接、有一说一，不要让他去猜去弯弯绕绕。能和他头脑风暴、让他觉得高效省劲，他就视你为天下第一好。不要不懂装懂，他一眼就能看穿城墙。他平时极忙，没兴趣占人便宜，你也别想占他便宜；有好的价值就带上等价交换。社交遵循以眼还眼以牙还牙：你对他好他加倍对你好，你玩阴的被识破必遭反击。千万不要天天黏在一起，保持各自独立的搞钱与成长空间，就是与紫人最健康的距离。",
        actionableAdvice: "与NT沟通开门见山直奔核心；发生分歧就事论事诚实认错；保持彼此独立的个人空间与搞钱节奏。",
    },
    {
        id: "insight_batch2_27",
        sourceIndex: 27,
        types: ["INFP", "ENTJ", "INFJ"],
        series: "误会组成的世界",
        title: "路人摔倒的三种剧本：没有真正的坏，只有被误解的好",
        archetype: "世相观察者",
        analogy: "同一场摔倒：INFP心疼自保、ENTJ规则修路、INFJ宏观悲悯",
        coreParadox: "善意以不同的认知形式呈现，却常被彼此误读为冷漠、多管闲事或虚伪",
        quote: "世界是由巨大的误会组成的，很多坏只是被误解的好。每个人都在以固定的人设剧本写自己的人生。",
        cleanedText: "路上看到有人摔倒：INFP本能感到心疼，想去扶又害怕被讹被伤害，在原地自责纠结后离开，这是道德感与脆弱自保的拉扯；ENTJ第一反应是地面水没干或者瓷砖不防滑，立刻打电话找路政反映整改，这是规则修复与系统改造思维；INFJ同样心疼，但瞬间抽离到宏观哲学：天下每天摔倒的人无数，单凭个体扶不胜扶，悲悯一叹，默默提醒自己未来修路时要做好防护，这是宏观悲悯与抽离。每个人本能的反应都是固定的善意，理解了不同类型的视角，人生就会多许多豁达。",
        actionableAdvice: "切勿用自己的善意标准去批判他人的行为模式，透过表象看清每个人背后的认知动机。",
    },
    {
        id: "insight_batch2_28",
        sourceIndex: 28,
        types: ["INTJ", "INFP"],
        series: "亲密关系与恋爱全流程",
        title: "不安定组（INTJ x INFP）：高岭之花与清高孤傲的虐恋与破局",
        archetype: "不安定知己伴侣",
        analogy: "冰川与火堆；高岭之花遇上清高孤傲；毛毛虫化蝶与老鹰振翅",
        coreParadox: "表面是INFP不安定，内核是INTJ不满足；一个执迷于现实蓝图掌控，一个执迷于灵魂纯爱确认",
        energyMechanism: "INTJ(Ni-Te-Fi-Se)执行强情感压抑 + INFP(Fi-Ne-Si-Te)情感丰沛执行力弱",
        quote: "表面是INFP不安定，内核是INTJ不满足。好的爱情不是改造对方或对外打分，而是用自己的长处托举对方。",
        cleanedText: "不安定组（INTJ x INFP）是最容易出虐恋但也最深刻的知己组合。初期INTJ的高岭之花神秘反差吸引INFP，INFP纯粹干净的磁场吸引INTJ，天雷勾地火。冷静期后INTJ试图把INFP从粉色泡泡拉回现实，因对方执行力不足而疯狂控制、刺痛、打分扣分；INFP陷入不配得感，疯狂索要情绪价值与确认爱意。深层八维机理：INTJ是Te强Fi弱（强执行、压抑情感），INFP是Fi强Te弱（情感丰沛、执行力差）。花期不同：INTJ靠Te容易年少成名，中年易陷入钻牛角尖与虚无感；INFP青年把最难的人生课题（做自己、直面情感）走完，中年化茧成蝶一路攀登。破局心法：停止拿自己的长处去要求对方的短处，INTJ用行动托举INFP的现实，INFP用纯爱融化INTJ的冰山。",
        actionableAdvice: "INTJ克制打分和改造欲，肯定INFP的情感价值；INFP建立内心配得感，将爱意转化为具体的行动协同。",
    },
    {
        id: "insight_batch2_29",
        sourceIndex: 29,
        types: ["INTJ", "INTP", "ENTJ", "ENTP"],
        series: "深度画像与本命天赋",
        title: "紫人的逻辑城堡：信息压缩包与情感死机",
        archetype: "理性建筑师",
        analogy: "把信息压缩成严丝合缝的城堡砖头；情感是泡沫与KT板；因果律机器",
        coreParadox: "全身最硬的是嘴，倾诉时大脑在算投产比与闭环因果，最渴望被理解却极度害怕情绪失控",
        quote: "理解的是因果，不是你的感受。提到情绪，紫人全身最硬的就是这张嘴。",
        cleanedText: "紫人（NT）每天的工作就是把无数信息精简成压缩包，像逻辑砖头一样严丝合缝砌进城堡，城堡的通行证是逻辑，中心是真理。情感在他们看来像易碎的泡沫是要过滤掉的杂质。找紫人倾诉，他大脑疯狂运转：问'为什么没早点止损'（算投产比），问'发生了什么转折'（补齐逻辑链），最后点头'闭环了'——他理解的是因果，不是感受。当你渴望情绪安抚时，他因不知道怎么回应而当场死机，嘴硬说'我挺平静没感受'。但只要没精准打击到他的逻辑核心（例如不如他的人却比他更成功导致自我怀疑），他其实极其宽容。",
        actionableAdvice: "向NT倾诉前先声明'我只要安慰不要解决方案'；NT需意识到感受也是真实世界不可忽略的客观数据。",
    },
    {
        id: "insight_batch2_30",
        sourceIndex: 30,
        types: ["INTJ", "INTP", "ENTJ", "ENTP"],
        series: "四大组别的终极心性修行",
        title: "紫人的入场券：痛苦是命运最好的考验",
        archetype: "苦难熔炉淬火者",
        analogy: "天将降大任的试炼场：痛苦不是深渊，而是飞升的阶梯",
        coreParadox: "以肉身硬抗绝望迷茫，在痛苦中剥离狂妄自大，用创伤铸就承载重任的骨骼",
        quote: "紫儿最好的老师就是痛苦。命运不会温柔地捧着你飞升，而是用皮开肉绽考验你是否有分量承载成就。",
        cleanedText: "紫人最好的老师是痛苦：求而不得的痛苦、众叛亲离的痛苦。命运不会温柔地捧着你飞升，而是用痛苦迷茫、皮开肉绽来考验你有没有资格、有没有分量去承载你所渴望的成就。天降大任于斯人也，必先苦其心志，通过了痛苦的答卷，才算刚刚拿到了通往顶峰的入场券。",
        actionableAdvice: "将痛苦视作认知升级的熔炉，在挫折中剥离傲慢，锻造承载宏大理想的肩膀。",
    },
    {
        id: "insight_batch2_31",
        sourceIndex: 31,
        types: ["INTJ", "INTP", "ENTJ", "ENTP"],
        series: "四大组别的终极心性修行",
        title: "熬过痛苦与接纳孤独：紫人涅槃的必经之路",
        archetype: "荒原独行猛兽",
        analogy: "草食动物群居，猛兽向来独行；最坏的地狱已然经历，余生皆是坦途",
        coreParadox: "越是剧烈的变故反而越兴奋冷静，在众人的狂欢中抽身独处，在荒芜中蓄积庞大势能",
        quote: "草食动物群居，肉食动物独居。孤独代表生存能力，孤独代表内心强大。",
        cleanedText: "任何一个高阶紫人都是在痛苦和孤独中完成蜕变的。熬过大痛苦后紫人会涅槃自洽：失恋了会觉得空出了大把时间搞事业成长，困境面前胸有成竹因为最坏的地狱已经走过。痛苦之后是孤独的关卡：草食动物群居，肉食动物独居；孤独代表极强的独立生存能力与内心强大。即使外向的ENTP也需要大量时间独自归纳，ENTJ也会主动砍掉无效社交走向孤独，IN人更是如此。如果你现在痛苦而孤独，说明这条登顶之路你走对了。",
        actionableAdvice: "不必为不合群而焦虑，善用孤独沉淀知识与战略壁垒，等待时机厚积薄发。",
    },
    {
        id: "insight_batch2_32",
        sourceIndex: 32,
        types: ["INTJ", "INTP", "ENTJ", "ENTP"],
        series: "四大组别的终极心性修行",
        title: "高阶紫人的终极境界：温柔而有力",
        archetype: "心有猛虎细嗅蔷薇的哲人",
        analogy: "溢满的水杯分甘同味；站上峰顶却能俯身弯腰托举众生",
        coreParadox: "身怀绝技却从容藏拙，洞察人性黑暗却依然选择看见每个人的微光",
        quote: "有力是东山再起的底气，温柔是心有猛虎细嗅蔷薇、戒掉傲慢弯下腰的谦卑。",
        cleanedText: "高阶紫人唯有两点：温柔而有力。有力是遇到任何沉浮都能东山再起的底气，是不惹事不怕事的坚毅；温柔则是心有猛虎细嗅蔷薇，依然能发现普通人身上的光，接纳各色各样的人并温柔以待。这是站得极高却依然能够弯下腰的谦卑，是戒掉傲慢后对众生的敬畏，是攒了一身通天本领却不轻易炫耀的藏拙。杯水满了溢出来馈赠世人，这才是NT高阶的真正大成。",
        actionableAdvice: "克制智力优越感，把洞察力用于托举他人而非挑剔世界，用谦逊达成真正的领袖魅力。",
    },
    {
        id: "insight_batch2_33",
        sourceIndex: 33,
        types: ["INTJ", "INTP", "ENTJ", "ENTP"],
        series: "四大组别的终极心性修行",
        title: "紫人越老越稳：阴阳平衡与无执之境",
        archetype: "太极衡者",
        analogy: "心境如一汪澄澈池水；顺境思危，逆境见机",
        coreParadox: "精进依然如热血少年，对功名得失却心如止水毫无执念",
        quote: "心境像一汪池水，依然像少年般鞭策自己努力，但对结果已经没有执念。",
        cleanedText: "紫人到了后期最明显的特征是越老越稳、万物平衡。大家都很乐观时他会冷静审视隐患，发生厄运坏事时他视为人生必经并敏锐寻找转机。事物在他这里达到动态平衡，不再大喜大悲，心境如一汪澄澈池水。行动上依然像热血少年一样鞭策自己精进，但在心性上对结果不再有偏执的执念，日子过得舒展从容。",
        actionableAdvice: "在顺境中居安思危，在逆境中泰然处之，尽人事而听天命，实现心境的平衡解脱。",
    },
    {
        id: "insight_batch2_34",
        sourceIndex: 34,
        types: ["INFP", "ENFP", "INFJ", "ENFJ"],
        series: "四大组别的终极心性修行",
        title: "绿人封神心法：停止证明自己，停止献祭人生",
        archetype: "觉醒的疗愈者",
        analogy: "做自己内心小孩的理想父母；斩断无休止的自我献祭锁链",
        coreParadox: "以为拯救别人才能获得爱，其实唯有停止拯救、深爱自己才能真正解脱",
        quote: "不再去证明自己值得被爱，不再向父母伴侣索取迟到的理解，停止献祭自己的人生。",
        cleanedText: "绿人（NF）封神的第一步，是停止向外界证明自己值得被爱，停止向父母、伴侣或前任索要一份迟到的理解。真正意识到自己已经是一个强壮的成年人，足以做自己的父母去照顾内心那个被忽视的小孩。接纳父母和伴侣未能温柔爱自己，不是因为自己不够好，而是因为他们受困于自己的认知局限，根本没有学会如何爱人。理解原生家庭不是为了躺平甩锅，而是深刻理解自己如何走到今天。停止献祭自己的人生，绿人才真正迎来新生。",
        actionableAdvice: "停止为了获得认可而过度迎合他人，做自己的理想父母，将关注点收回滋养自己的人生。",
    },
    {
        id: "insight_batch2_35",
        sourceIndex: 35,
        types: ["INFP", "ENFP", "INFJ", "ENFJ"],
        series: "四大组别的终极心性修行",
        title: "高阶绿人的解脱：放过别人，也放过自己",
        archetype: "自洽的灵魂行者",
        analogy: "从污泥暴风雨中走来，却能最终与世界达成深层和解",
        coreParadox: "刺人的尖刺源自对被遗弃的极度恐惧；放下防御才能迎来真正的安稳",
        quote: "说狠话是因为害怕失去抓得太紧，先抛弃对方是因为害怕被抛弃。高阶绿人最终放过了别人，也放过了自己。",
        cleanedText: "绿人早期因缺乏被温柔以待的稳定体验，面对亲密关系极度渴望又极度恐惧。遇到矛盾容易本能逃避或剧烈反击：说最绝情的话是因为害怕失去而抓得太紧；从微表情中捕捉到一丝冷淡就预感被遗弃，从而选择先下手为强推开对方。没有拿到绿人的剧本，就没资格指责她的脆弱和匮乏。看清这一层创伤防御，就会明白她如今能安然站在你面前已是穿越重重风暴的奇迹。绿人越往后发展，越能真正放过别人，也放过自己。",
        actionableAdvice: "觉察恐惧驱动的推开行为，在想说狠话时深呼吸暂停，给伴侣解释自己真实不安的机会。",
    },
    {
        id: "insight_batch2_36",
        sourceIndex: 36,
        types: ["INFP", "INFJ", "ISFJ", "ENTP", "INTJ"],
        series: "情绪表达与心身自救",
        title: "躯体化、行动化与言语化：身体无声的求救信号",
        archetype: "身心觉察者",
        analogy: "痛苦是需要排泄的残渣；躯体化是身体在代替嘴巴哭泣",
        coreParadox: "越抗拒痛苦越强化，越接纳痛苦越弱化；憋出的病痛往往是被压抑情感的最后呼救",
        quote: "越抗拒越强化，越接纳越弱化。痛苦没有被言语化，就会被躯体化。",
        cleanedText: "心理学中表达痛苦的三种层次：言语化 > 行动化 > 躯体化。最好的是言语化：把痛苦说出来直面它，越接纳越弱化；其次是行动化：打砸破坏向外发泄；最让人心疼的是躯体化：无法向外发泄也无法倾诉，攻击性调头指向自身，转化为失眠、荨麻疹、偏头痛等身体病痛。在传统压抑的环境中，表达痛苦常被扣上'矫情脆弱'的帽子，而身体生病却能获得高度关怀和照顾，导致身体学会了用生病来求救。躯体化只是身体排泄痛苦的自救机制，观察恐惧的形状与来源，勇敢练习言语化，把情绪说出来。",
        actionableAdvice: "出现不明身体症状时排查近期情绪压力，练习向信任的朋友或日记精确用文字表达感受。",
    },
    {
        id: "insight_batch2_37",
        sourceIndex: 37,
        types: ["ISTP", "ESTP", "ISFP", "ESFP", "ISTJ", "ESTJ", "ISFJ", "ESFJ"],
        series: "四大组别的终极心性修行",
        title: "黄人明天就挂 vs 蓝人再活五百年：探索与安定的两面神",
        archetype: "当下玩家 vs 永恒基石",
        analogy: "黄人放礼花庆祝末日；蓝人买保险存钱为五百年后做打算",
        coreParadox: "黄人极爽但明天可能狼狈；蓝人极稳但终生紧绷少刺激",
        quote: "黄人预设明天就挂，世界末日正好放个礼花；蓝人预设再活五百年，买保险存钱为未来买单。",
        cleanedText: "黄人（SP）预设的世界是明天就挂，因此今朝有酒今朝醉，把每一天都过得淋漓尽致，充满探索感与当下的松弛；蓝人（SJ）预设的世界是还能再活五百年，喜欢存钱、省吃俭用、买保险，打理好方方面面的稳定秩序，但容易活得过于紧绷和无趣。黄人需要向蓝人学习底线抗风险能力，否则当下尽兴明天可能狼狈；蓝人需要向黄人学习松弛感，明白人生终究是为自己而活，适度松绑才能享受沿途风景。",
        actionableAdvice: "SP在享乐之余设定不可挪用的安全储备金；SJ每周为自己安排一次毫无功利目的的纯粹玩乐。",
    },
    {
        id: "insight_batch2_38",
        sourceIndex: 38,
        types: ["ENTP"],
        series: "深度画像与本命天赋",
        title: "30岁ENTP的危机与蜕变：当创新变成老旧的舒适圈",
        archetype: "点子永动机 / 创新的守旧者",
        analogy: "每天无时无刻不在头脑风暴，看似反传统，其实这才是他最老旧的舒适圈；打地基才是他真正的新挑战",
        coreParadox: "以为自己最前卫最自由，却因抗拒漫长的积累而缩在短平快的点子里，成了最守旧的人",
        energyMechanism: "Ne主导走捷径 + Fi盲点不知道真实所爱 + 劣势Si逃避漫长落地沉淀",
        quote: "每天头脑风暴其实是你的舒适圈，打地基才是真正的新东西。越抗拒蓝人，其实是越抗拒自己身体里的Si。",
        cleanedText: "30多岁的ENTP容易陷入失眠、过敏、荨麻疹等躯体化症状，源于面对人生下一阶段的抗拒与自责。Ne主导让他永远想抄近道、玩短线、三分钟热度，极具魅力却缺乏长期沉淀；第7盲点功能Fi使他搞不清自己深层真正想要什么，容易陷入空虚。最大的反转是：无休止的头脑风暴和短平快点子其实是ENTP的舒适圈！从旧模式走向漫长打地基、建楼房的沉淀积累过程，对他才是真正的新模式。因为不敢打地基而缩回旧的欢脱模式，ENTP就成了最顽固的守旧者。接纳劣势功能Si，向蓝人学习扎实落地，才能真正破局。",
        actionableAdvice: "挑一个最具长期价值的领域死磕至少2年，克制中途更换赛道的冲动，把打地基当成最高级的创新。",
    },
    {
        id: "insight_batch2_39",
        sourceIndex: 39,
        types: ["ISFJ"],
        series: "深度画像与本命天赋",
        title: "ISFJ全面解析：沙漠里的绿化带，最让人心疼的社会基石",
        archetype: "沙漠绿化带 / 小护士 / 坚守的基石",
        analogy: "手脚利索备好温茶口罩；信任圈不超过10人；荷包蛋烤糊是他隐性的求救信号",
        coreParadox: "做了无数好事只要夹杂一件为自己的事就自责自私；用超强忍耐默默奉献却极度缺乏对自我的关照",
        energyMechanism: "主导Si经验调取不出错 + 辅助Fe为他人奉献 + 第三Ti内耗自责自咎 + 劣势Ne抗拒折腾创新",
        quote: "小护士就像沙漠里的绿化带，生命力顽强，不争不抢。荷包蛋突然烤糊了，就是他无声的求救信号。",
        cleanedText: "最忠诚也是最让人心疼的人格ISFJ：刻板印象常被误读为软弱好欺负、古板，但他是整个社会运转的基石。主导功能Si调取历史经验行事，稳定不出错；辅助功能Fe为集体和谐与他人需求默默奉献，手脚利索、备好温茶口罩。隐忍的代价是容易陷入内耗：第三功能Ti在失控时疯狂分析'我哪里做错了/是不是做得还不够'，陷入自责漩涡；第四劣势Ne讨厌瞎折腾的所谓创新。ISFJ的天赋在于惊人的坚守——学攀岩学到最后成了教练，托付接班人和遗嘱最靠谱的人选。信任圈极小（10人以内），因为他的爱太满太具体。谈恋爱不会主动吵架，但如果平时早饭做得极好的人突然把荷包蛋烤糊、煮饭水放错，那是他快被压垮的求救信号。ISFJ需要明白：多爱自己一些，画出界限，不要为了责任牺牲掉自己的生命力。",
        actionableAdvice: "明确拒绝超出精力的请求，建立自己的心理防御边界；身边有ISFJ时敏锐关注其细节反常并主动给予关怀。",
    },
    {
        id: "insight_batch2_40",
        sourceIndex: 40,
        types: ["INTJ"],
        series: "深度画像与本命天赋",
        title: "从DeepSeek看INTJ的系统本质",
        archetype: "结构化智脑",
        analogy: "内部资料整理(I) + 宏观大局观(N) + 数据客观论证(T) + 章节清晰结构闭环(J)",
        coreParadox: "极度理性的架构输出与客观论证，被误认为冷血无情，实则是最大的确定性保障",
        quote: "能量源自内部资料归纳，大局观与抽象概念极强，摆事实讲道理拿数据分析，最后章节清晰逻辑闭环。",
        cleanedText: "DeepSeek的人格特质分析：能量源自内部归纳整理大量资料（I），大局观与抽象概括极强（N），论证时摆事实、讲道理、引用客观数据深入分析（T），最终输出有着极其清晰的123章节体系并做闭环总结（J），是典型的INTJ架构师特质。",
        actionableAdvice: "学习INTJ与AI的思维方式：建立结构化知识输入体系，强化底层逻辑闭环，输出高密度框架。",
    },
];
async function runBatch2() {
    loadEnv();
    const uri = process.env.NEO4J_URI;
    const user = process.env.NEO4J_USERNAME;
    const password = process.env.NEO4J_PASSWORD;
    if (!uri || !user || !password) {
        console.error("Missing Neo4j environment variables.");
        process.exit(1);
    }
    console.log(`Connecting to Neo4j at ${uri}...`);
    const driver = neo4j.driver(uri, neo4j.auth.basic(user, password));
    const session = driver.session();
    try {
        console.log("=== INGESTING BATCH 2 (Entries 21-40) ===");
        // 1. Create/Merge Series nodes
        const seriesSet = new Set(batch2Data.map((d) => d.series));
        for (const sName of seriesSet) {
            await session.run(`MERGE (s:Series {name: $name})
         ON CREATE SET s.createdAt = datetime()
         RETURN s`, { name: sName });
        }
        console.log(`Ensured ${seriesSet.size} Series nodes.`);
        // 2. Ingest Insights and relationships
        for (const entry of batch2Data) {
            const params = {
                id: entry.id,
                sourceIndex: entry.sourceIndex,
                title: entry.title,
                archetype: entry.archetype ?? null,
                analogy: entry.analogy ?? null,
                coreParadox: entry.coreParadox ?? null,
                energyMechanism: entry.energyMechanism ?? null,
                quote: entry.quote,
                cleanedText: entry.cleanedText,
                actionableAdvice: entry.actionableAdvice,
                seriesName: entry.series,
            };
            await session.run(`MERGE (i:Insight {id: $id})
         SET i.sourceIndex = $sourceIndex,
             i.title = $title,
             i.archetype = $archetype,
             i.analogy = $analogy,
             i.coreParadox = $coreParadox,
             i.energyMechanism = $energyMechanism,
             i.quote = $quote,
             i.cleanedText = $cleanedText,
             i.actionableAdvice = $actionableAdvice,
             i.updatedAt = datetime()
         WITH i
         MATCH (s:Series {name: $seriesName})
         MERGE (i)-[:BELONGS_TO_SERIES]->(s)
         RETURN i.id`, params);
            // Connect to associated MBTI Types
            for (const typeCode of entry.types) {
                await session.run(`MATCH (t:Type {code: $typeCode})
           MATCH (i:Insight {id: $id})
           MERGE (t)-[r:HAS_INSIGHT]->(i)
           ON CREATE SET r.createdAt = datetime()
           RETURN count(r)`, { typeCode, id: entry.id });
            }
        }
        console.log(`Ingested ${batch2Data.length} Insight nodes and Type linkages.`);
        // 3. Update Type properties for ISTP, ISFJ, ENTP
        console.log("Updating Type properties for ISTP, ISFJ, ENTP...");
        await session.run(`MATCH (t:Type {code: 'ISTP'})
       SET t.archetype = '独行手艺人 / 鉴赏家 / 突发危机处理大师',
           t.vividAnalogy = '身上插满工具防风镜的机械匠人；面对情绪是一堵墙；情绪是垃圾，扫成小山最后一把火烧掉；你若安好便是晴天',
           t.coreParadox = '极度精益求精能做但极度不会说；在群体中被孤立了几年都浑然不知，反而乐在其中享受独处心流',
           t.energyModel = '主导Ti逻辑分析 + 辅助Se敏捷实操应对突发 + 第三Ni应激短视 + 劣势Fe抗拒迁就与情感死机'`);
        await session.run(`MATCH (t:Type {code: 'ISFJ'})
       SET t.archetype = '沙漠绿化带 / 小护士 / 坚守的社会基石',
           t.vividAnalogy = '手脚利索备好温茶口罩；信任圈不超过10人；荷包蛋烤糊是他隐性的求救信号',
           t.coreParadox = '做了无数好事只要夹杂一件为自己的事就自责自私；用超强忍耐默默奉献却极度缺乏对自我的关照',
           t.energyModel = '主导Si经验调取不出错 + 辅助Fe为他人奉献 + 第三Ti内耗自责自咎 + 劣势Ne抗拒折腾创新'`);
        await session.run(`MATCH (t:Type {code: 'ENTP'})
       SET t.archetype = '点子永动机 / 创新的守旧者',
           t.vividAnalogy = '每天无时无刻不在头脑风暴，看似反传统，其实这才是他最老旧的舒适圈；打地基才是他真正的新挑战',
           t.coreParadox = '以为自己最前卫最自由，却因抗拒漫长的积累而缩在短平快的点子里，成了最守旧的人',
           t.energyModel = 'Ne主导走捷径 + Fi盲点不知道真实所爱 + 劣势Si逃避漫长落地沉淀'`);
        // 4. Create explicit PAIR_DYNAMIC for 不安定组 (INTJ x INFP)
        console.log("Creating explicit PAIR_DYNAMIC for 不安定组 (INTJ x INFP)...");
        await session.run(`MATCH (t1:Type {code: 'INTJ'}), (t2:Type {code: 'INFP'})
       MERGE (t1)-[r:PAIR_DYNAMIC]->(t2)
       SET r.groupName = '不安定组',
           r.pattern = '虐恋与白月光',
           r.coreParadox = '表面INFP不安定，内核INTJ不满足',
           r.complement = 'INTJ用执行力托举现实，INFP用纯爱解冻冰山',
           r.bloomTime = 'INTJ年少成名中年易陷虚无偏执，INFP青年磨难中年化蝶腾飞',
           r.advice = '爱不是改造对方或对外打分（那是交易），而是看到对方互补的长处并用自己的长处托举对方'
       MERGE (t2)-[r2:PAIR_DYNAMIC]->(t1)
       SET r2.groupName = '不安定组',
           r2.pattern = '虐恋与白月光',
           r2.coreParadox = '表面INFP不安定，内核INTJ不满足',
           r2.complement = 'INTJ用执行力托举现实，INFP用纯爱解冻冰山',
           r2.bloomTime = 'INTJ年少成名中年易陷虚无偏执，INFP青年磨难中年化蝶腾飞',
           r2.advice = '爱不是改造对方或对外打分（那是交易），而是看到对方互补的长处并用自己的长处托举对方'`);
        // 5. Final DB Stats
        const countRes = await session.run(`
      MATCH (n)
      WITH count(n) AS totalNodes
      MATCH ()-[r]->()
      RETURN totalNodes, count(r) AS totalRels
    `);
        const nodeCount = countRes.records[0].get("totalNodes").toNumber();
        const relCount = countRes.records[0].get("totalRels").toNumber();
        console.log(`\n=== BATCH 2 INGESTION COMPLETE ===`);
        console.log(`Live Neo4j AuraDB Stats: ${nodeCount} Nodes, ${relCount} Relationships.`);
    }
    finally {
        await session.close();
        await driver.close();
    }
}
runBatch2().catch((err) => {
    console.error("Batch 2 ingestion failed:", err);
    process.exit(1);
});
