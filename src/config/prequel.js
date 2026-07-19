// 序章：命运之始 — 10步角色创建
import { RARITY_COLORS } from './colors'
import { weightedRandomIndex } from '../utils/weightedRandom'

export function getPrequelStep(index) {
  return PREQUEL_STEPS[index] || null
}

export function resolvePrequelStep(index, state) {
  const step = PREQUEL_STEPS[index]
  if (!step) return null
  const options = step.computeOptions(state)
  const weights = options.map(opt => opt.weight || 40)
  const targetIndex = weightedRandomIndex(weights)
  return { step, options, weights, targetIndex, result: options[targetIndex] }
}

const PREQUEL_STEPS = [
  {
    key: 'gender', title: '性别', icon: '⚧',
    prelude: '命运之轮转动——决定你的性别……',
    computeOptions(state) {
      return [
        { label: '男', icon: '♂️', rarity: 'B', weight: 50 },
        { label: '女', icon: '♀️', rarity: 'B', weight: 50 },
      ]
    },
  },
  // ==================== 第2步：种族 ====================
  {
    key: 'race', title: '种族', icon: '🧬',
    prelude: '命运之轮转动——决定你的种族……不同的种族将赋予你不同的天赋。',
    computeOptions(state) {
      return [
        { label: '神族后裔',   icon: '👼', rarity: 'SSS', weight: 5,  extra: { racePower: 3.0 } },
        { label: '魂兽化形',   icon: '🦊', rarity: 'SSS', weight: 6,  extra: { racePower: 2.5 } },
        { label: '天使后裔',   icon: '😇', rarity: 'SS',  weight: 8,  extra: { racePower: 2.2 } },
        { label: '海神血脉',   icon: '🌊', rarity: 'SS',  weight: 8,  extra: { racePower: 2.0 } },
        { label: '海魂师',     icon: '🌊', rarity: 'SS',  weight: 10, extra: { racePower: 1.8 } },
        { label: '人类（贵族）', icon: '👑', rarity: 'S', weight: 18, extra: { racePower: 1.4 } },
        { label: '人类（平民）', icon: '🧑', rarity: 'A', weight: 30 },
        { label: '人类（兽武魂觉醒者）', icon: '🐯', rarity: 'A', weight: 12, extra: { racePower: 1.3 } },
        { label: '混血种',     icon: '🔀', rarity: 'B',   weight: 8,  extra: { racePower: 1.1 } },
        { label: '变异人族',   icon: '🧬', rarity: 'B',   weight: 5,  extra: { racePower: 1.5 } },
      ]
    },
  },
  // ==================== 第3步：武魂品质 ====================
  {
    key: 'soulQuality', title: '武魂品质', icon: '✨',
    prelude: '命运之轮转动——决定你武魂的潜质……',
    computeOptions(state) {
      const race = state.attributes?.race || ''
      const hasBoost = race === '神族后裔' || race === '远古龙族' || race === '魂兽始祖' || race === '天使后裔'
      if (hasBoost) {
        return [
          { label: '神级武魂！！', icon: '🌟', rarity: 'SSS', weight: 15, extra: { qualityPower: 2.5 } },
          { label: '传说级武魂',   icon: '💫', rarity: 'SS',  weight: 25, extra: { qualityPower: 2.0 } },
          { label: '史诗级武魂',   icon: '⚡', rarity: 'S',   weight: 30, extra: { qualityPower: 1.5 } },
          { label: '精良级武魂',   icon: '🔮', rarity: 'A',   weight: 20, extra: { qualityPower: 1.0 } },
          { label: '普通武魂',     icon: '🔧', rarity: 'B',   weight: 8,  extra: { qualityPower: 0.6 } },
          { label: '低级武魂',     icon: '🗑️', rarity: 'C',   weight: 2,  extra: { qualityPower: 0.3 } },
        ]
      }
      return [
        { label: '神级武魂！！', icon: '🌟', rarity: 'SSS', weight: 5,  extra: { qualityPower: 2.5 } },
        { label: '传说级武魂',   icon: '💫', rarity: 'SS',  weight: 12, extra: { qualityPower: 2.0 } },
        { label: '史诗级武魂',   icon: '⚡', rarity: 'S',   weight: 22, extra: { qualityPower: 1.5 } },
        { label: '精良级武魂',   icon: '🔮', rarity: 'A',   weight: 28, extra: { qualityPower: 1.0 } },
        { label: '普通武魂',     icon: '🔧', rarity: 'B',   weight: 23, extra: { qualityPower: 0.6 } },
        { label: '低级武魂',     icon: '🗑️', rarity: 'C',   weight: 10, extra: { qualityPower: 0.3 } },
      ]
    },
  },
  // ==================== 第4步：武魂类型 ====================
  {
    key: 'soulType', title: '武魂类型', icon: '⚔️',
    prelude: '命运之轮转动——你的武魂究竟是什么？',
    computeOptions(state) {
      const quality = state.attributes?.soulQuality || ''
      const race = state.attributes?.race || ''
      
      // 高稀有度武魂池
      const godTier = [
        { label: '昊天锤',       icon: '🔨', rarity: 'SSS', weight: 8,  extra: { typePower: 2.5 } },
        { label: '海神三叉戟',   icon: '🔱', rarity: 'SSS', weight: 6,  extra: { typePower: 2.4 } },
        { label: '六翼天使',     icon: '👼', rarity: 'SSS', weight: 7,  extra: { typePower: 2.3 } },
        { label: '噬魂蛛皇',     icon: '🕷️', rarity: 'SSS', weight: 5,  extra: { typePower: 2.1 } },
        { label: '七杀剑',       icon: '🗡️', rarity: 'SSS', weight: 10, extra: { typePower: 2.0 } },
        { label: '蓝银皇',       icon: '🌿', rarity: 'SSS', weight: 10, extra: { typePower: 1.9 } },
      ]
      const topTier = [
        { label: '破魂枪',       icon: '🔫', rarity: 'SS', weight: 10, extra: { typePower: 1.8 } },
        { label: '邪眸白虎',     icon: '🐯', rarity: 'SS', weight: 10, extra: { typePower: 1.7 } },
        { label: '邪火凤凰',     icon: '🔥', rarity: 'SS', weight: 8,  extra: { typePower: 1.6 } },
        { label: '幽冥灵猫',     icon: '🐱', rarity: 'SS', weight: 8,  extra: { typePower: 1.5 } },
        { label: '柔骨兔',       icon: '🐰', rarity: 'SS', weight: 10, extra: { typePower: 1.4 } },
        { label: '碧磷蛇皇',     icon: '🐍', rarity: 'SS', weight: 8,  extra: { typePower: 1.3 } },
        { label: '九宝琉璃塔',   icon: '🏯', rarity: 'SS', weight: 10, extra: { typePower: 1.3 } },
        { label: '深海魔鲸',     icon: '🐋', rarity: 'SS', weight: 6,  extra: { typePower: 1.7 } },
      ]
      const midTier = [
        { label: '蓝银草',       icon: '🌱', rarity: 'A', weight: 18, extra: { typePower: 0.6 } },
        { label: '七宝琉璃塔',   icon: '🔔', rarity: 'A', weight: 15, extra: { typePower: 0.9 } },
        { label: '鬼虎',         icon: '👻', rarity: 'A', weight: 12, extra: { typePower: 1.2 } },
        { label: '大地之王',     icon: '🦂', rarity: 'A', weight: 12, extra: { typePower: 1.2 } },
        { label: '九心海棠',     icon: '🌺', rarity: 'A', weight: 10, extra: { typePower: 1.1 } },
        { label: '香肠（食物系）', icon: '🌭', rarity: 'A', weight: 8,  extra: { typePower: 0.5 } },
        { label: '麟甲兽',       icon: '🦎', rarity: 'B', weight: 15, extra: { typePower: 0.8 } },
        { label: '凤尾鸡冠蛇',   icon: '🐔', rarity: 'B', weight: 10, extra: { typePower: 0.7 } },
      ]
      const lowTier = [
        { label: '铁剑',         icon: '🗡️', rarity: 'C', weight: 20, extra: { typePower: 0.5 } },
        { label: '镰刀',         icon: '🔪', rarity: 'C', weight: 20, extra: { typePower: 0.2 } },
        { label: '木棍',         icon: '🪵', rarity: 'C', weight: 20, extra: { typePower: 0.2 } },
        { label: '幽冥狼',       icon: '🐺', rarity: 'C', weight: 15, extra: { typePower: 0.5 } },
        { label: '粉红娘娘',     icon: '🌸', rarity: 'C', weight: 15, extra: { typePower: 0.7 } },
        { label: '竹叶青',       icon: '🐍', rarity: 'C', weight: 10, extra: { typePower: 0.3 } },
      ]

      const isHighQuality = quality === '神级武魂！！' || quality === '传说级武魂'
      const isMidQuality = quality === '史诗级武魂' || quality === '精良级武魂'
      
      if (isHighQuality) {
        return [...godTier, ...topTier, ...midTier]
      }
      if (isMidQuality) {
        // 史诗/精良有小概率出神级
        return [
          ...topTier.map(o => ({ ...o, weight: Math.floor(o.weight * 1.5) })),
          ...midTier,
          ...lowTier,
        ]
      }
      // 普通/低级
      return [
        ...midTier.map(o => ({ ...o, weight: Math.floor(o.weight * 0.5) })),
        ...lowTier,
      ]
    },
  },
  // ==================== 第5步：先天魂力 ====================
  {
    key: 'innatePower', title: '先天魂力', icon: '🔥',
    prelude: '命运之轮转动——你天生的魂力是多少级？这将决定你的起点。',
    computeOptions(state) {
      const quality = state.attributes?.soulQuality || ''
      const isHighQuality = quality === '神级武魂！！' || quality === '传说级武魂'
      if (isHighQuality) {
        return [
          { label: '先天满魂力·10 级！！', icon: '💯', rarity: 'SSS', weight: 15, levelBoost: 5, extra: { innatePower: 10 } },
          { label: '9 级·惊才绝艳',        icon: '🔥', rarity: 'SS',  weight: 25, levelBoost: 3, extra: { innatePower: 9 } },
          { label: '8 级·天资卓越',        icon: '⚡', rarity: 'S',   weight: 30, levelBoost: 2, extra: { innatePower: 8 } },
          { label: '7 级·出类拔萃',        icon: '✨', rarity: 'A',   weight: 20, levelBoost: 1, extra: { innatePower: 7 } },
          { label: '5-6 级·中上之资',      icon: '📊', rarity: 'B',   weight: 8,  extra: { innatePower: 6 } },
          { label: '3-4 级·普通资质',      icon: '📉', rarity: 'C',   weight: 2,  extra: { innatePower: 4 } },
        ]
      }
      return [
        { label: '先天满魂力·10 级！！', icon: '💯', rarity: 'SSS', weight: 3,  levelBoost: 5, extra: { innatePower: 10 } },
        { label: '9 级·惊才绝艳',        icon: '🔥', rarity: 'SS',  weight: 8,  levelBoost: 3, extra: { innatePower: 9 } },
        { label: '8 级·天资卓越',        icon: '⚡', rarity: 'S',   weight: 15, levelBoost: 2, extra: { innatePower: 8 } },
        { label: '7 级·出类拔萃',        icon: '✨', rarity: 'A',   weight: 22, levelBoost: 1, extra: { innatePower: 7 } },
        { label: '5-6 级·中上之资',      icon: '📊', rarity: 'B',   weight: 30, extra: { innatePower: 6 } },
        { label: '3-4 级·普通资质',      icon: '📉', rarity: 'C',   weight: 22, extra: { innatePower: 4 } },
      ]
    },
    suffixes: {
      SSS: '天选之子的诞生！！',
      SS: '绝世天才的觉醒！',
      S: '天才之名当之无愧！',
      A: '优秀的起点，未来可期！',
      B: '中人之资，勤能补拙！',
      C: '平凡的开始，不凡的未来！',
    },
  },
  // ==================== 第6步：出生地 ====================
  {
    key: 'birthplace', title: '出生地', icon: '🏠',
    prelude: '命运之轮转动——你在哪里出生？出生地影响初期的机缘与人脉。',
    computeOptions(state) {
      return [
        { label: '武魂城',       icon: '⛪', rarity: 'SSS', weight: 8,  extra: { placeBoost: 3 } },
        { label: '海神岛',       icon: '🏝️', rarity: 'SS',  weight: 10, extra: { placeBoost: 2 } },
        { label: '天斗帝国·皇城', icon: '🏰', rarity: 'S',   weight: 15, extra: { placeBoost: 1 } },
        { label: '七大宗门领地', icon: '🏯', rarity: 'S',   weight: 15, extra: { placeBoost: 1 } },
        { label: '魂师学院城',   icon: '🏫', rarity: 'A',   weight: 22 },
        { label: '小村庄',       icon: '🏡', rarity: 'B',   weight: 20 },
        { label: '贫民窟',       icon: '🏚️', rarity: 'C',   weight: 10 },
      ]
    },
  },
  // ==================== 第7步：家族背景 ====================
  {
    key: 'family', title: '家族背景', icon: '🏛️',
    prelude: '命运之轮转动——你的家族背景如何？它决定了你的初始资源与人脉。',
    computeOptions(state) {
      const birthplace = state.attributes?.birthplace || ''
      const hasBoost = birthplace === '武魂城' || birthplace === '天斗帝国·皇城' || birthplace === '神之遗迹'
      if (hasBoost) {
        return [
          { label: '隐世神族',   icon: '🌟', rarity: 'SSS', weight: 10, extra: { familyBoost: 3 } },
          { label: '皇室血脉',   icon: '👑', rarity: 'SS',  weight: 15, extra: { familyBoost: 2 } },
          { label: '大宗门',     icon: '🏯', rarity: 'S',   weight: 25, extra: { familyBoost: 1 } },
          { label: '小贵族',     icon: '🏠', rarity: 'A',   weight: 30 },
          { label: '平民家庭',   icon: '👨‍👩‍👧', rarity: 'B', weight: 15 },
          { label: '孤儿',       icon: '😢', rarity: 'C',   weight: 5 },
        ]
      }
      return [
        { label: '隐世神族',   icon: '🌟', rarity: 'SSS', weight: 3,  extra: { familyBoost: 3 } },
        { label: '皇室血脉',   icon: '👑', rarity: 'SS',  weight: 7,  extra: { familyBoost: 2 } },
        { label: '大宗门',     icon: '🏯', rarity: 'S',   weight: 18, extra: { familyBoost: 1 } },
        { label: '小贵族',     icon: '🏠', rarity: 'A',   weight: 28 },
        { label: '平民家庭',   icon: '👨‍👩‍👧', rarity: 'B', weight: 29 },
        { label: '孤儿',       icon: '😢', rarity: 'C',   weight: 15 },
      ]
    },
  },
  // ==================== 第8步：外貌 ====================
  {
    key: 'appearance', title: '外貌', icon: '💄',
    prelude: '命运之轮转动——你的容貌如何？在斗罗大陆，颜值也是一种实力。',
    computeOptions(state) {
      return [
        { label: '倾国倾城',   icon: '💎', rarity: 'SSS', weight: 5,  extra: { beauty: 1.8 } },
        { label: '俊美绝伦',   icon: '✨', rarity: 'SS',  weight: 10, extra: { beauty: 1.5 } },
        { label: '清秀',       icon: '🌿', rarity: 'S',   weight: 22, extra: { beauty: 1.2 } },
        { label: '端正',       icon: '😊', rarity: 'A',   weight: 33, extra: { beauty: 1.0 } },
        { label: '平平无奇',   icon: '😐', rarity: 'B',   weight: 20, extra: { beauty: 0.8 } },
        { label: '有点抱歉',   icon: '😬', rarity: 'C',   weight: 10, extra: { beauty: 0.6 } },
      ]
    },
    suffixes: {
      SSS: '此等容貌，天下无双！',
      SS: '走在街上回头率极高！',
      S: '清秀可人，令人心生好感！',
      A: '端正大方，气质不俗！',
      B: '普通人的长相，无人在意。',
      C: '相貌平平，但实力才是关键！',
    },
  },
  // ==================== 第9步：特殊标签 ====================
  {
    key: 'specialTag', title: '特殊标签', icon: '🔮',
    prelude: '命运之轮最后一次转动——你是否有不为人知的特殊之处？',
    computeOptions(state) {
      const quality = state.attributes?.soulQuality || ''
      const innate = state.attributes?.innatePower || 0
      const isHighPotential = quality === '神级武魂！！' || quality === '传说级武魂' || innate >= 9
      if (isHighPotential) {
        return [
          { label: '天选之子',       icon: '👑', rarity: 'SSS', weight: 10, levelBoost: 5, extra: { tag: '天选之子' } },
          { label: '双生武魂',       icon: '⚔️⚔️', rarity: 'SSS', weight: 8,  levelBoost: 4, extra: { tag: '双生武魂', soulType2: '蓝银皇' } },
          { label: '魂骨天生',       icon: '🦴', rarity: 'SS',  weight: 12, levelBoost: 2, soulBone: { slot: 'head', beast: '远古圣兽', colorName: '万年' }, extra: { tag: '魂骨天生' } },
          { label: '天生神力',       icon: '💪', rarity: 'SS',  weight: 15, levelBoost: 3, extra: { tag: '天生神力' } },
          { label: '精神异于常人',   icon: '🧠', rarity: 'S',   weight: 18, levelBoost: 1, extra: { tag: '精神异于常人' } },
          { label: '身世成谜',       icon: '❓', rarity: 'A',   weight: 20, extra: { tag: '身世成谜' } },
          { label: '无',             icon: '➖', rarity: 'C',   weight: 17, extra: { tag: '无' } },
        ]
      }
      return [
        { label: '天选之子',       icon: '👑', rarity: 'SSS', weight: 3,  levelBoost: 5, extra: { tag: '天选之子' } },
        { label: '双生武魂',       icon: '⚔️⚔️', rarity: 'SSS', weight: 4,  levelBoost: 4, extra: { tag: '双生武魂', soulType2: '蓝银草' } },
        { label: '魂骨天生',       icon: '🦴', rarity: 'SS',  weight: 8,  levelBoost: 2, soulBone: { slot: 'rightArm', beast: '千年魂兽', colorName: '千年' }, extra: { tag: '魂骨天生' } },
        { label: '天生神力',       icon: '💪', rarity: 'SS',  weight: 10, levelBoost: 3, extra: { tag: '天生神力' } },
        { label: '精神异于常人',   icon: '🧠', rarity: 'S',   weight: 15, levelBoost: 1, extra: { tag: '精神异于常人' } },
        { label: '身世成谜',       icon: '❓', rarity: 'A',   weight: 20, extra: { tag: '身世成谜' } },
        { label: '无',             icon: '➖', rarity: 'C',   weight: 40, extra: { tag: '无' } },
      ]
    },
  },
]
