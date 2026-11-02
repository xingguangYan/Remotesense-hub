import { chromium } from "playwright"
import { mkdirSync } from "fs"

const base = process.env.BASE_URL || "http://localhost:3000"
const outDir = process.env.OUT_DIR || "./shots"
mkdirSync(outDir, { recursive: true })

const pages = [
  ["/", "home"],
  ["/demands", "demands"],
  ["/demands/seed-demand-1", "demand-detail"],
  ["/publish", "publish"],
  ["/publish/success", "publish-success"],
  ["/verify/seed-demo-verify-token", "verify"],
  ["/manage/seed-demo-manage-token", "manage"],
  ["/cooperation", "cooperation"],
  ["/about", "about"],
]

const viewports = {
  desktop: { width: 1280, height: 800 },
  mobile: { width: 375, height: 812 },
}

const browser = await chromium.launch()
let failed = 0

for (const [label, viewport] of Object.entries(viewports)) {
  const context = await browser.newContext({ viewport })
  const page = await context.newPage()
  page.on("pageerror", (error) => {
    console.error(`[pageerror:${label}]`, error.message)
  })
  for (const [path, slug] of pages) {
    try {
      const res = await page.goto(base + path, { waitUntil: "networkidle", timeout: 60000 })
      await page.waitForTimeout(400)
      const status = res ? res.status() : "?"
      console.log(`${label} ${slug}: HTTP ${status}`)
      if (status >= 400) failed++
    } catch (error) {
      console.error(`${label} ${slug}: FAILED ->`, error.message)
      failed++
    }
    await page.screenshot({
      path: `${outDir}/${slug}-${label}.png`,
      fullPage: true,
    })
  }
  await context.close()
}

await browser.close()
console.log(`done, failures=${failed}`)
