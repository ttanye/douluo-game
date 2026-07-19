// 章节索引 — 导出所有章节配置
import { CHAPTER_01 } from './chapter-01'
import { CHAPTER_02 } from './chapter-02'
import { CHAPTER_03 } from './chapter-03'
import { CHAPTER_04 } from './chapter-04'
import { CHAPTER_05 } from './chapter-05'
import { CHAPTER_06 } from './chapter-06'
import { CHAPTER_07 } from './chapter-07'
import { CHAPTER_08 } from './chapter-08'
import { CHAPTER_09 } from './chapter-09'
import { CHAPTER_10 } from './chapter-10'

export const ALL_GROWTH_CHAPTERS = [
  CHAPTER_01, CHAPTER_02, CHAPTER_03, CHAPTER_04, CHAPTER_05,
  CHAPTER_06, CHAPTER_07, CHAPTER_08, CHAPTER_09, CHAPTER_10,
]

export function getGrowthChapter(index) {
  return ALL_GROWTH_CHAPTERS[index - 1] || null
}

export function getGrowthStep(chapterIndex, stepIndex) {
  const chapter = getGrowthChapter(chapterIndex)
  if (!chapter) return null
  return chapter.steps[stepIndex] || null
}
