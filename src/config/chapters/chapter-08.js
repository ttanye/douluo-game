// 第8章：武魂帝国崛起 (Lv.71-80)
// 武魂殿正式立国，大陆战争全面爆发
import { hasMet, isAlliedWith, isEnemyOf } from '../conditions'

export const CHAPTER_08 = {
  index: 8, title: '武魂帝国崛起', levelStart: 71, levelEnd: 80,
  steps: [
    {
      key: 'ch8_finalStance', title: '⚡ 最终立场', icon: '⚖️',
      prelude: '武魂殿正式宣布立国——武魂帝国诞生了！比比东女皇登基，大陆一分为二。所有魂师都被迫站队。你的最终立场是？命运之轮，请转动——',
      resultTemplate: '你选择了{label}。{suffix}',
      suffixes: {
        SSS: '你选择了为自由而战！从今天起，你就是反抗军的旗帜！',
        SS: '第三方独立势力——你拒绝被任何一方束缚。这是最危险也最自由的路。',
        S: '加入武魂帝国意味着秩序和力量，但代价是与过去的盟友决裂。',
        A: '中立不容易，但你的实力让你有资格保持中立。',
        B: '隐居不是懦弱，而是选择了另一种生活方式。',
      },
      computeOptions(state) {
        const vsWuHun = state.relationships?.biBiDong?.faction === 'enemy'
        const tangFriend = isAlliedWith('tangSan')(state)
        return [
          { label: '反抗军·为自由而战', icon: '🛡️', rarity: 'SSS', weight: vsWuHun ? 35 : (tangFriend ? 22 : 10),
            worldImpact: { biBiDong: { affinity: -100, faction: 'enemy' }, tangSan: { affinity: 50, faction: 'friend' } } },
          { label: '独立势力·第三方',   icon: '⚜️', rarity: 'SS',  weight: 18 },
          { label: '加入武魂帝国',       icon: '⛪', rarity: 'S',   weight: 20,
            worldImpact: { biBiDong: { affinity: 60, faction: 'friend' }, tangSan: { affinity: -60, faction: 'enemy' } } },
          { label: '保持中立',           icon: '⚖️', rarity: 'A',   weight: 28 },
          { label: '避世隐居',           icon: '🏔️', rarity: 'B',   weight: 14 },
        ]
      },
    },
    {
      key: 'ch8_soulRing8', title: '第八魂环', icon: '💍',
      prelude: '80级！你已经接近封号斗罗的门槛！这个魂环至关重要——它可能决定了你能否突破那道天堑。命运之轮，请转动——',
      resultTemplate: '命运之轮停驻——{label}！{suffix}',
      suffixes: {
        SSS: '泰坦雪魔！极北之地的霸主！你的第八魂环闪耀着血红的光芒——',
        SS: '千钧蚁皇！力拔千钧！黑色魂环中涌动着无可匹敌的力量——',
        S: '强大的万年魂兽！你的实力正在逼近那个传说中的境界——',
        A: '不错的千年魂环。稳步接近封号斗罗的门槛！',
        B: '百年魂环虽不出众，但你离封号斗罗只差最后一步了。',
        C: '但封号斗罗的瓶颈不是一枚魂环能决定的。真正的突破，在内心。',
      },
      computeOptions(state) {
        const prevSSS = state.soulRings?.some(r => r.rarity === 'SSS')
        return [
          { label: '十万年·泰坦雪魔',   icon: '🧊', rarity: 'SSS', weight: prevSSS ? 6 : 3,
            soulRing: { year: 100000, colorName: '十万年', colorHex: '#FF1744', beast: '泰坦雪魔', skill: '冰封万里' } },
          { label: '万年·千钧蚁皇',     icon: '🐜', rarity: 'SS',  weight: 14,
            soulRing: { year: 80000, colorName: '万年', colorHex: '#212121', beast: '千钧蚁皇', skill: '千钧之力' } },
          { label: '万年·金刚熊王',     icon: '🧸', rarity: 'S',   weight: 22,
            soulRing: { year: 60000, colorName: '万年', colorHex: '#212121', beast: '金刚熊王', skill: '金刚不坏' } },
          { label: '千年·铁甲地龙',     icon: '🦎', rarity: 'A',   weight: 28,
            soulRing: { year: 9500, colorName: '千年', colorHex: '#7B1FA2', beast: '铁甲地龙', skill: '铁甲防御' } },
          { label: '百年·岩石巨人',     icon: '🗿', rarity: 'B',   weight: 20,
            soulRing: { year: 950, colorName: '百年', colorHex: '#F9A825', beast: '岩石巨人', skill: '岩石皮肤' } },
          { label: '十年·穿山甲',       icon: '🦔', rarity: 'C',   weight: 13,
            soulRing: { year: 99, colorName: '十年', colorHex: '#EEEEEE', beast: '穿山甲', skill: '穿山' } },
        ]
      },
    },
    {
      key: 'ch8_grandBattle', title: '嘉陵关大战', icon: '⚔️',
      prelude: '武魂帝国大军压境至嘉陵关！这是决定大陆命运的一战！你站在关前，对面的敌将向你发出了挑战——命运之轮，请转动——',
      resultTemplate: '{label}！{suffix}',
      suffixes: {
        SSS: '你斩杀了敌方大将！敌军溃败！嘉陵关守住了！',
        SS: '你的战术发挥了奇效！以少胜多，敌军不得不撤退！',
        S: '虽然惨烈，但你守住了阵地。每一滴血都没有白流。',
        A: '嘉陵关保住了。但这只是整个战争的一个缩影。',
        B: '但你在撤退中掩护了伤员。英雄不问胜败。',
        C: '但你没有逃跑。你在溃败中重新集结了队伍。',
      },
      computeOptions(state) {
        const isHero = state.relationships?.biBiDong?.faction === 'enemy'
        return [
          { label: '斩将！大获全胜', icon: '🗡️', rarity: 'SSS', weight: isHero ? 8 : 3, levelBoost: 3 },
          { label: '战术奇袭·以少胜多', icon: '🧠', rarity: 'SS',  weight: 18, levelBoost: 2 },
          { label: '惨烈守关·守住阵地', icon: '🩸', rarity: 'S',   weight: 25 },
          { label: '险胜·保住关隘',     icon: '🏰', rarity: 'A',   weight: 30 },
          { label: '战败·撤退',         icon: '🏃', rarity: 'B',   weight: 16 },
          { label: '惨败·但集结残兵',   icon: '🪖', rarity: 'C',   weight: 8 },
        ]
      },
    },
    {
      key: 'ch8_soulBone5', title: '战场斩获', icon: '🎖️',
      prelude: '战后清理战场时，你在敌军大将的尸骸上发现了一件遗物。这是一位封号斗罗级别强者的遗物——命运之轮，请转动——',
      resultTemplate: '{label}！{suffix}',
      suffixes: {
        SSS: '外附魂骨！！八蛛矛级别的龙皇之翼！这是可遇不可求的神物！',
        SS: '封号斗罗的本命魂骨！品质非凡！',
        S: '高级魂导器！有了它，你的战斗力将再上一层。',
        A: '虽然不是魂骨，但战术地图的价值不可估量。',
        B: '几件战利品，聊胜于无。',
        C: '但战争不是寻宝。你更珍惜的是战友们的生命。',
      },
      computeOptions(state) {
        return [
          { label: '外附魂骨·龙皇之翼！！', icon: '🦴', rarity: 'SSS', weight: 3,
            soulBone: { slot: 'external', beast: '远古龙皇', year: 100000, skill: '龙皇之翼·飞天', rarity: 'SSS' } },
          { label: '封号斗罗本命魂骨',       icon: '💀', rarity: 'SS',  weight: 12,
            soulBone: { slot: 'leftArm', beast: '封号斗罗遗留', year: 90000, skill: '死亡之握', rarity: 'SS' } },
          { label: '高级魂导器',             icon: '🔮', rarity: 'S',   weight: 22 },
          { label: '敌军战术地图',           icon: '🗺️', rarity: 'A',   weight: 28 },
          { label: '几件普通战利品',         icon: '📦', rarity: 'B',   weight: 25 },
          { label: '空手而归·心系战友',     icon: '❤️', rarity: 'C',   weight: 10 },
        ]
      },
    },
    {
      key: 'ch8_fourClans',
      title: '⚡ 四大宗族',
      icon: '🏴',
      prelude: '战争之中，四大宗族——力之一族（泰坦）、御之一族（牛皋）、敏之一族（白鹤）、破之一族（杨无敌）——正在选择站队。你被邀请参加他们的秘会。在庚辛城，金属之都，一场决定四大宗族走向的谈判正在进行……命运之轮，请转动——',
      resultTemplate: '{label}！{suffix}',
      suffixes: {
        SSS: '你将四大宗族全部拉拢到了反抗军一方！泰坦巨猿家族、白鹤家族……他们都将成为你的力量！',
        SS: '你拉拢了力之一族和敏之一族！泰坦的巨力和白鹤的速度将成为你的后盾！',
        S: '杨无敌被你的诚意打动！破之一族的破魂枪法名不虚传——',
        A: '你与四大宗族建立了友好关系。虽然不是全部，但已经是非常不错的外交成果。',
        B: '谈判没有成功，但宗族的长老们对你印象深刻。来日方长。',
        C: '但你看到了庚辛城的金属锻造工艺——那真是叹为观止！',
      },
      computeOptions(state) {
        const isHero = state.relationships?.biBiDong?.faction === 'enemy'
        return [
          { label: '拉拢全部四大宗族！！', icon: '🏴', rarity: 'SSS', weight: isHero ? 12 : 4, levelBoost: 4,
            worldImpact: { fourClans: { allied: true, full: true } } },
          { label: '拉拢力之一族与敏之一族', icon: '💪', rarity: 'SS',  weight: isHero ? 20 : 10, levelBoost: 2,
            worldImpact: { fourClans: { allied: true } } },
          { label: '杨无敌的破之一族加盟',   icon: '🗡️', rarity: 'S',   weight: 22, levelBoost: 2 },
          { label: '友好关系·部分合作',     icon: '🤝', rarity: 'A',   weight: 30 },
          { label: '谈判未成·留下好印象',   icon: '📋', rarity: 'B',   weight: 20 },
          { label: '庚辛城的金属工艺令人惊叹', icon: '⚒️', rarity: 'C', weight: 16 },
        ]
      },
    },
    {
      key: 'ch8_turningPoint', title: '⚡ 战场转折', icon: '🔑',
      prelude: '一个关键的抉择摆在你面前。敌军主帅被围，但只要你下令，就可以将他俘虏。然而，如果现在分兵，另一处战场可能会崩溃。命运之轮，请转动——',
      resultTemplate: '你选择了{label}。{suffix}',
      suffixes: {
        SSS: '你做了一个所有人都认为疯狂的决定——结果证明你是对的！战场格局被一举扭转！',
        SS: '你的冷静判断力在关键时刻发挥了作用。一个好的决定改变了整个战役。',
        S: '虽然代价很大，但你坚信这个选择是对的。',
        A: '在战场上，有时候不得不在两难中做出取舍。',
        B: '但没有人能预知战争的结局。你只能尽力而为。',
      },
      computeOptions(state) {
        return [
          { label: '奇袭·一举扭转战局', icon: '⚡', rarity: 'SSS', weight: 8, levelBoost: 4 },
          { label: '冷静判断·围点打援', icon: '🧠', rarity: 'SS',  weight: 22, levelBoost: 2 },
          { label: '牺牲局部·保全大局', icon: '🛡️', rarity: 'S',   weight: 30 },
          { label: '两难中的取舍',       icon: '⚖️', rarity: 'A',   weight: 25 },
          { label: '难以抉择',          icon: '😰', rarity: 'B',   weight: 15 },
        ]
      },
    },
    {
      key: 'ch8_aftermath', title: '战场余波', icon: '🌊',
      prelude: '大战暂时告一段落。双方都在舔舐伤口，准备最后的决战。你在军营中整理着这段时间的收获……命运之轮，请转动——',
      resultTemplate: '命运之轮停驻——{label}。{suffix}',
      suffixes: {
        SSS: '封号斗罗在向你招手。你已触碰到了那道门槛！',
        SS: '你在战争中磨砺了心性，实力更上一层楼。',
        S: '经历了战火的洗礼，你已不再是当初那个少年了。',
        A: '战争让人成长，但也让人疲惫。',
        B: '只要活着，就有机会。这是战争教会你的第一课。',
        C: '但你还在。这就是最重要的。',
      },
      computeOptions(state) {
        return [
          { label: '触碰封号斗罗门槛',  icon: '👑', rarity: 'SSS', weight: 10 },
          { label: '战争磨砺·实力大增', icon: '⚔️', rarity: 'SS',  weight: 22 },
          { label: '战火洗礼·快速成长', icon: '🔥', rarity: 'S',   weight: 28 },
          { label: '成长但疲惫',        icon: '😮‍💨', rarity: 'A',   weight: 25 },
          { label: '活着就是胜利',      icon: '🏳️', rarity: 'B',   weight: 12 },
          { label: '但还活着',          icon: '🕯️', rarity: 'C',   weight: 3 },
        ]
      },
    },
    {
      key: 'ch8_chapterEnd', title: '第八章终', icon: '🏁',
      prelude: '战争仍在继续，但你已看到了终点。封号斗罗的瓶颈已在眼前……命运之轮，请转动——',
      resultTemplate: '命运之轮停驻——{label}。{suffix}',
      suffixes: {
        SSS: '九环封号近在咫尺！你已做好了突破的准备！',
        SS: '战火中成长起来的你，已经不是任何人可以小觑的存在。',
        S: '你在这场战争中找到了自己的位置。',
        A: '虽然前路漫漫，但你已不是当初那个迷茫的少年了。',
        B: '但战争快结束了。你感觉得到。',
        C: '你还有未完成的事。',
      },
      computeOptions(state) {
        return [
          { label: '封号在望',      icon: '👑', rarity: 'SSS', weight: 12 },
          { label: '今非昔比',      icon: '💪', rarity: 'SS',  weight: 24 },
          { label: '找到位置',      icon: '🧭', rarity: 'S',   weight: 28 },
          { label: '不再迷茫',      icon: '🎯', rarity: 'A',   weight: 22 },
          { label: '战争将尽',      icon: '🕊️', rarity: 'B',   weight: 10 },
          { label: '未完成',        icon: '📋', rarity: 'C',   weight: 4 },
        ]
      },
    },
  ],
}
