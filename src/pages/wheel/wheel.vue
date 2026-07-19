<template>
  <!-- 命运转盘 · 主页面 v2 — 事件池驱动 -->
  <view class="wheel-page">
    <!-- 顶部导航栏 -->
    <view class="nav-bar">
      <view class="nav-back" @tap="goBack">
        <text class="nav-back-icon">←</text>
      </view>
      <view class="nav-save" @tap="saveAndQuit">
        <text class="nav-save-icon">💾</text>
      </view>
      <text class="nav-title">{{ progressStore.chapterTitle }}</text>
      <text class="nav-age">Lv.{{ characterStore.level }}</text>
      <view class="nav-right">
        <text class="nav-char" @tap="openCharacter">🛡️</text>
        <text class="nav-power" :style="{ color: characterStore.powerRank.color }">{{ characterStore.powerRank.rank }} {{ characterStore.combatPower }}</text>
        <text class="nav-lv">Lv.{{ characterStore.level }}</text>
      </view>
    </view>

    <!-- 叙事文本区 -->
    <NarrativeBox
      ref="narrativeRef"
      :text="narrativeText"
      :speed="45"
      @complete="onNarrativeComplete"
    />

    <!-- 转盘区 -->
    <view class="wheel-zone">
      <!-- 模式切换 — 放在转盘上方 -->
      <view class="mode-bar">
        <view class="mode-btn" :class="{ active: !manualModeLocal }" @click="manualModeLocal = false; syncMode()">
          <text>🎰 随机</text>
        </view>
        <view class="mode-btn" :class="{ active: manualModeLocal }" @click="manualModeLocal = true; syncMode()">
          <text>👆 手动</text>
        </view>
      </view>
      <SpinWheel
        ref="wheelRef"
        :segments="wheelSegments"
        :size="wheelSize"
        :disabled="isSpinning || isShowingResult"
        @result="onWheelResult"
        @spinStart="onSpinStart"
      />
    </view>

    <!-- 已解锁属性标签 -->
    <view class="attrs-scroll" v-if="attributeTags.length > 0">
      <scroll-view scroll-x class="attrs-scroll-inner">
        <AttributeTag
          v-for="(tag, i) in attributeTags"
          :key="i"
          :label="tag.label"
          :icon="tag.icon"
          :rarity="tag.rarity"
        />
      </scroll-view>
    </view>

    <!-- 身份卡 -->
    <IdentityCard
      :soulType="characterStore.attributes?.soulType"
      :title="characterStore.title"
      :traitLabel="characterStore.traitLabel"
      :stance="stanceLabel"
      :ringCount="characterStore.totalSoulRings"
      :boneCount="characterStore.totalSoulBones"
      :combatPower="characterStore.combatPower"
      :rankText="characterStore.powerRank.rank"
      :rankColor="characterStore.powerRank.color"
      :keyItems="characterStore.keyItems"
    />

    <!-- 原著角色面板 -->
    <CanonTracker :relationships="characterStore.relationships" />

    <!-- 命运日记 -->
    <DestinyLog :entries="destinyEntries" />

    <!-- 关系变动提示 -->
    <view class="relation-toast" v-if="relationToast" :class="'toast-' + relationToast.type">
      <text>{{ relationToast.text }}</text>
    </view>

    <!-- 升级动画 -->
    <view class="level-up-toast" v-if="showLevelUp">
      <text class="level-up-text">{{ levelUpText }}</text>
    </view>

    <!-- 成就弹窗 -->
    <view class="achievement-toast" v-if="characterStore.newAchievement">
      <text class="ach-icon">{{ characterStore.achievementMap[characterStore.newAchievement]?.icon || '🏆' }}</text>
      <view class="ach-info">
        <text class="ach-title">{{ characterStore.achievementMap[characterStore.newAchievement]?.title || '成就' }}</text>
        <text class="ach-desc">{{ characterStore.achievementMap[characterStore.newAchievement]?.desc || '' }}</text>
      </view>
    </view>

    <!-- 结果揭晓弹窗 -->
    <ResultReveal
      :visible="isShowingResult"
      :result="currentResult"
      :narrative="resultNarrative"
      :stepTitle="progressStore.currentEvent?.title || ''"
      :nextLabel="isComplete ? '查看命运之书' : '继续'"
      :xpGained="lastXpGained"
      :levelBoost="currentResult?.levelBoost || 0"
      :isCrit="lastCrit"
      @next="onResultNext"
    />

    <!-- 稀有度光效 -->
    <RarityEffect :rarity="currentResult?.rarity || 'C'" :active="showRarityEffect" />
  </view>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, getCurrentInstance } from 'vue'
