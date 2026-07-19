// 第6章：大陆风云 (Lv.51-60)
// 武魂殿发动猎魂行动，大陆陷于动荡
import { hasMet, isAlliedWith, isEnemyOf } from '../conditions'

export const CHAPTER_06 = {
  index: 6, title: '大陆风云', levelStart: 51, levelEnd: 60,
  steps: [
    {
      key: 'ch6_huntStarted', title: '⚡ 猎魂行动', icon: '⚠️',
      prelude: '武魂殿的阴影笼罩了整个大陆！猎魂行动开始了——封号斗罗出动，四处猎杀落单的魂师。整个魂师界人人自危。你收到了一封密信……命运之轮，请转动——',
      resultTemplate: '你选择了{label}。{suffix}',
      suffixes: {
        SSS: '你挺身而出，与武魂殿正面为敌！这份勇气，让无数人暗中敬佩！',
        SS: '你在暗处帮助了许多被追猎的魂师，你的名字开始在反抗者中流传。',
        S: '你在混乱中保持了冷静的判断力。',
        A: '中立之道并不容易，但此刻它是明智的。',
        B: '加入武魂殿意味着秩序，但也意味着与曾经的伙伴为敌。',
        C: '乱世之中，活下去是第一要务。',
      },
      computeOptions(state) {
        const against = state.relationships?.biBiDong?.faction === 'hostile'
        const tangFriend = isAlliedWith('tangSan')(state)
        return [
          { label: '挺身而出·对抗武魂殿', icon: '🛡️', rarity: 'SSS', weight: against ? 30 : (tangFriend ? 15 : 6),
            worldImpact: { biBiDong: { affinity: -50, faction: 'enemy' }, tangSan: { affinity: 30, met: true } } },
          { label: '暗中帮助受害者',       icon: '🕵️', rarity: 'S', weight: 20,
            worldImpact: { biBiDong: { affinity: -15 } } },
          { label: '保持中立·明哲保身',     icon: '⚖️', rarity: 'A', weight: 28 },
          { label: '加入武魂殿阵营',        icon: '⛪', rarity: 'B', weight: 20,
            worldImpact: { biBiDong: { affinity: 30, faction: 'friend' }, tangSan: { affinity: -40 } } },
          { label: '趁乱牟利',             icon: '💰', rarity: 'C', weight: 12 },
          { label: '逃离大陆·前往海神岛',   icon: '🏝️', rarity: 'S', weight: 8 },
        ]
      },
    },
    {
      key: 'ch6_soulRing6', title: '第六魂环', icon: '💍',
      prelude: '你达到了60级！在这战火纷飞的乱世中，你需要一枚能够保命的强大魂环。踏入危机四伏的魂兽森林……命运之轮，请转动——',
      resultTemplate: '命运之轮停驻——你的第六魂环，来自{label}！{suffix}',
      suffixes: {
        SSS: '十万年魂兽！血红色的魂环照亮了整个森林！',
        SS: '万年魂兽中的王者！黑色魂环，你的实力再次飞跃！',
        S: '接近万年的强大魂兽！紫色中透着异样的威严——',
        A: '不错的收获！在这乱世中，每一分力量都弥足珍贵。',
        B: '百年魂环，稳扎稳打。活下来才有未来。',
        C: '虽然只是十年……但在战乱中能活着回来就已经是胜利。',
      },
      computeOptions(state) {
        const prevSSS = state.soulRings?.some(r => r.rarity === 'SSS')
        const highQuality = state.attributes?.soulQualityRarity === 'SSS' || state.attributes?.soulQualityRarity === 'SS'
        return [
          { label: '十万年·天青牛蟒', icon: '🐂', rarity: 'SSS', weight: prevSSS ? 5 : (highQuality ? 3 : 1),
            soulRing: { year: 100000, colorName: '十万年', colorHex: '#FF1744', beast: '天青牛蟒', skill: '天青寂灭' } },
          { label: '万年·邪眸白虎',   icon: '🐯', rarity: 'SS',  weight: highQuality ? 14 : 8,
            soulRing: { year: 60000, colorName: '万年', colorHex: '#212121', beast: '邪眸白虎', skill: '白虎流星雨' } },
          { label: '千年·冰凤凰',     icon: '🧊', rarity: 'S',   weight: 20,
            soulRing: { year: 9000, colorName: '千年', colorHex: '#7B1FA2', beast: '冰凤凰', skill: '冰雪风暴' } },
          { label: '千年·赤焰雄狮',   icon: '🦁', rarity: 'A',   weight: 30,
            soulRing: { year: 5000, colorName: '千年', colorHex: '#7B1FA2', beast: '赤焰雄狮', skill: '烈焰冲击' } },
          { label: '百年·铁翼鸟',     icon: '🦅', rarity: 'B',   weight: 25,
            soulRing: { year: 900, colorName: '百年', colorHex: '#F9A825', beast: '铁翼鸟', skill: '铁翼斩' } },
          { label: '十年·草鸡',       icon: '🐔', rarity: 'C',  weight: 16,
            soulRing: { year: 90, colorName: '十年', colorHex: '#EEEEEE', beast: '草鸡', skill: '鸡鸣' } },
        ]
      },
    },
    {
      key: 'ch6_alliance', title: '结盟', icon: '🤝',
      prelude: '武魂殿的大军压境，天斗帝国岌岌可危。各大势力开始拉拢有实力的魂师。一封封结盟信送到了你手中……命运之轮，请转动——',
      resultTemplate: '你选择了与{label}结盟。{suffix}',
      suffixes: {
        SSS: '唐三的友谊如同一道曙光。从今往后，你不再孤军奋战！',
        SS: '七宝琉璃宗是大陆最富有的宗族，有了他们的支持，资源不愁！',
        S: '天斗帝国是正统，站在皇室一方，名正言顺。',
        A: '独行也是一种选择。真正的强者不需要依附任何人。',
        B: '有时候，被迫的选择也能开辟新的道路。',
      },
      computeOptions(state) {
        const tangFriend = isAlliedWith('tangSan')(state)
        return [
          { label: '与唐三联盟',       icon: '🌿', rarity: 'SSS', weight: tangFriend ? 35 : 12,
            worldImpact: { tangSan: { met: true, affinity: 30, faction: 'friend' } } },
          { label: '与七宝琉璃宗结盟', icon: '💎', rarity: 'SS',  weight: 15 },
          { label: '与天斗帝国结盟',   icon: '👑', rarity: 'S',   weight: 22 },
          { label: '独行侠·不结盟',    icon: '🧍', rarity: 'A',   weight: 28 },
          { label: '被迫加入武魂殿',   icon: '⛓️', rarity: 'C',   weight: 23 },
        ]
      },
    },
    {
      key: 'ch6_tangSectWeapons',
      title: '⚡ 唐门暗器',
      icon: '🏹',
      prelude: '唐三找到了你。他从怀中取出一卷泛黄的图纸："这是我唐门的暗器图谱。诸葛神弩、佛怒唐莲……这些东西在这个世界还没有出现过。如果你愿意，我可以教你。"命运之轮，请转动——',
      resultTemplate: '{label}！{suffix}',
      suffixes: {
        SSS: '唐三将整套唐门暗器图谱传授于你！佛怒唐莲的威力足以瞬杀封号斗罗——',
        SS: '你学会了制作诸葛神弩！四十发连射，威力惊人！',
        S: '唐三教了你几种实用的机括暗器——含沙射影、紧背花装弩！',
        A: '你和唐三一起研究改良了暗器，友谊更加深厚。',
        B: '你对暗器不感兴趣，但和唐三的交流让你受益匪浅。',
        C: '但唐三没有放弃。他说："等你准备好了，随时来找我。"',
      },
      computeOptions(state) {
        const tangFriend = state.relationships?.tangSan?.faction === 'friend'
        if (!tangFriend && !state.relationships?.tangSan?.met) {
          return [{
            label: '你还没有遇到唐三', icon: '❓', rarity: 'C', weight: 100,
            narrative: '你听说过唐三和唐门暗器的传说，但你们尚未相识。也许以后会有机会的。'
          }]
        }
        const closeBond = (state.relationships?.tangSan?.affinity || 0) >= 50
        return [
          { label: '获得整套唐门暗器图谱！！', icon: '📜', rarity: 'SSS', weight: closeBond ? 12 : 4, levelBoost: 3,
            worldImpact: { tangSan: { affinity: 20 } } },
          { label: '学会制作诸葛神弩',       icon: '🏹', rarity: 'SS',  weight: closeBond ? 25 : 12, levelBoost: 2 },
          { label: '几种实用机括暗器',       icon: '🔫', rarity: 'S',   weight: 28, levelBoost: 1,
            worldImpact: { tangSan: { affinity: 10 } } },
          { label: '共同研究·友谊加深',     icon: '🤝', rarity: 'A',   weight: 30,
            worldImpact: { tangSan: { affinity: 15 } } },
          { label: '不感兴趣·但也长了见识', icon: '🤷', rarity: 'B',   weight: 18 },
          { label: '还没准备好',            icon: '⏳', rarity: 'C',   weight: 8 },
        ]
      },
    },
    {
      key: 'ch6_battle', title: '遭遇武魂殿追兵', icon: '⚔️',
      prelude: '武魂殿的追兵终于找到了你！三名魂帝级别的强者将你团团围住。这场战斗无法避免——命运之轮，请转动——',
      resultTemplate: '{label}！{suffix}',
      suffixes: {
        SSS: '你反杀了三人！武魂殿震怒，但你的威名也因此传遍大陆！',
        SS: '在关键时刻，一位神秘人出手相助。他留下了意味深长的一句话……',
        S: '你成功击退了追兵，但真气消耗过度。',
        A: '虽然受了伤，但你活了下来。活着，就有翻盘的机会。',
        B: '被俘后你被关进了武魂殿的黑狱。逃脱的希望渺茫……',
        C: '但你没有放弃。每一个夜晚，你都在积蓄力量。',
      },
      computeOptions(state) {
        const level = state.level || 50
        return [
          { label: '以一敌三·反杀！',   icon: '💀', rarity: 'SSS', weight: level >= 55 ? 8 : 3 },
          { label: '得神秘强者相助',   icon: '🦸', rarity: 'SS',  weight: 12 },
          { label: '成功击退追兵',     icon: '✅', rarity: 'S',   weight: 25 },
          { label: '受伤逃脱',         icon: '🏃', rarity: 'A',   weight: 30 },
          { label: '被俘入狱',         icon: '🔗', rarity: 'B',   weight: 20 },
          { label: '被俘·但暗中积蓄力量', icon: '🕯️', rarity: 'C', weight: 10 },
        ]
      },
    },
    {
      key: 'ch6_soulBone4', title: '战场遗物', icon: '🦴',
      prelude: '在一片刚经历过大战的废墟中，你发现了一具封号斗罗的遗骸。他手中紧紧握着一件物品……命运之轮，请转动——',
      resultTemplate: '{label}！{suffix}',
      suffixes: {
        SSS: '魂骨！！陨落封号斗罗的遗赠！他将力量留给了有缘人！',
        SS: '一把高阶魂导器！品质非凡，足以成为你的底牌。',
        S: '一封写给继承者的遗书，以及修炼心得。',
        A: '一枚储物魂导器，里面有不少好东西。',
        B: '虽然只是一点财物，但在乱世中也够用一阵子了。',
        C: '你默默埋葬了这位前辈，在他墓前鞠了一躬。',
      },
      computeOptions(state) {
        return [
          { label: '魂骨！！雷霆万钧', icon: '🦴', rarity: 'SSS', weight: 4,
            soulBone: { slot: 'rightLeg', beast: '陨落封号斗罗遗留', year: 80000, skill: '雷霆万钧', rarity: 'SS' } },
          { label: '高阶储物魂导器', icon: '💍', rarity: 'SS',  weight: 14 },
          { label: '一封遗书与修炼心得', icon: '✉️', rarity: 'S',  weight: 20 },
          { label: '一箱金币和材料',   icon: '💰', rarity: 'A',   weight: 30 },
          { label: '为数不多的银魂币', icon: '🪙', rarity: 'B',   weight: 22 },
          { label: '空无一物·安葬前辈', icon: '🪦', rarity: 'C', weight: 10 },
        ]
      },
    },
    {
      key: 'ch6_moralChoice', title: '⚡ 道德抉择', icon: '⚖️',
      prelude: '武魂殿将一整个村落的平民扣押为人质，要求你现身。村民们命悬一线……你会怎么做？命运之轮，请转动——',
      resultTemplate: '你选择了{label}。{suffix}',
      suffixes: {
        SSS: '你单枪匹马闯入敌阵，以一人之力换回了全村人的性命！英雄之名，当之无愧！',
        SS: '你用智慧设计救出了村民，未伤一兵一卒！智勇双全！',
        S: '选择了大局为重。有时候，保护更多的人意味着做出残酷的决定。',
        A: '衡量之后，你选择了理性的方案。',
        B: '你选择了不去。这个决定让你夜夜难寐，但也许……不是错误的。',
      },
      computeOptions(state) {
        const hero = state.relationships?.biBiDong?.faction === 'enemy'
        return [
          { label: '舍身救人·英雄之举', icon: '🦸', rarity: 'SSS', weight: hero ? 25 : 8 },
          { label: '智取·设计营救',     icon: '🧠', rarity: 'SS',  weight: 22 },
          { label: '大局为重·放弃救援', icon: '💔', rarity: 'S',   weight: 25 },
          { label: '寻求同盟共同营救',   icon: '🤝', rarity: 'A',   weight: 25 },
          { label: '不去·保存实力',     icon: '😔', rarity: 'B',   weight: 20 },
        ]
      },
    },
    {
      key: 'ch6_chapterEnd', title: '第六章终', icon: '🏁',
      prelude: '大陆的风云仍在翻涌。战火之中，你已不再是当初那个初出茅庐的少年。回望这段岁月……命运之轮，请转动——',
      resultTemplate: '命运之轮停驻——{label}。{suffix}',
      suffixes: {
        SSS: '你的名字已成为反抗武魂殿的旗帜！无数人因你而燃起希望！',
        SS: '你在乱世中站稳了脚跟，赢得了尊重与力量。',
        S: '虽然艰难，但你活了下来，并且变得更强。',
        A: '你在风雨中成长，每一步都算数。',
        B: '乱世浮萍，飘摇不定……但只要活着，就还有明天。',
        C: '但你没有倒下。这就足够了。',
      },
      computeOptions(state) {
        const against = state.relationships?.biBiDong?.faction === 'enemy'
        const tangFriend = isAlliedWith('tangSan')(state)
        return [
          { label: '成为反抗旗帜',  icon: '🏴', rarity: 'SSS', weight: against ? 15 : 5 },
          { label: '站稳脚跟',      icon: '🦶', rarity: 'SS',  weight: tangFriend ? 22 : 12 },
          { label: '艰难但活着',    icon: '💪', rarity: 'S',   weight: 28 },
          { label: '在风雨中成长',  icon: '🌱', rarity: 'A',   weight: 30 },
          { label: '飘摇不定',      icon: '🍂', rarity: 'B',   weight: 18 },
          { label: '但没倒下',      icon: '🕯️', rarity: 'C',   weight: 7 },
        ]
      },
    },
  ],
}
