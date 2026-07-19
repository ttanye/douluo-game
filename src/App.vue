<template>
  <view class="app-root">
    <slot />
  </view>
</template>

<script setup>
// 全局应用组件
</script>

<style lang="scss">
/* 全局基础样式 */
page {
  background-color: #FFFDF5;
  font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
  color: #2C2416;
  font-size: 14px;
  -webkit-font-smoothing: antialiased;
}

.app-root {
  min-height: 100vh;
  width: 100%;
}

/* 全局按钮样式 */
.btn-primary {
  background: linear-gradient(135deg, #F5A623, #F8A726);
  color: #fff;
  border: none;
  border-radius: 50rpx;
  padding: 20rpx 60rpx;
  font-size: 32rpx;
  font-weight: bold;
  box-shadow: 0 8rpx 24rpx rgba(245, 166, 35, 0.35);
  transition: all 0.2s;
  
  &:active {
    transform: scale(0.96);
    opacity: 0.9;
  }
}

.btn-secondary {
  background: #fff;
  color: #F5A623;
  border: 2rpx solid #F5A623;
  border-radius: 50rpx;
  padding: 18rpx 56rpx;
  font-size: 30rpx;
}

/* 稀有度文字色 */
.text-rarity-sss { color: #FFD700; }
.text-rarity-ss  { color: #C77DFF; }
.text-rarity-s   { color: #9B59B6; }
.text-rarity-a   { color: #4A90D9; }
.text-rarity-b   { color: #7ED321; }
.text-rarity-c   { color: #B0B0B0; }

/* 稀有度背景色 */
.bg-rarity-sss { background: #FFD700; }
.bg-rarity-ss  { background: #C77DFF; }
.bg-rarity-s   { background: #9B59B6; }
.bg-rarity-a   { background: #4A90D9; }
.bg-rarity-b   { background: #7ED321; }
.bg-rarity-c   { background: #B0B0B0; }

/* 过渡动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.scale-enter-active {
  transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.scale-leave-active {
  transition: all 0.2s ease-in;
}
.scale-enter-from {
  opacity: 0;
  transform: scale(0.7);
}
.scale-leave-to {
  opacity: 0;
  transform: scale(0.9);
}
</style>
