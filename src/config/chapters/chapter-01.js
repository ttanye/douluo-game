// 第1章：初入魂师界 (Lv.1-10)
import { RARITY_COLORS } from '../colors'
import { and, hasMet, isAlliedWith } from '../conditions'

export const CHAPTER_01 = {
  index: 1,
  title: '初入魂师界',
  levelStart: 1,
  levelEnd: 10,
  steps: [
    {
      key: 'ch1_firstAwakening',
      title: '武魂觉醒仪式',
      icon: '✨',
      prelude: '诺丁城武魂殿分殿中，觉醒仪式正在进行。你走上前去，将手放在了觉醒水晶上……命运之轮，请转动——',
      computeOptions(state) {
        return [
          { label: '完美觉醒·光芒万丈',   icon: '🌟', rarity: 'SSS', weight: 1, narrative: '水晶爆发出耀眼的光芒！全场震撼——' },
          { label: '顺利觉醒·魂力涌动',   icon: '💡', rarity: 'A',   weight: 25, narrative: '武魂顺利觉醒，魂力在体内流淌。' },
          { label: '正常觉醒·平凡之路',   icon: '🔮', rarity: 'B',   weight: 35, narrative: '武魂觉醒成功，一切都很正常。' },
          { label: '困难觉醒·险些失败',   icon: '😰', rarity: 'C',   weight: 25, narrative: '觉醒过程艰难，但最终成功了。' },
          { label: '变异觉醒·异象突生',   icon: '🌀', rarity: 'SS',  weight: 4, narrative: '觉醒过程中发生了意外变异！' },
          { label: '失败·沦为废人',       icon: '💔', rarity: 'C',   weight: 10, narrative: '觉醒失败……但命运并未关闭所有门窗。' },
        ]
      },
    },
    {
      key: 'ch1_firstTeacher',
      title: '第一位老师',
      icon: '👨‍🏫',
      prelude: '觉醒之后，一位魂师注意到了你。他将成为你在魂师路上的第一位引路人……命运之轮，请转动——',
      computeOptions(state) {
        const innate = state.attributes?.innatePower || 0
        return [
          { label: '隐世高人',   icon: '🧙', rarity: 'SSS', weight: innate >= 8 ? 3 : 0.5 },
          { label: '学院名师',   icon: '👨‍🏫', rarity: 'A',   weight: 20 },
          { label: '退役魂师',   icon: '🧓', rarity: 'B',   weight: 30 },
          { label: '自学成才',   icon: '📚', rarity: 'C',   weight: innate >= 5 ? 15 : 30 },
          { label: '邪魂师',     icon: '🕯️', rarity: 'S',   weight: 8 },
          { label: '无名前辈',   icon: '🤷', rarity: 'B',   weight: 20 },
        ]
      },
    },
    {
      key: 'ch1_firstBattle',
      title: '第一场战斗',
      icon: '⚔️',
      prelude: '一只十年魂兽出现在你面前！这是你的第一次实战……命运之轮，请转动——',
      computeOptions(state) {
        return [
          { label: '碾压获胜·天赋惊人',   icon: '💪', rarity: 'SS', weight: 3 },
          { label: '艰难获胜·积累经验',   icon: '⚔️', rarity: 'B',   weight: 35 },
          { label: '险胜·幸运眷顾',       icon: '🍀', rarity: 'A',   weight: 22 },
          { label: '落败·被师父救下',     icon: '🆘', rarity: 'C',   weight: 20 },
          { label: '逃跑·保存实力',       icon: '🏃', rarity: 'C',   weight: 15 },
          { label: '同归于尽式·惨烈',     icon: '💥', rarity: 'S',   weight: 5 },
        ]
      },
    },
    {
      key: 'ch1_firstEncounter',
      title: '初遇',
      icon: '👋',
      prelude: '在诺丁城的街道上，你遇到了一个蓝发少年……命运之轮，请转动——',
      computeOptions(state) {
        // 时代不同影响遇到谁
        const era = state.attributes?.era || ''
        if (era.includes('少年')) {
          return [
            { label: '唐三',    icon: '🌿', rarity: 'SSS', weight: 25, worldImpact: { tangSan: { met: true, affinity: 10, faction: 'neutral' } } },
            { label: '小舞',    icon: '🐰', rarity: 'SS',  weight: 20, worldImpact: { xiaoWu: { met: true, affinity: 10, faction: 'neutral' } } },
            { label: '玉小刚',  icon: '📖', rarity: 'S',   weight: 15, worldImpact: { yuXiaoGang: { met: true, affinity: 5, faction: 'neutral' } } },
            { label: '武魂殿执事', icon: '⛪', rarity: 'B', weight: 20 },
            { label: '路人甲',  icon: '🚶', rarity: 'C',   weight: 20 },
          ]
        }
        return [
          { label: '神秘旅人', icon: '🧳', rarity: 'A', weight: 30 },
          { label: '学院同学', icon: '🎒', rarity: 'B', weight: 35 },
          { label: '商会商人', icon: '💰', rarity: 'C', weight: 20 },
          { label: '落魄魂师', icon: '😔', rarity: 'A', weight: 15 },
        ]
      },
    },
    {
      key: 'ch1_firstSoulRing',
      title: '第一魂环',
      icon: '💍',
      prelude: '你达到了10级！需要猎杀第一只魂兽获取魂环。踏入猎魂森林……命运之轮，请转动——',
      resultTemplate: '命运之轮停驻——你的第一魂环，来自{label}！{suffix}',
      suffixes: {
        SSS: '百万年魂兽！这是传说中的存在！金色魂环笼罩全身——',
        SS:  '万年魂兽！黑色魂环，你已超越同龄人太多！',
        S:   '千年魂兽！紫色魂环缓缓升起——',
        A:   '不错的收获！紫色光芒闪耀——',
        B:   '百年魂兽，黄色魂环，中规中矩。',
        C:   '十年魂兽……白色魂环。起步虽低，未来可期！',
      },
      computeOptions(state) {
        const isGod = state.attributes?.soulQualityRarity === 'SSS'
        const innate = state.attributes?.innatePower || 0
        return [
          { label: '百万年·远古魂兽', icon: '🐉', rarity: 'SSS', weight: isGod ? 3 : 0.3, soulRing: { year: 1000000, colorName: '百万年', colorHex: '#FFD700', beast: '远古魂兽' } },
          { label: '万年·暗金恐爪熊', icon: '🐻', rarity: 'SS',  weight: isGod ? 6 : (innate >= 8 ? 3 : 1), soulRing: { year: 50000, colorName: '万年', colorHex: '#212121', beast: '暗金恐爪熊' } },
          { label: '千年·曼陀罗蛇',   icon: '🐍', rarity: 'S',   weight: innate >= 7 ? 12 : 6, soulRing: { year: 4000, colorName: '千年', colorHex: '#7B1FA2', beast: '曼陀罗蛇' } },
          { label: '千年·风狒狒',     icon: '🦍', rarity: 'A',   weight: 20, soulRing: { year: 2000, colorName: '千年', colorHex: '#7B1FA2', beast: '风狒狒' } },
          { label: '百年·幽冥狼',     icon: '🐺', rarity: 'B',   weight: 30, soulRing: { year: 400, colorName: '百年', colorHex: '#F9A825', beast: '幽冥狼' } },
          { label: '十年·柔骨兔',     icon: '🐰', rarity: 'C',   weight: innate <= 3 ? 30 : 18, soulRing: { year: 30, colorName: '十年', colorHex: '#EEEEEE', beast: '柔骨兔' } },
        ]
      },
    },
    {
      key: 'ch1_trainingChoice',
      title: '修炼方向',
      icon: '🎯',
      prelude: '有了第一魂环后，你需要选择修炼的重点方向……命运之轮，请转动——',
      computeOptions(state) {
        return [
          { label: '主修攻击',   icon: '⚔️', rarity: 'A', weight: 25 },
          { label: '主修防御',   icon: '🛡️', rarity: 'A', weight: 20 },
          { label: '主修控制',   icon: '🎛️', rarity: 'S', weight: 15 },
          { label: '主修速度',   icon: '💨', rarity: 'A', weight: 18 },
          { label: '全面发展',   icon: '⭐', rarity: 'SS', weight: 8 },
          { label: '专修武魂特性', icon: '🔬', rarity: 'S', weight: 14 },
        ]
      },
    },
    {
      key: 'ch1_schoolEvent',
      title: '学院事件',
      icon: '🏫',
      prelude: '在学院中发生了一件事……命运之轮，请转动——',
      computeOptions(state) {
        return [
          { label: '发现修炼宝地',   icon: '🏞️', rarity: 'S',   weight: 10 },
          { label: '结交好友',       icon: '🤝', rarity: 'A',   weight: 20 },
          { label: '被高年级欺负',   icon: '😤', rarity: 'B',   weight: 25 },
          { label: '偷学秘术',       icon: '📜', rarity: 'SS',  weight: 5 },
          { label: '平凡日常',       icon: '📖', rarity: 'C',   weight: 25 },
          { label: '意外受伤',       icon: '🤕', rarity: 'C',   weight: 15 },
        ]
      },
    },
    {
      key: 'ch1_chapterEnd',
      title: '第一章终',
      icon: '🏁',
      prelude: '初入魂师界的第一个月结束了。你站在诺丁城墙上回望——武魂觉醒了，第一位老师找到了，第一次战斗经历了。你的名字开始在城中流传……命运之轮，请转动——',
      resultTemplate: '命运之轮停驻——{label}。{suffix}',
      suffixes: {
        SS: '天才之名远扬！诺丁城的人都知道了你的名字！',
        A: '你已经小有名气。走在街上，有人会认出你来。',
        B: '稳步成长就是最好的成长。踏实走好每一步。',
        C: '但默默无闻不代表没有实力。你在暗中积蓄着力量。',
      },
      computeOptions(state) {
        const goodTeacher = state.growthChoices?.ch1_firstTeacher === '隐世高人'
        return [
          { label: '天才之名远扬', icon: '🌟', rarity: 'SS', weight: goodTeacher ? 15 : 5 },
          { label: '小有名气',     icon: '👍', rarity: 'A',  weight: 25 },
          { label: '稳步成长',     icon: '📈', rarity: 'B',  weight: 40 },
          { label: '默默无闻',     icon: '🤫', rarity: 'C',  weight: 30 },
        ]
      },
    },
  ],
}
