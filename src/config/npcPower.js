// 原著角色战力（低于玩家曲线，让玩家有挑战性但能赢）
const RING = { '十年':1, '百年':10, '千年':40, '万年':300, '十万年':1500, '百万年':4000 }
const BONE = { SSS:3000, SS:1200, S:400, A:150, B:50, C:10 }
const SOUL = {
  '昊天锤':2.5, '蓝银皇':1.8, '海神':2.6, '罗刹神':2.4,
  '六翼天使':2.3, '天使神':2.6, '噬魂蛛皇':2.0, '死亡蛛皇':1.8,
  '七杀剑':2.0, '邪眸白虎':1.7, '邪火凤凰':1.6, '幽冥灵猫':1.5,
  '碧磷蛇皇':1.3, '柔骨兔':1.4, '九宝琉璃塔':1.3, '破魂枪':1.8,
  '暗魔邪神虎':1.7, '深海魔鲸':1.6, '妖狐':1.2,
}

function calc(Lv, soul, innate, rings, bones=[], domains=0, god=false) {
  let p = Math.floor(Math.pow(Math.max(1,Lv),1.4) * (SOUL[soul]||1) * (innate/5))
  rings.forEach((r,i) => { p += Math.floor((RING[r]||6) * (1+i*0.12)) })
  bones.forEach(b => { p += Math.floor((BONE[b[0]]||10) * (b[1]||1) * (b[2]||1)) })
  if (domains>0) p = Math.floor(p * (1+domains*0.10))
  if (god) p = Math.floor(p * 1.4)
  return p
}

export const CANON_NPC = {
  beast_10yr: 8, beast_100yr: 25, beast_1000yr: 75, beast_10000yr: 220,
  wuhun_elite: 600, wuhun_douluo: 2000, trial_avatar: 850, god_trial: 5000,

  tangSan_lv30:   80,   tangSan_lv50:   350,  tangSan_lv70:   900,
  tangSan_lv90:   2500, tangSan_god:    7000,
  xiaoWu_lv40:    150,  xiaoWu_lv70:    650,
  daiMubai_lv50:  330,  daiMubai_lv70:  800,  daiMubai_lv90:  1800,
  tangHao:        3600, duGuBo:         1800, zhaoWuji:       900,
  biBiDong_queen: 5000, biBiDong_god:   10000, qianRenXue_god: 8000,
  huLiena_lv60:   450,
}

export function getNPCpower(id) {
  const map = {
    firstBattle: CANON_NPC.beast_10yr, chain_shrek_3: CANON_NPC.zhaoWuji,
    chain_wuhun_2: CANON_NPC.wuhun_elite, huntStarted: CANON_NPC.wuhun_elite,
    wx_huntRebels: CANON_NPC.wuhun_elite, fs_assassination: CANON_NPC.wuhun_douluo,
    tiandouCoup: 1000, avatarTrial: CANON_NPC.trial_avatar,
    grandBattle: CANON_NPC.wuhun_douluo, lastTraitor: 1500, nearDeath: 3600,
    godRealmThree: CANON_NPC.god_trial, canon_jialingPass: 3000,
    finalBattle: CANON_NPC.biBiDong_god, canon_godWar: 15000,
  }
  return map[id] || 120
}

