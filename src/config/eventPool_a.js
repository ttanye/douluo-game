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

export const EVENT_POOL = [
  // ==================== 魂骨猎杀事件（6个，覆盖全等级） ====================
  {
    id: 'boneHunt_lv20', title: '🦴 魂骨猎杀·百年', icon: '🦴', minLevel: 18, maxLevel: 30, rarity: 'A', isMilestone: true,
    prelude: '一头百年魂兽的体内检测到了魂骨反应！虽然年份不高，但魂骨就是魂骨。命运之轮，请转动——',
    computeOptions(state) {
      const power = state.combatPower || (state.level||1)*10
      const pwr = 1 + power / 1000
      return [
        { label: '成功猎杀·获得右腿魂骨！！', icon: '🦴', rarity: 'SSS', weight: Math.floor(18*pwr), levelBoost: 3, soulBone: { slot: 'rightLeg', beast: '百年幽冥狼', year: 600, skill: '幽冥步', rarity: 'B' } },
        { label: '获得左臂魂骨',               icon: '💪', rarity: 'SS', weight: Math.floor(28*pwr), levelBoost: 2, soulBone: { slot: 'leftArm', beast: '百年粉红女郎', year: 700, skill: '毒刺增强', rarity: 'B' } },
        { label: '魂兽逃走了',                 icon: '🏃', rarity: 'B', weight: Math.max(5, Math.floor(30/pwr)), levelBoost: 1 },
        { label: '情报有误',                   icon: '😔', rarity: 'C', weight: Math.max(3, Math.floor(24/pwr)) },
      ]
    },
  },
  {
    id: 'boneHunt_lv35', title: '🦴 魂骨猎杀·千年', icon: '🦴', minLevel: 30, maxLevel: 45, rarity: 'S', isMilestone: true,
    prelude: '千年魂兽的魂骨反应！右臂骨或左腿骨——这次猎杀值得冒险。命运之轮，请转动——',
    computeOptions(state) {
      const pwr = 1 + (state.combatPower||(state.level||1)*10) / 1000
      return [
        { label: '获得右臂魂骨！！', icon: '🦴', rarity: 'SSS', weight: Math.floor(15*pwr), levelBoost: 4, soulBone: { slot: 'rightArm', beast: '千年麟甲兽', year: 5000, skill: '麟甲护体', rarity: 'A' } },
        { label: '获得左腿魂骨',     icon: '🦵', rarity: 'SS', weight: Math.floor(25*pwr), levelBoost: 3, soulBone: { slot: 'leftLeg', beast: '千年鬼虎', year: 4000, skill: '鬼虎步', rarity: 'A' } },
        { label: '获得头部魂骨',     icon: '🧠', rarity: 'S', weight: Math.floor(15*pwr), levelBoost: 3, soulBone: { slot: 'head', beast: '千年凤尾鸡冠蛇', year: 6000, skill: '精神敏锐', rarity: 'A' } },
        { label: '魂兽逃走了',       icon: '🏃', rarity: 'A', weight: Math.max(5,Math.floor(25/pwr)), levelBoost: 2 },
        { label: '没有魂骨',         icon: '😔', rarity: 'C', weight: Math.max(3,Math.floor(20/pwr)) },
      ]
    },
  },
  {
    id: 'boneHunt_lv50', title: '🦴 魂骨猎杀·万年', icon: '🦴', minLevel: 45, maxLevel: 60, rarity: 'SS', isMilestone: true,
    prelude: '万年魂骨的传闻——躯干骨！来自万年大地之王。无数魂师蜂拥而至。命运之轮，请转动——',
    computeOptions(state) {
      return [
        { label: '获得躯干骨！！',       icon: '🦴', rarity: 'SSS', weight: 12, levelBoost: 5, soulBone: { slot: 'torso', beast: '万年大地之王', year: 50000, skill: '大地守护', rarity: 'S' } },
        { label: '获得头部魂骨',         icon: '🧠', rarity: 'SS', weight: 22, levelBoost: 4, soulBone: { slot: 'head', beast: '万年粉红娘娘', year: 30000, skill: '精神冲击', rarity: 'S' } },
        { label: '获得右臂魂骨',         icon: '💪', rarity: 'S', weight: 20, levelBoost: 4, soulBone: { slot: 'rightArm', beast: '万年暗金恐爪熊', year: 50000, skill: '暗金恐爪', rarity: 'S' } },
        { label: '来晚了·被取走',       icon: '⏰', rarity: 'A', weight: 26, levelBoost: 2 },
        { label: '白跑一趟',             icon: '😤', rarity: 'C', weight: 20 },
      ]
    },
  },
  {
    id: 'boneHunt_lv65', title: '🦴 魂骨猎杀·五万年', icon: '🦴', minLevel: 60, maxLevel: 75, rarity: 'SS', isMilestone: true,
    prelude: '五万年魂兽的魂骨现世——据说是来自深海魔鲸的左臂骨！海洋中的至宝。命运之轮，请转动——',
    computeOptions(state) {
      return [
        { label: '获得左臂魂骨！！',   icon: '💪', rarity: 'SSS', weight: 12, levelBoost: 6, soulBone: { slot: 'leftArm', beast: '五万年深海魔鲸', year: 50000, skill: '深海之力', rarity: 'SS' } },
        { label: '获得左腿魂骨',       icon: '🦵', rarity: 'SS', weight: 22, levelBoost: 5, soulBone: { slot: 'leftLeg', beast: '五万年邪魔虎鲸', year: 50000, skill: '虎鲸之速', rarity: 'SS' } },
        { label: '获得躯干骨',         icon: '🦴', rarity: 'S', weight: 20, levelBoost: 5, soulBone: { slot: 'torso', beast: '五万年魔鬼鱼王', year: 50000, skill: '深海屏障', rarity: 'S' } },
        { label: '被捷足先登',         icon: '😤', rarity: 'A', weight: 26, levelBoost: 2 },
        { label: '情报假的',           icon: '😔', rarity: 'C', weight: 20 },
      ]
    },
  },
  {
    id: 'boneHunt_lv80', title: '🦴 魂骨猎杀·十万年', icon: '🦴', minLevel: 75, maxLevel: 90, rarity: 'SSS', isMilestone: true,
    prelude: '传说中的十万年魂骨——外附魂骨！来自陨落的天青牛蟒。所有魂师梦寐以求的至宝。命运之轮，请转动——',
    computeOptions(state) {
      const pwr = 1 + (state.combatPower||(state.level||1)*10) / 800
      return [
        { label: '获得外附魂骨！！',   icon: '🦴', rarity: 'SSS', weight: Math.floor(8*pwr), levelBoost: 8, soulBone: { slot: 'external', beast: '十万年天青牛蟒', year: 100000, skill: '天青之翼', rarity: 'SSS' } },
        { label: '获得头部魂骨',       icon: '🧠', rarity: 'SS', weight: Math.floor(18*pwr), levelBoost: 6, soulBone: { slot: 'head', beast: '十万年泰坦巨猿', year: 100000, skill: '泰坦意志', rarity: 'SS' } },
        { label: '获得右臂魂骨',       icon: '💪', rarity: 'S', weight: Math.floor(22*pwr), levelBoost: 6, soulBone: { slot: 'rightArm', beast: '十万年深海魔鲸王', year: 100000, skill: '魔鲸之握', rarity: 'SS' } },
        { label: '魂兽太强·撤退',     icon: '🏃', rarity: 'A', weight: Math.max(5,Math.floor(30/pwr)), levelBoost: 3 },
        { label: '情报假的·发现秘境',  icon: '🏞️', rarity: 'B', weight: Math.max(3,Math.floor(22/pwr)), levelBoost: 4 },
      ]
    },
  },
  {
    id: 'boneHunt_lv95', title: '🦴 魂骨猎杀·百万年', icon: '🦴', minLevel: 90, maxLevel: 100, rarity: 'SSS', isMilestone: true,
    prelude: '百万年魂骨——传说中龙神遗留的外附魂骨！这是斗罗大陆上最顶级的魂骨，拥有它的人将获得碾压一切的力量。命运之轮，请转动——',
    computeOptions(state) {
      return [
        { label: '获得龙神外附魂骨！！', icon: '🦴', rarity: 'SSS', weight: 6, levelBoost: 10, soulBone: { slot: 'external', beast: '百万年龙神', year: 1000000, skill: '龙神之翼', rarity: 'SSS' } },
        { label: '获得头部魂骨',         icon: '🧠', rarity: 'SS', weight: 16, levelBoost: 8, soulBone: { slot: 'head', beast: '百万年冰龙神', year: 1000000, skill: '冰龙神念', rarity: 'SSS' } },
        { label: '获得躯干骨',           icon: '🦴', rarity: 'S', weight: 20, levelBoost: 7, soulBone: { slot: 'torso', beast: '百万年天梦冰蚕', year: 1000000, skill: '冰蚕神衣', rarity: 'SS' } },
        { label: '龙神残魂太强·撤退',   icon: '🏃', rarity: 'A', weight: 28, levelBoost: 4 },
        { label: '情报假的·发现神迹',    icon: '✨', rarity: 'B', weight: 30, levelBoost: 5 },
      ]
    },
  },

  // ==================== 魂环里程碑 ====================
  {
    id: 'ring_lv10', title: '💍 第一魂环', icon: '💍', minLevel: 9, maxLevel: 16, rarity: 'SSS', isMilestone: true,
    prelude: '10级！获取第一魂环的时刻。以你目前的实力，能猎取什么年份的魂兽？命运之轮，请转动——',
    computeOptions(state) { return buildRingOptions(state, 1, [
      { beast: '远古龙种',     year: 800000, color: '百万年', icon: '🐉', hex: '#FFD700', skill: '远古龙息' },
      { beast: '天青牛蟒幼体', year: 80000,  color: '十万年', icon: '🐂', hex: '#FF1744', skill: '天青寂灭' },
      { beast: '曼陀罗蛇',     year: 4000,   color: '千年',   icon: '🐍', hex: '#7B1FA2', skill: '曼陀罗蛇缚' },
      { beast: '凤尾鸡冠蛇',   year: 2500,   color: '千年',   icon: '🐔', hex: '#7B1FA2', skill: '凤翔闪' },
      { beast: '幻影狐',       year: 1200,   color: '千年',   icon: '🦊', hex: '#7B1FA2', skill: '幻影分身' },
      { beast: '幽冥狼',       year: 400,    color: '百年',   icon: '🐺', hex: '#F9A825', skill: '幽冥狼爪' },
      { beast: '噬金鼠',       year: 800,    color: '百年',   icon: '🐭', hex: '#F9A825', skill: '金噬' },
      { beast: '鬼藤',         year: 600,    color: '百年',   icon: '🌿', hex: '#F9A825', skill: '藤缚' },
      { beast: '铁甲野猪',     year: 200,    color: '百年',   icon: '🐗', hex: '#F9A825', skill: '野蛮冲撞' },
      { beast: '柔骨兔',       year: 30,     color: '十年',   icon: '🐰', hex: '#EEEEEE', skill: '柔骨兔蹬' },
    ])},
  },
  {
    id: 'ring_lv20', title: '💍 第二魂环', icon: '💍', minLevel: 17, maxLevel: 28, rarity: 'SSS', isMilestone: true,
    prelude: '20级！第二魂环的猎取需要更强的魂兽。命运之轮，请转动——',
    computeOptions(state) { return buildRingOptions(state, 2, [
      { beast: '深海魔鲸王',   year: 900000, color: '百万年', icon: '🐋', hex: '#FFD700', skill: '武魂真身·魔鲸' },
      { beast: '邪魔虎鲸王',   year: 90000,  color: '五万年', icon: '🦈', hex: '#4A148C', skill: '武魂真身·虎鲸' },
      { beast: '地穴魔蛛',     year: 30000,  color: '五万年', icon: '🕷️', hex: '#4A148C', skill: '蛛网束缚' },
      { beast: '人面魔蛛',     year: 6000,   color: '五千年', icon: '🕸️', hex: '#7B1FA2', skill: '剧毒蛛网' },
      { beast: '鬼虎',         year: 3000,   color: '千年',   icon: '🐯', hex: '#7B1FA2', skill: '虎啸' },
      { beast: '闪电隼',       year: 2500,   color: '千年',   icon: '🦅', hex: '#7B1FA2', skill: '闪电突袭' },
      { beast: '铁甲熊',       year: 800,    color: '百年',   icon: '🐻', hex: '#F9A825', skill: '铁甲冲撞' },
      { beast: '粉红女郎',     year: 500,    color: '百年',   icon: '🦂', hex: '#F9A825', skill: '毒刺' },
      { beast: '毒尾蝎',       year: 200,    color: '百年',   icon: '🦂', hex: '#F9A825', skill: '蝎尾毒针' },
      { beast: '竹叶青',       year: 80,     color: '十年',   icon: '🐍', hex: '#EEEEEE', skill: '竹叶青咬' },
    ])},
  },
  {
    id: 'ring_lv30', title: '💍 第三魂环', icon: '💍', minLevel: 27, maxLevel: 38, rarity: 'SSS', isMilestone: true,
    prelude: '30级！你需要一枚更强大的魂环来突破瓶颈。命运之轮，请转动——',
    computeOptions(state) { return buildRingOptions(state, 3, [
      { beast: '泰坦巨猿',     year: 80000,  color: '十万年', icon: '🦍', hex: '#FF1744', skill: '泰坦之力' },
      { beast: '大地之王',     year: 40000,  color: '五万年', icon: '🦂', hex: '#4A148C', skill: '岩浆喷涌' },
      { beast: '凤尾鸡冠蛇',   year: 5000,   color: '五千年', icon: '🐔', hex: '#7B1FA2', skill: '凤翔' },
      { beast: '麟甲兽',       year: 3500,   color: '千年',   icon: '🦎', hex: '#7B1FA2', skill: '麟甲护体' },
      { beast: '鬼藤',         year: 700,    color: '百年',   icon: '🌿', hex: '#F9A825', skill: '缠绕' },
      { beast: '铁甲犀牛',     year: 1500,   color: '千年',   icon: '🦏', hex: '#7B1FA2', skill: '犀牛冲撞' },
      { beast: '赤练蛇',       year: 400,    color: '百年',   icon: '🐍', hex: '#F9A825', skill: '赤练毒牙' },
      { beast: '岩甲龟',       year: 900,    color: '百年',   icon: '🐢', hex: '#F9A825', skill: '岩甲防御' },
      { beast: '大地鼠',       year: 120,    color: '百年',   icon: '🐀', hex: '#F9A825', skill: '遁地' },
      { beast: '板甲巨犀',     year: 20000,  color: '万年',   icon: '🦏', hex: '#212121', skill: '战争践踏' },
    ])},
  },
  {
    id: 'ring_lv40', title: '💍 第四魂环', icon: '💍', minLevel: 36, maxLevel: 48, rarity: 'SSS', isMilestone: true,
    prelude: '40级！第四魂环是你实力质变的开始。命运之轮，请转动——',
    computeOptions(state) { return buildRingOptions(state, 4, [
      { label: '', icon: '🦂', beast: '大地之王', year: 40000, color: '万年', hex: '#212121', skill: '岩浆喷涌' },
      { label: '', icon: '🦋', beast: '粉红娘娘', year: 8000,  color: '千年', hex: '#7B1FA2', skill: '迷幻花粉' },
      { label: '', icon: '🐭', beast: '噬金鼠',   year: 4000,  color: '千年', hex: '#7B1FA2', skill: '金属吞噬' },
    ])},
  },
  {
    id: 'ring_lv50', title: '💍 第五魂环', icon: '💍', minLevel: 47, maxLevel: 56, rarity: 'SSS', isMilestone: true,
    prelude: '50级！第五魂环——魂王境界的关键一环！命运之轮，请转动——',
    computeOptions(state) { return buildRingOptions(state, 5, [
      { label: '', icon: '🐋', beast: '深海魔鲸',   year: 90000, color: '万年', hex: '#212121', skill: '深海之怒' },
      { label: '', icon: '🐯', beast: '暗魔邪神虎', year: 50000, color: '万年', hex: '#212121', skill: '暗魔邪光' },
      { label: '', icon: '🐻', beast: '大地熊王',   year: 9000,  color: '千年', hex: '#7B1FA2', skill: '大地震' },
    ])},
  },
  {
    id: 'ring_lv60', title: '💍 第六魂环', icon: '💍', minLevel: 57, maxLevel: 66, rarity: 'SSS', isMilestone: true,
    prelude: '60级！第六魂环——魂帝的标志！命运之轮，请转动——',
    computeOptions(state) { return buildRingOptions(state, 6, [
      { label: '', icon: '🐂', beast: '天青牛蟒', year: 100000, color: '十万年', hex: '#FF1744', skill: '天青寂灭' },
      { label: '', icon: '🐯', beast: '邪眸白虎', year: 60000,  color: '万年',   hex: '#212121', skill: '白虎流星雨' },
      { label: '', icon: '🧊', beast: '冰凤凰',   year: 9000,   color: '千年',   hex: '#7B1FA2', skill: '冰雪风暴' },
    ])},
  },
  {
    id: 'ring_lv70', title: '💍 第七魂环·武魂真身', icon: '💍', minLevel: 67, maxLevel: 76, rarity: 'SSS', isMilestone: true,
    prelude: '70级！武魂真身的觉醒——第七魂环至关重要！命运之轮，请转动——',
    computeOptions(state) { return buildRingOptions(state, 7, [
      { label: '', icon: '🐋', beast: '深海魔鲸王', year: 1000000, color: '百万年', hex: '#FFD700', skill: '武魂真身·魔鲸' },
      { label: '', icon: '🦈', beast: '邪魔虎鲸王', year: 100000,  color: '十万年', hex: '#FF1744', skill: '武魂真身·虎鲸' },
      { label: '', icon: '🦇', beast: '魔鬼鱼王',   year: 70000,   color: '万年',   hex: '#212121', skill: '武魂真身·魔鬼鱼' },
    ])},
  },
  {
    id: 'ring_lv80', title: '💍 第八魂环', icon: '💍', minLevel: 77, maxLevel: 86, rarity: 'SSS', isMilestone: true,
    prelude: '80级！第八魂环——魂斗罗的最后一环！命运之轮，请转动——',
    computeOptions(state) { return buildRingOptions(state, 8, [
      { label: '', icon: '🧊', beast: '泰坦雪魔', year: 100000, color: '十万年', hex: '#FF1744', skill: '冰封万里' },
      { label: '', icon: '🐜', beast: '千钧蚁皇', year: 80000,  color: '万年',   hex: '#212121', skill: '千钧之力' },
      { label: '', icon: '🧸', beast: '金刚熊王', year: 60000,  color: '万年',   hex: '#212121', skill: '金刚不坏' },
    ])},
  },
  {
    id: 'ring_lv90', title: '💍 第九魂环·封号之证', icon: '💍', minLevel: 87, maxLevel: 96, rarity: 'SSS', isMilestone: true,
    prelude: '90级！封号斗罗的最后一块拼图——第九魂环！命运之轮，请转动——',
    computeOptions(state) { return buildRingOptions(state, 9, [
      { label: '', icon: '🐉', beast: '龙神残魂', year: 1000000, color: '百万年', hex: '#FFD700', skill: '龙神变' },
      { label: '', icon: '🐛', beast: '天梦冰蚕', year: 100000,  color: '十万年', hex: '#FF1744', skill: '冰蚕神丝' },
      { label: '', icon: '🦂', beast: '大地之王', year: 90000,   color: '万年',   hex: '#212121', skill: '大地之怒' },
    ])},
  },
  {
    id: 'ring_lv100', title: '💍 第十魂环·神级', icon: '💍', minLevel: 95, maxLevel: 100, rarity: 'SSS', isMilestone: true,
    prelude: '100级！凡人的极限——第十魂环必须是神级！命运之轮，请转动——',
    computeOptions(state) { return buildRingOptions(state, 10, [
      { label: '', icon: '🐉', beast: '龙神核心', year: 10000000, color: '神级', hex: '#FFD700', skill: '龙神降临' },
      { label: '', icon: '✨', beast: '神赐魂兽', year: 999999,   color: '神赐', hex: '#FFD700', skill: '神灵庇护' },
      { label: '', icon: '⭐', beast: '伪神魂兽', year: 99000,    color: '万年', hex: '#212121', skill: '伪神之力' },
    ])},
  },

  // ==================== 等级里程碑事件 ====================
  {
    id: 'milestone_lv20', title: '🔷 瓶颈突破', icon: '🧱', minLevel: 19, maxLevel: 22, rarity: 'SSS', isMilestone: true,
    prelude: '你感到体内的魂力达到了一个临界点——这是你魂师生涯中的第一道真正的瓶颈。突破它，你将踏入全新的境界！命运之轮，请转动——',
    computeOptions(state) {
      return [
        { label: '完美突破·经脉全开',   icon: '✨', rarity: 'SSS', weight: 10, levelBoost: 5 },
        { label: '借助外力·丹药辅助',   icon: '💊', rarity: 'A', weight: 25, levelBoost: 3 },
        { label: '苦修突破·水到渠成',   icon: '💪', rarity: 'B', weight: 30, levelBoost: 2 },
        { label: '濒临走火·但因祸得福', icon: '🔥', rarity: 'S', weight: 15, levelBoost: 4 },
        { label: '突破失败·但积累经验', icon: '📈', rarity: 'C', weight: 20, levelBoost: 1 },
      ]
    },
  },
  {
    id: 'milestone_lv40', title: '🔷 武魂进化', icon: '🦋', minLevel: 39, maxLevel: 43, rarity: 'SSS', isMilestone: true,
    prelude: '你的武魂在40级这个节点产生了质变！它开始吸收你一路走来的所有战斗经验，进行自我进化——命运之轮，请转动——',
    computeOptions(state) {
      return [
        { label: '武魂完美进化·品质飞跃',   icon: '🌟', rarity: 'SSS', weight: 8, levelBoost: 6 },
        { label: '觉醒第二形态·战力倍增',   icon: '⚡', rarity: 'SS', weight: 20, levelBoost: 5 },
        { label: '稳定进化·根基扎实',       icon: '✅', rarity: 'A', weight: 30, levelBoost: 3 },
        { label: '进化方向偏移·但获得新能力', icon: '🔄', rarity: 'S', weight: 22, levelBoost: 4 },
        { label: '进化受阻·但武魂更坚韧',    icon: '🛡️', rarity: 'B', weight: 20, levelBoost: 2 },
      ]
    },
  },
  {
    id: 'milestone_lv60', title: '🔷 武魂真身', icon: '🦸', minLevel: 59, maxLevel: 63, rarity: 'SSS', isMilestone: true,
    prelude: '武魂真身——六环魂帝的标志！你的武魂将第一次以真身形态降临世间。这一刻，你等了太久！命运之轮，请转动——',
    computeOptions(state) {
      return [
        { label: '完美真身·武魂具象化！！',   icon: '💫', rarity: 'SSS', weight: 10, levelBoost: 7 },
        { label: '真身降临·战力飙升',         icon: '💪', rarity: 'SS', weight: 25, levelBoost: 5 },
        { label: '真身成形·根基稳固',         icon: '🦾', rarity: 'A', weight: 30, levelBoost: 3 },
        { label: '真身暴走·但被压制后更强',   icon: '🌀', rarity: 'S', weight: 20, levelBoost: 5 },
        { label: '真身失败·但魂力结构优化',   icon: '🔧', rarity: 'B', weight: 15, levelBoost: 2 },
      ]
    },
  },
  {
    id: 'milestone_lv80', title: '🔷 封号之路', icon: '👑', minLevel: 79, maxLevel: 83, rarity: 'SSS', isMilestone: true,
    prelude: '八环魂斗罗！封号斗罗只有一步之遥。但这一步之遥，困住了古往今来无数天才。你必须找到属于自己的"道"——命运之轮，请转动——',
    computeOptions(state) {
      return [
        { label: '悟道成功·封号之路大开',   icon: '💡', rarity: 'SSS', weight: 10, levelBoost: 8 },
        { label: '战斗中顿悟·以战入道',     icon: '⚔️', rarity: 'SS', weight: 22, levelBoost: 6 },
        { label: '借鉴前人·站在巨人肩上',   icon: '📖', rarity: 'A', weight: 28, levelBoost: 4 },
        { label: '还差一点·但快了',         icon: '⏳', rarity: 'B', weight: 25, levelBoost: 2 },
        { label: '走入歧途·但发现新路',     icon: '🌿', rarity: 'S', weight: 15, levelBoost: 5 },
      ]
    },
  },
  {
    id: 'milestone_lv90', title: '🔷 神位感应', icon: '🔱', minLevel: 89, maxLevel: 93, rarity: 'SSS', isMilestone: true,
    prelude: '封号斗罗之上，是神！你第一次清晰地感受到了神界的存在——那是更高层次的力量。你的神位传承，正在觉醒——命运之轮，请转动——',
    computeOptions(state) {
      return [
        { label: '神位觉醒·传承显现！！', icon: '🌟', rarity: 'SSS', weight: 12, levelBoost: 6 },
        { label: '感应明确·方向清晰',     icon: '🧭', rarity: 'SS', weight: 25, levelBoost: 4 },
        { label: '朦胧感应·还需历练',     icon: '🌫️', rarity: 'A', weight: 28, levelBoost: 2 },
        { label: '多个神位同时召唤',       icon: '🎭', rarity: 'S', weight: 20, levelBoost: 5 },
        { label: '感应微弱·但心中有火',   icon: '🕯️', rarity: 'B', weight: 15, levelBoost: 3 },
      ]
    },
  },
  {
    id: 'milestone_lv100', title: '🔷 最终觉醒', icon: '💫', minLevel: 99, maxLevel: 100, rarity: 'SSS', isMilestone: true,
    prelude: '100级！凡人的极限！神的起点！你的身体、武魂、灵魂——一切都在这一刻达到了最完美的状态。最终觉醒，在此一举！命运之轮，请转动——',
    computeOptions(state) {
      return [
        { label: '完全觉醒·踏入神之领域！！', icon: '✨', rarity: 'SSS', weight: 20, levelBoost: 5 },
        { label: '觉醒成功·神位稳固',         icon: '✅', rarity: 'SS', weight: 35, levelBoost: 3 },
        { label: '觉醒中看到前世今生',        icon: '🔄', rarity: 'S', weight: 25, levelBoost: 4 },
        { label: '觉醒太强·暂时封印部分力量', icon: '🔐', rarity: 'A', weight: 15, levelBoost: 2 },
        { label: '觉醒失败·但已知天命',       icon: '📜', rarity: 'B', weight: 5 },
      ]
    },
  },

  // ==================== Lv.1-10: 初入魂师界 ====================
  {
    id: 'firstAwakening', title: '武魂觉醒仪式', icon: '✨', minLevel: 1, maxLevel: 99, rarity: 'A',
    prelude: '诺丁城武魂殿分殿中，觉醒仪式正在进行。你走上前去，将手放在了觉醒水晶上……命运之轮，请转动——',
    computeOptions(state) {
      return [
        { label: '完美觉醒·光芒万丈', icon: '🌟', rarity: 'SSS', weight: 1 },
        { label: '顺利觉醒·魂力涌动', icon: '💡', rarity: 'A', weight: 25 },
        { label: '正常觉醒·平凡之路', icon: '🔮', rarity: 'B', weight: 35 },
        { label: '困难觉醒·险些失败', icon: '😰', rarity: 'C', weight: 25 },
        { label: '变异觉醒·异象突生', icon: '🌀', rarity: 'SS', weight: 4 },
        { label: '失败·沦为废人',     icon: '💔', rarity: 'C', weight: 10 },
      ]
    },
  },
  {
    id: 'firstTeacher', title: '第一位老师', icon: '👨‍🏫', minLevel: 1, maxLevel: 30, rarity: 'A',
    requiredEvents: ['firstAwakening'],
    prelude: '觉醒之后，一位魂师注意到了你。他将成为你在魂师路上的第一位引路人……命运之轮，请转动——',
    computeOptions(state) {
      const innate = state.attributes?.innatePower || 0
      return [
        { label: '隐世高人', icon: '🧙', rarity: 'SSS', weight: innate >= 8 ? 3 : 0.5, unlocks: ['hiddenMaster'] },
        { label: '学院名师', icon: '👨‍🏫', rarity: 'A', weight: 20 },
        { label: '退役魂师', icon: '🧓', rarity: 'B', weight: 30 },
        { label: '邪魂师',   icon: '🕯️', rarity: 'S', weight: 8, unlocks: ['evilPath'] },
        { label: '自学成才', icon: '📚', rarity: 'C', weight: innate >= 5 ? 15 : 30 },
      ]
    },
  },
  {
    id: 'firstBattle', title: '第一场战斗', icon: '⚔️', minLevel: 1, maxLevel: 30, rarity: 'B', enemyPower: CANON_NPC.beast_10yr,
    requiredEvents: ['firstAwakening'],
    prelude: '一只十年魂兽出现在你面前！这是你的第一次实战……命运之轮，请转动——',
    computeOptions(state) {
      const base = [
        { label: '正面硬刚·以力破敌',   icon: '💪', rarity: 'B', weight: 30, levelBoost: 1 },
        { label: '智取弱点·精准打击',   icon: '🧠', rarity: 'A', weight: 22, levelBoost: 2 },
        { label: '防守反击·稳扎稳打',   icon: '🛡️', rarity: 'A', weight: 20, levelBoost: 1 },
        { label: '力量不够·但积累了经验', icon: '📈', rarity: 'C', weight: 18, levelBoost: 0.5 },
        { label: '燃烧魂力·透支换来速胜', icon: '🔥', rarity: 'S', weight: 10, levelBoost: 3, worldImpact: { self: { exhausted: true } } },
      ]
      return adjustCombatWeights(base, state.combatPower || state.level * 10, CANON_NPC.beast_10yr)
    },
  },
  // 早期补充事件（无前置，减缓重复感）
  {
    id: 'childhoodMemory', title: '童年的记忆', icon: '🧒', minLevel: 1, maxLevel: 12, rarity: 'B',
    prelude: '你隐约记得小时候——在村子里的日子。那些关于魂师的传说，那些星空下的梦想……它们是你踏上这条路的初心。命运之轮，请转动——',
    computeOptions(state) {
      return [
        { label: '回忆起父亲留下的修炼笔记', icon: '📓', rarity: 'SS', weight: 12, levelBoost: 2 },
        { label: '想起母亲讲过的武魂故事',   icon: '💬', rarity: 'A', weight: 25, levelBoost: 1 },
        { label: '模糊的温暖记忆',           icon: '🏠', rarity: 'B', weight: 33, levelBoost: 1 },
        { label: '什么都不记得了',           icon: '🌫️', rarity: 'C', weight: 30 },
      ]
    },
  },
  {
    id: 'villageMarket', title: '村里的市集', icon: '🏪', minLevel: 1, maxLevel: 12, rarity: 'B',
    prelude: '诺丁城外的村庄市集上，商贩的叫卖声此起彼伏。你偶然在一个旧货摊前停下脚步……命运之轮，请转动——',
    computeOptions(state) {
      return [
        { label: '淘到一本泛黄的魂师手册', icon: '📖', rarity: 'SS', weight: 12, levelBoost: 2 },
        { label: '买到一颗劣质的魂力丹',   icon: '💊', rarity: 'A', weight: 25, levelBoost: 1 },
        { label: '什么都没买·只是闲逛',   icon: '🚶', rarity: 'B', weight: 33 },
        { label: '被小偷偷了钱包',         icon: '😤', rarity: 'C', weight: 30 },
      ]
    },
  },
  {
    id: 'firstEncounter', title: '初遇', icon: '👋', minLevel: 1, maxLevel: 25, rarity: 'S',
    requiredEvents: ['firstAwakening'], exclusiveGroup: 'firstContact',
    prelude: '在诺丁城的街道上，你遇到了一个蓝发少年……命运之轮，请转动——',
    computeOptions(state) {
      const era = state.attributes?.era || ''
      if (era.includes('少年')) {
        return [
          { label: '唐三',   icon: '🌿', rarity: 'SSS', weight: 25, worldImpact: { tangSan: { met: true, affinity: 10 } }, unlocks: ['tangSanPath'] },
          { label: '小舞',   icon: '🐰', rarity: 'SS',  weight: 20, worldImpact: { xiaoWu: { met: true, affinity: 10 } }, unlocks: ['xiaoWuPath'] },
          { label: '玉小刚', icon: '📖', rarity: 'S',   weight: 15, worldImpact: { yuXiaoGang: { met: true, affinity: 5 } } },
          { label: '武魂殿执事', icon: '⛪', rarity: 'B', weight: 20, unlocks: ['wuHunPalacePath'] },
          { label: '路人甲', icon: '🚶', rarity: 'C', weight: 20 },
        ]
      }
      return [
        { label: '神秘旅人', icon: '🧳', rarity: 'A', weight: 30 },
        { label: '学院同学', icon: '🎒', rarity: 'B', weight: 35 },
        { label: '落魄魂师', icon: '😔', rarity: 'A', weight: 20 },
      ]
    },
  },
  // ==================== Lv.11-20: 诺丁学院 ====================
  {
    id: 'roommate', title: '室友', icon: '🛏️', minLevel: 11, maxLevel: 20, rarity: 'B',
    prelude: '学院宿舍分配……你的室友会是谁？命运之轮，请转动——',
    computeOptions(state) {
      const metTangSan = hasMet('tangSan')(state)
      return [
        { label: '唐三（如果同代）', icon: '🌿', rarity: 'SSS', weight: metTangSan ? 30 : 5, worldImpact: { tangSan: { met: true, affinity: 15 } } },
        { label: '勤奋的平民学生', icon: '💪', rarity: 'B', weight: 25 },
        { label: '贵族子弟',       icon: '👑', rarity: 'A', weight: 20 },
        { label: '不学无术的混子', icon: '😴', rarity: 'C', weight: 25 },
        { label: '独自一间',       icon: '🏠', rarity: 'B', weight: 15 },
      ]
    },
  },
  {
    id: 'rival', title: '劲敌', icon: '🥊', minLevel: 12, maxLevel: 20, rarity: 'A',
    prelude: '学院中出现了你的对手……命运之轮，请转动——',
    computeOptions(state) {
      return [
        { label: '天才少年·宿命对决', icon: '⚡', rarity: 'SS', weight: 8 },
        { label: '贵族天才·不服就干', icon: '⚔️', rarity: 'A', weight: 22 },
        { label: '平民强者·惺惺相惜', icon: '🤝', rarity: 'S', weight: 15 },
        { label: '小人暗算', icon: '🐍', rarity: 'C', weight: 30 },
        { label: '没有对手·独孤求败', icon: '😎', rarity: 'A', weight: 25 },
      ]
    },
  },
  {
    id: 'secretTraining', title: '秘密修行', icon: '🔒', minLevel: 13, maxLevel: 22, rarity: 'S',
    prelude: '你发现了一个秘密修炼方法……命运之轮，请转动——',
    computeOptions(state) {
      return [
        { label: '远古冥想术', icon: '🧘', rarity: 'SSS', weight: 2, levelBoost: 3 },
        { label: '极限训练法', icon: '🏋️', rarity: 'A', weight: 25, levelBoost: 1 },
        { label: '药物辅助',   icon: '🧪', rarity: 'B', weight: 30 },
        { label: '偷师他人',   icon: '👀', rarity: 'S', weight: 10, levelBoost: 2 },
        { label: '按部就班',   icon: '📋', rarity: 'C', weight: 33 },
      ]
    },
  },
  {
    id: 'tournament', title: '学院比武', icon: '🏆', minLevel: 15, maxLevel: 22, rarity: 'A',
    prelude: '诺丁学院年度比武大会开始了！命运之轮，请转动——',
    computeOptions(state) {
      return [
        { label: '冠军！一战成名', icon: '🥇', rarity: 'SSS', weight: 5, levelBoost: 3 },
        { label: '亚军，虽败犹荣', icon: '🥈', rarity: 'SS',  weight: 12, levelBoost: 2 },
        { label: '四强，实力不俗', icon: '🏅', rarity: 'S',   weight: 20, levelBoost: 1 },
        { label: '八强',           icon: '📛', rarity: 'A',   weight: 28 },
        { label: '首轮淘汰',       icon: '😞', rarity: 'C',   weight: 25 },
        { label: '因伤退赛',       icon: '🤕', rarity: 'C',   weight: 10 },
      ]
    },
  },
  {
    id: 'graduation', title: '毕业去向', icon: '🎓', minLevel: 18, maxLevel: 25, rarity: 'S', exclusiveGroup: 'factionChoice',
    prelude: '诺丁学院的学业即将结束。三条道路摆在面前——每一条都将彻底改变你的命运。命运之轮，请转动——',
    computeOptions(state) {
      const metTangSan = hasMet('tangSan')(state)
      return [
        { label: '史莱克学院·怪物之路',   icon: '🏫', rarity: 'SSS', weight: metTangSan ? 30 : 15, levelBoost: 3, unlocks: ['shrekPath'] },
        { label: '武魂殿学院·权力之路',   icon: '⛪', rarity: 'SS', weight: 18, levelBoost: 3, unlocks: ['wuHunAcademyPath'] },
        { label: '独自游历·自由之路',     icon: '🗺️', rarity: 'S', weight: 25, levelBoost: 2, unlocks: ['wandererPath'] },
        { label: '天斗皇家学院·贵族之路', icon: '👑', rarity: 'A', weight: 22, levelBoost: 2 },
        { label: '留校任教·传承之路',     icon: '📖', rarity: 'A', weight: 10, levelBoost: 1 },
        { label: '回家种地·平凡之路',     icon: '🌾', rarity: 'C', weight: 10 },
      ]
    },
  },

  // ==================== Lv.21-30: 星斗大森林 ====================
  {
    id: 'enterForest', title: '踏入森林', icon: '🌲', minLevel: 21, maxLevel: 32, rarity: 'A',
    prelude: '星斗大森林——斗罗大陆最危险的魂兽聚集地。你深吸一口气，踏入了这片古老的森林……命运之轮，请转动——',
    computeOptions(state) {
      return [
        { label: '偶遇万年魂兽·惊险逃脱', icon: '🐉', rarity: 'SS', weight: 8, levelBoost: 2 },
        { label: '发现仙草·天材地宝', icon: '🌿', rarity: 'SSS', weight: 3, levelBoost: 3 },
        { label: '遇到受伤的魂师', icon: '🩹', rarity: 'A', weight: 22 },
        { label: '平安无事·顺利深入', icon: '🚶', rarity: 'B', weight: 35 },
        { label: '迷路了', icon: '🧭', rarity: 'C', weight: 20 },
        { label: '遭遇魂兽群·狼狈逃离', icon: '🏃', rarity: 'C', weight: 12 },
      ]
    },
  },
  {
    id: 'xiaoWuEncounter', title: '林中少女', icon: '🐰', minLevel: 23, maxLevel: 35, rarity: 'SS',
    requiredEvents: ['enterForest'],
    prelude: '密林深处，你看到一个粉色长裙的少女正在与魂兽对峙……命运之轮，请转动——',
    computeOptions(state) {
      const metBefore = hasMet('xiaoWu')(state)
      if (metBefore) {
        return [
          { label: '再次并肩作战·羁绊加深', icon: '🤝', rarity: 'SSS', weight: 30, worldImpact: { xiaoWu: { affinity: 25, faction: 'friend' } } },
          { label: '默默守护她', icon: '🛡️', rarity: 'S', weight: 25, worldImpact: { xiaoWu: { affinity: 10 } } },
          { label: '产生了误会', icon: '😤', rarity: 'B', weight: 25, worldImpact: { xiaoWu: { affinity: -15 } } },
        ]
      }
      return [
        { label: '出手相助·初次见面', icon: '🤝', rarity: 'SSS', weight: 25, worldImpact: { xiaoWu: { met: true, affinity: 20, faction: 'friend' } }, unlocks: ['xiaoWuPath'] },
        { label: '袖手旁观', icon: '👀', rarity: 'C', weight: 20 },
        { label: '叫来其他人帮忙', icon: '📢', rarity: 'B', weight: 25 },
        { label: '暗中观察', icon: '🕵️', rarity: 'A', weight: 30 },
      ]
    },
  },
  // ⚡ 小舞献祭 — 仅当已遇到小舞
  {
    id: 'xiaoWuSacrifice', title: '⚡ 命运交织：献祭', icon: '🔥', minLevel: 25, maxLevel: 38, rarity: 'SSS',
    requiredEvents: ['xiaoWuEncounter'],
    prelude: '突然！武魂殿的封号斗罗出现了——他们的目标是那个粉裙少女！她的真实身份是十万年魂兽化形！你……命运之轮，请转动——',
    resultTemplate: '{label}\n\n{suffix}',
    suffixes: {
      SSS: '你燃烧了自己的魂骨，以命换命！少女哭泣着抱住了倒下的你……但命运之线被改写了！',
      SS: '你挡在了她面前！虽然受了重伤，但她活了下来。这份恩情，永生难忘——',
      S: '你制造了混乱，帮助她逃离。武魂殿对你产生了敌意，但你救了一个生命。',
      A: '你选择了明哲保身，暗中联系了援军……但为时已晚。',
      B: '你没有出手。命运的齿轮沿着原来的轨迹转动……',
      C: '你站在了武魂殿一边！这是你一生中最大的污点——',
    },
    computeOptions(state) {
      const isFriend = isAlliedWith('xiaoWu')(state)
      return [
        { label: '以命换命·献祭自己', icon: '💔', rarity: 'SSS', weight: isFriend ? 8 : 1, levelBoost: 8,
          worldImpact: { xiaoWu: { alive: true, sacrificed: false, affinity: 100, faction: 'friend' }, biBiDong: { affinity: -30 } } },
        { label: '出手相助·共同抗敌', icon: '⚔️', rarity: 'SS', weight: isFriend ? 20 : 5, levelBoost: 5,
          worldImpact: { xiaoWu: { alive: true, sacrificed: false, affinity: 50 }, biBiDong: { affinity: -20 } } },
        { label: '制造混乱·帮助逃跑', icon: '💨', rarity: 'S', weight: 25, levelBoost: 3,
          worldImpact: { xiaoWu: { alive: true, sacrificed: false, affinity: 30 } } },
        { label: '袖手旁观·无力回天', icon: '😔', rarity: 'A', weight: 30,
          worldImpact: { xiaoWu: { alive: false, sacrificed: true }, tangSan: { affinity: -30 } } },
        { label: '帮助武魂殿', icon: '👿', rarity: 'C', weight: 10,
          worldImpact: { xiaoWu: { alive: false, sacrificed: true }, tangSan: { affinity: -100, faction: 'enemy' }, biBiDong: { affinity: 30 } } },
      ]
    },
  },
  // ⚡ 冰火两仪眼 — 特定等级+种族条件
  {
    id: 'iceFireWell', title: '⚡ 冰火两仪眼', icon: '🌡️', minLevel: 28, maxLevel: 60, rarity: 'SSS',
    requiredEvents: ['enterForest'],
    prelude: '在森林最深处，你发现了传说中的冰火两仪眼！"小辈，你可知这里是什么地方？"——毒斗罗独孤博！命运之轮，请转动——',
    resultTemplate: '{label}！{suffix}',
    suffixes: {
      SSS: '独孤博收你为记名弟子！奇茸通天菊和八瓣仙兰的馈赠！等级飙升！',
      SS: '独孤博允许你在冰火两仪眼修炼一日！魂力大增——',
      S: '你凭借武魂的特殊性，成功抵御了毒雾，获得了一株珍贵仙草！',
      A: '你在独孤博的默许下采集了一些仙草。虽然不多，但已是天大的机缘。',
      B: '独孤博没有为难你，但也未给予帮助。你只能在外围采集了些许药草。',
      C: '毒雾弥漫，你不得不远远避开。',
    },
    computeOptions(state) {
      const isPoisonRelated = state.attributes?.soulType?.includes('毒') || state.attributes?.race === '邪魂师血脉'
      const highInnate = (state.attributes?.innatePower || 0) >= 8
      return [
        { label: '独孤博收为记名弟子·仙草馈赠', icon: '🧪', rarity: 'SSS', weight: isPoisonRelated ? 8 : (highInnate ? 4 : 1), levelBoost: 8,
          worldImpact: { duGuBo: { met: true, affinity: 30 } } },
        { label: '获准修炼一日·魂力大增', icon: '💪', rarity: 'SS', weight: 10, levelBoost: 5 },
        { label: '抵御毒雾·夺得仙草', icon: '🌿', rarity: 'S', weight: isPoisonRelated ? 25 : 15, levelBoost: 3 },
        { label: '默许采集·小有收获', icon: '🌱', rarity: 'A', weight: 28, levelBoost: 1 },
        { label: '外围采药·聊胜于无', icon: '🍃', rarity: 'B', weight: 26 },
        { label: '毒雾太浓·远远观望', icon: '☠️', rarity: 'C', weight: 10 },
      ]
    },
  },

  // ==================== Lv.31-50: 史莱克+精英赛 ====================
  {
    id: 'shrekEntrance', title: '史莱克入学', icon: '📝', minLevel: 31, maxLevel: 42, rarity: 'A',
    prelude: '史莱克学院——只收怪物，不收普通人。你能通过那残酷的入学考试吗？命运之轮，请转动——',
    computeOptions(state) {
      return [
        { label: '完美通过·被院长看中', icon: '🌟', rarity: 'SSS', weight: 5, levelBoost: 3 },
        { label: '顺利通过', icon: '✅', rarity: 'A', weight: 30 },
        { label: '勉强通过', icon: '😰', rarity: 'B', weight: 30 },
        { label: '被破格录取', icon: '🎫', rarity: 'S', weight: 10, levelBoost: 1 },
        { label: '失败·被拒之门外', icon: '🚫', rarity: 'C', weight: 5 },
      ]
    },
  },
  {
    id: 'shrekEighth', title: '⚡ 第八怪？', icon: '👥', minLevel: 33, maxLevel: 55, rarity: 'SSS',
    requiredEvents: ['shrekEntrance'],
    prelude: '史莱克七怪正在选拔新成员。你会成为第八怪吗？命运之轮，请转动——',
    computeOptions(state) {
      const onShrekPath = state.unlockedEvents?.includes?.('shrekPath') || state.eventHistory?.includes?.('graduation')
      return [
        { label: '成为史莱克第八怪！', icon: '🌟', rarity: 'SSS', weight: 10, levelBoost: 5,
          worldImpact: { tangSan: { affinity: 20, met: true }, daiMuBai: { met: true }, oscar: { met: true } }, unlocks: ['shrekPath'] },
        { label: '备选成员·还需努力', icon: '🔄', rarity: 'A', weight: 25 },
        { label: '因故错过选拔', icon: '😔', rarity: 'B', weight: 30 },
        { label: '主动放弃·独自修炼', icon: '🚶', rarity: 'A', weight: 20 },
      ]
    },
  },
  // ⚡ 杀戮之都
  {
    id: 'slaughterCity', title: '⚡ 杀戮之都', icon: '🏚️', minLevel: 40, maxLevel: 55, rarity: 'SSS',
    requiredEvents: ['enterForest'],
    prelude: '"年轻人，你渴望力量吗？杀戮之都……十个进去，九个出不来。"命运之轮，请转动——',
    resultTemplate: '{label}！{suffix}',
    suffixes: {
      SSS: '你在地狱路中觉醒了杀神领域！这是百万中无一的成就！',
      SS: '你走过了地狱路！虽然没有觉醒领域，但你的实力已经脱胎换骨！',
      S: '你在杀戮之都中存活了下来！',
      A: '坚持许久·活着出来就是胜利。',
      B: '太过危险，选择了在外围历练。',
      C: '你听到了很多关于杀戮之都的传说。也许有一天，你会做好准备。',
    },
    computeOptions(state) {
      const isTough = (state.attributes?.innatePower || 0) >= 7 || state.attributes?.soulQualityRarity === 'SSS'
      return [
        { label: '走过地狱路·觉醒杀神领域！！', icon: '⚔️', rarity: 'SSS', weight: isTough ? 6 : 2, levelBoost: 10,
          worldImpact: { slaughterCity: { survived: true, domain: 'killingGod' } } },
        { label: '走过地狱路·实力脱胎换骨', icon: '💀', rarity: 'SS', weight: 10, levelBoost: 6 },
        { label: '在杀戮之都存活', icon: '🩸', rarity: 'S', weight: 22, levelBoost: 4 },
        { label: '坚持许久·活着出来', icon: '🚪', rarity: 'A', weight: 28, levelBoost: 2 },
        { label: '太过危险·外围历练', icon: '⚠️', rarity: 'B', weight: 22 },
        { label: '未被允许进入', icon: '🚫', rarity: 'C', weight: 16 },
      ]
    },
  },

  // ==================== Lv.51-70: 大陆风云+海神岛 ====================
  {
    id: 'huntStarted', title: '⚡ 猎魂行动', icon: '⚠️', minLevel: 42, maxLevel: 80, rarity: 'SSS', exclusiveGroup: 'warStance', enemyPower: 6000,
    prelude: '武魂殿发动了猎魂行动！整个大陆陷入动荡……你的立场是？命运之轮，请转动——',
    computeOptions(state) {
      const against = state.relationships?.biBiDong?.faction === 'hostile'
      const tangFriend = isAlliedWith('tangSan')(state)
      const base = [
        { label: '挺身而出·对抗武魂殿', icon: '🛡️', rarity: 'SSS', weight: against ? 30 : (tangFriend ? 15 : 6), levelBoost: 5,
          worldImpact: { biBiDong: { affinity: -50, faction: 'enemy' }, tangSan: { affinity: 30 } } },
        { label: '暗中帮助受害者', icon: '🕵️', rarity: 'S', weight: 20, levelBoost: 3,
          worldImpact: { biBiDong: { affinity: -15 } } },
        { label: '保持中立·明哲保身', icon: '⚖️', rarity: 'A', weight: 28 },
        { label: '加入武魂殿阵营', icon: '⛪', rarity: 'B', weight: 20, levelBoost: 2,
          worldImpact: { biBiDong: { affinity: 30, faction: 'friend' }, tangSan: { affinity: -40 } } },
      ]
      return adjustCombatWeights(base, state.combatPower || state.level * 10, 6000)
    },
  },
  // ⚡ 唐门暗器 — 需要唐三友谊
  {
    id: 'tangSectWeapons', title: '⚡ 唐门暗器', icon: '🏹', minLevel: 52, maxLevel: 68, rarity: 'SSS',
    requiredEvents: ['huntStarted'],
    prelude: '唐三从怀中取出一卷泛黄的图纸："这是我唐门的暗器图谱。如果你愿意，我可以教你。"命运之轮，请转动——',
    computeOptions(state) {
      const tangFriend = isAlliedWith('tangSan')(state)
      if (!tangFriend) {
        return [{ label: '你还没有得到唐三的信任', icon: '❓', rarity: 'C', weight: 100 }]
      }
      const closeBond = (state.relationships?.tangSan?.affinity || 0) >= 20
      return [
        { label: '获得整套唐门暗器图谱！！', icon: '📜', rarity: 'SSS', weight: closeBond ? 12 : 4, levelBoost: 5,
          worldImpact: { tangSan: { affinity: 20 } } },
        { label: '学会制作诸葛神弩', icon: '🏹', rarity: 'SS', weight: closeBond ? 25 : 12, levelBoost: 3 },
        { label: '几种实用机括暗器', icon: '🔫', rarity: 'S', weight: 28, levelBoost: 2,
          worldImpact: { tangSan: { affinity: 10 } } },
        { label: '不感兴趣·但也长了见识', icon: '🤷', rarity: 'B', weight: 18 },
      ]
    },
  },
  // 海神相关事件
  {
    id: 'seaVoyage', title: '渡海征途', icon: '⛵', minLevel: 55, maxLevel: 72, rarity: 'SS',
    prelude: '茫茫大海之上，传说中的海神岛就在前方。命运之轮，请转动——',
    computeOptions(state) {
      const seaBlood = state.attributes?.race === '海魂师后裔'
      return [
        { label: '乘风破浪·领悟海洋', icon: '🌊', rarity: 'SSS', weight: seaBlood ? 8 : 2, levelBoost: 5 },
        { label: '激战深海魔鲸', icon: '🐋', rarity: 'SS', weight: 8, levelBoost: 3,
          soulRing: { year: 100000, colorName: '十万年', colorHex: '#FF1744', beast: '深海魔鲸', skill: '深海之怒' } },
        { label: '遭遇风暴·勉强抵达', icon: '🌪️', rarity: 'A', weight: 30 },
        { label: '九死一生·漂流数日', icon: '🛟', rarity: 'B', weight: 25 },
        { label: '迷失大海·最终靠岸', icon: '🧭', rarity: 'C', weight: 20 },
      ]
    },
  },
  {
    id: 'seaGodTrial', title: '⚡ 海神九考', icon: '🔱', minLevel: 58, maxLevel: 78, rarity: 'SSS',
    requiredEvents: ['seaVoyage'],
    requiredEvents: ['seaVoyage'],
    prelude: '海神雕像前，苍老的声音响起："欲承海神之位，须过九考。"命运之轮，请转动——',
    computeOptions(state) {
      const highInnate = (state.attributes?.innatePower || 0) >= 8
      return [
        { label: '海神九考·完美契合', icon: '🔱', rarity: 'SSS', weight: highInnate ? 12 : 4, levelBoost: 10,
          worldImpact: { seaGodInherited: true } },
        { label: '海神七考·极高潜力', icon: '⭐', rarity: 'SS', weight: 18, levelBoost: 6 },
        { label: '海神五考·优秀资质', icon: '📋', rarity: 'S', weight: 28, levelBoost: 4 },
        { label: '黑级考核·仍需努力', icon: '⚫', rarity: 'B', weight: 20 },
        { label: '未获考核资格', icon: '🚫', rarity: 'C', weight: 10 },
      ]
    },
  },

  // ==================== Lv.71-90: 武魂帝国+封号 ====================
  {
    id: 'grandBattle', title: '⚡ 嘉陵关大战', icon: '⚔️', minLevel: 71, maxLevel: 82, rarity: 'SS',
    enemyPower: 18000,
    prelude: '武魂帝国大军压境至嘉陵关！敌方大将的实力深不可测——你暗中评估着双方的实力差距……命运之轮，请转动——',
    computeOptions(state) {
      const isHero = state.relationships?.biBiDong?.faction === 'enemy'
      const base = [
        { label: '斩将！大获全胜', icon: '🗡️', rarity: 'SSS', weight: isHero ? 8 : 3, levelBoost: 6 },
        { label: '战术奇袭·以少胜多', icon: '🧠', rarity: 'SS', weight: 18, levelBoost: 4 },
        { label: '惨烈守关·守住阵地', icon: '🩸', rarity: 'S', weight: 25, levelBoost: 2 },
        { label: '战败·撤退', icon: '🏃', rarity: 'B', weight: 20 },
        { label: '惨败·但集结残兵', icon: '🪖', rarity: 'C', weight: 14 },
        { label: '被俘入狱', icon: '🔗', rarity: 'C', weight: 10 },
        { label: '奇迹逆转·绝境反杀', icon: '⚡', rarity: 'SSS', weight: 2, levelBoost: 10 },
      ]
      return adjustCombatWeights(base, state.combatPower || state.level * 10, 2500)
    },
  },
  {
    id: 'fourClans', title: '⚡ 四大宗族', icon: '🏴', minLevel: 73, maxLevel: 87, rarity: 'SSS',
    prelude: '四大宗族——力/御/敏/破——正在庚辛城选择站队。命运之轮，请转动——',
    computeOptions(state) {
      const isHero = state.relationships?.biBiDong?.faction === 'enemy'
      return [
        { label: '拉拢全部四大宗族！！', icon: '🏴', rarity: 'SSS', weight: isHero ? 12 : 4, levelBoost: 8,
          worldImpact: { fourClans: { allied: true } } },
        { label: '拉拢力之一族与敏之一族', icon: '💪', rarity: 'SS', weight: isHero ? 20 : 10, levelBoost: 5 },
        { label: '杨无敌的破之一族加盟', icon: '🗡️', rarity: 'S', weight: 22, levelBoost: 3 },
        { label: '友好关系·部分合作', icon: '🤝', rarity: 'A', weight: 28 },
        { label: '谈判未成·留下好印象', icon: '📋', rarity: 'B', weight: 18 },
      ]
    },
  },
  {
    id: 'titleDouluo', title: '封号加冕', icon: '👑', minLevel: 85, maxLevel: 95, rarity: 'SSS',
    requiredEvents: ['douluoTower'],
    prelude: '九环齐鸣！你终于踏入了封号斗罗的行列！命运之轮，请转动——',
    computeOptions(state) {
      return [
        { label: '龙皇斗罗', icon: '🐉', rarity: 'SSS', weight: 5 },
        { label: '烈焰斗罗', icon: '🔥', rarity: 'SS', weight: 12 },
        { label: '苍穹斗罗', icon: '☁️', rarity: 'SS', weight: 12 },
        { label: '寒冰斗罗', icon: '❄️', rarity: 'S', weight: 15 },
        { label: '不朽斗罗', icon: '💎', rarity: 'S', weight: 15 },
        { label: '疾风斗罗', icon: '💨', rarity: 'A', weight: 22 },
        { label: '铁壁斗罗', icon: '🛡️', rarity: 'B', weight: 12 },
        { label: '无名斗罗', icon: '❓', rarity: 'C', weight: 4 },
      ]
    },
  },

  // ==================== Lv.91-100: 神位之争 ====================
  {
    id: 'godTrial', title: '⚡ 神位考验', icon: '🔱', minLevel: 85, maxLevel: 100, rarity: 'SSS',
    prelude: '神界的大门已经为你打开。命运之轮，请转动——',
    computeOptions(state) {
      return [
        { label: '自创神位·独一无二', icon: '💫', rarity: 'SSS', weight: 6, levelBoost: 10 },
        { label: '海神九考·完美通过', icon: '🌊', rarity: 'SSS', weight: 8, levelBoost: 8 },
        { label: '修罗神考验·通过',   icon: '⚔️', rarity: 'SSS', weight: 8, levelBoost: 8 },
        { label: '天使神·九考通过',   icon: '👼', rarity: 'SS',  weight: 15, levelBoost: 5 },
        { label: '一级神祇认可',       icon: '⭐', rarity: 'S',   weight: 30, levelBoost: 3 },
        { label: '未通过·继续努力',   icon: '🔄', rarity: 'C',   weight: 13 },
      ]
    },
  },
  // ==================== 原著深度事件 Lv.21-40 ====================
  {
    id: 'canon_tangSanGift', title: '📖 二十四桥明月夜', icon: '🎁', minLevel: 25, maxLevel: 40, rarity: 'SS',
    requiredEvents: ['firstEncounter'],
    prelude: '唐三从怀中取出一条精致的腰带——二十四桥明月夜。"这是我自己做的储物魂导器。有二十四个独立空间。送给你。"命运之轮，请转动——',
    computeOptions(state) {
      const tangFriend = isAlliedWith('tangSan')(state)
      if (!tangFriend && !hasMet('tangSan')(state)) return [{ label: '你与唐三尚未相熟', icon: '❓', rarity: 'C', weight: 100 }]
      return [
        { label: '欣然接受·友谊加深', icon: '🤝', rarity: 'SSS', weight: tangFriend ? 25 : 10, levelBoost: 3, worldImpact: { tangSan: { affinity: 20 } } },
        { label: '婉拒·但唐三坚持相赠', icon: '🎀', rarity: 'S', weight: 25, levelBoost: 2, worldImpact: { tangSan: { affinity: 10 } } },
        { label: '回赠自己制作的物品', icon: '🔄', rarity: 'SS', weight: 20, levelBoost: 3, worldImpact: { tangSan: { affinity: 25 } } },
        { label: '收下但不以为意', icon: '😐', rarity: 'B', weight: 20, levelBoost: 1 },
        { label: '怀疑有诈·拒绝', icon: '🤨', rarity: 'C', weight: 10 },
      ]
    },
  },
  {
    id: 'canon_xiaoWuSanctuary', title: '📖 柔骨兔圣地', icon: '🐰', minLevel: 28, maxLevel: 42, rarity: 'SS',
    requiredEvents: ['xiaoWuEncounter'],
    prelude: '小舞悄悄地带你来到了星斗大森林深处——柔骨兔一族的圣地。这里埋葬着她的族人，也隐藏着一个关于十万年魂兽化形的秘密。命运之轮，请转动——',
    computeOptions(state) {
      const xiaoFriend = isAlliedWith('xiaoWu')(state)
      if (!xiaoFriend) return [{ label: '你还未得到小舞的信任', icon: '❓', rarity: 'C', weight: 100 }]
      return [
        { label: '倾听秘密·许下守护之誓', icon: '🤞', rarity: 'SSS', weight: 20, levelBoost: 5, worldImpact: { xiaoWu: { affinity: 40, faction: 'friend' } } },
        { label: '尊重她的秘密·不追问',   icon: '🤫', rarity: 'SS', weight: 25, levelBoost: 3, worldImpact: { xiaoWu: { affinity: 20 } } },
        { label: '获得柔骨兔一族的祝福',  icon: '🙏', rarity: 'S', weight: 28, levelBoost: 4 },
        { label: '圣地突然被魂兽攻击',    icon: '⚠️', rarity: 'A', weight: 17, levelBoost: 2 },
        { label: '无法进入·被结界阻挡',  icon: '🚧', rarity: 'B', weight: 10 },
      ]
    },
  },
  {
    id: 'canon_masterTheory', title: '📖 大师的魂环理论', icon: '📖', minLevel: 22, maxLevel: 38, rarity: 'S',
    requiredEvents: ['firstEncounter'],
    prelude: '玉小刚——大师——找到了你。他的眼中闪烁着智慧的光芒："我研究出了一套魂环配置的最优理论。如果你愿意，可以成为第一个实践者。"命运之轮，请转动——',
    computeOptions(state) {
      return [
        { label: '接受指导·成为大师的弟子', icon: '🎓', rarity: 'SSS', weight: 15, levelBoost: 4, worldImpact: { yuXiaoGang: { met: true, affinity: 30 } } },
        { label: '参考理论·独立实践',       icon: '📝', rarity: 'SS', weight: 25, levelBoost: 3 },
        { label: '质疑理论·提出自己的见解', icon: '💬', rarity: 'S', weight: 22, levelBoost: 3, worldImpact: { yuXiaoGang: { met: true, affinity: 15 } } },
        { label: '婉拒·自己摸索',           icon: '🙅', rarity: 'B', weight: 25, levelBoost: 1 },
        { label: '理论太难·听不懂',         icon: '😵', rarity: 'C', weight: 13 },
      ]
    },
  },

  // ==================== 原著深度事件 Lv.41-60 ====================
  {
    id: 'canon_daiMuBai', title: '📖 星罗边境', icon: '🦁', minLevel: 42, maxLevel: 58, rarity: 'SS',
    prelude: '戴沐白邀请你前往星罗帝国边境执行一项秘密任务。他的皇兄戴维斯似乎在暗中勾结武魂殿——一场皇位之争即将爆发。命运之轮，请转动——',
    computeOptions(state) {
      return [
        { label: '并肩作战·揭露阴谋',   icon: '🤝', rarity: 'SSS', weight: 12, levelBoost: 5, worldImpact: { daiMuBai: { met: true, affinity: 30, faction: 'friend' } } },
        { label: '暗中调查·智取证据',   icon: '🕵️', rarity: 'SS', weight: 22, levelBoost: 4 },
        { label: '通知武魂殿·换取赏金', icon: '💰', rarity: 'C', weight: 15, worldImpact: { daiMuBai: { affinity: -40 }, biBiDong: { affinity: 10 } } },
        { label: '发现戴维斯的秘密部队', icon: '👀', rarity: 'S', weight: 28, levelBoost: 3 },
        { label: '被卷入战斗·被迫参战', icon: '⚔️', rarity: 'A', weight: 23, levelBoost: 2 },
      ]
    },
  },
  {
    id: 'canon_duguBoPill', title: '📖 独孤博的本命毒丹', icon: '☠️', minLevel: 38, maxLevel: 55, rarity: 'SSS',
    requiredEvents: ['iceFireWell'],
    prelude: '独孤博神色凝重地找到你："小子，老夫的本命毒丹出现了裂痕。若不修复，三个月内老夫必死。而你——是唯一能进入冰火两仪眼帮我取药的人。"命运之轮，请转动——',
    computeOptions(state) {
      return [
        { label: '冒死取药·独孤博欠你一命！！', icon: '💊', rarity: 'SSS', weight: 15, levelBoost: 8, worldImpact: { duGuBo: { affinity: 80, faction: 'friend' } } },
        { label: '成功取药·但自己也中了毒',     icon: '🤢', rarity: 'SS', weight: 20, levelBoost: 5, worldImpact: { duGuBo: { affinity: 40 } } },
        { label: '请唐三帮忙一起取药',           icon: '🤝', rarity: 'S', weight: 25, levelBoost: 4 },
        { label: '取药失败·毒丹彻底碎裂',       icon: '💔', rarity: 'A', weight: 20, levelBoost: 2 },
        { label: '拒绝·不想冒险',               icon: '🙅', rarity: 'B', weight: 20 },
      ]
    },
  },
  {
    id: 'canon_huLiena', title: '📖 杀戮之都·胡列娜', icon: '🦊', minLevel: 43, maxLevel: 58, rarity: 'SS',
    requiredEvents: ['slaughterCity'],
    prelude: '在杀戮之都中，你遇到了武魂殿圣女——胡列娜。她也在进行地狱路的试炼。在这疯狂的地方，敌人和同伴的界限变得模糊……命运之轮，请转动——',
    computeOptions(state) {
      return [
        { label: '携手闯关·获得她的信任', icon: '🤝', rarity: 'SSS', weight: 12, levelBoost: 5, worldImpact: { huLiena: { met: true, affinity: 30 } } },
        { label: '利用她探路·保存自己',   icon: '🕶️', rarity: 'A', weight: 22, levelBoost: 3, worldImpact: { huLiena: { met: true, affinity: -10 } } },
        { label: '各走各路·互不干涉',     icon: '↔️', rarity: 'B', weight: 30, levelBoost: 2 },
        { label: '发现她的弱点·但没利用', icon: '👀', rarity: 'S', weight: 18, levelBoost: 4, worldImpact: { huLiena: { met: true, affinity: 10 } } },
        { label: '陷害她·自己先过关',    icon: '🐍', rarity: 'C', weight: 18, levelBoost: 2, worldImpact: { huLiena: { met: true, affinity: -40 } } },
      ]
    },
  },
  {
    id: 'canon_ningRongRong', title: '📖 九宝琉璃塔共鸣', icon: '💎', minLevel: 44, maxLevel: 60, rarity: 'SS',
    prelude: '宁荣荣的九宝琉璃塔突然与你的武魂产生了共鸣！两股力量在空气中交织，形成了一个前所未有的魂力漩涡。七宝琉璃宗的护法们都被惊动了——命运之轮，请转动——',
    computeOptions(state) {
      return [
        { label: '完成共鸣·武魂获得增幅！！', icon: '✨', rarity: 'SSS', weight: 10, levelBoost: 6, worldImpact: { ningRongRong: { met: true, affinity: 25 } } },
        { label: '稳定共鸣·双方受益',         icon: '⚖️', rarity: 'SS', weight: 25, levelBoost: 4, worldImpact: { ningRongRong: { met: true, affinity: 15 } } },
        { label: '被护法打断·但留下联系',     icon: '🛑', rarity: 'A', weight: 30, levelBoost: 2 },
        { label: '共鸣失败·但学到了东西',     icon: '📖', rarity: 'B', weight: 20, levelBoost: 2 },
        { label: '共鸣引发爆炸·双方受伤',     icon: '💥', rarity: 'C', weight: 15 },
      ]
    },
  },
];
