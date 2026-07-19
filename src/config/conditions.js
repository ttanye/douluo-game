// 公共条件函数库 — 供各步骤 computeOptions 复用

// ========== 序章属性判断 ==========

export function isHuman(state) {
  return state.attributes?.race === '人族' || state.attributes?.race === '普通人族'
}

export function isBeastSoul(state) {
  return state.attributes?.soulType === '兽武魂'
}

export function isToolSoul(state) {
  return state.attributes?.soulType === '器武魂'
}

export function isTwinSoul(state) {
  return state.attributes?.specialTag?.includes('双生武魂')
}

export function innatePowerAbove(threshold) {
  return (state) => (state.attributes?.innatePower ?? 0) >= threshold
}

export function innatePowerBelow(threshold) {
  return (state) => (state.attributes?.innatePower ?? 10) <= threshold
}

export function hasBeastBloodline(state) {
  return state.attributes?.race === '魂兽化形' || state.attributes?.race === '远古魂兽血脉'
}

export function hasSeaBloodline(state) {
  return state.attributes?.race === '海魂师后裔'
}

export function hasEvilBloodline(state) {
  return state.attributes?.race === '邪魂师血脉'
}

export function isOrphan(state) {
  return state.attributes?.family === '孤儿'
}

export function isNoble(state) {
  const f = state.attributes?.family
  return f === '大宗门' || f === '隐世家族' || f === '皇室血脉' || f === '隐世神族'
}

export function beautyAbove(level) {
  const map = { '平平无奇': 1, '清秀': 2, '俊美': 3, '倾国倾城': 4 }
  return (state) => (map[state.attributes?.appearance] || 1) >= level
}

// ========== 武魂判断 ==========

export function soulQualityAbove(level) {
  const tiers = ['C', 'B', 'A', 'S', 'SS', 'SSS']
  return (state) => {
    const current = state.attributes?.soulQualityRarity || 'C'
    return tiers.indexOf(current) >= tiers.indexOf(level)
  }
}

export function hasGodSoul(state) {
  return state.attributes?.soulQuality === '神级武魂' || state.attributes?.soulQualityRarity === 'SSS'
}

export function soulRingCount(state) {
  return state.soulRings?.filter(r => r).length || 0
}

export function hasSoulBone(state) {
  return Object.values(state.soulBones || {}).filter(b => b).length > 0
}

export function hasAllSixBones(state) {
  return Object.values(state.soulBones || {}).filter(b => b).length >= 6
}

// ========== 等级判断 ==========

export function levelAbove(threshold) {
  return (state) => (state.level ?? 1) >= threshold
}

export function levelBelow(threshold) {
  return (state) => (state.level ?? 100) < threshold
}

export function isLevelMultipleOf(n) {
  return (state) => (state.level ?? 1) % n === 0
}

// ========== 原著关系判断 ==========

export function hasMet(characterName) {
  return (state) => state.relationships?.[characterName]?.met === true
}

export function isAlliedWith(characterName) {
  return (state) => state.relationships?.[characterName]?.faction === 'friend'
}

export function isEnemyOf(characterName) {
  return (state) => state.relationships?.[characterName]?.faction === 'enemy'
}

export function affinityAbove(characterName, threshold) {
  return (state) => (state.relationships?.[characterName]?.affinity ?? 0) >= threshold
}

// ========== 世界状态判断 ==========

export function worldEventHappened(eventId) {
  return (state, worldState) => worldState?.events?.[eventId] === true
}

export function shrekSevenFormed(worldState) {
  return worldState?.events?.shrekSeven?.formed === true
}

export function isEighthShrek(state) {
  return state.relationships?.isEighthShrek === true
}

// ========== 组合条件 ==========

export function and(...conditions) {
  return (state, worldState) => conditions.every(c => c(state, worldState))
}

export function or(...conditions) {
  return (state, worldState) => conditions.some(c => c(state, worldState))
}

export function not(condition) {
  return (state, worldState) => !condition(state, worldState)
}
