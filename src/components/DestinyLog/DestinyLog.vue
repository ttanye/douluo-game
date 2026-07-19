<template>
  <!-- 命运日记 — 可折叠的历史记录 -->
  <view class="destiny-log">
    <view class="log-header" @tap="expanded = !expanded">
      <text class="log-title">📜 命运日记 ({{ entries.length }})</text>
      <text class="log-toggle">{{ expanded ? '▾' : '▸' }}</text>
    </view>
    <view class="log-body" v-if="expanded && entries.length > 0">
      <view class="log-entry" v-for="(entry, i) in entries" :key="i">
        <text class="entry-step">#{{ i + 1 }}</text>
        <text class="entry-icon">{{ entry.icon || '📖' }}</text>
        <text class="entry-text">{{ entry.text }}</text>
        <text class="entry-rarity" :class="'text-rarity-' + (entry.rarity || 'c').toLowerCase()">{{ entry.rarity || '' }}</text>
      </view>
    </view>
    <view class="log-body log-empty" v-if="expanded && entries.length === 0">
      <text class="empty-text">命运之书尚未书写……</text>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  entries: { type: Array, default: () => [] },
})

const expanded = ref(false)
</script>

<style lang="scss" scoped>
.destiny-log {
  margin: 8rpx 20rpx;
  background: rgba(255,255,255,0.7);
  border-radius: 12rpx;
  overflow: hidden;
}

.log-header {
  display: flex;
  justify-content: space-between;
  padding: 14rpx 20rpx;
  background: rgba(245,166,35,0.05);
}

.log-title {
  font-size: 24rpx;
  font-weight: bold;
  color: #6B5E4A;
}

.log-toggle {
  font-size: 24rpx;
  color: #A09888;
}

.log-body {
  max-height: 360rpx;
  overflow-y: auto;
  padding: 8rpx 16rpx;
}

.log-empty {
  padding: 30rpx;
  text-align: center;
}

.empty-text {
  font-size: 24rpx;
  color: #C8C0B0;
}

.log-entry {
  display: flex;
  align-items: center;
  padding: 8rpx 0;
  border-bottom: 1rpx solid #F5F0E8;
  gap: 8rpx;
}

.entry-step {
  font-size: 20rpx;
  color: #C8C0B0;
  width: 36rpx;
  text-align: right;
}

.entry-icon {
  font-size: 22rpx;
  width: 36rpx;
  text-align: center;
}

.entry-text {
  font-size: 22rpx;
  color: #2C2416;
  flex: 1;
}

.entry-rarity {
  font-size: 20rpx;
  font-weight: bold;
}
</style>
