<template>
  <!-- 稀有度光效层 -->
  <view class="rarity-effect" v-if="active">
    <!-- 全屏光柱 (SSS) -->
    <view v-if="rarity === 'SSS'" class="light-pillar">
      <view class="pillar-beam"></view>
      <view class="pillar-beam pillar-beam-2"></view>
      <view class="pillar-beam pillar-beam-3"></view>
    </view>
    
    <!-- 紫金光柱 (SS) -->
    <view v-if="rarity === 'SS'" class="light-pillar ss-pillar">
      <view class="pillar-beam ss-beam"></view>
      <view class="pillar-beam ss-beam ss-beam-2"></view>
    </view>

    <!-- 光晕 (S) -->
    <view v-if="rarity === 'S'" class="glow-ring s-glow"></view>
    
    <!-- 光晕 (A/B) -->
    <view v-if="rarity === 'A' || rarity === 'B'" class="glow-ring soft-glow" :class="'glow-' + rarity.toLowerCase()"></view>

    <!-- 粒子 -->
    <view class="particles">
      <view
        v-for="i in particleCount"
        :key="i"
        class="particle"
        :class="'particle-' + rarity.toLowerCase()"
        :style="getParticleStyle(i)"
      ></view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, watch, onUnmounted } from 'vue'

const props = defineProps({
  rarity: { type: String, default: 'C' },
  active: { type: Boolean, default: false },
})

const particleCount = computed(() => {
  const map = { SSS: 30, SS: 20, S: 12, A: 8, B: 5, C: 2 }
  return map[props.rarity] || 2
})

function getParticleStyle(i) {
  const angle = Math.random() * 360
  const distance = 50 + Math.random() * 150
  const size = 4 + Math.random() * 8
  const delay = Math.random() * 1.5
  const duration = 1.5 + Math.random() * 2
  
  return {
    '--angle': `${angle}deg`,
    '--distance': `${distance}rpx`,
    '--size': `${size}rpx`,
    '--delay': `${delay}s`,
    '--duration': `${duration}s`,
  }
}
</script>

<style lang="scss" scoped>
.rarity-effect {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  pointer-events: none;
  z-index: 100;
  overflow: hidden;
}

/* 光柱 */
.light-pillar {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  display: flex;
  justify-content: center;
  align-items: flex-start;
}

.pillar-beam {
  position: absolute;
  top: -10%;
  width: 80rpx;
  height: 120%;
  background: linear-gradient(to bottom, 
    rgba(255,215,0,0.9) 0%, 
    rgba(255,215,0,0.4) 30%,
    rgba(255,255,200,0.1) 60%,
    transparent 100%
  );
  left: calc(50% - 40rpx);
  animation: pillarShine 1.5s ease-out forwards;
}

.pillar-beam-2 {
  left: calc(50% - 80rpx);
  width: 30rpx;
  opacity: 0.6;
  animation-delay: 0.1s;
}

.pillar-beam-3 {
  left: calc(50% + 50rpx);
  width: 30rpx;
  opacity: 0.4;
  animation-delay: 0.2s;
}

.ss-pillar .ss-beam {
  background: linear-gradient(to bottom,
    rgba(199,125,255,0.9) 0%,
    rgba(199,125,255,0.4) 30%,
    rgba(230,200,255,0.1) 60%,
    transparent 100%
  );
}

/* 光晕 */
.glow-ring {
  position: absolute;
  top: 50%; left: 50%;
  transform: translate(-50%, -50%);
  width: 500rpx;
  height: 500rpx;
  border-radius: 50%;
  animation: glowExpand 1s ease-out forwards;
}

.s-glow {
  background: radial-gradient(circle, rgba(155,89,182,0.3) 0%, transparent 70%);
}

.soft-glow {
  width: 400rpx;
  height: 400rpx;
}

.glow-a {
  background: radial-gradient(circle, rgba(74,144,217,0.25) 0%, transparent 70%);
}

.glow-b {
  background: radial-gradient(circle, rgba(126,211,33,0.2) 0%, transparent 70%);
}

/* 粒子 */
.particles {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
}

.particle {
  position: absolute;
  top: 50%;
  left: 50%;
  width: var(--size);
  height: var(--size);
  border-radius: 50%;
  animation: particleBurst var(--duration) var(--delay) ease-out forwards;
  opacity: 0;
}

.particle-sss { background: #FFD700; box-shadow: 0 0 8rpx #FFD700; }
.particle-ss  { background: #C77DFF; box-shadow: 0 0 6rpx #C77DFF; }
.particle-s   { background: #9B59B6; box-shadow: 0 0 4rpx #9B59B6; }
.particle-a   { background: #4A90D9; box-shadow: 0 0 4rpx #4A90D9; }
.particle-b   { background: #7ED321; }
.particle-c   { background: #B0B0B0; }

@keyframes pillarShine {
  0% { opacity: 1; transform: scaleX(1); }
  50% { opacity: 0.8; transform: scaleX(1.5); }
  100% { opacity: 0; transform: scaleX(2); }
}

@keyframes glowExpand {
  0% { opacity: 1; transform: translate(-50%, -50%) scale(0.3); }
  100% { opacity: 0; transform: translate(-50%, -50%) scale(1.5); }
}

@keyframes particleBurst {
  0% {
    opacity: 0;
    transform: translate(-50%, -50%) rotate(var(--angle)) translateY(0);
  }
  30% {
    opacity: 1;
  }
  100% {
    opacity: 0;
    transform: translate(-50%, -50%) rotate(var(--angle)) translateY(calc(-1 * var(--distance)));
  }
}
</style>
