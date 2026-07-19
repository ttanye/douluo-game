<template>
  <scroll-view class="char-page" scroll-y>
    <!-- 头像区 -->
    <view class="char-header">
      <text class="char-icon">🛡️</text>
      <text class="char-name">{{ characterStore.playerName || '无名魂师' }}</text>
      <text class="char-sub" v-if="characterStore.title">{{ characterStore.title }}</text>
      <view class="power-row">
        <text class="power-num" :style="{ color: characterStore.powerRank.color }">{{ characterStore.combatPower }}</text>
        <text class="power-rank" :style="{ color: characterStore.powerRank.color }">{{ characterStore.powerRank.rank }}</text>
        <text class="power-trait">{{ characterStore.traitLabel }}</text>
      </view>
      <view class="stance-badge" :style="{ background: stanceColor }">{{ stanceLabel }}</view>
    </view>

    <!-- 基本信息 -->
    <view class="card">
      <text class="card-title">📋 基本信息</text>
      <view class="row"><text class="k">武魂</text><text class="v">{{ soulType }} · {{ soulQuality }}</text></view>
      <view class="row"><text class="k">先天魂力</text><text class="v">{{ innate }} 级</text></view>
      <view class="row"><text class="k">等级</text><text class="v">Lv.{{ characterStore.level }}</text></view>
      <view class="xp-bar"><view class="xp-fill" :style="{ width: xpPercent + '%' }"></view><text class="xp-text">{{ characterStore.xp }}/{{ characterStore.xpToNext }}</text></view>
      <view class="row"><text class="k">战力明细</text><text class="v">等级 {{ lvPower }} + 魂环 {{ ringPower }} + 魂骨 {{ bonePower }}{{ domainPower ? ' + 领域 ' + domainPower : '' }}</text></view>
    </view>

    <!-- 魂环 -->
    <view class="card">
      <text class="card-title">💍 第一武魂魂环（{{ characterStore.soulRings.filter(r=>r).length }}/10）</text>
      <view class="rings-grid">
        <view v-for="i in 10" :key="i" class="ring-cell" :class="{ empty: !characterStore.soulRings[i-1], filled: characterStore.soulRings[i-1] }">
          <template v-if="characterStore.soulRings[i-1]">
            <view class="ring-dot" :style="{ background: characterStore.soulRings[i-1].colorHex || '#ccc' }"></view>
            <text class="ring-num">#{{ i }}</text>
            <text class="ring-beast">{{ characterStore.soulRings[i-1].beast }}</text>
            <text class="ring-year">{{ characterStore.soulRings[i-1].colorName }}·{{ characterStore.soulRings[i-1].year }}年</text>
          </template>
          <template v-else>
            <text class="ring-num">#{{ i }}</text><text class="empty-text">——</text>
          </template>
        </view>
      </view>
    </view>
    <view class="card" v-if="characterStore.isTwinSoul">
      <text class="card-title">💍 第二武魂魂环（{{ characterStore.soulRings2.filter(r=>r).length }}/10）</text>
      <view class="rings-grid">
        <view v-for="i in 10" :key="'r2-'+i" class="ring-cell" :class="{ empty: !characterStore.soulRings2[i-1], filled: characterStore.soulRings2[i-1] }">
          <template v-if="characterStore.soulRings2[i-1]">
            <view class="ring-dot" :style="{ background: characterStore.soulRings2[i-1].colorHex || '#ccc' }"></view>
            <text class="ring-num">#{{ i }}</text>
            <text class="ring-beast">{{ characterStore.soulRings2[i-1].beast }}</text>
            <text class="ring-year">{{ characterStore.soulRings2[i-1].colorName }}·{{ characterStore.soulRings2[i-1].year }}年</text>
          </template>
          <template v-else>
            <text class="ring-num">#{{ i }}</text><text class="empty-text">——</text>
          </template>
        </view>
      </view>
    </view>

    <!-- 魂骨 -->
    <view class="card">
      <text class="card-title">🦴 魂骨装备（{{ characterStore.totalSoulBones }}/7）</text>
      <view class="bones-grid">
        <view v-for="(bone, slot) in characterStore.soulBones" :key="slot" class="bone-cell" :class="{ empty: !bone, filled: bone }">
          <template v-if="bone">
            <text class="bone-slot">{{ slotLabels[slot] }}</text>
            <text class="bone-beast">{{ bone.beast }}</text>
            <text class="bone-year" v-if="bone.year">{{ bone.year }}年</text>
            <text class="bone-rarity text-rarity-s">+{{ bonePowerSingle(bone) }}</text>
            <text class="bone-mutated" v-if="bone.mutated">✨变异</text>
          </template>
          <template v-else>
            <text class="bone-slot">{{ slotLabels[slot] }}</text>
            <text class="empty-text">空</text>
          </template>
        </view>
      </view>
    </view>

    <!-- 武器 -->
    <view class="card">
      <text class="card-title">⚔️ 武器（{{ characterStore.weapons.length }}件）</text>
      <view class="row"><text class="k">总战力</text><text class="v text-gold">+{{ characterStore.weaponPower }}</text></view>
      <view v-for="w in characterStore.weapons" :key="w.name" class="row">
        <text class="k">{{ w.name }}</text><text class="v">{{ w.rarity }} · {{ w.source }}</text>
      </view>
      <text class="text-dim" v-if="!characterStore.weapons.length">空手</text>
    </view>

    <!-- 领域与神位 -->
    <view class="card">
      <text class="card-title">🌐 领域与神位</text>
      <view class="row"><text class="k">神位</text><text class="v" :class="characterStore.godhood ? 'text-gold' : 'text-dim'">{{ characterStore.godhood || '凡人' }}</text></view>
      <view class="row"><text class="k">领域</text><text class="v">{{ characterStore.domains.length ? characterStore.domains.join('、') : '无' }}</text></view>
      <view class="row" v-if="characterStore.domains.length"><text class="k">领域加成</text><text class="v text-gold">战力 +{{ characterStore.domains.length * 25 }}%</text></view>
      <view class="row" v-if="characterStore.godhood"><text class="k">神位加成</text><text class="v text-gold">战力 +100%</text></view>
    </view>

    <!-- 好感度 -->
    <view class="card">
      <text class="card-title">🤝 好感度</text>
      <view v-for="(rel, name) in metRelations" :key="name" class="rel-row">
        <text class="rel-name">{{ nameMap[name] || name }}</text>
        <view class="rel-bar"><view class="rel-fill" :class="relFillClass(rel.affinity)" :style="{ width: Math.min(100, Math.abs(rel.affinity)) + '%' }"></view></view>
        <text class="rel-num">{{ rel.affinity > 0 ? '+' : '' }}{{ rel.affinity }}</text>
        <text class="rel-tag" :class="'faction-'+rel.faction">{{ factionLabel(rel.faction) }}</text>
      </view>
      <text v-if="metCount === 0" class="empty-text">尚未结识任何原著角色</text>
    </view>

    <!-- 成就 + 物品 -->
    <view class="card" v-if="characterStore.achievements.length > 0">
      <text class="card-title">🏆 成就（{{ characterStore.achievements.length }}）</text>
      <view class="ach-list">
        <view v-for="a in characterStore.achievements" :key="a" class="ach-item">
          <text>{{ characterStore.achievementMap[a]?.icon || '🏆' }} {{ characterStore.achievementMap[a]?.title || a }}</text>
        </view>
      </view>
    </view>

    <view class="card" v-if="characterStore.keyItems.length > 0">
      <text class="card-title">🎒 关键物品</text>
      <view class="items-list">
        <text v-for="item in characterStore.keyItems" :key="item" class="item-tag">{{ item }}</text>
      </view>
    </view>

    <!-- 统计 -->
    <view class="card">
      <text class="card-title">✨ 命运统计</text>
      <view v-for="r in rarityList" :key="r.key" class="r-row">
        <text class="r-label" :class="'text-rarity-'+r.key.toLowerCase()">{{ r.label }}</text>
        <view class="r-bar"><view class="r-fill" :style="{ width: rarityPercent(r.key)+'%', background: r.color }"></view></view>
        <text class="r-count">{{ characterStore.rarityStats[r.key] || 0 }}</text>
      </view>
    </view>

    <!-- 已完成事件 -->
    <view class="card">
      <text class="card-title">📜 已完成事件（{{ progressStore.eventHistory.length }}）</text>
      <text v-if="!progressStore.eventHistory.length" class="text-dim">暂无</text>
      <text v-for="(id,i) in progressStore.eventHistory.slice(-30).reverse()" :key="i" class="history-item">{{ id }}</text>
    </view>

    <view class="footer-space"></view>
  </scroll-view>
