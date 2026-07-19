// 本地存档管理

const STORAGE_KEY = 'douluo_fate_book_save'
const SETTINGS_KEY = 'douluo_fate_book_settings'

/**
 * 保存游戏进度
 */
export function saveGame(characterState, progressState, worldState) {
  try {
    const data = {
      character: characterState,
      progress: progressState,
      world: worldState,
      savedAt: Date.now(),
    }
    uni.setStorageSync(STORAGE_KEY, JSON.stringify(data))
    return true
  } catch (e) {
    console.error('存档失败:', e)
    return false
  }
}

/**
 * 读取游戏进度
 */
export function loadGame() {
  try {
    const raw = uni.getStorageSync(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw)
  } catch (e) {
    console.error('读档失败:', e)
    return null
  }
}

/**
 * 删除存档
 */
export function deleteSave() {
  try {
    uni.removeStorageSync(STORAGE_KEY)
    return true
  } catch (e) {
    return false
  }
}

/**
 * 是否有存档
 */
export function hasSave() {
  return !!uni.getStorageSync(STORAGE_KEY)
}

/**
 * 自动存档（仅在小程序隐藏时调用）
 */
export function autoSave(characterStore, progressStore, worldStore) {
  return saveGame(
    characterStore.$state,
    progressStore.$state,
    worldStore.$state
  )
}
