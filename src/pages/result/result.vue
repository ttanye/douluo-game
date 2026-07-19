<template>
  <!-- 最终传记页 -->
  <view class="result-page">
    <scroll-view class="result-scroll" scroll-y>
      <!-- 标题 -->
      <view class="result-header">
        <text class="result-icon">📖</text>
        <text class="result-title">命运之书</text>
        <text class="result-subtitle">{{ characterStore.playerName || '无名魂师' }} · 角色传记</text>
      </view>

      <!-- 结局叙言 -->
      <view class="card ending-card">
        <text class="ending-text">{{ endingText }}</text>
      </view>

      <!-- 角色基本信息 -->
      <view class="card bio-card">
        <text class="card-title">📋 基本信息</text>
        <view class="bio-grid">
          <view class="bio-item" v-for="item in bioItems" :key="item.label">
            <text class="bio-label">{{ item.label }}</text>
            <text class="bio-value" :class="item.rarityClass">{{ item.value }}</text>
          </view>
        </view>
      </view>

      <!-- 战力总评 -->
      <view class="card power-card">
        <text class="card-title">⚔️ 战力总评</text>
        <view class="power-display">
          <text class="power-num" :style="{ color: characterStore.powerRank.color }">{{ characterStore.combatPower }}</text>
          <text class="power-rank" :style="{ color: characterStore.powerRank.color }">{{ characterStore.powerRank.rank }}</text>
        </view>
        <text class="power-trait">主导特质：{{ characterStore.traitLabel }}</text>
      </view>

      <!-- 战力排名 -->
      <view class="card rank-card">
        <text class="card-title">🏆 大陆排名</text>
        <text class="rank-num">#{{ powerRank }}</text>
        <text class="rank-desc">{{ rankDesc }}</text>
      </view>

      <!-- 魂环配置 -->
      <view class="card rings-card">
        <text class="card-title">💍 魂环配置</text>
        <view class="rings-grid" v-if="characterStore.totalSoulRings > 0">
          <view class="ring-row" v-for="ring in characterStore.soulRings" :key="ring.slot">
            <view class="ring-dot" :style="{ background: ring.colorHex || '#ccc' }"></view>
            <text class="ring-detail">{{ ring.slot }}. {{ ring.beast }} · {{ ring.year }}年 · {{ ring.skill || '——' }}</text>
          </view>
        </view>
        <text v-else class="empty-text">暂无魂环</text>
      </view>

      <!-- 魂骨装备 -->
      <view class="card bones-card">
        <text class="card-title">🦴 魂骨装备</text>
        <view class="bones-grid" v-if="characterStore.totalSoulBones > 0">
          <view class="bone-row" v-for="bone in Object.values(characterStore.soulBones).filter(b => b)" :key="bone.slot">
            <text class="bone-slot">{{ slotLabels[bone.slot] || bone.slot }}</text>
            <text class="bone-detail">{{ bone.beast }} · {{ bone.skill || '——' }}</text>
          </view>
        </view>
        <text v-else class="empty-text">暂无魂骨</text>
      </view>

      <!-- 人际关系 -->
      <view class="card relations-card" v-if="metRelations.length > 0">
        <text class="card-title">🤝 命运交织</text>
        <view class="relation-row" v-for="rel in metRelations" :key="rel.key">
          <text class="rel-name">{{ rel.label }}</text>
          <text class="rel-status" :class="'faction-' + rel.faction">
            {{ rel.faction === 'friend' ? '🤝 挚友' : rel.faction === 'enemy' ? '⚔️ 宿敌' : '👤 相识' }}
          </text>
          <text class="rel-affinity">羁绊 {{ rel.affinity }}</text>
        </view>
      </view>

      <!-- 关键抉择 -->
      <view class="card choices-card" v-if="characterStore.keyChoices.length > 0">
        <text class="card-title">🔀 关键抉择</text>
        <view class="choice-row" v-for="choice in characterStore.keyChoices" :key="choice.key">
          <text class="choice-label">{{ formatChoiceLabel(choice.label) }}</text>
          <text class="choice-value">{{ choice.value }}</text>
        </view>
      </view>

      <!-- 稀有度统计 -->
      <view class="card rarity-card">
        <text class="card-title">✨ 命运统计</text>
        <view class="rarity-bars">
          <view class="rarity-bar-row" v-for="r in rarityList" :key="r.key">
            <text class="rarity-bar-label" :class="'text-rarity-' + r.key.toLowerCase()">{{ r.label }}</text>
            <view class="rarity-bar-track">
              <view class="rarity-bar-fill" :style="{ width: rarityPercent(r.key) + '%', background: r.color }"></view>
            </view>
            <text class="rarity-bar-count">{{ characterStore.rarityStats[r.key] || 0 }}</text>
          </view>
        </view>
      </view>

      <!-- 操作按钮 -->
      <view class="result-actions">
        <view class="btn-restart" @tap="restartGame">
          <text class="btn-restart-text">重新书写命运</text>
        </view>
        <view class="btn-home" @tap="goHome">
          <text class="btn-home-text">返回首页</text>
        </view>
      </view>

      <view class="footer-space"></view>
    </scroll-view>
  </view>
