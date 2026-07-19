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

export const EVENT_POOL_B = [
  // ==================== 原著深度事件 Lv.61-80 ====================
  {
    id: 'canon_maHongJun', title: '📖 邪火凤凰·马红俊', icon: '🔥', minLevel: 62, maxLevel: 78, rarity: 'S',
    prelude: '马红俊的邪火凤凰武魂突然失控了！他的体内邪火正在反噬——如果不及时压制，他可能会被自己的武魂烧成灰烬。你是唯一在场的人。命运之轮，请转动——',
    computeOptions(state) {
      return [
        { label: '冒险压制邪火·救下马红俊！！', icon: '🧯', rarity: 'SSS', weight: 12, levelBoost: 5, worldImpact: { maHongJun: { met: true, affinity: 40, faction: 'friend' } } },
        { label: '用冰系力量镇压邪火',         icon: '❄️', rarity: 'SS', weight: 20, levelBoost: 4, worldImpact: { maHongJun: { met: true, affinity: 20 } } },
        { label: '去找唐三帮忙·他一定有办法', icon: '🏃', rarity: 'A', weight: 28, levelBoost: 2 },
        { label: '束手无策·只能看着',           icon: '😰', rarity: 'B', weight: 20 },
        { label: '邪火波及·自己也受伤',        icon: '🔥', rarity: 'C', weight: 20, levelBoost: 1 },
      ]
    },
  },
  {
    id: 'canon_oscar', title: '📖 奥斯卡的食物武魂', icon: '🌭', minLevel: 64, maxLevel: 80, rarity: 'S',
    prelude: '奥斯卡发明了一种新的食物系魂技——能临时提升魂师一个等级的战斗力！但材料极其稀缺，需要深入极北之地采集。"兄弟，能陪我去一趟吗？"命运之轮，请转动——',
    computeOptions(state) {
      return [
        { label: '陪同采集·获得第一批成品！！', icon: '🍖', rarity: 'SSS', weight: 15, levelBoost: 5, worldImpact: { oscar: { met: true, affinity: 30 } } },
        { label: '提供资金·让雇佣兵陪同',       icon: '💰', rarity: 'A', weight: 25, levelBoost: 2 },
        { label: '帮忙设计配方·优化效果',       icon: '🧪', rarity: 'SS', weight: 20, levelBoost: 4, worldImpact: { oscar: { met: true, affinity: 20 } } },
        { label: '太危险·婉拒',                 icon: '🙅', rarity: 'B', weight: 22 },
        { label: '采集失败·但也收获了其他药草', icon: '🌿', rarity: 'C', weight: 18, levelBoost: 1 },
      ]
    },
  },
  {
    id: 'canon_zhuZhuQing', title: '📖 朱竹清的暗杀', icon: '🐱', minLevel: 66, maxLevel: 82, rarity: 'SS',
    prelude: '朱竹清深夜找到了你——星罗帝国派来的刺客已经潜入营地。目标是她和戴沐白。她需要你帮忙设置一个反暗杀陷阱。命运之轮，请转动——',
    computeOptions(state) {
      return [
        { label: '完美设局·刺客全灭！！', icon: '🪤', rarity: 'SSS', weight: 12, levelBoost: 5, worldImpact: { zhuZhuQing: { met: true, affinity: 25 } } },
        { label: '协助她击退刺客',        icon: '⚔️', rarity: 'SS', weight: 25, levelBoost: 4 },
        { label: '活捉刺客·审问幕后',    icon: '🔗', rarity: 'S', weight: 28, levelBoost: 3, worldImpact: { zhuZhuQing: { met: true, affinity: 15 } } },
        { label: '被刺客先发制人·陷入被动', icon: '😱', rarity: 'B', weight: 15, levelBoost: 1 },
        { label: '袖手旁观·不关我事',    icon: '🤷', rarity: 'C', weight: 20 },
      ]
    },
  },

  // ==================== 原著深度事件 Lv.81-100 ====================
  {
    id: 'canon_tangHao', title: '📖 昊天斗罗·唐昊', icon: '🔨', minLevel: 82, maxLevel: 95, rarity: 'SSS',
    prelude: '一个扛着巨大昊天锤的男人出现在你面前——昊天斗罗唐昊！唐三的父亲！"小子，听说你和我儿子有些交情。让老夫看看，你有没有资格做他的朋友。"命运之轮，请转动——',
    computeOptions(state) {
      const tangFriend = isAlliedWith('tangSan')(state)
      return [
        { label: '接下三锤·获得唐昊认可！！', icon: '💪', rarity: 'SSS', weight: tangFriend ? 15 : 5, levelBoost: 8, worldImpact: { tangHao: { met: true, affinity: 30 } } },
        { label: '勉强接下·唐昊微微点头',     icon: '😤', rarity: 'SS', weight: 20, levelBoost: 5, worldImpact: { tangHao: { met: true, affinity: 10 } } },
        { label: '以智取胜·不硬接',           icon: '🧠', rarity: 'S', weight: 25, levelBoost: 4, worldImpact: { tangHao: { met: true, affinity: 15 } } },
        { label: '被震飞·但唐昊没下杀手',     icon: '💨', rarity: 'A', weight: 25, levelBoost: 2 },
        { label: '不敢应战·被鄙视',           icon: '😔', rarity: 'C', weight: 10, worldImpact: { tangHao: { met: true, affinity: -10 } } },
      ]
    },
  },
  {
    id: 'canon_biBiDong', title: '📖 教皇的试探', icon: '👸', minLevel: 84, maxLevel: 96, rarity: 'SSS',
    prelude: '比比东女皇单独召见你。她的眼神深不可测，仿佛能将你的灵魂看穿。"你的潜力……让我想起了年轻时的自己。告诉我，你真正想要的是什么？"命运之轮，请转动——',
    computeOptions(state) {
      return [
        { label: '坦诚回答·获得教皇赏识', icon: '🤝', rarity: 'SSS', weight: 12, levelBoost: 5, worldImpact: { biBiDong: { affinity: 30 } } },
        { label: '含糊其辞·保持神秘',     icon: '🤫', rarity: 'SS', weight: 25, levelBoost: 3 },
        { label: '反问教皇·反客为主',     icon: '🎭', rarity: 'S', weight: 22, levelBoost: 4, worldImpact: { biBiDong: { affinity: 10 } } },
        { label: '拒绝回答·以沉默对抗',   icon: '🪨', rarity: 'A', weight: 25, levelBoost: 2, worldImpact: { biBiDong: { affinity: -10 } } },
        { label: '被比比东看穿·深感不安', icon: '😰', rarity: 'B', weight: 16 },
      ]
    },
  },
  {
    id: 'canon_seaGodTrident', title: '📖 海神三叉戟', icon: '🔱', minLevel: 86, maxLevel: 98, rarity: 'SSS',
    requiredEvents: ['seaGodTrial'],
    prelude: '海神岛上，巨大的海神三叉戟从海底缓缓升起！这是海神的信物——只有通过九考的人才能拔出它。它将赋予持有者掌控海洋的力量！命运之轮，请转动——',
    computeOptions(state) {
      return [
        { label: '拔出三叉戟·海神之力加身！！', icon: '🔱', rarity: 'SSS', weight: 8, levelBoost: 10, worldImpact: { seaGodTrident: true } },
        { label: '三叉戟共鸣·获得部分力量',   icon: '💙', rarity: 'SS', weight: 20, levelBoost: 6 },
        { label: '无法拔出·但戟身赐予祝福',   icon: '🙏', rarity: 'S', weight: 30, levelBoost: 4 },
        { label: '三叉戟太重·举不动',         icon: '💪', rarity: 'A', weight: 22, levelBoost: 2 },
        { label: '被戟身反弹·受了内伤',       icon: '⚡', rarity: 'B', weight: 20, levelBoost: 1 },
      ]
    },
  },
  {
    id: 'canon_asuraGod', title: '📖 修罗神的试炼', icon: '⚔️', minLevel: 88, maxLevel: 99, rarity: 'SSS', isMilestone: true,
    requiredEvents: ['slaughterCity'],
    prelude: '修罗神——执掌杀戮与审判的神祇——亲自降临在你面前。他的双眼如同深渊："想要成为修罗神？先通过我的死亡试炼。败了，就是魂飞魄散。"命运之轮，请转动——',
    computeOptions(state) {
      return [
        { label: '通过试炼·修罗神认可！！', icon: '💀', rarity: 'SSS', weight: 6, levelBoost: 12, worldImpact: { asuraGod: { passed: true } } },
        { label: '九死一生·勉强通过',       icon: '🩸', rarity: 'SS', weight: 15, levelBoost: 8 },
        { label: '中途放弃·但修罗神留手',   icon: '🛑', rarity: 'S', weight: 30, levelBoost: 4 },
        { label: '被击溃·但修罗神看到了潜力', icon: '💫', rarity: 'A', weight: 24, levelBoost: 3 },
        { label: '直接拒绝·修罗神冷笑离去', icon: '😤', rarity: 'B', weight: 25, levelBoost: 1 },
      ]
    },
  },
  {
    id: 'canon_shrekReunion', title: '📖 七怪重聚', icon: '👥', minLevel: 90, maxLevel: 100, rarity: 'SSS',
    requiredEvents: ['shrekEighth'],
    prelude: '大战前夕——史莱克七怪（加上你，八怪）终于再次聚首！唐三、小舞、戴沐白、奥斯卡、马红俊、宁荣荣、朱竹清——你们围坐在篝火旁，回忆着过往，展望着明天。命运之轮，请转动——',
    computeOptions(state) {
      return [
        { label: '七怪齐聚·羁绊永恒！！', icon: '🌟', rarity: 'SSS', weight: 20, levelBoost: 6, worldImpact: { tangSan: { affinity: 30 }, xiaoWu: { affinity: 20 }, daiMuBai: { affinity: 15 }, oscar: { affinity: 15 } } },
        { label: '制定最终作战计划',       icon: '📋', rarity: 'SS', weight: 30, levelBoost: 4 },
        { label: '分工明确·各司其职',     icon: '🤝', rarity: 'S', weight: 25, levelBoost: 3 },
        { label: '有人缺席·心中遗憾',     icon: '😔', rarity: 'A', weight: 15, levelBoost: 2 },
        { label: '产生了分歧·不欢而散',   icon: '💢', rarity: 'B', weight: 10 },
      ]
    },
  },
  {
    id: 'sectMission', title: '宗门秘境', icon: '🏯', minLevel: 33, maxLevel: 48, rarity: 'S',
    prelude: '学院安排了一次宗门秘境探险。据说秘境深处藏着一件上古遗物——但也伴随着致命的机关。命运之轮，请转动——',
    computeOptions(state) {
      return [
        { label: '闯入深处·获得上古遗物！！', icon: '🏺', rarity: 'SSS', weight: 4, levelBoost: 6, soulBone: { slot: 'torso', beast: '上古遗物融合', year: 80000, skill: '上古守护', rarity: 'SS' } },
        { label: '智破机关·获得传承',       icon: '🧠', rarity: 'SS', weight: 15, levelBoost: 4 },
        { label: '组队协作·各有所获',       icon: '🤝', rarity: 'A', weight: 30, levelBoost: 2 },
        { label: '被机关困住·勉强脱身',     icon: '🪤', rarity: 'B', weight: 25 },
        { label: '触发陷阱·受伤退出',       icon: '🤕', rarity: 'C', weight: 26 },
      ]
    },
  },
  {
    id: 'selfCreatedSkill', title: '自创魂技', icon: '💡', minLevel: 35, maxLevel: 52, rarity: 'SS',
    prelude: '你在修炼中突然灵光一现——一个前所未有的魂技构想出现在脑海中！如果能完善它，这将成为属于你自己的独门绝技！命运之轮，请转动——',
    computeOptions(state) {
      const highInnate = (state.attributes?.innatePower || 0) >= 7
      return [
        { label: '完美创出·自创神技！！', icon: '✨', rarity: 'SSS', weight: highInnate ? 10 : 4, levelBoost: 8 },
        { label: '创出实用魂技·战力提升', icon: '⚡', rarity: 'SS', weight: 20, levelBoost: 5 },
        { label: '初步完成·还需打磨',     icon: '🔧', rarity: 'A', weight: 30, levelBoost: 3 },
        { label: '方向错了·推倒重来',     icon: '🔄', rarity: 'B', weight: 25 },
        { label: '走火入魔·但意外突破',   icon: '🔥', rarity: 'S', weight: 21, levelBoost: 4 },
      ]
    },
  },
  {
    id: 'sunsetForest', title: '落日森林', icon: '🌅', minLevel: 37, maxLevel: 54, rarity: 'A',
    prelude: '落日森林——仅次于星斗大森林的第二大魂兽聚集地。据说这里隐藏着一种罕见的双属性魂兽。命运之轮，请转动——',
    computeOptions(state) {
      return [
        { label: '捕获双属性魂兽·极品魂环！！', icon: '🦅', rarity: 'SSS', weight: 3, levelBoost: 6, soulRing: { year: 60000, colorName: '五万年', colorHex: '#4A148C', beast: '双属性雷火鸟', skill: '雷火双翼' } },
        { label: '发现隐藏洞穴·获得大量资源',   icon: '💎', rarity: 'SS', weight: 12, levelBoost: 4 },
        { label: '遭遇魂兽群·激战突围',         icon: '⚔️', rarity: 'A', weight: 30, levelBoost: 2 },
        { label: '迷路三天·但也采到不少药草',   icon: '🌿', rarity: 'B', weight: 28 },
        { label: '被高阶魂兽追赶·狼狈逃离',     icon: '🏃', rarity: 'C', weight: 27 },
      ]
    },
  },
  {
    id: 'northLand', title: '极北之地', icon: '❄️', minLevel: 38, maxLevel: 56, rarity: 'S',
    prelude: '极北之地的寒风如刀割般刺骨。在这片冰封的大地上，传说有一种冰系神兽的幼崽偶尔会出现——命运之轮，请转动——',
    computeOptions(state) {
      return [
        { label: '遇到冰系神兽幼崽·完美魂环！！', icon: '🧊', rarity: 'SSS', weight: 3, levelBoost: 7, soulRing: { year: 90000, colorName: '五万年', colorHex: '#4A148C', beast: '冰系神兽幼崽', skill: '绝对零度' } },
        { label: '发现万年冰髓·魂力大增',         icon: '💠', rarity: 'SS', weight: 14, levelBoost: 5 },
        { label: '在极寒中磨练意志·突破瓶颈',     icon: '💪', rarity: 'S', weight: 28, levelBoost: 3 },
        { label: '遭遇暴风雪·勉强幸存',           icon: '🌨️', rarity: 'B', weight: 30 },
        { label: '冻伤严重·但活了下来',           icon: '🥶', rarity: 'C', weight: 25 },
      ]
    },
  },
  {
    id: 'soulMutation', title: '武魂变异', icon: '🧬', minLevel: 34, maxLevel: 50, rarity: 'SS',
    prelude: '你的武魂突然出现了异常的波动——它在变异！这可能让你变得更强，也可能带来未知的风险……命运之轮，请转动——',
    computeOptions(state) {
      return [
        { label: '良性变异·武魂品质提升！！', icon: '⬆️', rarity: 'SSS', weight: 5, levelBoost: 8 },
        { label: '稳定控制变异方向',           icon: '🎛️', rarity: 'SS', weight: 18, levelBoost: 5 },
        { label: '变异平缓·略有增强',         icon: '📈', rarity: 'S', weight: 30, levelBoost: 3 },
        { label: '勉强压制住变异',             icon: '🛑', rarity: 'A', weight: 27, levelBoost: 1 },
        { label: '变异副作用·但学会适应',     icon: '🦾', rarity: 'B', weight: 20, levelBoost: 2 },
      ]
    },
  },

  // ==================== 剧情弧线1：大师的弟子（Lv.15-35） ====================
  {
    id: 'arc_master_1', title: '🔗 大师的入学测试', icon: '📝', minLevel: 15, maxLevel: 35, rarity: 'S',
    prelude: '玉小刚——被称为"大师"的男人——决定亲自测试你的潜力。他的眼神中既有期待也有怀疑："让我看看，你是否有资格成为我的弟子。"命运之轮，请转动——',
    computeOptions(state) {
      return [
        { label: '完美通过·大师眼睛一亮', icon: '✨', rarity: 'SSS', weight: 12, levelBoost: 3, unlocks: ['arc_master_2'], worldImpact: { yuXiaoGang: { met: true, affinity: 25 } } },
        { label: '顺利通过·获得肯定',     icon: '✅', rarity: 'SS', weight: 28, levelBoost: 2, unlocks: ['arc_master_2'] },
        { label: '勉强通过·大师微微皱眉', icon: '😰', rarity: 'A', weight: 30, levelBoost: 1, unlocks: ['arc_master_2'] },
        { label: '被大师指出致命缺陷',     icon: '🔍', rarity: 'B', weight: 20 },
        { label: '测试失败·但大师看到了潜力', icon: '💪', rarity: 'C', weight: 10 },
      ]
    },
  },
  {
    id: 'arc_master_2', title: '🔗 魂环理论实践', icon: '📖', minLevel: 20, maxLevel: 38, rarity: 'SS',
    requiredEvents: ['arc_master_1'],
    prelude: '大师拿出了他的魂环配置理论——"魂环不是越强越好，而是越适合越好。你的第一魂环如果是百年，未来可承载万年第九环；如果是千年，反而会限制上限。"命运之轮，请转动——',
    computeOptions(state) {
      return [
        { label: '完全理解·理论实践完美', icon: '🧠', rarity: 'SSS', weight: 15, levelBoost: 4, unlocks: ['arc_master_3'] },
        { label: '理解大半·开始实践',     icon: '📊', rarity: 'SS', weight: 25, levelBoost: 3, unlocks: ['arc_master_3'] },
        { label: '似懂非懂·但愿意尝试', icon: '🤔', rarity: 'A', weight: 30, levelBoost: 2, unlocks: ['arc_master_3'] },
        { label: '质疑理论·引发辩论',   icon: '💬', rarity: 'S', weight: 20, levelBoost: 2 },
        { label: '太难了·完全听不懂',   icon: '😵', rarity: 'C', weight: 10 },
      ]
    },
  },
  {
    id: 'arc_master_3', title: '🔗 大师的极限训练', icon: '🏋️', minLevel: 25, maxLevel: 42, rarity: 'SSS',
    requiredEvents: ['arc_master_2'],
    prelude: '大师带你和唐三来到了一片隐秘的训练场——这里是他年轻时用来极限训练的地方。\u201c从今天起的一个月，你们将经历地狱般的训练。能坚持下来的，才有资格冠以\u2018大师弟子\u2019之名。\u201d命运之轮，请转动——',
    computeOptions(state) {
      return [
        { label: '完成全部训练·实力飞跃', icon: '💪', rarity: 'SSS', weight: 15, levelBoost: 6, worldImpact: { yuXiaoGang: { affinity: 30 }, tangSan: { affinity: 15, met: true } } },
        { label: '完成大半·体质大增',     icon: '🏃', rarity: 'SS', weight: 28, levelBoost: 4 },
        { label: '中途受伤·但坚持到底',   icon: '🩹', rarity: 'S', weight: 25, levelBoost: 3 },
        { label: '太痛苦·中途退出',       icon: '😩', rarity: 'B', weight: 20 },
        { label: '第一天就放弃了',         icon: '🏳️', rarity: 'C', weight: 12 },
      ]
    },
  },

  // ==================== 剧情弧线2：精英赛之路（Lv.35-55） ====================
  {
    id: 'arc_tournament_1', title: '🔗 学院选拔赛', icon: '🏟️', minLevel: 35, maxLevel: 55, rarity: 'S',
    prelude: '全大陆精英赛的学院内部选拔开始了。只有最强的七人才能代表学院出战。你站在选拔赛的擂台上——这是证明自己最好的机会。命运之轮，请转动——',
    computeOptions(state) {
      return [
        { label: '全胜通过·震惊全院',   icon: '🌟', rarity: 'SSS', weight: 12, levelBoost: 4, unlocks: ['arc_tournament_2'] },
        { label: '顺利入选代表队',       icon: '✅', rarity: 'SS', weight: 28, levelBoost: 3, unlocks: ['arc_tournament_2'] },
        { label: '惊险入选·最后一刻',   icon: '😰', rarity: 'A', weight: 30, levelBoost: 2, unlocks: ['arc_tournament_2'] },
        { label: '落选·但被选为替补',   icon: '🔄', rarity: 'B', weight: 20 },
        { label: '落选·遗憾离场',       icon: '😔', rarity: 'C', weight: 10 },
      ]
    },
  },
  {
    id: 'arc_tournament_2', title: '🔗 关键一战·天水学院', icon: '💧', minLevel: 40, maxLevel: 58, rarity: 'SS',
    requiredEvents: ['arc_tournament_1'],
    prelude: '精英赛关键一战——对手是天水学院！她们的武魂融合技"冰雪飘零"曾让无数强队饮恨。弗兰德院长面色凝重："这一战，必须赢！"命运之轮，请转动——',
    computeOptions(state) {
      return [
        { label: '完美破解武魂融合技·大胜', icon: '❄️', rarity: 'SSS', weight: 12, levelBoost: 5, unlocks: ['arc_tournament_3'] },
        { label: '激战后险胜·挺进下一轮',   icon: '⚔️', rarity: 'SS', weight: 25, levelBoost: 4, unlocks: ['arc_tournament_3'] },
        { label: '团队配合制胜·战术立功',   icon: '🤝', rarity: 'S', weight: 28, levelBoost: 3, unlocks: ['arc_tournament_3'] },
        { label: '因伤险败·但虽败犹荣',     icon: '🩹', rarity: 'B', weight: 20, levelBoost: 2 },
        { label: '惨败·被淘汰',             icon: '💔', rarity: 'C', weight: 15 },
      ]
    },
  },
  {
    id: 'arc_tournament_3', title: '🔗 冠军之夜', icon: '🏆', minLevel: 45, maxLevel: 60, rarity: 'SSS',
    requiredEvents: ['arc_tournament_2'],
    prelude: '精英赛的决赛之夜！武魂城中央大斗魂场内座无虚席。教皇比比东亲临现场观战。你站在决赛的擂台上，脚下是整个大陆的目光——命运之轮，请转动——',
    computeOptions(state) {
      return [
        { label: '夺冠！！全场沸腾！！',   icon: '🥇', rarity: 'SSS', weight: 10, levelBoost: 10, worldImpact: { biBiDong: { met: true, affinity: 5 } } },
        { label: '亚军·虽败犹荣',         icon: '🥈', rarity: 'SS', weight: 25, levelBoost: 7 },
        { label: '季军·实力不俗',         icon: '🥉', rarity: 'S', weight: 30, levelBoost: 5 },
        { label: '决赛中受伤退赛',         icon: '🤕', rarity: 'A', weight: 20, levelBoost: 3 },
        { label: '表现不佳·但积累了大赛经验', icon: '📈', rarity: 'B', weight: 15, levelBoost: 2 },
      ]
    },
  },

  // ==================== 天使九考 ====================
  {
    id: 'arc_angel_1', title: '👼 天使第一考·圣光洗礼', icon: '✨', minLevel: 45, maxLevel: 70, rarity: 'SS', isMilestone: true,
    prelude: '天使神的圣光从天空降落——你被选中接受天使九考！第一考：接受圣光洗礼。命运之轮，请转动——',
    computeOptions(state) {
      const pwr = Math.max(0.5, (state.combatPower || state.level * 10) / 1500)
      return [
        { label: '圣光完美洗礼·天使之力初现！！', icon: '👼', rarity: 'SSS', weight: Math.floor(15 * pwr), levelBoost: 6 },
        { label: '顺利通过·天使印记浮现',         icon: '✨', rarity: 'SS', weight: Math.floor(28 * pwr), levelBoost: 4 },
        { label: '勉强承受·但通过了',             icon: '😰', rarity: 'A', weight: 30, levelBoost: 3 },
        { label: '失败·圣光消散',                 icon: '💨', rarity: 'C', weight: Math.max(5, 27 - Math.floor(10 * pwr)), levelBoost: 1 },
      ]
    },
  },
  {
    id: 'arc_angel_2', title: '👼 天使第二考·信仰之门', icon: '🚪', minLevel: 46, maxLevel: 72, rarity: 'SS', isMilestone: true,
    requiredEvents: ['arc_angel_1'],
    prelude: '第二考：推开信仰之门！只有心中充满光明信念的人才能通过。命运之轮，请转动——',
    computeOptions(state) {
      const pwr = Math.max(0.5, (state.combatPower || state.level * 10) / 1500)
      return [
        { label: '信念坚定·门扉大开！！', icon: '🚪', rarity: 'SSS', weight: Math.floor(15 * pwr), levelBoost: 5 },
        { label: '成功推开·信仰之力加身', icon: '✨', rarity: 'SS', weight: Math.floor(28 * pwr), levelBoost: 4 },
        { label: '勉强推开一道缝·通过了', icon: '😰', rarity: 'A', weight: 30, levelBoost: 3 },
        { label: '门纹丝不动',             icon: '🚫', rarity: 'C', weight: Math.max(5, 27 - Math.floor(10 * pwr)), levelBoost: 1 },
      ]
    },
  },
  {
    id: 'arc_angel_3', title: '👼 天使第三考·光翼初展', icon: '🪶', minLevel: 48, maxLevel: 74, rarity: 'SS', isMilestone: true,
    requiredEvents: ['arc_angel_2'],
    prelude: '第三考：展开天使光翼！从天使神殿的最高处跃下——在落地之前必须展开光翼。命运之轮，请转动——',
    computeOptions(state) {
      const pwr = Math.max(0.5, (state.combatPower || state.level * 10) / 1800)
      return [
        { label: '光翼华丽展开·翱翔天际！！', icon: '🪶', rarity: 'SSS', weight: Math.floor(12 * pwr), levelBoost: 6 },
        { label: '成功展翼·平稳落地',         icon: '✅', rarity: 'SS', weight: Math.floor(25 * pwr), levelBoost: 4 },
        { label: '差点摔落·最后一刻展开',     icon: '😱', rarity: 'A', weight: 30, levelBoost: 3 },
        { label: '失败·被天使接住',           icon: '👼', rarity: 'B', weight: Math.max(5, 33 - Math.floor(10 * pwr)), levelBoost: 2 },
      ]
    },
  },
  {
    id: 'arc_angel_4', title: '👼 天使第四考·审判之剑', icon: '⚔️', minLevel: 50, maxLevel: 76, rarity: 'SSS', isMilestone: true,
    requiredEvents: ['arc_angel_3'],
    prelude: '第四考：击败天使神殿的审判官——一位天使神的忠实仆从！命运之轮，请转动——',
    computeOptions(state) {
      const base = [
        { label: '击败审判官·获得天使魂骨！！', icon: '⚔️', rarity: 'SSS', weight: 10, levelBoost: 7, soulBone: { slot: 'rightArm', beast: '天使审判官', year: 80000, skill: '审判之光', rarity: 'SS' } },
        { label: '击败审判官·获得认可',         icon: '✅', rarity: 'SS', weight: 22, levelBoost: 5 },
        { label: '打平·审判官认可你的勇气',     icon: '🤝', rarity: 'A', weight: 30, levelBoost: 4 },
        { label: '失败·但未放弃',               icon: '😔', rarity: 'C', weight: 38, levelBoost: 2 },
      ]
      return adjustCombatWeights(base, state.combatPower || state.level * 10, 4000)
    },
  },
  {
    id: 'arc_angel_5', title: '👼 天使第五考·圣歌洗礼', icon: '🎵', minLevel: 52, maxLevel: 78, rarity: 'SS',
    requiredEvents: ['arc_angel_4'],
    prelude: '第五考：聆听天使圣歌——在圣歌中找到内心的平静，否则会被圣歌所伤。命运之轮，请转动——',
    computeOptions(state) {
      const pwr = Math.max(0.5, (state.combatPower || state.level * 10) / 2000)
      return [
        { label: '与圣歌共鸣·天使亲和度大增！！', icon: '🎵', rarity: 'SSS', weight: Math.floor(15 * pwr), levelBoost: 6 },
        { label: '静静聆听·内心平和',             icon: '🧘', rarity: 'SS', weight: Math.floor(28 * pwr), levelBoost: 4 },
        { label: '勉强承受·差点被圣歌所伤',       icon: '😰', rarity: 'A', weight: 30, levelBoost: 3 },
        { label: '无法承受·退出圣堂',             icon: '🏃', rarity: 'C', weight: Math.max(5, 27 - Math.floor(10 * pwr)), levelBoost: 1 },
      ]
    },
  },
  {
    id: 'arc_angel_6', title: '👼 天使第六考·圣焰淬炼', icon: '🔥', minLevel: 54, maxLevel: 82, rarity: 'SSS', isMilestone: true,
    requiredEvents: ['arc_angel_5'],
    prelude: '第六考：走进天使圣焰！圣焰会烧尽一切杂质——只有纯正的灵魂才能通过。命运之轮，请转动——',
    computeOptions(state) {
      const pwr = Math.max(0.3, (state.combatPower || state.level * 10) / 3000)
      return [
        { label: '圣焰淬炼·体质飞跃！！', icon: '🔥', rarity: 'SSS', weight: Math.floor(12 * pwr), levelBoost: 8, soulRing: { slot: 6, year: 80000, colorName: '五万年', colorHex: '#4A148C', beast: '圣焰天使', skill: '圣焰焚天' } },
        { label: '通过淬炼·体质大增',     icon: '💪', rarity: 'SS', weight: Math.floor(25 * pwr), levelBoost: 5 },
        { label: '艰难通过·留下了灼伤',   icon: '🤕', rarity: 'A', weight: 30, levelBoost: 4 },
        { label: '无法承受·退出圣焰',     icon: '🏃', rarity: 'C', weight: Math.max(5, 33 - Math.floor(10 * pwr)), levelBoost: 2 },
      ]
    },
  },
  {
    id: 'arc_angel_7', title: '👼 天使第七考·圣域觉醒', icon: '🌐', minLevel: 56, maxLevel: 85, rarity: 'SSS',
    requiredEvents: ['arc_angel_6'],
    prelude: '第七考：在天使圣域中觉醒自己的领域！天使神的光辉笼罩整个神殿。命运之轮，请转动——',
    computeOptions(state) {
      const pwr = Math.max(0.3, (state.combatPower || state.level * 10) / 3500)
      return [
        { label: '领域觉醒·获得天使领域！！', icon: '🌐', rarity: 'SSS', weight: Math.floor(10 * pwr), levelBoost: 8, worldImpact: { domain: '天使领域' } },
        { label: '领域初成·天使之力大增',     icon: '✨', rarity: 'SS', weight: Math.floor(25 * pwr), levelBoost: 5 },
        { label: '勉强抵抗圣域·通过考验',     icon: '😰', rarity: 'A', weight: 30, levelBoost: 3 },
        { label: '被圣域逼退·失败',           icon: '😵', rarity: 'C', weight: Math.max(5, 35 - Math.floor(10 * pwr)), levelBoost: 2 },
      ]
    },
  },
  {
    id: 'arc_angel_8', title: '👼 天使第八考·六翼共鸣', icon: '🪽', minLevel: 58, maxLevel: 88, rarity: 'SSS',
    requiredEvents: ['arc_angel_7'],
    prelude: '第八考：与六翼天使武魂产生共鸣！天使神虚影展开六翼——你必须让自己的武魂与之同频。命运之轮，请转动——',
    computeOptions(state) {
      const pwr = Math.max(0.3, (state.combatPower || state.level * 10) / 4000)
      return [
        { label: '六翼共鸣·获得天使之翼！！', icon: '🪽', rarity: 'SSS', weight: Math.floor(8 * pwr), levelBoost: 10, soulBone: { slot: 'external', beast: '六翼天使', year: 100000, skill: '天使六翼', rarity: 'SSS' } },
        { label: '共鸣成功·但羽翼未全',       icon: '✨', rarity: 'SS', weight: Math.floor(22 * pwr), levelBoost: 6 },
        { label: '部分共鸣·获得祝福',         icon: '✅', rarity: 'S', weight: 28, levelBoost: 5 },
        { label: '无法共鸣·天使神叹息',       icon: '😔', rarity: 'B', weight: Math.max(5, 42 - Math.floor(10 * pwr)), levelBoost: 3 },
      ]
    },
  },
  {
    id: 'arc_angel_9', title: '👼 天使第九考·天使降临', icon: '👼', minLevel: 62, maxLevel: 93, rarity: 'SSS', isMilestone: true,
    requiredEvents: ['arc_angel_8'],
    prelude: '第九考——天使神本尊降临！"你已经通过了八考。现在，接受天使神的祝福——或者拒绝，选择自己的道路。"命运之轮，请转动——',
    computeOptions(state) {
      const base = [
        { label: '接受祝福·继承天使神位！！', icon: '👼', rarity: 'SSS', weight: 10, levelBoost: 12, worldImpact: { angelInherited: true } },
        { label: '接受·但神位不完整',         icon: '⭐', rarity: 'SS', weight: 22, levelBoost: 8 },
        { label: '获得天使印记·日后继承',     icon: '✨', rarity: 'S', weight: 28, levelBoost: 6 },
        { label: '拒绝·选择自己的道路',       icon: '🚫', rarity: 'A', weight: 20, levelBoost: 5 },
        { label: '失败·被天使神送回凡间',     icon: '⬇️', rarity: 'C', weight: 20, levelBoost: 3 },
      ]
      return adjustCombatWeights(base, state.combatPower || state.level * 10, 9000)
    },
  },
  {
    id: 'arc_seagod_1', title: '🔗 海神的召唤', icon: '🌊', minLevel: 55, maxLevel: 75, rarity: 'SS', isMilestone: true,
    prelude: '一个暴风雨的夜晚，你梦到了无边无际的大海。海面上，一位手持三叉戟的神祇注视着你。第二天醒来，你的手心上多了一个海神三叉戟的印记——这是海神的召唤。命运之轮，请转动——',
    computeOptions(state) {
      return [
        { label: '毅然前往·踏上征途',     icon: '⛵', rarity: 'SSS', weight: 20, levelBoost: 3, unlocks: ['arc_seagod_2'] },
        { label: '做好准备再出发',         icon: '🎒', rarity: 'SS', weight: 28, levelBoost: 2, unlocks: ['arc_seagod_2'] },
        { label: '犹豫再三·最终启程',     icon: '🤔', rarity: 'A', weight: 25, levelBoost: 1, unlocks: ['arc_seagod_2'] },
        { label: '暂时忽略·时机未到',     icon: '⏸️', rarity: 'B', weight: 17 },
        { label: '拒绝召唤·印记消失',     icon: '🚫', rarity: 'C', weight: 10 },
      ]
    },
  },
  {
    id: 'arc_seagod_2', title: '🔗 海神亲和度', icon: '💙', minLevel: 60, maxLevel: 78, rarity: 'SSS', isMilestone: true,
    requiredEvents: ['arc_seagod_1'],
    prelude: '海神岛上，一块巨大的水晶石矗立在神殿中央——这是测试海神亲和度的圣物。将手放在上面，水晶的光芒将揭示你与海神的契合程度。命运之轮，请转动——',
    computeOptions(state) {
      return [
        { label: '亲和度满级·金光冲天！！', icon: '✨', rarity: 'SSS', weight: 10, levelBoost: 6, unlocks: ['arc_seagod_3'] },
        { label: '亲和度优秀·获得认可',     icon: '💙', rarity: 'SS', weight: 25, levelBoost: 4, unlocks: ['arc_seagod_3'] },
        { label: '亲和度良好·可以修炼',     icon: '✅', rarity: 'S', weight: 30, levelBoost: 3, unlocks: ['arc_seagod_3'] },
        { label: '亲和度一般·需要更多努力', icon: '🔄', rarity: 'A', weight: 20, levelBoost: 2 },
        { label: '几乎没有亲和度',           icon: '😔', rarity: 'C', weight: 15, levelBoost: 1 },
      ]
    },
  },
  {
    id: 'arc_seagod_3', title: '🔗 海神之心', icon: '🔱', minLevel: 65, maxLevel: 82, rarity: 'SSS', isMilestone: true,
    requiredEvents: ['arc_seagod_2'],
    prelude: '海神传承的最后一步——融合海神之心！命运之轮，请转动——',
    computeOptions(state) {
      const pwr = Math.max(0.5, (state.combatPower || state.level * 10) / 2000)
      return [
        { label: '完美融合·获得海神权能！！', icon: '🔱', rarity: 'SSS', weight: Math.floor(12 * pwr), levelBoost: 8, worldImpact: { seaGodInherited: true } },
        { label: '融合成功·海神之力加身',     icon: '✅', rarity: 'SS', weight: Math.floor(28 * pwr), levelBoost: 5 },
        { label: '部分融合·需要更多时间',     icon: '⏳', rarity: 'A', weight: 30, levelBoost: 3 },
        { label: '融合失败·但武魂增强',       icon: '📈', rarity: 'B', weight: Math.max(5, 33 - Math.floor(10 * pwr)), levelBoost: 2 },
      ]
    },
  },
  {
    id: 'arc_seagod_4', title: '🔗 海神第四考·潮汐之力', icon: '🌊', minLevel: 55, maxLevel: 80, rarity: 'SS',
    requiredEvents: ['arc_seagod_3'],
    prelude: '第四考：承受海潮冲击！站在礁石上迎接一百道巨浪的拍打而不倒下。命运之轮，请转动——',
    computeOptions(state) {
      const pwr = Math.max(0.5, (state.combatPower || state.level * 10) / 2000)
      return [
        { label: '巍然不动·完美通过！！', icon: '🧘', rarity: 'SSS', weight: Math.floor(15 * pwr), levelBoost: 6 },
        { label: '艰难通过·但收获巨大',   icon: '💪', rarity: 'SS', weight: Math.floor(25 * pwr), levelBoost: 4 },
        { label: '被冲倒数次·最终成功',   icon: '🤕', rarity: 'A', weight: 30, levelBoost: 3 },
        { label: '失败·退回岸边',         icon: '⬅️', rarity: 'C', weight: Math.max(5, 30 - Math.floor(10 * pwr)), levelBoost: 1 },
      ]
    },
  },
  {
    id: 'arc_seagod_5', title: '🔗 海神第五考·深海潜行', icon: '🤿', minLevel: 56, maxLevel: 82, rarity: 'SS',
    requiredEvents: ['arc_seagod_4'],
    prelude: '第五考：潜入万米深海！在海魂兽之间穿行而不被发现。命运之轮，请转动——',
    computeOptions(state) {
      const pwr = Math.max(0.5, (state.combatPower || state.level * 10) / 2000)
      return [
        { label: '驯服海魂兽·震惊海神岛！！', icon: '🐋', rarity: 'SSS', weight: Math.floor(12 * pwr), levelBoost: 7, soulBone: { slot: 'leftLeg', beast: '深海魔鲸', year: 90000, skill: '深海之速', rarity: 'SS' } },
        { label: '完美避过所有海魂兽',         icon: '🤿', rarity: 'SS', weight: Math.floor(28 * pwr), levelBoost: 5 },
        { label: '被发现·但强行闯过',           icon: '⚔️', rarity: 'A', weight: 28, levelBoost: 4 },
        { label: '失败·浮出水面',               icon: '⬆️', rarity: 'C', weight: Math.max(5, 32 - Math.floor(10 * pwr)), levelBoost: 2 },
      ]
    },
  },
  {
    id: 'arc_seagod_6', title: '🔗 海神第六考·海皇试炼', icon: '👑', minLevel: 58, maxLevel: 84, rarity: 'SSS', isMilestone: true,
    requiredEvents: ['arc_seagod_5'],
    prelude: '第六考：击败海神岛守护者——魔魂大白鲨之王！命运之轮，请转动——',
    computeOptions(state) {
      const base = [
        { label: '击败鲨王·获得十万年魂环！！', icon: '🦈', rarity: 'SSS', weight: 8, levelBoost: 8, soulRing: { slot: 6, year: 100000, colorName: '十万年', colorHex: '#FF1744', beast: '魔魂大白鲨之王', skill: '魔鲨噬浪' } },
        { label: '击败鲨王·获得认可',           icon: '⚔️', rarity: 'SS', weight: 22, levelBoost: 6 },
        { label: '打平·鲨王让你通过',           icon: '🤝', rarity: 'A', weight: 30, levelBoost: 4 },
        { label: '失败·退回神殿',               icon: '😔', rarity: 'C', weight: 40, levelBoost: 2 },
      ]
      return adjustCombatWeights(base, state.combatPower || state.level * 10, 3000)
    },
  },
  {
    id: 'arc_seagod_7', title: '🔗 海神第七考·领域觉醒', icon: '🌀', minLevel: 60, maxLevel: 86, rarity: 'SSS',
    requiredEvents: ['arc_seagod_6'],
    prelude: '第七考：在海神领域的压迫下觉醒自己的领域之力！命运之轮，请转动——',
    computeOptions(state) {
      const pwr = Math.max(0.3, (state.combatPower || state.level * 10) / 3000)
      return [
        { label: '领域觉醒·获得海神领域！！', icon: '🌀', rarity: 'SSS', weight: Math.floor(10 * pwr), levelBoost: 8, worldImpact: { domain: '海神领域' } },
        { label: '成功抗压·领域初成',         icon: '💪', rarity: 'SS', weight: Math.floor(25 * pwr), levelBoost: 5 },
        { label: '勉强通过·但领域未成形',     icon: '😰', rarity: 'A', weight: 30, levelBoost: 3 },
        { label: '晕了过去·被海浪冲回岸边',   icon: '😵', rarity: 'C', weight: Math.max(5, 35 - Math.floor(10 * pwr)), levelBoost: 2 },
      ]
    },
  },
  {
    id: 'arc_seagod_8', title: '🔗 海神第八考·三叉戟试炼', icon: '🔱', minLevel: 63, maxLevel: 90, rarity: 'SSS',
    requiredEvents: ['arc_seagod_7'],
    prelude: '第八考：拔出海底深渊中的海神三叉戟——重十万八千斤！命运之轮，请转动——',
    computeOptions(state) {
      const pwr = Math.max(0.3, (state.combatPower || state.level * 10) / 4000)
      return [
        { label: '拔出三叉戟·海神之力加身！！', icon: '🔱', rarity: 'SSS', weight: Math.floor(8 * pwr), levelBoost: 10, worldImpact: { seaGodTrident: true } },
        { label: '三叉戟动摇·但未拔出',         icon: '💪', rarity: 'SS', weight: Math.floor(22 * pwr), levelBoost: 6 },
        { label: '获得三叉戟认可·但力量不够',   icon: '✅', rarity: 'S', weight: 28, levelBoost: 5 },
        { label: '无法搬动分毫',                 icon: '😔', rarity: 'B', weight: Math.max(5, 42 - Math.floor(10 * pwr)), levelBoost: 3 },
      ]
    },
  },
  {
    id: 'arc_seagod_9', title: '🔗 海神第九考·登神', icon: '🌊', minLevel: 66, maxLevel: 95, rarity: 'SSS', isMilestone: true,
    requiredEvents: ['arc_seagod_8'],
    prelude: '第九考——最终考验！海神本尊虚影降临——"证明你配得上海神之位。"命运之轮，请转动——',
    computeOptions(state) {
      const base = [
        { label: '通过试炼·继承海神之位！！', icon: '🌊', rarity: 'SSS', weight: 10, levelBoost: 12, worldImpact: { seaGodInherited: true }, unlocks: ['seaReturn'] },
        { label: '通过·但神位不完整',         icon: '⭐', rarity: 'SS', weight: 22, levelBoost: 8 },
        { label: '获得海神印记·日后继承',     icon: '🔱', rarity: 'S', weight: 28, levelBoost: 6 },
        { label: '失败·被打回岸边',           icon: '😔', rarity: 'C', weight: 40, levelBoost: 3 },
      ]
      return adjustCombatWeights(base, state.combatPower || state.level * 10, 8000)
    },
  },
  // ==================== 过渡事件：连接各等级段 ====================
  {
    id: 'bridge_notting', title: '🌉 诺丁城的日常', icon: '🏘️', minLevel: 10, maxLevel: 22, rarity: 'B',
    prelude: '诺丁城的清晨，阳光洒在武魂殿分殿的尖顶上。学院里的钟声响起，新的一天开始了——平凡而充实的学院生活。命运之轮，请转动——',
    computeOptions(state) {
      return [
        { label: '在图书馆发现一本古籍', icon: '📚', rarity: 'SS', weight: 15, levelBoost: 2 },
        { label: '帮助同学·获得好感',     icon: '🤝', rarity: 'A', weight: 25, levelBoost: 1 },
        { label: '食堂遇到唐三和小舞',   icon: '🍜', rarity: 'S', weight: 20, levelBoost: 1, worldImpact: { tangSan: { met: true, affinity: 5 }, xiaoWu: { met: true, affinity: 5 } } },
        { label: '普通的日常·按部就班', icon: '📋', rarity: 'B', weight: 25 },
        { label: '偷懒被发现·被罚跑操场', icon: '🏃', rarity: 'C', weight: 15 },
      ]
    },
  },
  {
    id: 'bridge_toShrek', title: '🌉 前往史莱克', icon: '🚶', minLevel: 22, maxLevel: 38, rarity: 'A',
    prelude: '离开诺丁学院后，你踏上了前往史莱克学院的道路。沿途的风景在变化，你的心境也在变化——从一个学院的学生，到即将面对一个全新世界的魂师。命运之轮，请转动——',
    computeOptions(state) {
      return [
        { label: '路遇劫匪·英雄救美',   icon: '🦸', rarity: 'SS', weight: 15, levelBoost: 3 },
        { label: '与同行旅人结为好友',   icon: '🤝', rarity: 'S', weight: 25, levelBoost: 2 },
        { label: '在途中突破一个小瓶颈', icon: '📈', rarity: 'A', weight: 28, levelBoost: 2 },
        { label: '平凡的旅途·安全抵达', icon: '🚶', rarity: 'B', weight: 22, levelBoost: 1 },
        { label: '迷路了·绕了远路',     icon: '🧭', rarity: 'C', weight: 10 },
      ]
    },
  },
  {
    id: 'bridge_afterTournament', title: '🌉 大赛余波', icon: '🌊', minLevel: 45, maxLevel: 60, rarity: 'A',
    requiredEvents: ['arc_tournament_1'],
    prelude: '精英赛的喧嚣渐渐远去。你在武魂城中漫步，回想着这段时间的经历——战斗、友谊、荣耀……以及那些在比赛中结下的仇怨。命运之轮，请转动——',
    computeOptions(state) {
      return [
        { label: '被神秘势力暗中监视',   icon: '👁️', rarity: 'SS', weight: 15, levelBoost: 2, unlocks: ['huntStarted'] },
        { label: '收到匿名挑战信',       icon: '✉️', rarity: 'S', weight: 22, levelBoost: 3 },
        { label: '在武魂城采购稀有材料', icon: '🛒', rarity: 'A', weight: 28, levelBoost: 1 },
        { label: '被粉丝围堵·签名到手软', icon: '✍️', rarity: 'B', weight: 20 },
        { label: '卷入一场街头纠纷',     icon: '👊', rarity: 'C', weight: 15, levelBoost: 1 },
      ]
    },
  },
  {
    id: 'bridge_beforeVoyage', title: '🌉 远航之前', icon: '⚓', minLevel: 58, maxLevel: 75, rarity: 'A',
    prelude: '海风渐起。你站在天斗帝国的港口，望着远方若隐若现的海平线。去海神岛的船明天出发——今晚，是你在陆地上的最后一夜。命运之轮，请转动——',
    computeOptions(state) {
      return [
        { label: '与朋友们告别·收获祝福', icon: '👋', rarity: 'SS', weight: 20, levelBoost: 2, worldImpact: { tangSan: { affinity: 10 } } },
        { label: '采购航海物资·准备充分', icon: '🎒', rarity: 'A', weight: 28, levelBoost: 1 },
        { label: '向老水手请教航海知识',   icon: '🧭', rarity: 'S', weight: 22, levelBoost: 2 },
        { label: '在港口酒吧听到海神传说', icon: '🍺', rarity: 'B', weight: 20, levelBoost: 1 },
        { label: '被小偷光顾·损失了一些钱财', icon: '😤', rarity: 'C', weight: 10 },
      ]
    },
  },
  {
    id: 'chain_shrek_1', title: '🔗 七怪试炼·集结', icon: '👥', minLevel: 30, maxLevel: 55, rarity: 'SS',
    prelude: '弗兰德院长站在操场上宣布——史莱克七怪将进行一场特殊的团队试炼。而这一次，你也被邀请参加。"这将决定你们是否有资格代表学院参加全大陆精英赛。"命运之轮，请转动——',
    computeOptions(state) {
      return [
        { label: '完美配合·团队评价SSS！！', icon: '🌟', rarity: 'SSS', weight: 12, levelBoost: 5, unlocks: ['chain_shrek_2'] },
        { label: '顺利通过·获得团队认可',   icon: '✅', rarity: 'SS', weight: 28, levelBoost: 3, unlocks: ['chain_shrek_2'] },
        { label: '勉强过关·但学到了配合',   icon: '🤝', rarity: 'A', weight: 30, levelBoost: 2, unlocks: ['chain_shrek_2'] },
        { label: '表现不佳·但积累了经验',   icon: '📈', rarity: 'B', weight: 20, levelBoost: 1 },
        { label: '拖了团队后腿·被批评',     icon: '😔', rarity: 'C', weight: 10 },
      ]
    },
  },
  {
    id: 'chain_shrek_2', title: '🔗 七怪试炼·默契', icon: '🤝', minLevel: 35, maxLevel: 58, rarity: 'SS',
    requiredEvents: ['chain_shrek_1'],
    prelude: '试炼第二阶段——你被分到了和唐三、小舞一队，对抗戴沐白、朱竹清和马红俊的组合。3v3！这需要极高的默契。命运之轮，请转动——',
    computeOptions(state) {
      return [
        { label: '完美默契·碾压对手！！',   icon: '⚡', rarity: 'SSS', weight: 12, levelBoost: 5, unlocks: ['chain_shrek_3'], worldImpact: { tangSan: { affinity: 15 }, xiaoWu: { affinity: 15 } } },
        { label: '激烈对抗·最终险胜',       icon: '⚔️', rarity: 'SS', weight: 25, levelBoost: 4, unlocks: ['chain_shrek_3'] },
        { label: '精彩对决·虽败犹荣',       icon: '🤝', rarity: 'S', weight: 30, levelBoost: 3, unlocks: ['chain_shrek_3'] },
        { label: '配合失误·但队友不怪你',   icon: '😅', rarity: 'A', weight: 23, levelBoost: 2 },
        { label: '被完败·但有收获',         icon: '💪', rarity: 'B', weight: 10, levelBoost: 1 },
      ]
    },
  },
  {
    id: 'chain_shrek_3', title: '🔗 七怪试炼·羁绊', icon: '🌟', minLevel: 40, maxLevel: 62, rarity: 'SSS', enemyPower: 3000,
    requiredEvents: ['chain_shrek_2'],
    prelude: '最终试炼——七怪将面对一位真正的封号斗罗！弗兰德院长请来了赵无极。这将是一场不可能赢的战斗——但七怪从不退缩。"一起上！"命运之轮，请转动——',
    computeOptions(state) {
      const base = [
        { label: '七怪同心·逼退封号斗罗！！', icon: '🏆', rarity: 'SSS', weight: 15, levelBoost: 8, worldImpact: { tangSan: { affinity: 25 }, xiaoWu: { affinity: 20 }, daiMuBai: { affinity: 20 }, oscar: { affinity: 15 }, maHongJun: { affinity: 15 }, ningRongRong: { affinity: 15 }, zhuZhuQing: { affinity: 15 } } },
        { label: '坚持到底·虽败犹荣',         icon: '💪', rarity: 'SS', weight: 30, levelBoost: 5, worldImpact: { tangSan: { affinity: 10 } } },
        { label: '用智慧找到破绽·取得先机',   icon: '🧠', rarity: 'S', weight: 25, levelBoost: 4 },
        { label: '被秒杀·但七怪保护了你',     icon: '🛡️', rarity: 'A', weight: 20, levelBoost: 3 },
        { label: '退缩了·自责不已',           icon: '😔', rarity: 'B', weight: 10, levelBoost: 2 },
      ]
      return adjustCombatWeights(base, state.combatPower || state.level * 10, 3000)
    },
  },

  // ==================== 剧情链2：武魂殿暗流（Lv.40-60） ====================
  {
    id: 'chain_wuhun_1', title: '🔗 武魂殿暗流·密信', icon: '✉️', minLevel: 40, maxLevel: 62, rarity: 'SS',
    prelude: '你截获了一封武魂殿的密信——信中提到了一个代号为"净化"的秘密计划。如果这个计划成功，将会有成千上万的魂师被清除。命运之轮，请转动——',
    computeOptions(state) {
      return [
        { label: '深入调查·揭开冰山一角', icon: '🔍', rarity: 'SSS', weight: 15, levelBoost: 4, unlocks: ['chain_wuhun_2'] },
        { label: '将密信交给可靠的人',     icon: '📨', rarity: 'SS', weight: 25, levelBoost: 3, unlocks: ['chain_wuhun_2'] },
        { label: '暗中追踪·收集情报',     icon: '🕵️', rarity: 'S', weight: 28, levelBoost: 3, unlocks: ['chain_wuhun_2'] },
        { label: '不关我事·扔掉了密信',   icon: '🗑️', rarity: 'B', weight: 22, levelBoost: 1 },
        { label: '交给武魂殿换取赏金',     icon: '💰', rarity: 'C', weight: 10, levelBoost: 2, worldImpact: { biBiDong: { affinity: 10 } } },
      ]
    },
  },
  {
    id: 'chain_wuhun_2', title: '🔗 武魂殿暗流·潜入', icon: '🏚️', minLevel: 45, maxLevel: 68, rarity: 'SSS', enemyPower: 3500,
    requiredEvents: ['chain_wuhun_1'],
    prelude: '你需要潜入武魂殿的一处秘密据点获取更多情报。守卫森严，一步走错就是万劫不复。但为了真相——你决定冒险。命运之轮，请转动——',
    computeOptions(state) {
      const base = [
        { label: '完美潜入·获得核心情报！！', icon: '🎯', rarity: 'SSS', weight: 10, levelBoost: 6, unlocks: ['chain_wuhun_3'] },
        { label: '成功潜入·获得重要情报',     icon: '📄', rarity: 'SS', weight: 22, levelBoost: 4, unlocks: ['chain_wuhun_3'] },
        { label: '被发觉·但成功逃脱',         icon: '🏃', rarity: 'S', weight: 25, levelBoost: 3, unlocks: ['chain_wuhun_3'] },
        { label: '差点被抓·只拿到碎片情报',   icon: '😰', rarity: 'A', weight: 25, levelBoost: 2 },
        { label: '被俘·但被神秘人救出',       icon: '🦸', rarity: 'B', weight: 18, levelBoost: 3 },
      ]
      return adjustCombatWeights(base, state.combatPower || state.level * 10, 3500)
    },
  },
  {
    id: 'chain_wuhun_3', title: '🔗 武魂殿暗流·揭露', icon: '📢', minLevel: 50, maxLevel: 72, rarity: 'SSS',
    requiredEvents: ['chain_wuhun_2'],
    prelude: '你已经掌握了足够的情报。"净化"计划的真相令人发指——比比东打算利用猎魂行动清除所有不服从武魂殿的魂师。你必须做出选择。命运之轮，请转动——',
    computeOptions(state) {
      return [
        { label: '公开揭露·阻止计划！！', icon: '📢', rarity: 'SSS', weight: 15, levelBoost: 8, worldImpact: { biBiDong: { affinity: -80, faction: 'enemy' } } },
        { label: '暗中破坏·从内部瓦解',   icon: '🕸️', rarity: 'SS', weight: 25, levelBoost: 5, worldImpact: { biBiDong: { affinity: -30 } } },
        { label: '联合各方·共同对抗',     icon: '🤝', rarity: 'S', weight: 30, levelBoost: 4, worldImpact: { biBiDong: { affinity: -40 } } },
        { label: '保存证据·等待时机',     icon: '📦', rarity: 'A', weight: 20, levelBoost: 2 },
        { label: '太危险了·选择沉默',     icon: '🤫', rarity: 'B', weight: 10, levelBoost: 1 },
      ]
    },
  },

  // ==================== 剧情链3：冰火传承（Lv.35-55） ====================
  {
    id: 'chain_icefire_1', title: '🔗 冰火传承·药圃危机', icon: '🌡️', minLevel: 35, maxLevel: 55, rarity: 'SS',
    requiredEvents: ['iceFireWell'],
    prelude: '独孤博的冰火两仪眼药圃遭到了不明魂兽的入侵！他最珍贵的几株仙草被啃食殆尽。独孤博暴怒——"小子，帮老夫找出那头畜生！"命运之轮，请转动——',
    computeOptions(state) {
      return [
        { label: '追踪到凶手·是万年钻地龙', icon: '🐉', rarity: 'SS', weight: 20, levelBoost: 4, unlocks: ['chain_icefire_2'] },
        { label: '设陷阱捕获·获得兽骨',     icon: '🪤', rarity: 'S', weight: 25, levelBoost: 3, unlocks: ['chain_icefire_2'], soulBone: { slot: 'leftLeg', beast: '万年钻地龙', year: 50000, skill: '钻地突袭', rarity: 'S' } },
        { label: '发现是人为破坏的痕迹',     icon: '🔍', rarity: 'SSS', weight: 12, levelBoost: 4, unlocks: ['chain_icefire_2'] },
        { label: '没找到·独孤博自己解决了', icon: '🤷', rarity: 'B', weight: 28, levelBoost: 1 },
        { label: '魂兽太强·受了重伤',       icon: '🤕', rarity: 'C', weight: 15, levelBoost: 2 },
      ]
    },
  },
  {
    id: 'chain_icefire_2', title: '🔗 冰火传承·幕后黑手', icon: '🕵️', minLevel: 40, maxLevel: 60, rarity: 'SSS',
    requiredEvents: ['chain_icefire_1'],
    prelude: '调查发现——破坏药圃的不是魂兽，而是武魂殿的人！他们想削弱独孤博的实力，逼他交出冰火两仪眼的控制权。独孤博脸色铁青。命运之轮，请转动——',
    computeOptions(state) {
      return [
        { label: '与独孤博联手·反击武魂殿', icon: '⚔️', rarity: 'SSS', weight: 15, levelBoost: 5, unlocks: ['chain_icefire_3'], worldImpact: { duGuBo: { affinity: 40 } } },
        { label: '设计陷阱·反制武魂殿',     icon: '🪤', rarity: 'SS', weight: 25, levelBoost: 4, unlocks: ['chain_icefire_3'], worldImpact: { duGuBo: { affinity: 20 } } },
        { label: '劝独孤博暂避锋芒',         icon: '🤫', rarity: 'S', weight: 28, levelBoost: 3, unlocks: ['chain_icefire_3'] },
        { label: '不参与·独孤博自己处理',   icon: '🙅', rarity: 'B', weight: 22, levelBoost: 1 },
        { label: '把情报卖给武魂殿',         icon: '💰', rarity: 'C', weight: 10, worldImpact: { duGuBo: { affinity: -50 }, biBiDong: { affinity: 15 } } },
      ]
    },
  },
  {
    id: 'chain_icefire_3', title: '🔗 冰火传承·毒丹传承', icon: '💊', minLevel: 45, maxLevel: 65, rarity: 'SSS',
    requiredEvents: ['chain_icefire_2'],
    prelude: '独孤博在战斗中受了重伤——他的本命毒丹彻底碎裂了。临终前，他将你叫到床前。"老夫一生没有传人。这冰火两仪眼……还有我的毒丹心得……就交给你了。"命运之轮，请转动——',
    computeOptions(state) {
      return [
        { label: '接受传承·继承冰火两仪眼！！', icon: '🌿', rarity: 'SSS', weight: 20, levelBoost: 10, worldImpact: { duGuBo: { affinity: 80, legacy: true } } },
        { label: '接受毒丹心得·获得毒系能力',   icon: '🧪', rarity: 'SS', weight: 30, levelBoost: 7, worldImpact: { duGuBo: { affinity: 40 } } },
        { label: '用仙草救回独孤博·他活了下来', icon: '💚', rarity: 'SSS', weight: 15, levelBoost: 5, worldImpact: { duGuBo: { affinity: 100, alive: true } } },
        { label: '婉拒·这份传承太重了',         icon: '🙏', rarity: 'S', weight: 20, levelBoost: 3, worldImpact: { duGuBo: { affinity: 20 } } },
        { label: '趁他虚弱·独吞药圃所有仙草',   icon: '😈', rarity: 'C', weight: 15, levelBoost: 8, worldImpact: { duGuBo: { affinity: -100 } } },
      ]
    },
  },

  // ==================== 剧情链4：魂兽之谜（Lv.25-50） ====================
  {
    id: 'chain_beast_1', title: '🔗 魂兽之谜·远古咆哮', icon: '🐉', minLevel: 25, maxLevel: 50, rarity: 'SS',
    requiredEvents: ['enterForest'],
    prelude: '星斗大森林深处传来了一声惊天动地的咆哮——那是天青牛蟒的声音！它在呼唤什么？小舞的脸色突然变得苍白。"糟了……它遇到了麻烦。"命运之轮，请转动——',
    computeOptions(state) {
      return [
        { label: '和小舞一起深入调查',       icon: '🏃', rarity: 'SSS', weight: 15, levelBoost: 4, unlocks: ['chain_beast_2'], worldImpact: { xiaoWu: { affinity: 15 } } },
        { label: '独自前往·让她留下',       icon: '🧍', rarity: 'SS', weight: 20, levelBoost: 3, unlocks: ['chain_beast_2'] },
        { label: '召集其他人一起去',         icon: '📢', rarity: 'S', weight: 28, levelBoost: 2, unlocks: ['chain_beast_2'] },
        { label: '太危险·还是不去',         icon: '🙅', rarity: 'B', weight: 25, levelBoost: 1 },
        { label: '趁乱猎取魂兽·获取魂环',   icon: '⚔️', rarity: 'C', weight: 12, levelBoost: 3, soulRing: { year: 10000, colorName: '万年', colorHex: '#212121', beast: '万年魂兽', skill: '兽魂之力' } },
      ]
    },
  },
  {
    id: 'chain_beast_2', title: '🔗 魂兽之谜·守护者', icon: '🐂', minLevel: 30, maxLevel: 55, rarity: 'SSS',
    requiredEvents: ['chain_beast_1'],
    prelude: '你终于见到了天青牛蟒——星斗大森林的守护者之一。它受了重伤。在它身边，泰坦巨猿正在用魂力维持着它的生命。"人类……我们需要你的帮助。"命运之轮，请转动——',
    computeOptions(state) {
      return [
        { label: '帮助治疗·获得守护者的信任', icon: '💚', rarity: 'SSS', weight: 15, levelBoost: 6, unlocks: ['chain_beast_3'], worldImpact: { xiaoWu: { affinity: 30 } } },
        { label: '寻找草药·帮助恢复',         icon: '🌿', rarity: 'SS', weight: 28, levelBoost: 4, unlocks: ['chain_beast_3'] },
        { label: '守护它们·抵挡武魂殿追兵',   icon: '🛡️', rarity: 'S', weight: 25, levelBoost: 5, unlocks: ['chain_beast_3'] },
        { label: '趁机获取魂环·被小舞阻止',   icon: '😔', rarity: 'B', weight: 20, levelBoost: 2, worldImpact: { xiaoWu: { affinity: -20 } } },
        { label: '通知武魂殿·这里有十万年魂兽', icon: '📢', rarity: 'C', weight: 12, levelBoost: 3, worldImpact: { xiaoWu: { affinity: -80 } } },
      ]
    },
  },
  {
    id: 'chain_beast_3', title: '🔗 魂兽之谜·真相', icon: '🔮', minLevel: 35, maxLevel: 60, rarity: 'SSS',
    requiredEvents: ['chain_beast_2'],
    prelude: '天青牛蟒恢复后，告诉了你一个千古秘密——远古时期，魂兽和人类曾经和平共处。直到一位人类神祇背叛了契约，引发了持续万年的战争。而武魂殿的猎魂行动，是为了收集魂兽的力量复活那位邪神！命运之轮，请转动——',
    computeOptions(state) {
      return [
        { label: '发誓守护这个秘密·阻止邪神复活', icon: '🤞', rarity: 'SSS', weight: 20, levelBoost: 8, worldImpact: { xiaoWu: { affinity: 40 } } },
        { label: '将真相告诉唐三·联合对抗',       icon: '🤝', rarity: 'SS', weight: 30, levelBoost: 5, worldImpact: { tangSan: { affinity: 20 }, xiaoWu: { affinity: 15 } } },
        { label: '决定调查邪神复活的线索',         icon: '🔍', rarity: 'S', weight: 25, levelBoost: 4 },
        { label: '半信半疑·但愿意帮忙',           icon: '🤔', rarity: 'A', weight: 15, levelBoost: 2 },
        { label: '把秘密告诉武魂殿·但他们不信',   icon: '🤷', rarity: 'B', weight: 10, levelBoost: 1 },
      ]
    },
  },

  // ==================== 剧情链5：神位觉醒（Lv.60-95） ====================
  {
    id: 'chain_god_1', title: '🔗 神位觉醒·模糊感应', icon: '🌫️', minLevel: 60, maxLevel: 80, rarity: 'SS',
    prelude: '你开始做奇怪的梦——梦中你站在云端，下方是整个斗罗大陆。一个声音在呼唤你，但隔着一层迷雾，你始终听不清它在说什么。这绝不是普通的梦。命运之轮，请转动——',
    computeOptions(state) {
      return [
        { label: '主动追寻梦中的声音',       icon: '🔮', rarity: 'SSS', weight: 15, levelBoost: 4, unlocks: ['chain_god_2'] },
        { label: '向大师请教梦的含义',       icon: '📖', rarity: 'SS', weight: 25, levelBoost: 3, unlocks: ['chain_god_2'] },
        { label: '在修炼中感应到神力波动',   icon: '🌀', rarity: 'S', weight: 28, levelBoost: 3, unlocks: ['chain_god_2'] },
        { label: '忽视它·继续修炼',         icon: '🙅', rarity: 'B', weight: 22, levelBoost: 1 },
        { label: '噩梦连连·魂力紊乱',       icon: '😰', rarity: 'C', weight: 10, levelBoost: 2 },
      ]
    },
  },
  {
    id: 'chain_god_2', title: '🔗 神位觉醒·考验降临', icon: '⚡', minLevel: 68, maxLevel: 88, rarity: 'SSS',
    requiredEvents: ['chain_god_1'],
    prelude: '一道神光从天而降——神的考验正式降临在你身上！这不是魂师的战斗，而是意志与灵魂的较量。你必须在神之领域中证明自己。命运之轮，请转动——',
    computeOptions(state) {
      return [
        { label: '通过考验·神位清晰显现！！', icon: '🌟', rarity: 'SSS', weight: 15, levelBoost: 8, unlocks: ['chain_god_3'] },
        { label: '通过考验·但神位模糊',       icon: '🌫️', rarity: 'SS', weight: 25, levelBoost: 5, unlocks: ['chain_god_3'] },
        { label: '在考验中顿悟·境界提升',     icon: '💡', rarity: 'S', weight: 30, levelBoost: 6, unlocks: ['chain_god_3'] },
        { label: '考验失败·但获得神界祝福',   icon: '🙏', rarity: 'A', weight: 20, levelBoost: 3 },
        { label: '被神威所伤·但未放弃',       icon: '🤕', rarity: 'B', weight: 10, levelBoost: 2 },
      ]
    },
  },
  {
    id: 'chain_god_3', title: '🔗 神位觉醒·神之抉择', icon: '🔱', minLevel: 80, maxLevel: 98, rarity: 'SSS',
    requiredEvents: ['chain_god_2'],
    prelude: '神界诸神齐聚于你面前——每一位都向你伸出了手。海神、修罗神、天使神、火神……你只能选择一位。每一个选择都意味着完全不同的神位与命运。命运之轮，请转动——',
    computeOptions(state) {
      return [
        { label: '选择海神·守护海洋与生命',   icon: '🌊', rarity: 'SSS', weight: 15, levelBoost: 10 },
        { label: '选择修罗神·执掌杀戮与审判', icon: '⚔️', rarity: 'SSS', weight: 15, levelBoost: 10 },
        { label: '自创神位·开辟全新道路！！', icon: '💫', rarity: 'SSS', weight: 10, levelBoost: 12 },
        { label: '选择火神·焚尽世间邪恶',     icon: '🔥', rarity: 'SS', weight: 20, levelBoost: 7 },
        { label: '选择风神·自由翱翔天际',     icon: '💨', rarity: 'SS', weight: 18, levelBoost: 6 },
        { label: '无法抉择·请求更多时间',     icon: '🤔', rarity: 'A', weight: 12, levelBoost: 3 },
        { label: '拒绝所有·以凡人之躯比肩神明', icon: '💪', rarity: 'S', weight: 10, levelBoost: 5 },
      ]
    },
  },
  {
    id: 'interact_tangSanNight', title: '🌙 月光下的唐三', icon: '🌿', minLevel: 10, maxLevel: 100, rarity: 'A',
    prelude: '夜深了，你却看到一个人影在月光下做着奇怪的动作——是唐三。他在修炼一种你从未见过的功法。他注意到了你……命运之轮，请转动——',
    computeOptions(state) {
      return [
        { label: '静静观看·被唐三发现后交流', icon: '👀', rarity: 'SS', weight: 20, levelBoost: 2, worldImpact: { tangSan: { met: true, affinity: 15 } } },
        { label: '上前请教·唐三演示玄天功',   icon: '🙋', rarity: 'SSS', weight: 15, levelBoost: 3, worldImpact: { tangSan: { met: true, affinity: 25 } } },
        { label: '和他一起修炼·受益匪浅',     icon: '🧘', rarity: 'S', weight: 25, levelBoost: 2, worldImpact: { tangSan: { met: true, affinity: 20 } } },
        { label: '假装没看见·转身离开',       icon: '🚶', rarity: 'B', weight: 30, levelBoost: 1 },
        { label: '想偷学但被发现了',           icon: '😅', rarity: 'C', weight: 10, worldImpact: { tangSan: { met: true, affinity: -5 } } },
      ]
    },
  },
  {
    id: 'interact_xiaoWuCarrot', title: '🥕 小舞的胡萝卜', icon: '🐰', minLevel: 10, maxLevel: 100, rarity: 'A',
    prelude: '小舞手里捧着一堆胡萝卜，看到你后眼睛一亮："喂！你要不要来一根？这可是星斗大森林里最好吃的胡萝卜！"她边说边递了一根过来……命运之轮，请转动——',
    computeOptions(state) {
      return [
        { label: '欣然接受·聊起星斗大森林', icon: '🥕', rarity: 'SS', weight: 20, levelBoost: 2, worldImpact: { xiaoWu: { met: true, affinity: 15 } } },
        { label: '问她关于魂兽的知识',       icon: '💬', rarity: 'SSS', weight: 15, levelBoost: 3, worldImpact: { xiaoWu: { met: true, affinity: 20 } } },
        { label: '分享自己的食物·互赠礼物', icon: '🎁', rarity: 'S', weight: 25, levelBoost: 2, worldImpact: { xiaoWu: { met: true, affinity: 25 } } },
        { label: '婉拒·不饿',               icon: '🙂', rarity: 'B', weight: 30, levelBoost: 1 },
        { label: '怀疑胡萝卜有问题',         icon: '🤨', rarity: 'C', weight: 10, worldImpact: { xiaoWu: { met: true, affinity: -5 } } },
      ]
    },
  },
  {
    id: 'interact_masterTest', title: '📝 大师的测试', icon: '📖', minLevel: 12, maxLevel: 100, rarity: 'S',
    prelude: '玉小刚——大师——拿着一本厚厚的笔记找到了你。"我观察你很久了。你的魂环配置……很有意思。愿意配合我做一个小测试吗？"命运之轮，请转动——',
    computeOptions(state) {
      return [
        { label: '全力配合·大师大为赞赏',   icon: '✅', rarity: 'SSS', weight: 15, levelBoost: 3, worldImpact: { yuXiaoGang: { met: true, affinity: 30 } } },
        { label: '配合测试·获得修炼建议',   icon: '📊', rarity: 'SS', weight: 25, levelBoost: 2, worldImpact: { yuXiaoGang: { met: true, affinity: 15 } } },
        { label: '质疑他的理论·引发辩论',   icon: '💬', rarity: 'S', weight: 22, levelBoost: 2, worldImpact: { yuXiaoGang: { met: true, affinity: 10 } } },
        { label: '婉拒·不想当实验品',       icon: '🙅', rarity: 'B', weight: 28, levelBoost: 1 },
        { label: '故意给出错误数据',         icon: '😏', rarity: 'C', weight: 10, worldImpact: { yuXiaoGang: { met: true, affinity: -10 } } },
      ]
    },
  },
  {
    id: 'interact_daiChallenge', title: '👊 戴沐白的挑战', icon: '🦁', minLevel: 22, maxLevel: 100, rarity: 'A', isMilestone: true,
    prelude: '戴沐白走了过来，眼中闪烁着战意："听说你最近进步很大。怎么样，和我切磋一场？点到为止。"他露出虎牙笑了起来。命运之轮，请转动——',
    computeOptions(state) {
      return [
        { label: '正面应战·打出精彩对决', icon: '⚔️', rarity: 'SSS', weight: 12, levelBoost: 4, worldImpact: { daiMuBai: { met: true, affinity: 25 } } },
        { label: '接受切磋·互相学习',       icon: '🤝', rarity: 'SS', weight: 22, levelBoost: 3, worldImpact: { daiMuBai: { met: true, affinity: 15 } } },
        { label: '以智取胜·不硬拼',         icon: '🧠', rarity: 'S', weight: 25, levelBoost: 2, worldImpact: { daiMuBai: { met: true, affinity: 10 } } },
        { label: '认输·实力差距太大',       icon: '🏳️', rarity: 'B', weight: 25, levelBoost: 1 },
        { label: '偷袭取胜·但戴沐白不悦',   icon: '👊', rarity: 'C', weight: 16, worldImpact: { daiMuBai: { met: true, affinity: -10 } } },
      ]
    },
  },
  {
    id: 'interact_rongHelp', title: '💎 宁荣荣的求助', icon: '🏯', minLevel: 18, maxLevel: 100, rarity: 'A',
    prelude: '宁荣荣拿着一张小纸条，上面列满了稀奇古怪的材料名称。"这些都是辅助修炼需要的……我一个人实在采集不完。你能不能帮帮我？"命运之轮，请转动——',
    computeOptions(state) {
      return [
        { label: '帮她找齐材料·收获友谊',   icon: '🤝', rarity: 'SSS', weight: 15, levelBoost: 3, worldImpact: { ningRongRong: { met: true, affinity: 25 } } },
        { label: '帮她一半·各自忙碌',       icon: '🤲', rarity: 'S', weight: 25, levelBoost: 2, worldImpact: { ningRongRong: { met: true, affinity: 10 } } },
        { label: '建议她找其他人帮忙',       icon: '💡', rarity: 'A', weight: 28, levelBoost: 1 },
        { label: '自己忙·没时间',           icon: '⏰', rarity: 'B', weight: 22 },
        { label: '偷偷藏起最珍贵的材料',     icon: '🫣', rarity: 'C', weight: 10, worldImpact: { ningRongRong: { met: true, affinity: -15 } } },
      ]
    },
  },
  {
    id: 'interact_oscarSnack', title: '🌭 奥斯卡的香肠', icon: '🍖', minLevel: 20, maxLevel: 100, rarity: 'B',
    prelude: '"老兄！来一根恢复大香肠！"奥斯卡举着一根冒着热气的香肠向你推销，"吃了我奥斯卡的香肠，保证你立刻满血复活！"命运之轮，请转动——',
    computeOptions(state) {
      return [
        { label: '吃下·魂力真的恢复了！',   icon: '✨', rarity: 'SS', weight: 20, levelBoost: 2, worldImpact: { oscar: { met: true, affinity: 15 } } },
        { label: '买几根留着以后用',         icon: '🛒', rarity: 'S', weight: 22, levelBoost: 1, worldImpact: { oscar: { met: true, affinity: 20 } } },
        { label: '对他的武魂表示好奇并交流', icon: '💬', rarity: 'SSS', weight: 12, levelBoost: 3, worldImpact: { oscar: { met: true, affinity: 25 } } },
        { label: '拒绝·不饿',               icon: '🙅', rarity: 'B', weight: 30 },
        { label: '嘲笑食物系武魂没用',       icon: '😤', rarity: 'C', weight: 16, worldImpact: { oscar: { met: true, affinity: -20 } } },
      ]
    },
  },
  {
    id: 'interact_fattyPhoenix', title: '🔥 马红俊的烦恼', icon: '🐦', minLevel: 24, maxLevel: 100, rarity: 'B',
    prelude: '马红俊一脸郁闷地坐在石头上——他的邪火又压不住了。"兄弟……帮我想想办法。这邪火再压不住，我就要自燃了。"命运之轮，请转动——',
    computeOptions(state) {
      return [
        { label: '用冰系力量帮他镇压邪火',   icon: '❄️', rarity: 'SSS', weight: 12, levelBoost: 3, worldImpact: { maHongJun: { met: true, affinity: 30 } } },
        { label: '陪他去找大师想办法',       icon: '🏃', rarity: 'SS', weight: 20, levelBoost: 2, worldImpact: { maHongJun: { met: true, affinity: 15 } } },
        { label: '建议他发泄出去·陪练',     icon: '⚔️', rarity: 'S', weight: 25, levelBoost: 2, worldImpact: { maHongJun: { met: true, affinity: 20 } } },
        { label: '没办法·无能为力',         icon: '🤷', rarity: 'B', weight: 28 },
        { label: '远远躲开·怕被波及',       icon: '🏃', rarity: 'C', weight: 15 },
      ]
    },
  },
  {
    id: 'interact_zhuTraining', title: '🐱 朱竹清的特训', icon: '💨', minLevel: 30, maxLevel: 100, rarity: 'A',
    prelude: '朱竹清在树林中独自训练——她的速度已经快到你几乎看不清她的身影。她停下来看了你一眼："想一起练吗？速度方面，我有一些心得。"命运之轮，请转动——',
    computeOptions(state) {
      return [
        { label: '一起修炼·速度大幅提升',  icon: '💨', rarity: 'SSS', weight: 15, levelBoost: 4, worldImpact: { zhuZhuQing: { met: true, affinity: 20 } } },
        { label: '请教她的敏攻技巧',        icon: '🙋', rarity: 'SS', weight: 25, levelBoost: 2, worldImpact: { zhuZhuQing: { met: true, affinity: 15 } } },
        { label: '互相切磋·各有所获',      icon: '⚔️', rarity: 'S', weight: 28, levelBoost: 3, worldImpact: { zhuZhuQing: { met: true, affinity: 10 } } },
        { label: '跟不上她的速度·放弃',    icon: '😰', rarity: 'B', weight: 22, levelBoost: 1 },
        { label: '觉得她太冷淡·不愿交流',  icon: '🥶', rarity: 'C', weight: 10 },
      ]
    },
  },
  {
    id: 'interact_liuErLong', title: '🐉 柳二龙的怒火', icon: '🔥', minLevel: 35, maxLevel: 60, rarity: 'S',
    prelude: '柳二龙——蓝电霸王龙家族的强者——正在大发雷霆。她刚刚发现有人在偷她的龙芝草！她瞪着你："是不是你？！"命运之轮，请转动——',
    computeOptions(state) {
      return [
        { label: '冷静解释·帮她抓到真凶',   icon: '🧠', rarity: 'SSS', weight: 12, levelBoost: 4, worldImpact: { liuErLong: { met: true, affinity: 30 } } },
        { label: '自证清白·提供线索',       icon: '🔍', rarity: 'SS', weight: 22, levelBoost: 3, worldImpact: { liuErLong: { met: true, affinity: 15 } } },
        { label: '和她一起追查小偷',         icon: '🏃', rarity: 'S', weight: 28, levelBoost: 2, worldImpact: { liuErLong: { met: true, affinity: 20 } } },
        { label: '被误会·争吵后离开',       icon: '😤', rarity: 'B', weight: 23, worldImpact: { liuErLong: { met: true, affinity: -10 } } },
        { label: '真的偷了一株龙芝草',       icon: '🌿', rarity: 'C', weight: 15, levelBoost: 3, worldImpact: { liuErLong: { met: true, affinity: -30 } } },
      ]
    },
  },
  {
    id: 'interact_qianRenXue', title: '👼 神秘的金发女子', icon: '✨', minLevel: 38, maxLevel: 100, rarity: 'SS', isMilestone: true,
    prelude: '一位金发女子站在悬崖边，背后展开着六只洁白的羽翼——天使武魂！她转过身，金色的眼眸注视着你："你……能感受到吗？神界的气息。"命运之轮，请转动——',
    computeOptions(state) {
      return [
        { label: '与她交流神位的秘密',       icon: '💬', rarity: 'SSS', weight: 12, levelBoost: 5, worldImpact: { qianRenXue: { met: true, affinity: 20 } } },
        { label: '感受到共鸣·魂力波动',     icon: '🌀', rarity: 'SS', weight: 20, levelBoost: 4, worldImpact: { qianRenXue: { met: true, affinity: 10 } } },
        { label: '警惕地保持距离',           icon: '🛡️', rarity: 'A', weight: 30, levelBoost: 2 },
        { label: '她很快飞走了·留下一片羽毛', icon: '🪶', rarity: 'S', weight: 22, levelBoost: 2, worldImpact: { qianRenXue: { met: true, affinity: 5 } } },
        { label: '攻击她·但她轻松化解',     icon: '⚔️', rarity: 'C', weight: 16, worldImpact: { qianRenXue: { met: true, affinity: -20 } } },
      ]
    },
  },

  // ==================== 原著互动：阵营事件 ====================
  {
    id: 'interact_tangAlly', title: '🤝 与唐三并肩', icon: '🌿', minLevel: 35, maxLevel: 100, rarity: 'SS', isMilestone: true,
    prelude: '唐三找到了你——武魂殿的追兵正在逼近。"我需要一个人帮我布置陷阱。你愿意和我一起战斗吗？"他的眼神坚定而信任。命运之轮，请转动——',
    computeOptions(state) {
      const tangFriend = state.relationships?.tangSan?.faction === 'friend'
      if (!tangFriend) return [{ label: '你还不是唐三的战友', icon: '❓', rarity: 'C', weight: 100 }]
      return [
        { label: '完美配合·全歼追兵！！',   icon: '⚔️', rarity: 'SSS', weight: 20, levelBoost: 5, worldImpact: { tangSan: { affinity: 30 } } },
        { label: '成功击退·默契加深',       icon: '🤝', rarity: 'SS', weight: 30, levelBoost: 3, worldImpact: { tangSan: { affinity: 15 } } },
        { label: '唐三救了受伤的你',         icon: '🩹', rarity: 'S', weight: 25, levelBoost: 2, worldImpact: { tangSan: { affinity: 20 } } },
        { label: '战术失误·但唐三不离不弃', icon: '😔', rarity: 'A', weight: 25, levelBoost: 1, worldImpact: { tangSan: { affinity: 10 } } },
      ]
    },
  },
  {
    id: 'interact_huLienaRival', title: '🦊 胡列娜的暗斗', icon: '👁️', minLevel: 35, maxLevel: 65, rarity: 'SS',
    prelude: '胡列娜——武魂殿圣女——在阴影中注视着你。"你和我，迟早会有一战。但在此之前……我想看看你的真正实力。"命运之轮，请转动——',
    computeOptions(state) {
      const wxFriend = state.relationships?.biBiDong?.faction === 'friend'
      if (!wxFriend) return [{ label: '你不在武魂殿阵营', icon: '❓', rarity: 'C', weight: 100 }]
      return [
        { label: '展现全部实力·获得她的尊重', icon: '💪', rarity: 'SSS', weight: 15, levelBoost: 4, worldImpact: { huLiena: { met: true, affinity: 20 } } },
        { label: '隐藏实力·故意示弱',         icon: '🕶️', rarity: 'SS', weight: 25, levelBoost: 2, worldImpact: { huLiena: { met: true, affinity: 5 } } },
        { label: '提出合作·共谋大业',         icon: '🤝', rarity: 'S', weight: 28, levelBoost: 3, worldImpact: { huLiena: { met: true, affinity: 15 } } },
        { label: '婉拒切磋·不感兴趣',         icon: '🙅', rarity: 'B', weight: 22 },
        { label: '挑衅她·引发冲突',           icon: '😤', rarity: 'C', weight: 10, worldImpact: { huLiena: { met: true, affinity: -25 } } },
      ]
    },
  },

  // ==================== 原著互动：深交事件 ====================
  {
    id: 'interact_tangTrust', title: '📜 玄天宝录', icon: '📕', minLevel: 40, maxLevel: 80, rarity: 'SSS',
    prelude: '唐三犹豫了很久，终于从怀中取出一本发黄的书册——玄天宝录。"这是我唐门的至高功法。我从未给任何人看过。但你……值得我信任。"命运之轮，请转动——',
    computeOptions(state) {
      const close = (state.relationships?.tangSan?.affinity || 0) >= 20
      if (!close) return [{ label: '唐三还不够信任你', icon: '❓', rarity: 'C', weight: 100 }]
      return [
        { label: '学习玄天功·实力飞跃！！',   icon: '✨', rarity: 'SSS', weight: 25, levelBoost: 8, worldImpact: { tangSan: { affinity: 40 } } },
        { label: '学习鬼影迷踪·身法大成',     icon: '💨', rarity: 'SS', weight: 35, levelBoost: 5, worldImpact: { tangSan: { affinity: 20 } } },
        { label: '婉拒·太珍贵了不能收',       icon: '🙏', rarity: 'S', weight: 20, levelBoost: 2, worldImpact: { tangSan: { affinity: 30 } } },
        { label: '看不懂·但唐三耐心讲解',     icon: '📖', rarity: 'A', weight: 20, levelBoost: 3, worldImpact: { tangSan: { affinity: 10 } } },
      ]
    },
  },
  {
    id: 'interact_xiaoWuSecret', title: '🐰 小舞的秘密', icon: '💔', minLevel: 35, maxLevel: 100, rarity: 'SSS', isMilestone: true,
    prelude: '小舞单独找到你，眼中带着泪光。"我……我有一件事必须告诉你。我不是人类。我是十万年魂兽——柔骨兔化形。如果武魂殿知道我的真实身份，他们会不惜一切代价来抓我。"命运之轮，请转动——',
    computeOptions(state) {
      const close = (state.relationships?.xiaoWu?.affinity || 0) >= 20
      if (!close) return [{ label: '小舞还不够信任你', icon: '❓', rarity: 'C', weight: 100 }]
      return [
        { label: '发誓守护她的秘密·羁绊永固', icon: '🤞', rarity: 'SSS', weight: 30, levelBoost: 6, worldImpact: { xiaoWu: { affinity: 50 } } },
        { label: '不惊讶·早就猜到了',         icon: '😌', rarity: 'SS', weight: 25, levelBoost: 3, worldImpact: { xiaoWu: { affinity: 20 } } },
        { label: '建议她离开大陆·躲避武魂殿', icon: '⛵', rarity: 'S', weight: 20, levelBoost: 2, worldImpact: { xiaoWu: { affinity: 10 } } },
        { label: '犹豫不决·不知如何回应',     icon: '😰', rarity: 'A', weight: 15, levelBoost: 1 },
        { label: '把这个秘密告诉了别人',       icon: '😈', rarity: 'C', weight: 10, worldImpact: { xiaoWu: { affinity: -100, faction: 'enemy' } } },
      ]
    },
  },
  {
    id: 'interact_bibiTrust', title: '👸 比比东的赏识', icon: '⛪', minLevel: 50, maxLevel: 85, rarity: 'SSS',
    prelude: '比比东女皇传召你进入教皇殿的密室——这是极少有人能进入的地方。"你的表现令我印象深刻。我想给你一个特殊任务——一个只有我最信任的人才能执行的任务。"命运之轮，请转动——',
    computeOptions(state) {
      const close = (state.relationships?.biBiDong?.affinity || 0) >= 15
      if (!close) return [{ label: '比比东还不够信任你', icon: '❓', rarity: 'C', weight: 100 }]
      return [
        { label: '接受任务·成为心腹！！',     icon: '🤝', rarity: 'SSS', weight: 25, levelBoost: 7, worldImpact: { biBiDong: { affinity: 40 } } },
        { label: '接受但保持警惕',             icon: '👀', rarity: 'SS', weight: 30, levelBoost: 4, worldImpact: { biBiDong: { affinity: 15 } } },
        { label: '婉拒·不想涉足太深',         icon: '🙅', rarity: 'S', weight: 20, levelBoost: 2, worldImpact: { biBiDong: { affinity: -10 } } },
        { label: '接受后暗中破坏她的计划',     icon: '🕵️', rarity: 'A', weight: 15, levelBoost: 3, worldImpact: { biBiDong: { affinity: -50 } } },
        { label: '任务失败·被迁怒',           icon: '😰', rarity: 'C', weight: 10, worldImpact: { biBiDong: { affinity: -30 } } },
      ]
    },
  },
  {
    id: 'wx_promotion', title: '⚜️ 武魂殿晋升', icon: '⛪', minLevel: 53, maxLevel: 68, rarity: 'SS',
    requiredEvents: ['huntStarted'],
    prelude: '武魂殿内部举行晋升考核。你的表现将决定你在武魂殿中的地位——是成为核心成员，还是被边缘化？命运之轮，请转动——',
    computeOptions(state) {
      const isWx = state.relationships?.biBiDong?.faction === 'friend'
      if (!isWx) return [{ label: '你不是武魂殿成员', icon: '🚫', rarity: 'C', weight: 100 }]
      return [
        { label: '晋升为红衣主教！！', icon: '🔴', rarity: 'SSS', weight: 10, levelBoost: 6, worldImpact: { biBiDong: { affinity: 30 } } },
        { label: '成为核心成员',       icon: '⭐', rarity: 'SS', weight: 25, levelBoost: 4 },
        { label: '普通成员·稳步提升', icon: '📈', rarity: 'A', weight: 35, levelBoost: 2 },
        { label: '被排挤·但暗中学到秘术', icon: '🕵️', rarity: 'S', weight: 20, levelBoost: 3 },
        { label: '考核失败·被降职',   icon: '📉', rarity: 'C', weight: 10 },
      ]
    },
  },
  {
    id: 'wx_huntRebels', title: '⚜️ 猎杀反抗军', icon: '🎯', minLevel: 55, maxLevel: 72, rarity: 'S', enemyPower: 4000,
    requiredEvents: ['huntStarted'],
    prelude: '教皇比比东亲自下令——清剿反抗军残余势力。你被派往前线执行任务。命运之轮，请转动——',
    computeOptions(state) {
      const isWx = state.relationships?.biBiDong?.faction === 'friend'
      if (!isWx) return [{ label: '你不是武魂殿成员', icon: '🚫', rarity: 'C', weight: 100 }]
      const base = [
        { label: '大获全胜·受到比比东嘉奖', icon: '🏆', rarity: 'SSS', weight: 12, levelBoost: 5 },
        { label: '完成任务·但放走了平民',   icon: '🤫', rarity: 'SS', weight: 25, levelBoost: 3 },
        { label: '遇到旧友·陷入两难',       icon: '😰', rarity: 'S', weight: 28, levelBoost: 2 },
        { label: '任务失败·被处罚',         icon: '😔', rarity: 'B', weight: 20 },
        { label: '良心发现·暗中帮助反抗军', icon: '💚', rarity: 'A', weight: 15, levelBoost: 1, worldImpact: { biBiDong: { affinity: -30 }, tangSan: { affinity: 20 } } },
      ]
      return adjustCombatWeights(base, state.combatPower || state.level * 10, 4000)
    },
  },
  // ==================== 分支路径 Lv.51+: 反抗军路线 ====================
  {
    id: 'fs_underground', title: '🛡️ 地下反抗军', icon: '🏚️', minLevel: 53, maxLevel: 68, rarity: 'SS',
    requiredEvents: ['huntStarted'],
    prelude: '反抗军被迫转入地下。你需要建立秘密据点、招募新成员、策划反击。这是一场看不见的战争——命运之轮，请转动——',
    computeOptions(state) {
      const isFs = state.relationships?.biBiDong?.faction === 'enemy'
      if (!isFs) return [{ label: '你不是反抗军成员', icon: '🚫', rarity: 'C', weight: 100 }]
      return [
        { label: '建立地下网络·反抗军壮大！！', icon: '🕸️', rarity: 'SSS', weight: 12, levelBoost: 5, worldImpact: { tangSan: { affinity: 25 } } },
        { label: '成功招募关键人物',             icon: '🤝', rarity: 'SS', weight: 25, levelBoost: 4 },
        { label: '据点被袭·但成功转移',         icon: '🏃', rarity: 'A', weight: 30, levelBoost: 2 },
        { label: '内部出现叛徒·损失惨重',       icon: '🐍', rarity: 'B', weight: 18 },
        { label: '被武魂殿发现·被迫转移',       icon: '🚚', rarity: 'C', weight: 15 },
      ]
    },
  },
  {
    id: 'fs_assassination', title: '🛡️ 刺杀计划', icon: '🗡️', minLevel: 56, maxLevel: 74, rarity: 'SSS', enemyPower: 12000,
    requiredEvents: ['huntStarted'],
    prelude: '反抗军高层制定了一个大胆的计划——刺杀武魂殿的一名封号斗罗！这将是对武魂帝国的致命打击，但成功率不到一成。命运之轮，请转动——',
    computeOptions(state) {
      const isFs = state.relationships?.biBiDong?.faction === 'enemy'
      if (!isFs) return [{ label: '你不是反抗军成员', icon: '🚫', rarity: 'C', weight: 100 }]
      return [
        { label: '刺杀成功·武魂殿震动！！', icon: '💀', rarity: 'SSS', weight: 8, levelBoost: 8, worldImpact: { biBiDong: { affinity: -80 } } },
        { label: '重伤目标·任务完成一半',   icon: '🩸', rarity: 'SS', weight: 15, levelBoost: 5 },
        { label: '计划取消·改为智取',       icon: '🧠', rarity: 'S', weight: 28, levelBoost: 3 },
        { label: '中了埋伏·艰难逃脱',       icon: '🏃', rarity: 'A', weight: 25, levelBoost: 2 },
        { label: '行动失败·同伴牺牲',       icon: '😢', rarity: 'C', weight: 24 },
      ]
    },
  },
  {
    id: 'fs_alliance', title: '🛡️ 联军组建', icon: '🤝', minLevel: 58, maxLevel: 76, rarity: 'SS',
    requiredEvents: ['huntStarted'],
    prelude: '反抗军需要联合所有反对武魂殿的势力。七宝琉璃宗、天斗帝国残部、隐世宗门……每一个盟友都至关重要。命运之轮，请转动——',
    computeOptions(state) {
      const isFs = state.relationships?.biBiDong?.faction === 'enemy'
      if (!isFs) return [{ label: '你不是反抗军成员', icon: '🚫', rarity: 'C', weight: 100 }]
      return [
        { label: '成功联合三大势力！！', icon: '🏴', rarity: 'SSS', weight: 15, levelBoost: 6, worldImpact: { alliedForces: true } },
        { label: '说服七宝琉璃宗加盟',   icon: '💎', rarity: 'SS', weight: 25, levelBoost: 4 },
        { label: '说服天斗残部加盟',     icon: '👑', rarity: 'S', weight: 28, levelBoost: 3 },
        { label: '谈判陷入僵局',         icon: '⏸️', rarity: 'A', weight: 20, levelBoost: 1 },
        { label: '被离间·联盟破裂',     icon: '💔', rarity: 'C', weight: 12 },
      ]
    },
  },
  {
    id: 'gengxinForge', title: '庚辛城锻造', icon: '⚒️', minLevel: 52, maxLevel: 68, rarity: 'S',
    prelude: '庚辛城——金属之都！这里的铁匠能打造出足以媲美魂导器的装备。一位老铁匠看了你的武魂后眼睛一亮："你的武魂……很适合打造一件本命武器！"命运之轮，请转动——',
    computeOptions(state) {
      return [
        { label: '打造出本命神器！！', icon: '🗡️', rarity: 'SSS', weight: 5, levelBoost: 6, soulBone: { slot: 'rightArm', beast: '本命神器融合', year: 100000, skill: '神器一击', rarity: 'SSS' } },
        { label: '打造出极品魂导器',   icon: '🔮', rarity: 'SS', weight: 18, levelBoost: 4 },
        { label: '学到锻造精髓',       icon: '📖', rarity: 'A', weight: 32, levelBoost: 2 },
        { label: '材料不足·半成品',   icon: '🔩', rarity: 'B', weight: 25 },
        { label: '锻造失败·但也长了见识', icon: '💥', rarity: 'C', weight: 20 },
      ]
    },
  },
  {
    id: 'sevenClans', title: '七大宗会盟', icon: '🏳️', minLevel: 54, maxLevel: 70, rarity: 'SS',
    prelude: '七大宗门在武魂帝国的压力下决定会盟。你被邀请作为观察员出席——但会场暗流涌动，有人试图破坏会盟！命运之轮，请转动——',
    computeOptions(state) {
      return [
        { label: '揭露阴谋·促成会盟！！', icon: '🎭', rarity: 'SSS', weight: 8, levelBoost: 5, worldImpact: { sevenClans: { allied: true } } },
        { label: '保护关键人物·会盟成功', icon: '🛡️', rarity: 'SS', weight: 20, levelBoost: 4 },
        { label: '中立调停·部分成功',     icon: '⚖️', rarity: 'A', weight: 30, levelBoost: 2 },
        { label: '阴谋得逞·会盟破裂',     icon: '💔', rarity: 'B', weight: 22 },
        { label: '被卷入暗杀·受伤',       icon: '🗡️', rarity: 'C', weight: 20 },
      ]
    },
  },
  {
    id: 'tiandouCoup', title: '天斗宫变', icon: '🏰', minLevel: 56, maxLevel: 72, rarity: 'SSS', enemyPower: 7000,
    prelude: '天斗帝国皇宫内发生了政变！皇位继承人雪崩被软禁——武魂殿在背后操控一切。你恰好身在皇宫附近……命运之轮，请转动——',
    computeOptions(state) {
      const antiWuHun = state.relationships?.biBiDong?.faction === 'enemy'
      return [
        { label: '救出雪崩·挫败政变！！', icon: '👑', rarity: 'SSS', weight: antiWuHun ? 20 : 5, levelBoost: 8, worldImpact: { xueBeng: { saved: true, affinity: 50 } } },
        { label: '暗中协助保皇派',       icon: '🕵️', rarity: 'SS', weight: 18, levelBoost: 5, worldImpact: { xueBeng: { saved: true, affinity: 20 } } },
        { label: '保持中立·观望局势',   icon: '👀', rarity: 'A', weight: 28, levelBoost: 2 },
        { label: '趁乱谋取利益',         icon: '💰', rarity: 'B', weight: 24 },
        { label: '被误认为叛军·逃亡',   icon: '🏃', rarity: 'C', weight: 25 },
      ]
    },
  },
  {
    id: 'avatarTrial', title: '武魂真身试炼', icon: '🦸', minLevel: 57, maxLevel: 74, rarity: 'SS', enemyPower: 6000,
    prelude: '武魂真身是每一位魂师的里程碑！但突破武魂真身需要经历一次生死考验——你的武魂将在极限中蜕变！命运之轮，请转动——',
    computeOptions(state) {
      return [
        { label: '完美真身·武魂再度进化！！', icon: '🌟', rarity: 'SSS', weight: 5, levelBoost: 7 },
        { label: '成功突破·获得武魂真身',     icon: '💪', rarity: 'SS', weight: 22, levelBoost: 5 },
        { label: '勉强突破·真身不稳定',       icon: '⚡', rarity: 'A', weight: 30, levelBoost: 3 },
        { label: '突破失败·但魂力大增',       icon: '📈', rarity: 'B', weight: 23, levelBoost: 2 },
        { label: '走火入魔·但意外打通经脉',   icon: '🌀', rarity: 'S', weight: 20, levelBoost: 4 },
      ]
    },
  },
  {
    id: 'hiddenWeaponDev', title: '暗器研发', icon: '🔫', minLevel: 58, maxLevel: 75, rarity: 'S',
    requiredEvents: ['tangSectWeapons'],
    prelude: '唐门暗器图谱的灵感让你有了新的想法——能否将魂力与暗器结合，创造出这个时代闻所未闻的武器？命运之轮，请转动——',
    computeOptions(state) {
      return [
        { label: '研发出魂力暗器·佛怒唐莲改！！', icon: '💥', rarity: 'SSS', weight: 8, levelBoost: 7 },
        { label: '改良诸葛神弩·威力倍增',       icon: '🏹', rarity: 'SS', weight: 22, levelBoost: 5 },
        { label: '初步完成原型·潜力巨大',         icon: '🔧', rarity: 'A', weight: 30, levelBoost: 3 },
        { label: '实验失败·销毁了材料',           icon: '💣', rarity: 'B', weight: 20 },
        { label: '方向错误·但也排除了一个选项',   icon: '🚫', rarity: 'C', weight: 20 },
      ]
    },
  },

]];
