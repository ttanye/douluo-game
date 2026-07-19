// 第5章：全大陆精英赛 (Lv.41-50)
import { hasMet, isAlliedWith } from '../conditions'

export const CHAPTER_05 = {
  index: 5, title: '全大陆精英赛', levelStart: 41, levelEnd: 50,
  steps: [
    {
      key: 'ch5_preliminary', title: '预选赛', icon: '🏟️',
      prelude: '全大陆高级魂师学院精英大赛开幕！预选赛抽签结果出来了……命运之轮，请转动——',
      computeOptions(s) {
        return [
          { label: '轮空！直接晋级', icon: '🎉', rarity: 'SSS', weight: 3 },
          { label: '对阵弱队·轻松获胜', icon: '✅', rarity: 'A', weight: 30 },
          { label: '势均力敌·艰难取胜', icon: '⚔️', rarity: 'S', weight: 25 },
          { label: '险胜·受重伤', icon: '🩹', rarity: 'B', weight: 22 },
          { label: '惨败·被淘汰', icon: '💔', rarity: 'C', weight: 20 },
        ]
      },
    },
    {
      key: 'ch5_soulRing5', title: '第五魂环', icon: '💍',
      prelude: '50级！你需要第五魂环来应对更强的对手……命运之轮，请转动——',
      computeOptions(s) {
        return [
          { label: '万年·深海魔鲸', icon: '🐋', rarity: 'SSS', weight: 2, soulRing: { year: 90000, colorName: '万年', colorHex: '#212121', beast: '深海魔鲸', skill: '深海之怒' } },
          { label: '万年·暗魔邪神虎', icon: '🐯', rarity: 'SS', weight: 8, soulRing: { year: 50000, colorName: '万年', colorHex: '#212121', beast: '暗魔邪神虎', skill: '暗魔邪光' } },
          { label: '千年·大地熊王', icon: '🐻', rarity: 'S', weight: 20, soulRing: { year: 9000, colorName: '千年', colorHex: '#7B1FA2', beast: '大地熊王', skill: '大地震' } },
          { label: '千年·闪电隼', icon: '🦅', rarity: 'A', weight: 30, soulRing: { year: 5000, colorName: '千年', colorHex: '#7B1FA2', beast: '闪电隼', skill: '闪电突袭' } },
          { label: '百年·铁甲犀牛', icon: '🦏', rarity: 'B', weight: 25, soulRing: { year: 900, colorName: '百年', colorHex: '#F9A825', beast: '铁甲犀牛', skill: '铁甲护体' } },
          { label: '十年·跳跳兔', icon: '🐰', rarity: 'C', weight: 15, soulRing: { year: 60, colorName: '十年', colorHex: '#EEEEEE', beast: '跳跳兔', skill: '跳跃强化' } },
        ]
      },
    },
    {
      key: 'ch5_mainEvent', title: '正赛对决', icon: '⚔️',
      prelude: '你遇到了武魂殿黄金一代的选手！命运之轮，请转动——',
      computeOptions(s) {
        return [
          { label: '爆冷击败！一战封神！', icon: '⚡', rarity: 'SSS', weight: 5, worldImpact: { biBiDong: { affinity: -25, met: true } } },
          { label: '虽败犹荣·赢得尊重', icon: '🤝', rarity: 'S', weight: 20 },
          { label: '激战后惜败', icon: '😤', rarity: 'A', weight: 30 },
          { label: '被碾压', icon: '💀', rarity: 'B', weight: 25 },
          { label: '对手弃权·不战而胜', icon: '🍀', rarity: 'SS', weight: 5 },
          { label: '比赛中突破·因祸得福', icon: '🔥', rarity: 'SS', weight: 15 },
        ]
      },
    },
    {
      key: 'ch5_quarterFinal', title: '半决赛', icon: '🏆',
      prelude: '一路杀入半决赛！对手是……命运之轮，请转动——',
      computeOptions(s) {
        return [
          { label: '史莱克学院', icon: '🏫', rarity: 'SSS', weight: 20 },
          { label: '天斗皇家学院', icon: '👑', rarity: 'S', weight: 18 },
          { label: '武魂殿学院', icon: '⛪', rarity: 'SS', weight: 22 },
          { label: '星罗皇家学院', icon: '🌟', rarity: 'A', weight: 25 },
          { label: '因伤退赛', icon: '🤕', rarity: 'C', weight: 15 },
        ]
      },
    },
    {
      key: 'ch5_tournamentEnd', title: '最终名次', icon: '🏅',
      prelude: '大赛接近尾声。你的最终成绩是……命运之轮，请转动——',
      computeOptions(s) {
        return [
          { label: '冠军！！', icon: '🥇', rarity: 'SSS', weight: 3 },
          { label: '亚军', icon: '🥈', rarity: 'SS', weight: 10 },
          { label: '四强', icon: '🏅', rarity: 'S', weight: 22 },
          { label: '八强', icon: '📛', rarity: 'A', weight: 30 },
          { label: '十六强', icon: '🔖', rarity: 'B', weight: 25 },
          { label: '三十二强开外', icon: '😞', rarity: 'C', weight: 10 },
        ]
      },
    },
    {
      key: 'ch5_recruitment', title: '各方招揽', icon: '📨',
      prelude: '大赛之后，各方势力纷纷向你投来橄榄枝……命运之轮，请转动——',
      computeOptions(s) {
        return [
          { label: '武魂殿邀请·丰厚的条件', icon: '⛪', rarity: 'SS', weight: 18, worldImpact: { biBiDong: { met: true, affinity: 10 } } },
          { label: '天斗皇室招揽', icon: '👑', rarity: 'S', weight: 22 },
          { label: '星罗帝国邀请', icon: '🌟', rarity: 'A', weight: 20 },
          { label: '留校任教·培养后人', icon: '🏫', rarity: 'A', weight: 20 },
          { label: '婉拒所有·独自历练', icon: '🗺️', rarity: 'B', weight: 20 },
        ]
      },
    },
    {
      key: 'ch5_slaughterCity',
      title: '⚡ 杀戮之都',
      icon: '🏚️',
      prelude: '赛后，一位神秘人找到了你。"年轻人，你渴望力量吗？有一个地方能让你在短时间内脱胎换骨——杀戮之都。但进入那里的人，十个有九个再也出不来……"命运之轮，请转动——',
      resultTemplate: '{label}！{suffix}',
      suffixes: {
        SSS: '你在地狱路中觉醒了杀神领域！这是百万中无一的成就！',
        SS: '你走过了地狱路！虽然没有觉醒领域，但你的实力已经脱胎换骨！',
        S: '你在杀戮之都中存活了下来！每一滴血都没有白流——',
        A: '你在杀戮之都中坚持了很久。虽然不是最耀眼的，但活着出来就是胜利。',
        B: '杀戮之都太过危险，你选择了在外围历练。安全，但并不懦弱。',
        C: '但你听到了很多关于杀戮之都的传说。也许有一天，你会做好准备。',
      },
      computeOptions(state) {
        const isTough = (state.attributes?.innatePower || 0) >= 7 || state.attributes?.soulQualityRarity === 'SSS'
        return [
          { label: '走过地狱路·觉醒杀神领域！！', icon: '⚔️', rarity: 'SSS', weight: isTough ? 6 : 2, levelBoost: 8,
            worldImpact: { slaughterCity: { survived: true, domain: 'killingGod' } } },
          { label: '走过地狱路·实力脱胎换骨',     icon: '💀', rarity: 'SS',  weight: 10, levelBoost: 5 },
          { label: '在杀戮之都存活',              icon: '🩸', rarity: 'S',   weight: 22, levelBoost: 3 },
          { label: '坚持许久·活着出来',            icon: '🚪', rarity: 'A',   weight: 28, levelBoost: 1 },
          { label: '太过危险·外围历练',            icon: '⚠️', rarity: 'B',   weight: 22 },
          { label: '未被允许进入',                icon: '🚫', rarity: 'C',   weight: 16 },
        ]
      },
    },
    {
      key: 'ch5_chapterEnd', title: '第五章尾声', icon: '🏁',
      prelude: '精英大赛落下帷幕。你在大陆上的声望……命运之轮，请转动——',
      computeOptions(s) {
        return [
          { label: '名震大陆', icon: '🌍', rarity: 'SS', weight: 12 },
          { label: '小有名气', icon: '📢', rarity: 'A', weight: 30 },
          { label: '崭露头角', icon: '🌱', rarity: 'B', weight: 35 },
          { label: '默默无闻', icon: '🤫', rarity: 'C', weight: 23 },
        ]
      },
    },
  ],
}
