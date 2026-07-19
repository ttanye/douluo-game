// 动态战力系统 — 根据玩家与敌方战力差距调整战斗选项权重
// 双机制：关键词精确匹配 + 稀有度兜底，确保所有选项都受战力影响

/**
 * 根据战力比调整战斗选项
 * @param {Array} baseOptions - [{ label, icon, rarity, weight, levelBoost?, ... }]
 * @param {number} playerPower - 玩家战力
 * @param {number} enemyPower - 敌方战力
 * @returns {Array} 调整后的选项（权重已修正）
 */
export function adjustCombatWeights(baseOptions, playerPower, enemyPower) {
  if (!enemyPower || enemyPower <= 0) return baseOptions
  
  const ratio = playerPower / enemyPower
  
  return baseOptions.map(opt => {
    let weight = opt.weight || 40
    const label = opt.label || ''
    const rarity = opt.rarity || 'C'
    
    // ====== 第1层：稀有度兜底调整（所有选项都生效） ======
    const rarityMult = {
      SSS: ratio >= 2.0 ? 3.0 : ratio >= 1.3 ? 2.2 : ratio >= 0.7 ? 1.0 : ratio >= 0.4 ? 0.3 : 0.1,
      SS:  ratio >= 2.0 ? 2.5 : ratio >= 1.3 ? 1.8 : ratio >= 0.7 ? 1.0 : ratio >= 0.4 ? 0.5 : 0.2,
      S:   ratio >= 2.0 ? 2.0 : ratio >= 1.3 ? 1.5 : ratio >= 0.7 ? 1.0 : ratio >= 0.4 ? 0.7 : 0.4,
      A:   ratio >= 2.0 ? 1.2 : ratio >= 1.3 ? 1.1 : ratio >= 0.7 ? 1.0 : ratio >= 0.4 ? 1.2 : 1.5,
      B:   ratio >= 2.0 ? 0.3 : ratio >= 1.3 ? 0.6 : ratio >= 0.7 ? 1.0 : ratio >= 0.4 ? 2.0 : 3.5,
      C:   ratio >= 2.0 ? 0.1 : ratio >= 1.3 ? 0.3 : ratio >= 0.7 ? 1.0 : ratio >= 0.4 ? 3.0 : 6.0,
    }
    weight = Math.floor(weight * (rarityMult[rarity] || 1.0))
    
    // ====== 第2层：关键词精确微调（叠加在稀有度之上） ======
    if (ratio >= 2.0) {
      // 碾压
      if (label.includes('碾压') || label.includes('斩') || label.includes('大获全胜')) weight = Math.floor(weight * 2.5)
      if (label.includes('战败') || label.includes('惨败') || label.includes('逃跑') || label.includes('重伤')) weight = Math.max(5, Math.floor(weight * 0.15))
      if (label.includes('撤退') || label.includes('被俘')) weight = Math.max(5, Math.floor(weight * 0.3))
    } else if (ratio >= 1.3) {
      // 优势
      if (label.includes('胜') || label.includes('斩') || label.includes('击退')) weight = Math.floor(weight * 1.8)
      if (label.includes('败') || label.includes('逃跑')) weight = Math.floor(weight * 0.4)
    } else if (ratio >= 0.7) {
      // 均势 — 稀有度兜底已足够
    } else if (ratio >= 0.4) {
      // 劣势
      if (label.includes('碾压') || label.includes('大获全胜')) weight = Math.floor(weight * 0.15)
      if (label.includes('惨胜') || label.includes('艰') || label.includes('苦战')) weight = Math.floor(weight * 2.5)
      if (label.includes('逃跑') || label.includes('逃生') || label.includes('撤退')) weight = Math.floor(weight * 3)
      if (label.includes('被救') || label.includes('相助')) weight = Math.floor(weight * 4)
      if (label.includes('惨败') || label.includes('被俘')) weight = Math.floor(weight * 2)
    } else {
      // 绝望 — 不给 0，留 0.1 生机
      if (label.includes('碾压') || label.includes('大获全胜') || label.includes('斩将')) weight = Math.max(1, Math.floor(weight * 0.1))
      if (label.includes('奇迹') || label.includes('逆转')) weight = Math.floor(weight * 10)
      if (label.includes('逃生') || label.includes('逃跑')) weight = Math.floor(weight * 6)
      if (label.includes('被救') || label.includes('贵人')) weight = Math.floor(weight * 8)
      if (label.includes('惨败') || label.includes('被俘') || label.includes('被秒')) weight = Math.floor(weight * 3)
    }
    
    return { ...opt, weight: Math.max(0, Math.floor(weight)) }
  })
}

/**
 * 快捷：创建带敌对战力的战斗事件 computeOptions
 * @param {number} enemyPower - 敌方战力
 * @param {Function} baseFn - 基础 computeOptions 函数
 * @returns {Function} 包装后的 computeOptions
 */
export function withEnemy(enemyPower, baseFn) {
  return (state) => {
    const options = baseFn(state)
    const playerPower = state.combatPower || state.level * 10
    return adjustCombatWeights(options, playerPower, enemyPower)
  }
}