</template>

<script setup>
import { computed } from 'vue'
import { useCharacterStore } from '../../stores/character'
import { useProgressStore } from '../../stores/progress'
import { RARITY_COLORS } from '../../config/colors'

const characterStore = useCharacterStore()
const progressStore = useProgressStore()

const slotLabels = { head: '头部', rightArm: '右臂', leftArm: '左臂', torso: '躯干', rightLeg: '右腿', leftLeg: '左腿', external: '外附' }
const nameMap = { tangSan:'唐三', xiaoWu:'小舞', daiMuBai:'戴沐白', oscar:'奥斯卡', maHongJun:'马红俊', ningRongRong:'宁荣荣', zhuZhuQing:'朱竹清', biBiDong:'比比东', huLiena:'胡列娜', tangHao:'唐昊', yuXiaoGang:'玉小刚', liuErLong:'柳二龙', duGuBo:'独孤博', qianRenXue:'千仞雪' }

const soulType = computed(() => characterStore.attributes?.soulType || '?')
const soulQuality = computed(() => characterStore.attributes?.soulQuality || '?')
const innate = computed(() => {
  const raw = characterStore.attributes?.innatePower
  if (typeof raw === 'number') return raw
  return parseInt((raw || '').match(/\d+/)?.[0]) || 0
})
const xpPercent = computed(() => Math.min(100, Math.round((characterStore.xp || 0) / (characterStore.xpToNext || 1) * 100)))

