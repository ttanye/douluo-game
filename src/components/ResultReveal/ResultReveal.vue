<template>
  <!-- 结果揭晓弹窗 -->
  <view class="result-overlay" v-if="visible" @tap.stop>
    <!-- 稀有度光效 -->
    <RarityEffect :rarity="result?.rarity || 'C'" :active="visible" />
    
    <view class="result-card" :class="'border-' + (result?.rarity || 'C').toLowerCase()">
      <!-- 稀有度徽章 -->
      <view class="rarity-badge" :class="'bg-' + (result?.rarity || 'C').toLowerCase()">
        <text class="rarity-label">{{ rarityInfo?.label || '未知' }}</text>
      </view>
      
      <!-- 图标 -->
      <view class="result-icon" v-if="result?.icon">
        <text class="icon-text">{{ result.icon }}</text>
      </view>
      
      <!-- 结果文字 -->
      <text class="result-title">{{ result?.label || '——' }}</text>
      
      <!-- 叙事描述 -->
      <view class="result-narrative" v-if="narrative">
        <text class="narrative-desc">{{ narrative }}</text>
      </view>
      
      <!-- 步骤信息 -->
      <view class="step-info" v-if="stepTitle">
        <text class="step-title">{{ stepTitle }}</text>
      </view>
      
      <!-- 经验值展示 -->
      <view class="xp-gain" v-if="xpGained > 0 || levelBoost > 0">
        <text class="xp-text" v-if="xpGained > 0">
          +{{ xpGained }} 经验
          <text v-if="isCrit" class="xp-crit">⚡暴击!</text>
        </text>
        <text class="xp-text xp-boost" v-if="levelBoost > 0">⚡ +{{ levelBoost }} 级！</text>
      </view>
      
      <!-- 按钮 -->
      <view class="result-actions">
        <view class="btn-next" @tap="$emit('next')">
          <text class="btn-next-text">{{ nextLabel }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { computed } from 'vue'
import { RARITY_COLORS } from '../../config/colors'
import RarityEffect from '../RarityEffect/RarityEffect.vue'

const props = defineProps({
  visible: { type: Boolean, default: false },
  result: { type: Object, default: null },
  // { label, icon, rarity, ... }
  narrative: { type: String, default: '' },
  stepTitle: { type: String, default: '' },
  nextLabel: { type: String, default: '继续' },
  xpGained: { type: Number, default: 0 },
  levelBoost: { type: Number, default: 0 },
  isCrit: { type: Boolean, default: false },
})

defineEmits(['next'])

const rarityInfo = computed(() => {
  if (!props.result?.rarity) return null
  return RARITY_COLORS[props.result.rarity]
})
</script>

<style lang="scss" scoped>
.result-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(44, 36, 22, 0.55);
  backdrop-filter: blur(8rpx);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
  animation: overlayIn 0.3s ease;
}

.result-card {
  width: 580rpx;
  max-height: 80vh;
  background: #fff;
  border-radius: 24rpx;
  padding: 50rpx 36rpx 36rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  box-shadow: 0 20rpx 60rpx rgba(0,0,0,0.2);
  animation: cardPop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  overflow-y: auto;
}

.border-sss { border: 3rpx solid #FFD700; }
.border-ss  { border: 3rpx solid #C77DFF; }
.border-s   { border: 2rpx solid #9B59B6; }
.border-a   { border: 2rpx solid #4A90D9; }
.border-b   { border: 1rpx solid #7ED321; }
.border-c   { border: 1rpx solid #B0B0B0; }

.rarity-badge {
  position: absolute;
  top: -24rpx;
  padding: 8rpx 32rpx;
  border-radius: 40rpx;
  box-shadow: 0 4rpx 16rpx rgba(0,0,0,0.2);
}

.bg-sss { background: linear-gradient(135deg, #FFD700, #FFA000); }
.bg-ss  { background: linear-gradient(135deg, #C77DFF, #8B3FCF); }
.bg-s   { background: #9B59B6; }
.bg-a   { background: #4A90D9; }
.bg-b   { background: #7ED321; }
.bg-c   { background: #B0B0B0; }

.rarity-label {
  color: #fff;
  font-size: 28rpx;
  font-weight: bold;
  text-shadow: 0 2rpx 4rpx rgba(0,0,0,0.2);
}

.result-icon {
  margin-top: 16rpx;
  margin-bottom: 12rpx;
}

.icon-text {
  font-size: 80rpx;
}

.result-title {
  font-size: 40rpx;
  font-weight: bold;
  color: #2C2416;
  text-align: center;
  margin-bottom: 16rpx;
}

.result-narrative {
  background: #FFF8E7;
  border-radius: 12rpx;
  padding: 20rpx 24rpx;
  width: 100%;
  margin-bottom: 16rpx;
}

.narrative-desc {
  font-size: 28rpx;
  color: #6B5E4A;
  line-height: 1.7;
}

.step-info {
  margin-bottom: 12rpx;
}

.step-title {
  font-size: 24rpx;
  color: #A09888;
}

/* 经验值显示 */
.xp-gain {
  margin-bottom: 20rpx;
  display: flex;
  gap: 12rpx;
}

.xp-text {
  font-size: 26rpx;
  font-weight: bold;
  color: #F5A623;
  background: rgba(245,166,35,0.1);
  border-radius: 20rpx;
  padding: 6rpx 20rpx;
}

.xp-boost {
  color: #FFD700;
  background: rgba(255,215,0,0.15);
  animation: xpPulse 0.6s ease-in-out infinite alternate;
}

.xp-crit {
  color: #FF1744;
  font-size: 24rpx;
  margin-left: 6rpx;
  animation: critShake 0.3s ease-in-out 3;
}

@keyframes xpPulse {
  0% { transform: scale(1); }
  100% { transform: scale(1.08); }
}

@keyframes critShake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-4rpx); }
  75% { transform: translateX(4rpx); }
}

.result-actions {
  width: 100%;
  display: flex;
  justify-content: center;
}

.btn-next {
  background: linear-gradient(135deg, #F5A623, #E8951F);
  border-radius: 50rpx;
  padding: 20rpx 80rpx;
  box-shadow: 0 8rpx 24rpx rgba(245, 166, 35, 0.35);
  transition: all 0.15s;
  
  &:active {
    transform: scale(0.96);
    opacity: 0.9;
  }
}

.btn-next-text {
  color: #fff;
  font-size: 32rpx;
  font-weight: bold;
}

@keyframes overlayIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes cardPop {
  from { transform: scale(0.6); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}
</style>
