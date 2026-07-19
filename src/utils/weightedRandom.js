// 加权随机算法

/**
 * 根据权重数组随机选取索引
 * @param {number[]} weights - 权重数组
 * @returns {number} 选中的索引
 */
export function weightedRandomIndex(weights) {
  const total = weights.reduce((sum, w) => sum + Math.max(0, w), 0)
  if (total <= 0) return Math.floor(Math.random() * weights.length)
  
  let r = Math.random() * total
  for (let i = 0; i < weights.length; i++) {
    r -= Math.max(0, weights[i])
    if (r <= 0) return i
  }
  return weights.length - 1
}

/**
 * 根据选项数组（每项含weight或rarity）随机选出
 * @param {Array} options - [{ label, weight?, rarity?, ... }]
 * @param {Object} rarityMap - 稀有度→权重映射（可选）
 * @returns {number} 选中的索引
 */
export function weightedRandom(options, rarityMap = null) {
  const weights = options.map(opt => {
    if (typeof opt.weight === 'number') return opt.weight
    if (rarityMap && opt.rarity) return rarityMap[opt.rarity] || 40
    return 40  // 默认权重
  })
  return weightedRandomIndex(weights)
}
