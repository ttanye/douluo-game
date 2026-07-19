<template>
  <!-- 叙事文本框 — 打字机效果 -->
  <view class="narrative-box" @tap="onTap">
    <view class="narrative-content">
      <text class="narrative-text" :class="{ 'typing-done': isComplete }">{{ displayedText }}</text>
      <text v-if="isTyping" class="cursor">|</text>
    </view>
    
    <!-- 提示继续 -->
    <view v-if="isComplete && !autoAdvance" class="tap-hint">
      <text class="tap-hint-text">轻触继续</text>
      <text class="tap-hint-arrow">▸</text>
    </view>
  </view>
</template>

<script setup>
import { ref, watch, onUnmounted } from 'vue'

const props = defineProps({
  text: { type: String, default: '' },
  speed: { type: Number, default: 50 },   // ms/字
  autoAdvance: { type: Boolean, default: false },
})

const emit = defineEmits(['complete', 'skip'])

const displayedText = ref('')
const isTyping = ref(false)
const isComplete = ref(false)
let typingTimer = null
let charIndex = 0

watch(() => props.text, (newText) => {
  if (newText) {
    startTyping(newText)
  } else {
    displayedText.value = ''
    isTyping.value = false
    isComplete.value = false
  }
}, { immediate: true })

function startTyping(text) {
  stopTyping()
  displayedText.value = ''
  isTyping.value = true
  isComplete.value = false
  charIndex = 0
  
  function typeNext() {
    if (charIndex < text.length) {
      displayedText.value += text[charIndex]
      charIndex++
      typingTimer = setTimeout(typeNext, props.speed)
    } else {
      isTyping.value = false
      isComplete.value = true
      emit('complete')
    }
  }
  
  typeNext()
}

function stopTyping() {
  if (typingTimer) {
    clearTimeout(typingTimer)
    typingTimer = null
  }
}

function onTap() {
  if (isTyping.value) {
    // 跳过打字机
    stopTyping()
    displayedText.value = props.text
    isTyping.value = false
    isComplete.value = true
    emit('skip')
  } else if (isComplete.value) {
    emit('complete')
  }
}

onUnmounted(() => {
  stopTyping()
})
</script>

<style lang="scss" scoped>
.narrative-box {
  padding: 30rpx 40rpx;
  margin: 16rpx 20rpx;
  background: linear-gradient(135deg, rgba(255,255,255,0.9), rgba(255,248,231,0.9));
  border-radius: 16rpx;
  border: 1rpx solid rgba(245,166,35,0.2);
  box-shadow: 0 4rpx 20rpx rgba(44,36,22,0.06);
  min-height: 120rpx;
}

.narrative-content {
  position: relative;
}

.narrative-text {
  font-size: 30rpx;
  line-height: 1.8;
  color: #2C2416;
  letter-spacing: 1rpx;
}

.cursor {
  font-size: 30rpx;
  color: #F5A623;
  animation: blink 0.8s step-end infinite;
}

.typing-done {
  // 完成后无额外样式
}

.tap-hint {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  margin-top: 16rpx;
  opacity: 0.7;
}

.tap-hint-text {
  font-size: 24rpx;
  color: #6B5E4A;
}

.tap-hint-arrow {
  font-size: 24rpx;
  color: #F5A623;
  margin-left: 4rpx;
  animation: arrowPulse 1.5s ease-in-out infinite;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}

@keyframes arrowPulse {
  0%, 100% { transform: translateX(0); }
  50% { transform: translateX(6rpx); }
}
</style>
