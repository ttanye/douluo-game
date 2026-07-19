<template>
  <!-- 原著角色关系追踪面板 -->
  <view class="canon-tracker" v-if="characters.length > 0">
    <view class="tracker-header" @tap="expanded = !expanded">
      <text class="tracker-title">📜 原著干涉</text>
      <text class="tracker-toggle">{{ expanded ? '▾' : '▸' }}</text>
    </view>
    
    <view class="tracker-body" v-if="expanded">
      <view
        v-for="char in characters"
        :key="char.key"
        class="tracker-row"
      >
        <text class="char-name">{{ char.label }}</text>
        <text class="char-status" :class="'faction-' + char.faction">
          {{ getFactionIcon(char.faction) }} {{ getFactionLabel(char.faction) }}
        </text>
        <view class="affinity-bar-track" v-if="char.met">
          <view
            class="affinity-bar-fill"
            :class="affinityColor(char.affinity)"
            :style="{ width: Math.abs(char.affinity) + '%' }"
          ></view>
        </view>
        <text class="affinity-num" v-if="char.met">羁绊 {{ char.affinity }}</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  relationships: { type: Object, default: () => ({}) },
})

const expanded = ref(false)

const nameMap = {
  tangSan: '唐三', xiaoWu: '小舞', daiMuBai: '戴沐白',
  oscar: '奥斯卡', maHongJun: '马红俊', ningRongRong: '宁荣荣',
  zhuZhuQing: '朱竹清', biBiDong: '比比东', yuXiaoGang: '玉小刚',
  liuErLong: '柳二龙', tangHao: '唐昊', qianRenXue: '千仞雪',
  huLiena: '胡列娜',
}

const characters = computed(() => {
  return Object.entries(props.relationships)
    .filter(([_, r]) => r.met)
    .map(([key, rel]) => ({
      key,
      label: nameMap[key] || key,
      ...rel,
    }))
})

function getFactionIcon(faction) {
  const map = { friend: '🤝', enemy: '⚔️', hostile: '⚠️', neutral: '👤' }
  return map[faction] || '👤'
}

function getFactionLabel(faction) {
  const map = { friend: '友善', enemy: '敌对', hostile: '敌意', neutral: '中立' }
  return map[faction] || '中立'
}

function affinityColor(val) {
  if (val > 50) return 'fill-positive'
  if (val > 0)  return 'fill-neutral'
  return 'fill-negative'
}
</script>

<style lang="scss" scoped>
.canon-tracker {
  background: rgba(255,255,255,0.85);
  border-radius: 16rpx;
  margin: 12rpx 20rpx;
  padding: 16rpx 24rpx;
  border: 1rpx solid rgba(245,166,35,0.15);
}

.tracker-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.tracker-title {
  font-size: 26rpx;
  font-weight: bold;
  color: #2C2416;
}

.tracker-toggle {
  font-size: 26rpx;
  color: #A09888;
}

.tracker-body {
  margin-top: 12rpx;
}

.tracker-row {
  display: flex;
  align-items: center;
  margin-bottom: 8rpx;
  flex-wrap: wrap;
}

.char-name {
  font-size: 24rpx;
  color: #2C2416;
  font-weight: 500;
  width: 100rpx;
}

.char-status {
  font-size: 22rpx;
  margin-right: 8rpx;
}

.faction-friend { color: #7ED321; }
.faction-enemy { color: #E85D3F; }
.faction-hostile { color: #F5A623; }
.faction-neutral { color: #A09888; }

.affinity-bar-track {
  width: 100rpx;
  height: 6rpx;
  background: #E8E0D0;
  border-radius: 3rpx;
  overflow: hidden;
  margin-right: 6rpx;
}

.affinity-bar-fill {
  height: 100%;
  border-radius: 3rpx;
}

.fill-positive { background: #7ED321; }
.fill-neutral  { background: #F5A623; }
.fill-negative { background: #E85D3F; }

.affinity-num {
  font-size: 20rpx;
  color: #A09888;
}
</style>
