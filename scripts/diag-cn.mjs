import { chromium } from "playwright"

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } })
await page.goto("http://127.0.0.1:3001/", { waitUntil: "networkidle" })

const diag = await page.evaluate(() => {
  const pick = (sel) => {
    const el = document.querySelector(sel)
    if (!el) return { missing: true }
    const cs = getComputedStyle(el)
    const r = el.getBoundingClientRect()
    return {
      tag: el.tagName,
      display: cs.display,
      width: Math.round(r.width),
      bg: cs.backgroundColor,
      font: cs.fontFamily.slice(0, 40),
      cls: el.className && el.className.baseVal !== undefined ? el.className.baseVal : String(el.className).slice(0, 90),
    }
  }
  return {
    body: pick("body"),
    main: pick("main"),
    heroSection: pick("main section"),
    navHeader: pick("header"),
    card: pick("main a.group"),
    docScrollW: document.documentElement.scrollWidth,
  }
})
console.log(JSON.stringify(diag, null, 1))
await browser.close()