import { useCharacterStore } from '../../stores/character'
import { useProgressStore } from '../../stores/progress'
import { useWorldStore } from '../../stores/world'
import { resolvePrequelStep } from '../../config/prequel'
import { EVENT_POOL } from '../../config/eventPool'
import { WILDCARD_POOL } from '../../config/wildcardEvents'
import { SECRET_POOL } from '../../config/secretEvents'
import { FINALE_STEPS } from '../../config/finale'
import { generateResultNarrative } from '../../utils/narrativeGen'
import { adjustCombatWeights } from '../../utils/combatPower'
import { weightedRandomIndex } from '../../utils/weightedRandom'
import { saveGame } from '../../utils/storage'
import { SEGMENT_COLORS } from '../../config/colors'

import SpinWheel from '../../components/SpinWheel/SpinWheel.vue'
import NarrativeBox from '../../components/NarrativeBox/NarrativeBox.vue'
import AttributeTag from '../../components/AttributeTag/AttributeTag.vue'
import CanonTracker from '../../components/CanonTracker/CanonTracker.vue'
import DestinyLog from '../../components/DestinyLog/DestinyLog.vue'
import IdentityCard from '../../components/IdentityCard/IdentityCard.vue'
import ResultReveal from '../../components/ResultReveal/ResultReveal.vue'
import RarityEffect from '../../components/RarityEffect/RarityEffect.vue'

const characterStore = useCharacterStore()
const progressStore = useProgressStore()
const worldStore = useWorldStore()

const instance = getCurrentInstance()
const wheelRef = ref(null)
const narrativeRef = ref(null)

// ========== 响应式状态 ==========
const isSpinning = ref(false)
const isShowingResult = ref(false)
const showRarityEffect = ref(false)
const narrativeText = ref('')
const resultNarrative = ref('')
const currentStepData = ref(null)
const currentResult = ref(null)
const lastXpGained = ref(0)
const showLevelUp = ref(false)
const levelUpText = ref('')
const lastCrit = ref(false)
const fallbackCount = ref(0)       // 连续触发fallback的次数
const destinyEntries = ref([])     // 命运日记
const relationToast = ref(null)    // 关系变动提示

// ========== 计算属性 ==========
const isComplete = computed(() => progressStore.phase === 'finale' && progressStore.stepIndex >= 4)
const chapterTitle = computed(() => progressStore.chapterTitle)

const wheelSegments = computed(() => {
  if (!currentStepData.value) return []
  return currentStepData.value.options.map((opt, i) => ({
    label: opt.label,
    icon: opt.icon || '',
    rarity: opt.rarity || 'C',
    color: opt.color || SEGMENT_COLORS[i % SEGMENT_COLORS.length],
  }))
})

const attributeTags = computed(() => {
  const attrs = characterStore.attributes
  const tags = []
  if (attrs.era) tags.push({ label: attrs.era, icon: '⏳', rarity: 'A' })
  if (attrs.gender) tags.push({ label: attrs.gender, icon: attrs.gender === '男' ? '♂️' : '♀️', rarity: 'B' })
  if (attrs.race) tags.push({ label: attrs.race, icon: '🧬', rarity: 'A' })
  if (attrs.soulType) tags.push({ label: attrs.soulType, icon: '⚔️', rarity: attrs.soulQualityRarity || 'B' })
  const ip = parseInt((attrs.innatePower || '').match(/\d+/)?.[0]) || 0
  if (ip > 0) tags.push({ label: `先天魂力 ${ip} 级`, icon: '🔥', rarity: ip >= 9 ? 'SSS' : 'B' })
  if (attrs.birthplace) tags.push({ label: attrs.birthplace, icon: '🏠', rarity: 'B' })
  if (attrs.family) tags.push({ label: attrs.family, icon: '🏛️', rarity: 'B' })
  if (attrs.appearance) tags.push({ label: attrs.appearance, icon: '💄', rarity: 'B' })
  if (attrs.specialTag?.length) {
    attrs.specialTag.filter(t => t !== '无').forEach(t => tags.push({ label: t, icon: '🔮', rarity: 'A' }))
  }
  return tags
})

