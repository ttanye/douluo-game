// 转盘旋转动画引擎

/**
 * 缓出三次方函数：开始快，结尾慢，制造悬念
 */
export function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3)
}

/**
 * 缓出五次方：更极端的先快后慢
 */
export function easeOutQuint(t) {
  return 1 - Math.pow(1 - t, 5)
}

/**
 * 驱动旋转动画
 * @param {Object} options
 * @param {number} options.targetAngle - 目标角度（弧度）
 * @param {number} options.duration - 持续时间 ms
 * @param {number} options.extraSpins - 额外旋转圈数
 * @param {Function} options.onUpdate - 每帧回调 (currentAngle: number)
 * @param {Function} options.onComplete - 完成回调
 * @returns {Function} cancel - 取消动画
 */
export function spinAnimation({ targetAngle, duration = 5000, extraSpins = 0, onUpdate, onComplete }) {
  const totalExtra = extraSpins || Math.floor(Math.random() * 4) + 6  // 6-9 额外圈
  const totalRotation = targetAngle + totalExtra * 2 * Math.PI
  
  const startTime = Date.now()
  let rafId = null
  
  function frame() {
    const elapsed = Date.now() - startTime
    const progress = Math.min(elapsed / duration, 1)
    const eased = easeOutCubic(progress)
    const currentAngle = totalRotation * eased
    
    onUpdate?.(currentAngle)
    
    if (progress < 1) {
      rafId = requestAnimationFrame(frame)
    } else {
      onComplete?.()
    }
  }
  
  rafId = requestAnimationFrame(frame)
  
  return () => {
    if (rafId) {
      cancelAnimationFrame(rafId)
      rafId = null
    }
  }
}

/**
 * 快速旋转（简化版，用于跳过的场景）
 */
export function quickSpin(options, { onUpdate, onComplete }) {
  const duration = 1200
  return spinAnimation({ ...options, duration, extraSpins: 2, onUpdate, onComplete })
}
