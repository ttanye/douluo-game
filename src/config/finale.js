// 终章：封神之时 — 10步收束命运
import { hasMet, isAlliedWith, isEnemyOf } from './conditions'

export const FINALE_STEPS = [
  {
    key: 'finale_godPosition',
    title: '最终神位',
    icon: '🌟',
    prelude: '神界之光笼罩着你。漫长的旅途即将迎来终点……命运之轮，请转动——',
    computeOptions(state) {
      return [
        { label: '海神',    icon: '🌊', rarity: 'SSS', weight: 10 },
        { label: '修罗神',  icon: '⚔️', rarity: 'SSS', weight: 10 },
        { label: '天使神',  icon: '👼', rarity: 'SS',  weight: 12 },
        { label: '罗刹神',  icon: '👿', rarity: 'SS',  weight: 8 },
        { label: '自创神位', icon: '💫', rarity: 'SSS', weight: 8 },
        { label: '一级神祇', icon: '⭐', rarity: 'S',   weight: 20 },
        { label: '未成神',   icon: '😔', rarity: 'C',   weight: 32 },
      ]
    },
  },
  {
    key: 'finale_title',
    title: '最终封号',
    icon: '👑',
    prelude: '你的封号将与神位一同载入史册……命运之轮，请转动——',
    computeOptions(state) {
      return [
        { label: '龙神斗罗',   icon: '🐉', rarity: 'SSS', weight: 5 },
        { label: '命运斗罗',   icon: '🔮', rarity: 'SSS', weight: 5 },
        { label: '苍穹斗罗',   icon: '☁️', rarity: 'SS',  weight: 15 },
        { label: '不朽斗罗',   icon: '💎', rarity: 'SS',  weight: 15 },
        { label: '轮回斗罗',   icon: '🔄', rarity: 'S',   weight: 25 },
        { label: '无名斗罗',   icon: '❓', rarity: 'C',   weight: 35 },
      ]
    },
  },
  {
    key: 'finale_canonEndings',
    title: '原著角色结局',
    icon: '📜',
    prelude: '因你的存在而改变的原著角色们，他们的结局如何？命运之轮，请转动——',
    computeOptions(state) {
      const metTangSan = hasMet('tangSan')(state)
      const metXiaoWu = hasMet('xiaoWu')(state)
      return [
        { label: '皆大欢喜·全员善终',     icon: '🎉', rarity: 'SSS', weight: metTangSan && metXiaoWu ? 20 : 5 },
        { label: '有圆满亦有遗憾',         icon: '⚖️', rarity: 'A',   weight: 35 },
        { label: '牺牲是不可避免的',       icon: '💔', rarity: 'B',   weight: 25 },
        { label: '悲剧收场·无力回天',     icon: '😢', rarity: 'C',   weight: 10 },
        { label: '你改写了所有人的命运',   icon: '✍️', rarity: 'SSS', weight: 5 },
      ]
    },
  },
  {
    key: 'finale_rest',
    title: '归宿',
    icon: '🏠',
    prelude: '成神之后，你选择……命运之轮，请转动——',
    computeOptions(state) {
      return [
        { label: '飞升神界·执掌一方',  icon: '☁️', rarity: 'SSS', weight: 15 },
        { label: '留在大陆·默默守护',  icon: '🛡️', rarity: 'SS',  weight: 25 },
        { label: '周游各界·逍遥自在',  icon: '🌍', rarity: 'S',   weight: 25 },
        { label: '隐居山林·不问世事',  icon: '🏔️', rarity: 'A',   weight: 20 },
        { label: '消散于天地之间',      icon: '💨', rarity: 'C',   weight: 10 },
        { label: '堕入轮回·重新开始',  icon: '🔄', rarity: 'B',   weight: 5 },
      ]
    },
  },
  {
    key: 'finale_legacy',
    title: '留下传承',
    icon: '📖',
    prelude: '你将留下什么给后世？命运之轮，请转动——',
    computeOptions(state) {
      return [
        { label: '完整的神位传承', icon: '🔱', rarity: 'SSS', weight: 12 },
        { label: '一套自创魂技体系', icon: '📕', rarity: 'SS', weight: 22 },
        { label: '一间学院', icon: '🏫', rarity: 'A', weight: 28 },
        { label: '一本书', icon: '📓', rarity: 'B', weight: 23 },
        { label: '什么都没有留下', icon: '🫗', rarity: 'C', weight: 15 },
      ]
    },
  },
  {
    key: 'finale_legend',
    title: '千年后的传说',
    icon: '📚',
    prelude: '千年之后，你的故事将如何被传颂？命运之轮，请转动——',
    computeOptions(state) {
      return [
        { label: '神话·永世传颂',   icon: '🌟', rarity: 'SSS', weight: 10 },
        { label: '传奇·世代铭记',   icon: '📕', rarity: 'SS',  weight: 22 },
        { label: '史书一页',         icon: '📄', rarity: 'A',   weight: 30 },
        { label: '民间故事',         icon: '🗣️', rarity: 'B',   weight: 23 },
        { label: '被时间遗忘',       icon: '⌛', rarity: 'C',   weight: 15 },
      ]
    },
  },
]

export function getFinaleStep(index) {
  return FINALE_STEPS[index] || null
}
