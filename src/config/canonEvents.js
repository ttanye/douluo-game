// 原著干涉事件表 — 跨章节的高影响力原著事件
// 这些事件在特定条件下触发，改变原著角色命运

import { hasMet, isAlliedWith, isEnemyOf, levelAbove, worldEventHappened } from './conditions'

export const CANON_EVENTS = [
  // ===== 小舞献祭 (第3章) =====
  {
    id: 'xiaoWuSacrifice',
    title: '星斗大森林·献祭',
    chapter: 3,
    triggerCondition: (state, world) => hasMet('xiaoWu')(state) && !worldEventHappened('xiaoWuSacrifice', world),
    description: '武魂殿封号斗罗捕捉十万年魂兽小舞！你的选择将改变她的命运——',
    baseOptions: [
      { label: '以命换命',   faction: 'hero',    outcome: 'xiaoWuAlive_sacrificedSelf' },
      { label: '出手相助',   faction: 'hero',    outcome: 'xiaoWuAlive_wounded' },
      { label: '袖手旁观',   faction: 'neutral', outcome: 'xiaoWuDead' },
      { label: '帮助武魂殿', faction: 'villain', outcome: 'xiaoWuDead_betrayed' },
    ],
  },

  // ===== 史莱克八怪 (第4章) =====
  {
    id: 'shrekEighth',
    title: '史莱克学院·第八怪',
    chapter: 4,
    triggerCondition: (state) => levelAbove(30)(state),
    description: '史莱克七怪正在寻找第八名成员。你会成为传说中的第八怪吗？',
    baseOptions: [
      { label: '加入·第八怪诞生', faction: 'hero', outcome: 'eighthMember' },
      { label: '拒绝·独行侠',     faction: 'neutral', outcome: 'solo' },
    ],
  },

  // ===== 猎魂行动站队 (第6章) =====
  {
    id: 'spiritHuntStance',
    title: '猎魂行动·立场',
    chapter: 6,
    triggerCondition: (state, world) => levelAbove(50)(state),
    description: '武魂殿发动猎魂行动！是站在武魂殿一方，还是与之对抗？',
    baseOptions: [
      { label: '对抗武魂殿',  faction: 'hero',    outcome: 'againstWuHunDian' },
      { label: '保持中立',    faction: 'neutral', outcome: 'neutral' },
      { label: '加入武魂殿',  faction: 'villain', outcome: 'joinWuHunDian' },
    ],
  },

  // ===== 海神传承 (第7章) =====
  {
    id: 'seaGodInheritance',
    title: '海神岛·神位传承',
    chapter: 7,
    triggerCondition: (state) => levelAbove(60)(state),
    description: '海神九考！你与唐三都有资格接受海神传承。谁将成为海神？',
    baseOptions: [
      { label: '与唐三竞争',    faction: 'rival',   outcome: 'compete' },
      { label: '辅助唐三',      faction: 'hero',    outcome: 'supportTangSan' },
      { label: '放弃海神传承',  faction: 'neutral', outcome: 'abandon' },
    ],
  },

  // ===== 双神之战 (第10章) =====
  {
    id: 'godWar',
    title: '神界·双神之战',
    chapter: 10,
    triggerCondition: (state) => levelAbove(90)(state),
    description: '最终决战！你的立场将决定斗罗大陆的未来——',
    baseOptions: [
      { label: '与唐三并肩·双神战双神', faction: 'hero',    outcome: 'duoGods' },
      { label: '对抗唐三',               faction: 'villain', outcome: 'againstTangSan' },
      { label: '置身事外',               faction: 'neutral', outcome: 'bystander' },
    ],
  },
]

/**
 * 获取在当前条件下可触发的原著事件
 */
export function getActiveCanonEvents(state, worldState) {
  return CANON_EVENTS.filter(ev => ev.triggerCondition(state, worldState))
}

/**
 * 获取特定事件
 */
export function getCanonEvent(eventId) {
  return CANON_EVENTS.find(ev => ev.id === eventId)
}
