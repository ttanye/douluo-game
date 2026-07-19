// 第4章：史莱克学院 (Lv.31-40)
import { hasMet, isAlliedWith } from '../conditions'

export const CHAPTER_04 = {
  index: 4, title: '史莱克学院', levelStart: 31, levelEnd: 40,
  steps: [
    {
      key: 'ch4_entranceExam', title: '入学考试', icon: '📝',
      prelude: '史莱克学院——只收怪物，不收普通人。你能通过那残酷的入学考试吗？命运之轮，请转动——',
      computeOptions(s) {
        return [
          { label: '完美通过·被院长看中', icon: '🌟', rarity: 'SSS', weight: 5 },
          { label: '顺利通过', icon: '✅', rarity: 'A', weight: 30 },
          { label: '勉强通过', icon: '😰', rarity: 'B', weight: 30 },
          { label: '补考通过', icon: '📋', rarity: 'C', weight: 20 },
          { label: '被破格录取', icon: '🎫', rarity: 'S', weight: 10 },
          { label: '失败·被拒之门外', icon: '🚫', rarity: 'C', weight: 5 },
        ]
      },
    },
    {
      key: 'ch4_shrekSeven', title: '⚡ 第八怪？', icon: '👥',
      prelude: '史莱克七怪正在选拔新成员。你会成为第八怪吗？命运之轮，请转动——',
      computeOptions(s) {
        return [
          { label: '成为史莱克第八怪！', icon: '🌟', rarity: 'SSS', weight: 10, worldImpact: { tangSan: { affinity: 20, met: true }, daiMuBai: { met: true, affinity: 15 }, oscar: { met: true }, maHongJun: { met: true }, ningRongRong: { met: true }, zhuZhuQing: { met: true } } },
          { label: '备选成员·还需努力', icon: '🔄', rarity: 'A', weight: 25 },
          { label: '因故错过选拔', icon: '😔', rarity: 'B', weight: 30 },
          { label: '主动放弃·独自修炼', icon: '🚶', rarity: 'A', weight: 20 },
          { label: '和七怪之一结仇', icon: '⚔️', rarity: 'C', weight: 15 },
        ]
      },
    },
    {
      key: 'ch4_grandmaster', title: '大师的指导', icon: '📖',
      prelude: '玉小刚——理论无敌的大师。他愿意指导你吗？命运之轮，请转动——',
      computeOptions(s) {
        return [
          { label: '成为入室弟子', icon: '🎓', rarity: 'SSS', weight: 8, worldImpact: { yuXiaoGang: { met: true, affinity: 30, faction: 'friend' } } },
          { label: '获得指点', icon: '💡', rarity: 'A', weight: 30, worldImpact: { yuXiaoGang: { met: true, affinity: 10 } } },
          { label: '旁听了几节课', icon: '👂', rarity: 'B', weight: 30 },
          { label: '被拒绝', icon: '🙅', rarity: 'C', weight: 20 },
          { label: '被批评后奋发', icon: '💪', rarity: 'S', weight: 12 },
        ]
      },
    },
    {
      key: 'ch4_soulRing4', title: '第四魂环', icon: '💍',
      prelude: '40级！第四魂环的猎取开始了……命运之轮，请转动——',
      computeOptions(s) {
        return [
          { label: '万年·大地之王', icon: '🦂', rarity: 'SS', weight: 5, soulRing: { year: 40000, colorName: '万年', colorHex: '#212121', beast: '大地之王', skill: '岩浆喷涌' } },
          { label: '千年·粉红娘娘', icon: '🦋', rarity: 'S', weight: 15, soulRing: { year: 8000, colorName: '千年', colorHex: '#7B1FA2', beast: '粉红娘娘', skill: '迷幻花粉' } },
          { label: '千年·噬金鼠', icon: '🐭', rarity: 'A', weight: 28, soulRing: { year: 4000, colorName: '千年', colorHex: '#7B1FA2', beast: '噬金鼠', skill: '金属吞噬' } },
          { label: '百年·寒冰蛇', icon: '🐍', rarity: 'B', weight: 30, soulRing: { year: 800, colorName: '百年', colorHex: '#F9A825', beast: '寒冰蛇', skill: '冰霜吐息' } },
          { label: '十年·小草蛇', icon: '🐛', rarity: 'C', weight: 22, soulRing: { year: 80, colorName: '十年', colorHex: '#EEEEEE', beast: '小草蛇', skill: '草缚' } },
        ]
      },
    },
    {
      key: 'ch4_immortalHerb', title: '仙草机缘', icon: '🌿',
      prelude: '学院后山有一处神秘的药圃……命运之轮，请转动——',
      computeOptions(s) {
        return [
          { label: '找到相思断肠红！', icon: '❤️', rarity: 'SSS', weight: 2 },
          { label: '获得八瓣仙兰', icon: '🌸', rarity: 'SS', weight: 10 },
          { label: '发现奇茸通天菊', icon: '🌼', rarity: 'S', weight: 18 },
          { label: '几株普通灵草', icon: '🌱', rarity: 'B', weight: 35 },
          { label: '有毒！中毒了', icon: '☠️', rarity: 'C', weight: 15 },
          { label: '药圃空空如也', icon: '🫗', rarity: 'C', weight: 20 },
        ]
      },
    },
    {
      key: 'ch4_rivalry', title: '学院竞争', icon: '⚔️',
      prelude: '史莱克学院内部竞争激烈。你的立场是……命运之轮，请转动——',
      computeOptions(s) {
        return [
          { label: '与七怪并肩作战', icon: '🤝', rarity: 'SS', weight: 20 },
          { label: '与他们竞争·良性', icon: '🥊', rarity: 'A', weight: 30 },
          { label: '保持独立', icon: '🧍', rarity: 'B', weight: 25 },
          { label: '暗中较劲', icon: '🕶️', rarity: 'A', weight: 15 },
          { label: '产生矛盾', icon: '💢', rarity: 'C', weight: 10 },
        ]
      },
    },
    {
      key: 'ch4_soulBone2', title: '神秘奖励', icon: '🎁',
      prelude: '完成了一个高难度任务后，你获得了一份特殊奖励……命运之轮，请转动——',
      computeOptions(s) {
        return [
          { label: '魂骨！！', icon: '🦴', rarity: 'SSS', weight: 3, soulBone: { slot: 'leftArm', beast: '万年魂兽魂骨', year: 30000, skill: '力量倍增', rarity: 'S' } },
          { label: '自创魂技秘籍', icon: '📕', rarity: 'SS', weight: 10 },
          { label: '高级魂导器', icon: '🔧', rarity: 'A', weight: 22 },
          { label: '大量金币', icon: '💰', rarity: 'B', weight: 30 },
          { label: '口头表扬', icon: '👏', rarity: 'C', weight: 25 },
          { label: '什么都没有·被骗了', icon: '😡', rarity: 'C', weight: 10 },
        ]
      },
    },
    {
      key: 'ch4_chapterEnd', title: '第四章尾声', icon: '🏁',
      prelude: '史莱克学院的日子充实而难忘……命运之轮，请转动——',
      computeOptions(s) {
        return [
          { label: '声名鹊起', icon: '📈', rarity: 'SS', weight: 12 },
          { label: '稳步提升', icon: '📊', rarity: 'A', weight: 30 },
          { label: '不温不火', icon: '➡️', rarity: 'B', weight: 35 },
          { label: '原地踏步', icon: '⏸️', rarity: 'C', weight: 23 },
        ]
      },
    },
  ],
}
