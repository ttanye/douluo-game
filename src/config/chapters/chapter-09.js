// 第9章：封号斗罗 (Lv.81-90)
import { hasMet, isAlliedWith } from '../conditions'

export const CHAPTER_09 = {
  index: 9, title: '封号斗罗', levelStart: 81, levelEnd: 90,
  steps: [
    {
      key: 'ch9_soulRing9', title: '第九魂环·封号之证', icon: '💍',
      prelude: '90级！封号斗罗的最后一块拼图！你需要一枚与你武魂完美契合的第九魂环。大陆上最强大的魂兽都在你的猎杀名单上——命运之轮，请转动——',
      resultTemplate: '命运之轮停驻——{label}！{suffix}',
      suffixes: {
        SSS: '龙神残魂！！传说中的存在！百万年神级魂环！金色光芒直冲云霄——',
        SS: '十万年魂兽！血红色的魂环中蕴含着天梦冰蚕的千年智慧！',
        S: '接近十万年的强大魂兽！你的第九魂环令人敬畏——',
        A: '不错的万年魂环！封号斗罗的大门已经打开——',
        B: '百年魂环的第九环确实有些遗憾，但封号斗罗就是封号斗罗！',
        C: '但你是否知道——有些封号斗罗，他们的第九环也是十年？',
      },
      computeOptions(state) {
        const prevSSS = state.soulRings?.some(r => r.rarity === 'SSS')
        return [
          { label: '百万年·龙神残魂',   icon: '🐉', rarity: 'SSS', weight: prevSSS ? 4 : 1,
            soulRing: { year: 1000000, colorName: '百万年', colorHex: '#FFD700', beast: '龙神残魂', skill: '龙神变' } },
          { label: '十万年·天梦冰蚕',   icon: '🐛', rarity: 'SS',  weight: 12,
            soulRing: { year: 100000, colorName: '十万年', colorHex: '#FF1744', beast: '天梦冰蚕', skill: '冰蚕神丝' } },
          { label: '万年·大地之王',     icon: '🦂', rarity: 'S',   weight: 22,
            soulRing: { year: 90000, colorName: '万年', colorHex: '#212121', beast: '大地之王', skill: '大地之怒' } },
          { label: '千年·暗金三头蝙蝠', icon: '🦇', rarity: 'A',   weight: 30,
            soulRing: { year: 9500, colorName: '千年', colorHex: '#7B1FA2', beast: '暗金三头蝙蝠', skill: '暗金声波' } },
          { label: '百年·巨力蚁王',     icon: '🐜', rarity: 'B',   weight: 22,
            soulRing: { year: 999, colorName: '百年', colorHex: '#F9A825', beast: '巨力蚁王', skill: '巨力' } },
          { label: '十年·跳蚤',         icon: '🦗', rarity: 'C',   weight: 13,
            soulRing: { year: 99, colorName: '十年', colorHex: '#EEEEEE', beast: '跳蚤', skill: '弹跳' } },
        ]
      },
    },
    {
      key: 'ch9_title', title: '封号加冕', icon: '👑',
      prelude: '九环齐鸣！你终于踏入了封号斗罗的行列！武魂殿的封号台上，万众瞩目。一个声音回荡在大殿中："你的封号是什么？"命运之轮，请转动——',
      resultTemplate: '命运之轮停驻——{label}！{suffix}',
      suffixes: {
        SSS: '龙皇斗罗！这个封号将永远铭刻在斗罗大陆的历史上！',
        SS: '烈焰斗罗！火焰般的意志，燃烧一切阻碍！',
        S: '苍穹斗罗！天空是你武魂的领域——',
        A: '你的封号简洁有力。名字不重要，实力才是关键。',
        B: '但这个封号伴随着你的故事，将成为传奇的一部分。',
        C: '名字可以改变，但你走过的路不会。',
      },
      computeOptions(state) {
        const soulType = state.attributes?.soulType || ''
        const isBeast = soulType.includes('兽') || soulType.includes('龙')
        const isTool = soulType.includes('器')
        return [
          { label: isBeast ? '龙皇斗罗' : '神兵斗罗', icon: '🐉', rarity: 'SSS', weight: 5 },
          { label: '烈焰斗罗',   icon: '🔥', rarity: 'SS',  weight: 12 },
          { label: '苍穹斗罗',   icon: '☁️', rarity: 'SS',  weight: 12 },
          { label: '寒冰斗罗',   icon: '❄️', rarity: 'S',   weight: 15 },
          { label: '不朽斗罗',   icon: '💎', rarity: 'S',   weight: 15 },
          { label: '疾风斗罗',   icon: '💨', rarity: 'A',   weight: 22 },
          { label: '铁壁斗罗',   icon: '🛡️', rarity: 'B',   weight: 15 },
          { label: '无名斗罗',   icon: '❓', rarity: 'C',   weight: 4 },
        ]
      },
    },
    {
      key: 'ch9_fameLevel', title: '大陆震动', icon: '🌍',
      prelude: '新晋封号斗罗诞生的消息传遍了整个大陆！各方势力都在评估这位新斗罗的实力与立场。你收到了无数的邀请信——命运之轮，请转动——',
      resultTemplate: '{label}！{suffix}',
      suffixes: {
        SSS: '各方势力震动！他们知道——大陆的格局可能会因你而改变！',
        SS: '连比比东女皇都亲自派人前来招揽！',
        S: '你的名字出现在各大势力的重点关注名单上。',
        A: '虽然不是最耀眼的封号斗罗，但你已被各方所重视。',
        B: '新晋封号斗罗的加入对于任何势力都是一大助力。',
        C: '但你还有自己的路要走。',
      },
      computeOptions(state) {
        const vsWuHun = state.relationships?.biBiDong?.faction === 'enemy'
        return [
          { label: '举国震动·改变格局',   icon: '💥', rarity: 'SSS', weight: 8, levelBoost: 3 },
          { label: '比比东亲自招揽',       icon: '👸', rarity: 'SS',  weight: vsWuHun ? 5 : 18 },
          { label: '各方重点关注',         icon: '👀', rarity: 'S',   weight: 28 },
          { label: '多方拉拢',             icon: '📨', rarity: 'A',   weight: 30 },
          { label: '平静对待',             icon: '😐', rarity: 'B',   weight: 14 },
          { label: '质疑与挑战',           icon: '🤨', rarity: 'C',   weight: 5 },
        ]
      },
    },
    {
      key: 'ch9_duel', title: '封号对决', icon: '⚔️',
      prelude: '一位老牌的封号斗罗向你发起了挑战！他想测试你的实力——或许也是为了自己的名声。这是一场公开的封号对决！命运之轮，请转动——',
      resultTemplate: '{label}！{suffix}',
      suffixes: {
        SSS: '你碾压了对手！全场寂静！新晋斗罗的实力远超所有人的预期——',
        SS: '你以巧妙的战术战胜了对手！老牌斗罗也不得不承认你的实力！',
        S: '激战之后双方势均力敌——你的名声因此更上一层！',
        A: '虽然惜败，但你的表现赢得了所有人的尊重。',
        B: '但对手也承认——你绝非等闲之辈。',
        C: '但你在这场对决中学到了很多。下一次，你会更强。',
      },
      computeOptions(state) {
        return [
          { label: '碾压对手·实力震撼', icon: '💪', rarity: 'SSS', weight: 6, levelBoost: 2 },
          { label: '智取·战术获胜',     icon: '🧠', rarity: 'SS',  weight: 18, levelBoost: 1 },
          { label: '势均力敌·名声大噪', icon: '🤝', rarity: 'S',   weight: 30 },
          { label: '惜败·赢得尊重',     icon: '🤕', rarity: 'A',   weight: 25 },
          { label: '明显劣势·但没输',   icon: '🛡️', rarity: 'B',   weight: 14 },
          { label: '惨败·学到很多',     icon: '📖', rarity: 'C',   weight: 7 },
        ]
      },
    },
    {
      key: 'ch9_godCalling', title: '神位召唤', icon: '🔱',
      prelude: '成为封号斗罗后，你隐约感受到了一股来自更高层次的召唤。那不是魂力的波动……而是来自神界的召唤！哪个神位在召唤你？命运之轮，请转动——',
      resultTemplate: '命运之轮停驻——{label}在召唤你！{suffix}',
      suffixes: {
        SSS: '海神的召唤！大海在呼唤你——这或许是你的宿命！',
        SS: '修罗神的试炼在等着你。杀戮与审判，这是最危险也是最强大的神位之一！',
        S: '天使神的圣光照耀着你。纯净无瑕的力量——',
        A: '任意一个神位的召唤都是无上的荣耀！',
        B: '模糊的感应也需要认真对待。神位不会随便召唤凡人。',
        C: '但神位并非唯一的出路。有些封号斗罗，以凡人之躯比肩神明。',
      },
      computeOptions(state) {
        const seaBlood = state.attributes?.race === '海魂师后裔'
        return [
          { label: '海神召唤',     icon: '🌊', rarity: 'SSS', weight: seaBlood ? 18 : 8 },
          { label: '修罗神召唤',   icon: '⚔️', rarity: 'SSS', weight: 8 },
          { label: '天使神召唤',   icon: '👼', rarity: 'SS',  weight: 14 },
          { label: '罗刹神召唤',   icon: '👿', rarity: 'SS',  weight: 10 },
          { label: '多个模糊感应', icon: '🌫️', rarity: 'S',   weight: 28 },
          { label: '微弱感应',     icon: '🔮', rarity: 'A',   weight: 18 },
          { label: '毫无感应',     icon: '🫥', rarity: 'C',   weight: 14 },
        ]
      },
    },
    {
      key: 'ch9_finalBone', title: '最后一块魂骨', icon: '🦴',
      prelude: '六骨齐全才能与神位完美融合。你只差最后一块魂骨了——头部魂骨。据说在极北之地的冰封深渊中，有一块远古神兽遗留的头部魂骨……命运之轮，请转动——',
      resultTemplate: '{label}！{suffix}',
      suffixes: {
        SSS: '远古神兽头部魂骨！！你的六骨终于齐全了！神位之路再无阻碍！',
        SS: '万年头部魂骨！虽然不是神级，但足以完成六骨配置！',
        S: '虽然不是头部魂骨，但你用这块魂骨换取了一块头部魂骨！',
        A: '魂骨虽未到手，但你获得了极北之地珍贵的冰髓！',
        B: '虽然没拿到魂骨，但你并不遗憾。有时候，过程比结果重要。',
        C: '但你发现了极北之地的其他秘密。下一次，你还会再来。',
      },
      computeOptions(state) {
        return [
          { label: '远古神兽头部魂骨！！', icon: '🧠', rarity: 'SSS', weight: 4,
            soulBone: { slot: 'head', beast: '远古冰龙神', year: 1000000, skill: '冰龙神念·精神领域', rarity: 'SSS' } },
          { label: '万年冰碧蝎头部魂骨',   icon: '🦴', rarity: 'SS',  weight: 12,
            soulBone: { slot: 'head', beast: '冰碧蝎', year: 50000, skill: '精神冲击', rarity: 'S' } },
          { label: '换得一块头部魂骨',     icon: '🔄', rarity: 'S',   weight: 18,
            soulBone: { slot: 'head', beast: '交易获得', year: 30000, skill: '精神护盾', rarity: 'A' } },
          { label: '获得极北冰髓',         icon: '❄️', rarity: 'A',   weight: 28 },
          { label: '没有找到魂骨',         icon: '😔', rarity: 'B',   weight: 23 },
          { label: '空手·但发现秘密',     icon: '🔍', rarity: 'C',   weight: 15 },
        ]
      },
    },
    {
      key: 'ch9_premonition', title: '最后一战前夜', icon: '🔮',
      prelude: '你站在山巅，望着远方。明天就是决定大陆命运的最后一战。你能感觉到，神界的大门正在为你打开。命运之轮，请转动——',
      resultTemplate: '命运之轮停驻——{label}。{suffix}',
      suffixes: {
        SSS: '你看到了成神的曙光！没有什么能阻挡你了——',
        SS: '你已经做好了万全的准备。明天的战斗，你势在必得！',
        S: '虽然前路未知，但你已有足够的底气去面对一切。',
        A: '最后一战前的不安是正常的。但你会克服它。',
        B: '无论结果如何，你已无愧于自己的命运。',
        C: '但没有人规定封号斗罗必须成神。你的选择由你做主。',
      },
      computeOptions(state) {
        return [
          { label: '成神曙光在望',  icon: '🌅', rarity: 'SSS', weight: 10 },
          { label: '准备万全',      icon: '✅', rarity: 'SS',  weight: 22 },
          { label: '底气十足',      icon: '💪', rarity: 'S',   weight: 28 },
          { label: '有些不安',      icon: '😰', rarity: 'A',   weight: 22 },
          { label: '无愧于心',      icon: '🧘', rarity: 'B',   weight: 12 },
          { label: '另有打算',      icon: '🤔', rarity: 'C',   weight: 6 },
        ]
      },
    },
    {
      key: 'ch9_chapterEnd', title: '第九章终', icon: '🏁',
      prelude: '封号加身，神位召唤。你已站在了斗罗大陆的巅峰。明天的战斗将决定一切……命运之轮，请转动——',
      resultTemplate: '命运之轮停驻——{label}。{suffix}',
      suffixes: {
        SSS: '神位已在眼前！最后一战，你必将封神！',
        SS: '封号斗罗的传奇仍在书写。精彩的还在后面！',
        S: '你已经超越了99%的魂师。剩下的1%，是神。',
        A: '无论结果如何，你已是传奇的一部分。',
        B: '但你的故事还没有结束。',
        C: '每个人的传奇都有不同的结局。',
      },
      computeOptions(state) {
        return [
          { label: '神位在即',      icon: '🌟', rarity: 'SSS', weight: 12 },
          { label: '传奇继续',      icon: '📖', rarity: 'SS',  weight: 24 },
          { label: '超越众生',      icon: '⛰️', rarity: 'S',   weight: 28 },
          { label: '已是传奇',      icon: '🏆', rarity: 'A',   weight: 22 },
          { label: '故事未完',      icon: '✍️', rarity: 'B',   weight: 10 },
          { label: '不同结局',      icon: '🎭', rarity: 'C',   weight: 4 },
        ]
      },
    },
  ],
}
