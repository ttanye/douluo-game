<template>
  <!-- 身份卡 — 点击展开 -->
  <view class="identity-card">
    <view class="id-header" @tap="expanded = !expanded">
      <text class="id-label">🪪 {{ isExpanded ? '收起' : '身份' }}</text>
      <text class="id-brief" v-if="!isExpanded">{{ brief }}</text>
    </view>
    <view class="id-body" v-if="isExpanded">
      <view class="id-row"><text class="id-key">武魂</text><text class="id-val">{{ soulType || '?' }}</text></view>
      <view class="id-row"><text class="id-key">封号</text><text class="id-val">{{ title || '——' }}</text></view>
      <view class="id-row"><text class="id-key">特质</text><text class="id-val">{{ traitLabel }}</text></view>
      <view class="id-row"><text class="id-key">立场</text><text class="id-val">{{ stance }}</text></view>
      <view class="id-row"><text class="id-key">魂环</text><text class="id-val">{{ ringCount }}个</text></view>
      <view class="id-row"><text class="id-key">魂骨</text><text class="id-val">{{ boneCount }}块</text></view>
      <view class="id-row"><text class="id-key">战力</text><text class="id-val" :style="{ color: rankColor }">{{ combatPower }} ({{ rankText }})</text></view>
      <view class="id-row" v-if="keyItems && keyItems.length > 0">
        <text class="id-key">物品</text>
        <text class="id-val id-items">{{ keyItems.join('、') }}</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  soulType: String,
  title: String,
  traitLabel: String,
  stance: String,
  ringCount: Number,
  boneCount: Number,
  combatPower: Number,
  rankText: String,
  rankColor: String,
  keyItems: Array,
})

const isExpanded = ref(false)

const brief = computed(() => {
  const parts = []
  if (props.soulType) parts.push(props.soulType)
  if (props.title) parts.push(props.title)
  if (props.traitLabel && props.traitLabel !== '平凡之魂') parts.push(props.traitLabel)
  return parts.join(' · ') || '未知魂师'
})
</script>

<style lang="scss" scoped>
.identity-card {
  margin: 4rpx 20rpx;
  background: rgba(255,255,255,0.8);
  border-radius: 12rpx;
  overflow: hidden;
}

.id-header {
  display: flex;
  justify-content: space-between;
  padding: 10rpx 20rpx;
}

.id-label { font-size: 24rpx; color: #F5A623; font-weight: bold; }
.id-brief { font-size: 22rpx; color: #6B5E4A; }

.id-body {
  padding: 6rpx 20rpx 14rpx;
}

.id-row {
  display: flex;
  justify-content: space-between;
  padding: 4rpx 0;
}

.id-key { font-size: 22rpx; color: #A09888; }
.id-val { font-size: 22rpx; color: #2C2416; font-weight: 500; }
.id-items { font-size: 20rpx; color: #F5A623; }
</style>
