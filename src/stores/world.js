// 原著世界状态 Store — 追踪原著角色命运 + 世界事件
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useWorldStore = defineStore('world', () => {
  // ========== 原著角色状态 ==========
  const characters = ref({
    tangSan:      { alive: true, soulPower: 0, faction: 'neutral', affinity: 0, met: false, note: '' },
    xiaoWu:       { alive: true, transformed: false, sacrificed: false, faction: 'neutral', affinity: 0, met: false },
    daiMuBai:     { alive: true, faction: 'neutral', affinity: 0, met: false },
    oscar:        { alive: true, faction: 'neutral', affinity: 0, met: false },
    maHongJun:    { alive: true, faction: 'neutral', affinity: 0, met: false },
    ningRongRong: { alive: true, faction: 'neutral', affinity: 0, met: false },
    zhuZhuQing:   { alive: true, faction: 'neutral', affinity: 0, met: false },
    biBiDong:     { alive: true, faction: 'hostile', affinity: 0, met: false },
    yuXiaoGang:   { alive: true, faction: 'neutral', affinity: 0, met: false },
    liuErLong:    { alive: true, faction: 'neutral', affinity: 0, met: false },
    tangHao:      { alive: true, faction: 'neutral', affinity: 0, met: false },
    qianRenXue:   { alive: true, faction: 'neutral', affinity: 0, met: false },
    huLiena:      { alive: true, faction: 'neutral', affinity: 0, met: false },
    duGuBo:       { alive: true, faction: 'neutral', affinity: 0, met: false },
  })

  // ========== 世界事件 ==========
  const events = ref({
    spiritHuntStarted: false,       // 猎魂行动已开始
    shrekSeven: { formed: false, eighthMember: null },
    seaGodTrial: { started: false, completedBy: null, shared: false },
    eliteTournament: { happened: false, winner: null },
    xiaoWuSacrifice: { prevented: false, happened: false },
    godWar: { happened: false, outcome: '' },
  })

  // ========== Getters ==========
  const shrekSevenFormed = computed(() => events.value.shrekSeven.formed)
  const shrekEighthMember = computed(() => events.value.shrekSeven.eighthMember)
  
  const livingCanonChars = computed(() => {
    return Object.entries(characters.value)
      .filter(([_, c]) => c.alive)
      .map(([key, _]) => key)
  })

  const metCharacters = computed(() => {
    return Object.entries(characters.value)
      .filter(([_, c]) => c.met)
      .map(([key, c]) => ({ key, ...c }))
  })

  // ========== Actions ==========

  /** 更新角色状态 */
  function updateCharacter(name, data) {
    if (characters.value[name]) {
      characters.value[name] = { ...characters.value[name], ...data }
    }
  }

  /** 设置角色关系 */
  function setRelationship(name, faction, affinityChange = 0, note = '') {
    if (characters.value[name]) {
      const char = characters.value[name]
      char.met = true
      char.faction = faction
      char.affinity = Math.max(-100, Math.min(100, char.affinity + affinityChange))
      if (note) char.note = note
    }
  }

  /** 触发世界事件 */
  function triggerEvent(eventId, data = {}) {
    if (events.value[eventId] !== undefined) {
      if (typeof events.value[eventId] === 'object') {
        events.value[eventId] = { ...events.value[eventId], ...data }
      } else {
        events.value[eventId] = true
      }
    }
  }

  /** 应用影响（处理 worldImpact 对象），支持颜值倍率 */
  function applyImpact(impact, beautyMult = 1.0) {
    if (!impact) return

    for (const [charName, charData] of Object.entries(impact)) {
      if (charName === 'self' || charName.startsWith('event_') || charName === 'domain' || charName === 'evilSealed' || charName === 'seaGodInherited' || charName === 'slaughterCity' || charName === 'fourClans' || charName === 'dragonGod' || charName === 'originBeast' || charName === 'godFugitive' || charName === 'seaGodTrident' || charName === 'asuraGod' || charName === 'xueBeng' || charName === 'sevenClans' || charName === 'alliedForces' || charName === 'stayMortal' || charName === 'mysteriousSavior' || charName === 'traitor') {
        // 非角色影响直接跳过
        if (charName.startsWith('event_')) triggerEvent(charName.replace('event_', ''), charData)
        continue
      }
      if (characters.value[charName]) {
        // 应用颜值倍率到好感度变动
        const modified = { ...charData }
        if (typeof modified.affinity === 'number') {
          modified.affinity = Math.round(modified.affinity * beautyMult)
        }
        updateCharacter(charName, modified)
      }
    }
  }

  /** 检查角色是否存活 */
  function isAlive(name) {
    return characters.value[name]?.alive === true
  }

  /** 重置世界 */
  function reset() {
    characters.value = {
      tangSan:      { alive: true, soulPower: 0, faction: 'neutral', affinity: 0, met: false, note: '' },
      xiaoWu:       { alive: true, transformed: false, sacrificed: false, faction: 'neutral', affinity: 0, met: false },
      daiMuBai:     { alive: true, faction: 'neutral', affinity: 0, met: false },
      oscar:        { alive: true, faction: 'neutral', affinity: 0, met: false },
      maHongJun:    { alive: true, faction: 'neutral', affinity: 0, met: false },
      ningRongRong: { alive: true, faction: 'neutral', affinity: 0, met: false },
      zhuZhuQing:   { alive: true, faction: 'neutral', affinity: 0, met: false },
      biBiDong:     { alive: true, faction: 'hostile', affinity: 0, met: false },
      yuXiaoGang:   { alive: true, faction: 'neutral', affinity: 0, met: false },
      liuErLong:    { alive: true, faction: 'neutral', affinity: 0, met: false },
      tangHao:      { alive: true, faction: 'neutral', affinity: 0, met: false },
      qianRenXue:   { alive: true, faction: 'neutral', affinity: 0, met: false },
      huLiena:      { alive: true, faction: 'neutral', affinity: 0, met: false },
      duGuBo:       { alive: true, faction: 'neutral', affinity: 0, met: false },
    }
    events.value = {
      spiritHuntStarted: false,
      shrekSeven: { formed: false, eighthMember: null },
      seaGodTrial: { started: false, completedBy: null, shared: false },
      eliteTournament: { happened: false, winner: null },
      xiaoWuSacrifice: { prevented: false, happened: false },
      godWar: { happened: false, outcome: '' },
    }
  }

  return {
    characters, events,
    shrekSevenFormed, shrekEighthMember, livingCanonChars, metCharacters,
    updateCharacter, setRelationship, triggerEvent, applyImpact, isAlive, reset,
  }
})
