// 隐藏秘密事件池 — 极低概率（2%）触发的超级奇遇
export const SECRET_POOL = [
  {
    id: 'secret_dragonGod',
    title: '🔮 龙神残魂降临',
    icon: '🐉',
    prelude: '天空裂开了——一道金色的龙形虚影从天而降，直接没入了你的体内！远古龙神的残魂选择了你作为宿主！命运之轮，请转动——',
    computeOptions(state) {
      return [
        { label: '完美融合·武魂进化为龙神武魂！！', icon: '🐲', rarity: 'SSS', weight: 30, levelBoost: 15,
          worldImpact: { dragonGod: { fused: true } } },
        { label: '部分融合·获得龙神之力',           icon: '💪', rarity: 'SS', weight: 40, levelBoost: 10 },
        { label: '勉强承受·魂力暴涨',               icon: '⚡', rarity: 'S', weight: 20, levelBoost: 7 },
        { label: '无法承受·部分力量逸散',           icon: '💨', rarity: 'A', weight: 10, levelBoost: 4 },
      ]
    },
  },
  {
    id: 'secret_timeRift',
    title: '🔮 时空裂缝',
    icon: '🌀',
    prelude: '一道时空裂缝突然在你面前撕裂开来！从裂缝中，你看到了万年后斗罗大陆的景象——魂导科技的时代。一个声音呼唤着你……命运之轮，请转动——',
    computeOptions(state) {
      return [
        { label: '穿越万年后·获得魂导科技！！', icon: '🔧', rarity: 'SSS', weight: 20, levelBoost: 12, unlocks: ['futureTechPath'] },
        { label: '从裂缝中取出未来武器',         icon: '🔫', rarity: 'SS', weight: 30, levelBoost: 8 },
        { label: '与未来之人短暂交流·获得知识', icon: '💡', rarity: 'S', weight: 25, levelBoost: 6 },
        { label: '裂缝关闭·只留下一件信物',     icon: '🎖️', rarity: 'A', weight: 15, levelBoost: 4 },
        { label: '被裂缝吸入·但安全返回',       icon: '🌌', rarity: 'B', weight: 10, levelBoost: 5 },
      ]
    },
  },
  {
    id: 'secret_godArtifact',
    title: '🔮 神界偷渡者',
    icon: '👼',
    prelude: '一个慌慌张张的身影从神界裂缝中跌落出来！"求求你——帮我躲起来，追杀我的人在找我！作为回报，我可以给你一件神器！"命运之轮，请转动——',
    computeOptions(state) {
      return [
        { label: '帮助他·获得神器·海神三叉戟碎片！！', icon: '🔱', rarity: 'SSS', weight: 20, levelBoost: 10, worldImpact: { godFugitive: { saved: true, affinity: 60 } } },
        { label: '帮助他·获得神器·修罗神剑碎片',       icon: '⚔️', rarity: 'SSS', weight: 20, levelBoost: 10 },
        { label: '帮他藏匿·获得天使圣衣',              icon: '👗', rarity: 'SS', weight: 25, levelBoost: 7 },
        { label: '出卖他·获得神界悬赏',                icon: '💰', rarity: 'S', weight: 20, levelBoost: 5, worldImpact: { godFugitive: { saved: false } } },
        { label: '不惹麻烦·赶紧走',                    icon: '🏃', rarity: 'B', weight: 15, levelBoost: 2 },
      ]
    },
  },
  {
    id: 'secret_originBeast',
    title: '🔮 远古凶兽觉醒',
    icon: '🦖',
    prelude: '大地震颤！一头沉睡万年的远古凶兽在你脚下苏醒！整个森林都在它的咆哮中颤抖——但它的眼中，似乎对你有着某种……亲近？命运之轮，请转动——',
    computeOptions(state) {
      const beastRace = state.attributes?.race === '魂兽化形' || state.attributes?.race === '远古魂兽血脉'
      return [
        { label: '与凶兽缔结契约·成为伙伴！！', icon: '🤝', rarity: 'SSS', weight: beastRace ? 20 : 8, levelBoost: 15, worldImpact: { originBeast: { tamed: true } } },
        { label: '获得它蜕下的远古魂骨',         icon: '🦴', rarity: 'SS', weight: 25, levelBoost: 10, soulBone: { slot: 'external', beast: '远古凶兽', year: 1000000, skill: '远古咆哮', rarity: 'SSS' } },
        { label: '吸收它的残余魂力',             icon: '💨', rarity: 'S', weight: 30, levelBoost: 8 },
        { label: '趁它虚弱·获取魂环',           icon: '⚔️', rarity: 'A', weight: 20, levelBoost: 6, soulRing: { year: 500000, colorName: '五十万年', colorHex: '#FF1744', beast: '远古凶兽', skill: '远古之怒' } },
        { label: '逃命要紧！！',                 icon: '🏃', rarity: 'C', weight: 17, levelBoost: 3 },
      ]
    },
  },
  {
    id: 'secret_reincarnation',
    title: '🔮 轮回之眼',
    icon: '👁️',
    prelude: '你在修炼时突然进入了顿悟状态——时间仿佛静止了。你看到了自己的前世、前前世……无数个轮回中的自己。所有记忆在一瞬间涌入脑海！命运之轮，请转动——',
    computeOptions(state) {
      return [
        { label: '觉醒轮回记忆·掌握上古禁术！！', icon: '📜', rarity: 'SSS', weight: 15, levelBoost: 12, unlocks: ['reincarnationPath'] },
        { label: '融合前世力量·魂力暴涨',         icon: '💥', rarity: 'SS', weight: 30, levelBoost: 10 },
        { label: '看到未来的片段·获得预言',       icon: '🔮', rarity: 'S', weight: 25, levelBoost: 6 },
        { label: '记忆太多·头痛欲裂',             icon: '🤯', rarity: 'A', weight: 20, levelBoost: 4 },
        { label: '从顿悟中醒来·若有所失',         icon: '😶', rarity: 'B', weight: 10, levelBoost: 3 },
      ]
    },
  },
]
