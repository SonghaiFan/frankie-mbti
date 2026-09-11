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
const batch4Data = [
    // 91
    {
        id: "insight_batch4_91",
        sourceIndex: 91,
        types: ["INFJ"],
        series: "深度画像与本命天赋",
        title: "INFJ看穿灵魂的秘密：在成为自己前曾做过你的影子",
        archetype: "灵魂侧写师",
        analogy: "心底架设着一台看不见的无声摄像机，捕捉每个细微的情感粒子",
        coreParadox: "看似高深莫测能一眼洞悉你，其实是因为他曾无数次在黑暗中经历过同等的破碎",
        quote: "为什么INFJ总能一眼看穿你的灵魂本质？因为他在真正成为自己之前，曾当过你的影子。",
        cleanedText: "INFJ之所以能精准看透他人伪装，是因为他生来就带有隐形的情感摄像机。在确立自我之前，他为了生存曾无数次模拟过各种人设，做过很多人的影子。他读懂你不是优越的审判，而是感同身受的悲悯。",
        actionableAdvice: "在INFJ面前放下表演与面具，你最真实甚至残缺的一面，反而最能赢得他的尊重与接纳。",
    },
    // 92
    {
        id: "insight_batch4_92",
        sourceIndex: 92,
        types: ["INFJ"],
        series: "深度画像与本命天赋",
        title: "INFJ是五星酒店服务员：完美礼貌下的极致疏离",
        archetype: "五星级管家",
        analogy: "戴着雪白手套的侍者：有求必应、温和如春，但永远隔着一道不可逾越的界线",
        coreParadox: "对所有人温柔体贴公事公办，你以为走近了他，其实连他的大堂都没迈进去",
        quote: "INFJ就像五星级酒店服务员：礼貌、热情、有求必应，但永远公事公办，无法走进他的内心。",
        cleanedText: "初见INFJ常被他的体贴周到打动。然而这往往只是他的社交面具。他像五星酒店管家一样恪尽职守地对你微笑服务，波澜不惊。这种无懈可击的礼貌背后，其实是他对私密精神世界的绝对防守。",
        actionableAdvice: "不要把INFJ的礼貌客套误认作亲密无间，唯有经历时间和重重考验，他才会向你开放私人花园。",
    },
    // 93
    {
        id: "insight_batch4_93",
        sourceIndex: 93,
        types: ["INFJ"],
        series: "亲密关系与恋爱全流程",
        title: "和INFJ谈恋爱像剥洋葱：先热情再疏离，最后是滚烫的泪",
        archetype: "洋葱恋人",
        analogy: "剥洋葱：光滑完美的外皮 -> 辛辣刺眼的疏离防线 -> 最核心纯粹炽热的灵魂与眼泪",
        coreParadox: "用冷漠和疏离把人往外推，实则是为了筛出那个愿意流着泪剥开他到最后一层的人",
        quote: "和INFJ谈恋爱就像剥洋葱：先是热情，再是疏离，疏离背后紧跟着纯粹的炽热。",
        cleanedText: "与INFJ的恋爱轨迹极具戏剧性：第一阶段如沐春风完美无瑕；第二阶段突然拉开距离甚至冰冷试探；如果你没有被吓跑，耐心地陪伴他、接纳他的古怪与阴暗，就会迎来第三阶段——毫无保留、焚身以火的纯粹深情。",
        actionableAdvice: "面对INFJ的第二阶段疏离切莫恐慌后撤或歇斯底里，保持稳定的存在感，让他确信你不会离开。",
    },
    // 94
    {
        id: "insight_batch4_94",
        sourceIndex: 94,
        types: ["INFJ"],
        series: "深度画像与本命天赋",
        title: "INFJ的预言家体质：主导Ni的玄学大局观",
        archetype: "先知通灵者",
        analogy: "隐形的水晶球：无需严密推导公式，结局早已在视网膜上清晰浮现",
        coreParadox: "能精准预判事件走向与人心归宿，却常常说不出中间具体的逻辑证据而被人当成神棍",
        quote: "给INFJ大量碎片信息，他就本能知道下一刻会发生什么，天生适合哲学与通灵洞察。",
        cleanedText: "INFJ的主导功能Ni（内倾直觉）是一种宏观趋势捕捉器。他在潜意识中整合了海量的微观细节，瞬间跳跃得出终极结论。很多时候他无法用语言分步解释原因，但事情往往分毫不差地照其预言演进。",
        actionableAdvice: "信任并记录自己的直觉闪念，尝试借助写作、心理学或战略咨询将其系统化输出。",
    },
    // 95
    {
        id: "insight_batch4_95",
        sourceIndex: 95,
        types: ["INFJ"],
        series: "四大组别的终极心性修行",
        title: "INFJ毕生追求的幸福：自洽平静与少数深交",
        archetype: "避世修行者",
        analogy: "深山孤亭：一壶清茶、两三知己、一本翻不尽的经卷",
        coreParadox: "看似有大爱天下之志，最终的归宿却极度精简——内心的宁静与极少数高价值关系",
        quote: "INFJ毕生追求的幸福：内心的自洽平静、少数既有深度又有价值的关系，以及不断深耕的意义感。",
        cleanedText: "INFJ对世俗的功名利禄很快会感到虚无。他真正的幸福公式是：1. 摆脱外部评价的自洽平静；2. 拥有两三个能彻夜长谈灵魂话题的知己；3. 一份契合道德、能不断向下深耕的安身立命之业。",
        actionableAdvice: "定期给社交圈和欲望做大减法，把有限的精力聚焦在真正能带来精神滋养的人与事上。",
    },
    // 96
    {
        id: "insight_batch4_96",
        sourceIndex: 96,
        types: ["INFJ"],
        series: "四大组别的终极心性修行",
        title: "重申INFJ的平静之道：在喧嚣中守护自性",
        archetype: "澄明守护者",
        analogy: "暴风雨中心的风眼：外界狂风骤雨，核心岿然不动",
        coreParadox: "感官极度易受外界扰动，唯有筑起坚不可摧的精神结界才能获得长久自愈",
        quote: "深耕一份有意义的事业，保留少数有深度的灵魂支撑，这是INFJ立足乱世的锚。",
        cleanedText: "当INFJ遭遇现实挫败或人际动荡时，最忌讳在泥潭里死缠烂打。回归平静的最佳途径是回到自己的小书房，重温先哲经典，在长远的宏大时空中校准当下的微小挫折，找回内心的锚点。",
        actionableAdvice: "建立一套属于自己的晚间静心或冥想仪式，在断网中与内在神性对话。",
    },
    // 97
    {
        id: "insight_batch4_97",
        sourceIndex: 97,
        types: ["INFJ"],
        series: "亲密关系与恋爱全流程",
        title: "INFJ理想型男女大揭秘：小恶魔破戒 vs 成熟Plus版",
        archetype: "反差寻觅者",
        analogy: "古刹僧人被林间灵动的小狐狸扰动心弦；圣女寻找能庇护自己疲惫的成熟守护神",
        coreParadox: "男头喜欢能打破自己戒律的鲜活生灵；女头渴望比自己更通透包容的伟岸肩膀",
        quote: "男INFJ喜欢打破自己规则、有鲜活生命力的小可爱；女INFJ喜欢比自己更成熟包容的Plus版本。",
        cleanedText: "INFJ的择偶具有鲜明的性别反差：男INFJ往往自己极度克制沉闷，因而极易被活泼跳脱、敢爱敢恨、甚至带点小恶魔属性的生命力（如ENFP/ESFP）破防；女INFJ由于自身早熟且洞察力强，必须遇到认知更高、情绪更稳、能兜住她所有脆弱的Plus伴侣才能降服。",
        actionableAdvice: "追男INFJ要大胆展现真实的喜怒哀乐与灵动；追女INFJ要展现沉稳的定力与更高维的包容心。",
    },
    // 98
    {
        id: "insight_batch4_98",
        sourceIndex: 98,
        types: ["INFJ"],
        series: "深度画像与本命天赋",
        title: "INFJ的眼神放空：脱轨现实的平行宇宙神游",
        archetype: "冥想漫游者",
        analogy: "灵魂暂时脱离肉壳：眼神对不上焦，意识已在三万英尺高空云游",
        coreParadox: "肉身端坐在会议室或餐桌旁，大脑正在构思一部横跨百年的史诗巨著并自顾自笑出声",
        quote: "绿老头的眼神经常放空对不上焦，想着想着自个儿神秘一笑，你问他想啥，他往往说没啥。",
        cleanedText: "看到INFJ眼神涣散、望向虚空时，不要以为他在发呆。此时他的Ni功能正开足马力在庞大的潜意识数据库中穿梭。突然神秘一笑，往往是因为逻辑链条闭合或想到了荒诞的人间哲理。问及原因他往往敷衍回答，因为解释成本太高。",
        actionableAdvice: "当INFJ神游放空时，静静陪伴即可，无需硬将他拽回无聊的现实闲聊。",
    },
    // 99
    {
        id: "insight_batch4_99",
        sourceIndex: 99,
        types: ["INFJ"],
        series: "深度画像与本命天赋",
        title: "INFJ的'秒懂'天赋与终极宿命：通晓万物却无人懂我",
        archetype: "孤单的知晓者",
        analogy: "手握全知剧本的旁白：能接住所有演员的台词，却没有任何人来探班自己的休息室",
        coreParadox: "花一辈子秒懂世间所有人，却极难在茫茫人海中找到一个能秒懂自己的人",
        quote: "INFJ最恐怖的天赋是秒懂，最讽刺的宿命是花一辈子懂别人，却极少被别人真正秒懂。",
        cleanedText: "INFJ拥有惊人的共情反应速度：对方卡壳时他能帮其补充下半句，对方眼神一动他就了然于胸。然而这种天赋带来的代价是深入骨髓的孤独——当所有人习惯向他倾诉寻求理解时，他内心的宏大苦闷却无人能够承接。",
        actionableAdvice: "学会在艺术、哲学或文字中寻求跨越时空的共鸣，不必苛求现实身边人都能完全读懂你。",
    },
    // 100
    {
        id: "insight_batch4_100",
        sourceIndex: 100,
        types: ["INFJ"],
        series: "深度画像与本命天赋",
        title: "INFJ的空心本质：众生是一面镜子，装什么全凭你给什么",
        archetype: "虚空明镜",
        analogy: "通透的玻璃容器：注入污水便呈现污浊，注入清泉便折射霞光",
        coreParadox: "平等的消极与冷漠，却能因为对方的一捧赤诚而回馈以翻倍的炽烈",
        quote: "INFJ是空心的，就像一个杯子。你给它恶意，它冷酷无情；你给它真诚，它倍增还你。",
        cleanedText: "很多人把INFJ看作无条件的圣母，大错特错。他的底层其实是极其虚无和平等的冷漠。他像一面高灵敏度的镜子：你带着傲慢与算计来，他便回赠你冰冷的漠视与反噬；你带着毫无保留的善意来，他便倾其所有托举你。",
        actionableAdvice: "对待INFJ切莫玩心机试探，你的每一丝恶意都会被他放大十倍反弹，拿出你的诚意是唯一解法。",
    },
    // 101
    {
        id: "insight_batch4_101",
        sourceIndex: 101,
        types: ["INFJ"],
        series: "深度画像与本命天赋",
        title: "初见INFJ像千年吸血鬼：惊喜之后的人格后怕",
        archetype: "千年血族绅士",
        analogy: "活了数百年的古堡贵族：优雅得体洞悉人性，让人心生敬仰却又背脊发凉",
        coreParadox: "初次相见如沐春风，事后回味却发现自己在对方面前仿佛被扒光了衣服般透明",
        quote: "INFJ就像活了几千年的吸血鬼，说话卡顿了他都能替你接上，让人惊喜又让人后怕。",
        cleanedText: "初次与成熟INFJ交流常令人惊叹其情商与智识。但敏锐的人往往在事后产生一种隐隐的敬畏甚至后怕：他为什么能在这么短的时间内把我的软肋和动机摸得一清二楚？这种超越常理的洞察力正是老神棍的标配。",
        actionableAdvice: "坦然接受被他看穿的事实，只要你心怀正念，这位'吸血鬼'便是你人生最强大的智囊与护航者。",
    },
    // 102
    {
        id: "insight_batch4_102",
        sourceIndex: 102,
        types: ["INFJ"],
        series: "深度画像与本命天赋",
        title: "INFJ绿紫结合体：神圣悲悯与深渊杀意的共存",
        archetype: "神魔双面体",
        analogy: "左手握着佛陀的杨柳枝，右手藏着死神的淬毒匕首",
        coreParadox: "既有NF拯救苍生的宏大悲悯，又有NT冷血解构世界的绝对无情",
        quote: "INFJ不是单纯的绿人，而是绿紫各占一半。修好了兼济天下，修不好神魔互博。",
        cleanedText: "INFJ绝非单纯的软柿子绿人（NF）。其内部同时盘踞着冷酷理性的紫人（NT）力量。辅助Fe让他对众生产生无上同情，第三Ti又让他能冷静剥离人性本质。若无法融合这两股力量，会在过度自我牺牲与冷酷报复社会之间剧烈撕裂。",
        actionableAdvice: "接纳自己内心的阴暗面与进攻性，用理性的手腕保护感性的善良，达到神魔合一的大成。",
    },
    // 103
    {
        id: "insight_batch4_103",
        sourceIndex: 103,
        types: ["INFJ"],
        series: "误测与形态自救",
        title: "INFJ的五种误测陷阱：在INTJ与ENFP之间横跳",
        archetype: "迷宫行者",
        analogy: "千面佛陀：有时像冷酷战术家，有时像热情小疯子",
        coreParadox: "外在温和常被误当好欺负，受挫后启动Ti杀戮模式误测为INTJ",
        quote: "INFJ内在极其犀利，外在表现好说话。被惹毛了启动Ti防御，经常误测成INTJ。",
        cleanedText: "INFJ极易误测为：1. INTJ（当他受够了被他人情绪吸血，关闭Fe强行开启冷酷Ti解构时）；2. ENFJ（在重大社交场合被迫控场时）；3. ENFP（和极度信任的人打闹嬉戏时）；4. ISFJ（当深陷照顾家人的现实锁碎时）。",
        actionableAdvice: "判断核心在于'Ni愿景指引+Fe关系连接'，不要把应激状态下的防御机制当成本命人格。",
    },
    // 104
    {
        id: "insight_batch4_104",
        sourceIndex: 104,
        types: ["INFJ"],
        series: "社交防御与四层圈层",
        title: "INFJ适合简单人：复杂灵魂的解压归宿",
        archetype: "返璞归真者",
        analogy: "看尽深宫算计的国师，下野后只想和村头的老农在田埂上下棋",
        coreParadox: "自身复杂到极致，日常最渴望的却是毫无算计、一清二白的简单关系",
        quote: "INFJ适合跟简单人在一块。他本就戴面具适应别人，若对方也复杂，他就不知道戴什么面具而尴尬逃跑。",
        cleanedText: "INFJ自身脑回路极其深邃，如果遇到同样心机深沉、弯弯绕绕的人，他会启动防御机制疯狂计算对方意图，极度心累。相反，单纯真诚、直来直往甚至有点憨憨的人（如SFP/NFP），反而是他最能放下戒备、安然吸氧的避风港。",
        actionableAdvice: "和INFJ打交道切忌玩欲擒故纵或话里有话，有一说一、展示纯真才是必杀技。",
    },
    // 105
    {
        id: "insight_batch4_105",
        sourceIndex: 105,
        types: ["INFP"],
        series: "亲密关系与恋爱全流程",
        title: "对INFP常说'我爱你'：消除90%内耗的保命灵药",
        archetype: "渴爱小蝴蝶",
        analogy: "缺水便枯萎的花朵：语言确认是维系其精神生命的唯一营养液",
        coreParadox: "嘴上可能害羞不回应，心里却靠这三个字续命，三天不说便自行脑补大悲剧",
        quote: "一定要经常对INFP说我爱你。这三个字能减少90%的麻烦，三天不说他就开始心理打鼓。",
        cleanedText: "INFP的内心由于劣势Te极度缺乏客观现实确信感。他对爱的确信不是靠存折或房产，而是靠伴侣高频的情感言语确认。只要你每天真诚看着他的眼睛说'我爱你'，他便能化解几乎所有胡思乱想与不安全感。",
        actionableAdvice: "把表达爱意变成每日必修课，睡前、出门前随口一句真诚的告白，能省去无数情感拉扯。",
    },
    // 106
    {
        id: "insight_batch4_106",
        sourceIndex: 106,
        types: ["INFP"],
        series: "亲密关系与恋爱全流程",
        title: "INFP一出生就会谈恋爱：探戈虐恋与配得感深渊",
        archetype: "悲剧美学恋人",
        analogy: "灵魂探戈：进一步、退两步；想要靠近，又怕弄脏了心中的圣杯",
        coreParadox: "渴望极致连接，可当最好的爱降临时，又深陷'我不配得到这么好的对待'的自毁深渊",
        quote: "INFP谈恋爱像跳探戈：想靠近又怕失去，要连接又觉得不配，这就是出虐恋的原因。",
        cleanedText: "INFP是天生的恋爱哲学家，但也是虐恋的高发区。他内心对纯爱的要求极其纯洁崇高，导致他常常在亲密关系中'进一步退两步'：对方对自己太好，他会产生强烈的不配得感，甚至通过无理取闹或自我放逐来验证对方是否真爱。",
        actionableAdvice: "觉察内心的不配得感，告诉自己：'我值得被全世界最温柔的爱对待'，停止自毁式试探。",
    },
    // 107
    {
        id: "insight_batch4_107",
        sourceIndex: 107,
        types: ["INFP"],
        series: "误测与形态自救",
        title: "INFP的六种变体：从摆烂手艺人到冷面法官",
        archetype: "变形梦旅人",
        analogy: "随心境变换颜色的蝴蝶",
        coreParadox: "极度脆弱时化身不同面具来隔离现实痛苦",
        quote: "内耗不住逃进ISFP摆烂，愤怒受挫化身INTP冷血分析，被现实逼到墙角变身INTJ。",
        cleanedText: "INFP常见误测变体：1. ISFP（当精神内耗过载，逃避到当下的吃喝玩乐与手工创作中）；2. INTP（遭受情感重创后封印Fi情感，强行用冷血逻辑武装自己）；3. INTJ（被逼入绝境发狠做狠人执行计划）；4. INFJ（沉迷于宏大救世情怀）。",
        actionableAdvice: "无论怎样变形，你的核心永远是'Fi内倾情感真挚'，接纳自己的敏感与脆弱才是力量源泉。",
    },
    // 108
    {
        id: "insight_batch4_108",
        sourceIndex: 108,
        types: ["INFP"],
        series: "深度画像与本命天赋",
        title: "INFP像个小孩的真相：童年没有当够小孩",
        archetype: "永恒后滞童年",
        analogy: "在懂事荒原上奔跑的小老头，成年后终于蹲下身抱起那个当年被剥夺玩具的自己",
        coreParadox: "童年极度早熟察言观色照顾大人，成年后反转退行，补过自己缺失的童年",
        quote: "为什么INFP总像个小孩？因为他小时候没有当够小孩，早熟的他反向养育了家庭。",
        cleanedText: "很多人误以为INFP心智不成熟，真相恰恰相反：INFP在童年时期往往过早觉察到家庭的裂痕与父母的痛苦，为了保护大人的情绪过早懂事。当他成年独立后，被压抑的本能终于苏醒，他开始用一生的任性与纯真补偿当年的自己。",
        actionableAdvice: "伴侣要理解他的幼稚不是任性，而是他在你面前展现了毕生最信任的童年补偿，宠爱他即可。",
    },
    // 109
    {
        id: "insight_batch4_109",
        sourceIndex: 109,
        types: ["INFP"],
        series: "商业搞钱与战略破局",
        title: "INFP财富逆袭样本：从做题家到自媒体IP",
        archetype: "真诚IP变现者",
        analogy: "把自己灵魂的碎片打磨成发光的明珠，让懂的人排队买单",
        coreParadox: "最讨厌流水线职场，把自己的真实情感与审美做到极致却能赚取巨额财富",
        quote: "小蝴蝶不要在传统职场消耗灵气，做真实的自我IP，热爱与审美才是最大的护城河。",
        cleanedText: "以博主周小辣为例：典型小镇做题家出身的小蝴蝶，在传统行业压抑痛苦，转战自媒体后把最原生态的真实情感、独特的审美与性格魅力全盘展示，买车买房完成阶层跃升。INFP的搞钱路径是'卖真实、卖审美、做个人IP'。",
        actionableAdvice: "停止用传统考公考编的标准摧残自己，在自媒体、艺术、写作中做独一无二的个人品牌。",
    },
    // 110
    {
        id: "insight_batch4_110",
        sourceIndex: 110,
        types: ["INFP", "INTJ"],
        series: "亲密关系与恋爱全流程",
        title: "小蝴蝶遇上紫老头：不安定组的暧昧拉扯",
        archetype: "宿命欢喜冤家",
        analogy: "温柔包容小脾气的老谋深算者，遇上天马行空的小仙灵",
        coreParadox: "享受对方的深沉与指导，又害怕被对方庞大的现实蓝图压扁",
        quote: "INTJ能包容INFP的小脾气，但也会试图用现实框架拉扯他，爱与恐惧并存。",
        cleanedText: "在现实相处中，INFP常被INTJ的博学、稳重与反差温柔深深吸引；但当INTJ开始拿出日程表、KPI和未来规划试图规训小蝴蝶时，小蝴蝶会感到强烈的窒息感。双方需要在自由与秩序之间达成精妙平衡。",
        actionableAdvice: "INTJ在给出建议前先给拥抱；INFP在享受包容的同时，尽量在关键诺言上做到守信。",
    },
    // 111
    {
        id: "insight_batch4_111",
        sourceIndex: 111,
        types: ["INFP"],
        series: "社交防御与四层圈层",
        title: "INFP的'忘了'：那是他在灵魂深处悄悄删除了你",
        archetype: "温柔的橡皮擦",
        analogy: "静悄悄的文件粉碎机：不吵不闹，只是在心底把你的名字拖进了回收站",
        coreParadox: "表面客气说是自己记性不好，其实喜欢的人一根睫毛他都记得清清楚楚",
        quote: "INFP把你忘了就是在拒绝，把你的事忘了也是拒绝，走神更加是拒绝，他在偷偷删掉你。",
        cleanedText: "INFP是出了名的细节记忆大师，对于真正在意的人，数年前的一句话他都历历在目。如果他对你的消息一再'忘了回'、对你的约会'忘了记'、跟你聊天频繁走神，那不是健忘，而是他最具教养也最决绝的拒绝方式。",
        actionableAdvice: "当INFP频繁对你表现出健忘与敷衍时，知趣地后撤并保持体面，切莫反复追问自讨没趣。",
    },
    // 112
    {
        id: "insight_batch4_112",
        sourceIndex: 112,
        types: ["INFP"],
        series: "商业搞钱与战略破局",
        title: "INFP搞钱困境：三分钟热度与非功利陷阱",
        archetype: "理想国守望者",
        analogy: "在金钱丛林里追逐彩虹的孩童：脚下全是黄金，他却只顾着看天上的云",
        coreParadox: "明明身无分文，做商业项目却极度排斥铜臭味，喜欢搞不赚钱的文创艺术",
        quote: "INFP做事三分钟热度，深一脚浅一脚，喜欢艺术抽象不赚钱的文创，含金量高的咨询又不好意思谈钱。",
        cleanedText: "INFP在商业初期的最大痛点：不擅长长期落地执行（劣势Te），容易被新奇灵感带偏；同时带有强烈的金钱羞耻感，做高价值的咨询或创作时不好意思大方开价，导致长期陷入经济窘迫。",
        actionableAdvice: "聘请或合作一个强势的经纪人/合伙人帮你定价和催款，把精力纯粹留给内容产出。",
    },
    // 113
    {
        id: "insight_batch4_113",
        sourceIndex: 113,
        types: ["INFP"],
        series: "商业搞钱与战略破局",
        title: "INFP搞钱法则：乐意、自由、热爱、具有美感",
        archetype: "审美经济学家",
        analogy: "酿造世间最醇厚美酒的作坊：不迎合大众低俗，只等待识货的高品位知音",
        coreParadox: "用迎合世俗的手段赚钱会让他生不如死，保持高维审美与真诚却能吸引高净值客群",
        quote: "INFP要赚自己乐意赚、自由、热爱且具有美感不庸俗的钱，拒绝坑蒙拐骗与低质内卷。",
        cleanedText: "INFP必须遵循其天命搞钱公式：1. 必须是自己发自内心认可的事；2. 时间和人身必须相对自由；3. 过程必须充满审美趣味与创造性。一旦满足这三点，他的内驱力就会成百倍爆发，创造出降维打击的精品。",
        actionableAdvice: "定位高端、高附加值、高审美的情绪与精神消费赛道，宁缺毋滥，打造品质壁垒。",
    },
    // 114
    {
        id: "insight_batch4_114",
        sourceIndex: 114,
        types: ["INFP"],
        series: "亲密关系与恋爱全流程",
        title: "怎么追INFP？喜欢的不用追，不喜欢的磕破头也没用",
        archetype: "感觉定生死者",
        analogy: "认主的灵兽：闻到同类的气息瞬间扑进怀里，闻到讨厌的味道哪怕给金山也落荒而逃",
        coreParadox: "看似最没有防御机制的小动物，择偶门槛却比谁都绝对玄学",
        quote: "怎么追INFP？喜欢的根本不用追，不喜欢的就算你把头给磕破了，它也会躲着你。",
        cleanedText: "追求INFP不存在所谓'感动式追求'。他的磁场感知极度敏锐，初见时是否对你产生灵魂层面的好感，在最初几次接触就已经定格。如果他不喜欢你，你的每一次殷勤在他眼里都是需要应对的沉重债务，只会让他加速逃离。",
        actionableAdvice: "展现你的真实与个性，吸引他主动靠近，切忌用大张旗鼓的感动式求爱逼他就范。",
    },
    // 115
    {
        id: "insight_batch4_115",
        sourceIndex: 115,
        types: ["INFP"],
        series: "深度画像与本命天赋",
        title: "最爽的INFP剧本：精神与物质的双重富养",
        archetype: "温室中的仙葩",
        analogy: "在充足爱意中抽枝发芽的奇花：唯有不被生存焦虑摧残，才能绽放出惊世绝艳",
        coreParadox: "外界常笑他不切实际，但在充满爱与宽容的土壤里，他能结出最丰盛的精神果实",
        quote: "最爽的小蝴蝶剧本：原生家庭充满爱，同时还有钱。在精神与物质的富养下自由展翅。",
        cleanedText: "如果一个INFP足够幸运，生于充满包容、尊重其独特天性且经济宽裕的家庭，他便无需经历残酷的生存折磨。他会成长为极具创造力、眼神清澈、善良纯真的大艺术家或学者，成为世间最温润美好的存在。",
        actionableAdvice: "若未拿到此剧本，成年后做自己的再生父母，用金钱与深度自爱对自己进行彻底的'再富养'。",
    },
    // 116
    {
        id: "insight_batch4_116",
        sourceIndex: 116,
        types: ["INFP"],
        series: "深度画像与本命天赋",
        title: "INFP的一天：上午荒废，下午放空，晚上觉醒",
        archetype: "夜行造梦师",
        analogy: "猫头鹰的作息：白昼是昏睡与混沌，午夜是灵感与神祇对话的狂欢",
        coreParadox: "白天看似颓废摆烂一事无成，深夜却在内心宇宙中完成了千百次思想革命与作品构思",
        quote: "INFP身边的朋友很多是没有上午的，上午略过或躺床上玩手机，晚上才灵魂觉醒。",
        cleanedText: "INFP的生物钟与精神机制严重后滞。由于主导Fi需要极长时间的自检与预热，上午往往处于低能量开机状态；唯有到了万籁俱寂的深夜，世俗的噪音彻底熄灭，他的Ne灵感天线才完全苏醒，思如泉涌。",
        actionableAdvice: "接纳自己的夜行节奏，将重要的创作、写作与战略思考安排在深夜或黄昏的高峰时段。",
    },
    // 117
    {
        id: "insight_batch4_117",
        sourceIndex: 117,
        types: ["INFP"],
        series: "深度画像与本命天赋",
        title: "INFP忙里偷闲的拖延：高压下的心理防火墙",
        archetype: "高压遁逃者",
        analogy: "鸵鸟把头埋进沙堆：明知周围暴风雨，先在这一寸沙土里享受片刻安宁",
        coreParadox: "事情堆积如山时，他反而能心安理得躺在床上刷手机，享受偷来的平静",
        quote: "事情堆在身上压得喘不过气，小蝴蝶却想躺在床上玩手机，这是他本能的心理自保。",
        cleanedText: "当外界待办事项与现实压力超出INFP的承载极限时，他的大脑会自动切断与现实的连接。这种在外人看来极度不负责任的'摆烂拖延'，实则是其精神系统为了防止神经崩溃而启动的紧急熔断机制。",
        actionableAdvice: "将巨大的任务拆解为15分钟的微小碎片，先迈出一小步打破瘫痪状态，逐步恢复掌控感。",
    },
    // 118
    {
        id: "insight_batch4_118",
        sourceIndex: 118,
        types: ["INFP"],
        series: "四大组别的终极心性修行",
        title: "INFP的时代正在降临：精神觉醒与情绪价值纪元",
        archetype: "新纪元祭司",
        analogy: "穿越漫长工业黑夜后，终于迎来了以审美与疗愈为最高货币的黎明",
        coreParadox: "工业时代被视为多愁善感的无用之人，在AI时代其不可替代的情感与审美成为最贵资产",
        quote: "小蝴蝶的时代要来了：当物质极大丰富，精神、审美与情绪价值将成为唯一的稀缺品。",
        cleanedText: "在过去依靠纯体力与流水线效率的时代，INFP极度边缘化。但随着AI接管所有基础脑力与代码，人类社会的终极痛点全面转向精神虚无与情感匮乏。INFP与生俱来的共情力、审美力与精神筑梦能力将迎来前所未有的爆发。",
        actionableAdvice: "坚守内心的灵性与审美追求，不要在旧时代的工业流水线里自怨自艾，拥抱新时代浪潮。",
    },
    // 119
    {
        id: "insight_batch4_119",
        sourceIndex: 119,
        types: ["INFP"],
        series: "亲密关系与恋爱全流程",
        title: "INFP没有固定理想型：唯独最烦油腻舔狗",
        archetype: "心动捕手",
        analogy: "天上的风：你无法预测哪一阵微风能吹动风铃，但工业鼓风机一定只会吹翻屋顶",
        coreParadox: "千人千面纯看感觉，但任何带有目的性、谄媚讨好的行径必踩其死穴",
        quote: "INFP没有理想型，一千个蝴蝶有一千种喜欢，但最烦的就是油腻无脑的舔狗。",
        cleanedText: "试图用条条框框去匹配INFP的理想型是徒劳的。但他心中有一份极其坚决的黑名单：油腻自大、无脑谄媚、缺乏自我主见、试图用金钱物化感情的人。展现你清爽独立、甚至略带傲气的个人魅力，反而更能引起他的好奇。",
        actionableAdvice: "做真实的自己，保持适当的高冷与独立，不要无底线跪舔迎合他的每一个眼神。",
    },
    // 120
    {
        id: "insight_batch4_120",
        sourceIndex: 120,
        types: ["INFP"],
        series: "深度画像与本命天赋",
        title: "INFP的精神花园：深到能装下每一种情绪的名字",
        archetype: "心灵造物主",
        analogy: "幽暗密林深处的发光湖泊：湖底沉淀着万千未言之言，每一尾游鱼都是一种被命名的情绪",
        coreParadox: "外在生活可能拮据甚至狼狈，内心却拥有一座比整个帝国还要宏大深邃的神殿",
        quote: "每个INFP心里都有一个小世界，深到装得下所有未说出口的话，每种情绪都有名字。",
        cleanedText: "INFP的终极宝藏在于其无与伦比的内心精神花园。在那里，孤独是蓝色的，悲伤是带露水的紫罗兰，愤怒是无声燃烧的沉香。这个世界是他无论身处何等逆境，都能随时抽身退守、重塑灵魂的神圣庇护所。",
        actionableAdvice: "用文字、画笔或音乐将这座精神花园投射到现实世界中，那是你留给人类最珍贵的礼物。",
    },
    // 121
    {
        id: "insight_batch4_121",
        sourceIndex: 121,
        types: ["INFP"],
        series: "深度画像与本命天赋",
        title: "INFP啰嗦跳跃的表达：边说边解开脑中线团",
        archetype: "思维织网人",
        analogy: "毛线球解套现场：先拉扯出一根线头，随着倾诉慢慢织成毛衣",
        coreParadox: "听起来颠三倒四没有重点，其实是在借助语言的交互来理顺大脑中奔涌的情绪直觉",
        quote: "INFP说话啰嗦绕弯听不懂，本质上是通过对你说一段话，来慢慢理清自己脑中的思路。",
        cleanedText: "由于第一功能Fi（复杂情感）和第二功能Ne（多维发散），INFP大脑中的想法是立体全息的，很难直接转化为线性的逻辑输出。当他跟你絮絮叨叨、跳跃绕弯时，他是在把你当成梳理思路的催化剂与安全树洞。",
        actionableAdvice: "多给他一点耐心，不要中途粗暴打断催要结论，听他把话说完，珍珠自会浮现。",
    },
    // 122
    {
        id: "insight_batch4_122",
        sourceIndex: 122,
        types: ["INFP"],
        series: "社交防御与四层圈层",
        title: "INFP三大不可饶恕雷区：大声、全名与打压精神自由",
        archetype: "惊弓之鸟",
        analogy: "受惊的小鹿：一旦有巨响或捕兽夹的气味，瞬间头也不回地隐入密林深处",
        coreParadox: "看起来与世无争好脾气，一旦触碰精神领地瞬间亮出鱼死网破的骨气",
        quote: "INFP三大雷区：大声说话、突然大声叫全名、在他重视的领域打压否定他侵犯精神自由。",
        cleanedText: "与INFP交往的保命红线：1. 严禁突然大声喧哗吼叫（会击碎其脆弱神经）；2. 严禁怒气冲冲直呼其全名（触发童年被审判创伤）；3. 严禁在他热爱的精神领域以居高临下的姿态指点江山、予以否定。触碰一条直接心门落锁。",
        actionableAdvice: "温和轻声地沟通，尊重他在小众领域的审美与见解，即便不同意也请保持礼貌沉默。",
    },
    // 123
    {
        id: "insight_batch4_123",
        sourceIndex: 123,
        types: ["INFP"],
        series: "亲密关系与恋爱全流程",
        title: "INFP恋爱脑的投射：把现实之人框进浪漫剧本",
        archetype: "剧本投射编剧",
        analogy: "拿着现成的神话画框寻找模特：只要你某一瞬间符合光影，便强行将你封为画中仙",
        coreParadox: "爱上的可能根本不是眼前的真人，而是自己大脑投射出来的完美浪漫化身",
        quote: "INFP谈恋爱不一定了解对方，哪怕有一瞬间符合脑中的浪漫剧本，就把对方框进来了。",
        cleanedText: "INFP极易陷入'偶像剧式恋爱脑'：在接触初期，他并不真正了解对方的柴米油盐与不堪，仅仅因为对方在夕阳下的一个侧脸或一句诗意的问候，便把对方套入自己构思已久的浪漫史诗。破灭往往发生在剧本与真实生活的碰撞中。",
        actionableAdvice: "多观察对方在世俗生活中的真实缺点与处事态度，尽早完成从'爱幻想'到'爱具体之人'的着陆。",
    },
    // 124
    {
        id: "insight_batch4_124",
        sourceIndex: 124,
        types: ["INFP"],
        series: "深度画像与本命天赋",
        title: "INFP的犯倔与硬撑：外柔内刚的悬崖自保",
        archetype: "悬崖幼兽",
        analogy: "被逼入死角的小猫炸毛亮爪：看似张牙舞爪不讲理，其实浑身都在发抖",
        coreParadox: "看起来不可理喻胡搅蛮缠，背后是安全感粉碎、退无可退的极致虚弱与硬撑",
        quote: "INFP外柔内刚，犯倔时很不讲道理。他张牙舞爪不可理喻时，其实是在硬撑着崩溃。",
        cleanedText: "当INFP突然变得不可理喻、油盐不进地犯倔时，切莫与他正面讲大道理。此时他的底层安全感已全面崩盘，感觉自己站在万丈悬崖边缘。他那副不讲理的刺猬姿态，是他保全残存自尊的最后一块铠甲。",
        actionableAdvice: "停止讲理和辩论，退后一步抱抱他，温和确认他的情绪，等他哭出来后风暴自会平息。",
    },
    // 125
    {
        id: "insight_batch4_125",
        sourceIndex: 125,
        types: ["INFP"],
        series: "深度画像与本命天赋",
        title: "情绪是INFP唯一的燃料：不能无视，只能转化",
        archetype: "情感动力引擎",
        analogy: "以情绪为燃料的火箭：心情好冲上九天揽月，情绪堵塞则彻底熄火趴窝",
        coreParadox: "无法像TJ人那样把情绪关进抽屉强行启动，不通畅的情感会瞬间转化为肉体瘫痪",
        quote: "INTJ能无视情绪利己启动，INFP离不开情绪，情绪是做事的唯一动力和燃料。",
        cleanedText: "INTJ等理性人可以通过冷酷的意志力和利益导向压制情绪强行工作；而INFP的精神系统完全由情感驱动。如果内心感到委屈、厌烦或无意义，他连一封邮件都发不出去。逼迫他只会带来严重的抑郁与躯体化反噬。",
        actionableAdvice: "工作前先照顾好自己的情绪状态，做几件让自己开心的小事给引擎加满油，再顺水推舟做事。",
    },
    // 126
    {
        id: "insight_batch4_126",
        sourceIndex: 126,
        types: ["INFP"],
        series: "深度画像与本命天赋",
        title: "初见INFP：存在感极低却礼貌温柔至极",
        archetype: "林间清风",
        analogy: "角落里静静绽放的雏菊：不主动争抢阳光，但只要你走近，便回以一缕淡雅馨香",
        coreParadox: "默默无闻毫无攻击性，只要你主动搭话，瞬间报以毫无防备的真诚微笑",
        quote: "初见INFP存在感不强，但只要主动搭话，又会极热情真诚地回应你，超有礼貌和边界感。",
        cleanedText: "在陌生聚会中，INFP往往躲在角落安安静静吃东西看手机，毫无存在感。但若有善意之人主动向他示好，他会立刻坐直身子，带着温柔克制的微笑真诚回应，礼貌周全，让人如沐春风。",
        actionableAdvice: "不要被他的外在安静劝退，只要你带着善意迈出第一步，他会成为你最忠诚的朋友。",
    },
    // 127
    {
        id: "insight_batch4_127",
        sourceIndex: 127,
        types: ["INFP"],
        series: "深度画像与本命天赋",
        title: "猫是INFP的生物本体：高冷傲娇与暗中关注",
        archetype: "猫系人类",
        analogy: "趴在书架顶端的大猫：看似对你不理不睬，耳朵却一直在随着你的脚步转动",
        coreParadox: "极度独立抗拒打扰，却无时无刻不在默默渴望着你的温柔抚摸",
        quote: "猫才是INFP的本体：既独立又渴望亲密。别看它每天高冷，其实你的每个小动作它都看在眼里。",
        cleanedText: "养过猫的人最懂INFP：他需要极大的个人空间，你太热情贴上来他会嫌弃躲开；但当你安静看书工作时，他又会悄悄蹭过来把下巴搁在你手腕上。他用高冷保护敏感，用傲娇试探真心。",
        actionableAdvice: "用养猫的心态与INFP相处：尊重他的领地，保持适度距离，等待他主动向你翻肚皮。",
    },
    // 128
    {
        id: "insight_batch4_128",
        sourceIndex: 128,
        types: ["INFJ", "INFP"],
        series: "深度画像与本命天赋",
        title: "INF对大声的天然生理厌恶：外卖请放门口别敲门",
        archetype: "高敏听觉精灵",
        analogy: "精密声纳仪：寻常人耳中的一声咳嗽，在他脑中就是一场震耳欲聋的地动山摇",
        coreParadox: "精神天线无时无刻不在全向接收环境讯息，突兀的巨响就是对灵魂的暴力入侵",
        quote: "INF对声音极度敏感：外卖备注永远是'不要敲门直接放门口'，大声喧哗是对他的酷刑。",
        cleanedText: "INFJ与INFP由于神经系统高度敏感，对突然的巨响（敲门、摔碗、吼叫、冲马桶）有近乎生理性的惊恐反应。这就是为什么INF人的外卖备注千篇一律是'请直接放门口，千万别敲门'。安静是他维持心智稳定的底线。",
        actionableAdvice: "进入INF人的生活空间，关门请轻带，说话请降噪，你的轻柔是对他最深沉的体贴。",
    },
    // 129
    {
        id: "insight_batch4_129",
        sourceIndex: 129,
        types: ["INFJ", "INFP"],
        series: "亲密关系与恋爱全流程",
        title: "INF的死嘴与猜谜执念：要的是不用开口的坚定选择",
        archetype: "静默考验官",
        analogy: "密封在古堡深处的密信：死活不张嘴，却渴望有一位心有灵犀的骑士直接解开密码",
        coreParadox: "自己长了个死嘴死活不说，偏要对方心领神会，猜中之后还要义无反顾地去做",
        quote: "INF长了个死嘴就是不说，要自己不说对方能猜中，猜中了还能坚定去做，完全是拿对方当神仙整。",
        cleanedText: "INF人在亲密关系中的最大顽疾就是'绝不张嘴要'。在他们的心智中，一旦自己开口要来的东西就毫无价值了。他渴望的是你通过细微观察主动发现他的需求，不仅能猜中，而且毫不犹豫地给到他，以此证明自己在你心中独一无二。",
        actionableAdvice: "INF人要学会大方表达需求，伴侣不是你肚子里的蛔虫；伴侣则需多关注其细节反馈，主动给予惊喜。",
    },
    // 130
    {
        id: "insight_batch4_130",
        sourceIndex: 130,
        types: ["INTJ"],
        series: "亲密关系与恋爱全流程",
        title: "INTJ一眼定生死：前三秒决定，后面全在合理化",
        archetype: "直觉裁决者",
        analogy: "高精雷达锁定目标：三秒内完成光谱分析，不在波长内的永远归入杂波",
        coreParadox: "看似最讲究逻辑推演的理科生，择偶时却最具宿命玄学色彩——没有日久生情",
        quote: "INTJ一眼定生死，喜不喜欢前三秒就决定了，后面全是合理化，没有日久生情这回事。",
        cleanedText: "颠覆刻板印象：INTJ在感情上不是按评分表慢慢打分，而是主导Ni在初见的瞬间完成直觉定性。前三秒的感觉对了，他强大的Te才会开始找各种理由合理化；如果前三秒没感觉，哪怕相处十年也只能是相敬如宾的同事或普通朋友。",
        actionableAdvice: "追求INTJ不要幻想靠持久战打动他，初次接触时展现最真实的个人辨识度，定生死便在顷刻之间。",
    },
    // 131
    {
        id: "insight_batch4_131",
        sourceIndex: 131,
        types: ["INTJ"],
        series: "深度画像与本命天赋",
        title: "INTJ不想当老大：掌控欲强是因为看不惯庸人瞎搞",
        archetype: "被迫登基的摄政王",
        analogy: "只想在藏经阁看书的谋士：看到前线将领胡乱指挥气得吐血，被迫披挂上阵夺过帅印",
        coreParadox: "毫无当官做领袖的世俗野心，常常被迫走到台前只是因为看不下去别人做成一坨烂泥",
        quote: "INTJ不想当老大，他掌控欲强是因为看别人做太烂干着急，不得已自己来当老大。",
        cleanedText: "与ENTJ天生渴望权力不同，INTJ本质是个孤僻的幕僚与工程师。他最理想的状态是躲在幕后做自己的研究。但在现实中，当他看到愚蠢的领导和低效的流程把项目推向毁灭时，强烈的完美主义逼得他不得不挺身而出夺回控制权。",
        actionableAdvice: "如果你想让INTJ安心辅佐你，请用无可挑剔的专业能力与高效率证明你的决策，否则他迟早会反客为主。",
    },
    // 132
    {
        id: "insight_batch4_132",
        sourceIndex: 132,
        types: ["INTJ"],
        series: "商业搞钱与战略破局",
        title: "INTJ的搞钱之道：赚眼光与专业维度的认知溢价",
        archetype: "战略远见投资家",
        analogy: "航海时代的造船大师：在晴空万里时预见到暴风雨，在所有人恐慌时抢先买下唯一的深水港",
        coreParadox: "不善短线投机倒把，却能以超越时代的眼光押中长周期爆发的未来资产",
        quote: "INTJ赚的是眼光的钱、专业的钱：别人没看到他看到，别人不信他相信。",
        cleanedText: "INTJ在商业上的核心优势是'远期推演+专业壁垒'。他极少跟风炒作追逐热点，而是静下心来钻研一个极具门槛的技术或行业趋势，在所有人漠视甚至嘲笑时重仓布局，等待大周期的历史车轮碾压而来，收取丰厚的认知兑现。",
        actionableAdvice: "远离短线投机噪音，把时间和资本投入到具备长期复利效应的高壁垒专业资产上。",
    },
    // 133
    {
        id: "insight_batch4_133",
        sourceIndex: 133,
        types: ["INTJ"],
        series: "亲密关系与恋爱全流程",
        title: "怎么追INTJ？直球透明是唯一的通关秘籍",
        archetype: "纯粹鉴赏家",
        analogy: "扫描仪前的测试者：任何代码加密或作弊都会触发警报，唯有纯文本直接通过",
        coreParadox: "看透了世间所有套路和心机，因此面对任何套路瞬间免疫，唯有笨拙的真诚能破防",
        quote: "怎么追INTJ？直球透明的心态：看到了什么就说什么，感觉到了什么就坦白，不做作。",
        cleanedText: "追INTJ千万不要使用欲擒故纵、故弄玄虚或社交名媛式的推拉话术。他本身就是破译谜题的高手，任何套路在他眼里都像透明的小丑表演。直接、真诚、坦荡地表达你的欣赏与想法，这种罕见的纯粹反而能让他肃然起敬。",
        actionableAdvice: "沟通就事论事，喜欢就大方表达，有顾虑就坦诚交流，杜绝任何试探性的绿茶操作。",
    },
    // 134
    {
        id: "insight_batch4_134",
        sourceIndex: 134,
        types: ["INTJ"],
        series: "亲密关系与恋爱全流程",
        title: "INTJ的轰轰烈烈与断崖式抽离：结果导向的终极止损",
        archetype: "冰与火之歌",
        analogy: "核电站的冷却系统：运转时万度高温烈火，一旦检测到致命泄漏，瞬间注入液氮彻底封堆",
        coreParadox: "深情时可以为你对抗全世界，一旦评估出未来绝无可能，断联时冷酷得像从来没认识过",
        quote: "INTJ的爱意轰轰烈烈，消失也戛然而止。爱情不是过程而是结果，评估无法闭环立刻断崖。",
        cleanedText: "INTJ的感情极度决绝：他在爱意浓烈时可以付出一切现实资源；但其核心心智模型是结果导向。一旦在长期相处中反复推演，发现两人的核心价值观冲突无法调和、对方无法融入自己的未来蓝图，他会理智地拉下电闸，断崖式斩断，绝不拖泥带水。",
        actionableAdvice: "与INTJ相处要展现对未来的规划与解决问题的能力，不要让他对两人未来的可行性失去信心。",
    },
    // 135
    {
        id: "insight_batch4_135",
        sourceIndex: 135,
        types: ["INTJ"],
        series: "深度画像与本命天赋",
        title: "INTJ为什么看起来很贵？话少与沉稳是终极节能策略",
        archetype: "黑天鹅贵族",
        analogy: "顶级手工机械表：机芯严密运转，没有一丝多余的杂音与震颤",
        coreParadox: "外人以为是高冷清高或社交恐惧，实则是历经万千试错后选定的最高效生存姿态",
        quote: "INTJ为什么一看就很贵？因为它安静、话少、很稳。这是大量试错后选定的终极节能模式。",
        cleanedText: "INTJ在社交场中常给人一种高级的威严感与贵气。这源于他从不无意义地喧哗、附和或卖弄。他的安静不是自卑，而是将原本就有限的心理能量（劣势Se）进行极其苛刻的资源管控，只在真正关键的时刻发出一击必杀的指令。",
        actionableAdvice: "保持这种沉静的定力，无需为了迎合世俗的热闹而强迫自己表演假笑。",
    },
    // 136
    {
        id: "insight_batch4_136",
        sourceIndex: 136,
        types: ["INTJ"],
        series: "深度画像与本命天赋",
        title: "重申INTJ的极简静默：不喧哗是最大的力量",
        archetype: "静水流深者",
        analogy: "深海潜航的核潜艇：无声无息掠过洋底，蕴含着改变世界格局的磅礴力量",
        coreParadox: "言辞极度精简，内心推演的棋局却广袤无垠",
        quote: "话少是因为看透了无意义社交的消耗，沉稳是因为胸中有确定的路线图。",
        cleanedText: "话多者往往心虚，言简者往往心明。INTJ的少言寡语是他思想纯度的体现。他不需要通过滔滔不绝来证明存在感，他交出的成绩单与终极成果自会替他在世界上轰然作响。",
        actionableAdvice: "把沉默当成你的护甲，继续深耕你的系统架构，用交付结果回击一切质疑。",
    },
    // 137
    {
        id: "insight_batch4_137",
        sourceIndex: 137,
        types: ["INTJ"],
        series: "亲密关系与恋爱全流程",
        title: "INTJ的亲密羞耻与回避：看似障碍，实则是护城河",
        archetype: "重甲守卫者",
        analogy: "古堡外的深水壕沟与吊桥：看起来阻碍了交通，其实阻挡了99%的盗匪与闲杂人等",
        coreParadox: "看似有表达障碍和亲密恐惧，其实这层障碍帮他精准筛选掉了所有轻浮的过客",
        quote: "INTJ有表达障碍与亲密羞耻，看似是毛病，实则是护城河，帮他免于无意义的消耗。",
        cleanedText: "很多心理学流派试图'矫正'INTJ的情感回避与亲密羞耻。然而对于INTJ来说，这种不习惯肉贴肉、讨厌油腻亲密的本能，恰恰是他最强大的免疫系统。它天然过滤掉了心术不正与只想索取情绪价值的人，保护其纯净核心。",
        actionableAdvice: "不必为自己的慢热和羞涩感到自卑，能耐心跨过护城河、登上吊桥的人，才配拥有你的整座城堡。",
    },
    // 138
    {
        id: "insight_batch4_138",
        sourceIndex: 138,
        types: ["INTJ"],
        series: "亲密关系与恋爱全流程",
        title: "INTJ的洞穴时间：谈恋爱最容易分手的致命阶段",
        archetype: "洞穴疗伤兽",
        analogy: "关机维护的超级计算机：断开外部网络进行系统重构，此时强行拔电源必烧主板",
        coreParadox: "回消息变慢不是因为不爱了，而是在处理重大危机；此时去闹就是亲手按下自爆按钮",
        quote: "和INTJ谈最容易分手的阶段是他的洞穴时间：消息回得慢，去闹就会瞬间触发冷暴力与断崖。",
        cleanedText: "当INTJ遭遇事业重创或人生难题时，他本能地需要彻底与外界隔绝，缩进精神洞穴全力解决问题。如果伴侣在这个时候因为安全感作祟，疯狂查岗、质疑他不爱自己、逼他即时回复，INTJ会在狂躁中直接判定伴侣是'负资产'而迅速提分手。",
        actionableAdvice: "当INTJ进入洞穴时，留下一句'有需要随时喊我，你先忙'，然后各忙各的，他回血后会加倍感激你的懂事。",
    },
    // 139
    {
        id: "insight_batch4_139",
        sourceIndex: 139,
        types: ["INTJ"],
        series: "亲密关系与恋爱全流程",
        title: "INTJ非黑即白的情感模式：要么绝缘体，要么纯上头",
        archetype: "绝对零度与纯火",
        analogy: "超导开关：电阻要么是无穷大（绝缘），要么是绝对零（瞬间超导全功率通电）",
        coreParadox: "没有中间的暧昧温吞区，前十分钟定生死，千万别装因为他能洞悉本质",
        quote: "INTJ谈恋爱只有两种状态：绝缘体和纯上头。千万不要装，因为他一眼能看透本质。",
        cleanedText: "INTJ的心是一扇高压防爆门：对于没有触动他的人，他是不可接近的绝对绝缘体；而一旦通过审核认定了你，他会瞬间变成最热烈、最忠诚、把整颗心奉上的纯上头小孩。在接触时伪装完美是极其愚蠢的，因为其Ni能轻易看透一切虚伪。",
        actionableAdvice: "在他面前做最纯粹透明的自己，展示真实的优缺点，你的不完美在诚实面前反而是亮点。",
    },
    // 140
    {
        id: "insight_batch4_140",
        sourceIndex: 140,
        types: ["INTJ"],
        series: "深度画像与本命天赋",
        title: "INTJ的谋生与谋爱：截然分开的双轨操作系统",
        archetype: "双核处理器",
        analogy: "白天是无情屠龙的冷面将军，夜晚是卸下战甲依偎在你怀里的纯情笨拙少年",
        coreParadox: "谋生时理智残忍得像一台机器，谋爱时却笨拙脆弱得像个三岁孩童",
        quote: "INTJ把谋生和谋爱分得很开：谋生时高智商无情结果导向，谋爱时笨拙专一渴望依靠。",
        cleanedText: "INTJ的终极魅力在于其极致的反差感：在搞事业、谋生计的战场上，他杀伐果断、无视一切人情世故与道德绑架，只认结果与效率；而在谋爱的私密领地里，他的第三功能Fi苏醒，会展现出令人心碎的单纯、笨拙与毫无防备的依赖。",
        actionableAdvice: "不要被他白天的威严吓退，在私下用最温暖的包容接纳那个笨拙的小孩，他是属于你一人的战利品。",
    },
];
async function runBatch4() {
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
        console.log(`=== INGESTING BATCH 4 (Entries 91-140, Size: ${batch4Data.length}) ===`);
        // 1. Ensure Series nodes
        const seriesSet = new Set(batch4Data.map((d) => d.series));
        for (const sName of seriesSet) {
            await session.run(`MERGE (s:Series {name: $name})
         ON CREATE SET s.createdAt = datetime()
         RETURN s`, { name: sName });
        }
        console.log(`Ensured ${seriesSet.size} Series nodes.`);
        // 2. Ingest Insights and Type linkages
        for (const entry of batch4Data) {
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
                if (typeCode === "ALL")
                    continue;
                await session.run(`MATCH (t:Type {code: $typeCode})
           MATCH (i:Insight {id: $id})
           MERGE (t)-[r:HAS_INSIGHT]->(i)
           ON CREATE SET r.createdAt = datetime()
           RETURN count(r)`, { typeCode, id: entry.id });
            }
        }
        console.log(`Ingested ${batch4Data.length} Insight nodes and Type linkages.`);
        // 3. Update Type core properties for INFJ, INFP, INTJ
        console.log("Updating Type properties for INFJ, INFP, INTJ...");
        await session.run(`MATCH (t:Type {code: 'INFJ'})
       SET t.archetype = '千年吸血鬼 / 五星酒店服务员 / 绿紫结合体',
           t.vividAnalogy = '像空心杯子、也像五星酒店服务员；你说什么他都秒懂，剥开洋葱皮是纯粹的炽热；眼神经常放空微笑',
           t.coreParadox = '用一辈子秒懂别人，自己却极难被他人秒懂；外表像如沐春风的绿人，内核却藏着极其冷酷犀利的紫人灵魂',
           t.energyModel = '主导Ni抽象预知 + 辅助Fe博爱共情 + 第三Ti冷酷解构 + 劣势Se感官易过载厌恶大声'`);
        await session.run(`MATCH (t:Type {code: 'INFP'})
       SET t.archetype = '猫系人类 / 精神花园造梦师 / 纯爱小蝴蝶',
           t.vividAnalogy = '猫是他的本体；心中有一座深邃的精神花园；上午荒废下午放空晚上灵魂觉醒；情绪是唯一的开机燃料',
           t.coreParadox = '看似柔弱好欺负，犯倔时外柔内刚不可理喻；渴望亲密却又害怕失去，进一步退两步跳探戈',
           t.energyModel = '主导Fi绝对自洽与情绪燃料 + 辅助Ne浪漫跳跃脑洞 + 第三Si深沉怀旧内耗 + 劣势Te现实执行拖延'`);
        await session.run(`MATCH (t:Type {code: 'INTJ'})
       SET t.archetype = '深空谋略家 / 洞穴独行者 / 结构化智脑',
           t.vividAnalogy = '一眼定生死，非绝缘体即纯上头；谋生与谋爱截然分开；看似清高寡言，实则是终极节能策略；被迫当老大因为别人做太烂',
           t.coreParadox = '深情轰轰烈烈却能断崖式抽离；极度渴望灵魂伴侣却又筑起亲密羞耻与回避的护城河',
           t.energyModel = '主导Ni大局推演 + 辅助Te铁血落地执行 + 第三Fi深沉小孩心性 + 劣势Se现实肉身迟钝与节能'`);
        // 4. Final DB Stats
        const countRes = await session.run(`
      MATCH (n)
      WITH count(n) AS totalNodes
      MATCH ()-[r]->()
      RETURN totalNodes, count(r) AS totalRels
    `);
        const nodeCount = countRes.records[0].get("totalNodes").toNumber();
        const relCount = countRes.records[0].get("totalRels").toNumber();
        console.log(`\n=== BATCH 4 (50 entries) INGESTION COMPLETE ===`);
        console.log(`Live Neo4j AuraDB Stats: ${nodeCount} Nodes, ${relCount} Relationships.`);
    }
    finally {
        await session.close();
        await driver.close();
    }
}
runBatch4().catch((err) => {
    console.error("Batch 4 ingestion failed:", err);
    process.exit(1);
});
