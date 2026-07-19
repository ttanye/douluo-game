<template>
  <!-- 魂环槽位展示 -->
  <view class="soul-ring-slot" :class="{ empty: !ring }">
    <view v-if="ring" class="ring-display" :style="{ borderColor: ring.colorHex || '#ccc' }">
      <view class="ring-inner">
        <text class="ring-beast">{{ ring.beast || '?' }}</text>
        <text class="ring-year">{{ formatYear(ring.year) }}</text>
      </view>
    </view>
    <view v-else class="ring-empty">
      <text class="ring-slot-num">第{{ slot }}魂环</text>
      <text class="ring-slot-hint">未获取</text>
    </view>
  </view>
</template>

<script setup>
defineProps({
  ring: { type: Object, default: null },
  slot: { type: Number, default: 1 },
})

function formatYear(year) {
  if (!year) return ''
  if (year >= 1000000) return '百万年'
  if (year >= 100000) return '十万年'
  if (year >= 10000) return '万年'
  if (year >= 1000)  return '千年'
  if (year >= 100)   return '百年'
  return '十年'
}
</script>

<style lang="scss" scoped>
.soul-ring-slot {
  width: 140rpx;
  height: 140rpx;
  border-radius: 12rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 6rpx;
}

.empty {
  background: #F5F0E8;
  border: 2rpx dashed #D8D0C0;
}

.ring-display {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  border: 5rpx solid #ccc;
  display: flex;
  align-items: center;
  justify-content: center;
}

.ring-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.ring-beast {
  font-size: 20rpx;
  color: #2C2416;
  font-weight: bold;
  text-align: center;
}

.ring-year {
  font-size: 18rpx;
  color: #6B5E4A;
}

.ring-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.ring-slot-num {
  font-size: 20rpx;
  color: #A09888;
}

.ring-slot-hint {
  font-size: 18rpx;
  color: #C8C0B0;
}
</style>
