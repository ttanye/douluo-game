// 第3章：星斗大森林 (Lv.21-30) — 含小舞献祭原著干涉事件
import { hasMet, isAlliedWith, innatePowerAbove } from '../conditions'

export const CHAPTER_03 = {
  index: 3, title: '星斗大森林', levelStart: 21, levelEnd: 30,
  steps: [
    {
      key: 'ch3_enterForest',
      title: '踏入森林',
      icon: '🌲',
      prelude: '星斗大森林——斗罗大陆最危险的魂兽聚集地。你深吸一口气，踏入了这片古老的森林……命运之轮，请转动——',
      computeOptions(state) {
        return [
          { label: '偶遇万年魂兽·惊险逃脱', icon: '🐉', rarity: 'SS', weight: 8 },
          { label: '发现仙草·天材地宝', icon: '🌿', rarity: 'SSS', weight: 3 },
          { label: '遇到受伤的魂师', icon: '🩹', rarity: 'A', weight: 22 },
          { label: '平安无事·顺利深入', icon: '🚶', rarity: 'B', weight: 30 },
          { label: '迷路了', icon: '🧭', rarity: 'C', weight: 20 },
          { label: '遭遇魂兽群·狼狈逃离', icon: '🏃', rarity: 'C', weight: 17 },
        ]
      },
    },
    {
      key: 'ch3_soulRing3',
      title: '第三魂环',
      icon: '💍',
      prelude: '你需要一枚更强大的魂环来突破30级的瓶颈……命运之轮，请转动——',
      computeOptions(state) {
        return [
          { label: '万年·泰坦巨猿', icon: '🦍', rarity: 'SSS', weight: 1, soulRing: { year: 80000, colorName: '万年', colorHex: '#212121', beast: '泰坦巨猿', skill: '泰坦之力' } },
          { label: '千年·凤尾鸡冠蛇', icon: '🐔', rarity: 'S', weight: 15, soulRing: { year: 5000, colorName: '千年', colorHex: '#7B1FA2', beast: '凤尾鸡冠蛇', skill: '凤翔' } },
          { label: '千年·麟甲兽', icon: '🦎', rarity: 'A', weight: 25, soulRing: { year: 3500, colorName: '千年', colorHex: '#7B1FA2', beast: '麟甲兽', skill: '麟甲护体' } },
          { label: '百年·鬼藤', icon: '🌿', rarity: 'B', weight: 30, soulRing: { year: 700, colorName: '百年', colorHex: '#F9A825', beast: '鬼藤', skill: '缠绕' } },
          { label: '失败·未获取', icon: '❌', rarity: 'C', weight: 10 },
        ]
      },
    },
    {
      key: 'ch3_xiaoWuEncounter',
      title: '林中少女',
      icon: '🐰',
      prelude: '密林深处，你看到一个粉色长裙的少女正在与魂兽对峙……命运之轮，请转动——',
      resultTemplate: '{label}！{suffix}',
      suffixes: {
        SSS: '你救下了她。少女露出了微笑，那是一切羁绊的开始——',
        S: '你们并肩作战，击退了魂兽。她的眼中闪烁着感激——',
        A: '你们互相帮助，建立了初步的信任。',
        C: '你选择了回避。有时候，错过也是一种命运——',
      },
      computeOptions(state) {
        const metBefore = hasMet('xiaoWu')(state)
        if (metBefore) {
          return [
            { label: '再次并肩作战·羁绊加深', icon: '🤝', rarity: 'SSS', weight: 30, worldImpact: { xiaoWu: { affinity: 25, faction: 'friend' } } },
            { label: '默默守护她', icon: '🛡️', rarity: 'S', weight: 25, worldImpact: { xiaoWu: { affinity: 10 } } },
            { label: '擦肩而过', icon: '🚶', rarity: 'C', weight: 20 },
            { label: '产生了误会', icon: '😤', rarity: 'B', weight: 25, worldImpact: { xiaoWu: { affinity: -15 } } },
          ]
        }
        return [
          { label: '出手相助·初次见面', icon: '🤝', rarity: 'SSS', weight: 25, worldImpact: { xiaoWu: { met: true, affinity: 20, faction: 'friend' } } },
          { label: '袖手旁观', icon: '👀', rarity: 'C', weight: 20 },
          { label: '叫来其他人帮忙', icon: '📢', rarity: 'B', weight: 25 },
          { label: '暗中观察', icon: '🕵️', rarity: 'A', weight: 30 },
        ]
      },
    },
    // === 原著干涉：小舞献祭事件 ===
    {
      key: 'ch3_xiaoWuSacrifice',
      title: '⚡ 命运交织：献祭',
      icon: '🔥',
      prelude: '突然！武魂殿的封号斗罗出现了——他们的目标是那个粉裙少女！她的真实身份是十万年魂兽化形！你……命运之轮，请转动——',
      resultTemplate: '{label}\n\n{suffix}',
      suffixes: {
        SSS: '你燃烧了自己的魂骨，以命换命！少女哭泣着抱住了倒下的你……但命运之线被改写了！',
        SS: '你挡在了她面前！虽然受了重伤，但她活了下来。这份恩情，永生难忘——',
        S: '你制造了混乱，帮助她逃离。武魂殿对你产生了敌意，但你救了一个生命。',
        A: '你选择了明哲保身，暗中联系了援军……但为时已晚。',
        B: '你没有出手。命运的齿轮沿着原来的轨迹转动……',
        C: '你站在了武魂殿一边！这是你一生中最大的污点——',
      },
      computeOptions(state) {
        const metXiaoWu = hasMet('xiaoWu')(state)
        const isFriend = isAlliedWith('xiaoWu')(state)
        if (!metXiaoWu) {
          return [{ label: '这与你无关·离开', icon: '🚶', rarity: 'C', weight: 100 }]
        }
        return [
          { label: '以命换命·献祭自己', icon: '💔', rarity: 'SSS', weight: isFriend ? 8 : 1, worldImpact: { xiaoWu: { alive: true, sacrificed: false, affinity: 100, faction: 'friend', note: '救命之恩，永世不忘' }, biBiDong: { affinity: -30, faction: 'hostile' } } },
          { label: '出手相助·共同抗敌', icon: '⚔️', rarity: 'SS', weight: isFriend ? 20 : 5, worldImpact: { xiaoWu: { alive: true, sacrificed: false, affinity: 50 }, biBiDong: { affinity: -20, faction: 'hostile' } } },
          { label: '制造混乱·帮助逃跑', icon: '💨', rarity: 'S', weight: 25, worldImpact: { xiaoWu: { alive: true, sacrificed: false, affinity: 30 }, biBiDong: { affinity: -10 } } },
          { label: '袖手旁观·无力回天', icon: '😔', rarity: 'A', weight: 30, worldImpact: { xiaoWu: { alive: false, sacrificed: true }, tangSan: { affinity: -30 } } },
          { label: '为时已晚·悲剧发生', icon: '💀', rarity: 'B', weight: 25, worldImpact: { xiaoWu: { alive: false, sacrificed: true } } },
          { label: '帮助武魂殿', icon: '👿', rarity: 'C', weight: 10, worldImpact: { xiaoWu: { alive: false, sacrificed: true }, tangSan: { affinity: -100, faction: 'enemy' }, biBiDong: { affinity: 30 } } },
        ]
      },
    },
    {
      key: 'ch3_aftermath',
      title: '余波',
      icon: '🌊',
      prelude: '星斗大森林的事件震撼了整个魂师界……命运之轮，请转动——',
      computeOptions(state) {
        return [
          { label: '被武魂殿通缉', icon: '🚨', rarity: 'B', weight: 20 },
          { label: '名声大噪', icon: '📢', rarity: 'A', weight: 25 },
          { label: '得到高人庇护', icon: '🛡️', rarity: 'S', weight: 15 },
          { label: '隐姓埋名·低调修炼', icon: '🤫', rarity: 'A', weight: 25 },
          { label: '被牵连受伤', icon: '🤕', rarity: 'C', weight: 15 },
        ]
      },
    },
    {
      key: 'ch3_secretRealm',
      title: '秘境奇遇',
      icon: '🏞️',
      prelude: '在森林深处，你意外发现了一处远古秘境……命运之轮，请转动——',
      computeOptions(state) {
        return [
          { label: '获得远古传承！', icon: '🌟', rarity: 'SSS', weight: 2 },
          { label: '找到魂骨', icon: '🦴', rarity: 'SS', weight: 8, soulBone: { slot: 'leftLeg', beast: '远古魂兽残留', year: 50000, skill: '疾风步', rarity: 'S' } },
          { label: '收获大量仙草', icon: '🌿', rarity: 'S', weight: 15 },
          { label: '发现古老的修炼法门', icon: '📜', rarity: 'A', weight: 25 },
          { label: '只找到一些普通药草', icon: '🌱', rarity: 'B', weight: 30 },
          { label: '秘境塌了·什么也没拿到', icon: '💥', rarity: 'C', weight: 20 },
        ]
      },
    },
    {
      key: 'ch3_iceFireWell',
      title: '⚡ 冰火两仪眼',
      icon: '🌡️',
      prelude: '在森林最深处，你发现了传说中的冰火两仪眼！两极泉水交汇之地，周围生长着无数仙草灵药。一个苍老的声音从毒雾中传来："小辈，你可知这里是什么地方？"——是毒斗罗独孤博！命运之轮，请转动——',
      resultTemplate: '{label}！{suffix}',
      suffixes: {
        SSS: '独孤博收你为记名弟子！你获得了奇茸通天菊和八瓣仙兰的馈赠！等级飙升五级！',
        SS: '独孤博允许你在冰火两仪眼修炼一日！魂力大增——',
        S: '你凭借武魂的特殊性，成功抵御了毒雾，获得了一株珍贵仙草！',
        A: '你在独孤博的默许下采集了一些仙草。虽然不多，但已是天大的机缘。',
        B: '独孤博没有为难你，但也未给予帮助。你只能在外围采集了些许药草。',
        C: '毒雾弥漫，你不得不远远避开。但亲眼见到冰火两仪眼，已是不虚此行。',
      },
      computeOptions(state) {
        const isPoisonRelated = state.attributes?.soulType === '毒系武魂' || state.attributes?.race === '邪魂师血脉'
        const highInnate = (state.attributes?.innatePower || 0) >= 8
        return [
          { label: '独孤博收为记名弟子·仙草馈赠', icon: '🧪', rarity: 'SSS', weight: isPoisonRelated ? 8 : (highInnate ? 4 : 1), levelBoost: 5,
            worldImpact: { duGuBo: { met: true, affinity: 30 } } },
          { label: '获准修炼一日·魂力大增',       icon: '💪', rarity: 'SS',  weight: 10, levelBoost: 3 },
          { label: '抵御毒雾·夺得仙草',           icon: '🌿', rarity: 'S',   weight: isPoisonRelated ? 25 : 15, levelBoost: 2 },
          { label: '默许采集·小有收获',           icon: '🌱', rarity: 'A',   weight: 28, levelBoost: 1 },
          { label: '外围采药·聊胜于无',           icon: '🍃', rarity: 'B',   weight: 26 },
          { label: '毒雾太浓·远远观望',           icon: '☠️', rarity: 'C',   weight: 10 },
        ]
      },
    },
    {
      key: 'ch3_chapterEnd',
      title: '第三章尾声',
      icon: '🏁',
      prelude: '星斗大森林的故事结束了。有人失去了生命，有人收获了力量……命运之轮，请转动——',
      computeOptions(state) {
        return [
          { label: '满载而归', icon: '🎉', rarity: 'SS', weight: 10 },
          { label: '收获颇丰', icon: '👍', rarity: 'A', weight: 25 },
          { label: '有得有失', icon: '⚖️', rarity: 'B', weight: 35 },
          { label: '伤痕累累', icon: '🤕', rarity: 'C', weight: 20 },
          { label: '失去重要之物', icon: '💔', rarity: 'C', weight: 10 },
        ]
      },
    },
  ],
}
