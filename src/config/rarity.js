// 稀有度引擎 — 权重计算 + 调整
import { RARITY_COLORS } from './colors'

// 基础权重映射
export function getBaseWeight(rarity) {
  return RARITY_COLORS[rarity]?.weight ?? 40
}

export function adjustWeights(baseOptions, characterState) {
  // baseOptions: [{ label, rarity, weight?, icon?, ... }]
  // 返回调整后的权重数组
  
  const weights = baseOptions.map(opt => {
    let w = opt.weight ?? getBaseWeight(opt.rarity ?? 'C')
    
    // === 角色属性加成 ===
    const attrs = characterState.attributes || {}
    
    // 气运影响
    if (attrs.luck === 'SSS') {
      if (opt.rarity === 'SSS') w += 3
      if (opt.rarity === 'SS')  w += 2
      if (opt.rarity === 'S')   w += 1
    }
    if (attrs.luck === 'C') {
      if (opt.rarity === 'SSS') w = Math.max(0, w - 2)
      if (opt.rarity === 'C')   w += 15
    }
    
    // 先天魂力加成
    const innate = attrs.innatePower
    if (innate >= 9) {
      if (opt.rarity === 'SSS') w += 5
      if (opt.rarity === 'SS')  w += 4
      if (opt.rarity === 'S')   w += 3
    } else if (innate >= 7) {
      if (opt.rarity === 'SSS') w += 2
      if (opt.rarity === 'SS')  w += 2
    } else if (innate <= 2) {
      if (opt.rarity === 'SSS') w = Math.max(0, w - 3)
      if (opt.rarity === 'C')   w += 10
    }
    
    // 特殊标签
    if (attrs.specialTag && attrs.specialTag.includes('天选之子')) {
      if (opt.rarity === 'SSS') w += 5
      if (opt.rarity === 'SS')  w += 3
    }
    
    if (attrs.specialTag && attrs.specialTag.includes('厄运缠身')) {
      if (opt.rarity === 'C')   w += 20
      if (opt.rarity === 'SSS') w = Math.max(0, w - 4)
    }
    
    // 颜值影响机缘
    const beauty = attrs.appearance
    if (beauty === 'SSS' || beauty === '倾国倾城') {
      if (opt.rarity === 'SSS') w += 1
      if (opt.rarity === 'SS')  w += 1
    }
    
    // 武魂品质加成
    const soulQ = attrs.soulQuality
    if (soulQ === 'SSS' || soulQ === '神级武魂') {
      if (opt.rarity === 'SSS') w += 2
      if (opt.rarity === 'SS')  w += 2
      if (opt.rarity === 'S')   w += 2
    }
    
    return Math.max(0, w)
  })
  
  return weights
}

// 便捷方法：获取所有稀有度列表
export function getAllRarities() {
  return Object.values(RARITY_COLORS)
}

// 根据稀有度 key 获取颜色信息
export function getRarityInfo(rarity) {
  return RARITY_COLORS[rarity] || RARITY_COLORS['C']
}