const lvPower = computed(() => Math.floor(Math.pow(Math.max(1, characterStore.level), 1.4) * 1 * (Math.max(1, innate.value) / 5)))
const ringPower = computed(() => characterStore.soulRings.reduce((s, r, i) => { if (!r) return s; return s + ({'百万年':8000,'神级':12000,'神赐':10000,'十万年':3000,'五万年':1200,'万年':500,'五千年':180,'千年':60,'百年':15,'十年':1}[r.colorName]||10) * (1+i*0.18) }, 0))
const bonePower = computed(() => Object.values(characterStore.soulBones).filter(b=>b).reduce((s,b)=>s+(b.mutated?1.5:1)*({SSS:250,SS:150,S:90,A:55,B:30,C:15}[b.rarity]||15)*({head:1.2,torso:1.2,rightArm:1,leftArm:1,rightLeg:.9,leftLeg:.9,external:1.5}[b.slot]||1),0))
const domainPower = computed(() => Math.floor(characterStore.combatPower * characterStore.domains.length * 0.15 / (1 + characterStore.domains.length * 0.15)))

function bonePowerSingle(bone) {
  if (!bone) return 0
  return Math.floor(({SSS:250,SS:150,S:90,A:55,B:30,C:15}[bone.rarity]||15)*({head:1.2,torso:1.2,rightArm:1,leftArm:1,rightLeg:.9,leftLeg:.9,external:1.5}[bone.slot]||1)*(bone.mutated?1.5:1))
}

