<template>
  <!-- 命运之书 · 封面首页 -->
  <view class="cover-page">
    <!-- 背景装饰 -->
    <view class="bg-stars">
      <view v-for="i in 20" :key="i" class="star" :style="starStyle(i)"></view>
    </view>
    
    <!-- 主内容 -->
    <view class="cover-content">
      <!-- 标题区 -->
      <view class="title-zone">
        <view class="title-ornament top-ornament"></view>
        <text class="main-title">命运之书</text>
        <text class="sub-title">— 斗罗大陆 —</text>
        <view class="title-ornament bottom-ornament"></view>
      </view>
      
      <!-- 引言 -->
      <view class="intro-text">
        <text class="intro-line">每一次转动</text>
        <text class="intro-line">都是一次命运的书写</text>
        <text class="intro-line intro-accent">你的选择，将改变整个斗罗大陆</text>
      </view>
      
      <!-- 角色命名 -->
      <view class="name-zone">
        <text class="name-label">你的名字：</text>
        <input class="name-input" v-model="playerName" placeholder="输入魂师之名" maxlength="8" />
      </view>

      <!-- 按钮区 -->
      <view class="btn-zone">
        <view class="btn-start" @click="startNewGame">
          <text class="btn-start-icon">📖</text>
          <text class="btn-start-text">开启命运之书</text>
        </view>
        
        <view class="btn-continue" v-if="hasSavedGame" @click="continueGame">
          <text class="btn-continue-icon">📂</text>
          <text class="btn-continue-text">继续阅读</text>
        </view>
      </view>
      
      <!-- 底部标识 -->
      <view class="footer-note">
        <text class="footer-text">基于斗罗大陆世界观 · 同人互动小说</text>
        <text class="footer-text">约100步 · 约需20分钟</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { hasSave, loadGame } from '../../utils/storage'
import { useCharacterStore } from '../../stores/character'
import { useProgressStore } from '../../stores/progress'
import { useWorldStore } from '../../stores/world'

const characterStore = useCharacterStore()
const progressStore = useProgressStore()
const worldStore = useWorldStore()

const hasSavedGame = ref(hasSave())
const playerName = ref('')

function starStyle(i) {
  const size = 3 + Math.random() * 6
  return {
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    width: `${size}rpx`,
    height: `${size}rpx`,
    animationDelay: `${Math.random() * 3}s`,
    opacity: 0.3 + Math.random() * 0.5,
  }
}

function startNewGame() {
  characterStore.reset()
  progressStore.reset()
  worldStore.reset()
  characterStore.playerName = playerName.value || '无名魂师'
  
  uni.navigateTo({
    url: '/pages/wheel/wheel',
  })
}

function continueGame() {
  const saved = loadGame()
  if (saved) {
    // 恢复状态
    if (saved.character) {
      Object.assign(characterStore.$state, saved.character)
    }
    if (saved.progress) {
      Object.assign(progressStore.$state, saved.progress)
    }
    if (saved.world) {
      Object.assign(worldStore.$state, saved.world)
    }
    
    uni.navigateTo({
      url: '/pages/wheel/wheel',
    })
  }
}
</script>

<style lang="scss" scoped>
.cover-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #FFF8E7 0%, #FFF3D6 40%, #FFE8C0 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

/* 星空背景 */
.bg-stars {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  pointer-events: none;
}

.star {
  position: absolute;
  background: #F5A623;
  border-radius: 50%;
  animation: twinkle 3s ease-in-out infinite alternate;
}

@keyframes twinkle {
  0% { opacity: 0.3; transform: scale(1); }
  100% { opacity: 0.8; transform: scale(1.5); }
}

/* 主内容 */
.cover-content {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 80rpx 40rpx 40rpx;
  width: 100%;
  box-sizing: border-box;
}

/* 标题 */
.title-zone {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 60rpx;
}

.title-ornament {
  width: 120rpx;
  height: 4rpx;
  background: linear-gradient(90deg, transparent, #F5A623, transparent);
  margin: 16rpx 0;
}

.main-title {
  font-size: 72rpx;
  font-weight: bold;
  color: #2C2416;
  letter-spacing: 12rpx;
  text-shadow: 0 4rpx 12rpx rgba(245,166,35,0.3);
}

.sub-title {
  font-size: 36rpx;
  color: #6B5E4A;
  letter-spacing: 8rpx;
  margin-top: 8rpx;
}

/* 引言 */
.intro-text {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 80rpx;
}

.intro-line {
  font-size: 30rpx;
  color: #6B5E4A;
  line-height: 2;
}

.intro-accent {
  color: #F5A623;
  font-weight: bold;
}

/* 命名区 */
.name-zone {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  margin-bottom: 32rpx;
}
.name-label { font-size: 28rpx; color: #6B5E4A; }
.name-input {
  border: 2rpx solid #E0D8C8;
  border-radius: 12rpx;
  padding: 12rpx 24rpx;
  font-size: 28rpx;
  color: #2C2416;
  text-align: center;
  width: 280rpx;
  background: #fff;
}

/* 按钮 */
.btn-zone {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20rpx;
  margin-bottom: 80rpx;
}

.btn-start {
  display: flex;
  align-items: center;
  background: linear-gradient(135deg, #F5A623, #E8951F);
  border-radius: 60rpx;
  padding: 24rpx 64rpx;
  box-shadow: 0 12rpx 32rpx rgba(245, 166, 35, 0.4);
  transition: all 0.15s;
  
  &:active {
    transform: scale(0.95);
    opacity: 0.9;
  }
}

.btn-start-icon {
  font-size: 40rpx;
  margin-right: 12rpx;
}

.btn-start-text {
  font-size: 34rpx;
  font-weight: bold;
  color: #fff;
}

.btn-continue {
  display: flex;
  align-items: center;
  background: #fff;
  border: 2rpx solid #F5A623;
  border-radius: 60rpx;
  padding: 20rpx 56rpx;
  
  &:active {
    background: #FFF8E7;
  }
}

.btn-continue-icon {
  font-size: 34rpx;
  margin-right: 10rpx;
}

.btn-continue-text {
  font-size: 30rpx;
  color: #F5A623;
  font-weight: 500;
}

/* 底部 */
.footer-note {
  display: flex;
  flex-direction: column;
  align-items: center;
  opacity: 0.6;
}

.footer-text {
  font-size: 22rpx;
  color: #A09888;
  line-height: 1.8;
}
</style>
