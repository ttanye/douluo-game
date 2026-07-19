<template>
  <view class="spin-wheel-container" :style="{ width: size + 'px', height: size + 'px' }">
    <!-- 指针 -->
    <view class="pointer-container">
      <view class="pointer"></view>
    </view>
    
    <!-- Canvas 转盘 -->
    <canvas
      ref="canvasRef"
      class="wheel-canvas"
      :canvas-id="canvasId"
      :id="canvasId"
      :style="{ width: size + 'px', height: size + 'px' }"
    ></canvas>
    
    <!-- 手动模式：直接点选扇区 -->
    <view class="spin-wheel-click-area" @click.stop="onWheelTap" v-if="manualMode && !spinning">
      <view class="confirm-btn" v-if="selectedIndex >= 0" @click.stop="confirmManual">
        <text class="confirm-text">✓ 确定选择 · {{ segments[selectedIndex]?.label }}</text>
      </view>
      <view class="center-tap-hint" v-else>
        <text class="hint-text">👆 点击扇区选择</text>
      </view>
    </view>
    
    <!-- 随机模式：中心转动按钮 -->
    <view class="spin-wheel-click-area" @click.stop="onSpinTap" v-if="!manualMode">
      <view class="center-btn" :class="{ 'anim-pulse': !spinning, 'anim-spinning': spinning }" @click.stop="onSpinTap">
        <view class="center-btn-ring"></view>
        <view class="center-btn-inner">
          <text class="center-btn-text">{{ spinning ? '转动中' : '转动' }}</text>
        </view>
      </view>
    </view>
    
    
  </view>
</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick, getCurrentInstance } from 'vue'
import { drawWheel, drawPointer, calcTargetAngle } from '../../utils/wheelDraw'
import { spinAnimation } from '../../utils/wheelAnimate'
import { SEGMENT_COLORS } from '../../config/colors'