const wheelSize = computed(() => {
  try {
    const info = uni.getSystemInfoSync()
    const w = info.windowWidth || 375
    return Math.max(260, Math.min(w - 40, 320))
  } catch { return 340 }
})

const stanceLabel = computed(() => {
  const rel = characterStore.relationships
  if (rel?.biBiDong?.faction === 'enemy') return '反抗军'
  if (rel?.biBiDong?.faction === 'friend') return '武魂殿'
  if (rel?.tangSan?.faction === 'friend') return '唐三盟友'
  return '中立'
})

// ========== 初始化 ==========
onMounted(() => { loadCurrentStep() })

function loadCurrentStep() {
  const phase = progressStore.phase

  if (phase === 'prequel') {
    loadPrequelStep()
  } else if (phase === 'growth') {
    loadGrowthStep()
  } else if (phase === 'finale') {
    loadFinaleStep()
  }
}

function loadPrequelStep() {
  const stepIndex = progressStore.stepIndex
  const resolved = resolvePrequelStep(stepIndex, characterStore)
  if (resolved) {
    currentStepData.value = resolved
    progressStore.currentEvent = { id: resolved.step.key, title: resolved.step.title, icon: resolved.step.icon }
    narrativeText.value = resolved.step.prelude || `命运之轮转动——决定你的${resolved.step.title}`
  }
}

function loadGrowthStep() {
  // 同步等级到 progress store
  progressStore.setLevel(characterStore.level)

  // 从事件池中选择下一个事件（三层抽取：秘密→野怪→主线）
  const event = progressStore.selectNextEvent(EVENT_POOL, WILDCARD_POOL, SECRET_POOL, characterStore.soulRings)
  
  // 调试日志
  if (!event) {
    console.warn('[Wheel] 池空！当前等级=', characterStore.level, '历史事件=', progressStore.eventHistory.length, '冷却中=', Object.keys(progressStore.eventCooldown || {}).length)
  } else {
    console.log('[Wheel] 选中事件:', event.title, '(等级', characterStore.level, ')')
  }
  
  if (!event) {
    // 先尝试找遗漏的魂环事件
    const missedRing = findMissedRingEvent()
    if (missedRing) {
      loadRingEvent(missedRing)
      return
    }

    // 池空 → 强化跳级逻辑
    fallbackCount.value++
    const oldLevel = characterStore.level
    
    // 跳到下一区间并额外+5级（确保有足够事件）
    let newLevel = progressStore.jumpToNextBracket()
    newLevel += 5 * fallbackCount.value  // 每次fallback跳更多
    characterStore.level = Math.min(100, newLevel)
    progressStore.setLevel(characterStore.level)
    
    console.warn(`[Wheel] FALLBACK #${fallbackCount.value}: ${oldLevel} → ${characterStore.level}`)
    
    narrativeText.value = `命运的洪流推动着你前行……新的冒险在等待！（Lv.${oldLevel} → Lv.${characterStore.level}）`
    currentStepData.value = {
      step: { id: '_fate_boost', title: '命运加速' },
      options: [
        { label: '踏上新的征程', icon: '⚡', rarity: 'SS', weight: 100, levelBoost: 3 },
      ],
    }
    progressStore.currentEvent = { id: '_fate_boost', title: '命运加速' }
    return
  }
  
  // 正常获取到事件，重置fallback计数
  fallbackCount.value = 0

  // 计算选项（自动检测 enemyPower 并应用动态战力）
  let options = event.computeOptions(characterStore)
  if (event.enemyPower) {
    const playerPower = characterStore.combatPower || (characterStore.level || 1) * 10
    options = adjustCombatWeights(options, playerPower, event.enemyPower)
  }
  const weights = options.map(opt => opt.weight || 40)
  const targetIndex = weightedRandomIndex(weights)

  currentStepData.value = { step: event, options, weights, targetIndex, result: options[targetIndex] }
  // selectNextEvent 已设置 progressStore.currentEvent，此处确保同步
  if (!progressStore.currentEvent) progressStore.currentEvent = event
  
  // 叙事前缀 + 地点首次访问 + 战力对比 + 原始 prelude
  const prefix = progressStore.getNarrativePrefix()
  const locationIntro = getFirstVisitIntro(event)
  const powerNote = event.enemyPower ? `（你的战力 ${characterStore.combatPower} vs 敌方 ${event.enemyPower}）\n` : ''
  narrativeText.value = prefix + locationIntro + powerNote + (event.prelude || `命运之轮转动——${event.title}`)
  
}