</template>

<script setup>
import { computed } from 'vue'
import { useCharacterStore } from '../../stores/character'
import { useProgressStore } from '../../stores/progress'
import { useWorldStore } from '../../stores/world'
import { RARITY_COLORS } from '../../config/colors'

const characterStore = useCharacterStore()
const progressStore = useProgressStore()
const worldStore = useWorldStore()

const endingText = computed(() => {
  const trait = characterStore.dominantTrait
  const level = characterStore.level
  const godhood = characterStore.godhood
  const name = characterStore.playerName || '无名魂师'
  
  if (godhood && level >= 95) {
    return `【神之巅】${name}——${godhood}。你以凡人之躯比肩神明，斗罗大陆因你而改写。神界为你加冕，万世传颂你的名。`
  }
  if (level >= 90) {
    return `【凡之巅】${name}——虽未成神，但你以凡人之力登上了大陆之巅。封号斗罗的威名，足以让后世铭记。`
  }
  if (trait === 'cunning' || trait === 'fierce') {
    return `【暗之主】${name}——你的道路充满争议。但没有人能否认——是你改变了这个世界的走向。黑暗中的王者，自有其光芒。`
  }
  if (trait === 'wise' || trait === 'mystic') {
    return `【隐者】${name}——你选择了远离尘嚣。冰火两仪眼旁的一间草庐，见证了你的余生。智慧不需要观众。`
  }
  return `【轮回】${name}——命运之轮继续转动。你的故事结束了，但新的传说才刚刚开始。有人在星斗大森林的深处，看到了一个似曾相识的身影……`
})

const slotLabels = {
  head: '头部', rightArm: '右臂', leftArm: '左臂',
  torso: '躯干', rightLeg: '右腿', leftLeg: '左腿', external: '外附',
}

const nameMap = {
  tangSan: '唐三', xiaoWu: '小舞', daiMuBai: '戴沐白',
  oscar: '奥斯卡', maHongJun: '马红俊', ningRongRong: '宁荣荣',
  zhuZhuQing: '朱竹清', biBiDong: '比比东', yuXiaoGang: '玉小刚',
  liuErLong: '柳二龙', tangHao: '唐昊', qianRenXue: '千仞雪', huLiena: '胡列娜', duGuBo: '独孤博',
}

const bioItems = computed(() => {
  const a = characterStore.attributes
  return [
    { label: '时代', value: a.era || '——', rarityClass: '' },
    { label: '性别', value: a.gender || '——', rarityClass: '' },
    { label: '种族', value: a.race || '——', rarityClass: getRarityClass(a.race) },
    { label: '武魂', value: `${a.soulType || '?'} · ${a.soulQuality || '?'}`, rarityClass: getRarityClass(a.soulQualityRarity) },
    { label: '先天魂力', value: `${parseInt((a.innatePower || '').match(/\d+/)?.[0]) || '?'} 级`, rarityClass: (parseInt((a.innatePower || '').match(/\d+/)?.[0])||0) >= 9 ? 'text-rarity-sss' : '' },
    { label: '出身', value: `${a.birthplace || '?'} · ${a.family || '?'}`, rarityClass: '' },
    { label: '颜值', value: a.appearance || '——', rarityClass: '' },
    { label: '印记', value: (a.specialTag || []).filter(t => t !== '无').join('、') || '无', rarityClass: '' },
    { label: '最终等级', value: `${characterStore.level} 级`, rarityClass: '' },
    { label: '封号', value: characterStore.title || '——', rarityClass: 'text-rarity-sss' },
    { label: '神位', value: characterStore.godhood || '——', rarityClass: 'text-rarity-sss' },
  ]
})