const stanceLabel = computed(() => {
  const r = characterStore.relationships
  if (r?.biBiDong?.faction === 'enemy') return '反抗军'
  if (r?.biBiDong?.faction === 'friend') return '武魂殿'
  if (r?.tangSan?.faction === 'friend') return '唐三盟友'
  return '中立'
})
const stanceColor = computed(() => ({ '反抗军': '#E85D3F', '武魂殿': '#9B59B6', '唐三盟友': '#7ED321', '中立': '#A09888' }[stanceLabel.value] || '#A09888'))

const metRelations = computed(() => {
  const rels = characterStore.relationships || {}
  return Object.entries(rels).filter(([_,r]) => r?.met)
})
const metCount = computed(() => metRelations.value.length)

function factionLabel(f) {
  return { friend:'🤝 挚友', enemy:'⚔️ 宿敌', hostile:'⚠️ 敌视', neutral:'👤 中立', rival:'🥊 对手' }[f] || '👤 中立'
}
function relFillClass(aff) {
  if (aff > 60) return 'fill-friend'
  if (aff > 20) return 'fill-neutral'
  if (aff < -20) return 'fill-enemy'
  return 'fill-neutral'
}

const rarityList = Object.entries(RARITY_COLORS).map(([k,v]) => ({ key: k, label: v.label, color: v.bg }))
function rarityPercent(key) {
  const t = Object.values(characterStore.rarityStats).reduce((s,c)=>s+c,0) || 1
  return Math.round((characterStore.rarityStats[key]||0)/t*100)
}
</script>