function loadFinaleStep() {
  const stepIndex = progressStore.stepIndex
  const step = FINALE_STEPS[stepIndex]
  if (!step) {
    console.warn('[Wheel] 终章步骤越界:', stepIndex)
    return
  }
  const options = step.computeOptions(characterStore)
  const weights = options.map(opt => opt.weight || 40)
  const targetIndex = weightedRandomIndex(weights)

  currentStepData.value = { step, options, weights, targetIndex, result: options[targetIndex] }
  progressStore.currentEvent = { id: step.key, title: step.title, icon: step.icon, ...step }
  narrativeText.value = step.prelude || `命运之轮转动——${step.title}`
}

function showRelationToast(result) {
  if (!result?.worldImpact) return
  const nameMap = { tangSan: '唐三', xiaoWu: '小舞', daiMuBai: '戴沐白', oscar: '奥斯卡', maHongJun: '马红俊', ningRongRong: '宁荣荣', zhuZhuQing: '朱竹清', biBiDong: '比比东', huLiena: '胡列娜', tangHao: '唐昊', yuXiaoGang: '玉小刚', duGuBo: '独孤博' }
  for (const [name, data] of Object.entries(result.worldImpact)) {
    if (!nameMap[name]) continue
    const aff = data.affinity
    if (aff && aff !== 0) {
      const arrow = aff > 0 ? '↑' : '↓'
      relationToast.value = { type: aff > 0 ? 'positive' : 'negative', text: `${nameMap[name]} 好感 ${arrow}${Math.abs(aff)}` }
      setTimeout(() => { relationToast.value = null }, 2500)
    }
  }
}

function syncRelationships() {
  for (const [name, data] of Object.entries(worldStore.characters)) {
    if (data.met) characterStore.setRelationship(name, data)
  }
}

/** 追踪关键物品 */
function trackKeyItem(result) {
  if (!result?.label) return
  const label = result.label
  const itemMap = {
    '二十四桥明月夜': '二十四桥明月夜',
    '海神三叉戟碎片': '海神三叉戟碎片',
    '海神三叉戟': '海神三叉戟',
    '海神头骨': '海神头骨',
    '玄天宝录': '玄天宝录',
    '冰火两仪眼': '冰火两仪眼的掌控权',
    '龙神残魂': '龙神残魂',
  }
  for (const [key, item] of Object.entries(itemMap)) {
    if (label.includes(key)) { characterStore.addKeyItem(item); break }
  }
  // 魂骨获得
  if (result.soulBone) {
    characterStore.addKeyItem(`${result.soulBone.beast || '未知'}魂骨`)
  }
}

/** 获取首次访问地点的环境描写 */
function getFirstVisitIntro(event) {
  const title = event?.title || ''
  const locMap = {
    '星斗': '星斗大森林', '森林': '星斗大森林', '海神': '海神岛',
    '诺丁': '诺丁城', '史莱克': '史莱克学院', '杀戮': '杀戮之都',
    '武魂殿': '武魂殿', '嘉陵关': '嘉陵关', '庚辛': '庚辛城',
    '极北': '极北之地', '神界': '神界', '落日': '星斗大森林',
  }
  for (const [key, loc] of Object.entries(locMap)) {
    if (title.includes(key)) {
      const isFirst = progressStore.markLocationVisited(loc)
      if (isFirst) return progressStore.getLocationIntro(loc) + '\n\n'
    }
  }
  return ''
}

