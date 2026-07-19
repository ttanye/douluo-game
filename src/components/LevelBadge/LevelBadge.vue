<template>
  <!-- 等级徽章（带魂环色） -->
  <view class="level-badge">
    <view class="badge-ring" :class="ringColorClass">
      <text class="badge-level">{{ level }}</text>
    </view>
    <text class="badge-label">级</text>
  </view>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  level: { type: Number, default: 1 },
})

const ringColorClass = computed(() => {
  if (props.level >= 100) return 'ring-god'
  if (props.level >= 90)  return 'ring-red'
  if (props.level >= 70)  return 'ring-black'
  if (props.level >= 50)  return 'ring-purple'
  if (props.level >= 30)  return 'ring-yellow'
  if (props.level >= 10)  return 'ring-white'
  return 'ring-none'
})
</script>

<style lang="scss" scoped>
.level-badge {
  display: flex;
  align-items: center;
}

.badge-ring {
  width: 60rpx;
  height: 60rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 4rpx solid #ccc;
}

.ring-god    { border-color: #FFD700; box-shadow: 0 0 16rpx rgba(255,215,0,0.5); background: rgba(255,215,0,0.1); }
.ring-red    { border-color: #FF1744; box-shadow: 0 0 12rpx rgba(255,23,68,0.4); background: rgba(255,23,68,0.05); }
.ring-black  { border-color: #212121; box-shadow: 0 0 8rpx rgba(33,33,33,0.3); }
.ring-purple { border-color: #7B1FA2; box-shadow: 0 0 8rpx rgba(123,31,162,0.3); }
.ring-yellow { border-color: #F9A825; }
.ring-white  { border-color: #BDBDBD; }
.ring-none   { border-color: #E0E0E0; }

.badge-level {
  font-size: 28rpx;
  font-weight: bold;
  color: #2C2416;
}

.badge-label {
  font-size: 24rpx;
  color: #6B5E4A;
  margin-left: 6rpx;
}
</style>
