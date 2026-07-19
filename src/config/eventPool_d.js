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

export const EVENT_POOL_D = [
  // ==================== 等级触发原著角色剧情 ====================
  {
    id: 'lvl_tangSan_15', title: '🌿 蓝银初现', icon: '🌱', minLevel: 12, maxLevel: 22, rarity: 'SSS', isMilestone: true,
    prelude: '唐三的蓝银草在月光下泛起了蓝金色光芒。"你注意到了吗？我的武魂似乎有所不同。"命运之轮，请转动——',
    computeOptions(state) {
      return [
        { label: '仔细观察·发现蓝银草的秘密', icon: '🔍', rarity: 'SSS', weight: 20, levelBoost: 3, worldImpact: { tangSan: { met: true, affinity: 20 } } },
        { label: '鼓励唐三·相信他的武魂',     icon: '💚', rarity: 'SS', weight: 30, levelBoost: 2, worldImpact: { tangSan: { met: true, affinity: 15 } } },
        { label: '不以为然·普通蓝银草而已',   icon: '🤷', rarity: 'B', weight: 28, levelBoost: 1 },
        { label: '觉得他在开玩笑',             icon: '😅', rarity: 'C', weight: 22 },
      ]
    },
  },
  { id: 'lvl_xiaoWu_30', title: '🐰 柔骨之秘', icon: '🐇', minLevel: 25, maxLevel: 38, rarity: 'SSS', isMilestone: true,
    prelude: '小舞找到你，神情犹豫。"我的柔骨兔……和其他兽武魂不太一样。"命运之轮，请转动——',
    computeOptions(state) {
      return [
        { label: '静静倾听·获得她的信任', icon: '👂', rarity: 'SSS', weight: 18, levelBoost: 4, worldImpact: { xiaoWu: { met: true, affinity: 30 } } },
        { label: '表示理解·不追问细节',   icon: '🤝', rarity: 'SS', weight: 30, levelBoost: 2, worldImpact: { xiaoWu: { met: true, affinity: 15 } } },
        { label: '追问到底·她欲言又止',   icon: '😰', rarity: 'A', weight: 25, levelBoost: 2 },
        { label: '不关心·没什么特别',     icon: '🤷', rarity: 'C', weight: 27, levelBoost: 1 },
      ]
    },
  },
  { id: 'lvl_dai_40', title: '🐯 白虎之怒', icon: '👑', minLevel: 35, maxLevel: 48, rarity: 'SSS', isMilestone: true,
    prelude: '戴沐白收到星罗密信——脸色铁青。"戴维斯终于按捺不住了。我需要回星罗。你愿意一起去吗？"命运之轮，请转动——',
    computeOptions(state) {
      return [
        { label: '同行·共同面对星罗皇室', icon: '🤝', rarity: 'SSS', weight: 15, levelBoost: 6, worldImpact: { daiMuBai: { met: true, affinity: 35 } } },
        { label: '帮他分析局势·制定策略', icon: '🧠', rarity: 'SS', weight: 28, levelBoost: 4, worldImpact: { daiMuBai: { met: true, affinity: 20 } } },
        { label: '承诺需要时一定赶到',     icon: '🤞', rarity: 'S', weight: 30, levelBoost: 3 },
        { label: '婉拒·不想卷入皇室争斗', icon: '🙅', rarity: 'B', weight: 17, levelBoost: 1 },
        { label: '趁机要报酬',             icon: '💰', rarity: 'C', weight: 10, levelBoost: 2, worldImpact: { daiMuBai: { met: true, affinity: -10 } } },
      ]
    },
  },
  { id: 'lvl_fatty_50', title: '🔥 邪火焚天', icon: '🐦', minLevel: 45, maxLevel: 58, rarity: 'SSS', isMilestone: true,
    prelude: '马红俊浑身邪火包围，痛苦蜷缩。"帮帮我……邪火又失控了！"命运之轮，请转动——',
    computeOptions(state) {
      return [
        { label: '冒险压制邪火·救下他！！', icon: '🧯', rarity: 'SSS', weight: 15, levelBoost: 6, worldImpact: { maHongJun: { met: true, affinity: 40 } } },
        { label: '用冰寒之力镇压·成功',     icon: '❄️', rarity: 'SS', weight: 25, levelBoost: 4, worldImpact: { maHongJun: { met: true, affinity: 25 } } },
        { label: '找唐三帮忙',              icon: '🏃', rarity: 'S', weight: 28, levelBoost: 3 },
        { label: '无法控制·他昏迷了',       icon: '😵', rarity: 'B', weight: 20, levelBoost: 2 },
        { label: '被邪火波及·自己受伤',     icon: '🔥', rarity: 'C', weight: 12, levelBoost: 3 },
      ]
    },
  },
  { id: 'lvl_rong_55', title: '💎 琉璃之变', icon: '✨', minLevel: 50, maxLevel: 63, rarity: 'SSS', isMilestone: true,
    prelude: '宁荣荣的七宝琉璃塔自主发光——在进化！从七层变八层，隐隐有第九层虚影。"九宝琉璃塔是传说！"命运之轮，请转动——',
    computeOptions(state) {
      return [
        { label: '输送魂力·见证九宝琉璃塔！！', icon: '💎', rarity: 'SSS', weight: 15, levelBoost: 8, worldImpact: { ningRongRong: { met: true, affinity: 40 } } },
        { label: '守护她完成进化·获得祝福',     icon: '🙏', rarity: 'SS', weight: 28, levelBoost: 5, worldImpact: { ningRongRong: { met: true, affinity: 25 } } },
        { label: '进化成功·她魂力透支',         icon: '😵', rarity: 'S', weight: 30, levelBoost: 4 },
        { label: '进化中断·还需机缘',           icon: '⏸️', rarity: 'B', weight: 17, levelBoost: 2 },
        { label: '嫉妒·不帮忙',                 icon: '😒', rarity: 'C', weight: 10, worldImpact: { ningRongRong: { met: true, affinity: -15 } } },
      ]
    },
  },
  { id: 'lvl_zhu_65', title: '🐱 幽冥暗杀', icon: '🗡️', minLevel: 60, maxLevel: 73, rarity: 'SSS', isMilestone: true,
    prelude: '朱竹清浑身是血敲开你的门——星罗刺客来了。"他们找到了我……戴维斯的暗杀队。"命运之轮，请转动——',
    computeOptions(state) {
      return [
        { label: '联手反杀·全歼刺客！！', icon: '⚔️', rarity: 'SSS', weight: 12, levelBoost: 8, worldImpact: { zhuZhuQing: { met: true, affinity: 40 }, daiMuBai: { met: true, affinity: 15 } } },
        { label: '设陷阱·智取刺客',       icon: '🧠', rarity: 'SS', weight: 25, levelBoost: 5, worldImpact: { zhuZhuQing: { met: true, affinity: 25 } } },
        { label: '护送她逃离·暂时安全',   icon: '🏃', rarity: 'S', weight: 30, levelBoost: 4 },
        { label: '害怕牵连·婉拒了',       icon: '😰', rarity: 'B', weight: 20, levelBoost: 2 },
        { label: '通知武魂殿·换取情报',   icon: '📢', rarity: 'C', weight: 13, levelBoost: 3, worldImpact: { zhuZhuQing: { met: true, affinity: -30 }, biBiDong: { met: true, affinity: 10 } } },
      ]
    },
  },
  { id: 'lvl_qianxue_75', title: '👼 天使降临', icon: '✨', minLevel: 70, maxLevel: 83, rarity: 'SSS', isMilestone: true,
    prelude: '六翼天使圣光从天而降——千仞雪悬浮空中。"你的实力已引起天使神的注意。"命运之轮，请转动——',
    computeOptions(state) {
      return [
        { label: '接受天使试炼·证明自己', icon: '👼', rarity: 'SSS', weight: 12, levelBoost: 8, worldImpact: { qianRenXue: { met: true, affinity: 30 } } },
        { label: '保持谦逊·通过心魔考验', icon: '🧘', rarity: 'SS', weight: 25, levelBoost: 6, worldImpact: { qianRenXue: { met: true, affinity: 20 } } },
        { label: '质疑天使神·引发辩论',   icon: '💬', rarity: 'S', weight: 28, levelBoost: 4 },
        { label: '拒绝·不需要天使认可',   icon: '🙅', rarity: 'B', weight: 20, levelBoost: 2 },
        { label: '攻击她·被轻松化解',     icon: '⚔️', rarity: 'C', weight: 15, levelBoost: 3, worldImpact: { qianRenXue: { met: true, affinity: -20 } } },
      ]
    },
  },
  { id: 'lvl_tangHao_85', title: '🔨 昊天传承', icon: '💪', minLevel: 80, maxLevel: 93, rarity: 'SSS', isMilestone: true,
    prelude: '唐昊独臂扛着昊天锤。"你走的路比唐三更远。你配得上昊天锤的传承吗？"命运之轮，请转动——',
    computeOptions(state) {
      return [
        { label: '接下昊天三锤·获得传承！！', icon: '🔨', rarity: 'SSS', weight: 10, levelBoost: 12, worldImpact: { tangHao: { met: true, affinity: 50 }, tangSan: { met: true, affinity: 20 } } },
        { label: '接下一锤·唐昊微微点头',     icon: '💪', rarity: 'SS', weight: 22, levelBoost: 8, worldImpact: { tangHao: { met: true, affinity: 25 } } },
        { label: '以智取胜·不硬接',           icon: '🧠', rarity: 'S', weight: 30, levelBoost: 5 },
        { label: '被震飞·唐昊没下杀手',       icon: '💨', rarity: 'A', weight: 20, levelBoost: 3 },
        { label: '不敢应战·被鄙视',           icon: '😔', rarity: 'C', weight: 18, levelBoost: 1, worldImpact: { tangHao: { met: true, affinity: -15 } } },
      ]
    },
  },
  { id: 'lvl_bibi_95', title: '👸 教皇终局', icon: '💀', minLevel: 90, maxLevel: 100, rarity: 'SSS', isMilestone: true,
    prelude: '比比东在教皇殿最深处召见你。"你已走到这一步。最后的机会——你站在哪一边？"命运之轮，请转动——',
    computeOptions(state) {
      const isEnemy = state.relationships?.biBiDong?.faction === 'enemy'
      return [
        { label: '正面对抗·拒绝屈服！！', icon: '⚔️', rarity: 'SSS', weight: isEnemy ? 25 : 8, levelBoost: 12, worldImpact: { biBiDong: { affinity: -100, faction: 'enemy' } } },
        { label: '假意臣服·暗中图谋',     icon: '🕵️', rarity: 'SS', weight: 20, levelBoost: 6, worldImpact: { biBiDong: { affinity: 20 } } },
        { label: '谈判·要求放弃猎魂行动', icon: '🤝', rarity: 'S', weight: 22, levelBoost: 5 },
        { label: '接受招揽·加入武魂殿',   icon: '⛪', rarity: 'A', weight: 18, levelBoost: 8, worldImpact: { biBiDong: { affinity: 50, faction: 'friend' } } },
        { label: '逃跑·不敢面对',         icon: '🏃', rarity: 'C', weight: 15, levelBoost: 2 },
        { label: '被看穿·强行囚禁',       icon: '🔗', rarity: 'B', weight: 10, levelBoost: 4, worldImpact: { biBiDong: { affinity: -30 } } },
      ]
    },
  },
  { id: 'lvl_all_100', title: '🌟 传说之巅', icon: '👑', minLevel: 99, maxLevel: 100, rarity: 'SSS', isMilestone: true,
    prelude: '你站在了大陆巅峰——百级成神！所有伙伴齐聚。"无论你去哪里，你永远是七怪的一员。"命运之轮，请转动——',
    computeOptions(state) {
      return [
        { label: '全员羁绊·传说不朽！！', icon: '🌟', rarity: 'SSS', weight: 25, levelBoost: 10, worldImpact: { tangSan: { affinity: 30 }, xiaoWu: { affinity: 30 }, daiMuBai: { affinity: 20 }, oscar: { affinity: 20 }, maHongJun: { affinity: 20 }, ningRongRong: { affinity: 20 }, zhuZhuQing: { affinity: 20 } } },
        { label: '许下承诺·永远守护大陆', icon: '🤞', rarity: 'SS', weight: 35, levelBoost: 6 },
        { label: '留下传承·给后来者希望', icon: '📜', rarity: 'S', weight: 25, levelBoost: 5 },
        { label: '独自飞升·留下背影',     icon: '☁️', rarity: 'A', weight: 10, levelBoost: 3 },
        { label: '拒绝飞升·留在大陆',     icon: '🏠', rarity: 'B', weight: 5, levelBoost: 2 },
      ]
    },
  },
  // ==================== 剧情后续补充 ====================
  {
    id: 'xiaoWu_reunion', title: '🐰 终得团聚', icon: '💕', minLevel: 55, maxLevel: 85, rarity: 'SSS', isMilestone: true,
    requiredEvents: ['xiaoWu_guardian'],
    prelude: '在你拼死守护之后，小舞终于和唐三团聚。唐三握着你的手："谢谢你。这份恩情，我唐三永世不忘。"命运之轮，请转动——',
    computeOptions(state) {
      return [
        { label: '见证团聚·获得双人祝福！！', icon: '💕', rarity: 'SSS', weight: 25, levelBoost: 8, worldImpact: { tangSan: { affinity: 60 }, xiaoWu: { affinity: 60 } } },
        { label: '默默退开·让他们独处',       icon: '🚶', rarity: 'SS', weight: 35, levelBoost: 5, worldImpact: { tangSan: { affinity: 30 }, xiaoWu: { affinity: 30 } } },
        { label: '唐三传授海神之心',           icon: '🌊', rarity: 'S', weight: 25, levelBoost: 7, worldImpact: { tangSan: { affinity: 40 } } },
        { label: '觉得他们太肉麻·先走了',     icon: '😅', rarity: 'B', weight: 15, levelBoost: 3 },
      ]
    },
  },
  {
    id: 'dai_coronation', title: '👑 星罗加冕', icon: '🏰', minLevel: 60, maxLevel: 85, rarity: 'SSS', isMilestone: true,
    requiredEvents: ['dai_throne'],
    prelude: '戴沐白击败戴维斯，正式加冕星罗帝国皇帝！"没有你，就没有今天的我。"命运之轮，请转动——',
    computeOptions(state) {
      return [
        { label: '成为荣誉亲王！！',   icon: '👑', rarity: 'SSS', weight: 18, levelBoost: 10, worldImpact: { daiMuBai: { affinity: 60 } } },
        { label: '接受帝国勋章',       icon: '🎖️', rarity: 'SS', weight: 30, levelBoost: 6, worldImpact: { daiMuBai: { affinity: 40 } } },
        { label: '婉拒·不想被束缚',   icon: '🙅', rarity: 'S', weight: 28, levelBoost: 4 },
        { label: '加冕遇刺·救下沐白', icon: '🛡️', rarity: 'SSS', weight: 12, levelBoost: 8, worldImpact: { daiMuBai: { affinity: 80 } } },
        { label: '不参加·太远了',     icon: '😴', rarity: 'C', weight: 12 },
      ]
    },
  },
  {
    id: 'oscar_mastery', title: '🌭 食物封神', icon: '🍖', minLevel: 55, maxLevel: 75, rarity: 'SS', isMilestone: true,
    prelude: '奥斯卡激动地跑来："我成功了！我创造出能临时提升魂师等级的超级香肠！"命运之轮，请转动——',
    computeOptions(state) {
      return [
        { label: '第一个试吃·效果惊人！！', icon: '🍖', rarity: 'SSS', weight: 18, levelBoost: 7, worldImpact: { oscar: { met: true, affinity: 40 } } },
        { label: '帮他改良配方·效果更佳',   icon: '🧪', rarity: 'SS', weight: 28, levelBoost: 5, worldImpact: { oscar: { met: true, affinity: 30 } } },
        { label: '鼓励他·信心大增',         icon: '💪', rarity: 'S', weight: 30, levelBoost: 3 },
        { label: '不感兴趣·食物系是辅助',   icon: '🤷', rarity: 'B', weight: 24 },
      ]
    },
  },
  {
    id: 'fatty_mastery', title: '🔥 邪火掌控', icon: '🐦', minLevel: 55, maxLevel: 78, rarity: 'SS', isMilestone: true,
    prelude: '马红俊终于找到了控制邪火的方法！他的邪火凤凰武魂发生了质变！命运之轮，请转动——',
    computeOptions(state) {
      return [
        { label: '见证凤凰涅槃·获得感悟！！', icon: '🔥', rarity: 'SSS', weight: 15, levelBoost: 8, worldImpact: { maHongJun: { met: true, affinity: 40 } } },
        { label: '帮他压制最后邪火·成功',     icon: '🧯', rarity: 'SS', weight: 28, levelBoost: 5, worldImpact: { maHongJun: { met: true, affinity: 30 } } },
        { label: '获得邪火淬炼·魂力大增',     icon: '⚡', rarity: 'S', weight: 30, levelBoost: 6 },
        { label: '邪火爆发·被波及受伤',       icon: '🤕', rarity: 'B', weight: 17, levelBoost: 3 },
        { label: '不敢靠近·远远观望',         icon: '😰', rarity: 'C', weight: 10 },
      ]
    },
  },
  {
    id: 'zhu_redemption', title: '🐱 猫咪归心', icon: '💫', minLevel: 60, maxLevel: 82, rarity: 'SS', isMilestone: true,
    prelude: '朱竹清卸下了暗杀者的身份，露出罕见的微笑。"谢谢你。如果不是你，我可能一辈子活在阴影里。"命运之轮，请转动——',
    computeOptions(state) {
      return [
        { label: '帮她找到新的人生方向', icon: '🧭', rarity: 'SSS', weight: 18, levelBoost: 6, worldImpact: { zhuZhuQing: { met: true, affinity: 40 } } },
        { label: '推荐她加入史莱克任教', icon: '🏫', rarity: 'SS', weight: 28, levelBoost: 4, worldImpact: { zhuZhuQing: { met: true, affinity: 25 } } },
        { label: '让她跟随自己历练',     icon: '🤝', rarity: 'S', weight: 30, levelBoost: 5, worldImpact: { zhuZhuQing: { met: true, affinity: 30 } } },
        { label: '不需要我的帮助',       icon: '😶', rarity: 'B', weight: 24, levelBoost: 2 },
      ]
    },
  },
  {
    id: 'tang_farewell', title: '🌿 唐三告别', icon: '👋', minLevel: 65, maxLevel: 90, rarity: 'SSS', isMilestone: true,
    requiredEvents: ['tang_oath'],
    prelude: '唐三即将远行前往神界。"这一去，不知何时才能再见。保重。持此令牌，唐门永远是你的家。"命运之轮，请转动——',
    computeOptions(state) {
      return [
        { label: '郑重收下·许下重逢之约！！', icon: '🤝', rarity: 'SSS', weight: 25, levelBoost: 8, worldImpact: { tangSan: { affinity: 50 } } },
        { label: '唐三传授鬼影迷踪最终式',     icon: '💨', rarity: 'SS', weight: 30, levelBoost: 7, worldImpact: { tangSan: { affinity: 30 } } },
        { label: '拥抱告别·泪流满面',         icon: '😢', rarity: 'S', weight: 25, levelBoost: 5, worldImpact: { tangSan: { affinity: 40 } } },
        { label: '拒绝令牌·不想欠人情',       icon: '🙅', rarity: 'B', weight: 15, levelBoost: 2 },
        { label: '不告而别·怕自己太难过',     icon: '💔', rarity: 'C', weight: 5 },
      ]
    },
  },
  // ==================== 章节关键剧情 ====================
  {
    id: 'chapter_climax_1', title: '⚡ 武魂觉醒·命运起点', icon: '✨', minLevel: 1, maxLevel: 20, rarity: 'SSS', isMilestone: true,
    prelude: '武魂殿的觉醒水晶在你面前闪耀——改变你一生的瞬间。命运之轮，请转动——',
    computeOptions(state) {
      return [
        { label: '光芒万丈·震惊全场！！', icon: '✨', rarity: 'SSS', weight: 12, levelBoost: 6 },
        { label: '顺利觉醒·迈出第一步',   icon: '💡', rarity: 'SS', weight: 28, levelBoost: 4 },
        { label: '平凡觉醒·路还很长',     icon: '🔮', rarity: 'B', weight: 35, levelBoost: 2 },
        { label: '觉醒受阻·激发潜能',     icon: '💪', rarity: 'A', weight: 25, levelBoost: 3 },
      ]
    },
  },
  {
    id: 'chapter_climax_2', title: '⚡ 诺丁毕业·告别母校', icon: '🎓', minLevel: 20, maxLevel: 40, rarity: 'SSS', isMilestone: true,
    requiredEvents: ['firstTeacher'],
    prelude: '诺丁学院的钟声最后一次为你而鸣。转身踏上征程。命运之轮，请转动——',
    computeOptions(state) {
      return [
        { label: '最优成绩·全校欢送', icon: '🏅', rarity: 'SSS', weight: 15, levelBoost: 6 },
        { label: '顺利毕业·老师赠言', icon: '📜', rarity: 'SS', weight: 30, levelBoost: 4 },
        { label: '普通毕业·心怀梦想', icon: '🎒', rarity: 'B', weight: 35, levelBoost: 2 },
        { label: '提前毕业·天赋异禀', icon: '⚡', rarity: 'S', weight: 20, levelBoost: 5 },
      ]
    },
  },
  {
    id: 'chapter_climax_3', title: '⚡ 精英赛夺冠·名震大陆', icon: '🏆', minLevel: 40, maxLevel: 60, rarity: 'SSS', isMilestone: true,
    requiredEvents: ['arc_tournament_1'],
    prelude: '武魂城中央大斗魂场的聚光灯——冠军奖杯就在眼前！命运之轮，请转动——',
    computeOptions(state) {
      return [
        { label: '举起奖杯·大陆震动！！', icon: '🏆', rarity: 'SSS', weight: 10, levelBoost: 12, worldImpact: { biBiDong: { met: true, affinity: 10 } } },
        { label: '亚军·全场为你鼓掌',     icon: '🥈', rarity: 'SS', weight: 25, levelBoost: 8 },
        { label: '季军·实力获认可',       icon: '🥉', rarity: 'S', weight: 30, levelBoost: 6 },
        { label: '未夺冠·一战成名',       icon: '⚔️', rarity: 'A', weight: 25, levelBoost: 5 },
        { label: '觉醒新力·虽败犹荣',     icon: '💫', rarity: 'SS', weight: 10, levelBoost: 10 },
      ]
    },
  },
  {
    id: 'chapter_climax_4', title: '⚡ 大陆烽火·抉择时刻', icon: '⚔️', minLevel: 55, maxLevel: 80, rarity: 'SSS', isMilestone: true,
    requiredEvents: ['huntStarted'],
    prelude: '武魂帝国铁蹄踏遍大陆。求援信——"嘉陵关告急！"命运之轮，请转动——',
    computeOptions(state) {
      return [
        { label: '率军驰援·成为联军统帅！！', icon: '⚔️', rarity: 'SSS', weight: 12, levelBoost: 10, worldImpact: { tangSan: { affinity: 30 } } },
        { label: '亲自上阵·以一当百',         icon: '💪', rarity: 'SS', weight: 22, levelBoost: 8 },
        { label: '制定战略·运筹帷幄',         icon: '🧠', rarity: 'S', weight: 28, levelBoost: 6 },
        { label: '保护后方·保障补给',         icon: '🛡️', rarity: 'A', weight: 25, levelBoost: 4 },
        { label: '坐山观虎斗',                icon: '👀', rarity: 'C', weight: 13, levelBoost: 2 },
      ]
    },
  },
  {
    id: 'chapter_climax_5', title: '⚡ 封神之路·最后试炼', icon: '🔱', minLevel: 85, maxLevel: 100, rarity: 'SSS', isMilestone: true,
    requiredEvents: ['godTrial'],
    prelude: '神界之门打开——海神、修罗神、天使神三位主神虚影出现。"选择吧——"命运之轮，请转动——',
    computeOptions(state) {
      return [
        { label: '海神·大海守护者',   icon: '🌊', rarity: 'SSS', weight: 20, levelBoost: 10 },
        { label: '修罗神·杀戮审判',   icon: '⚔️', rarity: 'SSS', weight: 18, levelBoost: 10 },
        { label: '天使神·光明希望',   icon: '👼', rarity: 'SS', weight: 22, levelBoost: 8 },
        { label: '拒绝·以凡躯比肩神', icon: '💪', rarity: 'SS', weight: 15, levelBoost: 12 },
        { label: '自创神位·独一无二', icon: '💫', rarity: 'SSS', weight: 10, levelBoost: 15 },
        { label: '犹豫·神界等待',     icon: '🤔', rarity: 'C', weight: 15, levelBoost: 5 },
      ]
    },
  },
  {
    id: 'chapter_climax_6', title: '⚡ 封神加冕·传说永存', icon: '👑', minLevel: 95, maxLevel: 100, rarity: 'SSS', isMilestone: true,
    requiredEvents: ['chapter_climax_5'],
    prelude: '百级成神！神界加冕大典——所有伙伴站在神界之门前为你送行。命运之轮，请转动——',
    computeOptions(state) {
      return [
        { label: '接受加冕·成为新任主神！！', icon: '👑', rarity: 'SSS', weight: 25, levelBoost: 10 },
        { label: '分享神位·与众神共治',       icon: '🤝', rarity: 'SS', weight: 30, levelBoost: 8 },
        { label: '低调加冕·不喜张扬',         icon: '😌', rarity: 'S', weight: 25, levelBoost: 6 },
        { label: '拒绝加冕·回到人间',         icon: '🏠', rarity: 'A', weight: 15, levelBoost: 4 },
        { label: '加冕失败·但已成传说',       icon: '💔', rarity: 'C', weight: 5, levelBoost: 3 },
      ]
    },
  },
  // ==================== 武器获取事件（10件，Lv.10-100） ====================
  {
    id: 'weapon_iron', title: '⚔️ 精铁长剑', icon: '🗡️', minLevel: 10, maxLevel: 25, rarity: 'B',
    prelude: '铁匠铺老师傅递给你一把精铁长剑——"虽不是神兵，但比空手强。"命运之轮，请转动——',
    computeOptions(state) {
      return [
        { label: '获得精铁长剑·+30', icon: '🗡️', rarity: 'A', weight: 35, levelBoost: 2, weapon: { name: '精铁长剑', power: 30, rarity: 'B', source: '铁匠铺' } },
        { label: '自己改良·+40',     icon: '🔨', rarity: 'S', weight: 20, levelBoost: 3, weapon: { name: '改良铁剑', power: 40, rarity: 'A', source: '自制' } },
        { label: '普通铁剑·+15',     icon: '⚔️', rarity: 'B', weight: 30, levelBoost: 1, weapon: { name: '铁剑', power: 15, rarity: 'C', source: '铁匠铺' } },
        { label: '婉拒',             icon: '🙅', rarity: 'C', weight: 15 },
      ]
    },
  },
  {
    id: 'weapon_shadow', title: '🏹 含沙射影', icon: '🌑', minLevel: 12, maxLevel: 28, rarity: 'A',
    prelude: '神秘商贩兜售精巧暗器——含沙射影，瞬间发射数十枚毒针。命运之轮，请转动——',
    computeOptions(state) {
      return [
        { label: '购得真品·+45',   icon: '🌑', rarity: 'SS', weight: 18, levelBoost: 3, weapon: { name: '含沙射影', power: 45, rarity: 'A', source: '神秘商贩' } },
        { label: '买下仿品·+30',   icon: '🏹', rarity: 'A', weight: 30, levelBoost: 2, weapon: { name: '含沙射影(仿)', power: 30, rarity: 'B', source: '市集' } },
        { label: '太贵·放弃',     icon: '💰', rarity: 'B', weight: 30, levelBoost: 1 },
        { label: '识破骗局',       icon: '👁️', rarity: 'C', weight: 22 },
      ]
    },
  },
  {
    id: 'weapon_peacock', title: '🦚 孔雀翎', icon: '💫', minLevel: 30, maxLevel: 50, rarity: 'SS',
    requiredEvents: ['interact_tangSanNight'],
    prelude: '唐三从唐门密匣取出孔雀翎——"外门暗器排名第三。十二枚翎羽同时射出。"命运之轮，请转动——',
    computeOptions(state) {
      return [
        { label: '获得孔雀翎·+70',   icon: '🦚', rarity: 'SSS', weight: 15, levelBoost: 5, weapon: { name: '孔雀翎', power: 70, rarity: 'SS', source: '唐三' } },
        { label: '学会装配·+60',     icon: '🔧', rarity: 'SS', weight: 28, levelBoost: 3, weapon: { name: '孔雀翎(熟悉)', power: 60, rarity: 'S', source: '唐三' } },
        { label: '备用翎羽·+45',     icon: '🪶', rarity: 'A', weight: 30, levelBoost: 2, weapon: { name: '孔雀翎羽', power: 45, rarity: 'A', source: '唐三' } },
        { label: '太贵重·婉拒',     icon: '🙏', rarity: 'B', weight: 27, levelBoost: 1 },
      ]
    },
  },
  {
    id: 'weapon_crossbow', title: '🏹 诸葛神弩', icon: '🎯', minLevel: 35, maxLevel: 55, rarity: 'SS',
    requiredEvents: ['weapon_peacock'],
    prelude: '唐三又带来诸葛神弩——"四十八支弩箭，魂王以下一发毙命。"命运之轮，请转动——',
    computeOptions(state) {
      return [
        { label: '获得诸葛神弩·+90',   icon: '🎯', rarity: 'SSS', weight: 15, levelBoost: 6, weapon: { name: '诸葛神弩', power: 90, rarity: 'SS', source: '唐三' } },
        { label: '学会装填·+75',       icon: '🔧', rarity: 'SS', weight: 28, levelBoost: 4, weapon: { name: '诸葛神弩(熟练)', power: 75, rarity: 'S', source: '唐三' } },
        { label: '获得图纸·+55',       icon: '📜', rarity: 'S', weight: 30, levelBoost: 3, weapon: { name: '自制诸葛弩', power: 55, rarity: 'A', source: '自制' } },
        { label: '暗器非正道·婉拒',   icon: '🙅', rarity: 'B', weight: 27, levelBoost: 1 },
      ]
    },
  },
  {
    id: 'weapon_rain', title: '☔ 暴雨梨花针', icon: '🌸', minLevel: 50, maxLevel: 70, rarity: 'SSS',
    requiredEvents: ['weapon_crossbow'],
    prelude: '唐三神色凝重地取出暴雨梨花针——"唐门排名第二。二百七十三枚梨花针，封号斗罗以下无可闪避。"命运之轮，请转动——',
    computeOptions(state) {
      return [
        { label: '获得暴雨梨花针·+120',   icon: '🌸', rarity: 'SSS', weight: 12, levelBoost: 8, weapon: { name: '暴雨梨花针', power: 120, rarity: 'SSS', source: '唐三' } },
        { label: '获得简化版·+85',         icon: '🌧️', rarity: 'SS', weight: 25, levelBoost: 5, weapon: { name: '暴雨针(简)', power: 85, rarity: 'S', source: '唐三' } },
        { label: '学习制造·+100',          icon: '📖', rarity: 'S', weight: 30, levelBoost: 6, weapon: { name: '梨花针套装', power: 100, rarity: 'SS', source: '唐三' } },
        { label: '太危险·放弃',           icon: '😰', rarity: 'C', weight: 33, levelBoost: 2 },
      ]
    },
  },
  {
    id: 'weapon_spear', title: '🔱 破魂枪', icon: '🗡️', minLevel: 55, maxLevel: 75, rarity: 'SS',
    prelude: '破之一族族长杨无敌找到你——"破魂枪，专破武魂防御。"命运之轮，请转动——',
    computeOptions(state) {
      return [
        { label: '获得破魂枪·+130',   icon: '🔱', rarity: 'SSS', weight: 12, levelBoost: 7, weapon: { name: '破魂枪', power: 130, rarity: 'SS', source: '杨无敌' } },
        { label: '学会枪法·+110',     icon: '⚔️', rarity: 'SS', weight: 25, levelBoost: 6, weapon: { name: '破魂枪(精通)', power: 110, rarity: 'S', source: '杨无敌' } },
        { label: '暂借·+80',         icon: '📋', rarity: 'A', weight: 30, levelBoost: 4, weapon: { name: '破魂枪(借用)', power: 80, rarity: 'A', source: '杨无敌' } },
        { label: '不适合·婉拒',       icon: '🙅', rarity: 'B', weight: 33, levelBoost: 2 },
      ]
    },
  },
  {
    id: 'weapon_guide', title: '💎 魂导器', icon: '🔮', minLevel: 60, maxLevel: 80, rarity: 'SS',
    prelude: '魂导器大师看中你的天赋——"这件魂导器可以增幅你的魂力输出。"命运之轮，请转动——',
    computeOptions(state) {
      return [
        { label: '获得魂导器·+160',   icon: '🔮', rarity: 'SSS', weight: 12, levelBoost: 6, weapon: { name: '魂导增幅器', power: 160, rarity: 'SS', source: '魂导大师' } },
        { label: '学习魂导技术·+130', icon: '📖', rarity: 'SS', weight: 22, levelBoost: 5, weapon: { name: '自制魂导器', power: 130, rarity: 'S', source: '自制' } },
        { label: '魂导护盾·+100',     icon: '🛡️', rarity: 'S', weight: 30, levelBoost: 4, weapon: { name: '魂导护盾', power: 100, rarity: 'A', source: '魂导大师' } },
        { label: '太复杂·放弃',       icon: '😵', rarity: 'C', weight: 36, levelBoost: 2 },
      ]
    },
  },
  {
    id: 'weapon_lotus', title: '🪷 佛怒唐莲', icon: '🌸', minLevel: 75, maxLevel: 95, rarity: 'SSS',
    requiredEvents: ['weapon_rain'],
    prelude: '唐三打开唐门最核心的密匣——佛怒唐莲！"唐门排名第一。绽放时如佛莲盛开，方圆百丈寸草不生。"命运之轮，请转动——',
    computeOptions(state) {
      return [
        { label: '获得佛怒唐莲·+250',   icon: '🪷', rarity: 'SSS', weight: 8, levelBoost: 10, weapon: { name: '佛怒唐莲', power: 250, rarity: 'SSS', source: '唐三' } },
        { label: '仿制品·+180',         icon: '🌺', rarity: 'SS', weight: 22, levelBoost: 7, weapon: { name: '佛怒唐莲(仿)', power: 180, rarity: 'SS', source: '唐三' } },
        { label: '暗器总纲·+200',       icon: '📖', rarity: 'S', weight: 30, levelBoost: 8, weapon: { name: '唐门暗器总纲', power: 200, rarity: 'SS', source: '唐门传承' } },
        { label: '太危险·拒绝',         icon: '😰', rarity: 'C', weight: 40, levelBoost: 2 },
      ]
    },
  },
  {
    id: 'weapon_trident', title: '🔱 海神三叉戟', icon: '🌊', minLevel: 70, maxLevel: 100, rarity: 'SSS',
    requiredEvents: ['arc_seagod_8'],
    prelude: '海神三叉戟认可了你——十万八千斤的神器在你手中轻如鸿毛！命运之轮，请转动——',
    computeOptions(state) {
      return [
        { label: '掌控三叉戟·+500', icon: '🔱', rarity: 'SSS', weight: 10, levelBoost: 10, weapon: { name: '海神三叉戟', power: 500, rarity: 'SSS', source: '海神' } },
        { label: '融合印记·+350',   icon: '💙', rarity: 'SS', weight: 28, levelBoost: 8, weapon: { name: '海神三叉戟(觉醒中)', power: 350, rarity: 'SS', source: '海神' } },
        { label: '虚影·+200',       icon: '🔱', rarity: 'S', weight: 35, levelBoost: 6, weapon: { name: '三叉戟虚影', power: 200, rarity: 'S', source: '海神' } },
        { label: '太重·无法使用',   icon: '😔', rarity: 'C', weight: 27, levelBoost: 3 },
      ]
    },
  },
  {
    id: 'weapon_dragonboat', title: '⛵ 龙渊艇', icon: '🚤', minLevel: 55, maxLevel: 80, rarity: 'SS',
    prelude: '唐门密库中发现一件奇特魂导器——龙渊艇！可潜水航行的神器。命运之轮，请转动——',
    computeOptions(state) {
      return [
        { label: '获得龙渊艇·战力+120', icon: '⛵', rarity: 'SSS', weight: 15, levelBoost: 5, weapon: { name: '龙渊艇', power: 120, rarity: 'SS', source: '唐门密库' } },
        { label: '学会驾驶技巧',         icon: '🧭', rarity: 'SS', weight: 25, levelBoost: 4, weapon: { name: '龙渊艇(熟练)', power: 100, rarity: 'S', source: '自学' } },
        { label: '太复杂·放弃',         icon: '😵', rarity: 'B', weight: 30, levelBoost: 2 },
        { label: '转送给唐三·获得人情', icon: '🎁', rarity: 'A', weight: 30, levelBoost: 3 },
      ]
    },
  },
  {
    id: 'weapon_angel', title: '👼 天使圣剑', icon: '🗡️', minLevel: 65, maxLevel: 90, rarity: 'SSS',
    requiredEvents: ['arc_angel_6'],
    prelude: '天使神殿中一把圣剑悬浮在空中——天使圣剑！命运之轮，请转动——',
    computeOptions(state) {
      return [
        { label: '获得天使圣剑·+180', icon: '👼', rarity: 'SSS', weight: 12, levelBoost: 8, weapon: { name: '天使圣剑', power: 180, rarity: 'SSS', source: '天使神' } },
        { label: '获得天使之刃·+140', icon: '✨', rarity: 'SS', weight: 25, levelBoost: 6, weapon: { name: '天使之刃', power: 140, rarity: 'SS', source: '天使神' } },
        { label: '获得祝福之剑·+100', icon: '⚔️', rarity: 'S', weight: 30, levelBoost: 5, weapon: { name: '祝福之剑', power: 100, rarity: 'S', source: '天使神' } },
        { label: '圣剑不认可·被拒绝', icon: '😔', rarity: 'C', weight: 33, levelBoost: 2 },
      ]
    },
  },
  {
    id: 'weapon_death', title: '💀 死神镰刀', icon: '🪝', minLevel: 70, maxLevel: 95, rarity: 'SSS',
    prelude: '死亡领域深处浮现一把漆黑镰刀——死神镰刀！命运之轮，请转动——',
    computeOptions(state) {
      return [
        { label: '掌控死神镰刀·+200', icon: '💀', rarity: 'SSS', weight: 10, levelBoost: 8, weapon: { name: '死神镰刀', power: 200, rarity: 'SSS', source: '死亡领域' } },
        { label: '部分掌控·+150',     icon: '🪝', rarity: 'SS', weight: 22, levelBoost: 6, weapon: { name: '死神镰刀(部分)', power: 150, rarity: 'SS', source: '死亡领域' } },
        { label: '被镰刀反噬·受伤',   icon: '🤕', rarity: 'A', weight: 30, levelBoost: 4 },
        { label: '拒绝·太危险',       icon: '🚫', rarity: 'C', weight: 38, levelBoost: 2 },
      ]
    },
  },
  {
    id: 'weapon_icefire', title: '❄️ 冰火双剑', icon: '🔥', minLevel: 60, maxLevel: 85, rarity: 'SS',
    requiredEvents: ['iceFireWell'],
    prelude: '冰火两仪眼中凝聚出两把剑——一把烈焰灼天，一把寒冰封海。命运之轮，请转动——',
    computeOptions(state) {
      return [
        { label: '获得冰火双剑·+160', icon: '🔥', rarity: 'SSS', weight: 12, levelBoost: 7, weapon: { name: '冰火双剑', power: 160, rarity: 'SS', source: '冰火两仪眼' } },
        { label: '火剑·+100',         icon: '🔥', rarity: 'SS', weight: 22, levelBoost: 5, weapon: { name: '烈焰剑', power: 100, rarity: 'S', source: '冰火两仪眼' } },
        { label: '冰剑·+100',         icon: '❄️', rarity: 'SS', weight: 22, levelBoost: 5, weapon: { name: '寒冰剑', power: 100, rarity: 'S', source: '冰火两仪眼' } },
        { label: '无法收服·剑消失了', icon: '💨', rarity: 'C', weight: 44, levelBoost: 2 },
      ]
    },
  },
  {
    id: 'weapon_umbrella', title: '☂️ 天机伞', icon: '🌂', minLevel: 50, maxLevel: 75, rarity: 'A',
    prelude: '一位机关大师展示他的杰作——天机伞！攻防一体的机关武器。命运之轮，请转动——',
    computeOptions(state) {
      return [
        { label: '获得天机伞·+90', icon: '☂️', rarity: 'SS', weight: 18, levelBoost: 4, weapon: { name: '天机伞', power: 90, rarity: 'A', source: '机关大师' } },
        { label: '学会机关术·+70', icon: '🔧', rarity: 'S', weight: 22, levelBoost: 3, weapon: { name: '天机伞(熟悉)', power: 70, rarity: 'A', source: '自学' } },
        { label: '太贵·放弃',     icon: '💰', rarity: 'B', weight: 30, levelBoost: 2 },
        { label: '看不上·离开',   icon: '😒', rarity: 'C', weight: 30, levelBoost: 1 },
      ]
    },
  },
  {
    id: 'weapon_abyss', title: '👁️ 深渊之眼', icon: '🔮', minLevel: 75, maxLevel: 100, rarity: 'SSS',
    prelude: '神界裂缝中掉落一颗深渊之眼——它能看破一切虚妄！命运之轮，请转动——',
    computeOptions(state) {
      return [
        { label: '融合深渊之眼·+220', icon: '👁️', rarity: 'SSS', weight: 8, levelBoost: 9, weapon: { name: '深渊之眼', power: 220, rarity: 'SSS', source: '神界裂缝' } },
        { label: '部分融合·+170',     icon: '🔮', rarity: 'SS', weight: 20, levelBoost: 7, weapon: { name: '深渊之眼(部分)', power: 170, rarity: 'SS', source: '神界裂缝' } },
        { label: '反噬·获得洞察力',   icon: '💡', rarity: 'S', weight: 30, levelBoost: 5, weapon: { name: '洞察之眼', power: 120, rarity: 'S', source: '神界裂缝' } },
        { label: '太大风险·放弃',     icon: '😰', rarity: 'C', weight: 42, levelBoost: 2 },
      ]
    },
  },
  {
    id: 'weapon_godSlayer', title: '⚔️ 弑神之刃', icon: '🗡️', minLevel: 85, maxLevel: 100, rarity: 'SSS',
    requiredEvents: ['canon_godWar'],
    prelude: '双神之战后残留下来的弑神之刃——它曾刺穿过神明的躯体！命运之轮，请转动——',
    computeOptions(state) {
      return [
        { label: '收服弑神之刃·+300', icon: '🗡️', rarity: 'SSS', weight: 6, levelBoost: 12, weapon: { name: '弑神之刃', power: 300, rarity: 'SSS', source: '双神之战' } },
        { label: '碎片重铸·+200',     icon: '🔨', rarity: 'SS', weight: 18, levelBoost: 8, weapon: { name: '弑神碎片', power: 200, rarity: 'SS', source: '双神之战' } },
        { label: '力量太强·放弃',     icon: '😰', rarity: 'A', weight: 35, levelBoost: 3 },
        { label: '被刃反噬·重伤',     icon: '🤕', rarity: 'C', weight: 41, levelBoost: 2 },
      ]
    },
  },
  {
    id: 'weapon_fate', title: '📜 命运之书', icon: '📖', minLevel: 95, maxLevel: 100, rarity: 'SSS',
    prelude: '神界图书馆的守护者递给你一本金色书籍——命运之书！记录了整个斗罗大陆的命运。命运之轮，请转动——',
    computeOptions(state) {
      return [
        { label: '获得命运之书·+350', icon: '📖', rarity: 'SSS', weight: 5, levelBoost: 10, weapon: { name: '命运之书', power: 350, rarity: 'SSS', source: '神界图书馆' } },
        { label: '抄录副本·+250',     icon: '📝', rarity: 'SS', weight: 15, levelBoost: 8, weapon: { name: '命运之书(副本)', power: 250, rarity: 'SS', source: '神界图书馆' } },
        { label: '无法读懂·放弃',     icon: '😵', rarity: 'B', weight: 35, levelBoost: 3 },
        { label: '太沉重·承受不了',   icon: '😰', rarity: 'C', weight: 45, levelBoost: 2 },
      ]
    },
  },
  // ==================== 多样化生活事件 ====================
  {
    id: 'event_sparring', title: '🤼 切磋交流', icon: '🥋', minLevel: 15, maxLevel: 40, rarity: 'B',
    prelude: '一位同级学员邀请你切磋——友好较量，互相学习。命运之轮，请转动——',
    computeOptions(state) {
      return [
        { label: '认真对待·双方提升', icon: '🤝', rarity: 'SS', weight: 20, levelBoost: 3 },
        { label: '轻松切磋·点到为止', icon: '👊', rarity: 'A', weight: 30, levelBoost: 2 },
        { label: '指导对方·获得感激', icon: '👨‍🏫', rarity: 'S', weight: 15, levelBoost: 2 },
        { label: '不小心打伤对方',     icon: '🤕', rarity: 'C', weight: 20, levelBoost: 1 },
        { label: '被对方打败·吸取教训', icon: '📖', rarity: 'C', weight: 15, levelBoost: 1 },
      ]
    },
  },
  {
    id: 'event_meditation', title: '🧘 深夜冥想', icon: '🌙', minLevel: 10, maxLevel: 50, rarity: 'B',
    prelude: '深夜月光洒在窗前。你盘膝进入深度冥想——命运之轮，请转动——',
    computeOptions(state) {
      return [
        { label: '顿悟！魂力突破瓶颈', icon: '💡', rarity: 'SSS', weight: 10, levelBoost: 5 },
        { label: '冥想顺利·魂力稳固', icon: '🧘', rarity: 'A', weight: 30, levelBoost: 2 },
        { label: '浅层冥想·略有收获', icon: '😌', rarity: 'B', weight: 35, levelBoost: 1 },
        { label: '心绪不宁·无法入定', icon: '😰', rarity: 'C', weight: 25 },
      ]
    },
  },
  {
    id: 'event_rain', title: '🌧️ 雨中偶遇', icon: '☂️', minLevel: 12, maxLevel: 45, rarity: 'A',
    prelude: '暴雨突降，你在屋檐下避雨。身边站着一个同样被困的陌生人……命运之轮，请转动——',
    computeOptions(state) {
      return [
        { label: '攀谈起来·交换修炼心得', icon: '💬', rarity: 'SS', weight: 20, levelBoost: 3 },
        { label: '分享干粮·收获友谊',     icon: '🍞', rarity: 'S', weight: 18, levelBoost: 2 },
        { label: '借给对方伞·自己淋雨',   icon: '☂️', rarity: 'SSS', weight: 12, levelBoost: 2 },
        { label: '保持沉默·等待雨停',     icon: '😶', rarity: 'B', weight: 30, levelBoost: 1 },
        { label: '抱怨天气·对方走开了',   icon: '😤', rarity: 'C', weight: 20 },
      ]
    },
  },
  {
    id: 'event_blacksmith', title: '⚒️ 铁匠铺', icon: '🔨', minLevel: 20, maxLevel: 55, rarity: 'B',
    prelude: '老铁匠看到你后停了手中的活——"年轻人，想定制一把趁手的武器吗？"命运之轮，请转动——',
    computeOptions(state) {
      return [
        { label: '参与锻造·学会基础锻造术', icon: '🔨', rarity: 'SS', weight: 15, levelBoost: 3 },
        { label: '定制武器·花费不小但值得', icon: '⚔️', rarity: 'S', weight: 20, levelBoost: 4 },
        { label: '帮忙打铁·获得报酬',       icon: '💪', rarity: 'A', weight: 25, levelBoost: 2 },
        { label: '婉拒·已有好武器了',       icon: '🙅', rarity: 'B', weight: 25, levelBoost: 1 },
        { label: '不小心弄坏半成品',         icon: '💥', rarity: 'C', weight: 15 },
      ]
    },
  },
  {
    id: 'event_tavern', title: '🍺 酒馆传说', icon: '🏮', minLevel: 22, maxLevel: 60, rarity: 'A',
    prelude: '老佣兵正讲述星斗大森林深处的秘境传说。所有人都听入迷了。命运之轮，请转动——',
    computeOptions(state) {
      return [
        { label: '请老佣兵喝酒·获得详细情报', icon: '🍻', rarity: 'SS', weight: 18, levelBoost: 3 },
        { label: '记住关键信息·准备探索',     icon: '🧠', rarity: 'S', weight: 25, levelBoost: 2 },
        { label: '当成故事·不以为意',         icon: '🤷', rarity: 'B', weight: 30, levelBoost: 1 },
        { label: '质疑老人·被赶出酒馆',       icon: '😤', rarity: 'C', weight: 15 },
        { label: '发现是武魂殿眼线在套话',     icon: '👁️', rarity: 'S', weight: 12, levelBoost: 3, worldImpact: { biBiDong: { met: true, affinity: -5 } } },
      ]
    },
  },
  {
    id: 'event_herbs', title: '🌿 药草采集', icon: '🌱', minLevel: 18, maxLevel: 50, rarity: 'B',
    prelude: '森林中发现一片稀有药草区域。采集可炼丹或直接服用提升魂力。命运之轮，请转动——',
    computeOptions(state) {
      return [
        { label: '找到珍品药草·魂力大增', icon: '💎', rarity: 'SSS', weight: 8, levelBoost: 5 },
        { label: '采集到不错的一批',       icon: '🌿', rarity: 'A', weight: 28, levelBoost: 2 },
        { label: '收获尚可·够自己用了',   icon: '✅', rarity: 'B', weight: 30, levelBoost: 1 },
        { label: '大部分已经枯萎了',       icon: '🥀', rarity: 'C', weight: 22, levelBoost: 1 },
        { label: '遇到守护魂兽·放弃采集', icon: '🐍', rarity: 'C', weight: 12 },
      ]
    },
  },
  {
    id: 'event_campfire', title: '🔥 篝火夜话', icon: '🏕️', minLevel: 25, maxLevel: 65, rarity: 'A',
    prelude: '夜色篝火旁，旅伴围坐。有人开始讲起了故乡……命运之轮，请转动——',
    computeOptions(state) {
      return [
        { label: '分享自己的故事·拉近距离', icon: '💬', rarity: 'SS', weight: 20, levelBoost: 3, worldImpact: { tangSan: { met: true, affinity: 10 }, xiaoWu: { met: true, affinity: 10 } } },
        { label: '静静倾听·学到了很多',     icon: '👂', rarity: 'S', weight: 25, levelBoost: 2 },
        { label: '被要求表演·尴尬但有趣',   icon: '🎭', rarity: 'A', weight: 25, levelBoost: 1 },
        { label: '早早睡了·太累了',         icon: '😴', rarity: 'B', weight: 20 },
        { label: '守夜·发现异常动静',       icon: '👀', rarity: 'S', weight: 10, levelBoost: 3 },
      ]
    },
  },
  {
    id: 'event_moral', title: '⚖️ 道德抉择', icon: '💭', minLevel: 30, maxLevel: 70, rarity: 'S',
    prelude: '贵族护卫在欺负平民——他是武魂殿盟友，得罪他可能招来麻烦。但平民已被打倒在地……命运之轮，请转动——',
    computeOptions(state) {
      return [
        { label: '挺身而出·教训护卫',   icon: '🛡️', rarity: 'SSS', weight: 15, levelBoost: 5, worldImpact: { biBiDong: { affinity: -15 } } },
        { label: '巧妙调解·不伤和气',   icon: '🧠', rarity: 'SS', weight: 22, levelBoost: 4 },
        { label: '暗中帮助平民治伤·匿名', icon: '🩹', rarity: 'S', weight: 25, levelBoost: 3 },
        { label: '当作没看见·不惹麻烦',   icon: '🚶', rarity: 'B', weight: 23, levelBoost: 1 },
        { label: '加入欺负者·展示力量',   icon: '😈', rarity: 'C', weight: 15, levelBoost: 2 },
      ]
    },
  },
  // ==================== 剧情链：事件后续 ====================
  {
    id: 'chain_tavern_explore', title: '🗺️ 秘境探索', icon: '🏞️', minLevel: 28, maxLevel: 65, rarity: 'SS',
    requiredEvents: ['event_tavern'],
    prelude: '酒馆老佣兵的情报是真的！星斗大森林深处果然有一处前人留下的秘境。命运之轮，请转动——',
    computeOptions(state) {
      return [
        { label: '深入秘境·发现远古传承！！', icon: '💎', rarity: 'SSS', weight: 10, levelBoost: 8 },
        { label: '小心探索·收获颇丰',         icon: '🗺️', rarity: 'SS', weight: 22, levelBoost: 5 },
        { label: '遇到机关·化险为夷',         icon: '⚠️', rarity: 'S', weight: 28, levelBoost: 4 },
        { label: '秘境崩塌·匆忙逃离但有收获', icon: '💨', rarity: 'A', weight: 25, levelBoost: 3 },
        { label: '情报有误·空欢喜一场',       icon: '😤', rarity: 'C', weight: 15 },
      ]
    },
  },
  {
    id: 'chain_blacksmith_master', title: '⚒️ 锻造大师', icon: '🔨', minLevel: 30, maxLevel: 62, rarity: 'SS',
    requiredEvents: ['event_blacksmith'],
    prelude: '老铁匠被你的锻造天赋打动——"魂力锻造不同于普通锻造，需要将武魂力量融入武器之中。"命运之轮，请转动——',
    computeOptions(state) {
      return [
        { label: '掌握魂力锻造·铸造魂导器！！', icon: '⚡', rarity: 'SSS', weight: 12, levelBoost: 7 },
        { label: '成功锻造专属武器',           icon: '⚔️', rarity: 'SS', weight: 22, levelBoost: 5 },
        { label: '学到高级淬火技巧',           icon: '🔥', rarity: 'S', weight: 28, levelBoost: 3 },
        { label: '太难了·只学会基础',         icon: '😓', rarity: 'B', weight: 23, levelBoost: 2 },
        { label: '炸炉了·被赶出去',           icon: '💥', rarity: 'C', weight: 15 },
      ]
    },
  },
  {
    id: 'chain_moral_revenge', title: '⚖️ 贵族的报复', icon: '🏛️', minLevel: 38, maxLevel: 75, rarity: 'SS',
    requiredEvents: ['event_moral'],
    prelude: '那个被你教训的贵族派人查出你的身份。护卫队长堵住你去路——"上次多管闲事，今天付出代价。"命运之轮，请转动——',
    computeOptions(state) {
      const base = [
        { label: '击败护卫·贵族落荒而逃', icon: '⚔️', rarity: 'SSS', weight: 18, levelBoost: 6 },
        { label: '法律手段·让他付出代价', icon: '📜', rarity: 'SS', weight: 22, levelBoost: 4 },
        { label: '和解·贵族道歉赔偿',     icon: '🤝', rarity: 'S', weight: 25, levelBoost: 3 },
        { label: '避免冲突·暂避锋芒',     icon: '🚶', rarity: 'A', weight: 20, levelBoost: 2 },
        { label: '被暗算·平民来帮忙',     icon: '🩹', rarity: 'B', weight: 15, levelBoost: 3 },
      ]
      return adjustCombatWeights(base, state.combatPower || state.level * 10, 400)
    },
  },
  {
    id: 'chain_herbs_alchemy', title: '🧪 炼丹尝试', icon: '💊', minLevel: 25, maxLevel: 55, rarity: 'S',
    requiredEvents: ['event_herbs'],
    prelude: '炼丹师看着你的药草啧啧称奇——"品质不错！如果你愿意，我可以教你基础丹药炼制。"命运之轮，请转动——',
    computeOptions(state) {
      return [
        { label: '成功炼出魂力丹·魂力大增！！', icon: '💊', rarity: 'SSS', weight: 12, levelBoost: 6 },
        { label: '炼出几枚不错的丹药',         icon: '🧪', rarity: 'SS', weight: 25, levelBoost: 4 },
        { label: '学到炼丹基础·日后可自学',   icon: '📖', rarity: 'S', weight: 28, levelBoost: 3 },
        { label: '炸炉了·但没受伤',           icon: '💥', rarity: 'B', weight: 20, levelBoost: 2 },
        { label: '浪费药草·炼丹师摇头',       icon: '🥀', rarity: 'C', weight: 15 },
      ]
    },
  },
  {
    id: 'chain_sparring_tournament', title: '🏟️ 友谊赛邀请', icon: '🥋', minLevel: 28, maxLevel: 50, rarity: 'A',
    requiredEvents: ['event_sparring'],
    prelude: '上次切磋的学员如今已是学院首席——"你是我遇到过最好的对手，让我们再比一次！"命运之轮，请转动——',
    computeOptions(state) {
      return [
        { label: '全力以赴·精彩对决', icon: '⚔️', rarity: 'SS', weight: 20, levelBoost: 4 },
        { label: '以智取胜·看破招式', icon: '🧠', rarity: 'S', weight: 25, levelBoost: 3 },
        { label: '平局·惺惺相惜',     icon: '🤝', rarity: 'A', weight: 30, levelBoost: 2 },
        { label: '惜败·但收获友谊',   icon: '😊', rarity: 'B', weight: 15, levelBoost: 2 },
        { label: '被完虐·差距太大',   icon: '😵', rarity: 'C', weight: 10 },
      ]
    },
  },
  {
    id: 'chain_rain_friend', title: '☀️ 雨后重逢', icon: '🌈', minLevel: 20, maxLevel: 50, rarity: 'A',
    requiredEvents: ['event_rain'],
    prelude: '雨天遇到的陌生人竟然是学院的交换生！"是你！那个雨天……我一直想谢谢你。"命运之轮，请转动——',
    computeOptions(state) {
      return [
        { label: '成为好朋友·互帮互助', icon: '💕', rarity: 'SSS', weight: 18, levelBoost: 4, worldImpact: { tangSan: { met: true, affinity: 15 } } },
        { label: '一起修炼·互相促进',   icon: '🏋️', rarity: 'SS', weight: 28, levelBoost: 3 },
        { label: '简单叙旧·保持联系',   icon: '📝', rarity: 'A', weight: 30, levelBoost: 2 },
        { label: '已经忘了对方是谁',     icon: '😶', rarity: 'C', weight: 24, levelBoost: 1 },
      ]
    },
  },
  {
    id: 'chain_campfire_dawn', title: '🌄 破晓哨声', icon: '🔔', minLevel: 32, maxLevel: 68, rarity: 'S',
    requiredEvents: ['event_campfire'],
    prelude: '守夜时发现的异常动静果然不是错觉——一支来路不明的人马正靠近营地！命运之轮，请转动——',
    computeOptions(state) {
      const base = [
        { label: '主动出击·击退来犯者', icon: '⚔️', rarity: 'SSS', weight: 18, levelBoost: 6 },
        { label: '智取·设陷阱捕获他们', icon: '🧠', rarity: 'SS', weight: 22, levelBoost: 5 },
        { label: '叫醒同伴·共同应对',   icon: '👥', rarity: 'A', weight: 30, levelBoost: 3 },
        { label: '静观其变·只是路过',   icon: '👀', rarity: 'B', weight: 20, levelBoost: 2 },
        { label: '被偷袭·营地混乱',     icon: '😱', rarity: 'C', weight: 10 },
      ]
      return adjustCombatWeights(base, state.combatPower || state.level * 10, 350)
    },
  },
  {
    id: 'chain_meditation_vision', title: '👁️ 武魂幻境', icon: '🌀', minLevel: 25, maxLevel: 55, rarity: 'SS',
    requiredEvents: ['event_meditation'],
    prelude: '冥想中意识被拉入奇异空间——那是你武魂最深处的幻境！古老的声音在低语……命运之轮，请转动——',
    computeOptions(state) {
      return [
        { label: '与武魂沟通·觉醒隐藏力量！！', icon: '🌀', rarity: 'SSS', weight: 10, levelBoost: 8 },
        { label: '理解武魂真意·悟出新魂技',     icon: '💡', rarity: 'SS', weight: 22, levelBoost: 5 },
        { label: '接受武魂指引·方向更清晰',     icon: '🧭', rarity: 'S', weight: 28, levelBoost: 3 },
        { label: '幻境消散·留下启示',           icon: '🌫️', rarity: 'A', weight: 25, levelBoost: 2 },
        { label: '被武魂反噬·精神受创',         icon: '😵', rarity: 'C', weight: 15 },
      ]
    },
  },
  // ==================== 修罗九考 ====================
  {
    id: 'arc_asura_1', title: '⚔️ 修罗第一考·杀戮之心', icon: '💀', minLevel: 50, maxLevel: 100, rarity: 'SS', isMilestone: true,
    prelude: '血色光柱笼罩你——修罗神试炼！第一考：战胜心中杀意。命运之轮，请转动——',
    computeOptions(state) {
      const pwr = Math.max(0.5, (state.combatPower || state.level * 10) / 2000)
      return [
        { label: '战胜心魔·修罗印记！！', icon: '💀', rarity: 'SSS', weight: Math.floor(15 * pwr), levelBoost: 6 },
        { label: '保持理智·通过考验',     icon: '🧘', rarity: 'SS', weight: Math.floor(28 * pwr), levelBoost: 4 },
        { label: '差点失控·勉强通过',     icon: '😰', rarity: 'A', weight: 30, levelBoost: 3 },
        { label: '失败·被杀欲吞噬',       icon: '😵', rarity: 'C', weight: Math.max(5, 27 - Math.floor(10 * pwr)), levelBoost: 1 },
      ]
    },
  },
  {
    id: 'arc_asura_2', title: '⚔️ 修罗第二考·审判天平', icon: '⚖️', minLevel: 52, maxLevel: 100, rarity: 'SS', isMilestone: true,
    requiredEvents: ['arc_asura_1'],
    prelude: '第二考：审判天平。命运之轮，请转动——',
    computeOptions(state) {
      const pwr = Math.max(0.5, (state.combatPower || state.level * 10) / 2000)
      return [
        { label: '天平平衡·修罗认可！！', icon: '⚖️', rarity: 'SSS', weight: Math.floor(15 * pwr), levelBoost: 5 },
        { label: '善端微重·通过考验',     icon: '✨', rarity: 'SS', weight: Math.floor(28 * pwr), levelBoost: 4 },
        { label: '恶端稍重·修罗欣赏',     icon: '💀', rarity: 'A', weight: 30, levelBoost: 4 },
        { label: '审判失败·被逐出',       icon: '🚫', rarity: 'C', weight: Math.max(5, 27 - Math.floor(10 * pwr)), levelBoost: 1 },
      ]
    },
  },
  {
    id: 'arc_asura_3', title: '⚔️ 修罗第三考·血誓', icon: '🩸', minLevel: 54, maxLevel: 100, rarity: 'SS', isMilestone: true,
    requiredEvents: ['arc_asura_2'],
    prelude: '第三考：用鲜血刻下修罗血誓！命运之轮，请转动——',
    computeOptions(state) {
      const pwr = Math.max(0.5, (state.combatPower || state.level * 10) / 2200)
      return [
        { label: '血誓成立·修罗之力！！', icon: '🩸', rarity: 'SSS', weight: Math.floor(12 * pwr), levelBoost: 6 },
        { label: '誓言被接受·通过',       icon: '✅', rarity: 'SS', weight: Math.floor(25 * pwr), levelBoost: 4 },
        { label: '誓言模糊·但过了',       icon: '😰', rarity: 'A', weight: 30, levelBoost: 3 },
        { label: '血誓被拒',               icon: '🚫', rarity: 'C', weight: Math.max(5, 33 - Math.floor(10 * pwr)), levelBoost: 2 },
      ]
    },
  },
  {
    id: 'arc_asura_4', title: '⚔️ 修罗第四考·剑阵', icon: '🗡️', minLevel: 56, maxLevel: 100, rarity: 'SSS', isMilestone: true,
    requiredEvents: ['arc_asura_3'],
    prelude: '第四考：穿越三十六把修罗剑的剑阵！命运之轮，请转动——',
    computeOptions(state) {
      const base = [
        { label: '毫发无伤·获得修罗魂骨！！', icon: '🗡️', rarity: 'SSS', weight: 10, levelBoost: 7, soulBone: { slot: 'leftArm', beast: '修罗剑灵', year: 90000, skill: '修罗剑气', rarity: 'SS' } },
        { label: '穿过剑阵·获得认可',         icon: '⚔️', rarity: 'SS', weight: 22, levelBoost: 5 },
        { label: '受轻伤·通过了',             icon: '🩹', rarity: 'A', weight: 30, levelBoost: 4 },
        { label: '失败·被剑阵逼退',           icon: '😔', rarity: 'C', weight: 38, levelBoost: 2 },
      ]
      return adjustCombatWeights(base, state.combatPower || state.level * 10, 4500)
    },
  },
  {
    id: 'arc_asura_5', title: '⚔️ 修罗第五考·血池', icon: '🩸', minLevel: 58, maxLevel: 100, rarity: 'SSS', isMilestone: true,
    requiredEvents: ['arc_asura_4'],
    prelude: '第五考：浸泡修罗血池！命运之轮，请转动——',
    computeOptions(state) {
      const pwr = Math.max(0.5, (state.combatPower || state.level * 10) / 2800)
      return [
        { label: '血池淬体·修罗之体大成！！', icon: '🩸', rarity: 'SSS', weight: Math.floor(12 * pwr), levelBoost: 8 },
        { label: '成功承受·体质大增',         icon: '💪', rarity: 'SS', weight: Math.floor(25 * pwr), levelBoost: 5 },
        { label: '勉强承受·通过了',           icon: '😰', rarity: 'A', weight: 30, levelBoost: 3 },
        { label: '无法承受',                   icon: '🏃', rarity: 'C', weight: Math.max(5, 33 - Math.floor(10 * pwr)), levelBoost: 2 },
      ]
    },
  },
  {
    id: 'arc_asura_6', title: '⚔️ 修罗第六考·修罗魂环', icon: '💍', minLevel: 60, maxLevel: 100, rarity: 'SSS', isMilestone: true,
    requiredEvents: ['arc_asura_5'],
    prelude: '第六考：猎杀上古修罗兽，吸收十万年魂环！命运之轮，请转动——',
    computeOptions(state) {
      const base = [
        { label: '斩杀·获得十万年魂环！！', icon: '💍', rarity: 'SSS', weight: 8, levelBoost: 8, soulRing: { slot: 6, year: 100000, colorName: '十万年', colorHex: '#FF1744', beast: '上古修罗兽', skill: '修罗审判' } },
        { label: '击杀·获得认可',           icon: '⚔️', rarity: 'SS', weight: 22, levelBoost: 6 },
        { label: '打伤·勉强通过',           icon: '🩹', rarity: 'A', weight: 30, levelBoost: 4 },
        { label: '失败·退回血池',           icon: '😔', rarity: 'C', weight: 40, levelBoost: 2 },
      ]
      return adjustCombatWeights(base, state.combatPower || state.level * 10, 5000)
    },
  },
  {
    id: 'arc_asura_7', title: '⚔️ 修罗第七考·杀戮领域', icon: '🌐', minLevel: 62, maxLevel: 100, rarity: 'SSS', isMilestone: true,
    requiredEvents: ['arc_asura_6'],
    prelude: '第七考：在杀戮领域中觉醒！命运之轮，请转动——',
    computeOptions(state) {
      const pwr = Math.max(0.3, (state.combatPower || state.level * 10) / 4000)
      return [
        { label: '领域觉醒·修罗领域！！', icon: '🌐', rarity: 'SSS', weight: Math.floor(10 * pwr), levelBoost: 8, worldImpact: { domain: '修罗领域' } },
        { label: '领域初成·修罗之力大增', icon: '⚔️', rarity: 'SS', weight: Math.floor(25 * pwr), levelBoost: 5 },
        { label: '勉强抵抗·通过',         icon: '😰', rarity: 'A', weight: 30, levelBoost: 3 },
        { label: '被领域逼退·失败',       icon: '😵', rarity: 'C', weight: Math.max(5, 35 - Math.floor(10 * pwr)), levelBoost: 2 },
      ]
    },
  },
  {
    id: 'arc_asura_8', title: '⚔️ 修罗第八考·王座', icon: '👑', minLevel: 65, maxLevel: 100, rarity: 'SSS', isMilestone: true,
    requiredEvents: ['arc_asura_7'],
    prelude: '第八考：坐上修罗王座！命运之轮，请转动——',
    computeOptions(state) {
      const pwr = Math.max(0.3, (state.combatPower || state.level * 10) / 5000)
      return [
        { label: '坐上王座·修罗神力！！', icon: '👑', rarity: 'SSS', weight: Math.floor(8 * pwr), levelBoost: 10 },
        { label: '坐下半刻·获得祝福',     icon: '✅', rarity: 'SS', weight: Math.floor(22 * pwr), levelBoost: 6 },
        { label: '触碰王座·获得印记',     icon: '✨', rarity: 'S', weight: 28, levelBoost: 5 },
        { label: '被弹飞',                 icon: '💨', rarity: 'B', weight: Math.max(5, 42 - Math.floor(10 * pwr)), levelBoost: 3 },
      ]
    },
  },
  {
    id: 'arc_asura_9', title: '⚔️ 修罗第九考·杀神降临', icon: '⚔️', minLevel: 68, maxLevel: 100, rarity: 'SSS', isMilestone: true,
    requiredEvents: ['arc_asura_8'],
    prelude: '第九考——继承修罗神位！命运之轮，请转动——',
    computeOptions(state) {
      const base = [
        { label: '继承修罗神位！！',   icon: '⚔️', rarity: 'SSS', weight: 10, levelBoost: 12, worldImpact: { asuraInherited: true } },
        { label: '接受·神位不完整',   icon: '⭐', rarity: 'SS', weight: 22, levelBoost: 8 },
        { label: '获得印记·日后继承', icon: '✨', rarity: 'S', weight: 28, levelBoost: 6 },
        { label: '拒绝·选择人间',     icon: '🚫', rarity: 'A', weight: 20, levelBoost: 5 },
        { label: '失败·送回凡间',     icon: '⬇️', rarity: 'C', weight: 20, levelBoost: 3 },
      ]
      return adjustCombatWeights(base, state.combatPower || state.level * 10, 10000)
    },
  },
  // ==================== 分阶原著战斗事件 ====================
  {
    id: 'cmb_bandits', title: '⚔️ 盗贼夜袭', icon: '🌙', minLevel: 6, maxLevel: 18, rarity: 'B', enemyPower: 30,
    prelude: '夜深人静，一伙盗贼摸进了村子！你被嘈杂声惊醒——拿起武器保护家园！命运之轮，请转动——',
    computeOptions(state) {
      const base = [
        { label: '以一敌五·击退盗贼', icon: '⚔️', rarity: 'SS', weight: 15, levelBoost: 3 },
        { label: '组织村民·成功防守', icon: '👥', rarity: 'A', weight: 28, levelBoost: 2 },
        { label: '智取·设陷阱捕获',   icon: '🧠', rarity: 'S', weight: 22, levelBoost: 4 },
        { label: '被盗贼打伤·但守住了', icon: '🩹', rarity: 'C', weight: 20, levelBoost: 1 },
        { label: '逃跑求救·援兵赶到', icon: '🏃', rarity: 'C', weight: 15, levelBoost: 2 },
      ]
      return adjustCombatWeights(base, state.combatPower || state.level * 10, 30)
    },
  },
  {
    id: 'cmb_escort', title: '⚔️ 佣兵护送', icon: '🛡️', minLevel: 12, maxLevel: 30, rarity: 'A', enemyPower: 150,
    prelude: '佣兵工会发布护送任务——保护商队穿越危险地带。沿途可能遭遇魂兽袭击！命运之轮，请转动——',
    computeOptions(state) {
      const base = [
        { label: '完美护送·获得额外佣金', icon: '💰', rarity: 'SS', weight: 18, levelBoost: 4 },
        { label: '击退袭击者·任务完成',   icon: '✅', rarity: 'A', weight: 30, levelBoost: 3 },
        { label: '商队受损·但保住货物',   icon: '📦', rarity: 'B', weight: 25, levelBoost: 2 },
        { label: '遭遇强敌·弃货逃跑',     icon: '🏃', rarity: 'C', weight: 15, levelBoost: 1 },
        { label: '全军覆没·独自生还',     icon: '💀', rarity: 'C', weight: 12, levelBoost: 1 },
      ]
      return adjustCombatWeights(base, state.combatPower || state.level * 10, 150)
    },
  },
  {
    id: 'cmb_horde', title: '⚔️ 魂兽围攻', icon: '🐺', minLevel: 22, maxLevel: 42, rarity: 'S', enemyPower: 500,
    prelude: '你遭到了一群魂兽的围攻——为首的是千年修为的头狼！狼群从四面八方包围过来。命运之轮，请转动——',
    computeOptions(state) {
      const base = [
        { label: '击杀头狼·狼群溃散',   icon: '🐺', rarity: 'SSS', weight: 10, levelBoost: 6 },
        { label: '突破包围·杀出血路',   icon: '⚔️', rarity: 'SS', weight: 22, levelBoost: 5 },
        { label: '利用火焰驱散狼群',     icon: '🔥', rarity: 'A', weight: 28, levelBoost: 4 },
        { label: '被咬伤·侥幸逃脱',     icon: '🩹', rarity: 'B', weight: 22, levelBoost: 2 },
        { label: '被狼群淹没·同伴来救', icon: '🆘', rarity: 'C', weight: 18, levelBoost: 3 },
      ]
      return adjustCombatWeights(base, state.combatPower || state.level * 10, 500)
    },
  },
  {
    id: 'cmb_airDuel', title: '⚔️ 空中对决', icon: '🦅', minLevel: 40, maxLevel: 62, rarity: 'SS', enemyPower: 1200,
    prelude: '一名飞行系魂师向你发起空中挑战——在百米高空的生死对决！命运之轮，请转动——',
    computeOptions(state) {
      const base = [
        { label: '空中制胜·获得飞行魂骨', icon: '🦅', rarity: 'SSS', weight: 8, levelBoost: 7, soulBone: { slot: 'torso', beast: '天空之王', year: 50000, skill: '飞行', rarity: 'S' } },
        { label: '击落对手·完美胜利',     icon: '⚔️', rarity: 'SS', weight: 20, levelBoost: 6 },
        { label: '缠斗后平手·互相欣赏',   icon: '🤝', rarity: 'A', weight: 28, levelBoost: 4 },
        { label: '坠落·重伤但活下来了',   icon: '🩹', rarity: 'B', weight: 22, levelBoost: 3 },
        { label: '被击落·大难不死',       icon: '😵', rarity: 'C', weight: 22, levelBoost: 2 },
      ]
      return adjustCombatWeights(base, state.combatPower || state.level * 10, 1200)
    },
  },
  {
    id: 'cmb_avalanche', title: '⚔️ 雪崩求生', icon: '❄️', minLevel: 50, maxLevel: 70, rarity: 'SS', enemyPower: 1800,
    prelude: '极北之地的雪崩将你卷入——你必须在暴雪中寻找出路并击退雪怪！命运之轮，请转动——',
    computeOptions(state) {
      const base = [
        { label: '击杀雪怪·找到庇护所',   icon: '❄️', rarity: 'SSS', weight: 10, levelBoost: 8 },
        { label: '挖出雪洞·撑过暴风雪',   icon: '⛏️', rarity: 'SS', weight: 22, levelBoost: 5 },
        { label: '与雪怪交涉·和平共处',   icon: '🤝', rarity: 'S', weight: 18, levelBoost: 6 },
        { label: '被雪掩埋·同伴挖出',     icon: '🆘', rarity: 'A', weight: 25, levelBoost: 4 },
        { label: '冻伤·被救援队发现',     icon: '🤕', rarity: 'C', weight: 25, levelBoost: 2 },
      ]
      return adjustCombatWeights(base, state.combatPower || state.level * 10, 1800)
    },
  },
  {
    id: 'cmb_templeGuard', title: '⚔️ 神庙守卫', icon: '🏛️', minLevel: 62, maxLevel: 82, rarity: 'SSS', enemyPower: 3500,
    prelude: '远古神庙的守卫——一尊活化的石像巨人——挥舞着巨锤向你砸来！命运之轮，请转动——',
    computeOptions(state) {
      const base = [
        { label: '击碎石像·获得远古传承', icon: '💎', rarity: 'SSS', weight: 8, levelBoost: 10 },
        { label: '找到弱点·击毁核心',     icon: '🧠', rarity: 'SS', weight: 22, levelBoost: 7 },
        { label: '利用机关困住石像',       icon: '⚙️', rarity: 'S', weight: 25, levelBoost: 6 },
        { label: '被震飞·石门关闭',       icon: '💨', rarity: 'A', weight: 25, levelBoost: 4 },
        { label: '被巨锤砸扁·侥幸脱身',   icon: '😵', rarity: 'C', weight: 20, levelBoost: 2 },
      ]
      return adjustCombatWeights(base, state.combatPower || state.level * 10, 3500)
    },
  },
  {
    id: 'cmb_dualGod', title: '⚔️ 双神对决', icon: '🌟', minLevel: 82, maxLevel: 98, rarity: 'SSS', enemyPower: 12000,
    prelude: '海神与修罗神的力量在你体内冲突——你必须同时驾驭两种神力，否则将被撕裂！命运之轮，请转动——',
    computeOptions(state) {
      const base = [
        { label: '完美平衡·双神共存',     icon: '🌟', rarity: 'SSS', weight: 5, levelBoost: 15, worldImpact: { dualGod: true } },
        { label: '偏向海神·海洋之力大增', icon: '🌊', rarity: 'SS', weight: 15, levelBoost: 10 },
        { label: '偏向修罗·杀戮之力大增', icon: '⚔️', rarity: 'SS', weight: 15, levelBoost: 10 },
        { label: '强行压制·获得暂时平衡', icon: '🛡️', rarity: 'S', weight: 28, levelBoost: 7 },
        { label: '被撕裂·但活下来了',     icon: '💔', rarity: 'B', weight: 20, levelBoost: 5 },
        { label: '失控·险些陨落',         icon: '😵', rarity: 'C', weight: 17, levelBoost: 3 },
      ]
      return adjustCombatWeights(base, state.combatPower || state.level * 10, 12000)
    },
  },
  {
    id: 'cmb_finalStand', title: '⚔️ 最终之战', icon: '👑', minLevel: 95, maxLevel: 100, rarity: 'SSS', enemyPower: 20000,
    prelude: '所有敌人联合起来——这是大陆存亡的最后之战！你站在战场中央，所有同伴都在你身后。命运之轮，请转动——',
    computeOptions(state) {
      const base = [
        { label: '以一敌万·成为传说！！', icon: '👑', rarity: 'SSS', weight: 3, levelBoost: 20, worldImpact: { legend: true } },
        { label: '与同伴联手·击溃敌军',   icon: '🤝', rarity: 'SSS', weight: 12, levelBoost: 15 },
        { label: '指挥全局·谋略制胜',     icon: '🧠', rarity: 'SS', weight: 20, levelBoost: 12 },
        { label: '苦战后惨胜·大陆和平',   icon: '🕊️', rarity: 'S', weight: 25, levelBoost: 10 },
        { label: '力战不敌·被同伴救回',   icon: '🆘', rarity: 'A', weight: 20, levelBoost: 8 },
        { label: '陨落·但永世传颂',       icon: '💀', rarity: 'B', weight: 20, levelBoost: 5 },
      ]
      return adjustCombatWeights(base, state.combatPower || state.level * 10, 20000)
    },
  },
  {
    id: 'cmb_awaken', title: '⚔️ 觉醒试炼', icon: '✨', minLevel: 1, maxLevel: 10, rarity: 'B', enemyPower: 20,
    prelude: '武魂觉醒后，长老让你用刚觉醒的武魂击碎测试石！命运之轮，请转动——',
    computeOptions(state) {
      const base = [
        { label: '一击粉碎·天赋惊人', icon: '💥', rarity: 'SS', weight: 15, levelBoost: 3 },
        { label: '成功击碎·顺利通过', icon: '✅', rarity: 'A', weight: 30, levelBoost: 2 },
        { label: '勉强击裂·还需努力', icon: '😰', rarity: 'B', weight: 30, levelBoost: 1 },
        { label: '石头纹丝不动',       icon: '😔', rarity: 'C', weight: 25, levelBoost: 1 },
      ]
      return adjustCombatWeights(base, state.combatPower || state.level * 10, 20)
    },
  },
  {
    id: 'cmb_nottingExam', title: '⚔️ 诺丁考核', icon: '📝', minLevel: 15, maxLevel: 28, rarity: 'A', enemyPower: 100,
    prelude: '诺丁学院的期末实战考核！对抗一名高年级学员。命运之轮，请转动——',
    computeOptions(state) {
      const base = [
        { label: '越级击败·全院第一', icon: '🏅', rarity: 'SSS', weight: 10, levelBoost: 5 },
        { label: '艰难获胜·通过考核', icon: '⚔️', rarity: 'A', weight: 28, levelBoost: 3 },
        { label: '平手·双方升级',     icon: '🤝', rarity: 'B', weight: 30, levelBoost: 2 },
        { label: '被击败·需补考',     icon: '😔', rarity: 'C', weight: 32, levelBoost: 1 },
      ]
      return adjustCombatWeights(base, state.combatPower || state.level * 10, 100)
    },
  },
  {
    id: 'cmb_beastKing', title: '⚔️ 兽王领地', icon: '👑', minLevel: 25, maxLevel: 40, rarity: 'S', enemyPower: 350,
    prelude: '星斗大森林深处，你误入万年魂兽的领地——它已发现你！命运之轮，请转动——',
    computeOptions(state) {
      const base = [
        { label: '击败兽王·获得万年魂环', icon: '💍', rarity: 'SSS', weight: 8, levelBoost: 7, soulRing: { year: 30000, colorName: '万年', colorHex: '#212121', beast: '万年兽王', skill: '兽王咆哮' } },
        { label: '击退兽王·成功脱险',     icon: '⚔️', rarity: 'SS', weight: 20, levelBoost: 5 },
        { label: '利用地形智取·逃脱',     icon: '🧠', rarity: 'A', weight: 28, levelBoost: 4 },
        { label: '受伤逃遁·捡回一命',     icon: '🏃', rarity: 'C', weight: 25, levelBoost: 2 },
        { label: '被兽王碾压·侥幸生还',   icon: '😵', rarity: 'C', weight: 19, levelBoost: 1 },
      ]
      return adjustCombatWeights(base, state.combatPower || state.level * 10, 350)
    },
  },
  {
    id: 'cmb_shrekBrawl', title: '⚔️ 七怪混战', icon: '👥', minLevel: 35, maxLevel: 50, rarity: 'S', enemyPower: 600,
    prelude: '弗兰德院长突发奇想——七怪自由混战！最后站着的就是今天的优胜者！命运之轮，请转动——',
    computeOptions(state) {
      const base = [
        { label: '最后站着的·优胜！！', icon: '🏆', rarity: 'SSS', weight: 8, levelBoost: 8 },
        { label: '坚持到前三·表现出色', icon: '🥉', rarity: 'SS', weight: 22, levelBoost: 5 },
        { label: '中游表现·学到团队配合', icon: '🤝', rarity: 'A', weight: 30, levelBoost: 3 },
        { label: '第一个被淘汰·但学到了', icon: '😅', rarity: 'B', weight: 25, levelBoost: 2 },
        { label: '被秒杀·差距太悬殊',     icon: '😵', rarity: 'C', weight: 15, levelBoost: 1 },
      ]
      return adjustCombatWeights(base, state.combatPower || state.level * 10, 600)
    },
  },
  {
    id: 'cmb_eliteTeam', title: '⚔️ 武魂殿战队', icon: '⛪', minLevel: 45, maxLevel: 60, rarity: 'SS', enemyPower: 1000,
    prelude: '精英赛最终战——对手是武魂殿黄金一代！三位魂王级别的最强天才！命运之轮，请转动——',
    computeOptions(state) {
      const base = [
        { label: '击败武魂殿·冠军！！', icon: '👑', rarity: 'SSS', weight: 6, levelBoost: 10, worldImpact: { biBiDong: { met: true, affinity: -20 } } },
        { label: '险胜·全场起立鼓掌',   icon: '⚔️', rarity: 'SS', weight: 18, levelBoost: 7 },
        { label: '惜败·但名扬大陆',     icon: '🥈', rarity: 'S', weight: 25, levelBoost: 5 },
        { label: '被打败·但学到很多',   icon: '📖', rarity: 'A', weight: 28, levelBoost: 3 },
        { label: '被碾压·武魂殿太强了', icon: '😵', rarity: 'C', weight: 23, levelBoost: 2 },
      ]
      return adjustCombatWeights(base, state.combatPower || state.level * 10, 1000)
    },
  },
  {
    id: 'cmb_seaGuardian', title: '⚔️ 海神守护者', icon: '🔱', minLevel: 55, maxLevel: 72, rarity: 'SS', enemyPower: 2000,
    prelude: '海神岛的守护者——一位海魂斗罗——挡在你面前！"要见海神，先过我这一关！"命运之轮，请转动——',
    computeOptions(state) {
      const base = [
        { label: '击败守护者·获得海神认可', icon: '🔱', rarity: 'SSS', weight: 8, levelBoost: 9 },
        { label: '打平·守护者让你通过',     icon: '🤝', rarity: 'SS', weight: 22, levelBoost: 6 },
        { label: '被压制·但坚持住了',       icon: '💪', rarity: 'A', weight: 30, levelBoost: 4 },
        { label: '被击倒·但未放弃',         icon: '🩹', rarity: 'B', weight: 25, levelBoost: 3 },
        { label: '被秒杀·丢回船上',         icon: '😵', rarity: 'C', weight: 15, levelBoost: 2 },
      ]
      return adjustCombatWeights(base, state.combatPower || state.level * 10, 2000)
    },
  },
  {
    id: 'cmb_titleDuel', title: '⚔️ 封号对决', icon: '👑', minLevel: 65, maxLevel: 82, rarity: 'SSS', enemyPower: 3000,
    prelude: '一位成名已久的封号斗罗向你发起挑战——"让我看看你是否配得上传说的称号！"命运之轮，请转动——',
    computeOptions(state) {
      const base = [
        { label: '击败封号斗罗·震惊天下', icon: '👑', rarity: 'SSS', weight: 8, levelBoost: 10 },
        { label: '缠斗百回合·虽败犹荣',   icon: '⚔️', rarity: 'SS', weight: 22, levelBoost: 7 },
        { label: '请教切磋·获得指点',     icon: '📖', rarity: 'S', weight: 25, levelBoost: 5 },
        { label: '被压制·但了解差距',     icon: '😰', rarity: 'A', weight: 25, levelBoost: 4 },
        { label: '被秒杀·受教了',         icon: '😵', rarity: 'C', weight: 20, levelBoost: 2 },
      ]
      return adjustCombatWeights(base, state.combatPower || state.level * 10, 3000)
    },
  },
  {
    id: 'cmb_warfront', title: '⚔️ 前线冲锋', icon: '🏇', minLevel: 75, maxLevel: 92, rarity: 'SSS', enemyPower: 5000,
    prelude: '武魂帝国发起总攻！你被编入突击队——目标是直取敌军指挥部！命运之轮，请转动——',
    computeOptions(state) {
      const base = [
        { label: '直取指挥部·扭转战局',   icon: '🏆', rarity: 'SSS', weight: 8, levelBoost: 12 },
        { label: '斩将夺旗·大破敌军',     icon: '⚔️', rarity: 'SS', weight: 20, levelBoost: 8 },
        { label: '掩护战友·立下战功',     icon: '🛡️', rarity: 'S', weight: 25, levelBoost: 6 },
        { label: '负伤撤退·保住性命',     icon: '🩹', rarity: 'A', weight: 25, levelBoost: 4 },
        { label: '溃败·被友军救回',       icon: '😰', rarity: 'C', weight: 22, levelBoost: 3 },
      ]
      return adjustCombatWeights(base, state.combatPower || state.level * 10, 5000)
    },
  },
  {
    id: 'cmb_divineGate', title: '⚔️ 神域之门', icon: '☁️', minLevel: 85, maxLevel: 100, rarity: 'SSS', enemyPower: 10000,
    prelude: '神界之门前，远古神祇的幻影挡住去路——"凡人，证明你有资格踏入神的领域！"命运之轮，请转动——',
    computeOptions(state) {
      const base = [
        { label: '击败神影·踏入神域',   icon: '☁️', rarity: 'SSS', weight: 5, levelBoost: 15 },
        { label: '通过考验·获准入内',   icon: '✅', rarity: 'SS', weight: 18, levelBoost: 10 },
        { label: '被神威压迫·但不放弃', icon: '💪', rarity: 'S', weight: 25, levelBoost: 7 },
        { label: '被打回凡间·留下烙印', icon: '⬇️', rarity: 'A', weight: 27, levelBoost: 5 },
        { label: '神之蔑视·被秒杀',     icon: '😵', rarity: 'C', weight: 25, levelBoost: 3 },
      ]
      return adjustCombatWeights(base, state.combatPower || state.level * 10, 10000)
    },
  },
  {
    id: 'battle_notting', title: '⚔️ 诺丁学院实战', icon: '⚔️', minLevel: 12, maxLevel: 22, rarity: 'A', enemyPower: 50,
    prelude: '诺丁学院实战课——对手是比你高一级的学长。命运之轮，请转动——',
    computeOptions(state) {
      const base = [
        { label: '越级获胜·天赋惊人', icon: '💪', rarity: 'SS', weight: 15, levelBoost: 4 },
        { label: '顽强对抗·最终险胜', icon: '⚔️', rarity: 'A', weight: 28, levelBoost: 2 },
        { label: '平局·学到很多',     icon: '🤝', rarity: 'B', weight: 30, levelBoost: 1 },
        { label: '落败·差距不大',     icon: '😔', rarity: 'C', weight: 20, levelBoost: 1 },
        { label: '被轻松击败',        icon: '💨', rarity: 'C', weight: 7 },
      ]
      return adjustCombatWeights(base, state.combatPower || state.level * 10, 50)
    },
  },
  {
    id: 'battle_forest', title: '⚔️ 猎魂森林', icon: '🌲', minLevel: 18, maxLevel: 28, rarity: 'A', enemyPower: 80,
    prelude: '猎魂森林——一头百年魂兽突然从灌木中窜出！命运之轮，请转动——',
    computeOptions(state) {
      const base = [
        { label: '轻松猎杀·获得魂兽材料', icon: '⚡', rarity: 'SS', weight: 12, levelBoost: 3 },
        { label: '成功猎杀·积累经验',     icon: '✅', rarity: 'A', weight: 30, levelBoost: 2 },
        { label: '与同伴合作击败',       icon: '🤝', rarity: 'B', weight: 28, levelBoost: 2 },
        { label: '被突袭·受了轻伤',     icon: '🤕', rarity: 'B', weight: 20, levelBoost: 1 },
        { label: '魂兽逃走了',           icon: '🏃', rarity: 'C', weight: 10 },
      ]
      return adjustCombatWeights(base, state.combatPower || state.level * 10, 80)
    },
  },
  {
    id: 'battle_rival', title: '⚔️ 学院大比', icon: '🏟️', minLevel: 25, maxLevel: 38, rarity: 'S', enemyPower: 200,
    prelude: '史莱克学院内部选拔赛——对手是同级最强学员！命运之轮，请转动——',
    computeOptions(state) {
      const base = [
        { label: '击败对手·成为首席！！', icon: '🏆', rarity: 'SSS', weight: 10, levelBoost: 5 },
        { label: '激战后获胜',             icon: '⚔️', rarity: 'SS', weight: 22, levelBoost: 3 },
        { label: '巧用战术·智取',         icon: '🧠', rarity: 'S', weight: 28, levelBoost: 4 },
        { label: '惜败·展现潜力',         icon: '🤝', rarity: 'A', weight: 25, levelBoost: 2 },
        { label: '完败·差距明显',         icon: '😔', rarity: 'C', weight: 15 },
      ]
      return adjustCombatWeights(base, state.combatPower || state.level * 10, 200)
    },
  },
  {
    id: 'battle_elite', title: '⚔️ 精英赛对战', icon: '🏟️', minLevel: 38, maxLevel: 52, rarity: 'SS', enemyPower: 500,
    prelude: '全大陆精英赛正赛——天斗皇家学院的王牌战队！命运之轮，请转动——',
    computeOptions(state) {
      const base = [
        { label: '完美破解融合技·震惊全场！！', icon: '💥', rarity: 'SSS', weight: 8, levelBoost: 8 },
        { label: '击败对手·晋级下一轮',         icon: '🥇', rarity: 'SS', weight: 20, levelBoost: 5 },
        { label: '团队配合·协力获胜',           icon: '🤝', rarity: 'S', weight: 28, levelBoost: 4 },
        { label: '惜败·全场起立鼓掌',           icon: '👏', rarity: 'A', weight: 25, levelBoost: 3 },
        { label: '被天赋碾压·学到很多',         icon: '📖', rarity: 'B', weight: 19, levelBoost: 2 },
      ]
      return adjustCombatWeights(base, state.combatPower || state.level * 10, 500)
    },
  },
  {
    id: 'battle_wuhun', title: '⚔️ 武魂殿阻击战', icon: '⛪', minLevel: 50, maxLevel: 65, rarity: 'SS', enemyPower: 800,
    prelude: '武魂殿精英小队拦住了去路——三名魂王级强者！命运之轮，请转动——',
    computeOptions(state) {
      const base = [
        { label: '以一敌三·反杀！！', icon: '💀', rarity: 'SSS', weight: 6, levelBoost: 10, worldImpact: { biBiDong: { affinity: -30 } } },
        { label: '击退敌人·成功突围', icon: '⚔️', rarity: 'SS', weight: 20, levelBoost: 6 },
        { label: '智取·利用地形逃脱', icon: '🧠', rarity: 'S', weight: 28, levelBoost: 4 },
        { label: '负伤逃脱·活了下来', icon: '🩹', rarity: 'A', weight: 25, levelBoost: 3 },
        { label: '被俘·同伴救出',     icon: '🆘', rarity: 'B', weight: 15, levelBoost: 5 },
        { label: '惨败·运气逃出生天', icon: '🍀', rarity: 'C', weight: 6 },
      ]
      return adjustCombatWeights(base, state.combatPower || state.level * 10, 800)
    },
  },
  {
    id: 'battle_seabeast', title: '⚔️ 深海遭遇战', icon: '🌊', minLevel: 58, maxLevel: 72, rarity: 'SS', enemyPower: 1200,
    prelude: '前往海神岛途中——万年邪魔虎鲸跃出深海！命运之轮，请转动——',
    computeOptions(state) {
      const base = [
        { label: '斩杀虎鲸·获得万年魂环！！', icon: '🐋', rarity: 'SSS', weight: 6, levelBoost: 8, soulRing: { year: 60000, colorName: '五万年', colorHex: '#4A148C', beast: '邪魔虎鲸', skill: '虎鲸破浪' } },
        { label: '击退虎鲸·成功脱险',         icon: '⚔️', rarity: 'SS', weight: 20, levelBoost: 5 },
        { label: '海神岛守卫出手相助',         icon: '🆘', rarity: 'S', weight: 28, levelBoost: 3 },
        { label: '船只受损·漂流到荒岛',       icon: '🏝️', rarity: 'A', weight: 25, levelBoost: 4 },
        { label: '沉船·获救但伤亡惨重',       icon: '🚢', rarity: 'C', weight: 21, levelBoost: 2 },
      ]
      return adjustCombatWeights(base, state.combatPower || state.level * 10, 1200)
    },
  },
  {
    id: 'battle_defend', title: '⚔️ 嘉陵关守城', icon: '🏰', minLevel: 68, maxLevel: 82, rarity: 'SSS', enemyPower: 2000,
    prelude: '武魂帝国大军压境——你必须守住嘉陵关东门！命运之轮，请转动——',
    computeOptions(state) {
      const base = [
        { label: '万夫莫开·守住了！！', icon: '🛡️', rarity: 'SSS', weight: 8, levelBoost: 10, worldImpact: { tangSan: { affinity: 30 } } },
        { label: '艰难守城·援军赶到',   icon: '⚔️', rarity: 'SS', weight: 22, levelBoost: 6 },
        { label: '用计策拖延·争取时间', icon: '🧠', rarity: 'S', weight: 30, levelBoost: 5 },
        { label: '城门被破·掩护撤退',   icon: '🏃', rarity: 'A', weight: 22, levelBoost: 3 },
        { label: '防线崩坏·溃败',       icon: '💔', rarity: 'C', weight: 18, levelBoost: 2 },
      ]
      return adjustCombatWeights(base, state.combatPower || state.level * 10, 2000)
    },
  },
  {
    id: 'battle_godGuard', title: '⚔️ 神界守卫战', icon: '☁️', minLevel: 85, maxLevel: 98, rarity: 'SSS', enemyPower: 5000,
    prelude: '神界守卫者——远古神祇残魂挡住了去路！命运之轮，请转动——',
    computeOptions(state) {
      const base = [
        { label: '击败守卫·获得神位线索！！', icon: '⚡', rarity: 'SSS', weight: 5, levelBoost: 12 },
        { label: '通过考验·守卫认可了你',     icon: '✅', rarity: 'SS', weight: 18, levelBoost: 8 },
        { label: '智取·绕过守卫防御',         icon: '🧠', rarity: 'S', weight: 28, levelBoost: 6 },
        { label: '被击退·守卫没下杀手',       icon: '💨', rarity: 'A', weight: 28, levelBoost: 4 },
        { label: '被打败·退回凡间',           icon: '⬇️', rarity: 'C', weight: 21, levelBoost: 3 },
      ]
      return adjustCombatWeights(base, state.combatPower || state.level * 10, 5000)
    },
  },
  {
    id: 'hellRoad', title: '🔥 地狱路', icon: '💀', minLevel: 42, maxLevel: 58, rarity: 'SSS', isMilestone: true,
    requiredEvents: ['slaughterCity'],
    prelude: '杀戮之都最深处——地狱路！走过它，你将觉醒杀神领域。命运之轮，请转动——',
    computeOptions(state) {
      return [
        { label: '走过地狱路·觉醒杀神领域！！', icon: '⚔️', rarity: 'SSS', weight: 10, levelBoost: 8, worldImpact: { domain: '杀神领域' } },
        { label: '艰难走过·领域初步觉醒',       icon: '🩸', rarity: 'SS', weight: 22, levelBoost: 5, worldImpact: { domain: '杀神领域' } },
        { label: '被幻象困住·侥幸逃脱',         icon: '👻', rarity: 'S', weight: 28, levelBoost: 3 },
        { label: '无法通过·退回避开',           icon: '↩️', rarity: 'B', weight: 25, levelBoost: 2 },
        { label: '迷失·生死不明',               icon: '🌫️', rarity: 'C', weight: 15 },
      ]
    },
  },
  {
    id: 'blueSilver_awaken', title: '🌿 蓝银异动', icon: '🌱', minLevel: 30, maxLevel: 55, rarity: 'SS', isMilestone: true,
    prelude: '你的蓝银草武魂突然不受控制地疯狂生长！一股古老而强大的意识在呼唤你——蓝银皇血脉在觉醒！命运之轮，请转动——',
    computeOptions(state) {
      const soul = state.attributes?.soulType || ''
      if (!soul.includes('蓝银')) return [{ label: '你的武魂不是蓝银草', icon: '❓', rarity: 'C', weight: 100 }]
      return [
        { label: '成功觉醒·蓝银皇血脉！！', icon: '🌿', rarity: 'SSS', weight: 15, levelBoost: 7 },
        { label: '部分觉醒·获得蓝银之力',   icon: '💚', rarity: 'SS', weight: 28, levelBoost: 4 },
        { label: '压制异动·暂时稳定',       icon: '🛑', rarity: 'A', weight: 30, levelBoost: 2 },
        { label: '觉醒失败·蓝银枯萎',       icon: '🥀', rarity: 'C', weight: 27 },
      ]
    },
  },
  {
    id: 'blueSilver_evolve', title: '🌿 蓝银领域', icon: '✨', minLevel: 40, maxLevel: 70, rarity: 'SSS',
    requiredEvents: ['blueSilver_awaken'],
    prelude: '蓝银皇血脉完全觉醒！蓝银领域展开——所有的蓝银草都是你的眼睛和武器！命运之轮，请转动——',
    computeOptions(state) {
      return [
        { label: '领域展开·万物生长！！', icon: '🌿', rarity: 'SSS', weight: 20, levelBoost: 8, worldImpact: { domain: '蓝银领域' } },
        { label: '领域初成·掌控自然之力', icon: '💚', rarity: 'SS', weight: 30, levelBoost: 5, worldImpact: { domain: '蓝银领域' } },
        { label: '领域不稳定·需要磨合',   icon: '🔄', rarity: 'S', weight: 28, levelBoost: 3 },
        { label: '觉醒失败·武魂增强',     icon: '📈', rarity: 'B', weight: 22, levelBoost: 2 },
      ]
    },
  },
  {
    id: 'angel_descent', title: '👼 天使降临', icon: '✨', minLevel: 45, maxLevel: 80, rarity: 'SSS',
    requiredEvents: ['interact_qianRenXue'],
    prelude: '六翼天使虚影从天而降！千仞雪向你伸出手："天使神选中了你。接受天使祝福，觉醒天使领域。"命运之轮，请转动——',
    computeOptions(state) {
      const met = state.relationships?.qianRenXue?.met
      if (!met) return [{ label: '你还没见过千仞雪', icon: '❓', rarity: 'C', weight: 100 }]
      return [
        { label: '接受祝福·觉醒天使领域！！', icon: '👼', rarity: 'SSS', weight: 15, levelBoost: 8, worldImpact: { domain: '天使领域', qianRenXue: { affinity: 50 } } },
        { label: '接受·领域弱化',             icon: '🙏', rarity: 'SS', weight: 25, levelBoost: 5, worldImpact: { domain: '天使领域' } },
        { label: '犹豫后最终接受',             icon: '🤔', rarity: 'S', weight: 28, levelBoost: 4, worldImpact: { domain: '天使领域' } },
        { label: '拒绝·天使光影消散',         icon: '🚫', rarity: 'B', weight: 22, levelBoost: 2 },
        { label: '被天使神威所伤',             icon: '😰', rarity: 'C', weight: 10 },
      ]
    },
  },
  {
    id: 'asura_call', title: '⚔️ 修罗召唤', icon: '💀', minLevel: 70, maxLevel: 90, rarity: 'SSS',
    prelude: '深夜，血色光柱笼罩你——修罗神在召唤！"杀戮与审判的权柄，属于最强者。"命运之轮，请转动——',
    computeOptions(state) {
      return [
        { label: '接受试炼·踏上修罗之路',   icon: '⚔️', rarity: 'SSS', weight: 12, levelBoost: 6 },
        { label: '修罗神不容拒绝',           icon: '😰', rarity: 'SS', weight: 22, levelBoost: 4 },
        { label: '拒绝·光柱消散',           icon: '🚫', rarity: 'B', weight: 30, levelBoost: 2 },
        { label: '被吞噬·强制试炼',         icon: '🌀', rarity: 'S', weight: 36, levelBoost: 5 },
      ]
    },
  },
  {
    id: 'death_seed', title: '🖤 死亡种子', icon: '🥀', minLevel: 45, maxLevel: 70, rarity: 'SS',
    prelude: '你体内涌起阴冷的力量——邪魂师血脉中的死亡之力在觉醒。一颗死亡种子正在灵魂中扎根……命运之轮，请转动——',
    computeOptions(state) {
      const isEvil = state.attributes?.race === '邪魂师血脉' || state.attributes?.soulType?.includes('邪') || state.attributes?.soulType?.includes('死') || state.attributes?.soulType?.includes('噬魂') || state.attributes?.soulType?.includes('死亡')
      if (!isEvil) return [{ label: '你体内没有邪魂师力量', icon: '❓', rarity: 'C', weight: 100 }]
      return [
        { label: '接受种子·觉醒死亡领域！！', icon: '💀', rarity: 'SSS', weight: 15, levelBoost: 8, worldImpact: { domain: '死亡领域' } },
        { label: '压制种子·保留力量',         icon: '🛑', rarity: 'SS', weight: 25, levelBoost: 5 },
        { label: '种子爆发·失控但觉醒',       icon: '🔥', rarity: 'S', weight: 28, levelBoost: 6, worldImpact: { domain: '死亡领域' } },
        { label: '排斥种子·力量消散',         icon: '💨', rarity: 'B', weight: 22, levelBoost: 2 },
        { label: '种子反噬·重伤',             icon: '🤕', rarity: 'C', weight: 10 },
      ]
    },
  },
]

// ========== 工具函数 ==========

/** 获取指定等级区间的事件池 */
export function getEventPool(minLevel, maxLevel = 100) {
  return EVENT_POOL.filter(ev => ev.minLevel >= minLevel && ev.minLevel <= maxLevel)
}

/** 获取所有事件ID列表 */
export function getAllEventIds() {
  return EVENT_POOL.map(ev => ev.id)
}

/** 根据ID获取事件 */
export function getEventById(id) {
  return EVENT_POOL.find(ev => ev.id === id)
}
];
