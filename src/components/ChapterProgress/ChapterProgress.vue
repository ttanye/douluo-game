<template>
  <!-- 章节/步骤进度条 -->
  <view class="chapter-progress">
    <view class="progress-top">
      <text class="chapter-name">{{ chapterTitle }}</text>
      <text class="step-count">{{ currentStep }}/{{ totalSteps }}</text>
    </view>
    <view class="progress-bar-track">
      <view class="progress-bar-fill" :style="{ width: percent + '%' }"></view>
    </view>
    <view class="progress-bottom" v-if="level > 0">
      <text class="level-text">Lv.{{ level }}</text>
      <text class="xp-text">魂力</text>
    </view>
  </view>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  chapterTitle: { type: String, default: '' },
  currentStep: { type: Number, default: 0 },
  totalSteps: { type: Number, default: 8 },
  level: { type: Number, default: 0 },
})

const percent = computed(() => {
  if (props.totalSteps <= 0) return 0
  return Math.min(100, Math.round((props.currentStep / props.totalSteps) * 100))
})
</script>

<style lang="scss" scoped>
.chapter-progress {
  padding: 16rpx 32rpx 8rpx;
}

.progress-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8rpx;
}

.chapter-name {
  font-size: 26rpx;
  font-weight: bold;
  color: #2C2416;
}

.step-count {
  font-size: 22rpx;
  color: #A09888;
}

.progress-bar-track {
  width: 100%;
  height: 12rpx;
  background: #E8E0D0;
  border-radius: 6rpx;
  overflow: hidden;
}

.progress-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #F5A623, #F8A726);
  border-radius: 6rpx;
  transition: width 0.4s ease;
}

.progress-bottom {
  display: flex;
  align-items: center;
  margin-top: 6rpx;
}

.level-text {
  font-size: 22rpx;
  color: #F5A623;
  font-weight: bold;
}

.xp-text {
  font-size: 20rpx;
  color: #A09888;
  margin-left: 8rpx;
}
</style>
