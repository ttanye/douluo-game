// 第7章：海神岛 (Lv.61-70)
// 传说中的海神岛试炼
import { hasMet, isAlliedWith, levelAbove } from '../conditions'

export const CHAPTER_07 = {
  index: 7, title: '海神岛', levelStart: 61, levelEnd: 70,
  steps: [
    {
      key: 'ch7_voyage', title: '渡海征途', icon: '⛵',
      prelude: '茫茫大海之上，传说中的海神岛就在前方。但大海并非坦途——海魂兽、风暴、漩涡，每一步都可能是致命的。命运之轮，请转动——',
      resultTemplate: '{label}！{suffix}',
      suffixes: {
        SSS: '你在风暴中领悟了海洋的呼吸！船如飞箭，破浪前行！',
        SS: '你与深海魔鲸展开了一场惊心动魄的战斗！胜利后，它的魂环浮出海面——',
        S: '一位海魂师救起了昏迷的你。他自称是海神岛的引路人。',
        A: '虽然遇到了危险，但你顺利抵达了海神岛。',
        C: '你在海上漂流了七天七夜……但最终，还是看到了那座传说中的岛屿。',
      },
      computeOptions(state) {
        const seaBlood = state.attributes?.race === '海魂师后裔'
        return [
          { label: '乘风破浪·领悟海洋', icon: '🌊', rarity: 'SSS', weight: seaBlood ? 8 : 2, levelBoost: 3 },
          { label: '激战深海魔鲸',       icon: '🐋', rarity: 'SS',  weight: 8, soulRing: { year: 100000, colorName: '十万年', colorHex: '#FF1744', beast: '深海魔鲸', skill: '深海之怒' } },
          { label: '遇海魂师引路',       icon: '🧜', rarity: 'S',   weight: seaBlood ? 30 : 15,
            worldImpact: { haiShenDao: { met: true } } },
          { label: '遭遇风暴·勉强抵达',  icon: '🌪️', rarity: 'A',   weight: 30 },
          { label: '九死一生·漂流数日',  icon: '🛟', rarity: 'B',   weight: 25 },
          { label: '迷失大海·最终靠岸',  icon: '🧭', rarity: 'C',   weight: 20 },
        ]
      },
    },
    {
      key: 'ch7_soulRing7', title: '第七魂环·武魂真身', icon: '💍',
      prelude: '70级！武魂真身的关键魂环！海神岛周边海域中隐藏着无数强大的海魂兽。你需要一枚配得上武魂真身的魂环——命运之轮，请转动——',
      resultTemplate: '命运之轮停驻——{label}！{suffix}',
      suffixes: {
        SSS: '深海魔鲸王！百万年修为！金色魂环与武魂真身完美融合——',
        SS: '邪魔虎鲸王！十万年海魂兽中的霸主！武魂真身·虎鲸形态！',
        S: '魔鬼鱼王！紫色的魂环中闪烁着海洋的光辉——',
        A: '不错的收获！武魂真身终于完成！',
        B: '虽然只是百年魂环，但武魂真身依然强大！',
        C: '但至少你拥有了武魂真身。这是质变的一步。',
      },
      computeOptions(state) {
        const prevSSS = state.soulRings?.some(r => r.rarity === 'SSS')
        return [
          { label: '百万年·深海魔鲸王', icon: '🐋', rarity: 'SSS', weight: prevSSS ? 5 : 2,
            soulRing: { year: 1000000, colorName: '百万年', colorHex: '#FFD700', beast: '深海魔鲸王', skill: '武魂真身·魔鲸' } },
          { label: '十万年·邪魔虎鲸王', icon: '🦈', rarity: 'SS',  weight: 10,
            soulRing: { year: 100000, colorName: '十万年', colorHex: '#FF1744', beast: '邪魔虎鲸王', skill: '武魂真身·虎鲸' } },
          { label: '万年·魔鬼鱼王',     icon: '🦇', rarity: 'S',   weight: 22,
            soulRing: { year: 70000, colorName: '万年', colorHex: '#212121', beast: '魔鬼鱼王', skill: '武魂真身·魔鬼鱼' } },
          { label: '千年·巨钳蟹王',     icon: '🦀', rarity: 'A',   weight: 28,
            soulRing: { year: 8000, colorName: '千年', colorHex: '#7B1FA2', beast: '巨钳蟹王', skill: '武魂真身·巨钳' } },
          { label: '百年·铁甲龙虾',     icon: '🦞', rarity: 'B',   weight: 23,
            soulRing: { year: 900, colorName: '百年', colorHex: '#F9A825', beast: '铁甲龙虾', skill: '武魂真身·铁甲' } },
          { label: '十年·小丑鱼',       icon: '🐠', rarity: 'C',   weight: 15,
            soulRing: { year: 95, colorName: '十年', colorHex: '#EEEEEE', beast: '小丑鱼', skill: '武魂真身·小鱼' } },
        ]
      },
    },
    {
      key: 'ch7_seaGodTrial', title: '⚡ 海神九考（一）', icon: '🔱',
      prelude: '海神岛上，一座巨大的海神雕像矗立在圣柱之上。一个苍老的声音在你脑海中响起：\"欲承海神之位，须过九考。第一考——穿越！海神之光！\"命运之轮，请转动——',
      resultTemplate: '{label}！{suffix}',
      suffixes: {
        SSS: '海神之光对你毫无阻碍！九考的第一道光柱为你而通明！',
        SS: '你获得了海神九考的资格！前方的路还很长，但你已迈出了第一步！',
        S: '五考也是不凡的成就！海神岛已认可了你的实力。',
        A: '你能感受到海神意志的注视。这就足够了。',
        C: '并非每个人都能得到海神的认可。但你还有其他的路。',
      },
      computeOptions(state) {
        const highInnate = (state.attributes?.innatePower || 0) >= 8
        return [
          { label: '海神九考·完美契合', icon: '🔱', rarity: 'SSS', weight: highInnate ? 12 : 4 },
          { label: '海神七考·极高潜力', icon: '⭐', rarity: 'SS',  weight: 18 },
          { label: '海神五考·优秀资质', icon: '📋', rarity: 'S',   weight: 28 },
          { label: '海神三考·普通认可', icon: '📝', rarity: 'A',   weight: 28 },
          { label: '黑级考核·仍需努力', icon: '⚫', rarity: 'B',   weight: 15 },
          { label: '未获考核资格',       icon: '🚫', rarity: 'C',   weight: 7 },
        ]
      },
    },
    {
      key: 'ch7_seaGodTrial2', title: '⚡ 海神九考（二）', icon: '🌊',
      prelude: '第二考：穿越！环形海的封锁！你需要在不被环形海中的海魂兽发现的情况下，穿越这片死亡海域。命运之轮，请转动——',
      resultTemplate: '{label}！{suffix}',
      suffixes: {
        SSS: '你如幽灵般穿越了环形海！海魂兽们甚至没有察觉到你的存在！',
        SS: '你以智慧避开了所有威胁。环形海没能阻挡你的脚步。',
        S: '虽然惊动了海魂兽，但你凭借实力硬闯了过去！',
        A: '有惊无险。第二考，通过！',
        C: '但你没有放弃。环形海困不住一颗不屈的心。',
      },
      computeOptions(state) {
        return [
          { label: '完美潜入·幽灵过海', icon: '👻', rarity: 'SSS', weight: 6, levelBoost: 2 },
          { label: '智取·避实就虚',     icon: '🧠', rarity: 'SS',  weight: 18, levelBoost: 1 },
          { label: '硬闯·实力碾压',     icon: '💪', rarity: 'S',   weight: 25 },
          { label: '有惊无险',          icon: '😰', rarity: 'A',   weight: 30 },
          { label: '勉强通过',          icon: '🆘', rarity: 'B',   weight: 16 },
          { label: '失败·重新挑战',     icon: '🔄', rarity: 'C',   weight: 5 },
        ]
      },
    },
    {
      key: 'ch7_seaGodTrial3', title: '⚡ 海神九考（三）', icon: '🏛️',
      prelude: '第三考：登上！海神山的三百三十三级台阶！每一级都在考验你的意志力。据说只有被海神选中的人才能登顶——命运之轮，请转动——',
      resultTemplate: '{label}！{suffix}',
      suffixes: {
        SSS: '你以不可思议的速度登顶！海神山顶的光芒为你而照耀！',
        SS: '你登上了三百三十三级台阶！海神山见证了你的毅力！',
        S: '你在二百级处感受到了海神的意志——你被赐予了额外的祝福！',
        A: '登顶成功！汗水滴落在海神山顶的石板上，闪闪发光。',
        B: '你停在了半山腰。但每一次攀登，都让你更强。',
        C: '但你没有停下脚步。海神山，终究会被你征服。',
      },
      computeOptions(state) {
        const highPower = (state.attributes?.innatePower || 0) >= 7
        return [
          { label: '极速登顶·海神青睐', icon: '⚡', rarity: 'SSS', weight: highPower ? 8 : 3, levelBoost: 3 },
          { label: '完全登顶',          icon: '⛰️', rarity: 'SS',  weight: 20, levelBoost: 2 },
          { label: '登顶·获海神祝福',   icon: '🙏', rarity: 'S',   weight: 25, levelBoost: 1 },
          { label: '成功登顶',          icon: '✅', rarity: 'A',   weight: 30 },
          { label: '半途而废',          icon: '🛑', rarity: 'B',   weight: 15 },
          { label: '再次失败·但不放弃', icon: '🔄', rarity: 'C',   weight: 7 },
        ]
      },
    },
    {
      key: 'ch7_seaTreasure', title: '海底秘境', icon: '💎',
      prelude: '在海神山脚下的深渊中，有一处只有通过三考以上才能进入的海底秘境。海神遗留的宝藏就在其中——命运之轮，请转动——',
      resultTemplate: '{label}！{suffix}',
      suffixes: {
        SSS: '海神头骨！！海神亲自留下的神赐魂骨！金光照亮了整个海底！',
        SS: '海神三叉戟的碎片！虽然只是碎片，但其中蕴含的力量足以毁天灭地！',
        S: '海神之心的一缕神识注入你的体内——你获得了一项海神专属的魂技！',
        A: '满载而归！这些资源足以让你的实力再上一个台阶。',
        B: '虽然不算珍贵，但海底的珍珠非常美丽。',
        C: '但你感受到了海神的宁静。有时候，什么都没有也是一种获得。',
      },
      computeOptions(state) {
        return [
          { label: '海神头骨！！',       icon: '🦴', rarity: 'SSS', weight: 3,
            soulBone: { slot: 'head', beast: '海神遗留', year: 1000000, skill: '海神凝视·精神风暴', rarity: 'SSS' } },
          { label: '海神三叉戟碎片',     icon: '🔱', rarity: 'SS',  weight: 10 },
          { label: '海神之心神识注入',   icon: '💙', rarity: 'S',   weight: 18 },
          { label: '大量珍稀海洋资源',   icon: '🪸', rarity: 'A',   weight: 28 },
          { label: '几颗深海珍珠',       icon: '🫧', rarity: 'B',   weight: 26 },
          { label: '空手而归·收获宁静', icon: '🧘', rarity: 'C',   weight: 15 },
        ]
      },
    },
    {
      key: 'ch7_seaGodTrial4', title: '⚡ 海神九考（终）', icon: '🏆',
      prelude: '最终的考核！海神本尊的意志降临，与你面对面。\"你已证明了自己的实力与心性。现在，回答最后一个问题……\"命运之轮，请转动——',
      resultTemplate: '{label}！{suffix}',
      suffixes: {
        SSS: '\"你通过了。\"海神的声音回荡在天地之间。金色的光芒将你笼罩——海神传承者，诞生！',
        SS: '海神点头。\"你有资格。剩下的路，靠你自己走。\"',
        S: '虽然未能获得完整的海神传承，但你已获得了远超常人的力量。',
        A: '海神留下了祝福，飘然离去。你已经不虚此行。',
        C: '\"再来一次。\"海神说完，化作浪花消散。你还有机会。',
      },
      computeOptions(state) {
        return [
          { label: '通过！海神传承者！', icon: '🌟', rarity: 'SSS', weight: 8, levelBoost: 8,
            worldImpact: { seaGodInherited: true } },
          { label: '获得海神部分传承',  icon: '🌊', rarity: 'SS',  weight: 20, levelBoost: 5 },
          { label: '获得海神祝福',      icon: '🙏', rarity: 'S',   weight: 30, levelBoost: 3 },
          { label: '获得海神认可',      icon: '👍', rarity: 'A',   weight: 25, levelBoost: 1 },
          { label: '未通过·但获祝福',   icon: '🔄', rarity: 'B',   weight: 12 },
          { label: '未通过·重新开始',   icon: '💪', rarity: 'C',   weight: 5 },
        ]
      },
    },
    {
      key: 'ch7_chapterEnd', title: '第七章终', icon: '🏁',
      prelude: '海神岛的历练结束了。你站在船头，望着渐渐远去的神岛，心中百感交集。命运之轮，请转动——',
      resultTemplate: '命运之轮停驻——{label}。{suffix}',
      suffixes: {
        SSS: '你带着海神的传承回归大陆！你的名字将响彻四海！',
        SS: '你的实力已经今非昔比。大陆的乱局，你已有能力去改变了。',
        S: '海神岛的历练让你脱胎换骨。前方的路，更加清晰了。',
        A: '收获满满。是时候回到大陆，面对那些未尽之事了。',
        B: '虽然没有达到预期，但每一步都算数。',
        C: '你回头望了一眼海神岛。有一天，你还会回来的。',
      },
      computeOptions(state) {
        return [
          { label: '满载海神传承而归', icon: '🔱', rarity: 'SSS', weight: 10 },
          { label: '实力大增·今非昔比', icon: '📈', rarity: 'SS',  weight: 22 },
          { label: '脱胎换骨',          icon: '🦋', rarity: 'S',   weight: 28 },
          { label: '收获满满',          icon: '📦', rarity: 'A',   weight: 25 },
          { label: '略有遗憾',          icon: '😔', rarity: 'B',   weight: 10 },
          { label: '下次再来',          icon: '🔄', rarity: 'C',   weight: 5 },
        ]
      },
    },
  ],
}
