// 角色属性 Store
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useCharacterStore = defineStore('character', () => {
  // ========== 序章创建属性 ==========
  const attributes = ref({
    era: '',
    gender: '',
    race: '',
    soulType: '',
    soulQuality: '',
    soulQualityRarity: 'C',
    innatePower: 0,
    birthplace: '',
    family: '',
    appearance: '',
    specialTag: [],
    // 第二武魂（双生武魂时使用）
    soulType2: '',
    soulQuality2: '',
    soulQualityRarity2: '',
  })

  // ========== 修炼属性 ==========
  const level = ref(1)
  const xp = ref(0)            // 当前经验值
  const xpToNext = ref(100)
  const talentPoints = ref(0)  // 溢出天赋点
  const title = ref('')        // 封号
  const godhood = ref([])     // 神位（可拥有多个）

  // ========== 魂环列表（10槽固定，对应Lv.10/20/.../100，高年份可替换低年份） ==========
  const soulRings = ref(Array(10).fill(null))
  const soulRings2 = ref(Array(10).fill(null))  // 第二武魂魂环
  const totalSoulRings = computed(() => soulRings.value.filter(r => r !== null).length + soulRings2.value.filter(r => r !== null).length)

  // ========== 魂骨列表（6槽位+1外附，贴合原著） ==========
  const soulBones = ref({
    head: null, rightArm: null, leftArm: null,
    torso: null, rightLeg: null, leftLeg: null,
    external: null,
  })
  const totalSoulBones = computed(() => Object.values(soulBones.value).filter(b => b !== null).length)

  // ========== 领域系统 ==========
  const domains = ref([])
  const tempBuff = ref({ mult: 1.0, remaining: 0, source: '' })
  
  function addDomain(name) { if (!domains.value.includes(name)) domains.value.push(name) }
  function addGodhood(name) { if (name && !godhood.value.includes(name)) { godhood.value.push(name); checkAchievements() } }
  function hasDomain(name) { return domains.value.includes(name) }
  
  function applyBuff(mult, steps, source) {
    tempBuff.value = { mult, remaining: steps, source }
  }
  
  function consumeBuff() {
    if (tempBuff.value.remaining > 0) {
      tempBuff.value.remaining--
      if (tempBuff.value.remaining <= 0) tempBuff.value = { mult: 1.0, remaining: 0, source: '' }
    }
  }

  /** 颜值影响好感度倍率 */
  const beautyMultiplier = computed(() => {
    const map = { '倾国倾城': 1.5, '俊美绝伦': 1.3, '清秀': 1.1, '端正': 1.0, '平平无奇': 0.9, '有点抱歉': 0.7 }
    return map[attributes.value.appearance] || 1.0
  })

  // ========== 武器系统 ==========
  const weapons = ref([])  // [{ name, power, rarity, source }]

  const weaponPower = computed(() => {
    const rarityMult = { SSS: 3.0, SS: 2.0, S: 1.5, A: 1.2, B: 1.0, C: 0.8 }
    return weapons.value.reduce((sum, w) => sum + Math.floor((w.power || 0) * (rarityMult[w.rarity] || 1.0)), 0)
  })

  function addWeapon(w) {
    if (!weapons.value.find(x => x.name === w.name)) {
      weapons.value.push(w)
    }
  }

  // ========== 人际关系 ==========
  const relationships = ref({})
  // { tangSan: { met: true, affinity: 60, faction: 'friend', note: '' } }

  // ========== 稀有度统计 ==========
  const rarityStats = ref({ SSS: 0, SS: 0, S: 0, A: 0, B: 0, C: 0 })

  // ========== 修炼历程 ==========
  const growthChoices = ref({})

  // ========== 特质系统 ==========
  const traits = ref({
    wise: 0,      // 智者 — 多次智取
    kind: 0,      // 仁者 — 多次帮助他人
    fierce: 0,    // 霸者 — 多次武力碾压
    loyal: 0,     // 忠义 — 多次选择友情/阵营
    cunning: 0,   // 狡黠 — 多次投机取巧
    mystic: 0,    // 玄秘 — 多次接触神级/远古力量
  })

  // ========== 角色身份 ==========
  const playerName = ref('')

  // ========== 关键物品 ==========
  const keyItems = ref([])

  // ========== 成就系统 ==========
  const achievements = ref([])
  const newAchievement = ref(null)  // 最新获得的成就（用于弹窗）

  /** 检查并授予成就 */
  function checkAchievements() {
    const newly = []
    const has = (id) => achievements.value.includes(id) || newly.includes(id)
    
    if (!has('first_sss') && rarityStats.value.SSS >= 1) newly.push('first_sss')
    if (!has('three_sss') && rarityStats.value.SSS >= 3) newly.push('three_sss')
    if (!has('full_rings') && totalSoulRings.value >= 9) newly.push('full_rings')
    if (!has('six_bones') && totalSoulBones.value >= 6) newly.push('six_bones')
    if (!has('level_50') && level.value >= 50) newly.push('level_50')
    if (!has('level_100') && level.value >= 100) newly.push('level_100')
    if (!has('godhood') && godhood.value.length > 0) newly.push('godhood')
    if (!has('all_sss_rings') && totalSoulRings.value >= 5 && soulRings.value.filter(r=>r).every(r => r.rarity === 'SSS')) newly.push('all_sss_rings')
    
    for (const id of newly) {
      achievements.value.push(id)
      newAchievement.value = id
      setTimeout(() => { newAchievement.value = null }, 4000)
    }
  }

  const achievementMap = {
    first_sss: { icon: '🌟', title: '命运眷顾', desc: '第一次获得SSS评价' },
    three_sss: { icon: '💫', title: '天选之人', desc: '累计获得3次SSS评价' },
    full_rings: { icon: '💍', title: '九环齐鸣', desc: '集齐九个魂环' },
    six_bones: { icon: '🦴', title: '六骨齐全', desc: '集齐全部六块魂骨' },
    level_50: { icon: '⚡', title: '魂王之境', desc: '达到50级' },
    level_100: { icon: '👑', title: '百级成神', desc: '达到100级' },
    godhood: { icon: '🔱', title: '神位加冕', desc: '获得神位' },
    all_sss_rings: { icon: '✨', title: '完美魂环', desc: '拥有5个以上SSS魂环' },
  }
  // ['二十四桥明月夜', '海神三叉戟碎片', '独孤博的毒丹心得', ...]

  const dominantTrait = computed(() => {
    let max = 'wise'
    let maxVal = 0
    for (const [key, val] of Object.entries(traits.value)) {
      if (val > maxVal) { max = key; maxVal = val }
    }
    return max
  })

  // ========== 战力计算（严格按原著体系） ==========
  
  /** 武魂战力系数（原著：昊天锤为天下第一器武魂，蓝银草初期为废武魂） */
  const SOUL_POWER_MAP = {
    // 神级器武魂
    '昊天锤': 2.5, '海神三叉戟': 2.4, '六翼天使': 2.3,
    // 顶级器武魂
    '七杀剑': 2.0, '破魂枪': 1.8,
    // 顶级兽/植物武魂
    '蓝银皇': 1.9, '邪眸白虎': 1.7, '邪火凤凰': 1.6, '幽冥灵猫': 1.5,
    // 辅助/特殊武魂
    '九宝琉璃塔': 1.3, '九心海棠': 1.1, '七宝琉璃塔': 0.9,
    '香肠（食物系）': 0.5,
    // 高级武魂
    '柔骨兔': 1.4, '碧磷蛇皇': 1.3, '鬼虎': 1.2, '大地之王': 1.2,
    // 邪武魂
    '噬魂蛛皇': 2.1, '死亡蛛皇': 1.9, '暗魔邪神虎': 1.8,
    // 海武魂
    '邪魔虎鲸': 1.6, '魔魂大白鲨': 1.5, '深海魔鲸': 1.7,
    // 普通武魂
    '蓝银草': 0.6, '铁剑': 0.5, '凤尾鸡冠蛇': 0.7,
    '麟甲兽': 0.8, '粉红娘娘': 0.7, '幽冥狼': 0.5,
    // 废武魂
    '镰刀': 0.2, '木棍': 0.2, '竹叶青': 0.3, '小丑鱼': 0.2,
  }
  
  // 预排序：按 key 长度降序，确保长 key 优先匹配（如 '海神三叉戟' 先于 '戟'）
  const SOUL_POWER_ENTRIES_DESC = Object.entries(SOUL_POWER_MAP).sort((a, b) => b[0].length - a[0].length)
  
  function getSoulMultiplier() {
    const soul = attributes.value.soulType || ''
    const soul2 = attributes.value.soulType2 || ''
    let max = SOUL_POWER_MAP[soul] || 1.0
    if (soul2 && SOUL_POWER_MAP[soul2]) max = Math.max(max, SOUL_POWER_MAP[soul2])
    for (const [key, val] of SOUL_POWER_ENTRIES_DESC) {
      if (soul.includes(key)) max = Math.max(max, val)
      if (soul2 && soul2.includes(key)) max = Math.max(max, val)
    }
    return max
  }

  /** 魂环战力（年份 × 槽位递增） */
  function getRingPower(ring, index) {
    const yearMap = {
      '百万年': 8000, '神级': 12000, '神赐': 10000, '十万年': 3000,
      '五万年': 1200, '万年': 500, '五千年': 180, '千年': 60,
      '百年': 15, '十年': 1,
    }
    const base = yearMap[ring.colorName] || 10
    const slotBonus = 1 + index * 0.18
    return Math.floor(base * slotBonus)
  }

  function getBonePower(bone) {
    if (!bone) return 0
    const rarityMap = { SSS: 5000, SS: 2000, S: 700, A: 250, B: 80, C: 20 }
    const slotMap = { head: 1.2, torso: 1.2, rightArm: 1.0, leftArm: 1.0, rightLeg: 0.9, leftLeg: 0.9, external: 1.5 }
    let power = Math.floor((rarityMap[bone.rarity] || 15) * (slotMap[bone.slot] || 1.0))
    if (bone.mutated) power = Math.floor(power * 1.5)
    return power
  }

  const combatPower = computed(() => {
    // innatePower 为标签字符串（如 '先天满魂力·10 级！！'），需提取数字
    const innate = parseInt((attributes.value.innatePower || '').match(/\d+/)?.[0]) || 8
    const soulMult = getSoulMultiplier()
    // 等级战力（Lv^1.4 体现后期指数碾压）
    let power = Math.floor(Math.pow(Math.max(1, level.value), 1.4) * soulMult * (innate / 5))
    
    // 魂环战力（第一武魂+第二武魂）
    for (let i = 0; i < 10; i++) {
      if (soulRings.value[i]) power += getRingPower(soulRings.value[i], i)
      if (soulRings2.value[i]) power += getRingPower(soulRings2.value[i], i)
    }
    
    // 双生武魂加成
    if (isTwinSoul.value) power = Math.floor(power * 1.15)
    
    // 魂骨战力
    for (const bone of Object.values(soulBones.value)) {
      if (bone) power += getBonePower(bone)
    }
    
    // 领域加成（每个领域+15%）
    if (domains.value.length > 0) power = Math.floor(power * (1 + domains.value.length * 0.25))
    
    // 魂骨套装加成（同一魂兽≥3块: ×1.2，≥5块: ×1.4）
    const boneBeasts = Object.values(soulBones.value).filter(b=>b).map(b=>b.beast)
    const beastCount = {}; boneBeasts.forEach(b => { beastCount[b] = (beastCount[b]||0)+1 })
    for (const [,c] of Object.entries(beastCount)) { if (c>=5) power = Math.floor(power*1.4); else if (c>=3) power = Math.floor(power*1.2) }
    
    // 魂环颜色组合（5金×1.5 / 6红×1.3 / 6黑×1.15）
    const colors = soulRings.value.filter(r=>r).map(r=>r.colorName)
    const gold = colors.filter(c=>c==='百万年'||c==='神级'||c==='神赐').length
    const red = colors.filter(c=>c==='十万年').length
    const black = colors.filter(c=>c==='万年').length
    if (gold>=5) power = Math.floor(power*1.5); else if (red>=6) power = Math.floor(power*1.3); else if (black>=6) power = Math.floor(power*1.15)
    
    // 武魂特性加成
    const soul = attributes.value.soulType || ''
    if (soul.includes('天使')||soul.includes('六翼')) power = Math.floor(power*1.15)
    if (soul.includes('锤')||soul.includes('剑')||soul.includes('戟')||soul.includes('枪')) power = Math.floor(power*1.1)
    
    // 临时战力Buff
    if (tempBuff.value.mult > 1.0) power = Math.floor(power * tempBuff.value.mult)
    
    // 武器加成（器武魂持武器有额外20%加成）
    if (weapons.value.length > 0) {
      power += weaponPower.value
      const soul = attributes.value.soulType || ''
      if (soul.includes('锤')||soul.includes('剑')||soul.includes('戟')||soul.includes('枪')) power = Math.floor(power * (1 + weapons.value.length * 0.1))
    }
    
    // 神位加成（每多一个神位×1.5叠加）
    const godCount = godhood.value.length
    if (godCount > 0) power = Math.floor(power * Math.pow(1.5, godCount))
    
    return power
  })
  
  // 战力等级评价
  const powerRank = computed(() => {
    const p = combatPower.value
    if (p >= 80000) return { rank: '大陆第一', color: '#FFD700' }
    if (p >= 40000) return { rank: '神级', color: '#FFA000' }
    if (p >= 20000) return { rank: '封号斗罗', color: '#FF1744' }
    if (p >= 10000) return { rank: '魂斗罗', color: '#4A148C' }
    if (p >= 5000)  return { rank: '魂圣', color: '#212121' }
    if (p >= 2000)  return { rank: '魂帝', color: '#1565C0' }
    if (p >= 800)   return { rank: '魂王', color: '#2E7D32' }
    if (p >= 300)   return { rank: '魂宗', color: '#F9A825' }
    if (p >= 100)   return { rank: '魂尊', color: '#E65100' }
    if (p >= 30)    return { rank: '大魂师', color: '#7B1FA2' }
    return { rank: '魂师', color: '#BDBDBD' }
  })

  const traitLabel = computed(() => {
    const map = {
      wise: '智者', kind: '仁者', fierce: '霸者',
      loyal: '忠义之士', cunning: '狡黠之狐', mystic: '玄秘之人'
    }
    return map[dominantTrait.value] || '平凡之魂'
  })
  // { ch1_firstTeacher: '隐世高人', ch3_xiaoWuSacrifice: '出手相助', ... }

  // ========== Getters ==========
  
  const isTwinSoul = computed(() => !!attributes.value.soulType2)

  /** 武魂进化：高品质替代低品质，同品质变双生 */
  function evolveSoul(newType, newQuality, newRarity) {
    const rank = { SSS: 6, SS: 5, S: 4, A: 3, B: 2, C: 1 }
    const oldRank = rank[attributes.value.soulQualityRarity] || 3
    const newRankVal = rank[newRarity] || 3
    
    if (newRankVal > oldRank) {
      // 进化：替换第一武魂
      attributes.value.soulType = newType
      attributes.value.soulQuality = newQuality
      attributes.value.soulQualityRarity = newRarity
      return 'evolved'
    } else if (newRankVal === oldRank && !attributes.value.soulType2) {
      // 同品质 → 觉醒双生武魂
      attributes.value.soulType2 = newType
      attributes.value.soulQuality2 = newQuality
      attributes.value.soulQualityRarity2 = newRarity
      if (!attributes.value.specialTag.includes('双生武魂')) {
        attributes.value.specialTag.push('双生武魂')
      }
      return 'twin'
    }
    return 'noChange'
  }

  // 重要选择列表（用于传记页展示）
  const keyChoices = computed(() => {
    const entries = Object.entries(growthChoices.value)
    if (entries.length === 0) return []
    return entries.map(([key, val]) => {
      const label = key.replace(/^ch\d+_/, '') // ch3_xiaoWuSacrifice → xiaoWuSacrifice
      return { key, label, value: val }
    })
  })

  // ========== Actions ==========

  /** 提交一步结果 — 存储所有选择到对应位置 */
  function commitResult(key, value, rarity = 'C', extra = {}) {
    // 序章属性 → attributes
    const prequelKeys = ['gender', 'race', 'soulType', 'soulQuality', 'innatePower', 'birthplace', 'family', 'appearance']
    if (prequelKeys.includes(key)) {
      attributes.value[key] = value
      if (key === 'soulQuality') {
        attributes.value.soulQualityRarity = rarity
      }
    }
    
    // 特殊标签 → attributes.specialTag[]
    if (key === 'specialTag') {
      if (!attributes.value.specialTag.includes(value)) {
        attributes.value.specialTag.push(value)
      }
      // 双生武魂的第二武魂
      if (extra?.soulType2) {
        attributes.value.soulType2 = extra.soulType2
      }
    }
    
    // 修炼/终章选择 → growthChoices（记录所有中期关键选择）
    if (!prequelKeys.includes(key) && key !== 'specialTag') {
      growthChoices.value[key] = value
    }

    // 记录稀有度
    if (rarityStats.value[rarity] !== undefined) {
      rarityStats.value[rarity]++
    }
  }

  /** 添加/替换魂环（始终填充第一个空槽位） */
  function addSoulRing(ring) {
    const preferSlot = (ring.slot || 1) - 1
    const newYear = ring.year || 0
    
    // 优先：同槽位高年份替换
    if (preferSlot >= 0 && preferSlot < 10) {
      const existing = soulRings.value[preferSlot]
      if (!existing || newYear > (existing.year || 0)) {
        soulRings.value[preferSlot] = { ...ring, slot: preferSlot + 1, acquiredAt: Date.now() }
        checkAchievements()
        return
      }
    }
    
    // 找第一个空槽
    let idx = -1
    for (let i = 0; i < 10; i++) {
      if (!soulRings.value[i]) { idx = i; break }
    }
    // 无空槽则替换最低年份的
    if (idx < 0) {
      let minYear = Infinity
      for (let i = 0; i < 10; i++) {
        if ((soulRings.value[i]?.year || 0) < minYear) {
          minYear = soulRings.value[i]?.year || 0
          idx = i
        }
      }
    }
    if (idx < 0 || idx >= 10) return
    
    const existing = soulRings.value[idx]
    if (!existing || newYear > (existing.year || 0)) {
      soulRings.value[idx] = { ...ring, slot: idx + 1, acquiredAt: Date.now() }
    }
    checkAchievements()
  }

  /** 添加/替换魂骨（6槽位，自动变异） */
  function addSoulBone(bone) {
    const slot = bone.slot || randomSlot()
    let finalBone = { ...bone, slot, acquiredAt: Date.now() }
    
    // 变异：5%概率稀有度+1
    if (Math.random() < 0.05) {
      const rarityUp = { C: 'B', B: 'A', A: 'S', S: 'SS', SS: 'SSS', SSS: 'SSS' }
      finalBone.rarity = rarityUp[bone.rarity] || bone.rarity
      finalBone.mutated = true
    }
    
    // 槽位已满：高年份或高稀有度替换
    const existing = soulBones.value[slot]
    if (existing) {
      const rarityRank = { SSS: 6, SS: 5, S: 4, A: 3, B: 2, C: 1 }
      const newRank = rarityRank[finalBone.rarity] || 3
      const oldRank = rarityRank[existing.rarity] || 3
      const newYear = finalBone.year || 0
      const oldYear = existing.year || 0
      if (newRank > oldRank || (newRank === oldRank && newYear > oldYear)) {
        soulBones.value[slot] = finalBone
      }
    } else {
      soulBones.value[slot] = finalBone
    }
    checkAchievements()
  }
  
  function randomSlot() {
    const slots = ['head', 'rightArm', 'leftArm', 'torso', 'rightLeg', 'leftLeg']
    return slots[Math.floor(Math.random() * slots.length)]
  }

  /** 根据稀有度获得经验值，自动处理升级 + 暴击 + 浮动 */
  function gainXP(rarity = 'C', extraXP = 0) {
    // 稀有度→基础经验映射（翻倍）
    const rarityXP = {
      SSS: 30, SS: 25, S: 20, A: 15, B: 12, C: 12,
    }
    
    const innate = parseInt((attributes.value.innatePower || '').match(/\d+/)?.[0]) || 5
    const innateMultiplier = innate >= 10 ? 1.2 : innate >= 8 ? 1.1 : innate >= 6 ? 1.05 : 1.0
    
    const variance = 0.85 + Math.random() * 0.35
    
    // 去除暴击 — 所有稀有度同等
    const critMultiplier = 1
    
    const baseGained = Math.floor((rarityXP[rarity] || 10) * variance * critMultiplier * innateMultiplier)
    // 战力加成：每100战力额外+1 XP
    const gained = baseGained + extraXP
    
    xp.value += gained
    
    // 检查升级
    let leveled = 0
    while (xp.value >= xpToNext.value && level.value < 100 && xpToNext.value > 0) {
      xp.value -= xpToNext.value
      level.value++
      leveled++
      xpToNext.value = 100  // 约3事件升一级（XP提高了）  // 极速前期
    }
    
    // 100级后溢出转为天赋点
    if (level.value >= 100 && xp.value > 0) {
      talentPoints.value += Math.floor(xp.value / 200)
      xp.value = 0
    }
    
    // 检查成就
    checkAchievements()
    
    return { gained, leveled, newLevel: level.value, crit: critMultiplier > 1, variance }
  }

  /** 直接增加等级（用于重大事件跳级） */
  function addLevel(amount = 1) {
    level.value = Math.min(100, level.value + amount)
    xpToNext.value = 100
    console.log(`[Character] 升级！等级 → ${level.value}（${xp.value}/${xpToNext.value}）`)
  }

  /** 设置关系 */
  function setRelationship(name, data) {
    relationships.value[name] = {
      ...relationships.value[name],
      ...data,
    }
  }

  /** 重置角色 */
  /** 根据选择结果更新特质 */
  function updateTraits(result) {
    if (!result) return
    const label = result.label || ''
    if (label.includes('智') || label.includes('谋') || label.includes('计') || label.includes('巧')) traits.value.wise++
    if (label.includes('救') || label.includes('帮') || label.includes('护') || label.includes('友') || label.includes('盟')) { traits.value.kind++; traits.value.loyal++ }
    if (label.includes('杀') || label.includes('战') || label.includes('碾压') || label.includes('斩') || label.includes('武')) traits.value.fierce++
    if (label.includes('偷') || label.includes('骗') || label.includes('牟') || label.includes('暗中') || label.includes('利用')) traits.value.cunning++
    if (label.includes('神') || label.includes('远古') || label.includes('龙') || label.includes('轮回') || label.includes('天选')) traits.value.mystic++
    if (result.rarity === 'SSS') traits.value.mystic++
  }

  /** 添加关键物品 */
  function addKeyItem(item) {
    if (!keyItems.value.includes(item)) keyItems.value.push(item)
  }

  function reset() {
    attributes.value = {
      era: '', gender: '', race: '', soulType: '', soulQuality: '',
      soulQualityRarity: 'C', innatePower: 0, birthplace: '',
      family: '', appearance: '', specialTag: [],
      soulType2: '', soulQuality2: '', soulQualityRarity2: '',
    }
    level.value = 1
    soulRings2.value = Array(10).fill(null)
    xp.value = 0
    xpToNext.value = 240
    talentPoints.value = 0
    title.value = ''
    godhood.value = []
    soulRings.value = Array(10).fill(null)
    soulBones.value = { head: null, rightArm: null, leftArm: null, torso: null, rightLeg: null, leftLeg: null, external: null }
    domains.value = []
    relationships.value = {}
    growthChoices.value = {}
    traits.value = { wise: 0, kind: 0, fierce: 0, loyal: 0, cunning: 0, mystic: 0 }
    playerName.value = ''
    keyItems.value = []
    achievements.value = []
    newAchievement.value = null
    rarityStats.value = { SSS: 0, SS: 0, S: 0, A: 0, B: 0, C: 0 }
  }
  
  /** 根据先天魂力计算初始等级 */
  function applyInnateLevel(innatePower) {
    const p = Math.max(1, innatePower || 5)
    const initialLevel = Math.max(1, Math.floor(p * 1.5))
    level.value = initialLevel
    xp.value = 0
    xpToNext.value = 100
    console.log(`[Character] 初始等级: ${initialLevel} (先天: ${p})`)
  }

  return {
    attributes, level, xp, xpToNext, talentPoints, title, godhood, addGodhood,
    soulRings, soulBones, relationships, rarityStats, growthChoices, keyChoices,
    domains, addDomain, hasDomain, beautyMultiplier,
    traits, dominantTrait, traitLabel, playerName, keyItems,
    achievements, newAchievement, achievementMap,
    combatPower, powerRank,
    totalSoulRings, totalSoulBones, isTwinSoul, soulRings2,
    weapons, weaponPower, addWeapon,
    commitResult, addSoulRing, addSoulBone, gainXP, addLevel,
    updateTraits, addKeyItem, setRelationship, reset, evolveSoul,
    tempBuff, applyBuff, consumeBuff, applyInnateLevel,
  }
})
