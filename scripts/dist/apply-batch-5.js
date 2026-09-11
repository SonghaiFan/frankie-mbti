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
const batch5Data = [
    // 141
    {
        id: "insight_batch5_141",
        sourceIndex: 141,
        types: ["INTP"],
        series: "深度画像与本命天赋",
        title: "INTP的工作节奏：工位吃薯片与纯脑力价值",
        archetype: "纯脑力极客",
        analogy: "高精密云端算力中心：别让他去当跑腿搬运工，只用大脑解决核心底层架构",
        coreParadox: "工位吃薯片刷视频看似散漫，其实大脑正在高速运转推演算法，讨厌被规训",
        quote: "INTP工作节奏要掌控在自己手里，千万别去规训他，要用就用他的脑子，别用他的手脚。",
        cleanedText: "INTP在工作中必须拥有自主节奏。他在工位吃零食刷视频并非自命清高，纯粹是其思维预热的必要状态。他极度排斥官僚考勤与繁琐的执行跑腿（如年会筹办与多地差旅）。领导若懂他，只需把最棘手的逻辑难题抛给他，给他绝对自由，他便能交付惊世成果。",
        actionableAdvice: "给INTP弹性的考核标准与独立攻坚任务，避免用世俗的'坐班时长'压抑其天才灵感。",
    },
    // 142
    {
        id: "insight_batch5_142",
        sourceIndex: 142,
        types: ["INTP"],
        series: "深度画像与本命天赋",
        title: "INTP全面分析：松弛感拉满的绝境翻盘高手",
        archetype: "绝境翻盘高手",
        analogy: "顺境看绿人，逆境看紫人，绝境看INTP：看似漫不经心的扫地僧，危难关头一招定乾坤",
        coreParadox: "别人大笑时他面无表情，荒诞古怪的小点却能让他狂喜；松弛外表下藏着精密拆解大模型的Ti利刃",
        quote: "顺境看绿人，逆境看紫人，绝境就看INTP。松弛感点满，Ti精密拆解万物。",
        cleanedText: "INTP被誉为全场终极定海神针。第一功能Ti（内倾思考）让他拥有惊人的底层模型解构能力，哪怕面对爱因斯坦相对论公式也能快速领会内核；第二功能Ne赋予他天马行空的荒诞幽默。在全员慌乱的绝境中，他那份极致的冷峻与松弛感往往能找到唯一的破局解法。",
        actionableAdvice: "在重大技术攻坚或系统崩塌的危机时刻，倾听INTP看似荒唐却直击本质的直觉建议。",
    },
    // 143
    {
        id: "insight_batch5_143",
        sourceIndex: 143,
        types: ["INTP"],
        series: "亲密关系与恋爱全流程",
        title: "INTP恋爱全景：猪笼草、真理对抗与假装不在乎的倔小孩",
        archetype: "真理探索倔小孩",
        analogy: "猪笼草与冷宫顽童：散发信息素等猎物跌入；嘴硬说'你滚吧'，其实拥抱一下立刻融化成粘人小孩",
        coreParadox: "面对生活琐事唠叨表现得油盐不进，伴侣越讲世俗大道理，他越搬出宇宙终极真理回击",
        quote: "一屋不扫何以扫天下？INTP会说：那你扫家里，我去扫天下。道德只是文明产物，只有光速和虚无永恒。",
        cleanedText: "INTP恋爱心理极其反直觉：理想型是真诚性感且具母性包容的人；极度反感生活琐事规训（如必须怎样挤牙膏）。他用回避测试对方是否坚定选择自己；热恋期毫无禁忌，精力拉满；冷淡期只是缩回个人世界摆弄乐高与理论。和药水谈恋爱不该谈琐碎情绪，应该谈生命、自由与宇宙真理。",
        actionableAdvice: "切勿在生活规矩上与其硬碰硬较劲；在他嘴硬推开你时坚定抱住他，做那个包容他探索世界的精神港湾。",
    },
    // 144
    {
        id: "insight_batch5_144",
        sourceIndex: 144,
        types: ["INTP"],
        series: "商业搞钱与战略破局",
        title: "INTP怎么赚钱？适合当富二代与高阶智慧变现",
        archetype: "智识炼金师",
        analogy: "象牙塔里的理论物理学家：若非为了生存，他只想一辈子坐在长椅上思考宇宙常数",
        coreParadox: "骨子里视金钱如粪土，但只要把好奇心与前沿科技结合，其核心技术专利便价值连城",
        quote: "INTP怎么赚钱？首先不爱赚钱适合当富二代。要赚必须足够自由、好玩、满足好奇心且不设限。",
        cleanedText: "INTP是最不具市侩铜臭味的人格。传统的朝九晚五打工会扼杀其灵魂。他最理想的搞钱路径是：从事AI前沿研发、密码学、量化交易模型、独立软件架构或前沿学术咨询，利用高维智力杠杆实现被动收入，换取绝对的自由人生。",
        actionableAdvice: "把精力集中在最具壁垒的底层逻辑与算法上，将商业谈判与运营落地完全委托给合伙人。",
    },
    // 145
    {
        id: "insight_batch5_145",
        sourceIndex: 145,
        types: ["INTP"],
        series: "亲密关系与恋爱全流程",
        title: "追INTP的绝对死穴：装逼、炫耀与粗糙表达",
        archetype: "真相测谎仪",
        analogy: "无尘实验室：任何一粒世俗虚伪的微尘落入，都会导致整台精密仪器直接报警停机",
        coreParadox: "包容你的各种怪癖与任性，但只要你开始炫耀浮夸或弄虚作假，他瞬间毫无性欲",
        quote: "追INTP第一雷区是在他面前炫耀装逼；表达粗糙说不明白听不明白，直接让他毫无欲望。",
        cleanedText: "追求INTP不需要任何高超套路，但必须守住智性与真诚的底线。在他面前卖弄权势、财富或半吊子学识，会瞬间触发他的鄙夷机制。此外，表达含糊、逻辑混乱的粗糙沟通会让其极其疲惫。真诚、聪敏、干净是他唯一的通行证。",
        actionableAdvice: "在他面前多展示求知欲与不懂就问的诚实态度，以平等深度的智识讨论切入关系。",
    },
    // 146
    {
        id: "insight_batch5_146",
        sourceIndex: 146,
        types: ["INTP"],
        series: "深度画像与本命天赋",
        title: "INTP的仪式感解构：婚礼台下的冷静嘀咕",
        archetype: "仪式解构者",
        analogy: "皇帝新衣前的诚实小孩：当全场沉浸在海誓山盟时，他在心底推演离婚率概率曲线",
        coreParadox: "并非冷血无情，而是天生对一切被社会建构出来的神圣叙事抱有怀疑精神",
        quote: "婚礼台上说爱你一辈子，INTP在台下嘀咕：他们以后的每一天真的会像今天一样幸福吗？",
        cleanedText: "INTP对传统世俗仪式（婚礼、宣誓、剪彩、敬酒）有着本能的抽离与尴尬。当所有人被氛围感动得痛哭流涕时，INTP的大脑会自动调取现实统计数据与人性变量。这种抽离常被误解为扫兴，实则是其追求绝对真实的本性使然。",
        actionableAdvice: "不要强迫INTP配合参与复杂的世俗繁文缛节，给他私密的角落让他安静做个观察者。",
    },
    // 147
    {
        id: "insight_batch5_147",
        sourceIndex: 147,
        types: ["INTP"],
        series: "误测与形态自救",
        title: "INTP的阴暗面：以求真之名逃避现实落地与责任",
        archetype: "逃避现实的隐士",
        analogy: "建造空中楼阁的哲人：只要不落在地面上，他的城堡就永远不会倒塌",
        coreParadox: "以为自己在追求真理与自洽，深层是在逃避与具体的人建立连接、逃避现实的失败",
        quote: "INTP的阴暗面：缺乏共情、嘴硬自大，自以为追求真理，其实是在逃避现实落地与责任。",
        cleanedText: "未成熟的INTP常将'追求真理'当成逃避现实生活的避难所。当现实事业受挫或人际出现危机时，他便躲进抽象的世界里指点江山，宣称世俗毫无意义。这种理智化防御会让他日渐孤僻脱节，变成空谈家。",
        actionableAdvice: "勇敢把理论付诸一行可执行的代码或一件现实小事，在泥泞的现实世界中检验真理。",
    },
    // 148
    {
        id: "insight_batch5_148",
        sourceIndex: 148,
        types: ["INTP"],
        series: "误测与形态自救",
        title: "INTP的四种误测：充满电的狂徒与受挫的刺客",
        archetype: "潜行者变体",
        analogy: "在洞穴与狂欢节之间切换的方士",
        coreParadox: "宅家充满电后外出社交宛如ENTP，遭遇现实重压时化身冷酷ISTP/INTJ",
        quote: "能量很足在家宅满一周出门像ENTP；遇到具体现实死磕像ISTP；做规划时像INTJ。",
        cleanedText: "INTP常见误测变体：1. ENTP（闭关充电数日后能量爆棚，在朋友局里口若悬河幽默开朗）；2. ISTP（必须动手解决具体工具或现实故障时）；3. INTJ（为了达成某个重要目标建立严密逻辑框架时）。其本质依然是主导Ti深度解构。",
        actionableAdvice: "以自己的第一原动力是'纯粹求知搞懂'还是'拿结果'来区分INTP与INTJ。",
    },
    // 149
    {
        id: "insight_batch5_149",
        sourceIndex: 149,
        types: ["INTJ", "INTP", "INFJ", "INFP"],
        series: "亲密关系与恋爱全流程",
        title: "IN人怎么拿捏？喜欢你会把自己绑好送上门",
        archetype: "内省四剑客",
        analogy: "自投罗网的灵兽：若他心悦于你，早把捕兽夹的钥匙亲手交到你手里",
        coreParadox: "外界费尽心机休想套路他半步；动了真情他却比谁都毫无保留地臣服交付",
        quote: "IN人不需要拿捏：喜欢你他会自己把自己绑好送上门；不喜欢你真的死绝死绝的。",
        cleanedText: "对于INTJ、INTP、INFJ、INFP这四位内倾直觉/情感大佬，试图靠技巧拿捏是可笑的。他们的直觉雷达能看穿一切微小的心机。只要你在灵魂层面吸引了他，并在合适的时间空间给予尊重，他会卸下所有防御，心甘情愿为你画地为牢。",
        actionableAdvice: "把时间花在提升自己的深度与人品上，等待IN人在你的精神引力场中自然降落。",
    },
    // 150
    {
        id: "insight_batch5_150",
        sourceIndex: 150,
        types: ["INTJ", "INTP", "INFJ", "INFP"],
        series: "四大组别的终极心性修行",
        title: "IN人最大的缺点：想得太多与书读太多的嫌弃病",
        archetype: "精神洁癖者",
        analogy: "站在纯白雪峰上的看客：越往高处走，越看不得山脚下尘世间的炊烟与泥泞",
        coreParadox: "无限向内探索使得精神世界极其广袤，反向结果却是对现实世俗的耐受度越来越低",
        quote: "IN人最大的缺点是想太多、书读太多。越往内探索，嫌体力劳动累、嫌社交虚伪、嫌生意算计。",
        cleanedText: "IN人成长中极易患上'高蹈轻世'的精神洁癖：嫌弃体力活粗鲁、嫌弃人情往来虚假、嫌弃经商做买卖斤斤计较。这种过度挑剔往往使自己陷入眼高手低、与真实世界脱节的绝境。修行的核心是'降维入世'，在柴米油盐中淬炼真知。",
        actionableAdvice: "每周强迫自己做一些接地气的具体小事（做饭、打扫、与菜场摊贩砍价），接纳大地的粗糙烟火。",
    },
    // 151
    {
        id: "insight_batch5_151",
        sourceIndex: 151,
        types: ["INTJ", "INTP", "INFJ", "INFP"],
        series: "四大组别的终极心性修行",
        title: "IN人的天赋维护：必须供着，不能累着",
        archetype: "精贵的大脑芯片",
        analogy: "精密航天元器件：必须在无尘恒温舱里运行，丢到泥巴坑里三分钟就短路报废",
        coreParadox: "能产出改变格局的顶级思想，但在垃圾人际与低俗互撕中会以十倍速度耗损生命",
        quote: "IN人最大的特点是要供着不能累着。一旦扑进烂人烂事里，不仅浪费时间，还会生大病。",
        cleanedText: "IN人的神经系统极其消耗能量。普通人面对低级互撕可能骂几句就过去了，但IN人一旦卷入办公室政治或无底线内耗中，其免疫系统会迅速崩溃，产生严重的躯体化病痛。保护好自己的精力边界，是IN人立足世间的生死线。",
        actionableAdvice: "果断拉黑消耗你能量的烂人烂事，把时间留在能够安静推演与滋养心灵的无尘环境。",
    },
    // 152
    {
        id: "insight_batch5_152",
        sourceIndex: 152,
        types: ["INTJ", "INTP", "INFJ", "INFP"],
        series: "商业搞钱与战略破局",
        title: "IN人的搞钱门槛：先过心理关，一定要问意义",
        archetype: "使命驱动者",
        analogy: "蒸汽机车必须先点燃理想的火炉：没有这团意义之火，轮子死活不会转动一寸",
        coreParadox: "别人见钱就上快速变现，IN人必须反复论证'这件事是否值得我投入生命'才能启动",
        quote: "IN人赚钱要慢一些：别人去实践证明，IN人先要过自己心理这关——这件事到底有什么意义？",
        cleanedText: "纯粹的金钱刺激无法长期唤醒IN人的生产力。如果一份工作让他感到欺骗、庸俗或毫无社会价值，他会生理性恶心并自我荒废。一旦他想通了这件事背后的宏大意义与利他使命，他会迸发出超人的专注度，财富自然奔涌而来。",
        actionableAdvice: "不要接违背内心价值观的单子；为你所从事的事业赋予一个崇高清晰的愿景，用意义驱动商业。",
    },
    // 153
    {
        id: "insight_batch5_153",
        sourceIndex: 153,
        types: ["INTJ", "INTP", "INFJ", "INFP"],
        series: "四大组别的终极心性修行",
        title: "IN人的宿命孤独感：人群中的外星来客",
        archetype: "降临地球的异乡人",
        analogy: "握着母星电波天线的孤独旅者：在熙熙攘攘的世俗集市上，始终找不到懂得同种频段的人",
        coreParadox: "渴望融入家庭与社会，但其独特的认知频段注定了他从小就被视作离经叛道的怪人",
        quote: "IN人的孤独感和清冷感与生俱来，人口占比极少，从小在家庭里就感受不到被深度理解。",
        cleanedText: "由于在整个人口中占比不高，IN人在成长过程中常常经历漫长的误解期：父母嫌他不合群、老师嫌他想入非非。这种刻骨铭心的童年孤独铸就了他骨子里的清冷。看清这一点便能释怀：孤独不是缺陷，而是思想先驱的天然底色。",
        actionableAdvice: "不必逼迫自己混入大众圈子寻找廉价认同，通过阅读跨越时空与历史上最伟大的灵魂对齐。",
    },
    // 154
    {
        id: "insight_batch5_154",
        sourceIndex: 154,
        types: ["ISFJ"],
        series: "四大组别的终极心性修行",
        title: "ISFJ女生请自己爽：卸下母仪天下的枷锁",
        archetype: "觉醒的圣母",
        analogy: "背负着整个宗族灵位的贤妻：终于放下沉重的祭品，换上轻便跑鞋去奔赴自己的旷野",
        coreParadox: "被传统道德与奉献神坛牢牢绑架，伺候完所有人，唯独没有伺候过自己一次",
        quote: "所有人格都在爽，除了ISFJ女生。母仪天下厚德载物背后太苦了，姑娘，该为自己爽一次了！",
        cleanedText: "ISFJ女性往往是传统礼教与家庭责任的最大牺牲品。她们把照顾丈夫、孝顺父母、抚育子女当成刻入骨髓的使命，有一点为自己的念头都自责自罪。时代变了，请停止无休止的自我献祭，把花在别人身上的钱和精力，痛痛快快拿来犒劳自己。",
        actionableAdvice: "列一张只属于你自己的享乐清单（SPA、独自旅行、大牌包包），雷打不动地每月为自己兑现一次。",
    },
    // 155
    {
        id: "insight_batch5_155",
        sourceIndex: 155,
        types: ["ISFJ"],
        series: "亲密关系与恋爱全流程",
        title: "ISFJ恋爱像赤手空拳打二战：高中生般的笨拙深情",
        archetype: "羞涩守护神",
        analogy: "做广播体操时偷偷用余光瞥向隔壁班的青涩少年：满腔深情，双手却在衣服下摆紧张得发抖",
        coreParadox: "平时操持家务雷厉风行，一旦面对真正心动的人，瞬间退化成不敢对视的高中生",
        quote: "ISFJ谈恋爱就像赤手空拳参加二战：喜欢你时像早恋的高中生，做操偷偷看你，上下楼梯偷偷跟着。",
        cleanedText: "成年后的ISFJ在职场和生活中可靠成熟，但在真正的爱意面前却笨拙得让人心疼。他表达爱不是花哨的挑逗，而是在不经意间为你多备一副碗筷、在楼道里假装偶遇、在你生病时默默送药。这种纯粹古朴的深情在现代社会尤为珍贵。",
        actionableAdvice: "看懂他每一个笨拙的示好细节，主动牵起他的手，给他最坚定、绝不辜负的安全感。",
    },
    // 156
    {
        id: "insight_batch5_156",
        sourceIndex: 156,
        types: ["ISFJ"],
        series: "深度画像与本命天赋",
        title: "ISFJ的归因内耗：氛围不好是因为我关门太大声？",
        archetype: "自责放大器",
        analogy: "灵敏度调到极限的地震仪：哪怕一只蚂蚁掉在地上，他也在复盘是不是自己步子迈重了",
        coreParadox: "把周围所有人的冷漠、愤怒与不悦，全部揽到自己头上疯狂自省",
        quote: "回到家复盘一整天：大家氛围不好是不是因为我关门声音太大了？把过多烦恼全揽在自己身上。",
        cleanedText: "ISFJ由于主导Si（记忆细节）与辅助Fe（关注氛围），对群体情绪极其过敏。如果领导皱眉或同事冷脸，他能在心里上演一万出'我哪句话说错了/是不是我倒水没敲门'的愧疚戏码。这种过度自责会消耗掉其大半元气。",
        actionableAdvice: "默念'关我屁事'与课题分离法则：别人的情绪是他的功课，不是你的过错，放过自己。",
    },
    // 157
    {
        id: "insight_batch5_157",
        sourceIndex: 157,
        types: ["ISFJ"],
        series: "亲密关系与恋爱全流程",
        title: "ISFJ付出背后的索求：关系的确定性与道德优越",
        archetype: "契约式守护者",
        analogy: "用温情织就一张安全网：我倾囊对你好，是为了换取你永不弃我而去的绝对誓约",
        coreParadox: "看似毫无保留的烂好人付出，深层是在索取一段永不动摇、无可指摘的牢固关系",
        quote: "ISFJ的付出不是烂好人，而是在索要隐形回报：关系的绝对稳定性与无可挑剔的道德安全感。",
        cleanedText: "深度洞悉ISFJ的付出心理学：他毫无怨言地照顾你、为你操心，并非全无所图。其深层动机是希望通过无可挑剔的奉献，在道德上立于不败之地，并换取你对关系的忠诚与不离不弃。看清这一点，就不要随意挥霍他的好。",
        actionableAdvice: "在享受ISFJ照顾的同时，主动给予其婚姻或长期合作的明确承诺，那是他最需要的镇静剂。",
    },
    // 158
    {
        id: "insight_batch5_158",
        sourceIndex: 158,
        types: ["ISFP"],
        series: "深度画像与本命天赋",
        title: "ISFP大智若愚打太极：看似憨憨，实则老者心智",
        archetype: "太极隐士 / 卡皮巴拉",
        analogy: "随波逐流的静水木舟：不与激流争锋，借力化力，看似懵懂却永远立于不败之地",
        coreParadox: "外表天真幼稚与世无争，内心对人性的险恶与世俗的纷争看得比谁都通透，只是懒得掺和",
        quote: "ISFP看似幼稚憨憨，心理年龄极大像个智慧老者，行为模式永远像在打太极，以柔克刚。",
        cleanedText: "别被ISFP温吞可爱的外表骗了。作为第一功能Fi极其深邃的个体，他心理年龄远超同龄人。在面对复杂的办公室站队和人际斗争时，他像打太极一样'四两拨千斤'：装傻充愣、点头微笑、绝不站队，在乱世中保全自我精神乐园。",
        actionableAdvice: "学习ISFP的松弛智慧：看破不必说破，不卷入非必要的世俗纷争，守住当下的安宁。",
    },
    // 159
    {
        id: "insight_batch5_159",
        sourceIndex: 159,
        types: ["ISTJ"],
        series: "亲密关系与恋爱全流程",
        title: "怎么追ISTJ？像办理签证一样展示你的稳定性",
        archetype: "签证审查官",
        analogy: "海关安检台前的通关申请：带齐所有证件流水、无不良记录、目的纯正，当场盖章通关",
        coreParadox: "鲜花烛光巧克力统统无效，一张清晰守序、作息正常、财务健康的履历表最能击中红心",
        quote: "怎么追ISTJ？拿鲜花巧克力的往后靠。像办签证一样把你的背景、日常规律、意图展示清楚就行。",
        cleanedText: "追求ISTJ切忌搞出其不意的浪漫惊喜或浮夸做作。他需要的是极度的秩序感与安全边际。让他了解你的工作性质、家庭背景、生活规律、对感情的严肃规划，准时赴约、言出必行。只要审核无误，他会是一生最忠诚的合伙人。",
        actionableAdvice: "约会提前预约切莫临时起意，遵守约定时间，展现踏实靠谱的财务与生活习惯。",
    },
    // 160
    {
        id: "insight_batch5_160",
        sourceIndex: 160,
        types: ["ISTP"],
        series: "深度画像与本命天赋",
        title: "ISTP的情感困境：双手能修好航母，嘴巴像个哑巴",
        archetype: "沉默的修补匠",
        analogy: "拿着扳手的机械大师：面对轰鸣的引擎游刃有余，面对伴侣滚落的眼泪却手足无措像触电",
        coreParadox: "内心大千世界通晓所有物理规律，面对细微复杂的人类情绪却舌头打结毫无招架之力",
        quote: "ISTP应对外界事情工具动手最快出成果，但面对自身情感和细微人际，像个哑巴不知所措。",
        cleanedText: "ISTP的技能点几乎全点在了物理世界与逻辑分析上。他能拆装汽车、修理电脑、搞定一切硬件故障。然而当伴侣需要细腻的情绪抚慰或深度情感沟通时，他的第四劣势Fe瞬间瘫痪，只能呆呆站在原地，甚至烦躁逃跑。",
        actionableAdvice: "伴侣不要强求ISTP长篇大论倾诉情感；看他的行动，他默默帮你修好水龙头，就是他全部的爱意。",
    },
    // 161
    {
        id: "insight_batch5_161",
        sourceIndex: 161,
        types: ["ISTP"],
        series: "深度画像与本命天赋",
        title: "ISTP的正确打开方式：有招懒得用的冷面乐子人",
        archetype: "看戏的刺客",
        analogy: "坐在酒馆屋顶咬着草根的剑客：底牌尽在袖中，但潜台词永远是'莫挨老子，别来沾边'",
        coreParadox: "看起来不合群甚至怪异，其实满脑子全是黑色幽默和神吐槽，只是懒得参与世俗表演",
        quote: "ISTP话少但不受控，属于有招懒得用的隐藏款乐子人，潜台词是：别来沾边，莫挨老子。",
        cleanedText: "在群体中，ISTP常常散发出一股冷峻疏离的气场。但千万别以为他是老实巴交的书呆子。他脑子里时刻都在精准吐槽场上的装腔作势者。只要不触及他的底线，他乐得在角落当个看戏的乐子人，极其反感别人强行拉他融入群体。",
        actionableAdvice: "尊重他的边界感，与他相处保持适当距离，在他愿意分享时做一个接得住他冷幽默的玩伴。",
    },
    // 162
    {
        id: "insight_batch5_162",
        sourceIndex: 162,
        types: ["ENTP"],
        series: "深度画像与本命天赋",
        title: "ENTP的伪I面具：陌生环境下的谨慎侦查员",
        archetype: "潜伏的狡黠狐狸",
        analogy: "误入陌生林地的红狐：收拢尾巴安静蹲在树根后，先用耳朵把周围所有猎人和陷阱摸清",
        coreParadox: "网络段子里天天创飞所有人，现实中初到陌生场子比谁都拘谨安静，极具观察力",
        quote: "ENTP其实很谨慎，到了新环境第一反应绝对是像INTP一样暗中观察，而不是到处挑衅。",
        cleanedText: "破除对ENTP'无差别发疯'的刻板误区。成熟的ENTP极具战略生存本能。当他进入一个陌生的职场或社交场时，他会收起所有锋芒，安静得像个INTP甚至I人，直到用敏锐的直觉把场上每个人的权力格局与弱点摸清后，才择机登场。",
        actionableAdvice: "初识ENTP不要被他的低调骗过，在他安静观察时保持大方从容，不要在他面前耍小聪明。",
    },
    // 163
    {
        id: "insight_batch5_163",
        sourceIndex: 163,
        types: ["ALL"],
        series: "误测与形态自救",
        title: "MBTI正确使用说明书：流动的工具箱，而非宿命铁笼",
        archetype: "心智进化者",
        analogy: "航海罗盘与瑞士军刀：是用来辅助你看清迷雾看清工具的，不是拿来给自己戴手铐的",
        coreParadox: "测试结果总在变不是玄学，而是你的心智在根据不同环境挑战调用不同的功能模块",
        quote: "人格是流动的工具箱，不是禁锢一生的牢笼。理解MBTI是为了理解人性，走向更高的自洽。",
        cleanedText: "许多人困惑于自己MBTI测试结果反复变化。真相是：人格并非铁板一块，随着年龄阅历、所处职场与生活压力的变迁，人会自动强化第三或劣势功能以应对挑战。将MBTI视为探索内省与理解多元人类的地图，切莫画地为牢自我标签化。",
        actionableAdvice: "关注自己在不同情境下调用的认知功能，以终为始，追求八维功能的动态平衡发展。",
    },
    // 164
    {
        id: "insight_batch5_164",
        sourceIndex: 164,
        types: ["INFJ", "ENFJ"],
        series: "深度画像与本命天赋",
        title: "NFJ的无形之水：因过度关照他人而失去自我轮廓",
        archetype: "无形化水者",
        analogy: "注入任何容器的水：装进茶壶是茶，装进酒杯是酒，唯独找不到自己最初的形状",
        coreParadox: "说每句话前反复推演对方会不会难过，考虑了所有人，唯独丢掉了自己的本心",
        quote: "NFJ看起来犹豫模糊，因为讲每句话前都在思考你会难过吗、会误会吗，别人说出去的话他背在身上。",
        cleanedText: "NFJ在社交中的沉重负担：由于高阶Fe与Ni的结合，他在开口前甚至会推演这句话在三年后会不会伤害到对方。这种极致的体贴使他看起来犹豫不决、没有鲜明的立场，像水一样随他人而变，长此以往容易产生严重的自我认同迷失。",
        actionableAdvice: "允许自己在某些时刻'说错话'或表达攻击性，你的棱角才是保护你真实灵魂的堤坝。",
    },
    // 165
    {
        id: "insight_batch5_165",
        sourceIndex: 165,
        types: ["INFP", "ENFP"],
        series: "深度画像与本命天赋",
        title: "NFP表达的真相：只是为了自我倾倒，无需你的建议",
        archetype: "情绪倾听器",
        analogy: "山间喷涌而出的泉水：他只是需要宣泄翻涌的情感，而不是需要你在泉眼上架一台过滤水泵",
        coreParadox: "跟你长篇大论吐槽发泄，如果你开始理性分析给他提解决方案，他反而瞬间暴躁闭嘴",
        quote: "NFP说的很多话只是在表达自己，他不需要你帮他提建议，倾听与共情才是唯一的解药。",
        cleanedText: "与INFP/ENFP沟通的黄金法则：当他带着充沛的情绪向你倾诉时，千万收起你的理智分析和指导欲（那是TJ的死穴）。他内心深处其实早有答案，此刻滔滔不绝纯粹是为了通过言语化排毒。你只需抱着他，说一句'太不容易了，我懂你'。",
        actionableAdvice: "在他倾诉完毕前，只提供拥抱、点头与情绪共振，待其完全平静后再探讨现实举措。",
    },
    // 166
    {
        id: "insight_batch5_166",
        sourceIndex: 166,
        types: ["INFP", "ENFP"],
        series: "四大组别的终极心性修行",
        title: "NFP的生命能量场：唯有在正向关系中才能开花",
        archetype: "光合作用生灵",
        analogy: "向阳而生的热带兰花：在充足的爱与阳光下绚烂夺目，放在阴暗恶意的冷库里瞬间枯萎",
        coreParadox: "天生拥有无条件爱人的博大胸怀，但如果身处有毒关系，其生命力会被全盘封印废掉",
        quote: "NFP要发挥全部实力必须身处正向关系中。他们生来就具有无条件爱人的天赋，需要土壤滋养。",
        cleanedText: "NFP的事业与才华高度依赖其人际关系的健康度。如果伴侣或家庭充满冷暴力、指责与内耗，NFP的灵气会被彻底抽干，表现得萎靡不振、拖延摆烂；反之，一旦身处充满鼓励与肯定的正向环境中，他能爆发出惊天动地的创造力与生产力。",
        actionableAdvice: "果断斩断有毒的吸血关系与贬低式友谊，把自己安置在温暖充满支持的能量场中。",
    },
    // 167
    {
        id: "insight_batch5_167",
        sourceIndex: 167,
        types: ["INTJ", "ENTJ"],
        series: "深度画像与本命天赋",
        title: "NTJ女生的极致魅力：眼神如刀，斩男又斩女",
        archetype: "黑金女王",
        analogy: "出鞘的精钢唐刀：寒光凛凛，不拖泥带水，无需世俗矫饰已然气场两米八",
        coreParadox: "不抱怨、不啰嗦、行事果决狠辣，看透社会丛林法则却在心底为真正认可的人留一片净土",
        quote: "大家对NTJ女生的魅力一无所知：不抱怨不啰嗦、行事果断、眼神如刀，斩男又斩女。",
        cleanedText: "NTJ女性（ENTJ/INTJ）打破了传统温顺依附的女性模板。她们很早就看透了世俗权力的运行机制，崇尚专业能力与结果交付。在职场与生活中眼神凌厉、决策如风。这种强大的内核不仅深受优秀男性的敬重，更成为无数女性心中的绝对偶像。",
        actionableAdvice: "自信绽放你的野心与利刃，无需迎合低维度男性的男性凝视与规训，做主宰自己命运的女王。",
    },
    // 168
    {
        id: "insight_batch5_168",
        sourceIndex: 168,
        types: ["INTP", "ENTP"],
        series: "深度画像与本命天赋",
        title: "NTP宁愿被当成懒汉：也不愿面对全力以赴依然失败的绝望",
        archetype: "骄傲的避难所",
        analogy: "不上战场的绝顶剑客：宁可被人说成贪睡的酒鬼，也不愿承认自己的剑法有破绽",
        coreParadox: "看似玩世不恭天天摸鱼，背后是对自身智力神话的极度珍视与对凡俗失败的恐惧",
        quote: "NTP宁愿别人觉得他懒，也不愿去面对努力了依然失败的局面。使巧劲是舒适圈。",
        cleanedText: "深度剖析NTP的'拖延与懒散'：主导Ti/Ne让他们从小凭借小聪明轻松超越常人。这导致他们建立了一种脆弱的自尊——'我只是没认真，我要是认真早就第一了'。为了保全这个假设，他们宁愿拖延敷衍，也不敢孤注一掷去面对全力以赴后的真实局限。",
        actionableAdvice: "粉碎智商优越感，把'勇于在泥泞中全力以赴并接受失败'当成最高阶的智识勇气。",
    },
    // 169
    {
        id: "insight_batch5_169",
        sourceIndex: 169,
        types: ["INTP", "ENTP"],
        series: "深度画像与本命天赋",
        title: "NTP拖延的另一面：在延宕中等待最优巧劲解法",
        archetype: "极限解题手",
        analogy: "潜伏的狙击手：任由外界催促纹丝不动，直到唯一的风向与机会出现，一枪爆头",
        coreParadox: "一开始死磕往往事倍功半，拖到最后一刻往往灵光乍现用最小代价四两拨千斤",
        quote: "NTP爱拖延其实是好事：很多事拖着拖着就不用做了，或者最后突然出现极佳的主意用巧劲搞定。",
        cleanedText: "NTP的拖延存在正向的演化逻辑：许多世俗任务充满官僚无用功，随着时间推移自然自行消解；而在面对真正复杂的命题时，潜意识在后台的沉淀发酵需要时间，直到截止日期逼近，高压触发全脑算力瞬间迸发最优解。",
        actionableAdvice: "接纳自己的巧劲节奏，但在事关核心声誉的节点上设立硬性交付底线，防止彻底翻车。",
    },
    // 170
    {
        id: "insight_batch5_170",
        sourceIndex: 170,
        types: ["INTP", "ENTP"],
        series: "深度画像与本命天赋",
        title: "NTP的杂家通才：只要一点点微勤奋就能成专家",
        archetype: "万象通才",
        analogy: "能插上任何武器大师芯片的生化人：任何领域看一眼说明书便能打得有模有样",
        coreParadox: "通晓万事却极易浅尝辄止，若能在一个领域持续深耕，便能成为降维打击的宗师",
        quote: "NTP可以快速上手任何一件事，任何领域都能插嘴，只要一点点小勤奋就能成跨界专家。",
        cleanedText: "NTP拥有世间最敏捷的学习迁移能力。凭借Ti底层逻辑抽象与Ne联想，他三天就能摸透一个新行业的黑话与核心脉络，插手指导有模有样。其唯一的宿命死结是难以维持长期枯燥的深耕。如果他能克服厌倦持续输出，成就无可估量。",
        actionableAdvice: "选择需要跨界整合、模式创新的复合型行业（如AI应用、战略咨询），把通才优势最大化。",
    },
    // 171
    {
        id: "insight_batch5_171",
        sourceIndex: 171,
        types: ["ALL"],
        series: "四大组别的终极心性修行",
        title: "P转J的成人礼：负重前行，告别躺平的舒适温室",
        archetype: "责任登基者",
        analogy: "卸下浪子行囊换上铠甲的骑士：告别今朝有酒今朝醉，主动挑起一家一国的重担",
        coreParadox: "生活变得不自由、不爽、充满计划，但也终于拥有了对抗现实风暴的立足之地",
        quote: "P转J代表你要独自努力了，不能躺平了，生活变得不自由了，但你开始负重前行成为参天大树。",
        cleanedText: "许多人在中年或经历生活巨变后，测试结果从P（随性灵活）转变为J（计划掌控）。这并非性格泯灭，而是一个人真正跨入成熟期的标志：意识到没有人可以永远依靠，必须建立自己的系统、防线与纪律，为了所爱之人撑起一片天空。",
        actionableAdvice: "接纳J带来的紧绷与纪律，在确定的计划中为自己保留一间安放P灵气的小小秘室。",
    },
    // 172
    {
        id: "insight_batch5_172",
        sourceIndex: 172,
        types: ["INTJ", "ISTJ", "ESTJ", "ENTJ"],
        series: "亲密关系与恋爱全流程",
        title: "TJ人换人如喝水：樱花树下站谁都美，我的爱给谁都珍贵",
        archetype: "理性参数恋人",
        analogy: "高精零件替换：这颗轴承磨损损坏了，换上符合规格的新轴承机器立刻平稳运转",
        coreParadox: "在感情中极度专一深情，但一旦确认对方不达标断崖分手，换人时冷静得像在换工位",
        quote: "TJ人的恋爱观：樱花树下站谁都美，我的爱给谁都珍贵。分手如喝水，找符合参数的人即可。",
        cleanedText: "TJ人看似冷血的分手模式背后有着绝对的逻辑自洽：他深知自己的爱意与现实资源极其珍贵，只要伴侣符合心中最核心的参数契约，他会全心付出；但如果对方撕毁协议或无可救药，他不会陷在感伤中内耗，立刻止损换人，大步向前。",
        actionableAdvice: "与TJ相处请保持言行一致与高信任度，千万不要触碰他的底层参数底线。",
    },
    // 173
    {
        id: "insight_batch5_173",
        sourceIndex: 173,
        types: ["INTJ", "ENTJ", "ISTJ", "ESTJ", "INFJ", "ENFJ", "ISFJ", "ESFJ"],
        series: "深度画像与本命天赋",
        title: "TJ与FJ的根本分野：控制事 vs 控制人",
        archetype: "秩序架构者 vs 灵魂掌控官",
        analogy: "工厂厂长（严格把控进度与流水线） vs 宗族长老（深切关照全族成员的心思与和谐）",
        coreParadox: "同为J人的控制底色，一个把所有精力倾注在客观成果上，一个把神经紧绷在他人情绪上",
        quote: "J人的底色是控制：TJ控制事（进度、流程、标准），FJ控制人（感受、氛围、人情）。",
        cleanedText: "理解J人分歧的核心钥匙：TJ的安全感来自确定的客观事实、里程碑进度与量化数据，只要事情受控哪怕得罪全场也在所不惜；FJ的安全感则来自人际关系的和谐、全场人员的满意度与情绪连接。两者搭档需要清晰划分事权与人权。",
        actionableAdvice: "合作时让TJ主导项目路线图与技术指标，让FJ主导团队激励与客户关系，优势互补。",
    },
    // 174
    {
        id: "insight_batch5_174",
        sourceIndex: 174,
        types: ["INTJ", "ENTJ", "ISTJ", "ESTJ", "INFP", "ENFP", "ISFP", "ESFP"],
        series: "亲密关系与恋爱全流程",
        title: "TJ和FP天生一对：一紧一松的太极阴阳互补",
        archetype: "紧绷将领与松弛游侠",
        analogy: "拉紧的弓与松弛的弦：唯有两者紧密咬合，才能射出划破长空的利箭而不至崩断",
        coreParadox: "一个时刻紧绷焦虑于未雨绸缪，一个天塌下来当被盖；一紧一松达成人格终极解压",
        quote: "TJ人和FP人天生一对：一个紧，一个松。TJ容易上纲上线力求结果，FP则松弛治愈一切焦虑。",
        cleanedText: "TJ人（战略/执行机器）极易陷入过劳与生存焦虑的死循环；而FP人（纯粹情感/体验家）天生拥有一种让万物落地的松弛感。当疲惫不堪的TJ回到家，面对天塌下来也能开开心心吃饭看剧的FP，其紧绷的神经会瞬间被柔化治愈。",
        actionableAdvice: "TJ要学会欣赏FP的松弛不是不思进取而是生命智慧；FP要懂得适时给TJ端上一杯热茶，接住他的重担。",
    },
    // 175
    {
        id: "insight_batch5_175",
        sourceIndex: 175,
        types: ["INTJ", "ISTJ", "ESTJ", "ENTJ"],
        series: "深度画像与本命天赋",
        title: "TJ人的心酸内核：生存焦虑与停不下来的紧绷",
        archetype: "终身战备者",
        analogy: "戴着发条的铁甲人：明知发条快拧断了，依然不敢停下一秒，生怕松劲就会跌入深渊",
        coreParadox: "事业成就斐然，内心却从未有一刻感到真正的安全；野心背后是深不见底的生存危机感",
        quote: "TJ人模型极其简单：生存焦虑、完美主义、压力大、利益最大化。很少能给到全天候陪伴。",
        cleanedText: "TJ人常被视作无情的搞钱狂魔与工作狂。但其内心深处是极其缺乏松弛感的：童年或骨子里的生存危机驱使他必须时刻保持警惕，追求效率最优。在恋爱中他往往难以提供长情的风花雪月，因为他的大脑时刻都在为两人的未来筑造城堡。",
        actionableAdvice: "做那个能看懂他铠甲下疲惫的人，在他深夜加班回家时，默默抱抱他，告诉他'你已经做得很棒了'。",
    },
    // 176
    {
        id: "insight_batch5_176",
        sourceIndex: 176,
        types: ["ENTP", "INTP", "ISTP", "ESTP", "INFJ", "ENFJ", "ISFJ", "ESFJ"],
        series: "亲密关系与恋爱全流程",
        title: "TP和FJ天生一对：理性自我与情感无我的灵魂救赎",
        archetype: "自由游侠与慈悲神使",
        analogy: "不羁的野马遇上了辽阔丰美的大草原：野马不再流浪，草原因为铁蹄而拥有了生机",
        coreParadox: "一边是极致的理性自洽与自我，一边是极致的情感照料与无我；走到极端都会痛苦，唯有彼此救赎",
        quote: "TP人和FJ人真是天生一对：一边理性自我，一边情感无我。FJ拉回冷酷TP，TP解放委屈FJ。",
        cleanedText: "TP人（自由理智组）活得过于自我，容易滑入虚无冷漠的死胡同；FJ人（情感付出组）活得过于无我，容易在无底线的迎合中掏空自己。两者的相遇堪称绝配：FJ用温润大爱融化TP的冰川防线，TP则用冷血理智替FJ斩断不必要的世俗枷锁，教他学会自私。",
        actionableAdvice: "FJ向TP学习建立自我边界与说不的勇气；TP向FJ学习体察他人脆弱、给予温暖的承诺。",
    },
    // 177
    {
        id: "insight_batch5_177",
        sourceIndex: 177,
        types: ["INTP", "ENTP", "ISTP", "ESTP"],
        series: "亲密关系与恋爱全流程",
        title: "TP在感情里的极致钝感力：正缘降临不自知，分手边缘以为然",
        archetype: "后知后觉的顽童",
        analogy: "在暴风雨前夕专心摆弄机械玩具的孩子：雷电已劈到房梁，他还在惊叹齿轮的精妙转动",
        coreParadox: "智商极高玩心极重，对于亲密关系中的暗流涌动与情感枯竭却迟钝得让人吐血",
        quote: "TP在感情中最大特点是后知后觉：正缘来了没发现，到了分手边缘还不以为然。",
        cleanedText: "TP人由于劣势Fe，对人类情感信号极其钝感。当伴侣已经无数次失望、开始冷淡倒计时时，TP往往还沉浸在自己的兴趣与研究中，天真地以为关系依然稳固。直到收到分手短信的那一刻，他才如梦初醒，追悔莫及。",
        actionableAdvice: "TP需要建立定期的'关系体检'意识，主动询问伴侣的感受；伴侣有意见切忌甩脸子，直接白纸黑字提出。",
    },
    // 178
    {
        id: "insight_batch5_178",
        sourceIndex: 178,
        types: ["INTP", "ESTP", "ISTP", "ENTP"],
        series: "深度画像与本命天赋",
        title: "TP强大的'无所谓'哲学：精神内耗的天然绝缘体",
        archetype: "世俗断联大侠",
        analogy: "穿过暴雨的雨衣：任凭外界口水漫天，甩一甩衣袖，滴水不沾身",
        coreParadox: "看似玩世不恭缺乏敬畏，实则是保全精神自主权、对抗精神内耗的终极法宝",
        quote: "TP最大的特点就是对很多东西无所谓：爸妈吵架无所谓，老板施压无所谓（学会了开溜干死你），分手无所谓。",
        cleanedText: "TP人天生拥有一套极其强悍的精神过滤网：'这件事影响我吃喝玩乐与探索宇宙吗？不影响，那关我屁事'。面对原生家庭争吵、职场PUA与流言蜚语，他能瞬间开启无所谓屏蔽模式，把精力聚焦在自我成长与偷师学艺上，极少内耗。",
        actionableAdvice: "保持这种高维的松弛感，但要在对待真正在意你的伴侣时关闭这层无所谓，展现你的担当。",
    },
    // 179
    {
        id: "insight_batch5_179",
        sourceIndex: 179,
        types: ["INTJ", "INTP", "ENTJ", "ENTP", "ISTP", "ESTP", "ISTJ", "ESTJ"],
        series: "深度画像与本命天赋",
        title: "T人真的冷血吗？挤干水分的真金白银之爱",
        archetype: "干货供给者",
        analogy: "压缩饼干与纯净水：没有花哨的奶油裱花，但在荒原断粮时能保你一条性命",
        coreParadox: "死嘴说不出半句甜言蜜语，但在你需要现实帮助时，打钱、托关系、找律师比谁都雷厉风行",
        quote: "T人冷血？他浑身都是干货，说的做的全部都有用。情绪价值是水分被挤干了，留下的是真金白银。",
        cleanedText: "世人常误读T人冷血无情。真相是：T人认为空洞的情绪安抚（'抱抱宝贝不哭'）是廉价且无意义的水分。当朋友或伴侣遇险，T人会在三分钟内冷静拆解问题、理顺法律与经济逻辑、动用所有现实资源为你铺平道路。这是最高阶的硬核慈悲。",
        actionableAdvice: "看懂T人行动背后的深沉爱意，遇到麻烦直接找他要解决方案，切莫怪他不解风情。",
    },
    // 180
    {
        id: "insight_batch5_180",
        sourceIndex: 180,
        types: ["INTJ", "INTP", "ENTJ", "ENTP"],
        series: "深度画像与本命天赋",
        title: "紫人寡王是怎么炼成的？厌蠢与自我嫌弃的无尽循环",
        archetype: "孤傲的断臂维纳斯",
        analogy: "拿着十倍放大镜看世界的人：不仅嫌弃世人全是瑕疵，回看自己的过去同样漏洞百出蠢不可及",
        coreParadox: "既嫌弃凡人智商太低无法交流，又极度否定过去的自己，导致身边圈层被自己亲手淘汰殆尽",
        quote: "紫人不仅厌蠢，还觉得自己蠢。不断否定过去的自己，不断淘汰现有圈层朋友，活成了终极寡王。",
        cleanedText: "NT紫人走向终极孤独的心理闭环：天生的逻辑洁癖让他对周围人的低级错误极度不耐烦（厌蠢）；而随着自身认知升级，他又会觉得去年的自己极其愚蠢，从而陷入无休止的自我否定与朋友圈层大清洗。最终环顾四周，唯余一人立于荒原。",
        actionableAdvice: "学会接纳'平庸与混乱才是宇宙的常态'，允许世界不够完美，允许他人和过去的自己有不严密的缝隙。",
    },
    // 181
    {
        id: "insight_batch5_181",
        sourceIndex: 181,
        types: ["INFP", "ENFP", "INTP", "ENTP"],
        series: "四大组别的终极心性修行",
        title: "NP三分钟热度正名：不够吸引就放弃，生命本该探索繁星",
        archetype: "繁星采蜜人",
        analogy: "林间采蜜的彩蝶：闻到花香便驻足片刻，蜜采完了立刻振翅奔赴下一朵花，何必在一根枯枝上吊死",
        coreParadox: "被世俗规训斥为三心二意，实则是对无趣与平庸最果决的断舍离，每一次三分钟都有三分钟的惊艳收获",
        quote: "NP人三分钟热度怎么办？那就放弃啊！三分钟热度说明它不够吸引你，去寻找真正点亮繁星的事物。",
        cleanedText: "停止对NP三分钟热度的道德羞辱。NP的第一原动力是Ne（外倾直觉探索可能性）。当一个领域在体验三分钟后被摸清套路、丧失新意，果断抽身离开是极其高效的信息采集策略。正是这种探索欲，让NP成为最具跨界视野的创意物种。",
        actionableAdvice: "允许自己在前沿领域做广泛采样，直到遇见那个能让你自发进入无限心流的终极天命。",
    },
    // 182
    {
        id: "insight_batch5_182",
        sourceIndex: 182,
        types: ["INFP", "INTP", "ENTP", "ENFP"],
        series: "深度画像与本命天赋",
        title: "NP三分钟热度的一生死结：想法太多与落地鸿沟",
        archetype: "白日梦建筑师",
        analogy: "脑内铺满摩天大楼的图纸，现实中连一块水泥砖头都懒得搬",
        coreParadox: "脑内想法能由A发散到无限可能，但一旦涉及枯燥冗长的现实落地，瞬间感到痛苦万分",
        quote: "NP人的三分钟热度是一生的死结：脑中想法像白日梦由A跳到Z，不行就换不好玩就撤。",
        cleanedText: "深入剖析NP在职场上的致命软肋：由于大脑神经元连接极其活跃，他在脑海中构思一个项目时就已经体验完了成功的快感；当真正进入琐碎的施工期（写报表、跑流程、处理Bug），多巴胺断崖下跌，极易半途而废。必须搭配严谨的落地伙伴。",
        actionableAdvice: "把宏大构思拆解为'今天必须完成的单张微任务'，或寻找SJ/TJ搭档负责后期落地与监管。",
    },
    // 183
    {
        id: "insight_batch5_183",
        sourceIndex: 183,
        types: ["INTJ", "INFP", "ISFJ"],
        series: "误测与形态自救",
        title: "最容易发疯的三大人格：INTJ崩溃、INFP绝望与ISFJ掀桌",
        archetype: "极端风暴引爆点",
        analogy: "三种不同的火山喷发：冰川碎裂的冷暴怒、精神花园崩塌的撕裂哀恸、忍耐十年的老好人掀翻全场",
        coreParadox: "平时最克制、最隐忍、最温柔的人，一旦越过临界点，爆发出的毁灭性狂澜让所有人胆寒",
        quote: "最容易发疯崩溃的三个人格：INTJ失去掌控后的冷酷暴走，INFP绝望撕裂，ISFJ忍无可忍彻底掀桌。",
        cleanedText: "三大高发疯人格的引爆机制：1. INTJ（完美规划被不可抗力全盘打碎，启动暴力控制欲与愤怒）；2. INFP（精神信仰被践踏、深陷不配得感与孤独自毁）；3. ISFJ（常年充当受气包与烂好人，一旦积怨突破临界点，瞬间黑化掀桌玉石俱焚）。",
        actionableAdvice: "在情绪达到80%警戒线时主动设立隔离区，及时宣泄，绝不要把压力压抑到100%爆仓状态。",
    },
    // 184
    {
        id: "insight_batch5_184",
        sourceIndex: 184,
        types: ["INTJ", "INTP", "ENTJ", "ENTP"],
        series: "深度画像与本命天赋",
        title: "紫人的三重厌蠢：成本过大、拉低效率与反智恐惧",
        archetype: "智识审判官",
        analogy: "百兆光纤接入拨号调制解调器：强烈的传输延迟让他感到物理层面的大脑胀痛",
        coreParadox: "并非道德歧视，而是对沟通效率低下与反智逻辑无法忍受的生理性应激反应",
        quote: "紫人厌蠢包含三重信息：沟通成本太大解释费劲、害怕被拖累进度、对逻辑漏洞天然洁癖。",
        cleanedText: "拆解NT紫人的厌蠢症候群：第一重是经济学成本考量（跟认知低下者解释常识消耗过大）；第二重是风险控制（蠢人的盲目自信极易将整个项目带入深渊）；第三重是思维美学受损（错误的因果推导就像在交响乐里砸碎玻璃般刺耳）。",
        actionableAdvice: "在非核心工作领域降低对普通人的智识要求，保持礼貌沉默，把严密逻辑留给专业同侪。",
    },
    // 185
    {
        id: "insight_batch5_185",
        sourceIndex: 185,
        types: ["INFJ"],
        series: "亲密关系与恋爱全流程",
        title: "与INFJ相处的三阶段：神仙诱惑、冰冷审判与灵魂托付",
        archetype: "圣殿修行历程",
        analogy: "拜访雪山圣殿的漫长试炼：先见璀璨佛光，再历万丈冰川，最终得见真容",
        coreParadox: "初期温柔得像陷阱，中期挑剔冷漠得像法官，唯有通过审判者才能拥抱他的整个人间",
        quote: "跟INFJ打交道三阶段：初期温暖迷人诱惑，中期严苛挑剔审判，后期毫无保留灵魂托付。",
        cleanedText: "和INFJ深交的必经三关：第一阶段如沐春风，其无微不至的深情极具魅力；第二阶段他开始暗中用极高的道德与灵魂标准审视你，稍有不合便开启冰冷回撤；如果你坚定真诚、包容其古怪，最终便会步入第三阶段——他将毕生孤勇与柔软尽数托付于你。",
        actionableAdvice: "在中期的冷淡审判期不要慌张，用始终如一的言行和正直人品给予他确信感。",
    },
    // 186
    {
        id: "insight_batch5_186",
        sourceIndex: 186,
        types: ["INTJ", "INTP", "ENTJ", "ENTP"],
        series: "深度画像与本命天赋",
        title: "紫人社交的'上位心理'：挑刺是出于逻辑洁癖而非人身霸凌",
        archetype: "逻辑巡检员",
        analogy: "代码审查员捉Bug：看到语法错误本能地标红批注，内心并无恶意，纯属强迫症发作",
        coreParadox: "一眼指出对方逻辑漏洞时带着狂喜，常被当成居高临下搞霸凌，实则是对真理本身的致敬",
        quote: "紫人在社交中爱挑逻辑漏洞，发现时会有'终于抓到你'的心态，这只是逻辑洁癖并非人身霸凌。",
        cleanedText: "紫人在对话中常常忍不住打断、挑刺或反驳他人的谬误。在外人看来这是在秀优越感或故意让人难堪；但在紫人的心智中，消灭一个逻辑矛盾就像消灭房间里的一只蟑螂一样自然和必要。他针对的是论点本身，而非持有该论点的人。",
        actionableAdvice: "紫人需学会'看破不一定说破'，在非原则性社交中克制纠错欲，给人留足体面。",
    },
    // 187
    {
        id: "insight_batch5_187",
        sourceIndex: 187,
        types: ["INTJ", "ENTJ"],
        series: "误测与形态自救",
        title: "不健康的NTJ：把日程排满背后的暴怒与自我苛责",
        archetype: "受困的暴君",
        analogy: "满载轰鸣却失控的蒸汽机车：炉火烧得通红，机件剧烈震颤，把愤怒撒向轨道上所有的尘埃",
        coreParadox: "表面暴怒抱怨世界不够有效率、人人生性怠惰，背后是深不见底的自我怀疑与焦虑失控",
        quote: "不健康的NTJ容易暴怒、人缘差、把日程排满。抱怨世界表面是不够有效率，实则是苛求自己。",
        cleanedText: "当NTJ陷入不健康状态时，其主导Te会陷入恶性狂躁：他会把每天的时间表排得密不透风，对下属和伴侣的任何小瑕疵大发雷霆。这种暴怒看似是对外的攻击，实则是他面对未达预期时的自我惩罚与极度恐慌的投影。",
        actionableAdvice: "停下来，清空一周的日程，去大自然中徒步放空，允许事情按照宇宙自身的节奏自然发展。",
    },
    // 188
    {
        id: "insight_batch5_188",
        sourceIndex: 188,
        types: ["INTJ", "ENTJ"],
        series: "四大组别的终极心性修行",
        title: "NTJ的高阶自愈：在不完美的世界中放下屠刀",
        archetype: "释怀的大元帅",
        analogy: "卸下战盔的将军在秋林中煮茶：看落叶纷飞，懂得不仅胜利是美，缺憾与衰亡亦是天道",
        coreParadox: "放下了无休止的控制与征服，反而获得了驾驭更庞大历史势能的松弛与威严",
        quote: "学会接纳世界的低效与平庸，不健康的暴怒平息之时，才是NTJ真正君临天下之日。",
        cleanedText: "高阶NTJ的成人礼是学会'容忍平庸'。他终于明白：这个世界本来就是由大多数不完美、低效率的普通人组成的，苛求所有人达到自己的标准是最大的愚蠢。当他能够温和地包容他人的笨拙时，他才真正从监工蜕变为万民归心的领袖。",
        actionableAdvice: "用你的智慧去建立容错率极高的组织系统，而不是企图在情绪上改造每一个具体的凡人。",
    },
    // 189
    {
        id: "insight_batch5_189",
        sourceIndex: 189,
        types: ["ISFP"],
        series: "深度画像与本命天赋",
        title: "ISFP不吃压力的艺术：披着淡人外衣的炽热浓人",
        archetype: "卡皮巴拉艺术家",
        analogy: "外表呆萌的卡皮巴拉：哪怕头顶顶着一只橘子泡在温泉里，内心依然有着极度神圣不可侵犯的疆界",
        coreParadox: "表面上与世无争谁都能聊，一旦有人试图施压规训其个人底线，瞬间展现出不可动摇的坚毅",
        quote: "S人里最爱研究MBTI的是小画家：披着淡人外衣的浓人，表面卡皮巴拉，内心极度坚持底线。",
        cleanedText: "ISFP常被误当成好捏的软柿子。主导Fi赋予其无与伦比的自性尊严。日常生活中他可以平易近人、迁就所有人；但如果你试图用权势、金钱或传统道德强迫他违背内心的美学与良知，他会瞬间展现出惊人的硬气，头也不回地离开。",
        actionableAdvice: "绝不要对ISFP进行极限施压或精神PUA，用温柔与平等的尊重守护他的艺术灵魂。",
    },
    // 190
    {
        id: "insight_batch5_190",
        sourceIndex: 190,
        types: ["INTJ", "INTP", "ENTJ", "ENTP", "INFJ", "INFP", "ENFJ", "ENFP"],
        series: "亲密关系与恋爱全流程",
        title: "恋爱中的终极隐喻：紫人是爹，绿人是妈",
        archetype: "严父法则与慈母怀抱",
        analogy: "严父教你骑马射箭横刀立马，慈母为你缝补衣裳端上热汤并无条件接纳你的眼泪",
        coreParadox: "紫人给你资源和现实法则鼓励你独立飞翔，绿人给你无条件的精神庇护接纳你的不完美",
        quote: "恋爱中紫儿是爹，绿儿是妈：紫人教你生存法则鼓励试错让你独当一面；绿人给你无条件的接纳与灵魂归宿。",
        cleanedText: "NT紫人与NF绿人在亲密关系中的最高阶隐喻：紫人的爱像深沉的严父，他给你倾斜现实资源、传授生存法则、逼你提升技能独当一面，哪怕分手也能独自打天下；绿人的爱像包容的慈母，他不问功名利禄，在你身心破碎时为你提供无条件的爱与精神救赎。",
        actionableAdvice: "在紫人身边汲取征服世界的铠甲与能力，在绿人怀里洗净灵魂的尘埃找回最初的纯真。",
    },
];
async function runBatch5() {
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
        console.log(`=== INGESTING BATCH 5 (Entries 141-190, Size: ${batch5Data.length}) ===`);
        // 1. Ensure Series nodes
        const seriesSet = new Set(batch5Data.map((d) => d.series));
        for (const sName of seriesSet) {
            await session.run(`MERGE (s:Series {name: $name})
         ON CREATE SET s.createdAt = datetime()
         RETURN s`, { name: sName });
        }
        console.log(`Ensured ${seriesSet.size} Series nodes.`);
        // 2. Ingest Insights and Type linkages
        for (const entry of batch5Data) {
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
        console.log(`Ingested ${batch5Data.length} Insight nodes and Type linkages.`);
        // 3. Update Type core properties for INTP, ISFP, ISTJ
        console.log("Updating Type properties for INTP, ISFP, ISTJ...");
        await session.run(`MATCH (t:Type {code: 'INTP'})
       SET t.archetype = '绝境翻盘高手 / 纯脑力极客 / 象牙塔方士',
           t.vividAnalogy = '松弛感点满的扫地僧；工位吃薯片刷视频是其独特预热节奏；恋爱中像猪笼草与倔小孩；用更硬的宇宙真理回击世俗规训',
           t.coreParadox = '宁愿被当成懒散摸鱼汉，也不愿面对全力以赴依然失败的绝望；洞察宇宙万物规律，却对人类低阶情绪不知所措',
           t.energyModel = '主导Ti精密拆解模型 + 辅助Ne发散荒诞幽默 + 第三Si怀旧收缩 + 劣势Fe被动防御与情感测试'`);
        await session.run(`MATCH (t:Type {code: 'ISFP'})
       SET t.archetype = '太极隐士 / 卡皮巴拉艺术家',
           t.vividAnalogy = '披着淡人外衣的浓人，表面卡皮巴拉，日常像打太极以柔克刚避开纷争；不吃任何极限施压',
           t.coreParadox = '外表天真憨憨人畜无害，内心对世俗人情洞若观火，守着绝不妥协的艺术良知底线',
           t.energyModel = '主导Fi绝对自性尊严 + 辅助Se敏锐当下感知 + 第三Ni深沉老者直觉 + 劣势Te抗拒冷酷规训'`);
        await session.run(`MATCH (t:Type {code: 'ISTJ'})
       SET t.archetype = '签证审核官 / 磐石基石',
           t.vividAnalogy = '海关安检台前的通关申请：不要花哨巧克力，拿出清晰守序的作息规律与靠谱履历表当场通关',
           t.coreParadox = '不善浪漫言辞，但只要通过审核许下诺言，便是风雨飘摇中最稳如泰山的避风港',
           t.energyModel = '主导Si经验与秩序信仰 + 辅助Te铁面无私执行 + 第三Fi深沉责任底线 + 劣势Ne警惕一切意外'`);
        // 4. Final DB Stats
        const countRes = await session.run(`
      MATCH (n)
      WITH count(n) AS totalNodes
      MATCH ()-[r]->()
      RETURN totalNodes, count(r) AS totalRels
    `);
        const nodeCount = countRes.records[0].get("totalNodes").toNumber();
        const relCount = countRes.records[0].get("totalRels").toNumber();
        console.log(`\n=== BATCH 5 (50 entries) INGESTION COMPLETE ===`);
        console.log(`Live Neo4j AuraDB Stats: ${nodeCount} Nodes, ${relCount} Relationships.`);
    }
    finally {
        await session.close();
        await driver.close();
    }
}
runBatch5().catch((err) => {
    console.error("Batch 5 ingestion failed:", err);
    process.exit(1);
});
