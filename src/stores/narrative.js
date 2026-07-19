// 叙事队列 Store
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useNarrativeStore = defineStore('narrative', () => {
  // ========== 状态 ==========
  const queue = ref([])        // 待展示叙事
  const current = ref('')      // 当前展示文本
  const isTyping = ref(false)  // 打字机进行中
  const isComplete = ref(false) // 当前文本是否已完整显示
  const typingSpeed = ref(50)  // 打字速度 ms/字
  const resultData = ref(null) // 当前结果数据
  const showResult = ref(false) // 是否展示结果

  // ========== Getters ==========
  const hasContent = computed(() => current.value.length > 0)
  const queueLength = computed(() => queue.value.length)

  // ========== Actions ==========

  /** 推入叙事文本 */
  function pushNarrative(text) {
    queue.value.push(text)
    if (!isTyping.value && !current.value) {
      startNext()
    }
  }

  /** 开始下一条 */
  function startNext() {
    if (queue.value.length > 0) {
      current.value = queue.value.shift()
      isTyping.value = true
      isComplete.value = false
      showResult.value = false
    }
  }

  /** 打字机完成 */
  function finishTyping() {
    isTyping.value = false
    isComplete.value = true
  }

  /** 跳过打字机 */
  function skipTyping() {
    isTyping.value = false
    isComplete.value = true
  }

  /** 展示结果 */
  function revealResult(text, result) {
    current.value = text
    isTyping.value = true
    isComplete.value = false
    showResult.value = true
    resultData.value = result
  }

  /** 清除 */
  function clear() {
    queue.value = []
    current.value = ''
    isTyping.value = false
    isComplete.value = false
    showResult.value = false
    resultData.value = null
  }

  return {
    queue, current, isTyping, isComplete, typingSpeed, resultData, showResult,
    hasContent, queueLength,
    pushNarrative, startNext, finishTyping, skipTyping, revealResult, clear,
  }
})