<style lang="scss" scoped>
.char-page { height: 100vh; background: linear-gradient(180deg,#FFF8E7,#FFFDF5); padding: 20rpx; }
.char-header { text-align: center; padding: 30rpx 0 20rpx; }
.char-icon { font-size: 72rpx; }
.char-name { font-size: 42rpx; font-weight: bold; color: #2C2416; display: block; margin-top: 6rpx; }
.char-sub { font-size: 26rpx; color: #F5A623; display: block; }
.power-row { display: flex; justify-content: center; align-items: baseline; gap: 10rpx; margin-top: 10rpx; }
.power-num { font-size: 44rpx; font-weight: bold; }
.power-rank { font-size: 24rpx; font-weight: bold; }
.power-trait { font-size: 22rpx; color: #6B5E4A; }
.stance-badge { display: inline-block; margin-top: 8rpx; padding: 4rpx 20rpx; border-radius: 20rpx; color: #fff; font-size: 22rpx; font-weight: bold; }

.card { background: #fff; border-radius: 16rpx; padding: 22rpx; margin-bottom: 14rpx; box-shadow: 0 3rpx 12rpx rgba(0,0,0,0.04); }
.card-title { font-size: 26rpx; font-weight: bold; color: #2C2416; display: block; margin-bottom: 10rpx; }
.row { display: flex; justify-content: space-between; padding: 5rpx 0; border-bottom: 1rpx solid #F5F0E8; }
.k { font-size: 24rpx; color: #A09888; } .v { font-size: 24rpx; color: #2C2416; font-weight: 500; }
.xp-bar { height: 14rpx; background: #F0E8D8; border-radius: 7rpx; margin: 6rpx 0; position: relative; }
.xp-fill { height: 100%; background: linear-gradient(90deg,#F5A623,#F8A726); border-radius: 7rpx; transition: width .4s; }
.xp-text { position: absolute; right: 0; top: -20rpx; font-size: 20rpx; color: #A09888; }

.rings-grid { display: flex; flex-wrap: wrap; gap: 8rpx; }
.ring-cell { width: 18%; background: #F8F5EF; border-radius: 10rpx; padding: 8rpx 4rpx; text-align: center; }
.ring-cell.empty { opacity: 0.45; }
.ring-cell.filled { border: 1rpx solid rgba(245,166,35,0.2); }
.ring-dot { width: 14rpx; height: 14rpx; border-radius: 50%; margin: 0 auto 3rpx; }
.ring-num { font-size: 16rpx; color: #A09888; }
.ring-beast { font-size: 17rpx; font-weight: bold; color: #2C2416; display: block; }
.ring-skill { font-size: 15rpx; color: #6B5E4A; }
.ring-year { font-size: 15rpx; color: #A09888; }

.bones-grid { display: flex; flex-wrap: wrap; gap: 8rpx; }
.bone-cell { width: 24%; background: #F8F5EF; border-radius: 10rpx; padding: 8rpx 4rpx; text-align: center; }
.bone-cell.empty { opacity: 0.45; }
.bone-cell.filled { border: 1rpx solid rgba(245,166,35,0.3); }
.bone-slot { font-size: 20rpx; font-weight: bold; color: #F5A623; }
.bone-beast { font-size: 18rpx; color: #2C2416; display: block; }
.bone-year { font-size: 16rpx; color: #6B5E4A; }
.bone-rarity { font-size: 18rpx; font-weight: bold; }
.bone-mutated { font-size: 16rpx; color: #FFD700; font-weight: bold; }

.domain-list { display: flex; flex-wrap: wrap; gap: 8rpx; align-items: center; }
.domain-item { background: linear-gradient(135deg,rgba(245,166,35,0.1),rgba(255,215,0,0.05)); border: 1rpx solid rgba(245,166,35,0.3); border-radius: 20rpx; padding: 6rpx 18rpx; font-size: 22rpx; color: #F5A623; font-weight: bold; }
.domain-bonus { font-size: 22rpx; color: #6B5E4A; }

.rel-row { display: flex; align-items: center; gap: 8rpx; padding: 6rpx 0; border-bottom: 1rpx solid #F5F0E8; }
.rel-name { font-size: 24rpx; color: #2C2416; font-weight: 500; width: 90rpx; }
.rel-bar { flex: 1; height: 10rpx; background: #F0E8D8; border-radius: 5rpx; overflow: hidden; }
.rel-fill { height: 100%; border-radius: 5rpx; }
.fill-friend { background: #7ED321; } .fill-neutral { background: #F5A623; } .fill-enemy { background: #E85D3F; }
.rel-num { font-size: 22rpx; color: #2C2416; width: 50rpx; text-align: right; }
.rel-tag { font-size: 20rpx; width: 90rpx; text-align: right; }
.faction-friend { color: #7ED321; } .faction-enemy { color: #E85D3F; } .faction-hostile { color: #F5A623; } .faction-neutral { color: #A09888; }

.ach-list { display: flex; flex-wrap: wrap; gap: 8rpx; font-size: 22rpx; color: #6B5E4A; }
.ach-item { background: #FFF8E7; border-radius: 10rpx; padding: 6rpx 14rpx; }

.items-list { display: flex; flex-wrap: wrap; gap: 6rpx; }
.item-tag { background: #FFF8E7; border-radius: 10rpx; padding: 5rpx 14rpx; font-size: 22rpx; color: #6B5E4A; }

.r-row { display: flex; align-items: center; padding: 3rpx 0; gap: 6rpx; }
.r-label { font-size: 22rpx; font-weight: bold; width: 60rpx; }
.r-bar { flex: 1; height: 10rpx; background: #F0E8D8; border-radius: 5rpx; overflow: hidden; }
.r-fill { height: 100%; border-radius: 5rpx; }
.r-count { font-size: 22rpx; color: #2C2416; width: 30rpx; text-align: right; }

.empty-text { font-size: 24rpx; color: #C8C0B0; text-align: center; display: block; padding: 16rpx 0; }
.footer-space { height: 60rpx; }

.text-gold { color: #F5A623; font-weight: bold; }
.history-item { display: block; font-size: 20rpx; color: #8B7E6A; padding: 2rpx 0; border-bottom: 1rpx solid #F5F0E8; }
</style>
