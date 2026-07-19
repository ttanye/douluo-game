// 斗罗大陆 · 命运之书 — 全局色板
// 明亮卡通风格 + 稀有度体系 + 魂环色板

// ========== 稀有度色板 ==========
export const RARITY_COLORS = {
  SSS: { key: 'SSS', label: '传说', weight: 1,  bg: '#FFD700', text: '#5C3D00', glow: '#FFF5A0', border: '#FFA000' },
  SS:  { key: 'SS',  label: '史诗', weight: 3,  bg: '#C77DFF', text: '#2D004D', glow: '#E8D5FF', border: '#8B3FCF' },
  S:   { key: 'S',   label: '稀有', weight: 8,  bg: '#9B59B6', text: '#1A0020', glow: '#D5B8E8', border: '#6C3483' },
  A:   { key: 'A',   label: '优秀', weight: 18, bg: '#4A90D9', text: '#001A33', glow: '#B8D8F0', border: '#2E6BB5' },
  B:   { key: 'B',   label: '普通', weight: 30, bg: '#7ED321', text: '#1A3300', glow: '#C8F0A0', border: '#5DA818' },
  C:   { key: 'C',   label: '常见', weight: 40, bg: '#B0B0B0', text: '#1A1A1A', glow: '#E0E0E0', border: '#888888' },
}

// ========== 魂环色板 ==========
export const SOUL_RING_COLORS = {
  million: { label: '百万年神级', color: '#FFD700', glow: '#FFF5A0', year: 1000000 },
  hundredK: { label: '十万年',     color: '#FF1744', glow: '#FF8A80', year: 100000 },
  tenK:     { label: '万年',       color: '#212121', glow: '#757575', year: 10000 },
  thousand: { label: '千年',       color: '#7B1FA2', glow: '#CE93D8', year: 1000 },
  hundred:  { label: '百年',       color: '#F9A825', glow: '#FFF176', year: 100 },
  ten:      { label: '十年',       color: '#EEEEEE', glow: '#FFFFFF', year: 10 },
}

// ========== 主题色板 ==========
export const THEME = {
  primary:    '#F5A623',  // 暖金 — 主按钮、指针
  secondary:  '#4A90D9',  // 天蓝 — 背景渐变、进度条
  accent:     '#E85D3F',  // 魂环红 — 强调
  success:    '#7ED321',  // 草绿
  purple:     '#9B59B6',  // 紫韵
  pink:       '#FF6B9D',  // 粉桃
  teal:       '#50E3C2',  // 青蓝
  orange:     '#F8A726',  // 橙黄
  
  bgWarm:     '#FFF8E7',  // 暖白背景
  bgLight:    '#FFFDF5',  // 更浅背景
  bgCard:     '#FFFFFF',  // 卡片白
  
  textDark:   '#2C2416',  // 深棕文字
  textMid:    '#6B5E4A',  // 中棕文字
  textLight:  '#A09888',  // 浅棕文字
  textInverse:'#FFFFFF',  // 反白文字

  shadow:     'rgba(44, 36, 22, 0.12)',
  shadowDeep: 'rgba(44, 36, 22, 0.25)',
}

// ========== 扇区常用色（转盘默认配色） ==========
export const SEGMENT_COLORS = [
  '#FF6B6B', '#FFB347', '#4ECDC4', '#45B7D1',
  '#96CEB4', '#FFEAA7', '#DDA0DD', '#FF8C69',
  '#87CEEB', '#98D8C8', '#F7DC6F', '#BB8FCE',
]
