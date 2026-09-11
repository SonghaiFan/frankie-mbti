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
        if (!trimmed || trimmed.startsWith("#")) return;
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

interface BatchEntry {
  id: string;
  sourceIndex: number;
  types: string[];
  series: string;
  title: string;
  archetype?: string;
  analogy?: string;
  coreParadox?: string;
  energyMechanism?: string;
  quote: string;
  cleanedText: string;
  actionableAdvice: string;
}

const batch3Data: BatchEntry[] = [
  // 41
  {
    id: "insight_batch3_41",
    sourceIndex: 41,
    types: ["INFJ", "ENFJ"],
    series: "深度画像与本命天赋",
    title: "NFJ不是海王：向下兼容与不带诱惑的深情",
    archetype: "博爱布道者",
    analogy: "高维向下兼容的暖阳，被误认为只照耀一人的烛火",
    coreParadox: "平等深爱每一个人，却常被对方误读为独特的爱慕诱惑",
    quote: "清醒一点，这份深情不是诱惑，他在向下兼容。NFJ的终极课题是不带诱惑的深情，不带敌意的坚定。",
    cleanedText: "NFJ（ENFJ大宝剑/INFJ绿老头）绝不是海王或中央空调。他们的真实愿景是平等地爱每一个人，散播美好与善良。但很多人缺乏被无条件善待的经验，常把这份大爱误当成对自己的特殊诱惑。清醒一点，他只是在向下兼容。NFJ的终生课题是学会'不带诱惑的深情，不带敌意的坚定'。",
    actionableAdvice: "NFJ在对人表达善意时主动表明普适界限，避免让人产生恋爱错觉；被关怀者切莫将普遍善意过度脑补为爱情。",
  },
  // 42
  {
    id: "insight_batch3_42",
    sourceIndex: 42,
    types: ["ENFJ"],
    series: "深度画像与本命天赋",
    title: "ENFJ无需自卑：全地形适配的生命塑造者",
    archetype: "全地形变形者 / 主人公",
    analogy: "像水一样适配任何容器，从端茶倒水的实习生到中流砥柱",
    coreParadox: "各方面都能快速上手，却总觉得自己逻辑不如T人深刻而隐隐自卑",
    quote: "ENFJ可以是任何形状任何身份，赚的是价值感与自我满足，钱只是副赠品。",
    cleanedText: "ENFJ无需自卑，他是最全能的变形者：在公司可以做低调热情的实习生，能做承上启下的中层，也能做技术攻坚。尽管有时会觉得自己逻辑不够绝对严密，但他的人情洞察与调动能力无可匹敌。他赚的是自我满足与价值感，钱只是随之而来的副产品。",
    actionableAdvice: "停止用理科生的纯逻辑标准苛求自己，将天赋聚焦于组织协调、文化构建与赋能他人的核心领域。",
  },
  // 43
  {
    id: "insight_batch3_43",
    sourceIndex: 43,
    types: ["ENFJ"],
    series: "亲密关系与恋爱全流程",
    title: "追ENFJ三大绝招：示弱、反馈与反向关心",
    archetype: "救赎型恋人",
    analogy: "精准激发大宝剑英雄主义与保护欲的心理钥匙",
    coreParadox: "习惯关照所有人，极少被问及感受；谁能看见他的疲惫，谁就拿到了通往内心的门票",
    quote: "追ENFJ三招：多关心他问感受、讲自己有多惨、在讲惨时顺便关心他。",
    cleanedText: "追ENFJ三招：第一，多关心他，主动问他的真实感受（因为平时只有他照顾别人）；第二，适度暴露自己的软弱和不易，激发他的拯救欲；第三，在讲自己困难的同时反过来关心他。这种既依赖他又心疼他的互动，能瞬间击中ENFJ的心房。",
    actionableAdvice: "和ENFJ相处不要硬碰硬逞强，多向他请教求助，并真诚表达'有你在真好'的情感肯定。",
  },
  // 44
  {
    id: "insight_batch3_44",
    sourceIndex: 44,
    types: ["ENFJ"],
    series: "商业搞钱与战略破局",
    title: "ENFJ搞钱密码：利他为先，财富是价值的副赠品",
    archetype: "价值变现操盘手",
    analogy: "聚拢人心的磁场：财随人聚，人随德归",
    coreParadox: "如果只盯着钱往往赚不到，把人服务好、把价值做足，财富自会排队找来",
    quote: "ENFJ赚的是价值感和自我满足，钱只是副赠品，他通常不缺正财偏财。",
    cleanedText: "ENFJ赚钱的底层逻辑是利他和情绪价值变现。他做事情一定要赋予宏大的意义感。只要他在社群、团队、客户关系中建立深厚的情感连接与信任，钱就会作为附属品自然涌入，正财偏财俱佳。",
    actionableAdvice: "选择教育、咨询、高端销售、团队领袖等强连接行业，打造以人为核心的商业模式。",
  },
  // 45
  {
    id: "insight_batch3_45",
    sourceIndex: 45,
    types: ["INFJ", "ENFJ"],
    series: "亲密关系与恋爱全流程",
    title: "搞定NFJ五部曲：认同、回应、示弱、期待、真诚",
    archetype: "共鸣型伴侣",
    analogy: "精密的情感调频仪：频率对上就是一生，对不上就是铜墙铁壁",
    coreParadox: "表面极易接近，内核防线极深；唯有极度的真诚与同频才能破关",
    quote: "认同他的付出，积极回应他的细节，展示脆弱，心怀期待，保持真诚。",
    cleanedText: "搞定NFJ的核心五部曲：第一认同（受用他的付出，肯定他的价值观）；第二回应（不冷落每一次情绪互动）；第三示弱（允许他成为你的依靠）；第四期待（让他觉得未来可期）；第五真诚（不玩套路套弄假戏）。",
    actionableAdvice: "把每一次沟通都当成心与心的对话，杜绝敷衍，及时正反馈他的微小关怀。",
  },
  // 46
  {
    id: "insight_batch3_46",
    sourceIndex: 46,
    types: ["ENFJ"],
    series: "深度画像与本命天赋",
    title: "ENFJ数值怪：全A面板与成长陷阱",
    archetype: "六边形战士",
    analogy: "全能型英雄：学习、社交、执行力样样精通，但蓝条耗尽极易崩溃",
    coreParadox: "被所有人当作顶梁柱依靠，自己却无处可依；全能的面具压垮了真实的自我",
    quote: "ENFJ是MBTI里的数值怪，全A面板，什么都能成为天赋，但这也是最大的陷阱。",
    cleanedText: "ENFJ是MBTI中的全A数值怪：学习能力强、社交双商高、执行力卓越。但这种全能常常变成沉重枷锁，让周围人把他的付出当成理所当然，自己也陷入'只能完美不能脆弱'的精神内耗。",
    actionableAdvice: "允许自己有弱项，卸下全能拯救者的人设，学会主动向团队或伴侣分担压力。",
  },
  // 47
  {
    id: "insight_batch3_47",
    sourceIndex: 47,
    types: ["ENFJ"],
    series: "亲密关系与恋爱全流程",
    title: "ENFJ的理想型：脆弱感引路，生命力定情",
    archetype: "生命共振者",
    analogy: "被流浪小动物的眼神吸引，但最终留恋的是能并肩奔跑的骏马",
    coreParadox: "容易被破碎感短期捕获，但长期维系必须依赖对方自强不息的生命力",
    quote: "ENFJ会被脆弱感短期吸引，但想让他长期上头，必须能看见他的雷区且拥有蓬勃的生命力。",
    cleanedText: "ENFJ容易被他人的脆弱感激发拯救欲，但长期相处若对方一直摆烂无底线吸血，ENFJ会迅速幻灭。能让他持续深爱的人，既能敏锐看见他的疲惫与雷区，又拥有独立自洽、生机勃勃的生命力。",
    actionableAdvice: "不要在ENFJ面前长期扮演受害者，在接受其帮助后展现出积极成长的活力与反馈。",
  },
  // 48
  {
    id: "insight_batch3_48",
    sourceIndex: 48,
    types: ["ENFJ"],
    series: "误测与形态自救",
    title: "ENFJ的五种误测伪装：从蓝妈妈到霸道总裁",
    archetype: "千面变色龙",
    analogy: "随环境压力不断切换人格战袍",
    coreParadox: "为了维持环境和谐而过度适应角色，常常忘记自己真实的内核究竟是什么",
    quote: "误测为ESFJ是因世俗责任，误测为INFJ是疲惫回血，误测为ENTJ是必须披挂上阵。",
    cleanedText: "ENFJ常误测为：1. ESFJ（当陷入柴米油盐细节照料时）；2. INFJ（当社交耗竭需要闭关内省时）；3. INFP/ENFP（沉浸在理想主义与浪漫幻想中）；4. ENTJ（当身处无人担责的严苛职场必须狠下心发号施令时）。",
    actionableAdvice: "以'Fe主导+Ni辅助'为锚点，看清自己在不同应激环境下的变形，回归自心。",
  },
  // 49
  {
    id: "insight_batch3_49",
    sourceIndex: 49,
    types: ["ENFP"],
    series: "社交防御与四层圈层",
    title: "快乐小狗的求生法则：找个头铁的紫人朋友",
    archetype: "阳光冒险家",
    analogy: "小狗在外面容易被恶狼欺负，身边需要跟一头冷面护卫犬",
    coreParadox: "太善良友善不好意思拒绝别人，容易被小人坑害破财",
    quote: "ENFP一定要交点紫人朋友，不然在外面容易被坑被骗，善良要带点锋芒。",
    cleanedText: "ENFP天性善良坦诚，往往不懂算计与防备，容易在生意或社交中被欺负、被借钱不还。身边极度需要配备一个头铁、理智、懂防范审查的NT（紫人）朋友，关键时刻帮他掌眼、把关止损。",
    actionableAdvice: "遇到涉及大额金钱、合同或复杂人际纠纷时，先拉上NT朋友推演审核再做决定。",
  },
  // 50
  {
    id: "insight_batch3_50",
    sourceIndex: 50,
    types: ["ENFP"],
    series: "深度画像与本命天赋",
    title: "ENFP女生的两极：极度恋爱脑 vs 绝情搞钱客",
    archetype: "烈火纯情派 / 觉醒吸金兽",
    analogy: "恋爱时借钱给男友花，觉醒后把社交魅力转化为精准的搞钱收割机",
    coreParadox: "全情投入时感性至极，一旦看破现实后执行力惊人地狠绝",
    quote: "搞爱情的ENFP有10块恨不得借10块给对方花；觉醒搞钱的ENFP势不可挡。",
    cleanedText: "ENFP女生往往经历两极蜕变：前期纯爱至上，掏心掏肺甚至倒贴；在经历了情感幻灭与背叛后迅速觉醒，将超群的共情力、人脉整合力和感染力投入事业，蜕变为眼光毒辣的商业高手。",
    actionableAdvice: "青年期及早设立财务与情感防火墙，把热情优先投资在个人技能与资产积累上。",
  },
  // 51
  {
    id: "insight_batch3_51",
    sourceIndex: 51,
    types: ["ENFP"],
    series: "深度画像与本命天赋",
    title: "ENFP的伪内向：气场不对时的绝对防御",
    archetype: "假性自闭小狗",
    analogy: "嗅觉灵敏的动物：周围空气有毒，立刻原地装死闭麦",
    coreParadox: "人前像疯狗，到了磁场不对的环境比I人还拘谨沉默",
    quote: "不要觉得小狗每天都在傻乐，场能不对时，他比谁都安静谨慎，人家聪明着呢。",
    cleanedText: "很多人以为ENFP是永动机式社牛，其实他对环境气场极度敏感。如果周围人虚伪、充满恶意或频率不合，ENFP会瞬间关闭天线，变得极其内向、拘谨甚至一言不发，这是他高维的自保直觉。",
    actionableAdvice: "无需强迫自己在不对劲的局里暖场，信任自己的直觉雷达，安静抽身离开即可。",
  },
  // 52
  {
    id: "insight_batch3_52",
    sourceIndex: 52,
    types: ["ENFP"],
    series: "亲密关系与恋爱全流程",
    title: "ENFP的无声撤退：一边深爱，一边出逃",
    archetype: "绝望的脱困者",
    analogy: "温水煮青蛙时的挣扎：在爱意消磨前给自己准备降落伞",
    coreParadox: "依然对你笑、为你付出，但在心底已经开始倒计时撤退",
    quote: "ENFP谈恋爱最厉害的一点是一边爱你一边慢慢退出，终极问题是：我在这段关系里是不是越来越不像自己了？",
    cleanedText: "ENFP不会突然绝情断联，而是经历漫长的自我折磨。当他在一段关系中感到窒息、感到自己的快乐与灵气被一点点剥夺，开始问'我是不是越来越不像自己了'时，他就会一边维持日常，一边在心底打包行李悄然撤退。",
    actionableAdvice: "伴侣若发现ENFP突然不再分享怪怪的日常和低质沙雕视频，说明他正在心理后撤，须立即沟通修复。",
  },
  // 53
  {
    id: "insight_batch3_53",
    sourceIndex: 53,
    types: ["ENFP"],
    series: "商业搞钱与战略破局",
    title: "ENFP搞钱路径：在好玩与利他中聚敛财富",
    archetype: "快乐经济开拓者",
    analogy: "节日庆典上的欢呼制造者：快乐在哪里，金钱就在哪里流动",
    coreParadox: "逼他做枯燥的表格账目必死无疑，让他策划好玩有趣的体验却能爆发奇迹",
    quote: "ENFP赚的是好玩的钱、趁心意的钱、利他的钱，社群、文旅、派对、新兴产业皆在此列。",
    cleanedText: "ENFP必须在'兴奋感'和'人情味'中搞钱。传统体制内的刻板流程会杀死他的灵气。适合他的领域是社群运营、文化旅游、自媒体、潮玩派对、跨界整合等新兴赛道，在传播快乐中顺带收获财富。",
    actionableAdvice: "把工作游戏化，寻找能落地执行的搭档（SJ/TJ），自己专注负责前端创意与资源破冰。",
  },
  // 54
  {
    id: "insight_batch3_54",
    sourceIndex: 54,
    types: ["ENFP"],
    series: "亲密关系与恋爱全流程",
    title: "追ENFP核心：能量跟随与情绪共振",
    archetype: "回声恋人",
    analogy: "放风筝的拉扯艺术：他高飞时为他喝彩，他跌落时稳稳接住",
    coreParadox: "不怕你笨不怕你慢，就怕你对他的热情冷嘲热讽、泼冷水",
    quote: "追ENFP就一句话：跟随他的外在能量和内在情绪波动，做那个永远接得住梗的人。",
    cleanedText: "追ENFP的黄金法则就是'情绪接盘'：他兴奋分享一碗好吃的面，你要立刻热烈回应；他半夜emo发愁，你要耐心托底倾听。接得住他的怪叫、接得住他的神经质，你就赢得了他的全世界。",
    actionableAdvice: "绝不要在他兴高采烈时泼冷水或摆架子说教，做他最热忱的观众和最温暖的港湾。",
  },
  // 55
  {
    id: "insight_batch3_55",
    sourceIndex: 55,
    types: ["ENFP"],
    series: "亲密关系与恋爱全流程",
    title: "ENFP的Crush时刻：天不管地不管的梭哈",
    archetype: "纯爱狂赌徒",
    analogy: "点燃全部引线的烟花：哪怕只绽放三秒，也要把整颗心双手奉上",
    coreParadox: "平时精明敏感，遇到心动嘉宾瞬间丧失理智，飞蛾扑火",
    quote: "遇到Crush小狗必梭哈，天不管地不管，万一过了今天他不是我的呢？",
    cleanedText: "当ENFP被瞬间电到（Crush）时，他会爆发出惊人的行动力：不计得失、不留后路、全盘梭哈。这种烈度极高但也极易被渣男渣女趁虚而入，需要外界朋友拉住缰绳。",
    actionableAdvice: "心动时给自己设定48小时冷却期，找理性朋友交叉验证对方人品后再下注。",
  },
  // 56
  {
    id: "insight_batch3_56",
    sourceIndex: 56,
    types: ["ENFP"],
    series: "深度画像与本命天赋",
    title: "快乐小狗的怪叫哲学：生命力的超载释放",
    archetype: "能量喷泉",
    analogy: "高压锅的排气阀：怪叫是灵魂为了防止自爆的自动排压",
    coreParadox: "在外界看来滑稽甚至失态，实则是他保持天真与心理健康的生命力护城河",
    quote: "ENFP真的很爱怪叫，这是TJ人一辈子发不出的声音，是旺盛生命力的宣泄。",
    cleanedText: "ENFP日常发出奇怪的声音、夸张的叹息或肢体动作，并非哗众取宠，而是其高负荷感官与情感雷达过载时的无害排压方式。能在他面前自由怪叫的人，是他最安心的归宿。",
    actionableAdvice: "包容接纳他的小怪癖，允许他在你面前做个无需紧绷的幼稚小孩。",
  },
  // 57
  {
    id: "insight_batch3_57",
    sourceIndex: 57,
    types: ["ENFP"],
    series: "社交防御与四层圈层",
    title: "ENFP的四层朋友与终极落寞",
    archetype: "人群中的孤独者",
    analogy: "四海皆朋友，推杯换盏后独自走在回家的冷风中",
    coreParadox: "对谁都热情似火，却极难找到一个把自已排在第一位的专属密友",
    quote: "ENFP并不是对谁都掏心掏肺，现实往往是周围的朋友都有比自己更要好的朋友。",
    cleanedText: "ENFP有清晰的四层防御圈：点头客 -> 饭友玩伴 -> 志同道合 -> 灵魂挚友。他看似呼朋引伴，但内心常有深刻的落寞：大家有困难都找他开解，可当他需要拥抱时，却发现大家都有更要好的第一顺位。",
    actionableAdvice: "不必强求所有人回应同等的深度，学会珍惜自己内心的丰盈，留给懂你孤独的人。",
  },
  // 58
  {
    id: "insight_batch3_58",
    sourceIndex: 58,
    types: ["ENFP"],
    series: "亲密关系与恋爱全流程",
    title: "ENFP恋爱公开症候群：热烈张扬与全方位黏人",
    archetype: "阳光黏人精",
    analogy: "摇着尾巴向全世界炫耀骨头的小狗",
    coreParadox: "暧昧期还能克制，一旦确定关系瞬间变成大型挂件，随时随地想要贴贴",
    quote: "ENFP喜欢公开恋爱、公开分手，有了进展就忍不住要向全世界宣布。",
    cleanedText: "ENFP爱一个人是藏不住的：发朋友圈、拉着见朋友、公开秀恩爱。恋爱后的黏人程度远超想象，恨不得24小时挂在对方身上分享全世界的小事，这是他全心信任的最高礼赞。",
    actionableAdvice: "给予他公开的身份确认与及时的身体接触（拥抱、牵手），消除其潜在的不安。",
  },
  // 59
  {
    id: "insight_batch3_59",
    sourceIndex: 59,
    types: ["ENFP"],
    series: "深度画像与本命天赋",
    title: "快乐小狗的阴暗面：消解无聊与爱的投射",
    archetype: "虚无游魂",
    analogy: "贪恋温暖的旅人：爱上的不是灯火，而是灯火带来的驱寒感",
    coreParadox: "看似爱得撕心裂肺，深层可能只是谁陪他玩、谁消除他的孤寂，他就爱谁",
    quote: "不成熟的小狗没有爱情，谁陪他消解无聊他就爱谁，他爱的是被爱的感觉。",
    cleanedText: "未成熟的ENFP存在幽暗的虚无感：由于惧怕无聊和孤独，容易把陪伴当成真爱，一旦对方新鲜感退却或无法提供足够的情绪刺激，他内心的幻灭感就会迅速滋生，甚至快速转向下一个目标。",
    actionableAdvice: "直面内在的虚无感，在独处中修身修心，区分'耐不住寂寞'与'真正的灵魂共振'。",
  },
  // 60
  {
    id: "insight_batch3_60",
    sourceIndex: 60,
    types: ["ENFP"],
    series: "误测与形态自救",
    title: "ENFP的四种黑化变体：拳头变硬的刺猬",
    archetype: "受创进化的战损小狗",
    analogy: "被逼到绝境的小狗露出锋利的狼牙",
    coreParadox: "越是天真浪漫的人，遭遇背叛后黑化得越狠越彻底",
    quote: "当善意被当成软弱，小狗拳头变硬化身ENTP；受挫自闭化身INFP。",
    cleanedText: "ENFP受重创后的演变形态：1. 进化为ENTP（懂得了人性的险恶，收起真诚，用刻薄逻辑与利益算计防身）；2. 蜷缩为INFP（自我怀疑，躲进洞穴切断社交）；3. 误测为ENFJ/INFJ（被迫扮演懂事负责的大人）。",
    actionableAdvice: "受挫后的攻击性是自我保护机制，无需苛责；疗愈创伤后依然可以找回眼里的光。",
  },
  // 61
  {
    id: "insight_batch3_61",
    sourceIndex: 61,
    types: ["ENTJ"],
    series: "深度画像与本命天赋",
    title: "ENTJ的不认命：一身牛劲最怕虚度此生",
    archetype: "不屈征服者",
    analogy: "拉满弓弦的重箭：绝不允许自己生锈在箭囊里",
    coreParadox: "不怕苦不怕累，就怕一身牛劲无处使，怕被时代和庸人淘汰",
    quote: "ENTJ最怕一觉醒来找不到目标，一身牛劲不知往哪使，资源被分，一无所有。",
    cleanedText: "ENTJ内心的终极恐惧不是失败，而是'碌碌无为'。他像永动机一样渴望征服挑战，最怕的是目标迷失、被平庸的体制架空、一身抱负无处施展。这种骨子里的不认命驱动着他不断攀登顶峰。",
    actionableAdvice: "在没有战事打响的潜伏期，学会把牛劲用于内在修养和身体保养，养精蓄锐以待天时。",
  },
  // 62
  {
    id: "insight_batch3_62",
    sourceIndex: 62,
    types: ["ENTJ"],
    series: "深度画像与本命天赋",
    title: "ENTJ全面分析：外表幽默开朗，内核钢铁战车",
    archetype: "铁血统帅",
    analogy: "披着幽默外套的装甲战车，行进路线精确到厘米",
    coreParadox: "非工作状态下非常幽默爱开玩笑，一旦进入战备状态瞬间变身冷酷决断机器",
    quote: "没见过活人的会觉得ENTJ刻板严肃，其实他外在极其活泼，内核才是钢铁机器。",
    cleanedText: "打破刻板印象：现实中的ENTJ私下极具幽默感与亲和力。但他把生活划分得极其清楚：平时可以像小太阳般轻松，一旦涉及事业目标，主导Te瞬间接管一切，斩断所有多余情绪，追求极致的执行闭环。",
    actionableAdvice: "与ENTJ合作切忌在工作时嬉皮笑脸，开会直接讲重点与交付物，休假时再把酒言欢。",
  },
  // 63
  {
    id: "insight_batch3_63",
    sourceIndex: 63,
    types: ["ENTJ"],
    series: "深度画像与本命天赋",
    title: "ENTJ女生的极致：凡事追求顶峰与对自己下狠手",
    archetype: "破风大女主",
    analogy: "对自己最狠的执剑人：为了战胜平庸，不惜重塑筋骨",
    coreParadox: "社会对女性充满偏见，她偏要以十倍的自律和成果压倒一切质疑",
    quote: "ENTJ女生凡事追求最好，对外在形象与内在实力都有近乎苛刻的高要求。",
    cleanedText: "ENTJ女性常被称为'大女主天花板'。她清楚时代对女性的严苛审视，因此对自己下狠手：身材管理、事业搞钱、认知升级样样追求最优解。她不需要被施舍照顾，她要的是平起平坐的尊重与共赢。",
    actionableAdvice: "欣赏她的野心与强势，绝不要试图用传统'贤妻良母'的狭隘框架去训诫她。",
  },
  // 64
  {
    id: "insight_batch3_64",
    sourceIndex: 64,
    types: ["ENTJ"],
    series: "亲密关系与恋爱全流程",
    title: "追ENTJ的入场券：秀出肌肉，先有用再谈爱",
    archetype: "现实主义盟友",
    analogy: "招募副官的司令官：你必须先证明自己能守住城门",
    coreParadox: "看似残酷功利，实则是对自己负责；他对待自己同样也是'先有用再谈其他'",
    quote: "怎么追ENTJ很简单：展示价值秀肌肉。感情放在后面讲，首先得有用。",
    cleanedText: "追求ENTJ最忌讳无脑献殷勤与空头情话。他考察伴侣像风投考察合伙人：你是否有过硬的长板？你是否有自食其力的本事？你能否在他的宏大蓝图中提供独特的战略支持？先让他尊重你，爱意才会降临。",
    actionableAdvice: "专注把自己的事业或某项专业打磨到极致，带着你的成绩单自然地出现在他的视野里。",
  },
  // 65
  {
    id: "insight_batch3_65",
    sourceIndex: 65,
    types: ["ENTJ"],
    series: "亲密关系与恋爱全流程",
    title: "ENTJ是隐藏款纯爱战神：效率至上下的终极专一",
    archetype: "纯爱赢王",
    analogy: "建立坚不可摧的婚姻同盟：一夫当关，永不背叛",
    coreParadox: "看似最讲利益，实则是最忠诚的伴侣；因为出轨换人试错的成本最高、最反效率",
    quote: "ENTJ是隐藏款纯爱战神，因为纯爱最省成本、最有效率，认定了就不换。",
    cleanedText: "惊人反转：ENTJ在恋爱中是极度专一的纯爱赢王！因为从成本效益来看，出轨、多线暧昧、离婚拆解资产是极其愚蠢低效的行为。一旦他认定你是最佳合伙人与灵魂伴侣，他会倾尽全力护你周全，永不背叛。",
    actionableAdvice: "给予他百分之百的忠诚与信任，他会回馈你最坚不可摧的现实庇护与毕生深情。",
  },
  // 66
  {
    id: "insight_batch3_66",
    sourceIndex: 66,
    types: ["ENTJ"],
    series: "商业搞钱与战略破局",
    title: "ENTJ的世俗哲学：强才配被爱，弱就活该被淘汰",
    archetype: "达尔文主义信徒",
    analogy: "严酷的自然丛林：唯有长出獠牙，才有资格谈仁慈",
    coreParadox: "开智极早看透等价交换，过早背负起生存重担而缺乏无条件的爱",
    quote: "ENTJ从小就知道想要东西得拿成绩去换，强才值得被爱，弱就活该淘汰。",
    cleanedText: "ENTJ的世界观形成极早：从小懂得'考好了才有糖吃'，养成了深入骨髓的丛林生存哲学。他深信实力决定一切，对弱者的同情极度节制。这种信念成就了他的霸业，但也容易让他陷入冷酷无情的孤独。",
    actionableAdvice: "在商业中保持狼性，在家庭与私交中学会卸下面具，接纳不完美的温情。",
  },
  // 67
  {
    id: "insight_batch3_67",
    sourceIndex: 67,
    types: ["ENTJ"],
    series: "亲密关系与恋爱全流程",
    title: "ENTJ严苛的爱：替你提前挨社会的毒打",
    archetype: "严父型伴侣",
    analogy: "搏击教练：在训练馆把你打疼，是为了让你在战场上活下来",
    coreParadox: "嘴里说着最不近人情的话，背后却在为你筑牢抗风险的防线",
    quote: "ENTJ不是暴君，只是比谁都清楚市场有多残酷，他在替你提前挨社会的打。",
    cleanedText: "很多人把ENTJ的严厉要求当成控制欲，其实那是他深沉厚重的爱。他深知商业竞争与现实社会的残酷，若你没有真本领，迟早会被市场撕碎。他在你身边苛刻挑刺，是在用最痛的方式为你穿上铠甲。",
    actionableAdvice: "看懂他严厉背后的苦心，告诉他你感受到了他的爱，但也请他偶尔给你一个温暖的拥抱。",
  },
  // 68
  {
    id: "insight_batch3_68",
    sourceIndex: 68,
    types: ["ENTJ"],
    series: "误测与形态自救",
    title: "ENTJ的五种误测镜像：战袍之下的多面体",
    archetype: "战略变奏大师",
    analogy: "司令官根据不同战局更换制服",
    coreParadox: "根据环境需要极度灵活变装，容易误导不懂其底层Te动机的人",
    quote: "无所事事时化身ENTP，闭门思考时误测为INTJ，发号施令时像ESTJ。",
    cleanedText: "ENTJ常见误测：1. ENTP（和挚友放松聚会、享受当下时幽默狂放）；2. INTJ（遭遇挫折闭门推演宏观战略时）；3. ESTJ（狠抓细节与制度落地时）；4. ENFJ（登台演讲激发员工士气、灌输愿景时）。底层核心永远是Te结果导向。",
    actionableAdvice: "透过表象的行为风格看深层动机：如果是为了达成既定目标而调配各种策略，那就是ENTJ无误。",
  },
  // 69
  {
    id: "insight_batch3_69",
    sourceIndex: 69,
    types: ["ENTP"],
    series: "深度画像与本命天赋",
    title: "ENTP的原罪：傲慢与骨子里的众生平等",
    archetype: "解构诸神的小丑",
    analogy: "站在山巅挑剔所有人的怪才：凡人皆愚钝，唯我独清醒",
    coreParadox: "表面极具亲和力，内心却总在暗自评价'你算老几'；唯有真正的智者才能让他心悦诚服",
    quote: "ENTP的原罪是傲慢，表面love and peace，内心觉得别人都是小卡拉米。",
    cleanedText: "ENTP最大的阿喀琉斯之踵是傲慢。凭借天生的敏捷思维，他一眼看穿很多人的浅薄套路。刷到大部分内容都觉得'就这也能火'。这种傲慢会让他错失扎实积累的机会，直到踢上真正的铁板才学会敬畏。",
    actionableAdvice: "主动结识比自己高两三个认知段位的大师，感受被全方位碾压的痛苦，彻底粉碎智力傲慢。",
  },
  // 70
  {
    id: "insight_batch3_70",
    sourceIndex: 70,
    types: ["ENTP"],
    series: "亲密关系与恋爱全流程",
    title: "ENTP恋爱中的嘴臭与攻击：三重心理试探",
    archetype: "带刺的试金石",
    analogy: "故意亮出毒牙的小狐狸：看你会不会被吓跑，还是能温柔摸摸他的头",
    coreParadox: "越是深爱一个人，越忍不住用尖锐的毒舌去挑衅他，试探安全边际",
    quote: "恋爱中嘴臭攻击是在检验关系是否牢固、表达特殊亲近，以及试探底线。",
    cleanedText: "ENTP在亲密关系中嘴臭损你，背后有三重含义：第一，安全测试（我露出最混蛋的一面，你是否依然不离不弃）；第二，特权宣示（我只在最信任的人面前不加修饰）；第三，试探边界（测出你的耐受极限）。",
    actionableAdvice: "面对ENTP的嘴贱，既不要当真破防，也不要一味退让；幽默反击回去，并坚定告诉他'我接得住你，少耍花样'。",
  },
  // 71
  {
    id: "insight_batch3_71",
    sourceIndex: 71,
    types: ["ENTP"],
    series: "商业搞钱与战略破局",
    title: "ENTP财富密码：擅打江山不擅守，从0到1的商业奇才",
    archetype: "破局急先锋",
    analogy: "开疆拓土的突击队：拿下城池后必须立刻转交驻防军，否则自己先拆城墙",
    coreParadox: "0到1极具暴富潜能，1到100枯燥落地却能把他折磨疯，常常富贵一场又归零",
    quote: "富豪榜没有ENTP是有理由的：擅长从0到1打江山，极度不擅长守江山。",
    cleanedText: "ENTP在商业上的杀手锏是从0到1的颠覆性创新与商业嗅觉。但他致命的短板是一旦商业模式走通、进入标准化运营期，他就会感到极度厌倦，甚至胡乱折腾亲手毁掉成果。他需要职业经理人替他守城。",
    actionableAdvice: "做天使投资、商业顾问、连续创业者或IP操盘手，完成0到1验证后果断将运营权移交SJ/TJ型合伙人。",
  },
  // 72
  {
    id: "insight_batch3_72",
    sourceIndex: 72,
    types: ["ENTP"],
    series: "亲密关系与恋爱全流程",
    title: "追ENTP的开卷考试：长板拉满，拒绝无聊",
    archetype: "智力捕手",
    analogy: "只为稀有物种停驻的猎鹰：平庸的猎物激不起他的半点食欲",
    coreParadox: "对伴侣要求看似极度宽松，实则门槛极高；你必须在某一领域让他感到叹为观止",
    quote: "追ENTP开卷考试：必须有长板（特别好看、特别有钱、特别有趣、特别聪明），切忌无聊。",
    cleanedText: "追求ENTP不要搞常规追求套路。他不在乎你是否全面周到，只要你有一项极其突出（极度美貌、财富自由、思维诡谲、见识超群），并能在言语交锋中接住他的梗甚至反杀他，他就会对你痴迷上瘾。",
    actionableAdvice: "在他面前展示你最拿手的小众爱好或独到见解，制造智力张力，切忌唯唯诺诺应声虫。",
  },
  // 73
  {
    id: "insight_batch3_73",
    sourceIndex: 73,
    types: ["ENTP"],
    series: "误测与形态自救",
    title: "ENTP的五种误测面具：社交悍匪的内倾时刻",
    archetype: "多面剧作家",
    analogy: "剧场后台的主角：卸下戏服后安静得判若两人",
    coreParadox: "在陌生环境瞬间化身冷酷旁观者，被误以为是自闭I人",
    quote: "陌生无安全感时化身INTP，受重挫时像INTJ，狂欢时像ESTP。",
    cleanedText: "ENTP误测画像：1. INTP（到了陌生环境或缺乏安全感时，缩回壳里冷静观察全局）；2. INTJ（受重大打击后逼自己建立严密防护体系）；3. ESTP（纯粹沉浸在感官狂欢中）；4. ENFP（同理心爆发、沉浸在浪漫情绪中）。",
    actionableAdvice: "通过'Ne散发可能性+Ti内在逻辑校验'确定核心本体，接纳自己偶尔需要像I人一样独处充电。",
  },
  // 74
  {
    id: "insight_batch3_74",
    sourceIndex: 74,
    types: ["ENTP", "INFP"],
    series: "亲密关系与恋爱全流程",
    title: "思维组遇上小蝴蝶：ENTP追INFP的灵犀碰撞",
    archetype: "狐狸与蝴蝶",
    analogy: "好奇狐狸小心翼翼收起利爪，捧起世界上最易碎也最美丽的蝴蝶",
    coreParadox: "平时嘴贱心硬的混世魔王，遇到纯粹干净的INFP瞬间变得温柔克制",
    quote: "骨折眉毛烤小蝴蝶是有道理的：他希望能在那片纯净中得到灵魂的救赎。",
    cleanedText: "ENTP与INFP（思维组x小蝴蝶）的绝美宿命：平时游戏人间的ENTP，在看到INFP尘世不染的气质和深刻的情感世界时，会产生强烈的保护欲与好奇心。他收敛起嘲讽锋芒，用智识引导保护小蝴蝶，小蝴蝶则用纯爱治愈他的虚无。",
    actionableAdvice: "ENTP追求INFP时务必收起轻佻戏谑的态度，给予极度的专一安全感，认真倾听他的精神世界。",
  },
  // 75
  {
    id: "insight_batch3_75",
    sourceIndex: 75,
    types: ["ESFJ"],
    series: "深度画像与本命天赋",
    title: "ESFJ的爱情全貌：端庄国泰民安与极致利他",
    archetype: "国泰民安大家长",
    analogy: "温润如玉的家园守护神：初见端庄克制，相守后无微不至",
    coreParadox: "刚认识时拘谨得像I人，认定你后用满溢的爱把你包裹得严严实实",
    quote: "女生ESFJ端庄大气国泰民安，男生儒雅礼貌，爱一个人会照顾到每个毛孔。",
    cleanedText: "ESFJ是世俗中最具安心感的存在：女生端庄大气、充满国泰民安的厚重温婉；男生文质彬彬、极具教养。初识时因重视礼貌分寸略显拘谨，一旦确定关系，他会把你的衣食住行、家庭亲朋照顾得井井有条。",
    actionableAdvice: "珍惜ESFJ在细节上的每一份付出，经常口头赞扬并在其亲友面前给予他充分的体面。",
  },
  // 76
  {
    id: "insight_batch3_76",
    sourceIndex: 76,
    types: ["ESFJ"],
    series: "深度画像与本命天赋",
    title: "ESFJ的核心内耗：倾其所有的委屈与求而不得",
    archetype: "委屈的奉献者",
    analogy: "把最好的饭菜端上桌，却只能眼巴巴看着对方挑食嫌弃的母亲",
    coreParadox: "用尽一切方式去爱你，却绝望发现那根本不是你想要的方式",
    quote: "真实的ESFJ潜台词：我用尽一切为你付出，你为什么不能用我想要的方式来爱我？",
    cleanedText: "ESFJ最大的心碎根源：凭借Si经验与传统规矩拼命对人好，却常遭遇'好心办坏事'的冷眼。他内耗委屈至极：'我已经为你倾尽所有，为何换不来理解？'这源于他习惯按自己的标准付出，而忽视了对方的真实需求。",
    actionableAdvice: "ESFJ在付出前先问一句'你需要这个吗'；学会把给别人的爱分一半回流滋养自己。",
  },
  // 77
  {
    id: "insight_batch3_77",
    sourceIndex: 77,
    types: ["ESFP"],
    series: "深度画像与本命天赋",
    title: "ESFP全面分析：最需要聚光灯的人间富贵花",
    archetype: "舞台中心巨星",
    analogy: "活在当下的火焰：不关心虚无哲学，只燃烧眼前的每一寸快乐",
    coreParadox: "极度厌倦枯燥理论与说教，生命就是一场盛大的即兴演出",
    quote: "最需要人的人格ESFP：不喜欢理论，讨厌无趣，活得极其热烈真实。",
    cleanedText: "ESFP是天生的生活表演家。外倾实感（Se）让他对当下的声色光影、美食华服有着极致的鉴赏力；辅助Fi让他情感真挚饱满。他讨厌假大空的抽象说教，只愿把当下的每一秒过得生动鲜活，是人群中的开心果。",
    actionableAdvice: "不要试图用大道理说教他，带他去体验新鲜有趣的世界，陪他一起痛快生活。",
  },
  // 78
  {
    id: "insight_batch3_78",
    sourceIndex: 78,
    types: ["ESFP"],
    series: "亲密关系与恋爱全流程",
    title: "ESFP的恋爱法门：极致颜控与即时满足",
    archetype: "感官享乐恋人",
    analogy: "追逐美貌与金光的蜂鸟：感觉对了瞬间沦陷，感觉灭了绝不回头",
    coreParadox: "看似择偶标准复杂，实则极简——颜值、经济实力或情绪价值占一样即通关",
    quote: "和ESFP谈恋爱很简单，就看感觉：长得好看、特别有钱，或者超级会哄人。",
    cleanedText: "ESFP谈恋爱是绝对的感官派和感觉派。因为他自己往往形象出挑，所以对伴侣的皮囊和衣品要求极高。长得好看能让他一见钟情，会花钱制造浪漫或极懂情绪抚慰能让他迅速沦陷，感情浓烈直接毫无拖泥带水。",
    actionableAdvice: "打理好个人外表与穿搭，约会注重精致氛围与浪漫体验，多夸赞他的品味与美貌。",
  },
  // 79
  {
    id: "insight_batch3_79",
    sourceIndex: 79,
    types: ["ESTJ"],
    series: "深度画像与本命天赋",
    title: "ESTJ深沉的爱：我是正确的，所以我是值得被爱的",
    archetype: "执政官大家长",
    analogy: "家族宗祠的参天大树：为你遮风挡雨，但枝桠也严格限制了你的天空",
    coreParadox: "掌控欲背后是沉重如山的责任感；认定唯有确保自己有用且正确，才有资格被爱",
    quote: "一句话总结ESTJ：我是正确的，我是有用的，所以我是值得被爱和尊重的。",
    cleanedText: "ESTJ强势干预外在秩序，常被诟病为霸道独裁。然而其底层心智模型是：'如果我不能提供正确的结果，我便毫无价值'。他把所有人的重担扛在肩上，用严苛的规则构筑起庇护所，这是他笨拙而崇高的深情。",
    actionableAdvice: "肯定他的担当与汗水，温和提醒他：'即便你偶尔做错了、累了，我也依然爱你，你无需时刻正确'。",
  },
  // 80
  {
    id: "insight_batch3_80",
    sourceIndex: 80,
    types: ["ESTJ"],
    series: "亲密关系与恋爱全流程",
    title: "ESTJ的爱情观：爱做不爱说，行动铸就江山",
    archetype: "硬核行动派",
    analogy: "用砖石替你盖城堡的工匠：嘴里说不出甜言蜜语，双手却早已磨出老茧",
    coreParadox: "能为你做饭、接送上下班、买房买车，却对浪漫告白舌头打结",
    quote: "ESTJ爱做不爱说，甜言蜜语说不出口，都在接送上下班和默默付出里。",
    cleanedText: "与ESTJ谈恋爱要看其行而非听其言。他极不擅长风花雪月的情话，甚至觉得那轻浮虚伪。他表达爱的方式极其硬核：生病买药送医、下雨车接车送、解决现实经济问题。他的爱是看得见、摸得着的现实基石。",
    actionableAdvice: "不要逼他写情诗说情话，真诚接纳并感谢他在现实中为你解决的每个麻烦。",
  },
  // 81
  {
    id: "insight_batch3_81",
    sourceIndex: 81,
    types: ["ESTP"],
    series: "深度画像与本命天赋",
    title: "ESTP全面解析：需要天天拉出去遛的大型犬",
    archetype: "猎豹特工 / 谈判天王",
    analogy: "精力无穷的大型猎犬：关在笼子里会拆家，放到荒原上是顶级猎手",
    coreParadox: "极度耐不住沉闷寂寞，在危机四伏的高压谈判与突发事件中却异常沉着狠辣",
    quote: "ESTP就像一只需要天天拉出去遛的大型犬，政治家、谈判官、建筑狂人常出此类。",
    cleanedText: "ESTP是高能量行动派的极致代表。主导Se敏锐捕捉现场每个细节与微表情，辅助Ti瞬间计算最优对策。他在谈判桌、公关危机、极限运动中身手矫健，但如果让他坐在办公室按部就班，他会极速抑郁或四处惹事。",
    actionableAdvice: "为他提供能够施展野性魅力的开阔赛道，给予他充分的行动自由度与即时回报刺激。",
  },
  // 82
  {
    id: "insight_batch3_82",
    sourceIndex: 82,
    types: ["ESTP"],
    series: "商业搞钱与战略破局",
    title: "ESTP搞钱术：靠嘴吃饭与资源整合的大师",
    archetype: "商业操盘老手",
    analogy: "空手套白狼的整合大师：我不懂技术，但我懂怎么让懂技术的人为我赚钱",
    coreParadox: "不爱死磕底层细节，却能以惊人的情商和魄力把各路牛人捏合成财富联盟",
    quote: "爱赚钱会赚钱，靠嘴吃饭，拉拢聪明人为自己打工，赚差价整合发财，这就是ESTP。",
    cleanedText: "ESTP搞钱的核心是'借鸡生蛋与跨界撮合'。他深谙人情世故与利益杠杆：自己不懂专业没关系，只要拉拢专业人才分钱共享，利用信息差与谈判技巧拿下订单，便能以最快速度变现巨额财富。",
    actionableAdvice: "强化契约精神与合规底线，与懂风控的稳重搭档（SJ/NT）绑定，防止翻船。",
  },
  // 83
  {
    id: "insight_batch3_83",
    sourceIndex: 83,
    types: ["ALL", "ENFP", "ENTP", "ENFJ", "ENTJ", "ESFP", "ESFJ", "ESTP", "ESTJ"],
    series: "深度画像与本命天赋",
    title: "E人也会独处：卸下面具后的虚脱与放空",
    archetype: "台前英雄台后凡人",
    analogy: "拔掉电源的探照灯：在外界亮得晃眼，关上房门漆黑一片",
    coreParadox: "在外太在乎外界期待与全场气氛，回到家需要绝对的黑暗与安静来回血",
    quote: "不要觉得E人都是疯狗不会累，在外面戴满面具，回家后极度需要独处充电。",
    cleanedText: "破除对E人的刻板认知：许多高阶E人并非贪恋社交，而是出于责任、教养或生存需要，在外界全力维持场子热烈与他人期待。当他回到家关上门，整个人会陷入极度的疲惫与放空，同样需要长久的孤独来自我修复。",
    actionableAdvice: "当你的E人朋友聚会后突然失联闭关，不要责怪他冷淡，那是他灵魂在重塑电量。",
  },
  // 84
  {
    id: "insight_batch3_84",
    sourceIndex: 84,
    types: ["INFJ", "ISFJ", "ENFJ", "ESFJ"],
    series: "四大组别的终极心性修行",
    title: "FJ的边界感修行：允许自己自私，不过度干涉",
    archetype: "觉醒的引路人",
    analogy: "收起越界的爱之羽翼：别人的人生，该让他自己去趟泥潭",
    coreParadox: "以为干涉是为了帮别人好，其实是在剥夺对方通过吃苦换取成长的权利",
    quote: "FJ最大的问题是太照顾别人不照顾自己。首先学会自私，其次不要管太宽。",
    cleanedText: "FJ人格的痛苦源于边界感模糊：看到别人受苦就忍不住插手拯救。修行第一步是允许自己自私，优先照顾自己的身心；第二步是停止越界掌控：每个人都有自己的业力剧本，你替他扛包，只会让他丧失成长的机会。",
    actionableAdvice: "遇到他人求助前先问自己：'这与我核心利益何干？他是否真的到了生死攸关？'学会克制助人冲动。",
  },
  // 85
  {
    id: "insight_batch3_85",
    sourceIndex: 85,
    types: ["INFJ"],
    series: "亲密关系与恋爱全流程",
    title: "INFJ喜欢一个人的反常信号：打压、吃醋与黏人",
    archetype: "反差萌仙人",
    analogy: "高冷的神像走下神坛，笨拙地扯你的衣角、故意摔坏你的玩具",
    coreParadox: "对外人永远客气疏离圣母微笑，偏偏对最爱的人阴阳怪气、挑刺撒娇",
    quote: "一个INFJ爱损你打压你、故意看你吃醋、情绪不稳定、芝麻小事都要分享，说明他爱上你了。",
    cleanedText: "INFJ爱上一个人的标志是'神格碎裂，人味苏醒'：他不再维持从容完美的仙人形象，反而会故意损你、故意试探让你吃醋、情绪患得患失，把最鸡毛蒜皮的无聊小事都发给你。这种失控是他深爱的铁证。",
    actionableAdvice: "看到INFJ在你面前无理取闹或损你，不要生气，宠溺地抱抱他，告诉他'我知道你在乎我'。",
  },
  // 86
  {
    id: "insight_batch3_86",
    sourceIndex: 86,
    types: ["INFJ", "INFP"],
    series: "深度画像与本命天赋",
    title: "IN系女生的双重神迹：顶级共情与灵魂治愈",
    archetype: "空气净化仙子",
    analogy: "人间情绪净化器：你未开口，她已读懂你心中的山河破碎",
    coreParadox: "自身敏感脆弱得像琉璃，却能爆发出抚平世间所有创伤的温润力量",
    quote: "INF女生两大天赋：顶级共情与治愈。独处片刻，哪怕抽象的问题她都能瞬间心领神会。",
    cleanedText: "INFJ与INFP女生拥有天赐的灵性共情：她无需听你长篇大论，只要坐在身边感受气场，便能敏锐捕捉你的委屈与隐痛。她的存在本身就像一味温润的中药，默默抚平焦虑，治愈现代人荒芜的心灵。",
    actionableAdvice: "善待身边的INF女生，保护好她的敏感天线，不要用粗鲁世俗的市侩法则践踏她的灵性。",
  },
  // 87
  {
    id: "insight_batch3_87",
    sourceIndex: 87,
    types: ["INFJ"],
    series: "深度画像与本命天赋",
    title: "INFJ女生的气质底色：素雅初恋与朦胧诗意",
    archetype: "顶级素雅初恋",
    analogy: "水墨画中的留白：不争奇斗艳，自有一股空谷幽兰的清冽",
    coreParadox: "不施粉黛已然动人心魄，无需任何用力过猛的言行，站在那里便是白月光",
    quote: "INFJ女生是当之无愧的顶级初恋：美在素雅，举手投足气质朦胧，无需用力过猛。",
    cleanedText: "INFJ女性的美是一种超越皮囊的朦胧气质之美。她往往不喜浓妆艳抹，衣着素雅从容。其眼神深邃而悲悯，言谈温和而克制，给人一种白月光般可望不可即的初恋宿命感，历久弥新。",
    actionableAdvice: "保持内心的纯净与求知欲，无需随波逐流追赶世俗审美，你的从容本身就是高级美感。",
  },
  // 88
  {
    id: "insight_batch3_88",
    sourceIndex: 88,
    types: ["INFJ"],
    series: "亲密关系与恋爱全流程",
    title: "追INFJ的'看似极简'：极高道德与灵魂共振",
    archetype: "灵魂朝圣者",
    analogy: "攀登绝壁上的圣殿：看似只有一条石阶，阶上却布满了道德与悟性的法阵",
    coreParadox: "嘴上说要求很简单，实则每一条都是极罕见的品质（三观正、有主见、共情强）",
    quote: "追INFJ很简单：三观正、道德高、有主见、心思细腻、共情强、懂口是心非。",
    cleanedText: "追INFJ的门槛看似朴实无华，实则极度筛选品性：你必须有极正的三观底线、尊重他人、心思细腻、能看穿他的口是心非与伪装坚强。任何虚伪轻浮、庸俗自私的行为都会触发他的心门落锁。",
    actionableAdvice: "展现你对弱者的慈悲、对理想的执着与言行一致的人格，用细水长流的真诚叩击他的心门。",
  },
  // 89
  {
    id: "insight_batch3_89",
    sourceIndex: 89,
    types: ["INFJ"],
    series: "商业搞钱与战略破局",
    title: "INFJ的搞钱铁律：道德洁癖与崇高意义感",
    archetype: "道义财富家",
    analogy: "不饮盗泉之水的修行者：金钱若带有一丝血腥肮脏，宁可饥肠辘辘也不染指",
    coreParadox: "不屑于唯利是图的资本游戏，在传递思想、心理治愈或精神赋能中却能财富自溢",
    quote: "INFJ赚钱必须符合道德价值观，损人利己伤天害理的碰都不会碰，意义感高于一切。",
    cleanedText: "INFJ有严重的商业道德洁癖：搞割韭菜、损害环境、伤害小动物的快钱，给他金山银山他也碰都不会碰。他的财富必须建立在'利天下、启民智、疗人心'的崇高意义感之上，做身心自洽的长久功德事业。",
    actionableAdvice: "深耕心理学、哲学写作、艺术创作、非营利公益或高端咨询领域，把精神势能转化为商业价值。",
  },
  // 90
  {
    id: "insight_batch3_90",
    sourceIndex: 90,
    types: ["INFJ"],
    series: "亲密关系与恋爱全流程",
    title: "追INFJ七大核心基石：共鸣、边界与细节真诚",
    archetype: "心锁解密者",
    analogy: "解开千年古墓机关：步步讲究分寸，走错一步全盘封死",
    coreParadox: "最怕无话找话的世俗尬聊，最爱深夜直抵灵魂深处的深沉碰撞",
    quote: "追INFJ只需七点：共鸣、边界、耐心、独立、期待、细节、真诚。前期千万别尬聊吃了没。",
    cleanedText: "搞定INFJ的七字真言：1. 共鸣（杜绝'吃了没睡了没'的废话尬聊，聊宏观哲学与精神追求）；2. 边界（不越界打探，给他独处空间）；3. 耐心（陪他慢慢卸防）；4. 独立（各生欢喜相互独立）；5. 期待（有远大目标）；6. 细节（记住他的微小喜好）；7. 真诚（唯一底色）。",
    actionableAdvice: "前期多以深邃的话题切入，克制过界试探的欲望，用细节展现你的用心与修养。",
  },
];

