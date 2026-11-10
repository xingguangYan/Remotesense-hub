import { chromium } from "playwright"
import fs from "node:fs"

const BASE = "http://127.0.0.1:3001"
const OUT = "shots/cn"
fs.mkdirSync(OUT, { recursive: true })

const pages = ["/", "/demands", "/demands/seed-demand-1", "/about"]

const browser = await chromium.launch()
for (const [label, width, height] of [["desktop", 1280, 800], ["mobile", 375, 812]]) {
  const context = await browser.newContext({ viewport: { width, height } })
  const page = await context.newPage()
  for (const p of pages) {
    await page.goto(BASE + p, { waitUntil: "domcontentloaded" })
    await page.waitForTimeout(400)
    const name = p === "/" ? "home" : p.replace(/[^\w]/g, "-").replace(/^-|-$/g, "")
    await page.screenshot({ path: `${OUT}/${label}-${name}.png`, fullPage: true })
    const overflow = await page.evaluate(() => ({
      scrollW: document.documentElement.scrollWidth,
      innerW: window.innerWidth,
      overflowX: document.documentElement.scrollWidth > window.innerWidth,
    }))
    console.log(label, p, JSON.stringify(overflow))
  }
  await context.close()
}
await browser.close()
console.log("shots done ->", OUT)
