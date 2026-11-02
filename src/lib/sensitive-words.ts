// 可配置敏感词库；生产环境可扩展为外部词库文件
const SENSITIVE_WORDS = [
  "赌博", "色情", "淫秽", "毒品", "枪支", "弹药", "爆炸物",
  "法轮功", "反动", "诈骗", "刷单", "代开发票", "六合彩",
  "走私", "洗钱", "私募基金", "办证", "出售身份证",
]

export function checkSensitive(text: string): {
  passed: boolean
  hits: string[]
} {
  const hits = SENSITIVE_WORDS.filter((word) => text.includes(word))
  return { passed: hits.length === 0, hits }
}
