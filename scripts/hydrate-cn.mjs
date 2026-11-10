import { chromium } from "playwright"

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } })
const blocked = []
page.on("response", (r) => {
  if (r.status() >= 400) blocked.push(r.status() + " " + r.url())
})

await page.goto("http://127.0.0.1:3001/demands", { waitUntil: "networkidle" })

// 客户端水合后选择「数据处理」筛选
await page.waitForSelector("#filter-category")
await page.selectOption("#filter-category", "DATA_PROCESSING")
await page.waitForTimeout(600)

const result = await page.evaluate(() => {
  const cards = [...document.querySelectorAll("main a[href^='/demands/']")]
  return {
    cardCount: cards.length,
    firstHref: cards[0]?.getAttribute("href"),
    localeText: document.querySelector("header")?.textContent.includes("EN"),
  }
})
console.log("after filter DATA_PROCESSING:", JSON.stringify(result))
console.log("blocked requests:", blocked.length ? blocked.slice(0, 5) : "none")

// 语言切换（纯客户端，localStorage）
const zhBefore = await page.textContent("h1")
await page.click('button[aria-pressed="false"]')
await page.waitForTimeout(400)
const enAfter = await page.textContent("h1")
console.log("locale switch changed h1:", zhBefore !== enAfter)

await browser.close()
