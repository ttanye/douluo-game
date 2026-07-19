// 统一事件池 — 所有事件带等级门控、触发条件、解锁效果
// 事件按等级区间组织，由 progress store 动态筛选

import { hasMet, isAlliedWith, isEnemyOf } from './conditions'
import { adjustCombatWeights } from '../utils/combatPower'
import { CANON_NPC, getNPCpower } from './npcPower'

/** 战力→魂环年限概率 + 魂骨掉落 */
function buildRingOptions(state, ringNum, beasts) {
  const power = state.combatPower || (state.level || 1) * 10
  const highBonus = Math.floor(power / 80)
  
  return beasts.map((b, i) => {
    let rarity = 'B'
    let weight = 30
    let colorName = b.color
    // 自动推断更细粒度的颜色名
    if (b.year >= 1000000 || b.color === '百万年' || b.color === '神级') { rarity = 'SSS'; weight = Math.max(1, Math.min(30, highBonus - 8)); colorName = b.color || '百万年' }
    else if (b.year >= 100000) { rarity = 'SS';  weight = Math.max(2, highBonus - 4); colorName = '十万年' }
    else if (b.year >= 50000)  { rarity = 'S';   weight = Math.max(3, highBonus - 2); colorName = '五万年' }
    else if (b.year >= 10000)  { rarity = 'A';   weight = Math.max(5, highBonus); colorName = '万年' }
    else if (b.year >= 5000)   { rarity = 'A';   weight = 20 - highBonus; colorName = '五千年' }
    else if (b.year >= 1000)   { rarity = 'B';   weight = 30 - highBonus; colorName = '千年' }
    else if (b.year >= 500)    { rarity = 'B';   weight = 35; colorName = '百年' }
    else if (b.year >= 100)    { rarity = 'C';   weight = 30; colorName = '百年' }
    else                       { rarity = 'C';   weight = 25; colorName = '十年' }
    
    // 魂骨掉落概率（年份越高越容易出）
    const boneChance = b.year >= 1000000 ? 0.40 : b.year >= 100000 ? 0.25 : b.year >= 10000 ? 0.15 : b.year >= 1000 ? 0.08 : b.year >= 100 ? 0.03 : 0.01
    const hasBone = Math.random() < boneChance
    const slots = ['head', 'rightArm', 'leftArm', 'torso', 'rightLeg', 'leftLeg']
    const soulBone = hasBone ? { slot: slots[Math.floor(Math.random() * slots.length)], beast: b.beast, year: b.year, skill: `${b.skill}·骨`, rarity } : null
    
    return {
      label: `${colorName}·${b.beast}`, icon: b.icon, rarity, weight: Math.max(1, Math.floor(weight)),
      levelBoost: ringNum,
      soulRing: { year: b.year, colorName, colorHex: b.hex, beast: b.beast, skill: b.skill },
      soulBone,
    }
  })
}

/**
 * 事件池条目格式：
 * {
 *   id: string,           // 唯一ID
 *   title: string,        // 标题
 *   icon: string,         // 图标
 *   minLevel: number,     // 最低等级
 *   maxLevel: number,     // 最高等级(可选，100=无上限)
 *   rarity: string,       // 事件稀有度(影响出现概率)
 *   requiredEvents: [],   // 前置事件ID(可选)
 *   excludedEvents: [],   // 互斥事件ID(可选)
 *   unlocksOnSelect: [],  // 选择后解锁的事件ID(可选)
 *   // --- 原有步骤配置 ---
 *   prelude: string,
 *   resultTemplate: string?,
 *   suffixes: {},
 *   computeOptions: (state) => [{ label, icon, rarity, weight, soulRing?, soulBone?, levelBoost?, worldImpact?, unlocks? }],
 * }
 */

