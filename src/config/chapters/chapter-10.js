// 第10章：神位之争 (Lv.91-100)
import { hasMet, isAlliedWith, isEnemyOf } from '../conditions'

export const CHAPTER_10 = {
  index: 10, title: '神位之争', levelStart: 91, levelEnd: 100,
  steps: [
    {
      key: 'ch10_soulRing10', title: '第十魂环·神级', icon: '💍',
      prelude: '100级！凡人的极限！你需要一枚神级魂环来突破到神之领域。这不再是普通的猎魂——你需要挑战神界的考验！命运之轮，请转动——',
      resultTemplate: '命运之轮停驻——{label}！{suffix}',
      suffixes: {
        SSS: '龙神核心！！真正的神级魂环！你已触摸到了神之领域！',
        SS: '神赐魂环！虽是神界赐予，但其中蕴含的力量足以让你突破100级！',
        S: '接近神级的魂环！你已踏入半神的领域！',
        A: '凡人的极限魂环。但你已经比99.9%的魂师都强了。',
        B: '虽然只是千年，但你已是百级斗罗。实力不在魂环。',
        C: '但你明白——百级不是终点，只是神之考验的起点。',
      },
      computeOptions(state) {
        return [
          { label: '龙神核心·神级魂环', icon: '🐉', rarity: 'SSS', weight: 3,
            soulRing: { year: 10000000, colorName: '神级', colorHex: '#FFD700', beast: '龙神核心', skill: '龙神降临' } },
          { label: '神赐魂环',           icon: '✨', rarity: 'SS',  weight: 15,
            soulRing: { year: 999999, colorName: '神赐', colorHex: '#FFD700', beast: '神赐魂兽', skill: '神灵庇护' } },
          { label: '伪神级·万年魂环',   icon: '⭐', rarity: 'S',   weight: 28,
            soulRing: { year: 99000, colorName: '万年', colorHex: '#212121', beast: '伪神魂兽', skill: '伪神之力' } },
          { label: '极限千年魂环',       icon: '🔮', rarity: 'A',   weight: 30,
            soulRing: { year: 9999, colorName: '千年', colorHex: '#7B1FA2', beast: '极限魂兽', skill: '极限一击' } },
          { label: '百年魂环',           icon: '😔', rarity: 'B',   weight: 16,
            soulRing: { year: 999, colorName: '百年', colorHex: '#F9A825', beast: '百年魂兽', skill: '凡人之击' } },
          { label: '十年魂环·但无所谓', icon: '💪', rarity: 'C',   weight: 8,
            soulRing: { year: 100, colorName: '十年', colorHex: '#EEEEEE', beast: '十年魂兽', skill: '起点之击' } },
        ]
      },
    },
    {
      key: 'ch10_godTrial', title: '⚡ 神位考验', icon: '🔱',
      prelude: '神界的大门已经为你打开。但成神不是免费的午餐——你必须通过神位的最终考验。是海神？修罗神？还是……自创神位？命运之轮，请转动——',
      resultTemplate: '{label}！{suffix}',
      suffixes: {
        SSS: '自创神位！！你将开创一条前所未有的道路！诸神为之侧目——',
        SS: '海神九考完美通过！大海的权柄，属于你！',
        S: '修罗神的考验虽然残酷，但你已经通过了！杀戮之神，为你加冕！',
        A: '任何一个神位都是无上的荣耀。你已经做到了。',
        B: '但神位只是开始。真正的挑战，在你成神之后。',
        C: '但成神之路不止一条。你还可以继续努力。',
      },
      computeOptions(state) {
        const seaInherited = state.relationships?.seaGodInherited
        return [
          { label: '自创神位·独一无二',   icon: '💫', rarity: 'SSS', weight: 6, levelBoost: 10 },
          { label: '海神九考·完美通过',   icon: '🌊', rarity: 'SSS', weight: seaInherited ? 20 : 8, levelBoost: 8 },
          { label: '修罗神考验·通过',     icon: '⚔️', rarity: 'SSS', weight: 8, levelBoost: 8 },
          { label: '天使神·九考通过',     icon: '👼', rarity: 'SS',  weight: 15, levelBoost: 5 },
          { label: '一级神祇认可',         icon: '⭐', rarity: 'S',   weight: 30, levelBoost: 3 },
          { label: '二级神祇认可',         icon: '🔹', rarity: 'A',   weight: 20, levelBoost: 1 },
          { label: '未通过·继续努力',     icon: '🔄', rarity: 'C',   weight: 13 },
        ]
      },
    },
    {
      key: 'ch10_finalBattle', title: '⚡ 双神之战', icon: '⚔️',
      prelude: '最终决战！唐三的海神与比比东的罗刹神，双神对决，天崩地裂。而你，作为这片大陆上最强的人之一，你的立场将决定这战的结局——命运之轮，请转动——',
      resultTemplate: '你选择了{label}。{suffix}',
      suffixes: {
        SSS: '双神并肩！你们联手击败了比比东！斗罗大陆迎来了新的时代！',
        SS: '你独自面对比比东，为唐三争取了关键时间！虽未成神，但你已比肩神明！',
        S: '战斗结束后，你与唐三站在废墟之上，望着新生的黎明。',
        A: '神战不是你一个人的战斗。每一个人都贡献了自己的力量。',
        B: '但命运不由你定。神的战争，凡人有凡人的活法。',
        C: '但这份记忆将伴随你一生。',
      },
      computeOptions(state) {
        const tangFriend = isAlliedWith('tangSan')(state)
        return [
          { label: '双神并肩·联手克敌', icon: '🤝', rarity: 'SSS', weight: tangFriend ? 30 : 12,
            worldImpact: { tangSan: { affinity: 80, faction: 'friend' }, biBiDong: { alive: false } } },
          { label: '独自面对·比肩神明', icon: '🦸', rarity: 'SSS', weight: 8 },
          { label: '辅助唐三·锁定胜局', icon: '🛡️', rarity: 'SS',  weight: 22,
            worldImpact: { tangSan: { affinity: 40 } } },
          { label: '守护后方·保障胜利', icon: '🏰', rarity: 'S',   weight: 28 },
          { label: '旁观·见证历史',     icon: '👀', rarity: 'A',   weight: 20 },
          { label: '无法参与·但心系战场', icon: '💭', rarity: 'B', weight: 10 },
        ]
      },
    },
    {
      key: 'ch10_godhood', title: '你的神位', icon: '🌟',
      prelude: '战争结束了。神界的钟声为你而鸣。在万众瞩目之下，你接受了神位的加冕——命运之轮，请转动——',
      resultTemplate: '命运之轮停驻——你成为了{label}！{suffix}',
      suffixes: {
        SSS: '海神！大海的权柄尽在你手！你的名字将被铭刻在神界之巅！',
        SS: '修罗神！杀戮与审判的主宰！天下万魂，皆听你号令！',
        S: '火神！烈焰为你加冕！你的怒火足以焚尽世间一切邪恶！',
        A: '每一个神位都有它存在的意义。你就是那个意义。',
        B: '但你的传说不会因为神位的高低而改变。',
        C: '但你在这个世界的存在本身，就已经改变了无数人的命运。',
      },
      computeOptions(state) {
        return [
          { label: '海神',     icon: '🌊', rarity: 'SSS', weight: 8 },
          { label: '修罗神',   icon: '⚔️', rarity: 'SSS', weight: 8 },
          { label: '火神',     icon: '🔥', rarity: 'SS',  weight: 14 },
          { label: '战神',     icon: '🛡️', rarity: 'SS',  weight: 12 },
          { label: '风神',     icon: '💨', rarity: 'S',   weight: 20 },
          { label: '生命女神', icon: '🌿', rarity: 'S',   weight: 18 },
          { label: '二级神祇', icon: '⭐', rarity: 'A',   weight: 14 },
          { label: '没有成神', icon: '😔', rarity: 'C',   weight: 6 },
        ]
      },
    },
    {
      key: 'ch10_newOrder', title: '大陆新秩序', icon: '🏛️',
      prelude: '武魂帝国覆灭，新秩序正在建立。作为一尊新神，你将如何安排自己在大陆上的角色？命运之轮，请转动——',
      resultTemplate: '你选择了{label}。{suffix}',
      suffixes: {
        SSS: '神界执法者！你将维护大陆与神界之间的平衡！',
        SS: '守护大陆的神祇！你的存在本身就是和平的象征——',
        S: '建立属于自己的传承，让后人有路可循。',
        A: '你选择了一种和平的方式继续影响这个世界。',
        B: '归隐也是一种选择。有时候，不干预就是最好的干预。',
        C: '世界会忘记很多人，但被记得的人共同改变了历史。',
      },
      computeOptions(state) {
        return [
          { label: '神界执法者·平衡两界', icon: '⚖️', rarity: 'SSS', weight: 10 },
          { label: '守护大陆的和平之神',   icon: '🕊️', rarity: 'SS',  weight: 22 },
          { label: '建立自己的神位传承',   icon: '🏰', rarity: 'S',   weight: 28 },
          { label: '暗中观察·默默守护',   icon: '👁️', rarity: 'A',   weight: 22 },
          { label: '归隐·不问世事',       icon: '🏔️', rarity: 'B',   weight: 12 },
          { label: '被遗忘的角落',        icon: '🍂', rarity: 'C',   weight: 6 },
        ]
      },
    },
    {
      key: 'ch10_legacy', title: '传承', icon: '📜',
      prelude: '每一位神都会留下自己的传承。你希望后人记住你什么？你又将传承什么？命运之轮，请转动——',
      resultTemplate: '命运之轮停驻——{label}。{suffix}',
      suffixes: {
        SSS: '天资绝世的传人将你的一切发扬光大！你的名字被万代传颂——',
        SS: '一套完整的自创魂技体系！后世之人将沿着你的道路前进——',
        S: '一间学院将培养出无数杰出的魂师。你的精神永存。',
        A: '你的一生就是最好的传承。',
        B: '但知识需要载体。你留下的每一本书都是宝藏。',
        C: '因为你的故事早已刻进了每个被你影响过的人心中。',
      },
      computeOptions(state) {
        return [
          { label: '收天资绝世之徒', icon: '🌟', rarity: 'SSS', weight: 10 },
          { label: '留下自创魂技体系', icon: '📕', rarity: 'SS',  weight: 22 },
          { label: '创立学院',        icon: '🏫', rarity: 'S',   weight: 28 },
          { label: '著书立说',        icon: '📖', rarity: 'A',   weight: 24 },
          { label: '口耳相传',        icon: '🗣️', rarity: 'B',   weight: 12 },
          { label: '无传承·随缘',    icon: '🍃', rarity: 'C',   weight: 4 },
        ]
      },
    },
    {
      key: 'ch10_epilogue', title: '千年后的传说', icon: '📚',
      prelude: '千年之后。斗罗大陆上的人们围坐在篝火旁，老人讲述着古老的传说……其中有一个名字，是那么熟悉。命运之轮，请转动——',
      resultTemplate: '命运之轮停驻——千年之后，{label}。{suffix}',
      suffixes: {
        SSS: '你成为了神话！孩子们在睡前都听着你的故事！你的名字将永世传颂！',
        SS: '你的传奇被写成了一本厚厚的传记，世代流传——',
        S: '每一个魂师学院都挂着你的事迹。你激励了无数后来者。',
        A: '历史书上有你的一页。虽然不是最耀眼，但绝对不可或缺。',
        B: '在民间故事里，你是一个符号，一个永远不放弃的象征。',
        C: '但你的影响已经融入了这片大陆的每一寸土地。',
      },
      computeOptions(state) {
        return [
          { label: '神话！永世传颂',   icon: '🌟', rarity: 'SSS', weight: 12 },
          { label: '传奇传记·世代流传', icon: '📕', rarity: 'SS',  weight: 24 },
          { label: '学院的榜样人物',   icon: '🏅', rarity: 'S',   weight: 28 },
          { label: '历史书的一页',     icon: '📄', rarity: 'A',   weight: 22 },
          { label: '民间的传说',       icon: '🗣️', rarity: 'B',   weight: 10 },
          { label: '被遗忘·但影响深远', icon: '🌍', rarity: 'C',   weight: 4 },
        ]
      },
    },
    {
      key: 'ch10_theEnd', title: '命运之书闭合', icon: '📖',
      prelude: '你合上了命运之书。漫长的旅途走到了终点。所有的选择，所有的冒险，所有遇到的人……都已成为你生命中不可磨灭的篇章。命运之轮，请最后一次转动——',
      resultTemplate: '命运之轮停驻——{label}。{suffix}',
      suffixes: {
        SSS: '完美结局。你的人生，是一部无与伦比的史诗！',
        SS: '圆满的结局。虽有遗憾，但更多的是满足。',
        S: '一个不错的结局。你做到了大部分人做不到的事。',
        A: '平淡但真实的结局。真实的人生本就如此。',
        B: '略带遗憾的结局。但谁说遗憾不是一种美？',
        C: '但每一个结局都是独一无二的。因为这是你的故事。',
      },
      computeOptions(state) {
        return [
          { label: '完美结局·史诗传奇', icon: '✨', rarity: 'SSS', weight: 12 },
          { label: '圆满结局',          icon: '🎉', rarity: 'SS',  weight: 24 },
          { label: '不错结局',          icon: '😊', rarity: 'S',   weight: 28 },
          { label: '平淡结局',          icon: '🙂', rarity: 'A',   weight: 22 },
          { label: '遗憾结局',          icon: '😔', rarity: 'B',   weight: 10 },
          { label: '独一无二的结局',    icon: '📖', rarity: 'C',   weight: 4 },
        ]
      },
    },
  ],
}