const props = defineProps({
  segments: {
    type: Array,
    default: () => [],
    // [{ label, icon, color?, rarity? }]
  },
  size: {
    type: Number,
    default: 320,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  selectable: {
    type: Boolean,
    default: true,
  },
})

const emit = defineEmits(['result', 'spinStart', 'spinEnd', 'manualSelect'])

const instance = getCurrentInstance()
const canvasId = `wheel-canvas-${instance?.uid || 0}`
const canvasRef = ref(null)
const spinning = ref(false)
const currentRotation = ref(0)
const manualMode = ref(false)
const selectedIndex = ref(-1)
let cancelAnimation = null
let ctx = null

// 扇区颜色映射
const segmentColors = computed(() => {
  return props.segments.map((seg, i) => {
    if (seg.color) return seg.color
    return SEGMENT_COLORS[i % SEGMENT_COLORS.length]
  })
})

onMounted(() => {
  nextTick(() => {
    initCanvas()
  })
})

watch(() => props.segments, () => {
  nextTick(() => {
    initCanvas()
  })
}, { deep: true })

function initCanvas() {
  // 统一使用 uni.createCanvasContext（全平台兼容）
  ctx = uni.createCanvasContext(canvasId, instance)
  if (ctx) {
    renderWheel(0)
    return
  }
  setTimeout(() => {
    ctx = uni.createCanvasContext(canvasId, instance)
    if (ctx) renderWheel(0)
  }, 300)
}

function renderWheel(rotation) {
  if (!ctx) return
  const segs = props.segments.map((s, i) => ({
    ...s,
    color: segmentColors.value[i],
  }))
  const raritySize = { A: 7, B: 5, S: 3, C: 2, SS: 1.5, SSS: 1 }
  const weights = segs.map(s => raritySize[s.rarity] || 2)
  drawWheel(ctx, segs, props.size, rotation, weights)
  if (typeof ctx.draw === 'function') ctx.draw()
}

function onWheelTap(e) {
  if (spinning.value || !manualMode.value) return
  
  // 使用转盘容器坐标而非点击区域坐标
  const cx = props.size / 2
  const cy = props.size / 2
  
  // UniApp H5: 获取触摸或点击坐标
  const clientX = e.touches ? e.touches[0].clientX : (e.detail?.x ?? e.clientX)
  const clientY = e.touches ? e.touches[0].clientY : (e.detail?.y ?? e.clientY)
  
  // 获取容器在页面中的位置
  const query = uni.createSelectorQuery().in(instance)
  query.select('.spin-wheel-container').boundingClientRect((rect) => {
    if (!rect) return
    const x = clientX - rect.left - rect.width / 2
    const y = clientY - rect.top - rect.height / 2
    const dist = Math.sqrt(x * x + y * y)
    if (dist < props.size * 0.15) return
    
    let angle = Math.atan2(y, x) + Math.PI / 2
    if (angle < 0) angle += 2 * Math.PI
    
    const n = props.segments.length
    const arcSize = (2 * Math.PI) / n
    const idx = Math.floor(angle / arcSize) % n
    selectedIndex.value = idx
  }).exec()
}

function confirmManual() {
  if (selectedIndex.value < 0) return
  emit('manualSelect', selectedIndex.value)
  emit('result', selectedIndex.value)
  selectedIndex.value = -1
}

function onSpinTap() {
  if (spinning.value || props.disabled || props.segments.length === 0) return
  startSpin()
}

function startSpin() {
  spinning.value = true
  emit('spinStart')
  
  const n = props.segments.length
  if (n === 0) { spinning.value = false; return }
  
  // 稀有度权重随机（区域越大越容易中）
  const raritySize = { A: 7, B: 5, S: 3, C: 2, SS: 1.5, SSS: 1 }
  const weights = props.segments.map(s => raritySize[s.rarity] || 2)
  const totalW = weights.reduce((s, w) => s + w, 0)
  let r = Math.random() * totalW
  let targetIndex = 0
  for (let i = 0; i < n; i++) {
    r -= weights[i]
    if (r <= 0) { targetIndex = i; break }
  }
  
  const targetAngle = calcTargetAngle(targetIndex, n, weights)
  
  // 动画
  cancelAnimation = spinAnimation({
    targetAngle,
    duration: 4500 + Math.random() * 1500, // 4.5-6秒
    extraSpins: 6 + Math.floor(Math.random() * 5),
    onUpdate: (angle) => {
      currentRotation.value = angle
      renderWheel(angle)
    },
    onComplete: () => {
      spinning.value = false
      emit('result', targetIndex)
      emit('spinEnd', targetIndex)
    },
  })
}

defineExpose({ startSpin, manualMode })
</script>

<style lang="scss" scoped>
.spin-wheel-container {
  position: relative;
  margin: 0 auto;
}

.wheel-canvas {
  position: absolute;
  top: 0;
  left: 0;
  pointer-events: none;
}
.canvas-hidden { display: none !important; }

/* 指针 — 固定在顶部中央，指向下方 */
.pointer-container {
  position: absolute;
  top: -2px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
  pointer-events: none;
}

.pointer {
  width: 0;
  height: 0;
  border-left: 8px solid transparent;
  border-right: 8px solid transparent;
  border-top: 20px solid #F5A623;
  filter: drop-shadow(0 3px 4px rgba(0,0,0,0.3));
}

/* 点击热区 — 覆盖整个转盘正中央 */
.spin-wheel-click-area {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  z-index: 20;
  cursor: pointer;
}

/* 中心按钮 — 纯视觉，不处理点击 */
.center-btn {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 64px;
  height: 64px;
  pointer-events: none; /* 点击由上层的 click-area 处理 */
}

.center-btn-ring {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 64px;
  height: 64px;
  border-radius: 50%;
  border: 2px solid rgba(245, 166, 35, 0.5);
  box-shadow: 0 0 12px rgba(245, 166, 35, 0.4), inset 0 0 8px rgba(245, 166, 35, 0.2);
  background: radial-gradient(circle, rgba(255,255,255,0.9) 0%, rgba(255,240,220,0.7) 100%);
}

.center-btn-inner {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 46px;
  height: 46px;
  border-radius: 50%;
  background: linear-gradient(135deg, #F5A623, #E8951F);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 3px 12px rgba(245, 166, 35, 0.5);
  transition: transform 0.15s;
  
  &:active {
    transform: translate(-50%, -50%) scale(0.92);
  }
}

.center-btn-text {
  color: #fff;
  font-size: 14px;
  font-weight: bold;
  text-shadow: 0 1px 3px rgba(0,0,0,0.2);
  user-select: none;
}

.anim-pulse {
  animation: pulse 2s ease-in-out infinite;
}

.anim-spinning {
  .center-btn-inner {
    animation: spinGlow 0.5s ease-in-out infinite alternate;
  }
}

@keyframes pulse {
  0%, 100% { transform: translate(-50%, -50%) scale(1); }
  50% { transform: translate(-50%, -50%) scale(1.06); }
}

@keyframes spinGlow {
  0% { box-shadow: 0 3px 12px rgba(245, 166, 35, 0.5); }
  100% { box-shadow: 0 3px 22px rgba(255, 87, 34, 0.8); }
}

.mode-switch-bar { position: absolute; top: -56px; left: 0; right: 0; display: flex; gap: 0; background: rgba(255,255,255,0.95); border-radius: 30rpx; overflow: hidden; z-index: 20; box-shadow: 0 4rpx 16rpx rgba(0,0,0,0.1); }
.mode-switch-btn { flex: 1; text-align: center; padding: 16rpx 0; font-size: 28rpx; font-weight: bold; cursor: pointer; transition: all 0.2s; color: #6B5E4A; }
.mode-switch-btn.active { background: linear-gradient(135deg, #F5A623, #FF8C00); color: #fff; }
</style>
