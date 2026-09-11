import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import neo4j from "neo4j-driver";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

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

interface Batch1Entry {
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

const batch1Data: Batch1Entry[] = [
  {
    id: "insight_batch1_01",
    sourceIndex: 1,
    types: ["ENFP"],
    series: "深度画像与社交本色",
    title: "快乐小狗的坦诚与纯粹",
    archetype: "快乐小狗",
    analogy: "平时喜欢钻研美食、游戏、发沙雕低质小视频的活宝",
    quote: "一定要和快乐小狗交朋友啊，那没什么坏人的。除了偶尔好色拉你看看帅哥美女，别的没啥毛病了。",
    cleanedText: "一定要和ENFP交朋友啊，那快乐小狗没什么坏人的，就算有，他也坏不到哪去。这人吧，平时就喜欢钻研哪有好吃的，什么游戏好玩，再给你发点沙雕低质小视频，那都是很坦诚善良的。你要非说有什么毛病的话，那可能就是偶尔搞搞颜色了，拉你去看看帅哥美女。除了好色，别的没啥毛病了。",
    actionableAdvice: "跟ENFP相处不要端着，陪他分享好吃的、好玩的或者一起看帅哥美女，就是最舒适的破冰姿态。"
  },
  {
    id: "insight_batch1_02",
    sourceIndex: 2,
    types: ["ENFP"],
    series: "情绪自愈与记忆机制",
    title: "小狗的恢复出厂设置与好哄法则",
    energyMechanism: "忘性大，自带出厂重置机制，负面记忆睡一觉自动清空，只保留快乐记忆",
    quote: "如果你有个小狗对象，哪怕你惹他生气了，他每天早上都会像恢复出厂设置一样重新对你摇尾巴。",
    cleanedText: "ENFP很好哄的，他们睡一觉，那些难过的事就全部都忘掉了。就比如说你给他买个冰淇淋或者带他去寻寻宝，然后说点好话，这一通操作下来，他自己就给自己找台阶下了。小狗的脑子只储存开心的记忆，所有难过负面的睡一觉就自动删除了。真诚鲜活又懂梗，如果你连小狗都谈不明白，那真该回家补课了。",
    actionableAdvice: "惹ENFP生气千万别冷暴力或上逻辑大纲，递个甜筒说两句软话，等他睡一觉自然恢复出厂设置。"
  },
  {
    id: "insight_batch1_03",
    sourceIndex: 3,
    types: ["INFJ", "INTJ"],
    series: "体内阴影灵魂",
    title: "最温柔的羊戴上冷酷面具：INFJ体内的紫老头",
    coreParadox: "最不想伤害别人的绿老头，戴上INTJ面具成了冷酷行刑者",
    quote: "每个INFJ体内都藏了一个INTJ，这是这个荒诞世界敬酒不吃吃罚酒的结果。",
    cleanedText: "每个INFJ的体内都藏了一个INTJ。这是这个荒诞世界敬酒不吃吃罚酒的结果，也是INFJ无法直接到达大同世界时必须走过的苦行僧阶段。当第二功能Fe（外倾情感）在残酷现实中无法把理想连接变成现实时，绿老头就会暂时封存Fe，直接掏出第三功能Ti（内倾思考）。Ni+Ti的组合极其清冷深邃，最善良的羊戴上了冷酷杀手的面具。这层INTJ是他百宝箱中用于极端生存的强力武器。",
    actionableAdvice: "不要被逼到极境的INFJ吓退，看懂他清冷犀利的行刑者面具背后，其实是为了保护那颗对大同世界绝望却又悲悯的初心。"
  },
  {
    id: "insight_batch1_04",
    sourceIndex: 4,
    types: ["INFJ", "ISFJ", "ENFJ", "ESFJ"],
    series: "高阶心性修炼",
    title: "静水流深：高阶FJ人的温柔与慈悲",
    analogy: "像厚重的大地默默接纳落叶，给人一种深沉的安心感",
    quote: "高阶FJ天然已经读懂了你最狼狈的一面，却没有抛弃，依然选择温柔以待。这不是单纯，而是经历过黑暗后的清醒慈悲。",
    cleanedText: "高阶FJ人能一眼看穿那些藏得很深的心事与欲言又止的情绪，却绝不会轻易说破让人难堪，而是小心翼翼地保管安放。在他面前你不用装得光鲜亮丽，因为他早就读懂了你最狼狈的一面却依然温柔以待。相处中感受到的不是博弈与压迫，而是一股深沉的安心。哪怕只能走一段路，他也会默默退场、轻轻告别，如同大地接纳落叶一样拎得清、守得住。",
    actionableAdvice: "在成熟的FJ面前卸下防备吧，你的脆弱不会成为他要挟你的筹码，他用看透人性下限后的宽厚在为你托底。"
  },
  {
    id: "insight_batch1_05",
    sourceIndex: 5,
    types: ["INFJ", "ISFJ"],
    series: "误测与形态代偿",
    title: "身体在自救：INFJ测成ISFJ是生存保护模式",
    coreParadox: "用Si的具体秩序感阻断Ni的无限精神内耗，扎根土地不妨碍仰望星空",
    quote: "INFJ测成ISFJ是好事，代表你的身体正在自救，把无能为力的N值转化为有所作为的S值。",
    cleanedText: "INFJ测成ISFJ其实是好事，代表成长了，也是身体在开启生存保护模式。年幼的绿老头看到父母争吵痛苦万分却无能为力，就会开始疯狂拖地、做家务、写作业，这就是把悬空的N降维成具体的S。成年后遇到无法解决的卡点，白天开启ISFJ模式收拾房间、列清单、看老剧，用Si的具象秩序切断大脑死机前Ni的精神内耗。翻旧账是ISFJ，分析痛苦模式是INFJ；困于具体人事是ISFJ，困于人类劣根性是INFJ。扎根现实的大地，丝毫不妨碍翅膀向往星空。",
    actionableAdvice: "当Ni精神空转要坠入深渊时，立刻切换为ISFJ模式：洗碗、扫地、叠衣服、做顿饭，让具体的物理动作把你拉回人间。"
  },
  {
    id: "insight_batch1_06",
    sourceIndex: 6,
    types: ["INFJ"],
    series: "亲密关系与恋爱真相",
    title: "恋爱警钟：你爱的是INFJ还是一个全能工具箱？",
    quote: "所有找INFJ谈恋爱的各打50大板！你哪是爱他啊，你分明爱的是一个工具包、百宝箱和倾听师而已。",
    cleanedText: "所有找INFJ谈恋爱的都得各打50大板！别以为我不知道你在想什么，你无非是看中INFJ特别能照顾人、温柔隐忍又没有意见，想把他搞定来滋养自己。你爱的是一个好用的工具包，还是一个活生生的人？请扪心自问：他真正喜欢吃什么？他真正想玩什么？他上次哭是什么时候？如果你连他的脆弱和需求都从未在意，就别标榜自己有多深情。",
    actionableAdvice: "追求INFJ最好的方式是反客为主：不要让他伺候你，主动去发现他的喜好，在他习惯戴着面具照顾全场时，递给他一杯热茶问一句‘你累不累’。"
  },
  {
    id: "insight_batch1_07",
    sourceIndex: 7,
    types: ["INFJ"],
    series: "社交防御与面具哲学",
    title: "绿老头的终极悲观：深信没人会爱摘下面具的自己",
    coreParadox: "戴面具迎合所有人，内心深信真实自我暴露之日就是关系破裂之时",
    quote: "INFJ不觉得有人会喜欢真实的自己，他认为对方只是喜欢自己扮演的面具，一旦面具拿开大家就会四散逃开。",
    cleanedText: "INFJ从不认为有人会喜欢真实的自己，他认定外界喜欢的只是他当下扮演的温柔面具，一旦面具揭开外界就会抱有恶意四散逃开。绿老头对人性的揣测就是这么悲观。所以他极难约出来，因为每天维持面具耗电极大，必须靠海量独处来排毒。他甚至预判了发生在自己身上的每段感情都会随着面具褪去而走向终结。",
    actionableAdvice: "给INFJ充分的独处电量，不要逼他一直保持体贴周到，明确告诉他：‘你可以在我面前发脾气、有缺点，我不走。’"
  },
  {
    id: "insight_batch1_08",
    sourceIndex: 8,
    types: ["INFP"],
    series: "深度画像与内心世界",
    title: "生活不看直播看回放：小蝴蝶的逐帧慢放世界",
    analogy: "生活不是现场直播，而是独自躲在房间里逐帧慢放的回放录像",
    quote: "INFP现实中甚至不敢主动打招呼，是因为害怕自作多情。相比现实直播，他更喜欢在回忆的逐帧慢放里享受没有压力的自由。",
    cleanedText: "早期的INFP网上很嗨熟人很颠，现实见面甚至不敢主动打招呼，因为只要对方没有表现出足够的热情与重视，他就极度恐惧袒露导致的自作多情。多多少少都有过交浅言深的惨痛教训。如果生活是一场直播，INFP不看直播，他只爱看回放，还要逐帧慢放，在脑补的安全空白中释放情感。一旦建立真正的深度契合，他就必须深度绑定，粘在对方身上成为人形挂件。",
    actionableAdvice: "对待INFP要给出毫不含糊的高浓度确定性，回应要迅速，不要让他陷入‘我是不是又自作多情’的自我否定深渊。"
  },
  {
    id: "insight_batch1_09",
    sourceIndex: 9,
    types: ["INFP"],
    series: "高敏防御与晴雨表",
    title: "人间最后一抹善良：看懂小蝴蝶的抽象与紧锁心门",
    archetype: "小蝴蝶 / 白日梦想家",
    quote: "身边的很多小蝴蝶看起来很颠很抽象，其实极为敏锐。他不合群不是情商低，是因为他看透了人性的下限与虚伪，只是不愿同流合污。",
    cleanedText: "INFP能平安长大真得谢天谢地。网上很多抽象发疯的博主其实都是INFP。他看似清高不合群，其实情商极高，什么阿谀奉承心里门清，只是不屑于去做。之所以心门紧闭，是因为深知世界丑恶且受过多次伤害。判断他的状态很简单：只要他话很多秒回消息，就是状态满格；一旦话变少、有心事，就说明防线已经收紧。请珍惜小蝴蝶，他们是现实世界最后的善良净土。",
    actionableAdvice: "当小蝴蝶突然变得沉默寡言时，不要逼他解释，默默陪在身边递一根烤肠或一杯奶茶，主动跨出那一步拉住他。"
  },
  {
    id: "insight_batch1_10",
    sourceIndex: 10,
    types: ["INFP"],
    series: "亲密关系与恋爱真相",
    title: "温柔陷阱与藤蔓占有欲：披着舔狗外衣的驯狗人",
    analogy: "如同贴身爬满躯体的柔软藤蔓，看似温顺却在不知不觉中收紧",
    quote: "和INFP处对象你以为遇到了迷路小绵羊，其实正一步步走进温柔陷阱。很多INFP自嘲是舔狗，其实是披着舔狗外衣的驯狗人。",
    cleanedText: "和INFP恋爱像走进温柔陷阱。他渴望‘随叫随到’来获取确定安全感，但又‘不能天天连体’，因为共处一室会逼迫他的Fi不断观察你而无法自我清理。小蝴蝶有股阴湿的藤蔓式占有欲，贴合着你的弧度生长并随时收紧。他早期常通过主动示弱和自我否定来‘钓鱼’，激发你的拯救欲，把你驯化成离不开他的伴侣。在茧化成蝶前不要强行掰开他的保护壳，尊重他的花期。",
    actionableAdvice: "既要在关键时刻随叫随到给予秒回的偏爱，又要给他留出独立发呆的私人洞穴，切忌用爹味说教强行掰开他的成长茧房。"
  },
  {
    id: "insight_batch1_11",
    sourceIndex: 11,
    types: ["INFP"],
    series: "核心矛盾与心理拉扯",
    title: "INFP放鸽子真相：在迁就别人与内心折磨中的终极磨蹭",
    coreParadox: "答应时真心想让你开心，真要做时因违背内心意愿在磨蹭中痛苦折磨至死",
    quote: "INFP放鸽子真不是人品坏。答应时是为了让你开心，临近时极度抗拒内耗又怕伤害你，磨蹭拖延到最后一刻才崩溃弃权。",
    cleanedText: "INFP放鸽子背后是极度痛苦的心路历程：他答应你的时候往往是为了让你开心迁就你，而不是自己真想去。随着时间临近，内心抗拒不断翻涌，但又极其害怕伤害你，于是在去与不去之间反复折磨、磨蹭拖延。直到最后一刻实在承受不住了，才怯生生发一句‘我今天去不了了’。他答应是真的答应，鸽你也是真的痛苦。解决之道是做决定时多关注他的真实意愿，主动告诉他不用迁就任何人。",
    actionableAdvice: "邀请INFP时一定要补一句：‘不想去完全没关系，千万别为了迁就我勉强自己’，解除他的道德负罪感，他反而更愿意赴约。"
  },
  {
    id: "insight_batch1_12",
    sourceIndex: 12,
    types: ["INTJ", "INFP"],
    series: "体内阴影灵魂",
    title: "冷酷杀手体内住着小蝴蝶：INTJ的Fi儿童暴走",
    archetype: "紫老头 / 冷酷杀手",
    coreParadox: "坚硬外壳包裹脆弱灵魂，你退一步我就后退一万步",
    quote: "每个INTJ体内都藏了一个INFP，坚硬盔甲里住了个柔软小孩。一旦陷入深爱，就像冷酷杀手突然追求最深刻纯粹的理想爱情。",
    cleanedText: "每个INTJ体内都藏着一个INFP。在遇到真正的爱情时，第一二功能（Ni/Te）全面失效，平时被压抑的第三位功能Fi（内倾情感）被突然推到聚光灯下。此时的紫老头就像一个冷酷杀手突然变成追求意义与纯粹情感共鸣的诗人。但他对脆弱的输出方式是用厚墙包裹的：你敢退后一步试探，他就立刻后退一万步防卫，表现得比谁都绝情冷漠。",
    actionableAdvice: "不要用忽冷忽热来试探INTJ，他的安全感容错率极低；只有以坚定不移的明牌真诚，才能唤醒他盔甲里熟睡的纯真小蝴蝶。"
  },
  {
    id: "insight_batch1_13",
    sourceIndex: 13,
    types: ["INTJ"],
    series: "深度画像与情绪真相",
    title: "隐藏款高敏感人格：用超强执行力压抑感性失控",
    energyMechanism: "害怕感性失控引发崩溃，通过开启超强执行力让自己无敌忙碌以规避情绪",
    quote: "要想真正看懂一个建筑师，不要看他有多强大高冷，而要看懂他的崩溃、弱小与无处安放的感性。",
    cleanedText: "INTJ其实是隐藏款的高敏感人格，他不仅有感性，甚至波涛汹涌，只是他把感性视为‘容易引发系统失控与崩溃的危险物’，强行给自己洗脑其不重要。为此他启动超强执行力，把自己塞进无敌忙碌、绝对正确的精密轨道中，以此屏蔽情绪干扰。看懂一个INTJ的最高段位，不是赞美他的战略远见，而是读懂他强大盔甲背后的脆弱与感性恐惧。",
    actionableAdvice: "当INTJ进入疯狂连轴转的狂暴工作模式时，往往是他内心有某种情绪卡点无法消化，递杯咖啡安静陪伴即可，别强行逼他掏心窝。"
  },
  {
    id: "insight_batch1_14",
    sourceIndex: 14,
    types: ["INTJ"],
    series: "核心矛盾与心理拉扯",
    title: "终极撕裂：想听从内心的紫老头，却被迫听从外界当一把手",
    coreParadox: "很想听从内心搞纯粹偏门研究，动作上却被迫听从外界投产比创业掌舵",
    quote: "哪个INTJ不想当个清闲的二把手？要是真给紫老头解绑了，他宁可去做不赚钱但感兴趣的人文哲学，当一把手往往是迫不得已走到这步。",
    cleanedText: "INTJ最大的矛盾是极度渴望听从内心愿不愿意，动作却变成听从外界应不应该。如果真正给紫老头松绑，他最想做的是重回大学、钻研冷门理论、研究不赚钱的人文哲学。但现实中他们往往去创业、当一把手掌舵，这其实是对环境愚蠢与低效忍无可忍之后的迫不得已。外界只讲投产比和效益，他在世俗规则里算无遗策，内心却始终渴望一场不计成本的纯粹奔赴。",
    actionableAdvice: "认可INTJ在世俗战场上的战功，但在私下里，多陪他聊聊那些‘不赚钱、无商业价值却很有意思’的宇宙哲学与冷门学问。"
  },
  {
    id: "insight_batch1_15",
    sourceIndex: 15,
    types: ["INTJ"],
    series: "深度画像与本命天赋",
    title: "清冷月光与一眼顿悟：Ni英雄功能的透支代价",
    analogy: "朦胧清冷的月光，神秘清寂却让人极度上头",
    quote: "英雄功能Ni让他一眼看穿事物本质，但看得过远也让他提前活在未来的沙盘中，预知未来从来都是要付出代价的。",
    cleanedText: "INTJ的气质如同洒在身上的朦胧月光，清冷神秘且极度吸人。I人的深邃灵魂搭配TJ的理性规划，让他有着无可撼动的主见与倔强。英雄功能Ni（内倾直觉）赋予了他‘一眼看穿本质’的顿悟超能力，因而灵魂显得格外苍老沉稳。然而，看得太远导致他常年活在未来布局中而透支了感受当下的能力，为了预知未来的沙盘付出了巨大的精神代价值。",
    actionableAdvice: "把INTJ从遥远的未来沙盘拉回当下的一餐一饮：带他去吹吹风、散散步，提醒他‘未来的事未来再算，先吃眼前这口肉’。"
  },
  {
    id: "insight_batch1_16",
    sourceIndex: 16,
    types: ["INTP", "INFP"],
    series: "双型对照与平衡",
    title: "药水 vs 小蝴蝶：理性极致人机化 vs 感性极致不接地气",
    archetype: "药水 (INTP) & 小蝴蝶 (INFP)",
    quote: "千算万算不如药水来算；唯有在开心的人面前，你才能看到鲜活的小蝴蝶。过于理性导致人机化，过于感性导致脱离现实。",
    cleanedText: "INTP理性至上，超能力是无敌脑力，对感兴趣的硬核文献能一晚从小白到精通，是全天下最顶级的军师；INFP感觉至上，只要符合内心价值观便坚定一条路走到黑。然而两者的陷阱同样致命：INTP过度沉迷理论逻辑而忽略人际温情，容易退化为冷冰冰的‘人机’；INFP过度看重情绪感觉而缺乏现实支点，容易悬浮不落地。两者的终极课题都是在理智与灵性间寻找平衡。",
    actionableAdvice: "INTP需要学会在逻辑之外看见具体的人，INFP需要借助客观规律把漫无边际的灵感落到世俗载体上。"
  },
  {
    id: "insight_batch1_17",
    sourceIndex: 17,
    types: ["INTP"],
    series: "生活化特质与真实日常",
    title: "你们都被药水骗了：深夜头脑风暴到凌晨三点的假睡狂人",
    energyMechanism: "睡前刷手机一秒上头，好奇心触发深夜脑力风暴，越刷越精神",
    quote: "别信INTP口中的‘睡觉’，他躺下是开始刷猎奇知识，直到凌晨三点还会坚信‘深夜才是我脑子转得最快的时刻’。",
    cleanedText: "你们都被INTP骗了！他口中的上床休息其实是躺在床上刷冷门奇葩知识，别人刷手机越刷越困，药水看到感兴趣的论点大脑一秒上头，头脑风暴直接飚到凌晨两三点，直到好奇心全部被满足才心满意足入睡。第二天顶着两个超大黑眼圈，你说他熬夜，他还会无辜反驳‘我明明十点就躺下了怎么会累’。对知识的成瘾性饥渴是他的本能。",
    actionableAdvice: "别在深夜发给INTP有深度争议的话题或冷门文献，否则他会兴奋得彻夜不眠跟你论战到天亮。"
  },
  {
    id: "insight_batch1_18",
    sourceIndex: 18,
    types: ["INTP"],
    series: "深度画像与社交处世",
    title: "折耳根与野生菌：不端不装、人人平等的硬核浪漫",
    archetype: "折耳根 / 野生菌",
    analogy: "像折耳根爱的人当宝恨的人想逃；像深山野生菌古怪难找却是山珍海味",
    quote: "跟药水打交道难受且实在。他说话难听不是针对你，是他对所有人一律平等不双标；不看你身份地位，只看讲话有没有道理。",
    cleanedText: "INTP就像折耳根，爱他的人当宝，恨他的人想逃；也像深山野生菌，再怪再难找也是山珍海味的命。他从不屑于做人人都爱的交际花，跟药水相处难受但极度实在。人前人后一个样，绝不双标。聊天时不看你身价地位，只看讲话有无逻辑与价值。包容所有极其小众稀奇古怪的想法，也绝不强行改造你。在他面前你不需要端着演戏，做真实自己就够了。",
    actionableAdvice: "与INTP沟通请直接摆证据讲道理，收起官僚腔与虚伪客套，只要你的逻辑站得住脚，他会是全世界最包容你的倾听者。"
  },
  {
    id: "insight_batch1_19",
    sourceIndex: 19,
    types: ["INTP"],
    series: "耗能机制与相处法则",
    title: "飞速旋转的陀螺与体能救赎：怎么正确约药水出门？",
    energyMechanism: "脑子是停不下来的高耗蓝陀螺，需要高刺激户外运动（徒步/攀岩）将大脑带出空转",
    quote: "别再说药水宅、体质差约不出来了，那是你姿势不对！核心是勾出他的好奇心，带他去没看过的风景，脑子跟着你走身体自然跟着走。",
    cleanedText: "INTP的脑子是一个飞速旋转的高速陀螺，一旦运转停不下来，极度耗蓝，导致他常常一天啥也没干就感觉疲惫不堪。外界常误以为他体质弱、不爱运动，其实大错特错！只要能勾起他的好奇心，哪怕是徒步、攀岩、潜水这类高强度运动，他也会像个活力E人一样积极打卡。核心是带他去没探索过的秘境，大脑被好奇心驱动，身体自然如影随形。",
    actionableAdvice: "约INTP千万别去逛街或无效社交饭局；丢给他一个从未去过的荒野徒步路线或科技展，他立马收拾背包跟你走。"
  },
  {
    id: "insight_batch1_20",
    sourceIndex: 20,
    types: ["ISFP"],
    series: "深度画像与治愈力量",
    title: "江湖的解药：猫系人类小画家与一整片温柔的海",
    archetype: "小画家 / 猫系人类",
    analogy: "一只慵懒散步在墙头的猫，靠近他就靠近了可爱，靠近了整片温柔的海",
    quote: "每个人都该交一个小画家朋友！在浮躁江湖里终于有一块地方可以卸下所有防备，不评价、不审判、不要求，晒太阳看云听风就很爽。",
    cleanedText: "每个人都该交一个小画家朋友！和他在一起你不用找话题热场子，也不用证明自己多有趣，单纯坐着晒太阳看云听风，就能感受到久违的松弛。他不会辩论上课，只会安静听你说。他的特异功能是经常走神但绝不让你的话掉在地上，听完十分钟就忘所以最能保守秘密。他是猫系人类，慵懒执拗、不争不抢。不评价、不审判，你疯时陪你抽象，你难过时无声陪伴。",
    actionableAdvice: "累了倦了就去找ISFP待一下午，买两杯果汁坐在公园长椅上放空看落日，那是全宇宙最强的心灵吸尘器。"
  }
];

async function main() {
  loadEnv();
  const uri = process.env.NEO4J_URI;
  const username = process.env.NEO4J_USERNAME || "neo4j";
  const password = process.env.NEO4J_PASSWORD;

  console.log("\n========================================================");
  console.log("🚀 执行 Batch 1 知识图谱精读入库 (第 1 - 20 条)...");
  console.log("========================================================\n");

  if (!uri || !password) {
    console.error("❌ 未检测到 Neo4j 环境变量");
    process.exit(1);
  }

  const driver = neo4j.driver(uri, neo4j.auth.basic(username, password));
  const session = driver.session();

  try {
    console.log("🔒 1. 确保 Series 和 Insight 节点的唯一性索引...");
    await session.run("CREATE CONSTRAINT series_name_unique IF NOT EXISTS FOR (s:Series) REQUIRE s.name IS UNIQUE;");
    await session.run("CREATE CONSTRAINT insight_id_unique IF NOT EXISTS FOR (ins:Insight) REQUIRE ins.id IS UNIQUE;");
    console.log("✅ 索引准备完毕。\n");

    console.log("📝 2. 创建 8 大 Series 专题节点...");
    const seriesList = [
      { name: "深度画像与社交本色", code: "PORTRAIT_SOCIAL" },
      { name: "情绪自愈与记忆机制", code: "HEALING_MEMORY" },
      { name: "体内阴影灵魂", code: "INNER_SHADOW" },
      { name: "高阶心性修炼", code: "HIGH_ORDER_GROWTH" },
      { name: "误测与形态代偿", code: "MISTYPE_RESCUE" },
      { name: "亲密关系与恋爱真相", code: "RELATIONSHIP_TRUTH" },
      { name: "核心矛盾与心理拉扯", code: "CORE_PARADOX" },
      { name: "耗能机制与相处法则", code: "ENERGY_MECHANISM" },
    ];

    for (const s of seriesList) {
      await session.run(`
        MERGE (s:Series {name: $name})
        SET s.code = $code
      `, s);
    }
    console.log("✅ Series 专题分类就绪。\n");

    console.log("🌟 3. 增强重点 Type 节点的江湖人设与核心矛盾...");
    const typeEnrichments = [
      {
        code: "ENFP",
        archetype: "快乐小狗",
        vividAnalogy: "平时喜欢吃喝玩乐发沙雕视频，实则是场域敏感度第一的雷达",
        energyModel: "自带出厂设置重置，睡一觉负面记忆自动清空，好吃的和软话就能给台阶下"
      },
      {
        code: "INFJ",
        archetype: "千年吸血鬼 / 五星酒店服务员",
        coreParadox: "深信没人会爱摘下面具的自己；善解人意到让人后怕，独处是保护色",
        vividAnalogy: "像活了几千年的吸血鬼，能替人说完卡壳的下半句话",
        energyModel: "戴面具耗能巨大需海量独处；大脑死机前化身ISFJ做家务打扫开启生存保护"
      },
      {
        code: "INFP",
        archetype: "小蝴蝶 / 白日梦想家",
        coreParadox: "放鸽子是因为答应时想让你开心，临近时抗拒内耗磨蹭；想随叫随到又不能天天连体",
        vividAnalogy: "生活不看现场直播，爱看回忆回放并逐帧慢放；披着舔狗外衣的驯狗人，阴湿藤蔓占有欲",
        energyModel: "Fi内倾情感翻涌需独立空间排毒；话多是晴雨表，话少即心门紧闭"
      },
      {
        code: "INTJ",
        archetype: "紫老头 / 冷酷杀手",
        coreParadox: "很想听从内心搞纯粹偏门哲学研究，动作上却被迫听从外界投产比去创业当一把手",
        vividAnalogy: "坚硬盔甲里住了个柔软小孩，爱情中一二位失效第三位Fi暴走；你退一步我退一万步",
        energyModel: "隐藏款高敏人格，用超强执行力压抑感性崩溃；Ni一眼看透本质提前透支当下"
      },
      {
        code: "INTP",
        archetype: "折耳根 / 野生菌 / 药水",
        coreParadox: "过于分析理论忽略人机化；大晚上头脑风暴到凌晨三点第二天顶大眼袋",
        vividAnalogy: "像折耳根爱的人当宝恨的人想逃；说话难听但人人平等不双标，只讲道理不看地位",
        energyModel: "脑子是飞速旋转的停不下来的高耗蓝陀螺；需通过攀岩徒步等好奇心运动把脑子带出空转"
      },
      {
        code: "ISFP",
        archetype: "小画家 / 猫系人类",
        coreParadox: "走神却能接住话，听完十分钟就忘最能保密；坚持执拗但不争不抢",
        vividAnalogy: "浮躁江湖的解药，像一只慵懒的猫；不评价不审判，靠近他就靠近了温柔的海",
        energyModel: "松弛放空、晒太阳看云听风即可回满血"
      }
    ];

    for (const t of typeEnrichments) {
      await session.run(`
        MATCH (t:Type {code: $code})
        SET t.archetype = $archetype,
            t.vividAnalogy = $vividAnalogy,
            t.energyModel = $energyModel
        WITH t
        WHERE $coreParadox IS NOT NULL
        SET t.coreParadox = $coreParadox
      `, {
        code: t.code,
        archetype: t.archetype || null,
        vividAnalogy: t.vividAnalogy || null,
        energyModel: t.energyModel || null,
        coreParadox: t.coreParadox || null,
      });
    }
    console.log("✅ Type 核心人设与动力学机制更新完毕。\n");

    console.log("🔗 4. 构建跨类型关系 (误测自救 & 体内阴影)...");
    // INFJ -[:MISTYPES_AS]-> ISFJ
    await session.run(`
      MATCH (infj:Type {code: "INFJ"}), (isfj:Type {code: "ISFJ"})
      MERGE (infj)-[r:MISTYPES_AS]->(isfj)
      SET r.trigger = "童年家庭争吵或现实无能为力感",
          r.mechanism = "将无力感N转化为具体行动S(写作业/拖地/做家务/列清单)",
          r.selfRescueReason = "大脑死机前强行开启生存保护模式，用Si的具体秩序感阻断Ni的无限精神内耗",
          r.distinction = "回忆翻旧账(ISFJ) vs 分析痛苦模式(INFJ)；困于具象人事(ISFJ) vs 困于人类共同劣根性(INFJ)",
          r.healthyInsight = "绿老头向天延伸翅膀，小护士向下扎根土地；反复横跳代表成长与自救"
    `);

    // INTJ -[:HARBORS_INNER]-> INFP
    await session.run(`
      MATCH (intj:Type {code: "INTJ"}), (infp:Type {code: "INFP"})
      MERGE (intj)-[r:HARBORS_INNER]->(infp)
      SET r.condition = "陷入深爱或极端危机，导致一二位功能(Ni/Te)失效",
          r.triggeredFunction = "Fi (第三位儿童功能)",
          r.manifestation = "冷酷杀手瞬间变成追求深刻意义与纯粹情感共鸣的小孩",
          r.vulnerabilityDefense = "敏感脆弱包裹在厚墙里——你退后一步试探，我就后退一万步绝情"
    `);

    // INFJ -[:HARBORS_INNER]-> INTJ
    await session.run(`
      MATCH (infj:Type {code: "INFJ"}), (intj:Type {code: "INTJ"})
      MERGE (infj)-[r:HARBORS_INNER]->(intj)
      SET r.condition = "荒诞世界敬酒不吃吃罚酒，极端生存危机",
          r.triggeredFunction = "Ti (第三位内倾思考，Ni+Ti闭环)",
          r.manifestation = "最善良的羊戴上冷酷面具化身行刑者，清冷果决且极度犀利",
          r.role = "绿老头百宝箱中用于极端生存的强力武器"
    `);
    console.log("✅ 误测自救与双重人格关系构建完毕。\n");

    console.log("💡 5. 写入 Batch 1 详细 Insight 节点与多向关联...");
    for (const item of batch1Data) {
      // Create Insight Node
      await session.run(`
        MERGE (ins:Insight {id: $id})
        SET ins.sourceIndex = $sourceIndex,
            ins.title = $title,
            ins.quote = $quote,
            ins.cleanedText = $cleanedText,
            ins.actionableAdvice = $actionableAdvice,
            ins.archetype = $archetype,
            ins.analogy = $analogy,
            ins.coreParadox = $coreParadox,
            ins.energyMechanism = $energyMechanism
      `, {
        id: item.id,
        sourceIndex: item.sourceIndex,
        title: item.title,
        quote: item.quote,
        cleanedText: item.cleanedText,
        actionableAdvice: item.actionableAdvice,
        archetype: item.archetype || null,
        analogy: item.analogy || null,
        coreParadox: item.coreParadox || null,
        energyMechanism: item.energyMechanism || null,
      });

      // Link to Series
      await session.run(`
        MATCH (ins:Insight {id: $id}), (s:Series {name: $series})
        MERGE (ins)-[:IN_SERIES]->(s)
      `, { id: item.id, series: item.series });

      // Link to Types
      for (const tCode of item.types) {
        await session.run(`
          MATCH (ins:Insight {id: $id}), (t:Type {code: $tCode})
          MERGE (t)-[:HAS_INSIGHT]->(ins)
        `, { id: item.id, tCode });
      }
    }
    console.log(`✅ 20 条精读 Insight 节点与关联全部写入完毕！\n`);

    // Verify Counts
    const statsResult = await session.run(`
      MATCH (n)
      WITH count(n) AS nodeCount
      MATCH ()-[r]->()
      RETURN nodeCount, count(r) AS relCount
    `);
    const rec = statsResult.records[0];
    console.log("📊 最新知识图谱规模统计：");
    console.log(`   - 实体节点数 (Nodes): ${rec.get("nodeCount")}`);
    console.log(`   - 关联关系数 (Relationships): ${rec.get("relCount")}\n`);

  } finally {
    await session.close();
    await driver.close();
  }
}

main().catch(console.error);
