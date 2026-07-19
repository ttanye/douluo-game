<template>
  <!-- 章节开始过渡页 -->
  <view class="chapter-start-page">
    <!-- 章节横幅 -->
    <view class="chapter-banner">
      <text class="chapter-epigraph">「</text>
      <text class="chapter-title">{{ chapterTitle }}</text>
      <text class="chapter-epigraph">」</text>
    </view>

    <!-- 引导语 -->
    <view class="chapter-narrative" v-if="chapterNarrative">
      <text class="narrative-text">{{ chapterNarrative }}</text>
    </view>

    <!-- 角色当前状态 -->
    <view class="status-summary" v-if="hasStarted">
      <text class="summary-title">当前角色</text>
      <view class="summary-row">
        <text class="summary-item">等级：Lv.{{ characterStore.level }}</text>
        <text class="summary-item">魂环：{{ characterStore.totalSoulRings }}个</text>
      </view>
    </view>

    <!-- 开始按钮 -->
    <view class="btn-start-chapter" @tap="startChapter">
      <text class="btn-start-icon">▶</text>
      <text class="btn-start-text">开始本章</text>
    </view>
  </view>
</template>

<script setup>
import { computed } from 'vue'
import { useCharacterStore } from '../../stores/character'
import { useProgressStore } from '../../stores/progress'

const characterStore = useCharacterStore()
const progressStore = useProgressStore()

const chapterTitle = computed(() => progressStore.chapterTitle || '未知章节')
const hasStarted = computed(() => progressStore.totalStepsCompleted > 0)

const chapterNarratives = {
  '序章：命运之始': '时空长河翻涌，灵魂穿越位面……你的故事，即将在斗罗大陆展开。命运的齿轮，开始转动——',
  '初入魂师界': '武魂觉醒的光芒穿透了诺丁城的晨雾。你踏上了魂师之路的第一步。前方，是无限的可能——',
  '诺丁学院': '学院的大门向你敞开。在这里，你将遇到一生的伙伴与对手。知识、友谊、竞争——命运的丝线开始交织——',
  '星斗大森林': '古老的森林中，魂兽的低吼在暗处回荡。这里是危险与机遇并存之地——',
  '史莱克学院': '传说中的史莱克学院，只收怪物，不收普通人。你能通过考验吗？——',
  '全大陆精英赛': '全大陆最顶尖的青年魂师云集于此！荣耀、尊严、未来——一切都在赛场上见分晓！——',
  '大陆风云': '武魂殿的阴影笼罩大陆。暗流涌动，风云变色。立场的选择，将决定你的命运——',
  '海神岛': '海风呼啸，海浪滔天。传说中的海神岛就在眼前。神的考验，你可敢接受？——',
  '武魂帝国崛起': '武魂帝国的大旗已在大陆升起。是臣服，还是反抗？时代的洪流中，你将站在哪一边？——',
  '封号斗罗': '九环齐鸣，封号加身！你已站在大陆之巅。但更高的神位，正在召唤——',
  '神位之争': '神界的大门虚掩着。海神、修罗神、天使神……你的神位，将由命运之轮决定！——',
  '终章：封神之时': '所有命运的丝线在此汇聚。你走过的每一步，做出的每一个选择，都将在此刻绽放。命运之书的最后一页——',
}

const chapterNarrative = computed(() => {
  return chapterNarratives[chapterTitle.value] || '新的冒险即将开始……命运之轮，请转动——'
})

function startChapter() {
  uni.navigateTo({
    url: '/pages/wheel/wheel',
  })
}
</script>

<style lang="scss" scoped>
.chapter-start-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #FFF8E7 0%, #FFF3D6 50%, #FFE8C0 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60rpx;
}

.chapter-banner {
  display: flex;
  align-items: center;
  margin-bottom: 40rpx;
}

.chapter-epigraph {
  font-size: 64rpx;
  color: #F5A623;
  opacity: 0.5;
}

.chapter-title {
  font-size: 44rpx;
  font-weight: bold;
  color: #2C2416;
  margin: 0 16rpx;
  text-align: center;
}

.level-range {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-bottom: 40rpx;
  background: rgba(245,166,35,0.1);
  border-radius: 40rpx;
  padding: 12rpx 32rpx;
}

.level-label {
  font-size: 24rpx;
  color: #6B5E4A;
}

.level-value {
  font-size: 28rpx;
  color: #F5A623;
  font-weight: bold;
}

.chapter-narrative {
  max-width: 600rpx;
  text-align: center;
  margin-bottom: 60rpx;
  background: rgba(255,255,255,0.7);
  border-radius: 16rpx;
  padding: 30rpx;
  border-left: 4rpx solid #F5A623;
}

.narrative-text {
  font-size: 30rpx;
  color: #6B5E4A;
  line-height: 1.9;
}

.status-summary {
  margin-bottom: 50rpx;
  text-align: center;
}

.summary-title {
  font-size: 24rpx;
  color: #A09888;
  margin-bottom: 8rpx;
}

.summary-row {
  display: flex;
  gap: 24rpx;
}

.summary-item {
  font-size: 26rpx;
  color: #6B5E4A;
}

.btn-start-chapter {
  display: flex;
  align-items: center;
  background: linear-gradient(135deg, #F5A623, #E8951F);
  border-radius: 60rpx;
  padding: 24rpx 64rpx;
  box-shadow: 0 12rpx 32rpx rgba(245, 166, 35, 0.4);
  
  &:active {
    transform: scale(0.95);
  }
}

.btn-start-icon {
  font-size: 32rpx;
  color: #fff;
  margin-right: 10rpx;
}

.btn-start-text {
  font-size: 34rpx;
  font-weight: bold;
  color: #fff;
}
</style>
