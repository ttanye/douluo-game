// 第2章：诺丁学院 (Lv.11-20)
import { and, hasMet, isAlliedWith, innatePowerAbove } from '../conditions'

export const CHAPTER_02 = {
  index: 2, title: '诺丁学院', levelStart: 11, levelEnd: 20,
  steps: [
    {
      key: 'ch2_roommate',
      title: '室友',
      icon: '🛏️',
      prelude: '学院宿舍分配……你的室友会是谁？命运之轮，请转动——',
      computeOptions(state) {
        return [
          { label: '唐三（如果同代）', icon: '🌿', rarity: 'SSS', weight: hasMet('tangSan')(state) ? 30 : 5, worldImpact: { tangSan: { met: true, affinity: 15, faction: 'friend' } } },
          { label: '勤奋的平民学生', icon: '💪', rarity: 'B', weight: 25 },
          { label: '贵族子弟', icon: '👑', rarity: 'A', weight: 20 },
          { label: '不学无术的混子', icon: '😴', rarity: 'C', weight: 25 },
          { label: '独自一间', icon: '🏠', rarity: 'B', weight: 15 },
        ]
      },
    },
    {
      key: 'ch2_rival',
      title: '劲敌',
      icon: '🥊',
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
      key: 'ch2_secretTraining',
      title: '秘密修行',
      icon: '🔒',
      prelude: '你发现了一个秘密修炼方法……命运之轮，请转动——',
      computeOptions(state) {
        return [
          { label: '远古冥想术', icon: '🧘', rarity: 'SSS', weight: 2, narrative: '一部残缺的远古冥想术！修炼效率倍增！' },
          { label: '极限训练法', icon: '🏋️', rarity: 'A', weight: 25, narrative: '挑战极限！痛苦但有效。' },
          { label: '药物辅助', icon: '🧪', rarity: 'B', weight: 30, narrative: '用药物辅助修炼，效果稳定。' },
          { label: '偷师他人', icon: '👀', rarity: 'S', weight: 10, narrative: '偷学了他人的秘法……' },
          { label: '按部就班', icon: '📋', rarity: 'C', weight: 33, narrative: '老老实实按照学院方法修炼。' },
        ]
      },
    },
    {
      key: 'ch2_soulRing2',
      title: '第二魂环',
      icon: '💍',
      prelude: '20级！是时候获取第二魂环了……命运之轮，请转动——',
      resultTemplate: '命运之轮停驻——你的第二魂环，来自{label}！{suffix}',
      suffixes: {
        SSS: '传说中的魂兽！金色光环笼罩，全场寂静——',
        SS:  '万年魂兽！第二魂环就是黑色？天才之名当之无愧！',
        S:   '千年魂兽中的霸主！紫色中带着异样的光芒——',
        A:   '不错的千年魂兽！紫色魂环稳固——',
        B:   '百年魂兽，稳扎稳打。',
        C:   '虽然只是十年……但合适才是最好的。',
      },
      computeOptions(state) {
        const prevRing = state.soulRings?.[0]
        const prevGood = prevRing?.rarity === 'SSS' || prevRing?.rarity === 'SS'
        return [
          { label: '万年·地穴魔蛛', icon: '🕷️', rarity: 'SS',  weight: prevGood ? 8 : 2, soulRing: { year: 30000, colorName: '万年', colorHex: '#212121', beast: '地穴魔蛛', skill: '蛛网束缚' } },
          { label: '千年·人面魔蛛', icon: '🕸️', rarity: 'S',   weight: prevGood ? 18 : 8, soulRing: { year: 6000, colorName: '千年', colorHex: '#7B1FA2', beast: '人面魔蛛', skill: '剧毒蛛网' } },
          { label: '千年·鬼虎',     icon: '🐯', rarity: 'A',   weight: 22, soulRing: { year: 3000, colorName: '千年', colorHex: '#7B1FA2', beast: '鬼虎', skill: '虎啸' } },
          { label: '百年·粉红女郎', icon: '🦂', rarity: 'B',   weight: 30, soulRing: { year: 500, colorName: '百年', colorHex: '#F9A825', beast: '粉红女郎', skill: '毒刺' } },
          { label: '十年·竹叶青',   icon: '🐍', rarity: 'C',   weight: 20, soulRing: { year: 50, colorName: '十年', colorHex: '#EEEEEE', beast: '竹叶青', skill: '微毒' } },
        ]
      },
    },
    {
      key: 'ch2_tournament',
      title: '学院比武',
      icon: '🏆',
      prelude: '诺丁学院年度比武大会开始了！命运之轮，请转动——',
      computeOptions(state) {
        return [
          { label: '冠军！一战成名',   icon: '🥇', rarity: 'SSS', weight: 5 },
          { label: '亚军，虽败犹荣',   icon: '🥈', rarity: 'SS',  weight: 12 },
          { label: '四强，实力不俗',   icon: '🏅', rarity: 'S',   weight: 20 },
          { label: '八强',             icon: '📛', rarity: 'A',   weight: 28 },
          { label: '首轮淘汰',         icon: '😞', rarity: 'C',   weight: 25 },
          { label: '因伤退赛',         icon: '🤕', rarity: 'C',   weight: 10 },
        ]
      },
    },
    {
      key: 'ch2_soulBoneChance',
      title: '意外发现',
      icon: '🦴',
      prelude: '在学院后山修炼时，你发现了一处异常……命运之轮，请转动——',
      computeOptions(state) {
        return [
          { label: '魂骨！！', icon: '🦴', rarity: 'SSS', weight: 2, soulBone: { slot: 'rightArm', beast: '千年魂兽遗留', year: 5000, skill: '力量增幅', rarity: 'A' } },
          { label: '珍贵的仙草', icon: '🌿', rarity: 'SS', weight: 8 },
          { label: '前人遗留的笔记', icon: '📓', rarity: 'A', weight: 20 },
          { label: '一个修炼密室', icon: '🚪', rarity: 'S', weight: 10 },
          { label: '只是一些药草', icon: '🌱', rarity: 'B', weight: 30 },
          { label: '虚惊一场，什么都没有', icon: '😅', rarity: 'C', weight: 30 },
        ]
      },
    },
    {
      key: 'ch2_graduation',
      title: '毕业去向',
      icon: '🎓',
      prelude: '诺丁学院的学业即将结束。下一站是哪里？命运之轮，请转动——',
      computeOptions(state) {
        const metTangSan = hasMet('tangSan')(state)
        return [
          { label: '史莱克学院（推荐）', icon: '🏫', rarity: 'SSS', weight: metTangSan ? 35 : 15 },
          { label: '天斗皇家学院', icon: '🏰', rarity: 'S',   weight: 18 },
          { label: '武魂殿学院', icon: '⛪', rarity: 'A',   weight: 20 },
          { label: '留校任教', icon: '👨‍🏫', rarity: 'B',   weight: 15 },
          { label: '独自游历', icon: '🗺️', rarity: 'A',   weight: 22 },
          { label: '回家种地', icon: '🌾', rarity: 'C',   weight: 10 },
        ]
      },
    },
    {
      key: 'ch2_chapterEnd',
      title: '第二章尾声',
      icon: '🏁',
      prelude: '诺丁学院的日子结束了。回望这两年的成长……命运之轮，请转动——',
      computeOptions(state) {
        return [
          { label: '天才之名传遍学院', icon: '🌟', rarity: 'SS', weight: 8 },
          { label: '优秀毕业生', icon: '🎖️', rarity: 'A', weight: 25 },
          { label: '平平淡淡毕业', icon: '📜', rarity: 'B', weight: 35 },
          { label: '带着遗憾离开', icon: '😔', rarity: 'C', weight: 20 },
          { label: '被开除！！', icon: '💀', rarity: 'C', weight: 12 },
        ]
      },
    },
  ],
}