function onNarrativeComplete() {}

function findMissedRingEvent() {
  const level = characterStore.level
  const rings = characterStore.soulRings
  for (let i = 0; i < 10; i++) {
    if (rings[i]) continue
    const ringLevel = (i + 1) * 10
    if (level > ringLevel + 6) {
      const event = EVENT_POOL.find(e => e.id === `ring_lv${ringLevel}`)
      if (event) return event
    }
  }
  return null
}

function loadRingEvent(event) {
  const options = event.computeOptions(characterStore)
  const weights = options.map(opt => opt.weight || 40)
  const targetIndex = weightedRandomIndex(weights)
  currentStepData.value = { step: event, options, weights, targetIndex, result: options[targetIndex] }
  progressStore.currentEvent = event
  narrativeText.value = '魂环猎取的机会来了！\n' + (event.prelude || '')
}

function powerComparison(enemy) {
  const r = (characterStore.combatPower||1) / (enemy||1)
  return r>=2?'碾压优势':r>=1.3?'明显优势':r>=0.7?'势均力敌':r>=0.4?'处于劣势':'九死一生'
}

function openCharacter() {
  uni.navigateTo({ url: '/pages/character/character' })
}

function saveAndQuit() {
  saveGame(characterStore.$state, progressStore.$state, worldStore.$state)
  uni.redirectTo({ url: '/pages/index/index' })
}

const manualModeLocal = ref(false)
function syncMode() {
  if (wheelRef.value) wheelRef.value.manualMode = manualModeLocal.value
}

// ========== 交互逻辑 ==========
function onSpinStart() {
  isSpinning.value = true
  showRarityEffect.value = false
}

function onWheelResult(targetIndex) {
  isSpinning.value = false
  if (!currentStepData.value) return

  const { step, options } = currentStepData.value
  const result = options[targetIndex]
  if (!result) return

  currentResult.value = result
  resultNarrative.value = generateResultNarrative(step, result)
  showRarityEffect.value = true

  setTimeout(() => { isShowingResult.value = true }, 600)
}

