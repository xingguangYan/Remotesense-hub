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
  ["/manage/seed-demo-manage-token", "manage"],
  ["/cooperation", "cooperation"],
  ["/about", "about"],
  // verify 放最后：访问会消费一次性 token 并把 seed-demand-5 置为 published，
  // 先截其他页面才能保证它们拍到 seed 后的初始状态。
  // 运行顺序固定为：npm run seed -> checks.mjs -> shots.mjs。
  ["/verify/seed-demo-verify-token", "verify"],
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

// 英文版关键页（cookie 切换语言），须在 browser.close() 之前执行
const enCtx = await browser.newContext({ viewport: viewports.desktop })
await enCtx.addCookies([
  { name: "rs_hub_locale", value: "en", domain: "localhost", path: "/" },
])
const enPage = await enCtx.newPage()
for (const [path, slug] of [
  ["/", "home"],
  ["/demands", "demands"],
  ["/demands/seed-demand-1", "demand-detail"],
  ["/cooperation", "cooperation"],
]) {
  try {
    await enPage.goto(base + path, { waitUntil: "networkidle", timeout: 60000 })
    await enPage.waitForTimeout(400)
    console.log(`en ${slug}: HTTP ok`)
    await enPage.screenshot({ path: `${outDir}/${slug}-en.png`, fullPage: true })
  } catch (error) {
    console.error(`en ${slug}: FAILED ->`, error.message)
    failed++
  }
}
await enCtx.close()

await browser.close()
console.log(`shots done, failures=${failed}`)