export const EVENT_POOL_PART2 = [
  // ==================== 新增 Lv.71-90: 封号之路 ====================
  {
    id: 'douluoTower', title: '封号试炼塔', icon: '🗼', minLevel: 73, maxLevel: 88, rarity: 'SS', enemyPower: 2800,
    prelude: '封号斗罗试炼塔——九层宝塔，每层都有陨落封号斗罗留下的残魂考验。登顶者得封号！命运之轮，请转动——',
    computeOptions(state) {
      return [
        { label: '九层登顶·残魂赐福！！', icon: '🏆', rarity: 'SSS', weight: 6, levelBoost: 10 },
        { label: '通过七层·获得认可',     icon: '⬆️', rarity: 'SS', weight: 20, levelBoost: 6 },
        { label: '通过五层·小有所成',     icon: '📊', rarity: 'A', weight: 30, levelBoost: 4 },
        { label: '三层止步·但收获颇丰',   icon: '🛑', rarity: 'B', weight: 24, levelBoost: 2 },
        { label: '第一层就失败了·但不气馁', icon: '💪', rarity: 'C', weight: 20 },
      ]
    },
  },
  {
    id: 'seaReturn', title: '海神归来', icon: '🌊', minLevel: 75, maxLevel: 90, rarity: 'SSS',
    requiredEvents: ['seaGodTrial'],
    prelude: '海神岛的历练让你脱胎换骨！现在，你的归来将改变大陆的战局——大陆上的朋友们还不知道你已经变得如此强大。命运之轮，请转动——',
    computeOptions(state) {
      return [
        { label: '以海神之力扭转战局！！', icon: '🔱', rarity: 'SSS', weight: 10, levelBoost: 8, worldImpact: { tangSan: { affinity: 30 }, biBiDong: { affinity: -40 } } },
        { label: '秘密部署·一击制胜',     icon: '🎯', rarity: 'SS', weight: 22, levelBoost: 6 },
        { label: '召集旧部·重新组建力量', icon: '🤝', rarity: 'S', weight: 28, levelBoost: 4 },
        { label: '低调行事·暗中介入',     icon: '🕶️', rarity: 'A', weight: 25, levelBoost: 2 },
        { label: '发现大陆已面目全非',     icon: '😔', rarity: 'B', weight: 15 },
      ]
    },
  },
  {
    id: 'godOmen', title: '神位预兆', icon: '🌠', minLevel: 78, maxLevel: 93, rarity: 'SSS',
    prelude: '你开始频繁地做梦——梦中你站在云端，俯视着整个斗罗大陆。一个声音在呼唤你……神界的召唤越来越清晰！命运之轮，请转动——',
    computeOptions(state) {
      return [
        { label: '清晰感应到神位召唤！！', icon: '🔮', rarity: 'SSS', weight: 10, levelBoost: 6, unlocks: ['godPath'] },
        { label: '获得神界的碎片信息',     icon: '🧩', rarity: 'SS', weight: 22, levelBoost: 4 },
        { label: '梦中遇到一位神祇',       icon: '💭', rarity: 'S', weight: 30, levelBoost: 3 },
        { label: '梦很模糊·但心中有感',   icon: '🌫️', rarity: 'A', weight: 23, levelBoost: 1 },
        { label: '噩梦连连·魂力不稳',     icon: '😰', rarity: 'B', weight: 15 },
      ]
    },
  },
  {
    id: 'lastTraitor', title: '最后的叛徒', icon: '🐍', minLevel: 76, maxLevel: 90, rarity: 'S', enemyPower: 10000,
    prelude: '你的阵营中出现了一个叛徒！机密情报不断外泄，而所有的线索都指向了你最信任的人之一……命运之轮，请转动——',
    computeOptions(state) {
      return [
        { label: '智破叛徒·反间计成功！！', icon: '🧠', rarity: 'SSS', weight: 10, levelBoost: 5, worldImpact: { traitor: { exposed: true } } },
        { label: '设局抓捕·清除内鬼',       icon: '🪤', rarity: 'SS', weight: 25, levelBoost: 4 },
        { label: '将计就计·利用假情报',     icon: '🎭', rarity: 'S', weight: 28, levelBoost: 3 },
        { label: '信任的人果然是叛徒',       icon: '💔', rarity: 'A', weight: 22, levelBoost: 2 },
        { label: '冤枉了好人·但真凶暴露',   icon: '😔', rarity: 'B', weight: 15 },
      ]
    },
  },
  {
    id: 'nearDeath', title: '九死一生', icon: '💀', minLevel: 77, maxLevel: 92, rarity: 'SS',
    enemyPower: 30000,
    prelude: '你被三名封号斗罗联手围攻！三人武魂真身齐开——你暗中评估差距：如果战力不够，今天恐怕凶多吉少……命运之轮，请转动——',
    computeOptions(state) {
      const base = [
        { label: '绝境突破·反杀三人！！', icon: '⚡', rarity: 'SSS', weight: 4, levelBoost: 12 },
        { label: '重伤逃脱·但境界突破',   icon: '🏃', rarity: 'SS', weight: 15, levelBoost: 8 },
        { label: '被神秘人救下·欠下人情', icon: '🦸', rarity: 'S', weight: 28, levelBoost: 5, worldImpact: { mysteriousSavior: { met: true, affinity: 20 } } },
        { label: '勉强存活·失去装备',     icon: '📉', rarity: 'B', weight: 30, levelBoost: 2 },
        { label: '假死脱身·暗中疗伤',     icon: '🪦', rarity: 'A', weight: 23, levelBoost: 3 },
        { label: '奇迹逆转·以一敌三',     icon: '⚡', rarity: 'SSS', weight: 1, levelBoost: 15 },
      ]
      return adjustCombatWeights(base, state.combatPower || state.level * 10, 4000)
    },
  },

  // ==================== 新增 Lv.91-100: 神位之争 ====================
  {
    id: 'godRealmThree', title: '神界三关', icon: '🚪', minLevel: 92, maxLevel: 100, rarity: 'SSS', enemyPower: 40000,
    prelude: '神界的入口是一道由三关守护的天门。第一关：心魔关；第二关：力量关；第三关：智慧关。只有通过三关者才能觐见神王！命运之轮，请转动——',
    computeOptions(state) {
      return [
        { label: '三关全通·神王接见！！', icon: '🌟', rarity: 'SSS', weight: 10, levelBoost: 8 },
        { label: '通过两关·获得神界认可', icon: '✅', rarity: 'SS', weight: 22, levelBoost: 6 },
        { label: '通过一关·还需努力',     icon: '🔄', rarity: 'A', weight: 30, levelBoost: 4 },
        { label: '心魔关中顿悟',          icon: '💡', rarity: 'S', weight: 20, levelBoost: 5 },
        { label: '三关全败·但没放弃',    icon: '💪', rarity: 'B', weight: 18, levelBoost: 3 },
      ]
    },
  },
  {
    id: 'godChoice', title: '神位抉择', icon: '⚖️', minLevel: 94, maxLevel: 100, rarity: 'SSS',
    prelude: '多位神祇向你抛出了橄榄枝——海神、修罗神、天使神……每一个神位都有不同的权柄和责任。你必须做出选择！命运之轮，请转动——',
    computeOptions(state) {
      return [
        { label: '海神·守护大海与生命',   icon: '🌊', rarity: 'SSS', weight: 15, levelBoost: 5 },
        { label: '修罗神·执掌杀戮与审判', icon: '⚔️', rarity: 'SSS', weight: 15, levelBoost: 5 },
        { label: '火神·焚尽邪恶',         icon: '🔥', rarity: 'SS', weight: 20, levelBoost: 4 },
        { label: '风神·自由翱翔',         icon: '💨', rarity: 'SS', weight: 18, levelBoost: 4 },
        { label: '拒绝所有·自创神位',     icon: '💫', rarity: 'SSS', weight: 12, levelBoost: 8 },
        { label: '犹豫不决·延迟选择',     icon: '🤔', rarity: 'A', weight: 20, levelBoost: 2 },
      ]
    },
  },
  {
    id: 'ascension', title: '飞升大典', icon: '☁️', minLevel: 96, maxLevel: 100, rarity: 'SSS',
    prelude: '飞升之日！整个斗罗大陆的魂师都注视着天空。金色的光柱从天而降，神界之门为你打开！命运之轮，请转动——',
    computeOptions(state) {
      return [
        { label: '完美飞升·神光万丈！！', icon: '✨', rarity: 'SSS', weight: 15, levelBoost: 6 },
        { label: '顺利飞升·进入神界',     icon: '⬆️', rarity: 'SS', weight: 30, levelBoost: 4 },
        { label: '飞升受阻·但被神王亲自迎接', icon: '👑', rarity: 'SSS', weight: 10, levelBoost: 5 },
        { label: '选择暂留大陆·未完成之事',   icon: '⏸️', rarity: 'S', weight: 25, levelBoost: 2 },
        { label: '飞升失败·但已触碰神之领域', icon: '🤏', rarity: 'A', weight: 20, levelBoost: 3 },
      ]
    },
  },
  {
    id: 'stayMortal', title: '留世之路', icon: '🏞️', minLevel: 95, maxLevel: 100, rarity: 'S',
    prelude: '并非每一个触摸神之领域的人都必须飞升。有些神选择留在斗罗大陆，以凡人之躯守护这片土地。你站在了抉择的十字路口——命运之轮，请转动——',
    computeOptions(state) {
      return [
        { label: '选择留世·成为大陆守护神', icon: '🛡️', rarity: 'SSS', weight: 20, levelBoost: 4, worldImpact: { stayMortal: true } },
        { label: '飞升神界·俯瞰众生',       icon: '☁️', rarity: 'SS', weight: 25, levelBoost: 5 },
        { label: '建立传承后再飞升',         icon: '📜', rarity: 'S', weight: 30, levelBoost: 3 },
        { label: '无法抉择·继续游历',       icon: '🧳', rarity: 'A', weight: 15, levelBoost: 2 },
        { label: '散尽神力·归于平凡',       icon: '🍂', rarity: 'B', weight: 10 },
      ]
    },
  },
  {
    id: 'eternalSeal', title: '永恒封印', icon: '🔐', minLevel: 97, maxLevel: 100, rarity: 'SSS',
    prelude: '一个远古的邪恶存在正在苏醒！如果让它完全复活，整个斗罗大陆将陷入永恒的黑暗。封印它的唯一方法是——牺牲一位神祇的全部神力。命运之轮，请转动——',
    computeOptions(state) {
      return [
        { label: '牺牲神力·封印邪恶！！', icon: '💔', rarity: 'SSS', weight: 15, levelBoost: 3, worldImpact: { evilSealed: true } },
        { label: '寻找其他方法·暂时压制', icon: '🔍', rarity: 'SS', weight: 25, levelBoost: 5 },
        { label: '联合其他神祇共同封印',   icon: '🤝', rarity: 'S', weight: 30, levelBoost: 4, worldImpact: { evilSealed: true } },
        { label: '无法面对·逃离',         icon: '🏃', rarity: 'C', weight: 12 },
        { label: '与邪恶谈判·达成平衡',   icon: '⚖️', rarity: 'A', weight: 18, levelBoost: 3 },
      ]
    },
  },

  // ==================== 角色故事线：唐三/小舞/戴沐白/宁荣荣/大师/唐昊/千仞雪 ====================
  {
    id: 'tang_forge', title: '🔨 唐三的锻造坊', icon: '⚒️', minLevel: 25, maxLevel: 50, rarity: 'SS',
    requiredEvents: ['interact_tangSanNight'],
    prelude: '唐三带你来到他秘密搭建的锻造坊。"锻造是唐门的根基。从选材到淬火，每一步都不能马虎。想学吗？"命运之轮，请转动——',
    computeOptions(state) {
      return [
        { label: '学会锻造·获得唐门秘传', icon: '🔨', rarity: 'SSS', weight: 18, levelBoost: 5, worldImpact: { tangSan: { affinity: 25 } } },
        { label: '打下手·学到基础',       icon: '🛠️', rarity: 'SS', weight: 30, levelBoost: 3, worldImpact: { tangSan: { affinity: 15 } } },
        { label: '不感兴趣·交了朋友',     icon: '🤝', rarity: 'A', weight: 30, levelBoost: 2 },
        { label: '毁了材料·唐三苦笑',     icon: '😅', rarity: 'B', weight: 22, levelBoost: 1 },
      ]
    },
  },
  {
    id: 'tang_oath', title: '🤜 七怪誓约', icon: '🌟', minLevel: 60, maxLevel: 90, rarity: 'SSS',
    requiredEvents: ['interact_tangAlly'],
    prelude: '大战前夕，唐三将你叫到一边。"无论明天发生什么——你是七怪的一员，永远都是。这份誓约，比任何魂环都珍贵。"命运之轮，请转动——',
    computeOptions(state) {
      return [
        { label: '歃血为盟·羁绊永存！！', icon: '🩸', rarity: 'SSS', weight: 25, levelBoost: 8, worldImpact: { tangSan: { affinity: 50 } } },
        { label: '郑重承诺·七怪同心',     icon: '🤝', rarity: 'SS', weight: 35, levelBoost: 5, worldImpact: { tangSan: { affinity: 30 } } },
        { label: '感动落泪·一生兄弟',     icon: '😢', rarity: 'S', weight: 25, levelBoost: 4 },
        { label: '不知所措',              icon: '😶', rarity: 'A', weight: 15, levelBoost: 2 },
      ]
    },
  },
  {
    id: 'xiaoWu_memory', title: '🌙 星斗记忆', icon: '🐰', minLevel: 20, maxLevel: 45, rarity: 'SS',
    requiredEvents: ['interact_xiaoWuCarrot'],
    prelude: '小舞在月光下发呆，眼中闪过一丝不属于人类的高傲与忧伤。"你想知道星斗大森林真正的样子吗？那里……曾经是我的家。"命运之轮，请转动——',
    computeOptions(state) {
      return [
        { label: '静静倾听·感受她的孤独', icon: '👂', rarity: 'SSS', weight: 20, levelBoost: 4, worldImpact: { xiaoWu: { affinity: 30 } } },
        { label: '承诺保守她的秘密',       icon: '🤞', rarity: 'SS', weight: 30, levelBoost: 3, worldImpact: { xiaoWu: { affinity: 20 } } },
        { label: '不理解·但尊重她',       icon: '🤷', rarity: 'A', weight: 28, levelBoost: 2 },
        { label: '太多愁善感',            icon: '😐', rarity: 'B', weight: 22, levelBoost: 1 },
      ]
    },
  },
  {
    id: 'xiaoWu_guardian', title: '🛡️ 守护之誓', icon: '💍', minLevel: 50, maxLevel: 80, rarity: 'SSS',
    requiredEvents: ['interact_xiaoWuSecret'],
    prelude: '武魂殿的封号斗罗再次出现——目标依然是小舞。你站在她面前，武魂全开。"谁也别想碰她。"命运之轮，请转动——',
    computeOptions(state) {
      return [
        { label: '以一敌三·逼退封号斗罗！！', icon: '🛡️', rarity: 'SSS', weight: 15, levelBoost: 10, worldImpact: { xiaoWu: { affinity: 60 } } },
        { label: '掩护她逃离·自己重伤',       icon: '🩸', rarity: 'SS', weight: 25, levelBoost: 7, worldImpact: { xiaoWu: { affinity: 40 } } },
        { label: '设陷阱困住追兵',             icon: '🧠', rarity: 'S', weight: 30, levelBoost: 5, worldImpact: { xiaoWu: { affinity: 30 } } },
        { label: '与追兵交易换安全',           icon: '🤝', rarity: 'A', weight: 20, levelBoost: 3 },
        { label: '犹豫了·小舞受伤',           icon: '😰', rarity: 'C', weight: 10, worldImpact: { xiaoWu: { affinity: -10 } } },
      ]
    },
  },
  {
    id: 'dai_letter', title: '✉️ 星罗来信', icon: '🦁', minLevel: 35, maxLevel: 60, rarity: 'SS',
    requiredEvents: ['interact_daiChallenge'],
    prelude: '戴沐白收到星罗帝国密信——他脸色大变。"我皇兄戴维斯正式向我宣战了。星罗皇位之争，我必须回去。"命运之轮，请转动——',
    computeOptions(state) {
      return [
        { label: '承诺协助·成为后盾',       icon: '🤝', rarity: 'SSS', weight: 22, levelBoost: 5, worldImpact: { daiMuBai: { affinity: 30 } } },
        { label: '建议联合史莱克一起行动',   icon: '👥', rarity: 'SS', weight: 30, levelBoost: 3, worldImpact: { daiMuBai: { affinity: 15 } } },
        { label: '劝他冷静·从长计议',       icon: '🧠', rarity: 'A', weight: 28, levelBoost: 2 },
        { label: '不关我事',                icon: '🤷', rarity: 'B', weight: 20, levelBoost: 1 },
      ]
    },
  },
  {
    id: 'dai_throne', title: '👑 皇位之战', icon: '🏰', minLevel: 55, maxLevel: 80, rarity: 'SSS',
    requiredEvents: ['dai_letter'],
    prelude: '戴沐白的皇位之战到了关键时刻！戴维斯请来了武魂殿封号斗罗助阵。他需要你——最信任的战友。命运之轮，请转动——',
    computeOptions(state) {
      return [
        { label: '联手击败戴维斯·沐白登基！！', icon: '👑', rarity: 'SSS', weight: 15, levelBoost: 10, worldImpact: { daiMuBai: { affinity: 50 } } },
        { label: '牵制武魂殿·沐白公平对决',     icon: '⚔️', rarity: 'SS', weight: 25, levelBoost: 6, worldImpact: { daiMuBai: { affinity: 30 } } },
        { label: '智取·瓦解戴维斯联盟',         icon: '🧠', rarity: 'S', weight: 30, levelBoost: 5 },
        { label: '沐白失败·一起逃亡',           icon: '🏃', rarity: 'A', weight: 20, levelBoost: 4 },
        { label: '临阵退缩',                    icon: '😔', rarity: 'C', weight: 10, worldImpact: { daiMuBai: { affinity: -30 } } },
      ]
    },
  },
  {
    id: 'rong_clan', title: '🏯 宗门召唤', icon: '💎', minLevel: 30, maxLevel: 55, rarity: 'SS',
    requiredEvents: ['interact_rongHelp'],
    prelude: '宁荣荣收到七宝琉璃宗的紧急召唤——宗门遭遇袭击！她哭着找你："我不知道该怎么办……宗门需要我，但我太弱了！"命运之轮，请转动——',
    computeOptions(state) {
      return [
        { label: '陪她回去·共同击退敌人',   icon: '🛡️', rarity: 'SSS', weight: 18, levelBoost: 6, worldImpact: { ningRongRong: { affinity: 35 } } },
        { label: '帮她分析局势·制定策略',   icon: '🧠', rarity: 'SS', weight: 28, levelBoost: 4, worldImpact: { ningRongRong: { affinity: 20 } } },
        { label: '建议她向大师求助',         icon: '📖', rarity: 'S', weight: 30, levelBoost: 3 },
        { label: '太危险·婉拒了',           icon: '🙅', rarity: 'B', weight: 24, levelBoost: 1 },
      ]
    },
  },
  {
    id: 'rong_evolution', title: '✨ 琉璃进化', icon: '💫', minLevel: 50, maxLevel: 75, rarity: 'SSS',
    requiredEvents: ['rong_clan'],
    prelude: '宁荣荣的七宝琉璃塔在进化！从七宝进化为九宝琉璃塔！但进化需要巨大的魂力支撑。命运之轮，请转动——',
    computeOptions(state) {
      return [
        { label: '输送魂力·见证九宝琉璃塔！！', icon: '✨', rarity: 'SSS', weight: 18, levelBoost: 8, worldImpact: { ningRongRong: { affinity: 50 } } },
        { label: '守护她完成进化·获得祝福',     icon: '🙏', rarity: 'SS', weight: 30, levelBoost: 6, worldImpact: { ningRongRong: { affinity: 30 } } },
        { label: '进化成功·你魂力透支',         icon: '😵', rarity: 'S', weight: 25, levelBoost: 4 },
        { label: '魂力不够·进化中断',           icon: '💔', rarity: 'B', weight: 27, levelBoost: 1 },
      ]
    },
  },
  {
    id: 'master_letter', title: '📜 大师的遗书', icon: '💌', minLevel: 60, maxLevel: 95, rarity: 'SSS',
    prelude: '你收到一封玉小刚的信。"当你看到这封信时，我或许已经不在了。我一生最大的骄傲，就是见证了你和唐三的成长。记住——适合的，才是最好的。"命运之轮，请转动——',
    computeOptions(state) {
      return [
        { label: '泪流满面·牢记大师教诲',   icon: '😢', rarity: 'SSS', weight: 30, levelBoost: 6, worldImpact: { yuXiaoGang: { affinity: 40 } } },
        { label: '将理论整理成册·传承后世', icon: '📖', rarity: 'SS', weight: 35, levelBoost: 5, worldImpact: { yuXiaoGang: { affinity: 30 } } },
        { label: '找到大师·他还活着！！',     icon: '😲', rarity: 'SSS', weight: 10, levelBoost: 8, worldImpact: { yuXiaoGang: { affinity: 50 } } },
        { label: '信是假的·武魂殿陷阱',     icon: '⚠️', rarity: 'A', weight: 15, levelBoost: 3 },
        { label: '太过悲伤',                icon: '💔', rarity: 'B', weight: 10, levelBoost: 2 },
      ]
    },
  },
  {
    id: 'tangHao_appear', title: '🔨 昊天斗罗', icon: '💪', minLevel: 30, maxLevel: 58, rarity: 'SSS',
    prelude: '一个扛着巨大昊天锤的独臂男人拦住了你的去路——唐昊！"你身上有我儿子的气息。告诉我，他怎么样了？"命运之轮，请转动——',
    computeOptions(state) {
      return [
        { label: '如实告知·唐昊微微点头',   icon: '✅', rarity: 'SSS', weight: 20, levelBoost: 5, worldImpact: { tangHao: { met: true, affinity: 25 } } },
        { label: '请他指点修炼·受益匪浅',   icon: '💪', rarity: 'SS', weight: 30, levelBoost: 6, worldImpact: { tangHao: { met: true, affinity: 20 } } },
        { label: '被他测试·勉强通过',       icon: '😰', rarity: 'S', weight: 25, levelBoost: 3, worldImpact: { tangHao: { met: true, affinity: 10 } } },
        { label: '被气势震慑',              icon: '😱', rarity: 'B', weight: 25, levelBoost: 1 },
      ]
    },
  },
  {
    id: 'qianxue_trial', title: '👼 天使试炼', icon: '✨', minLevel: 60, maxLevel: 85, rarity: 'SSS',
    requiredEvents: ['interact_qianRenXue'],
    prelude: '千仞雪的六翼天使武魂完全展开，神圣光芒照亮了整片天空。"天使神的试炼即将开始。我需要一个见证者。你愿意来吗？"命运之轮，请转动——',
    computeOptions(state) {
      const met = state.relationships?.qianRenXue?.met
      if (!met) return [{ label: '你还没见过千仞雪', icon: '❓', rarity: 'C', weight: 100 }]
      return [
        { label: '见证天使九考·获得天使祝福', icon: '👼', rarity: 'SSS', weight: 18, levelBoost: 8, worldImpact: { qianRenXue: { affinity: 40 } } },
        { label: '帮她通过心魔关·建立羁绊',   icon: '💪', rarity: 'SS', weight: 28, levelBoost: 5, worldImpact: { qianRenXue: { affinity: 25 } } },
        { label: '天使神威过强·无法靠近',     icon: '😰', rarity: 'B', weight: 25, levelBoost: 3 },
        { label: '这是陷阱·没有上当',         icon: '🕵️', rarity: 'C', weight: 29, levelBoost: 1 },
      ]
    },
  },
  // ==================== 原著重大事件：详细分支转盘 ====================
  {
    id: 'canon_shrekForm', title: '⚡ 史莱克七怪成立', icon: '🌟', minLevel: 30, maxLevel: 48, rarity: 'SSS', isMilestone: true,
    requiredEvents: ['shrekEntrance'],
    prelude: '弗兰德院长召集了学院最强的七名学生，郑重宣布——史莱克七怪正式成立！唐三、小舞、戴沐白、奥斯卡、马红俊、宁荣荣、朱竹清。弗兰德转向你："你虽非正式成员，但你与七怪的交情，让你有资格参与这次决定。"命运之轮，请转动——',
    computeOptions(state) {
      return [
        { label: '全力支持·成为荣誉第八人！！', icon: '🤝', rarity: 'SSS', weight: 15, levelBoost: 6, worldImpact: { tangSan: { affinity: 30 }, xiaoWu: { affinity: 20 }, daiMuBai: { affinity: 20 }, oscar: { affinity: 15 }, maHongJun: { affinity: 15 }, ningRongRong: { affinity: 20 }, zhuZhuQing: { affinity: 15 } }, unlocks: ['shrekFormed'] },
        { label: '独立参赛·走自己的路',         icon: '🧍', rarity: 'SS', weight: 22, levelBoost: 4 },
        { label: '幕后支持·不做焦点',           icon: '🫶', rarity: 'S', weight: 28, levelBoost: 3 },
        { label: '接受特殊任务·暗中协助',       icon: '📜', rarity: 'A', weight: 20, levelBoost: 2 },
        { label: '保持距离·独自修炼',           icon: '😒', rarity: 'C', weight: 15, levelBoost: 1 },
      ]
    },
  },
  {
    id: 'canon_tournamentFinal', title: '⚡ 精英赛决战·武魂城', icon: '🏟️', minLevel: 42, maxLevel: 58, rarity: 'SSS', isMilestone: true,
    prelude: '武魂城中央大斗魂场——全大陆精英赛决赛！教皇比比东亲临，整个大陆的目光聚集于此。对面是武魂殿最强战队。这一战决定你在大陆魂师界的地位——命运之轮，请转动——',
    computeOptions(state) {
      return [
        { label: '击败武魂殿·震惊大陆！！',   icon: '🏆', rarity: 'SSS', weight: 8, levelBoost: 12, worldImpact: { biBiDong: { met: true, affinity: -30 } } },
        { label: '击败强敌·扬名立万',         icon: '🥇', rarity: 'SS', weight: 18, levelBoost: 8, worldImpact: { biBiDong: { met: true, affinity: -10 } } },
        { label: '惜败·赢得全场尊重',         icon: '🥈', rarity: 'S', weight: 25, levelBoost: 6, worldImpact: { biBiDong: { met: true, affinity: 10 } } },
        { label: '被暗算·揭露武魂殿阴谋',     icon: '🕵️', rarity: 'SS', weight: 15, levelBoost: 7, worldImpact: { biBiDong: { met: true, affinity: -50 } } },
        { label: '弃权保存实力',              icon: '🏳️', rarity: 'A', weight: 18, levelBoost: 3 },
        { label: '受伤·获全场致敬',           icon: '🩹', rarity: 'B', weight: 16, levelBoost: 4 },
      ]
    },
  },
  {
    id: 'canon_haotianReturn', title: '⚡ 昊天宗回归', icon: '🔨', minLevel: 70, maxLevel: 90, rarity: 'SSS', isMilestone: true,
    requiredEvents: ['tangHao_appear'],
    prelude: '昊天宗——曾经天下第一宗门，因唐昊之事封闭山门二十年。唐三叩响了山门，五位长老的目光冰冷如刀。你站在唐三身边——命运之轮，请转动——',
    computeOptions(state) {
      return [
        { label: '为唐三作证·说服长老开山！！', icon: '🔨', rarity: 'SSS', weight: 12, levelBoost: 10, worldImpact: { tangSan: { affinity: 50 }, tangHao: { affinity: 30 } } },
        { label: '展现实力·赢得尊重',           icon: '💪', rarity: 'SS', weight: 20, levelBoost: 8, worldImpact: { tangSan: { affinity: 30 } } },
        { label: '沉默·让唐三自己面对',         icon: '🤐', rarity: 'A', weight: 28, levelBoost: 4 },
        { label: '劝说放弃·宗门已腐朽',         icon: '😔', rarity: 'B', weight: 18, levelBoost: 2, worldImpact: { tangSan: { affinity: -10 } } },
        { label: '站在长老一边',                icon: '⚖️', rarity: 'C', weight: 12, levelBoost: 3, worldImpact: { tangSan: { affinity: -40 } } },
        { label: '宗门内乱·被迫应战',           icon: '⚔️', rarity: 'S', weight: 10, levelBoost: 6 },
      ]
    },
  },
  {
    id: 'canon_empireForm', title: '⚡ 武魂帝国成立', icon: '🏰', minLevel: 52, maxLevel: 68, rarity: 'SSS', isMilestone: true,
    prelude: '武魂殿正式宣布立国——武魂帝国诞生！比比东登基称帝，整个大陆为之震动。所有魂师都被要求选择阵营——命运之轮，请转动——',
    computeOptions(state) {
      return [
        { label: '公开反对·加入天斗联军',       icon: '⚔️', rarity: 'SSS', weight: 15, levelBoost: 6, worldImpact: { biBiDong: { faction: 'enemy', affinity: -60 } } },
        { label: '接受招揽·加入武魂帝国',       icon: '⛪', rarity: 'SS', weight: 18, levelBoost: 6, worldImpact: { biBiDong: { faction: 'friend', affinity: 40 } } },
        { label: '保持中立·拒绝任何阵营',       icon: '⚖️', rarity: 'S', weight: 28, levelBoost: 3 },
        { label: '暗中组织反抗·地下行动',       icon: '🕵️', rarity: 'SS', weight: 15, levelBoost: 5, worldImpact: { biBiDong: { affinity: -30 } } },
        { label: '逃往海神岛避祸',              icon: '⛵', rarity: 'A', weight: 14, levelBoost: 2 },
        { label: '被强行征召·被迫参战',         icon: '🔗', rarity: 'C', weight: 10, levelBoost: 3, worldImpact: { biBiDong: { affinity: 10 } } },
      ]
    },
  },
  {
    id: 'canon_jialingPass', title: '⚡ 嘉陵关决战', icon: '🏯', minLevel: 73, maxLevel: 88, rarity: 'SSS', isMilestone: true, enemyPower: 22000,
    prelude: '武魂帝国百万大军压境嘉陵关——天斗帝国最后的屏障！唐三的海神之力与比比东的罗刹神力碰撞，天地变色。你的每一个决定都可能改变战局——命运之轮，请转动——',
    computeOptions(state) {
      const isAnti = state.relationships?.biBiDong?.faction === 'enemy'
      const base = [
        { label: '联手唐三·对抗比比东！！',   icon: '🤝', rarity: 'SSS', weight: isAnti ? 20 : 5, levelBoost: 12, worldImpact: { tangSan: { affinity: 40 }, biBiDong: { affinity: -80 } } },
        { label: '指挥奇袭·智取粮草',         icon: '🧠', rarity: 'SS', weight: 18, levelBoost: 8, worldImpact: { tangSan: { affinity: 20 } } },
        { label: '守护后方·保护伤员',         icon: '🛡️', rarity: 'S', weight: 22, levelBoost: 5 },
        { label: '并肩唐昊·昊天锤荣耀',       icon: '🔨', rarity: 'SSS', weight: isAnti ? 12 : 3, levelBoost: 10, worldImpact: { tangHao: { affinity: 30 } } },
        { label: '坐山观虎斗',                icon: '👀', rarity: 'B', weight: 15, levelBoost: 2 },
        { label: '倒戈武魂帝国',              icon: '🔄', rarity: 'C', weight: 8, levelBoost: 5, worldImpact: { tangSan: { affinity: -80, faction: 'enemy' }, biBiDong: { affinity: 50 } } },
        { label: '关陷·掩护百姓撤离',         icon: '🏃', rarity: 'C', weight: 10, levelBoost: 3 },
      ]
      return adjustCombatWeights(base, state.combatPower || state.level * 10, 3000)
    },
  },
  {
    id: 'canon_godWar', title: '⚡ 双神之战', icon: '⚔️', minLevel: 95, maxLevel: 100, rarity: 'SSS', isMilestone: true, enemyPower: 100000,
    prelude: '神界之门大开——海神唐三与罗刹神比比东的最终对决！两位神祇撕裂天空，整个大陆颤抖。你以凡人之躯站在战场边缘——命运之轮，请转动——',
    computeOptions(state) {
      const tangFriend = state.relationships?.tangSan?.faction === 'friend'
      const base = [
        { label: '凡人助神·击败罗刹！！',       icon: '🌟', rarity: 'SSS', weight: tangFriend ? 20 : 5, levelBoost: 15, worldImpact: { tangSan: { affinity: 80 }, biBiDong: { alive: false } } },
        { label: '领域困神·智取罗刹',           icon: '🌐', rarity: 'SSS', weight: tangFriend ? 12 : 3, levelBoost: 12, worldImpact: { tangSan: { affinity: 50 }, biBiDong: { alive: false } } },
        { label: '保护平民撤离',                icon: '🛡️', rarity: 'SS', weight: 20, levelBoost: 6, worldImpact: { tangSan: { affinity: 20 } } },
        { label: '旁观·记录历史',               icon: '📖', rarity: 'S', weight: 22, levelBoost: 5 },
        { label: '助纣为虐·帮比比东',           icon: '😈', rarity: 'C', weight: 8, levelBoost: 10, worldImpact: { tangSan: { affinity: -100, faction: 'enemy' }, biBiDong: { affinity: 80 } } },
        { label: '神战余波所伤·幸存',           icon: '🤕', rarity: 'B', weight: 15, levelBoost: 7 },
        { label: '双神同归于尽·你成最强',       icon: '💀', rarity: 'A', weight: 5, levelBoost: 20, worldImpact: { tangSan: { alive: false }, biBiDong: { alive: false } } },
      ]
      return adjustCombatWeights(base, state.combatPower || state.level * 10, 5000)
    },
  },

  // ==================== 武魂融合技（原著核心系统） ====================
  {
    id: 'fusion_daiZhu', title: '🐯 幽冥白虎', icon: '🐅', minLevel: 45, maxLevel: 65, rarity: 'SSS', isMilestone: true,
    prelude: '戴沐白和朱竹清同时找到了你——他们的武魂产生了共鸣！"幽冥白虎——只有双方完全信任才能使用的武魂融合技。你愿意和我们一起尝试吗？"命运之轮，请转动——',
    computeOptions(state) {
      const dai = (state.relationships?.daiMuBai?.affinity || 0) >= 15
      const zhu = (state.relationships?.zhuZhuQing?.affinity || 0) >= 15
      if (!dai || !zhu) return [{ label: '戴沐白和朱竹清还不够信任你', icon: '❓', rarity: 'C', weight: 100 }]
      return [
        { label: '完美融合·觉醒幽冥之力！！', icon: '🐅', rarity: 'SSS', weight: 15, levelBoost: 8, worldImpact: { daiMuBai: { affinity: 30 }, zhuZhuQing: { affinity: 30 } } },
        { label: '融合成功·战力短暂飙升',     icon: '⚡', rarity: 'SS', weight: 28, levelBoost: 6, worldImpact: { daiMuBai: { affinity: 20 }, zhuZhuQing: { affinity: 20 } } },
        { label: '部分融合·学到融合原理',     icon: '📖', rarity: 'S', weight: 30, levelBoost: 4 },
        { label: '融合失败·三人受伤',         icon: '🤕', rarity: 'B', weight: 17, levelBoost: 2 },
        { label: '拒绝尝试',                  icon: '🙅', rarity: 'C', weight: 10 },
      ]
    },
  },
  {
    id: 'fusion_tangXiao', title: '💫 双神共存', icon: '✨', minLevel: 50, maxLevel: 75, rarity: 'SSS', isMilestone: true,
    prelude: '唐三和小舞的武魂产生了前所未有的共鸣——海神与修罗神的力量同时涌动！"双神共存——这是我父母留给我的最高奥秘。"命运之轮，请转动——',
    computeOptions(state) {
      const tang = (state.relationships?.tangSan?.affinity || 0) >= 25
      const xiao = (state.relationships?.xiaoWu?.affinity || 0) >= 25
      if (!tang || !xiao) return [{ label: '唐三和小舞还不够信任你', icon: '❓', rarity: 'C', weight: 100 }]
      return [
        { label: '见证双神共存·获得神级感悟！！', icon: '💫', rarity: 'SSS', weight: 12, levelBoost: 10, worldImpact: { tangSan: { affinity: 40 }, xiaoWu: { affinity: 40 } } },
        { label: '感受神力·自身境界突破',         icon: '⚡', rarity: 'SS', weight: 25, levelBoost: 7 },
        { label: '唐三单独传授·海神之秘',         icon: '🌊', rarity: 'S', weight: 30, levelBoost: 5, worldImpact: { tangSan: { affinity: 25 } } },
        { label: '无法理解神的领域',               icon: '😵', rarity: 'B', weight: 23, levelBoost: 3 },
        { label: '拒绝·不敢涉足神之领域',         icon: '🙅', rarity: 'C', weight: 10 },
      ]
    },
  },
  {
    id: 'fusion_player', title: '⚡ 武魂共鸣', icon: '🌀', minLevel: 55, maxLevel: 80, rarity: 'SS', isMilestone: true,
    prelude: '你的武魂突然与一位同伴的武魂产生了共鸣——这是武魂融合的征兆！融合技是万中无一的奇迹。命运之轮，请转动——',
    computeOptions(state) {
      return [
        { label: '成功觉醒·自创武魂融合技！！', icon: '🌀', rarity: 'SSS', weight: 10, levelBoost: 10 },
        { label: '部分共鸣·武魂增强',           icon: '⚡', rarity: 'SS', weight: 22, levelBoost: 6 },
        { label: '共鸣不稳定·但学到知识',       icon: '📖', rarity: 'S', weight: 30, levelBoost: 4 },
        { label: '共鸣失败·但武魂更坚韧',       icon: '💪', rarity: 'B', weight: 23, levelBoost: 2 },
        { label: '强行融合·反噬受伤',           icon: '🤕', rarity: 'C', weight: 15, levelBoost: 3 },
      ]
    },
  },

  // ==================== 八蛛矛外附魂骨 ====================
  {
    id: 'spiderLance_get', title: '🕷️ 八蛛矛', icon: '🕸️', minLevel: 35, maxLevel: 55, rarity: 'SSS', isMilestone: true,
    prelude: '你在星斗大森林发现了一头千年人面魔蛛——它的外附魂骨是所有魂师梦寐以求的至宝！这是一次改变命运的猎杀。命运之轮，请转动——',
    computeOptions(state) {
      return [
        { label: '获得八蛛矛外附魂骨！！',   icon: '🦴', rarity: 'SSS', weight: 8, levelBoost: 6, soulBone: { slot: 'external', beast: '千年人面魔蛛', year: 6000, skill: '八蛛矛·剧毒穿刺', rarity: 'SS' } },
        { label: '获得右臂魂骨',             icon: '💪', rarity: 'SS', weight: 20, levelBoost: 4, soulBone: { slot: 'rightArm', beast: '人面魔蛛', year: 5000, skill: '蛛网缠绕', rarity: 'A' } },
        { label: '魔蛛逃入洞穴·追丢了',     icon: '🏃', rarity: 'A', weight: 30, levelBoost: 2 },
        { label: '被魔蛛毒液所伤·中毒了',   icon: '☠️', rarity: 'B', weight: 22, levelBoost: 3 },
        { label: '情报有误·不是人面魔蛛',   icon: '😔', rarity: 'C', weight: 20 },
      ]
    },
  },
  {
    id: 'spiderLance_evolve', title: '🕷️ 八蛛矛进化', icon: '✨', minLevel: 55, maxLevel: 80, rarity: 'SSS', isMilestone: true,
    prelude: '你的八蛛矛外附魂骨产生了异变——它在吸收你体内的魂力进行自我进化！如果进化成功，它将蜕变为传说中的「神级八蛛矛」。命运之轮，请转动——',
    computeOptions(state) {
      return [
        { label: '进化成功·神级八蛛矛！！', icon: '✨', rarity: 'SSS', weight: 10, levelBoost: 10, soulBone: { slot: 'external', beast: '神级八蛛矛', year: 100000, skill: '神级剧毒穿刺·领域', rarity: 'SSS' } },
        { label: '部分进化·获得剧毒领域',   icon: '☠️', rarity: 'SS', weight: 22, levelBoost: 7, worldImpact: { domain: '剧毒领域' } },
        { label: '进化失败·但魂骨增强',     icon: '📈', rarity: 'S', weight: 30, levelBoost: 4 },
        { label: '进化失控·暂时虚弱',       icon: '😵', rarity: 'B', weight: 20, levelBoost: 2 },
        { label: '放弃进化·保持现状',       icon: '🛑', rarity: 'C', weight: 18 },
      ]
    },
  },

  // ==================== 独孤博毒训 ====================
  {
    id: 'duguPoison_1', title: '☠️ 以毒炼体', icon: '🧪', minLevel: 35, maxLevel: 50, rarity: 'SS', isMilestone: true,
    requiredEvents: ['iceFireWell'],
    prelude: '独孤博捻着胡须打量着你："小子，老夫看你根骨不错。想不想学学怎么用毒？不过先说好——以毒炼体的过程，比死还难受。"命运之轮，请转动——',
    computeOptions(state) {
      return [
        { label: '坚持到底·获得抗毒体质！！', icon: '☠️', rarity: 'SSS', weight: 14, levelBoost: 5, worldImpact: { duGuBo: { affinity: 35 } } },
        { label: '完成大半·获得部分抗毒',     icon: '💊', rarity: 'SS', weight: 26, levelBoost: 4, worldImpact: { duGuBo: { affinity: 20 } } },
        { label: '中途放弃·但学了基础',       icon: '🛑', rarity: 'A', weight: 30, levelBoost: 2 },
        { label: '毒性过强·昏迷三天',         icon: '😵', rarity: 'B', weight: 18, levelBoost: 3 },
        { label: '拒绝·太痛苦了',             icon: '🙅', rarity: 'C', weight: 12 },
      ]
    },
  },
  {
    id: 'duguPoison_2', title: '☠️ 万毒不侵', icon: '🛡️', minLevel: 50, maxLevel: 70, rarity: 'SSS', isMilestone: true,
    requiredEvents: ['duguPoison_1'],
    prelude: '独孤博满意地看着你："你已经过了最难的阶段。现在是最后一步——服下老夫的本命毒丹炼制的万毒丹。成功，你将万毒不侵；失败……"他没有说下去。命运之轮，请转动——',
    computeOptions(state) {
      return [
        { label: '万毒不侵·获得毒免被动！！', icon: '🛡️', rarity: 'SSS', weight: 12, levelBoost: 8, worldImpact: { duGuBo: { affinity: 50 } } },
        { label: '成功·获得高级毒抗',         icon: '✅', rarity: 'SS', weight: 25, levelBoost: 5, worldImpact: { duGuBo: { affinity: 25 } } },
        { label: '部分成功·获得毒抗',         icon: '💊', rarity: 'S', weight: 30, levelBoost: 3 },
        { label: '失败·但未中毒',             icon: '😰', rarity: 'B', weight: 20, levelBoost: 2 },
        { label: '服毒失败·独孤博救了你',     icon: '🆘', rarity: 'C', weight: 13, levelBoost: 4, worldImpact: { duGuBo: { affinity: 15 } } },
      ]
    },
  },

  // ==================== Lv.80-100 后期填充 ====================
  {
    id: 'late_echo', title: '🌌 星斗回声', icon: '🌲', minLevel: 80, maxLevel: 90, rarity: 'SS', isMilestone: true,
    prelude: '你再次踏入星斗大森林——这一次，你已是封号斗罗。天青牛蟒和泰坦巨猿同时出现在你面前，它们感受到了你体内涌动的神之气息。命运之轮，请转动——',
    computeOptions(state) {
      return [
        { label: '获得双兽王祝福·战力大增', icon: '🐂', rarity: 'SSS', weight: 12, levelBoost: 8, worldImpact: { xiaoWu: { affinity: 20 } } },
        { label: '天青牛蟒献出魂骨',         icon: '🦴', rarity: 'SS', weight: 20, levelBoost: 6, soulBone: { slot: 'torso', beast: '天青牛蟒', year: 100000, skill: '天青守护', rarity: 'SS' } },
        { label: '泰坦巨猿教你巨力之道',     icon: '🦍', rarity: 'S', weight: 28, levelBoost: 5 },
        { label: '被兽王考验·勉强通过',     icon: '😰', rarity: 'B', weight: 22, levelBoost: 3 },
        { label: '兽王不愿见你·离去',       icon: '😔', rarity: 'C', weight: 18 },
      ]
    },
  },
  {
    id: 'late_godRift', title: '🌌 神界裂缝', icon: '💫', minLevel: 85, maxLevel: 95, rarity: 'SSS', isMilestone: true,
    prelude: '天空裂开了——一道金色的裂缝中，神界的气息倾泻而出！这是万年难遇的机缘，也可能是致命的陷阱。命运之轮，请转动——',
    computeOptions(state) {
      return [
        { label: '吸收神界气息·境界飙升！！', icon: '💫', rarity: 'SSS', weight: 8, levelBoost: 12 },
        { label: '获得神界碎片·炼化神器',     icon: '🔮', rarity: 'SS', weight: 18, levelBoost: 8 },
        { label: '谨慎吸收·稳步提升',         icon: '📈', rarity: 'S', weight: 30, levelBoost: 5 },
        { label: '裂缝不稳定·提前关闭',       icon: '😔', rarity: 'B', weight: 24, levelBoost: 3 },
        { label: '被神界之力反噬·受伤',       icon: '🤕', rarity: 'C', weight: 20, levelBoost: 4 },
      ]
    },
  },
  {
    id: 'late_duel', title: '⚔️ 封号对决', icon: '👑', minLevel: 88, maxLevel: 96, rarity: 'SSS', isMilestone: true,
    prelude: '一位同级别的封号斗罗向你发起了挑战！这是封号斗罗之间的巅峰对决——整个大陆都在注视。命运之轮，请转动——',
    computeOptions(state) {
      const base = [
        { label: '碾压对手·威震大陆！！', icon: '💪', rarity: 'SSS', weight: 10, levelBoost: 8 },
        { label: '激战胜出·赢得尊重',     icon: '⚔️', rarity: 'SS', weight: 22, levelBoost: 6 },
        { label: '险胜·但也学到很多',     icon: '😰', rarity: 'S', weight: 28, levelBoost: 4 },
        { label: '惜败·但对手承认你很强', icon: '🤝', rarity: 'A', weight: 20, levelBoost: 3 },
        { label: '惨败·但发现自身不足',   icon: '📉', rarity: 'B', weight: 12, levelBoost: 2 },
        { label: '双方重伤·平局收场',     icon: '🩸', rarity: 'C', weight: 8, levelBoost: 5 },
      ]
      return adjustCombatWeights(base, state.combatPower || state.level * 10, 15000)
    },
  },

  // ==================== 七宝琉璃宗覆灭 ====================
  {
    id: 'clan_attack', title: '💔 琉璃之劫', icon: '💎', minLevel: 50, maxLevel: 65, rarity: 'SSS', isMilestone: true,
    prelude: '噩耗传来——武魂殿夜袭七宝琉璃宗！宁风致重伤，宗门弟子死伤过半。宁荣荣哭着跪在你面前："求求你……救救我的家人！"命运之轮，请转动——',
    computeOptions(state) {
      return [
        { label: '火速驰援·救下宁风致！！', icon: '🛡️', rarity: 'SSS', weight: 15, levelBoost: 8, worldImpact: { ningRongRong: { affinity: 50 } } },
        { label: '阻击武魂殿追兵·掩护撤退', icon: '⚔️', rarity: 'SS', weight: 25, levelBoost: 6, worldImpact: { ningRongRong: { affinity: 30 } } },
        { label: '暗中护送·成功转移',       icon: '🕵️', rarity: 'S', weight: 28, levelBoost: 4, worldImpact: { ningRongRong: { affinity: 20 } } },
        { label: '来晚一步·宗门已成废墟',   icon: '💔', rarity: 'B', weight: 18, levelBoost: 2, worldImpact: { ningRongRong: { affinity: 10 } } },
        { label: '选择明哲保身·没有参与',   icon: '😔', rarity: 'C', weight: 14, levelBoost: 1 },
      ]
    },
  },
  {
    id: 'clan_rebuild', title: '💎 琉璃重建', icon: '🏯', minLevel: 65, maxLevel: 85, rarity: 'SSS', isMilestone: true,
    requiredEvents: ['clan_attack'],
    prelude: '七宝琉璃宗的废墟上，宁荣荣擦干眼泪。"我要重建宗门——让它比以前更强大。你愿意帮我吗？"命运之轮，请转动——',
    computeOptions(state) {
      const close = (state.relationships?.ningRongRong?.affinity || 0) >= 10
      if (!close) return [{ label: '宁荣荣还不信任你', icon: '❓', rarity: 'C', weight: 100 }]
      return [
        { label: '全力协助·九宝琉璃塔祝福！！', icon: '💎', rarity: 'SSS', weight: 15, levelBoost: 8, worldImpact: { ningRongRong: { affinity: 50 } } },
        { label: '提供资源·帮助重建',           icon: '💰', rarity: 'SS', weight: 25, levelBoost: 5, worldImpact: { ningRongRong: { affinity: 30 } } },
        { label: '帮忙招募新弟子',               icon: '📢', rarity: 'S', weight: 28, levelBoost: 4, worldImpact: { ningRongRong: { affinity: 20 } } },
        { label: '精神支持·但无法实际帮助',     icon: '🙏', rarity: 'B', weight: 20, levelBoost: 2 },
        { label: '拒绝·太忙了',                 icon: '🙅', rarity: 'C', weight: 12 },
      ]
    },
  },
];