function onResultNext() {
  isShowingResult.value = false
  showRarityEffect.value = false
  if (!currentResult.value || !currentStepData.value) return

  const { step } = currentStepData.value
  const result = currentResult.value

  // 提交结果
  characterStore.commitResult(step.id || step.key, result.label, result.rarity, result.extra)
  
  // 更新特质
  characterStore.updateTraits(result)

  // 魂环（自动填入第一个空槽）
  if (result.soulRing) {
    characterStore.addSoulRing({ ...result.soulRing, rarity: result.rarity, skill: result.soulRing.skill || result.label })
  }

  // 魂骨
  if (result.soulBone) {
    characterStore.addSoulBone({ ...result.soulBone, rarity: result.rarity })
  }

  // 武器
  if (result.weapon) {
    characterStore.addWeapon(result.weapon)
  }

  // 封号/神位
  if (step.id === 'titleDouluo') characterStore.title = result.label
  if (step.id === 'godTrial' || step.id === 'godChoice') characterStore.addGodhood(result.label)
  if (step.id === 'arc_seagod_9' && result.label.includes('海神')) characterStore.addGodhood('海神')
  if (step.id === 'arc_angel_9' && result.label.includes('天使')) characterStore.addGodhood('天使神')
  if (step.id === 'arc_asura_9' && result.label.includes('修罗')) characterStore.addGodhood('修罗神')
  if (step.id === 'canon_godWar' && result.label.includes('海神')) characterStore.addGodhood('海神')
  if (step.id === 'chapter_climax_5') {
    if (result.label.includes('海神')) characterStore.addGodhood('海神')
    else if (result.label.includes('修罗')) characterStore.addGodhood('修罗神')
    else if (result.label.includes('天使')) characterStore.addGodhood('天使神')
  }

  // 统一经验计算
  let bonusXP = 0
  if (result.soulRing) bonusXP += 3
  if (result.levelBoost && result.levelBoost > 0) {
    bonusXP += result.levelBoost * 8
  }

  const xpResult = characterStore.gainXP(result.rarity, bonusXP)
  lastXpGained.value = xpResult.gained
  if (xpResult.leveled > 0) {
    showLevelUp.value = true
    levelUpText.value = `⬆ Lv.${characterStore.level}`
    setTimeout(() => { showLevelUp.value = false }, 2000)
  }
  lastCrit.value = xpResult.crit
  if (xpResult.leveled > 0) {
    console.log(`[XP] +${xpResult.gained}XP${xpResult.crit ? ' ⚡暴击!' : ''}, 等级=${xpResult.newLevel}, 升了${xpResult.leveled}级`)
  }

  // 同步等级
  progressStore.setLevel(characterStore.level)

  // 解锁事件
  if (result.unlocks) {
    const unlocks = Array.isArray(result.unlocks) ? result.unlocks : [result.unlocks]
    progressStore.unlockEvents(unlocks)
  }

  // 世界影响
  if (result.worldImpact) {
    const beautyMult = characterStore.beautyMultiplier
    worldStore.applyImpact(result.worldImpact, beautyMult)
    syncRelationships()
    // 叙事标记
    if (result.worldImpact.xiaoWu?.alive === true) progressStore.setNarrativeFlag('savedXiaoWu', true)
    if (result.worldImpact.biBiDong?.faction === 'friend') progressStore.setNarrativeFlag('joinedWuHun', true)
    if (result.worldImpact.biBiDong?.faction === 'enemy') progressStore.setNarrativeFlag('againstWuHun', true)
    if (result.worldImpact.seaGodInherited) progressStore.setNarrativeFlag('godInherited', true)
    if (result.worldImpact.slaughterCity?.domain === 'killingGod') progressStore.setNarrativeFlag('killingDomain', true)
    // 领域获得
    if (result.worldImpact.domain) characterStore.addDomain(result.worldImpact.domain)
  }

  // 完成当前事件
  progressStore.completeCurrentEvent()
  
  // 消耗临时Buff
  characterStore.consumeBuff()
  
  // 命运日记追加
  destinyEntries.value.push({
    icon: step.icon || progressStore.currentEvent?.icon || '📖',
    text: `${step.title || progressStore.currentEvent?.title || '命运'}: ${result.label}`,
    rarity: result.rarity,
  })
  if (destinyEntries.value.length > 30) destinyEntries.value.shift()
  
  // 关系变动提示
  showRelationToast(result)

  // 关键物品追踪
  trackKeyItem(result)

  // 推进步骤（prequel）
  if (progressStore.phase === 'prequel') {
    // stepIndex 已在 completeCurrentEvent() 中递增，此处只做阶段切换判断
    if (progressStore.stepIndex >= 9) {
      progressStore.phase = 'growth'
      progressStore.stepIndex = 0
    }
  }

  // 触发终章
  if (progressStore.shouldTriggerFinale && progressStore.phase === 'growth') {
    progressStore.phase = 'finale'
  }

  // 终章结束
  if (progressStore.phase === 'finale' && progressStore.stepIndex >= 4) {
    saveGame(characterStore.$state, progressStore.$state, worldStore.$state)
    uni.redirectTo({ url: '/pages/result/result' })
    return
  }

  // 自动存档
  saveGame(characterStore.$state, progressStore.$state, worldStore.$state)

  // 加载下一步
  currentResult.value = null
  currentStepData.value = null
  progressStore.currentEvent = null
  nextTick(() => { loadCurrentStep() })
}

function goBack() {
  const ok = progressStore.retreat()
  if (ok) {
    currentResult.value = null
    currentStepData.value = null
    progressStore.currentEvent = null
    showRarityEffect.value = false
    isShowingResult.value = false
    nextTick(() => loadCurrentStep())
  }
}
</script>

<style lang="scss" scoped>
.wheel-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #FFFDF5 0%, #FFF8E7 50%, #FFF3D6 100%);
  display: flex;
  flex-direction: column;
}

.nav-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 88rpx 24rpx 16rpx;
  background: rgba(255,255,255,0.8);
}

