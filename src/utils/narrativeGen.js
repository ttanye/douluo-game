// 叙事文本生成器

import { RARITY_COLORS } from '../config/colors'

/**
 * 根据结果生成叙事文本
 * @param {Object} stepConfig - 步骤配置
 * @param {Object} result - 中奖结果 { label, rarity, icon, ... }
 * @returns {string} 生成的故事文本
 */
export function generateResultNarrative(stepConfig, result) {
  const rarityInfo = RARITY_COLORS[result.rarity] || RARITY_COLORS['C']
  
  // 优先使用步骤配置的后缀
  const suffixKey = result.rarity || 'C'
  let suffix = ''
  
  if (stepConfig.suffixes?.[suffixKey]) {
    suffix = stepConfig.suffixes[suffixKey]
  } else {
    suffix = getDefaultSuffix(result.rarity)
  }
  
  // 使用模板或默认
  if (stepConfig.resultTemplate) {
    return stepConfig.resultTemplate
      .replace('{label}', result.label)
      .replace('{rarity}', rarityInfo.label)
      .replace('{icon}', result.icon || '')
      .replace('{suffix}', suffix)
  }
  
  return `命运之轮停驻——${rarityInfo.label}！${result.icon || ''} ${result.label}。${suffix}`
}

/**
 * 默认稀有度后缀
 */
function getDefaultSuffix(rarity) {
  const map = {
    SSS: '金色光柱冲天而起，天地为之色变！此等机缘，万中无一！',
    SS:  '紫金色光芒笼罩全身，命运之书翻开了非凡的一页！',
    S:   '紫色光华流转，你的未来已铺就一条不凡之路。',
    A:   '蓝色光晕散开，这是一份令人艳羡的收获。',
    B:   '绿色光芒闪过，虽普通却也踏实，平凡中藏着无限可能。',
    C:   '白色光环浮现……至少，你已踏出第一步。路还很长。',
  }
  return map[rarity] || map['C']
}

/**
 * 生成最终传记
 */
export function generateFinalBiography(characterState, worldState) {
  const a = characterState.attributes || {}
  
  let bio = `【命运之书 · ${characterState.playerName || '未知魂师'}】\n\n`
  bio += `封号：${characterState.title || '——'}\n`
  bio += `神位：${characterState.godhood || '——'}\n\n`
  
  bio += `—— 序章：命运之始 ——\n`
  bio += `时代：${a.era || '?'}  性别：${a.gender || '?'}\n`
  bio += `种族：${a.race || '?'}\n`
  bio += `武魂：${a.soulType || '?'} · ${a.soulQuality || '?'}\n`
  bio += `先天魂力：${a.innatePower ?? '?'} 级\n`
  bio += `出身：${a.birthplace || '?'} · ${a.family || '?'}\n`
  bio += `颜值：${a.appearance || '?'}\n`
  bio += `印记：${(a.specialTag || []).join('、') || '无'}\n\n`
  
  bio += `—— 修炼之路 ——\n`
  bio += `最终等级：${characterState.level || 1} 级\n`
  bio += `魂环配置：${(characterState.soulRings || []).filter(r => r).map(r => `${r.colorName || r.color}·${r.beast}`).join(' / ') || '无'}\n`
  bio += `魂骨装备：${Object.values(characterState.soulBones || {}).filter(b => b).map(b => `${b.slot}·${b.beast}`).join(' / ') || '无'}\n\n`
  
  bio += `—— 命运交织 ——\n`
  if (characterState.relationships) {
    for (const [name, rel] of Object.entries(characterState.relationships)) {
      if (rel.met) {
        bio += `${getCharacterName(name)}：${rel.faction === 'friend' ? '🤝 挚友' : rel.faction === 'enemy' ? '⚔️ 宿敌' : '👤 相识'} (羁绊: ${rel.affinity})\n`
      }
    }
  }
  
  return bio
}

function getCharacterName(key) {
  const map = {
    tangSan: '唐三', xiaoWu: '小舞', daiMuBai: '戴沐白',
    oscar: '奥斯卡', maHongJun: '马红俊', ningRongRong: '宁荣荣',
    zhuZhuQing: '朱竹清', biBiDong: '比比东', yuXiaoGang: '玉小刚',
    liuErLong: '柳二龙', tangHao: '唐昊', duGuBo: '独孤博'
  }
  return map[key] || key
}
