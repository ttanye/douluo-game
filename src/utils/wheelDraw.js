// Canvas 转盘绘制工具

import { SEGMENT_COLORS } from '../config/colors'

/**
 * 绘制完整转盘
 * @param {CanvasContext} ctx
 * @param {Array} segments - [{ label, icon, color?, rarity? }]
 * @param {number} size - canvas 宽高
 * @param {number} rotation - 当前旋转弧度
 */
export function drawWheel(ctx, segments, size, rotation = 0, weights = null) {
  const n = segments.length
  if (n === 0) return
  
  // 稀有度→区域大小权重（A最大，向两端递减）
  const raritySize = { A: 7, B: 5, S: 3, C: 2, SS: 1.5, SSS: 1 }
  const w = weights || segments.map(s => raritySize[s.rarity] || 2)
  const totalW = w.reduce((s, v) => s + v, 0)
  
  const cx = size / 2
  const cy = size / 2
  const radius = size / 2 - 8

  ctx.clearRect(0, 0, size, size)

  let currentAngle = rotation
  segments.forEach((seg, i) => {
    const arcSize = (w[i] / totalW) * 2 * Math.PI
    const startAngle = currentAngle
    const endAngle = currentAngle + arcSize
    currentAngle = endAngle

    ctx.beginPath()
    ctx.moveTo(cx, cy)
    ctx.arc(cx, cy, radius, startAngle, endAngle)
    ctx.closePath()
    
    const color = seg.color || SEGMENT_COLORS[i % SEGMENT_COLORS.length]
    ctx.fillStyle = color
    ctx.fill()
    ctx.strokeStyle = 'rgba(255,255,255,0.5)'
    ctx.lineWidth = 2
    ctx.stroke()

    ctx.save()
    const midAngle = startAngle + arcSize / 2
    ctx.translate(cx, cy)
    ctx.rotate(midAngle)
    
    if (seg.icon) {
      ctx.font = `${Math.max(16, radius * 0.18)}px sans-serif`
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.fillStyle = '#fff'; ctx.fillText(seg.icon, radius * 0.45, 0)
    }
    
    const fontSize = Math.max(11, Math.min(16, radius * 0.12))
    ctx.font = `bold ${fontSize}px sans-serif`
    ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
    ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 2
    
    const label = seg.label
    if (label.length <= 6) ctx.fillText(label, radius * 0.68, 0)
    else {
      const mid = Math.ceil(label.length / 2)
      ctx.fillText(label.slice(0, mid), radius * 0.68, -fontSize * 0.6)
      ctx.fillText(label.slice(mid), radius * 0.68, fontSize * 0.6)
    }
    ctx.shadowBlur = 0; ctx.restore()
  })

  ctx.beginPath(); ctx.arc(cx, cy, radius + 2, 0, 2 * Math.PI)
  ctx.strokeStyle = 'rgba(245, 166, 35, 0.6)'; ctx.lineWidth = 3; ctx.stroke()

  ctx.beginPath(); ctx.arc(cx, cy, radius * 0.22, 0, 2 * Math.PI)
  ctx.fillStyle = 'rgba(255,255,255,0.15)'; ctx.fill()
}

/**
 * 绘制指针（三角形）
 */
export function drawPointer(ctx, size) {
  const cx = size / 2
  const pointerSize = size * 0.06
  
  ctx.save()
  ctx.translate(cx, 12)
  
  ctx.beginPath()
  ctx.moveTo(0, 0)
  ctx.lineTo(-pointerSize * 0.7, -pointerSize * 1.8)
  ctx.lineTo(pointerSize * 0.7, -pointerSize * 1.8)
  ctx.closePath()
  
  ctx.fillStyle = '#F5A623'
  ctx.fill()
  ctx.strokeStyle = '#fff'
  ctx.lineWidth = 2
  ctx.stroke()
  
  ctx.restore()
}

/**
 * 计算目标角度（使指定扇区对准顶部指针）
 */
export function calcTargetAngle(targetIndex, totalSegments, weights = null) {
  const raritySize = { A: 7, B: 5, S: 3, C: 2, SS: 1.5, SSS: 1 }
  const w = weights || Array(totalSegments).fill(1)
  const totalW = w.reduce((s, v) => s + v, 0)
  
  // 计算目标扇区中点之前的所有扇区弧度
  let angleBefore = 0
  for (let i = 0; i < targetIndex; i++) {
    angleBefore += (w[i] / totalW) * 2 * Math.PI
  }
  const targetArc = (w[targetIndex] / totalW) * 2 * Math.PI
  const sectorMidAngle = angleBefore + targetArc / 2
  
  return (3 * Math.PI / 2) - sectorMidAngle
}
