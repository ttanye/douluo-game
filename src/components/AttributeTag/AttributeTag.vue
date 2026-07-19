<template>
  <!-- 属性标签（稀有度着色） -->
  <view class="attr-tag" :class="'tag-' + (rarity || 'C').toLowerCase()">
    <text class="tag-icon" v-if="icon">{{ icon }}</text>
    <text class="tag-text">{{ label }}</text>
  </view>
</template>

<script setup>
defineProps({
  label: { type: String, default: '' },
  icon: { type: String, default: '' },
  rarity: { type: String, default: 'C' },
})
</script>

<style lang="scss" scoped>
.attr-tag {
  display: inline-flex;
  align-items: center;
  padding: 8rpx 20rpx;
  border-radius: 40rpx;
  margin: 4rpx 8rpx;
  font-size: 24rpx;
  font-weight: 500;
}

.tag-icon { margin-right: 6rpx; font-size: 26rpx; }
.tag-text { white-space: nowrap; }

.tag-sss { background: #FFF8E0; color: #5C3D00; border: 2rpx solid #FFD700; }
.tag-ss  { background: #F5EDFF; color: #2D004D; border: 2rpx solid #C77DFF; }
.tag-s   { background: #E8D5F5; color: #1A0020; border: 2rpx solid #9B59B6; }
.tag-a   { background: #E0EFFA; color: #001A33; border: 2rpx solid #4A90D9; }
.tag-b   { background: #EBF7DE; color: #1A3300; border: 2rpx solid #7ED321; }
.tag-c   { background: #F0F0F0; color: #4A4A4A; border: 2rpx solid #B0B0B0; }
</style>
