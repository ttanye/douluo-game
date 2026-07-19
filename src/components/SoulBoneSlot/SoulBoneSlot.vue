<template>
  <!-- 魂骨槽位展示 -->
  <view class="soul-bone-slot" :class="{ empty: !bone, 'has-bone': bone }">
    <view v-if="bone" class="bone-display">
      <text class="bone-icon">🦴</text>
      <text class="bone-name">{{ bone.beast || bone.skill || '魂骨' }}</text>
      <text class="bone-rarity" :class="'text-rarity-' + (bone.rarity || 'c').toLowerCase()">
        {{ formatYear(bone.year) }}
      </text>
    </view>
    <view v-else class="bone-empty">
      <text class="bone-slot-name">{{ slotLabel }}</text>
      <text class="bone-slot-hint">空</text>
    </view>
  </view>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  bone: { type: Object, default: null },
  slot: { type: String, default: 'head' },
})

const slotLabels = {
  head: '头部', rightArm: '右臂', leftArm: '左臂',
  torso: '躯干', rightLeg: '右腿', leftLeg: '左腿',
  external: '外附',
}

const slotLabel = computed(() => slotLabels[props.slot] || props.slot)

function formatYear(year) {
  if (!year) return ''
  if (year >= 100000) return '十万年'
  if (year >= 10000)  return '万年'
  if (year >= 1000)   return '千年'
  if (year >= 100)    return '百年'
  return ''
}
</script>

<style lang="scss" scoped>
.soul-bone-slot {
  width: 100rpx;
  height: 100rpx;
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

.has-bone {
  background: rgba(255,248,231,0.8);
  border: 2rpx solid #F5A623;
}

.bone-display {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.bone-icon { font-size: 32rpx; }

.bone-name {
  font-size: 18rpx;
  color: #2C2416;
  font-weight: bold;
}

.bone-rarity {
  font-size: 16rpx;
}

.bone-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.bone-slot-name {
  font-size: 20rpx;
  color: #A09888;
}

.bone-slot-hint {
  font-size: 18rpx;
  color: #C8C0B0;
}
</style>