const metRelations = computed(() => {
  return Object.entries(characterStore.relationships)
    .filter(([_, r]) => r.met)
    .map(([key, rel]) => ({ key, label: nameMap[key] || key, ...rel }))
})

const rarityList = computed(() => {
  return Object.entries(RARITY_COLORS).map(([key, info]) => ({
    key, label: info.label, color: info.bg,
  }))
})

function rarityPercent(key) {
  const total = Object.values(characterStore.rarityStats).reduce((s, c) => s + c, 0) || 1
  return Math.round((characterStore.rarityStats[key] || 0) / total * 100)
}

const powerRank = computed(() => {
  const p = characterStore.combatPower
  if (p >= 100000) return 1; if (p >= 60000) return 2; if (p >= 30000) return 5
  if (p >= 15000) return 10; if (p >= 8000) return 50; if (p >= 4000) return 200
  if (p >= 1500) return 1000; return 5000
})
const rankDesc = computed(() => {
  const r = powerRank.value
  if (r===1) return '你已站在大陆之巅，与神并肩'
  if (r<=5) return '封号斗罗中的顶尖存在'; if (r<=10) return '大陆前十'
  if (r<=50) return '魂斗罗中的佼佼者'; if (r<=200) return '名震一方'
  if (r<=1000) return '小有名气'; return '仍在成长中'
})

function getRarityClass(rarity) {
  if (!rarity) return ''
  const r = typeof rarity === 'string' ? rarity : 'C'
  return `text-rarity-${r.toLowerCase()}`
}

function restartGame() {
  characterStore.reset()
  progressStore.reset()
  worldStore.reset()
  uni.redirectTo({ url: '/pages/wheel/wheel' })
}

function formatChoiceLabel(label) {
  const map = {
    xiaoWuSacrifice: '小舞献祭', slaughterCity: '杀戮之都', tangSectWeapons: '唐门暗器',
    fourClans: '四大宗族', finalStance: '最终立场', grandBattle: '嘉陵关大战',
    iceFireWell: '冰火两仪眼', godTrial: '神位考验', moralChoice: '道德抉择',
    soulRing: '魂环获取', soulBone: '魂骨奇遇', firstTeacher: '第一位老师',
    firstEncounter: '初遇', graduation: '毕业去向', alliance: '结盟选择',
  }
  return map[label] || label.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())
}

function goHome() {
  uni.redirectTo({ url: '/pages/index/index' })
}
</script>

<style lang="scss" scoped>
.result-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #FFF8E7 0%, #FFFDF5 50%, #FFF3D6 100%);
}

.result-scroll {
  height: 100vh;
  padding: 0 24rpx;
}

/* 标题 */
.result-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60rpx 0 30rpx;
}