.nav-back {
  padding: 8rpx 16rpx;
}
.nav-back-icon { font-size: 32rpx; color: #F5A623; }
.nav-save { padding: 6rpx 12rpx; cursor: pointer; }
.nav-save-icon { font-size: 28rpx; }

.nav-title {
  font-size: 30rpx;
  font-weight: bold;
  color: #2C2416;
  flex: 1;
  text-align: center;
}

.nav-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}
.nav-power { font-size: 20rpx; font-weight: bold; }
.nav-lv { font-size: 24rpx; font-weight: bold; color: #F5A623; }

.wheel-zone {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 20rpx 0;
}

.mode-bar {
  display: flex; gap: 0; margin-bottom: 12rpx;
  background: rgba(255,255,255,0.95); border-radius: 30rpx;
  overflow: hidden; box-shadow: 0 4rpx 16rpx rgba(0,0,0,0.1);
}
.mode-bar .mode-btn {
  padding: 14rpx 36rpx; font-size: 28rpx; font-weight: bold;
  cursor: pointer; color: #6B5E4A; transition: all 0.2s;
}
.mode-bar .mode-btn.active { background: linear-gradient(135deg, #F5A623, #FF8C00); color: #fff; }

.attrs-scroll { padding: 0 20rpx; }
.attrs-scroll-inner {
  display: flex;
  white-space: nowrap;
  padding: 8rpx 0;
}

/* 关系变动提示 */
.relation-toast {
  position: fixed;
  top: 200rpx;
  left: 50%;
  transform: translateX(-50%);
  padding: 12rpx 28rpx;
  border-radius: 30rpx;
  font-size: 24rpx;
  font-weight: bold;
  z-index: 50;
  animation: toastIn 0.4s ease, toastOut 0.4s 2.1s ease forwards;
  pointer-events: none;
}
.toast-positive { background: rgba(126,211,33,0.9); color: #fff; }
.toast-negative { background: rgba(232,93,63,0.9); color: #fff; }

.level-up-toast {
  position: fixed; top: 50%; left: 50%; transform: translate(-50%,-50%);
  background: linear-gradient(135deg,#FFD700,#FFA000); padding: 24rpx 48rpx;
  border-radius: 30rpx; z-index: 999; animation: levelUpPop 0.5s ease-out;
}
.level-up-text { font-size: 40rpx; font-weight: bold; color: #fff; text-shadow: 0 2rpx 8rpx rgba(0,0,0,0.3); }
@keyframes levelUpPop {
  0% { transform: translate(-50%,-50%) scale(0.3); opacity: 0; }
  50% { transform: translate(-50%,-50%) scale(1.2); opacity: 1; }
  100% { transform: translate(-50%,-50%) scale(1); opacity: 0.9; }
}

@keyframes toastIn { from { opacity: 0; transform: translateX(-50%) translateY(-20rpx); } to { opacity: 1; transform: translateX(-50%) translateY(0); } }
@keyframes toastOut { from { opacity: 1; } to { opacity: 0; transform: translateX(-50%) translateY(-20rpx); } }

/* 成就弹窗 */
.achievement-toast {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: linear-gradient(135deg, #FFD700, #FFA000);
  border-radius: 20rpx;
  padding: 24rpx 36rpx;
  display: flex;
  align-items: center;
  gap: 16rpx;
  z-index: 60;
  animation: achIn 0.5s ease, achOut 0.5s 3.5s ease forwards;
  box-shadow: 0 8rpx 40rpx rgba(255, 215, 0, 0.5);
  pointer-events: none;
}
.ach-icon { font-size: 48rpx; }
.ach-title { font-size: 28rpx; font-weight: bold; color: #fff; }
.ach-desc { font-size: 22rpx; color: rgba(255,255,255,0.9); }

@keyframes achIn { from { opacity: 0; transform: translate(-50%, -50%) scale(0.5); } to { opacity: 1; transform: translate(-50%, -50%) scale(1); } }
@keyframes achOut { from { opacity: 1; } to { opacity: 0; transform: translate(-50%, -50%) scale(1.1); } }
</style>
