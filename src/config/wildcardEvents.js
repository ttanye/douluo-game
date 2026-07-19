// 野怪事件池 — 任何等级都可能触发的随机遭遇（15%概率）
export const WILDCARD_POOL = [
  {
    id: 'wild_injuredBeast',
    title: '受伤的魂兽',
    icon: '🩹',
    prelude: '路边草丛中传来微弱的呻吟声……一只受伤的万年魂兽倒在血泊中。它用恳求的眼神看着你。命运之轮，请转动——',
    computeOptions(state) {
      return [
        { label: '出手救治·获得感激', icon: '💚', rarity: 'SS', weight: 15, levelBoost: 3, soulRing: { year: 50000, colorName: '万年', colorHex: '#212121', beast: '感恩的万年魂兽', skill: '生命守护' } },
        { label: '趁它虚弱·获取魂环', icon: '🗡️', rarity: 'A', weight: 25, levelBoost: 2, soulRing: { year: 40000, colorName: '万年', colorHex: '#212121', beast: '万年魂兽', skill: '兽王咆哮' } },
        { label: '帮它找到主人',     icon: '🔍', rarity: 'S', weight: 20, levelBoost: 1, worldImpact: { mysteriousOwner: { met: true, affinity: 20 } } },
        { label: '远远避开·不惹麻烦', icon: '🚶', rarity: 'B', weight: 30 },
        { label: '它突然暴起攻击！',   icon: '⚡', rarity: 'C', weight: 10 },
      ]
    },
  },
  {
    id: 'wild_mysteriousLetter',
    title: '一封遗书',
    icon: '✉️',
    prelude: '一阵风吹来一张泛黄的羊皮纸，上面写着一位陨落封号斗罗的遗言和一张模糊的地图……命运之轮，请转动——',
    computeOptions(state) {
      return [
        { label: '按图索骥·找到遗物！', icon: '🗺️', rarity: 'SSS', weight: 8, levelBoost: 5, soulBone: { slot: 'torso', beast: '封号斗罗遗赠', year: 90000, skill: '不灭金身', rarity: 'SS' } },
        { label: '研究遗书·获得心得',   icon: '📖', rarity: 'S', weight: 20, levelBoost: 3 },
        { label: '卖掉地图·换取金币',   icon: '💰', rarity: 'B', weight: 30 },
        { label: '当作废纸扔掉',        icon: '🗑️', rarity: 'C', weight: 22 },
        { label: '这是陷阱！',          icon: '⚠️', rarity: 'A', weight: 20 },
      ]
    },
  },
  {
    id: 'wild_streetFight',
    title: '街头纠纷',
    icon: '👊',
    prelude: '前方传来争吵声——两个魂师为了争抢一枚魂骨碎片大打出手，围观群众越聚越多。命运之轮，请转动——',
    computeOptions(state) {
      return [
        { label: '调解纠纷·获得双方感谢', icon: '🤝', rarity: 'SS', weight: 15, levelBoost: 2, worldImpact: { randomNpc1: { met: true }, randomNpc2: { met: true } } },
        { label: '趁乱拿走魂骨碎片',      icon: '🦴', rarity: 'SSS', weight: 10, levelBoost: 3, soulBone: { slot: 'rightArm', beast: '魂骨碎片融合', year: 30000, skill: '力量爆发', rarity: 'A' } },
        { label: '帮助弱势一方',          icon: '🛡️', rarity: 'A', weight: 25, levelBoost: 1 },
        { label: '吃瓜看戏',             icon: '🍿', rarity: 'B', weight: 30 },
        { label: '被误伤·卷入其中',      icon: '🤕', rarity: 'C', weight: 20 },
      ]
    },
  },
  {
    id: 'wild_weatherMiracle',
    title: '天降异象',
    icon: '🌈',
    prelude: '天空突然裂开一道金色缝隙！整个大陆的魂师都感受到了这股异常的能量波动——似乎有神界之物坠落凡间！命运之轮，请转动——',
    computeOptions(state) {
      const lucky = state.attributes?.specialTag?.includes('天选之子')
      return [
        { label: '冲向坠落点·获得神界碎片！', icon: '💫', rarity: 'SSS', weight: lucky ? 8 : 3, levelBoost: 8 },
        { label: '远远观望·记录异象',         icon: '🔭', rarity: 'S', weight: 18, levelBoost: 3 },
        { label: '与其他魂师合作探索',         icon: '🤝', rarity: 'A', weight: 28, levelBoost: 2 },
        { label: '不敢靠近·太危险',           icon: '😰', rarity: 'B', weight: 25 },
        { label: '异象很快消失了',             icon: '🌫️', rarity: 'C', weight: 26 },
      ]
    },
  },
  {
    id: 'wild_oldMan',
    title: '神秘老人',
    icon: '🧓',
    prelude: '一个衣衫褴褛的老人在你面前摔倒了。他颤颤巍巍地伸出手："年轻人……能扶我一把吗？"你注意到他手上的戒指似乎不是凡物。命运之轮，请转动——',
    computeOptions(state) {
      return [
        { label: '诚心帮助·老人露出真面目', icon: '✨', rarity: 'SSS', weight: 12, levelBoost: 6, worldImpact: { mysteriousElder: { met: true, affinity: 40 } } },
        { label: '帮他但保持警惕',           icon: '🤨', rarity: 'A', weight: 28, levelBoost: 1 },
        { label: '无视他·继续赶路',         icon: '🚶', rarity: 'B', weight: 30 },
        { label: '怀疑是骗子·绕道走',       icon: '🕶️', rarity: 'C', weight: 20 },
        { label: '偷他的戒指！',            icon: '💍', rarity: 'S', weight: 10, levelBoost: 3 },
      ]
    },
  },
  {
    id: 'wild_treasureMap',
    title: '藏宝图',
    icon: '🗺️',
    prelude: '在茶馆歇脚时，邻桌的佣兵团正在激烈讨论一张藏宝图。其中一人看了你一眼："喂，小子，看你也是魂师，想不想一起去探宝？"命运之轮，请转动——',
    computeOptions(state) {
      return [
        { label: '加入·找到远古遗迹', icon: '🏛️', rarity: 'SSS', weight: 8, levelBoost: 5, unlocks: ['treasurePath'] },
        { label: '出价买下藏宝图',     icon: '💰', rarity: 'S', weight: 15, levelBoost: 2 },
        { label: '婉拒·独自行动更好', icon: '🙅', rarity: 'A', weight: 30 },
        { label: '佣兵团是骗子·离开', icon: '😤', rarity: 'B', weight: 25 },
        { label: '暗中跟踪他们',       icon: '🕵️', rarity: 'S', weight: 22, levelBoost: 2 },
      ]
    },
  },
  {
    id: 'wild_blackMarket',
    title: '地下黑市',
    icon: '🏚️',
    prelude: '你被一个鬼鬼祟祟的人带到了地下黑市。这里什么都有——魂骨、仙草、甚至……禁忌的功法。"只要你有钱，什么都能买到。"命运之轮，请转动——',
    computeOptions(state) {
      return [
        { label: '淘到极品魂骨！', icon: '🦴', rarity: 'SSS', weight: 6, levelBoost: 4, soulBone: { slot: 'leftLeg', beast: '黑市魂骨', year: 50000, skill: '暗影步', rarity: 'S' } },
        { label: '买到珍贵仙草',   icon: '🌿', rarity: 'SS', weight: 14, levelBoost: 3 },
        { label: '发现竟是武魂殿的眼线', icon: '⚠️', rarity: 'S', weight: 20, worldImpact: { biBiDong: { affinity: -10 } } },
        { label: '什么都没买·太贵', icon: '💸', rarity: 'B', weight: 30 },
        { label: '被坑了·买到假货', icon: '😡', rarity: 'C', weight: 30 },
      ]
    },
  },
  {
    id: 'wild_ghostBeast',
    title: '幽灵魂兽',
    icon: '👻',
    prelude: '深夜，一道半透明的兽影从你面前掠过！这是一种罕见的幽灵魂兽——它们没有实体，但魂环品质极高。捕捉它需要特殊的手段……命运之轮，请转动——',
    computeOptions(state) {
      return [
        { label: '成功捕获·极品魂环！', icon: '💍', rarity: 'SSS', weight: 5, levelBoost: 5, soulRing: { year: 80000, colorName: '万年·幽灵', colorHex: '#9C27B0', beast: '幽灵魂兽', skill: '幽灵穿梭' } },
        { label: '勉强捕获',            icon: '👐', rarity: 'S', weight: 20, levelBoost: 3, soulRing: { year: 30000, colorName: '万年', colorHex: '#212121', beast: '幽灵魂兽', skill: '幽灵步' } },
        { label: '它逃进了阴影中',      icon: '🏃', rarity: 'A', weight: 30 },
        { label: '太诡异·不敢靠近',    icon: '😨', rarity: 'B', weight: 25 },
        { label: '被幽灵附身·获得特殊能力', icon: '🌀', rarity: 'SS', weight: 10, levelBoost: 4 },
      ]
    },
  },
]
