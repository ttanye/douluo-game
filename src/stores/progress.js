// 进度管理 Store v2 — 事件池 + 等级门控 + 内容解锁
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useProgressStore = defineStore('progress', () => {
  // ========== 核心状态 ==========
  const phase = ref('prequel')
  const stepIndex = ref(0)
  const totalStepsCompleted = ref(0)
  const totalSteps = ref(80)

  // ========== 年龄系统 ==========
  const currentAge = ref(6)
  const ageEventsCompleted = ref([])
  const requiredPerAge = 10  // 每个年龄段完成10个事件后进入下一岁
  const ageNarrative = ref('')  // 年龄进阶时的叙事文本

  // ========== 事件追踪 ==========
  const eventHistory = ref([])       // 已完成的事件 ID 列表
  const eventCooldown = ref({})      // { eventId: remainingSteps } 冷却倒计时
  const eventRepeatCount = ref({})   // { eventId: count } 重复次数（权重衰减用）
  const unlockedEvents = ref([])     // 由选择解锁的额外事件 ID
  const narrativeFlags = ref({})     // 叙事标记，注入到后续 prelude
  const currentPool = ref([])        // 当前可选事件池
  const currentEvent = ref(null)     // 当前正在执行的事件配置

  // ========== 等级门控 ==========
  const currentLevel = ref(1)

  // ========== 事件类型 ==========
  const eventType = ref('creation')

  // ========== 章节标题（用于 UI 展示，实际流程不由章节控制） ==========
  const chapterTitle = ref('序章：命运之始')

  // ========== Getters ==========
  const isComplete = computed(() => phase.value === 'finale' && stepIndex.value >= 4)
  const progressPercent = computed(() => {
    return Math.min(100, Math.round((totalStepsCompleted.value / totalSteps.value) * 100))
  })
  
  const canAdvance = computed(() => currentEvent.value !== null)
  
  // 是否应该触发终章
  const shouldTriggerFinale = computed(() => {
    return currentLevel.value >= 100 && phase.value === 'growth'
  })

  // ========== Actions ==========

  /** 设置当前等级（由 characterStore 调用） */
  function setLevel(level) {
    currentLevel.value = level
  }

  /** 解锁事件 */
  function unlockEvent(eventId) {
    if (!unlockedEvents.value.includes(eventId)) {
      unlockedEvents.value.push(eventId)
    }
  }

  /** 解锁多个事件 */
  function unlockEvents(eventIds) {
    eventIds.forEach(id => unlockEvent(id))
  }

  /** 从事件池中选择下一个事件 — 三层抽取 + 冷却 */
  function selectNextEvent(mainPool, wildcardPool = [], secretPool = [], soulRings = null) {
    const level = currentLevel.value
    const history = eventHistory.value
    const cooldown = eventCooldown.value
    const repeatCount = eventRepeatCount.value
    const unlocked = unlockedEvents.value

    // 冷却递减
    for (const key of Object.keys(cooldown)) {
      cooldown[key]--
      if (cooldown[key] <= 0) delete cooldown[key]
    }

    // ====== 第1层：秘密事件（2%概率，冷却1步） ======
    if (secretPool.length > 0 && Math.random() < 0.02) {
      const eligibleSecrets = secretPool.filter(ev => !cooldown[ev.id])
      if (eligibleSecrets.length > 0) {
        const pick = eligibleSecrets[Math.floor(Math.random() * eligibleSecrets.length)]
        currentEvent.value = pick
        return pick
      }
    }

    // ====== 第2层：野怪事件（15%概率，冷却1步） ======
    if (wildcardPool.length > 0 && Math.random() < 0.15) {
      const eligibleWild = wildcardPool.filter(ev => !cooldown[ev.id])
      if (eligibleWild.length > 0) {
        const pick = eligibleWild[Math.floor(Math.random() * eligibleWild.length)]
        currentEvent.value = pick
        return pick
      }
    }

    // ====== 第3层：主线事件池（等级过滤 + 洗牌后加权） ======
    // 魂环事件95%优先，魂骨事件50%优先
    const ringMilestones = mainPool.filter(ev => {
      if (!ev.isMilestone) return false
      if (cooldown[ev.id]) return false
      if (ev.id.startsWith('ring_lv')) {
        const slot = parseInt(ev.id.replace('ring_lv', '')) / 10 - 1
        if (soulRings && soulRings[slot]) return false
        return level >= (ev.minLevel||0) && level <= (ev.maxLevel||100)
      }
      return false
    })
    
    const boneMilestones = mainPool.filter(ev => {
      if (!ev.isMilestone) return false
      if (cooldown[ev.id]) return false
      if (ev.id.startsWith('boneHunt_lv')) {
        return level >= (ev.minLevel||0) && level <= (ev.maxLevel||100)
      }
      return false
    })
    
    if (ringMilestones.length > 0 && Math.random() < 0.95) {
      const pick = ringMilestones[Math.floor(Math.random() * ringMilestones.length)]
      currentEvent.value = pick
      return pick
    }
    
    if (boneMilestones.length > 0 && Math.random() < 0.5) {
      const pick = boneMilestones[Math.floor(Math.random() * boneMilestones.length)]
      currentEvent.value = pick
      return pick
    }
    
    const otherMilestones = mainPool.filter(ev => {
      if (!ev.isMilestone) return false
      if (cooldown[ev.id]) return false
      if (ev.id.startsWith('ring_lv') || ev.id.startsWith('boneHunt_lv')) return false
      return level >= (ev.minLevel||0)
    })
    
    // 链优先：分离出正在进行的弧线链事件（前置已满足）
    const chainMilestones = otherMilestones.filter(ev => {
      if (!ev.requiredEvents?.length) return false
      return ev.requiredEvents.some(req => history.includes(req) || unlocked.includes(req))
    })
    const newMilestones = otherMilestones.filter(ev => !chainMilestones.includes(ev))
    
    let pooledEvents = mainPool
    // 链事件100%优先，稀有度加权
    if (chainMilestones.length > 0) {
      const rarityW = { SSS: 10, SS: 6, S: 4, A: 2, B: 1.5, C: 1 }
      const weights = chainMilestones.map(ev => (rarityW[ev.rarity || 'C'] || 1) * (ev.weight || 40))
      const totalW = weights.reduce((s, w) => s + w, 0)
      let r = Math.random() * totalW
      let pick = chainMilestones[0]
      for (let i = 0; i < weights.length; i++) {
        r -= weights[i]
        if (r <= 0) { pick = chainMilestones[i]; break }
      }
      currentEvent.value = pick
      currentPool.value = chainMilestones
      return pick
    }
    // 其他里程碑80%概率，稀有度加权
    if (newMilestones.length > 0 && Math.random() < 0.8) {
      const rarityW = { SSS: 10, SS: 6, S: 4, A: 2, B: 1.5, C: 1 }
      const weights = newMilestones.map(ev => (rarityW[ev.rarity || 'C'] || 1) * (ev.weight || 40))
      const totalW = weights.reduce((s, w) => s + w, 0)
      let r = Math.random() * totalW
      let pick = newMilestones[0]
      for (let i = 0; i < weights.length; i++) {
        r -= weights[i]
        if (r <= 0) { pick = newMilestones[i]; break }
      }
      currentEvent.value = pick
      currentPool.value = newMilestones
      return pick
    }
    
    const eligible = pooledEvents.filter(ev => {
      // 魂环/魂骨仍按等级，已获取不重复
      if (ev.id.startsWith('ring_lv')) {
        const slot = parseInt(ev.id.replace('ring_lv', '')) / 10 - 1
        if (soulRings && soulRings[slot]) return false
        if (ev.minLevel && level < ev.minLevel) return false
        if (ev.maxLevel && level > ev.maxLevel) return false
      } else if (ev.id.startsWith('boneHunt_lv')) {
        if (ev.minLevel && level < ev.minLevel) return false
        if (ev.maxLevel && level > ev.maxLevel) return false
      } else {
        if (ev.minLevel && level < ev.minLevel) return false
        // 不再过滤 maxLevel — 等级超过也能触发
      }
      if (cooldown[ev.id]) return false
      // 前置事件
      if (ev.requiredEvents) {
        for (const req of ev.requiredEvents) {
          if (!history.includes(req) && !unlocked.includes(req)) return false
        }
      }
      // 互斥事件
      if (ev.excludedEvents) {
        for (const excl of ev.excludedEvents) {
          if (history.includes(excl)) return false
        }
      }
      // 互斥组
      if (ev.exclusiveGroup && history.some(hid => {
        const hEv = mainPool.find(e => e.id === hid)
        return hEv && hEv.exclusiveGroup === ev.exclusiveGroup
      })) {
        return false
      }
      return true
    })

    // 池空 → 返回 null，由调用方处理跳级
    if (eligible.length === 0) return null

    // 随机打乱
    const shuffled = [...eligible].sort(() => Math.random() - 0.5)

    // 加权抽取（重复次数衰减权重）
    const weights = shuffled.map(ev => {
      const rarityW = { SSS: 10, SS: 6, S: 4, A: 2, B: 1.5, C: 1 }
      const base = rarityW[ev.rarity || 'C'] || 1
      const repeats = repeatCount[ev.id] || 0
      return base * Math.pow(0.5, repeats)  // 每次重复 ×0.5，3次后权重仅12.5%
    })

    const totalW = weights.reduce((s, w) => s + w, 0)
    let r = Math.random() * totalW
    let selectedIdx = 0
    for (let i = 0; i < weights.length; i++) {
      r -= weights[i]
      if (r <= 0) { selectedIdx = i; break }
    }

    const selected = shuffled[selectedIdx]
    currentEvent.value = selected
    currentPool.value = eligible
    return selected
  }

  function completeCurrentEvent() {
    if (currentEvent.value) {
      const id = currentEvent.value.id || currentEvent.value.key || ''
      eventHistory.value.push(id)
      
      // 冷却机制：一次性事件永久冷却，魂环/魂骨冷却1步，其他3步
      const onceOnly = id.startsWith('first') || id.startsWith('chapter_climax') || id.startsWith('xiaoWuEncounter') ||
        id.startsWith('enterForest') || id === 'shrekEntrance' || id === 'shrekEighth' || id === 'canon_shrekForm' ||
        id === 'bridge_notting' || id === 'bridge_toShrek' || id === 'bridge_afterTournament' || id === 'bridge_beforeVoyage' ||
        id.startsWith('milestone_lv') || id === 'graduation' || id === 'spiderLance_get' || id === 'spiderLance_evolve' ||
        id === 'blueSilver_awaken' || id === 'blueSilver_evolve' || id.startsWith('death_seed') || id.startsWith('asura_call') ||
        id === 'iceFireWell' || id === 'slaughterCity' || id === 'hellRoad' || id === 'tang_forge' || id === 'tang_oath' ||
        id.startsWith('xiaoWu_') || id.startsWith('dai_') || id.startsWith('rong_') || id === 'tang_farewell' ||
        id.startsWith('lvl_') || id.startsWith('canon_shrekForm') || id.startsWith('canon_tournamentFinal') ||
        id.startsWith('canon_haotianReturn') || id.startsWith('canon_empireForm') || id.startsWith('canon_jialingPass') ||
        id.startsWith('canon_godWar') || id === 'huntStarted' || id === 'tangSectWeapons' || id === 'fourClans' ||
        id === 'seaVoyage' || id === 'seaGodTrial' || id === 'titleDouluo' || id === 'godTrial' || id === 'godChoice' ||
        id === 'godRealmThree' || id === 'ascension' || id === 'stayMortal' || id === 'eternalSeal' || id === 'seaReturn' ||
        id === 'doulouTower' || id === 'avatarTrial' || id === 'hiddenWeaponDev' || id.startsWith('fusion_') ||
        id.startsWith('canon_') || id.startsWith('arc_seagod_') || id.startsWith('arc_angel_') || id.startsWith('arc_asura_') ||
        id.startsWith('weapon_') && !id.endsWith('_iron') ||
        id.startsWith('interact_') || id.startsWith('chain_') || id.startsWith('cmb_') || id.startsWith('battle_') ||
        id.startsWith('tang_forge_') || id.startsWith('bone_fusion_') || id.startsWith('haotian_') ||
        id.startsWith('blueSilver_') || id.startsWith('past_') || id.startsWith('seagod_') || id.startsWith('shrek_') ||
        id.startsWith('duguPoison_') || id.startsWith('clan_') || id.startsWith('qianxue_') ||
        id.startsWith('event_') || id.startsWith('artifact_') ||
        id === 'roommate' || id === 'rival' || id === 'secretTraining' || id === 'tournament' ||
        id === 'nottingDorm' || id === 'villageMarket' || id === 'childhoodMemory'
        // weapon_iron can repeat, others are one-time
      const isQuick = id.startsWith('ring_lv') || id.startsWith('boneHunt_lv') || id.startsWith('wild_') || id.startsWith('secret_')
      eventCooldown.value[id] = onceOnly ? 9999 : (id.startsWith('ring_lv') ? 3 : (id.startsWith('boneHunt_lv') ? 5 : (isQuick ? 2 : 8)))
      
      // 记录重复次数（权重衰减）
      if (id) eventRepeatCount.value[id] = (eventRepeatCount.value[id] || 0) + 1
      
      totalStepsCompleted.value++
      stepIndex.value++
      
      // 更新章节标题
      updateChapterTitle()
    }
    currentEvent.value = null
  }

  /** 更新章节标题（基于等级） */
  function updateChapterTitle() {
    const lv = currentLevel.value
    if (lv <= 10) chapterTitle.value = '武魂觉醒'
    else if (lv <= 20) chapterTitle.value = '诺丁学院'
    else if (lv <= 30) chapterTitle.value = '星斗大森林'
    else if (lv <= 40) chapterTitle.value = '史莱克学院'
    else if (lv <= 50) chapterTitle.value = '全大陆精英赛'
    else if (lv <= 60) chapterTitle.value = '大陆风云'
    else if (lv <= 70) chapterTitle.value = '海神岛'
    else if (lv <= 80) chapterTitle.value = '武魂帝国崛起'
    else if (lv <= 90) chapterTitle.value = '封号斗罗'
    else if (lv <= 100) chapterTitle.value = '神位之争'
    else chapterTitle.value = '终章：封神之时'
  }

  function getAgeAdvanceText(age) {
    const texts = {
      7: '一年过去，你已经适应了诺丁学院的生活。武魂的潜力正在被一点点挖掘出来。',
      9: '你告别了诺丁学院，踏上了前往史莱克的道路。前方的世界更加广阔——也更加危险。',
      11: '大陆的风云变幻，武魂殿的阴影笼罩了整个魂师界。你已经不是当初那个懵懂少年了。',
      13: '海风吹拂，海神岛就在前方。你已经站在了魂师界的顶端，但更高的神之领域正在召唤。',
      15: '封号加身，神的门槛触手可及。你走过的每一步都在此刻汇聚——成神之路，就在眼前。',
      16: '百级成神。你站在了斗罗大陆的巅峰。那些与你并肩作战的伙伴，那些你做出的抉择——都将成为永恒的传说。',
    }
    return texts[age] || `时光飞逝，你已经${age}岁了。新的冒险在等待着你。`
  }

  /** 回退一步 */
  function retreat() {
    if (eventHistory.value.length === 0) return false
    eventHistory.value.pop()
    totalStepsCompleted.value = Math.max(0, totalStepsCompleted.value - 1)
    stepIndex.value = Math.max(0, stepIndex.value - 1)
    currentEvent.value = null
    updateChapterTitle()
    return true
  }

  /** 跳到下一等级区间的最小等级 */
  function jumpToNextBracket() {
    const lv = currentLevel.value
    const brackets = [1, 11, 21, 31, 41, 51, 61, 71, 85, 91]
    for (const b of brackets) {
      if (b > lv) {
        currentLevel.value = b
        return b
      }
    }
    return lv
  }

  /** 设置叙事标记 */
  function setNarrativeFlag(key, value) {
    narrativeFlags.value[key] = value
  }

  /** 获取叙事前缀（注入到 prelude 前） */
  function getNarrativePrefix() {
    const flags = narrativeFlags.value
    const parts = []
    if (flags.savedXiaoWu) parts.push('你想起那天在星斗大森林救下的粉裙少女——')
    if (flags.joinedWuHun) parts.push('武魂殿的徽章在胸前微微发热——')
    if (flags.againstWuHun) parts.push('反抗的火焰在你心中从未熄灭——')
    if (flags.godInherited) parts.push('神位传承的印记在你额间闪烁——')
    if (flags.killingDomain) parts.push('杀神领域的气息在你周身弥漫——')
    
    // 选择回响：基于历史事件
    const history = eventHistory.value
    if (history.length > 0) {
      const lastEvent = history[history.length - 1]
      const echoMap = {
        'xiaoWuSacrifice': history.includes('xiaoWuEncounter') ? '你还记得那个在森林中遇到的少女……' : '',
        'slaughterCity': '杀戮之都的血腥味仿佛还在鼻尖——',
        'iceFireWell': '冰火两仪眼的仙草香气仍在记忆中萦绕——',
        'shrekEighth': '史莱克七怪的友谊是你最珍贵的财富——',
      }
      if (echoMap[lastEvent] && Math.random() < 0.3) parts.push(echoMap[lastEvent])
    }
    
    return parts.length > 0 ? parts[Math.floor(Math.random() * parts.length)] + '\n\n' : ''
  }

  /** 地点首次访问标记 */
  const visitedLocations = ref({})

  function markLocationVisited(loc) {
    if (!visitedLocations.value[loc]) {
      visitedLocations.value[loc] = true
      return true  // 首次访问
    }
    return false
  }

  /** 获取地点首次访问的环境描写 */
  function getLocationIntro(loc) {
    const intros = {
      '星斗大森林': '🌲 古木参天，魂兽的低吼在暗处回荡。空气中弥漫着泥土与血腥的气息——星斗大森林，斗罗大陆最危险也最神秘的魂兽聚集地。',
      '海神岛': '🏝️ 咸湿的海风扑面而来，巨大的海神雕像矗立在圣柱之上。海浪拍打着礁石，发出万年不变的轰鸣——传说中的海神岛，就在眼前。',
      '诺丁城': '🏘️ 诺丁城——一座普通的边陲小城，却是无数魂师故事的起点。武魂殿分殿的尖顶在晨雾中若隐若现。',
      '史莱克学院': '🏫 史莱克学院——只收怪物，不收普通人。简陋的木门上挂着的这块牌子，让多少天才望而却步。',
      '杀戮之都': '🏚️ 地下世界。空气中弥漫着血腥与酒精的混合气味。这里没有法律，只有杀戮——欢迎来到杀戮之都。',
      '武魂殿': '⛪ 武魂殿——大陆最强大的魂师组织。洁白的大理石建筑在阳光下闪耀着神圣的光芒，但每一个魂师都知道，这光芒之下隐藏着多少秘密。',
      '嘉陵关': '🏰 嘉陵关——天斗帝国最后的屏障。关墙上布满了魂技留下的焦痕，这里见证了无数场生死之战。',
      '庚辛城': '⚒️ 庚辛城——金属之都。铁锤敲打金属的声音不绝于耳，空气中飘荡着熔炉的烟火味。这里是全大陆最好的铁匠聚集地。',
      '极北之地': '❄️ 寒风如刀，冰雪覆盖了一切。这里是生命的禁区——极北之地。传说中，远古冰龙就沉睡在这片冰原之下。',
      '神界': '☁️ 神界——高于斗罗大陆的另一个位面。金色的光芒笼罩着一切，空气中充斥着纯粹的神力。凡人在此，连呼吸都感到困难。',
    }
    return intros[loc] || ''
  }

  /** 重置 */
  function reset() {
    phase.value = 'prequel'
    stepIndex.value = 0
    totalStepsCompleted.value = 0
    currentAge.value = 6
    ageEventsCompleted.value = []
    eventHistory.value = []
    eventCooldown.value = {}
    eventRepeatCount.value = {}
    unlockedEvents.value = []
    narrativeFlags.value = {}
    currentPool.value = []
    currentEvent.value = null
    currentLevel.value = 1
    chapterTitle.value = '序章：命运之始'
  }

  return {
    phase, stepIndex, totalStepsCompleted, totalSteps,
    eventHistory, unlockedEvents, currentPool, currentEvent,
    currentLevel, eventType, chapterTitle,
    isComplete, progressPercent, canAdvance, shouldTriggerFinale,
    setLevel, unlockEvent, unlockEvents, selectNextEvent, completeCurrentEvent,
    retreat, reset, updateChapterTitle, jumpToNextBracket,
    setNarrativeFlag, getNarrativePrefix,
    markLocationVisited, getLocationIntro
  }
})