.result-icon { font-size: 64rpx; }
.result-title { font-size: 48rpx; font-weight: bold; color: #2C2416; margin-top: 8rpx; }
.result-subtitle { font-size: 28rpx; color: #A09888; margin-top: 4rpx; }

/* 结局叙言 */
.ending-card {
  background: linear-gradient(135deg, rgba(245,166,35,0.08), rgba(255,215,0,0.04));
  border-left: 4rpx solid #F5A623;
}
.ending-text {
  font-size: 28rpx;
  color: #2C2416;
  line-height: 2;
  font-weight: 500;
}

/* 卡片 */
.card {
  background: #fff;
  border-radius: 20rpx;
  padding: 28rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 4rpx 20rpx rgba(44,36,22,0.06);
}

.card-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #2C2416;
  display: block;
  margin-bottom: 16rpx;
}

/* 基本信息网格 */
.bio-grid {
  display: flex;
  flex-wrap: wrap;
}

.bio-item {
  width: 50%;
  padding: 8rpx 0;
}

.bio-label {
  font-size: 22rpx;
  color: #A09888;
  display: block;
}

.bio-value {
  font-size: 26rpx;
  color: #2C2416;
  font-weight: 500;
}

.rank-card { text-align: center; background: linear-gradient(135deg, rgba(245,166,35,0.08), rgba(255,215,0,0.04)); }
.rank-num { font-size: 64rpx; font-weight: bold; color: #F5A623; }
.rank-desc { font-size: 24rpx; color: #6B5E4A; display: block; margin-top: 4rpx; }

/* 战力总评 */
.power-display {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 12rpx;
  padding: 16rpx 0;
}
.power-num {
  font-size: 64rpx;
  font-weight: bold;
}
.power-rank {
  font-size: 36rpx;
  font-weight: bold;
}
.power-trait {
  font-size: 24rpx;
  color: #6B5E4A;
  text-align: center;
  display: block;
}

/* 魂环 */
.rings-grid { }

.ring-row {
  display: flex;
  align-items: center;
  padding: 8rpx 0;
  border-bottom: 1rpx solid #F5F0E8;
}

.ring-dot {
  width: 20rpx;
  height: 20rpx;
  border-radius: 50%;
  margin-right: 12rpx;
  flex-shrink: 0;
}

.ring-detail {
  font-size: 24rpx;
  color: #2C2416;
}

/* 魂骨 */
.bones-grid { }

.bone-row {
  display: flex;
  padding: 8rpx 0;
  border-bottom: 1rpx solid #F5F0E8;
}

.bone-slot {
  font-size: 24rpx;
  color: #F5A623;
  font-weight: bold;
  width: 80rpx;
}

.bone-detail {
  font-size: 24rpx;
  color: #2C2416;
}

/* 关系 */
.relation-row {
  display: flex;
  align-items: center;
  padding: 8rpx 0;
  border-bottom: 1rpx solid #F5F0E8;
}

.rel-name { font-size: 26rpx; color: #2C2416; font-weight: 500; width: 120rpx; }
.rel-status { font-size: 24rpx; margin-right: 12rpx; }
.faction-friend { color: #7ED321; }
.faction-enemy { color: #E85D3F; }
.rel-affinity { font-size: 22rpx; color: #A09888; margin-left: auto; }

/* 稀有度统计 */
.rarity-bars { }

.rarity-bar-row {
  display: flex;
  align-items: center;
  padding: 6rpx 0;
}

.rarity-bar-label {
  font-size: 22rpx;
  font-weight: bold;
  width: 80rpx;
}

.rarity-bar-track {
  flex: 1;
  height: 16rpx;
  background: #F0E8D8;
  border-radius: 8rpx;
  overflow: hidden;
  margin: 0 12rpx;
}

.rarity-bar-fill {
  height: 100%;
  border-radius: 8rpx;
  transition: width 0.5s ease;
}

.rarity-bar-count {
  font-size: 22rpx;
  color: #2C2416;
  width: 30rpx;
  text-align: right;
}

.empty-text {
  font-size: 24rpx;
  color: #C8C0B0;
  text-align: center;
  display: block;
  padding: 20rpx 0;
}

/* 关键抉择 */
.choice-row {
  display: flex;
  justify-content: space-between;
  padding: 10rpx 0;
  border-bottom: 1rpx solid #F5F0E8;
}

.choice-label {
  font-size: 24rpx;
  color: #6B5E4A;
}

.choice-value {
  font-size: 24rpx;
  color: #2C2416;
  font-weight: 500;
}

/* 按钮 */
.result-actions {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16rpx;
  padding: 20rpx 0;
}

.btn-restart {
  background: linear-gradient(135deg, #F5A623, #E8951F);
  border-radius: 60rpx;
  padding: 22rpx 80rpx;
  box-shadow: 0 8rpx 24rpx rgba(245,166,35,0.3);
}

.btn-restart-text { font-size: 30rpx; font-weight: bold; color: #fff; }

.btn-home {
  padding: 14rpx 40rpx;
}

.btn-home-text { font-size: 26rpx; color: #A09888; }

.footer-space { height: 60rpx; }
</style>
