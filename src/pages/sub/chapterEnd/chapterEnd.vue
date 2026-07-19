<template>
  <!-- 章末小结页 -->
  <view class="chapter-end-page">
    <text class="end-label">—— {{ chapterTitle }} 完 ——</text>
    
    <!-- 本章统计 -->
    <view class="stats-card">
      <text class="stats-title">本章回顾</text>
      <view class="stat-row">
        <text class="stat-label">当前等级</text>
        <text class="stat-value">{{ characterStore.level }} 级</text>
      </view>
      <view class="stat-row">
        <text class="stat-label">累计魂环</text>
        <text class="stat-value">{{ characterStore.totalSoulRings }} 个</text>
      </view>
      <view class="stat-row" v-if="characterStore.totalSoulBones > 0">
        <text class="stat-label">获得魂骨</text>
        <text class="stat-value">{{ characterStore.totalSoulBones }} 块</text>
      </view>
      <view class="stat-row">
        <text class="stat-label">角色评价</text>
        <text class="stat-value rarity-text" :class="'text-rarity-' + dominantRarity.toLowerCase()">
          {{ dominantRarityLabel }}
        </text>
      </view>
    </view>

    <!-- 预言 -->
    <view class="forecast">
      <text class="forecast-icon">🔮</text>
      <text class="forecast-text">{{ forecastText }}</text>
    </view>

    <!-- 按钮 -->
    <view class="btn-next-chapter" @tap="nextChapter">
      <text class="btn-next-text">进入下一章</text>
      <text class="btn-next-arrow">→</text>
    </view>

    <view class="btn-save-quit" @tap="saveAndQuit">
      <text class="btn-quit-text">保存并退出</text>
    </view>
  </view>
</template>

<script setup>
import { computed } from 'vue'
import { useCharacterStore } from '../../stores/character'
import { useProgressStore } from '../../stores/progress'
import { useWorldStore } from '../../stores/world'
import { saveGame } from '../../utils/storage'

const characterStore = useCharacterStore()
const progressStore = useProgressStore()
const worldStore = useWorldStore()

const chapterTitle = computed(() => progressStore.chapterTitle || '未知章节')

const dominantRarity = computed(() => {
  const stats = characterStore.rarityStats
  let max = 'C'
  let maxCount = 0
  for (const [key, count] of Object.entries(stats)) {
    if (count > maxCount) { max = key; maxCount = count }
  }
  return max
})

const dominantRarityLabel = computed(() => {
  const map = { SSS: '天选传说', SS: '史诗传奇', S: '稀有英才', A: '优秀魂师', B: '普通魂师', C: '平凡魂师' }
  return map[dominantRarity.value] || '魂师'
})

const forecastText = computed(() => {
  const r = dominantRarity.value
  if (r === 'SSS' || r === 'SS') return '命运已经为你铺就了一条光辉之路。前方的挑战将更加艰难，但也更加辉煌——'
  if (r === 'S' || r === 'A') return '你已展现了不凡的潜力。接下来的路，机遇与危险并存——'
  return '平凡中的坚持最为可贵。命运的齿轮仍在转动，你的故事才刚刚开始——'
})

function nextChapter() {
  saveGame(characterStore.$state, progressStore.$state, worldStore.$state)
  uni.redirectTo({ url: '/pages/wheel/wheel' })
}

function saveAndQuit() {
  saveGame(characterStore.$state, progressStore.$state, worldStore.$state)
  uni.navigateBack({ delta: 999 })
}
</script>

<style lang="scss" scoped>
.chapter-end-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #FFFDF5 0%, #FFF8E7 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60rpx;
}

.end-label {
  font-size: 36rpx;
  color: #F5A623;
  font-weight: bold;
  margin-bottom: 40rpx;
}

.stats-card {
  background: #fff;
  border-radius: 20rpx;
  padding: 30rpx 40rpx;
  width: 100%;
  max-width: 500rpx;
  box-shadow: 0 8rpx 32rpx rgba(44,36,22,0.08);
  margin-bottom: 40rpx;
}

.stats-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #2C2416;
  display: block;
  margin-bottom: 20rpx;
  text-align: center;
}

.stat-row {
  display: flex;
  justify-content: space-between;
  padding: 10rpx 0;
  border-bottom: 1rpx solid #F0E8D8;
}

.stat-label {
  font-size: 26rpx;
  color: #6B5E4A;
}

.stat-value {
  font-size: 26rpx;
  color: #2C2416;
  font-weight: 500;
}

.forecast {
  display: flex;
  align-items: flex-start;
  background: rgba(245,166,35,0.05);
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 50rpx;
  max-width: 500rpx;
}

.forecast-icon {
  font-size: 40rpx;
  margin-right: 12rpx;
}

.forecast-text {
  font-size: 26rpx;
  color: #6B5E4A;
  line-height: 1.7;
  flex: 1;
}

.btn-next-chapter {
  display: flex;
  align-items: center;
  background: linear-gradient(135deg, #F5A623, #E8951F);
  border-radius: 60rpx;
  padding: 24rpx 64rpx;
  box-shadow: 0 12rpx 32rpx rgba(245,166,35,0.4);
  margin-bottom: 24rpx;
}

.btn-next-text {
  font-size: 32rpx;
  font-weight: bold;
  color: #fff;
}

.btn-next-arrow {
  font-size: 32rpx;
  color: #fff;
  margin-left: 8rpx;
}

.btn-save-quit {
  padding: 16rpx 40rpx;
}

.btn-quit-text {
  font-size: 26rpx;
  color: #A09888;
}
</style>