async function runBatch3() {
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
    console.log(`=== INGESTING BATCH 3 (Entries 41-90, Size: ${batch3Data.length}) ===`);

    // 1. Ensure Series nodes
    const seriesSet = new Set(batch3Data.map((d) => d.series));
    for (const sName of seriesSet) {
      await session.run(
        `MERGE (s:Series {name: $name})
         ON CREATE SET s.createdAt = datetime()
         RETURN s`,
        { name: sName }
      );
    }
    console.log(`Ensured ${seriesSet.size} Series nodes.`);

    // 2. Ingest Insights and Type links
    for (const entry of batch3Data) {
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

      await session.run(
        `MERGE (i:Insight {id: $id})
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
         RETURN i.id`,
        params
      );

      // Connect to associated MBTI Types
      for (const typeCode of entry.types) {
        if (typeCode === "ALL") continue;
        await session.run(
          `MATCH (t:Type {code: $typeCode})
           MATCH (i:Insight {id: $id})
           MERGE (t)-[r:HAS_INSIGHT]->(i)
           ON CREATE SET r.createdAt = datetime()
           RETURN count(r)`,
          { typeCode, id: entry.id }
        );
      }
    }
    console.log(`Ingested ${batch3Data.length} Insight nodes and Type linkages.`);

    // 3. Update Type core properties for ENFJ, ENTJ, ESFJ, ESTJ, ESTP, ESFP
    console.log("Updating Type properties for ENFJ, ENTJ, ESFJ, ESTJ, ESTP, ESFP...");
    await session.run(
      `MATCH (t:Type {code: 'ENFJ'})
       SET t.archetype = '全A数值怪 / 大宝剑 / 价值感播种者',
           t.vividAnalogy = '各领域都能迅速适应的数值怪；赚自我价值与意义感；短期被脆弱吸引，长期需要生命力与雷区看见',
           t.coreParadox = '愿景是平等深爱每一个人，却常被误以为中央空调；无私利他背后是极度渴望被看见与正向反馈',
           t.energyModel = '主导Fe向外链接利他 + 辅助Ni宏观愿景 + 第三Se现实表现力 + 劣势Ti逻辑反思与自我怀疑'`
    );

    await session.run(
      `MATCH (t:Type {code: 'ENTJ'})
       SET t.archetype = '帝国战略家 / 隐藏款纯爱赢王',
           t.vividAnalogy = '一身牛劲的终极打工人；外表开朗内心严苛机器；纯爱战神因为纯爱最省成本最高效率；替你提前挨社会的毒打',
           t.coreParadox = '凡事要求最优最强，最怕一身牛劲无处使被时代淘汰；对外看似无情暴君，对内视承诺为最高守则',
           t.energyModel = '主导Te高效率结果导向 + 辅助Ni远期战略图景 + 第三Se强悍行动力 + 劣势Fi极度深藏的情感软肋'`
    );

    await session.run(
      `MATCH (t:Type {code: 'ESFJ'})
       SET t.archetype = '国泰民安的守护者 / 操心大总管',
           t.vividAnalogy = '女生端庄大气国泰民安，男生儒雅礼貌；初见像I人拘谨，熟络后倾囊照顾',
           t.coreParadox = '用尽一切来为你付出，却在心底委屈呐喊：为什么你不能用我想要的方式来爱我',
           t.energyModel = '主导Fe照顾全场情绪 + 辅助Si恪守传统细节 + 第三Ne偶尔焦虑失控 + 劣势Ti不愿冰冷解构'`
    );

    await session.run(
      `MATCH (t:Type {code: 'ESTJ'})
       SET t.archetype = '秩序捍卫者 / 行动派大家长',
           t.vividAnalogy = '爱做不爱说的硬核长辈；送饭接送上下班买礼物，嘴硬说不出甜言蜜语，全在行动里',
           t.coreParadox = '笃信我是正确的、我是有用的，所以我才值得被爱；用强控制欲来掩饰对失去价值的恐慌',
           t.energyModel = '主导Te现实秩序建立 + 辅助Si稳健落地执行 + 第三Ne警惕外部变数 + 劣势Fi不擅表达温情'`
    );

    await session.run(
      `MATCH (t:Type {code: 'ESTP'})
       SET t.archetype = '大型猎犬 / 资源整合操盘手',
           t.vividAnalogy = '需要天天拉出去遛的大型犬；靠嘴吃饭、钻空子赚差价、拉拢各路高手为我所用的商业鬼才',
           t.coreParadox = '看似玩世不恭浪荡不羁，实则商业嗅觉极其敏锐，在危机和变局中如鱼得水',
           t.energyModel = '主导Se对现实危机敏锐捕捉 + 辅助Ti灵活务实算计 + 第三Fe四海皆兄弟 + 劣势Ni缺乏长期预判'`
    );

    await session.run(
      `MATCH (t:Type {code: 'ESFP'})
       SET t.archetype = '舞台中心巨星 / 极致颜控体验家',
           t.vividAnalogy = '最需要聚光灯的人格；反感抽象理论；谈恋爱极看感觉，长得好看有钱会哄直接沦陷',
           t.coreParadox = '无时无刻不在聚会欢闹，内心却极度害怕孤单与失去关注',
           t.energyModel = '主导Se当下极致感官体验 + 辅助Fi真切情感共鸣 + 第三Te偶尔霸道冲动 + 劣势Ni抗拒长远沉闷推演'`
    );

    // 4. Final DB Stats
    const countRes = await session.run(`
      MATCH (n)
      WITH count(n) AS totalNodes
      MATCH ()-[r]->()
      RETURN totalNodes, count(r) AS totalRels
    `);
    const nodeCount = countRes.records[0].get("totalNodes").toNumber();
    const relCount = countRes.records[0].get("totalRels").toNumber();

    console.log(`\n=== BATCH 3 (50 entries) INGESTION COMPLETE ===`);
    console.log(`Live Neo4j AuraDB Stats: ${nodeCount} Nodes, ${relCount} Relationships.`);
  } finally {
    await session.close();
    await driver.close();
  }
}

runBatch3().catch((err) => {
  console.error("Batch 3 ingestion failed:", err);
  process.exit(1);
});
