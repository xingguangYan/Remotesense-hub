import { chromium } from "playwright"

const base = process.env.BASE_URL || "http://localhost:3000"
const LOCALE_COOKIE = { name: "rs_hub_locale", value: "en", domain: "localhost", path: "/" }

let failures = 0

/** 断言一页的正/负文本 */
async function check(context, { path, label, expect = [], reject = [], waitAfterGoto = 300, expectStatus = 200 }) {
  const page = await context.newPage()
  try {
    const res = await page.goto(base + path, { waitUntil: "networkidle", timeout: 60000 })
    await page.waitForTimeout(waitAfterGoto)
    const body = await page.locator("body").textContent()
    for (const text of expect) {
      if (!body?.includes(text)) {
        console.error(`FAIL ${label}: missing "${text}"`)
        failures++
      }
    }
    for (const text of reject) {
      if (body?.includes(text)) {
        console.error(`FAIL ${label}: unexpected "${text}"`)
        failures++
      }
    }
    const status = res ? res.status() : "?"
    if (status !== expectStatus) {
      console.error(`FAIL ${label}: HTTP ${status} (expected ${expectStatus})`)
      failures++
    }
    console.log(`ok  ${label} (${path})`)
  } finally {
    await page.close()
  }
}

const browser = await chromium.launch()

// ---------- 中文（默认） ----------
const zh = await browser.newContext()
await check(zh, {
  path: "/",
  label: "zh-home",
  expect: [
    "发布遥感需求，精准对接专业服务",
    "平台能力",
    "典型应用场景",
    "最新需求",
    "三步完成需求对接",
    "长江中下游水稻种植面积遥感监测专题制图",
    "xingguangyan0703@gmail.com",
  ],
  reject: ["13812345678"],
})
await check(zh, {
  path: "/demands",
  label: "zh-demands",
  expect: ["需求大厅", "已验证需求"],
  reject: ["13812345678"],
})
await check(zh, {
  path: "/demands/seed-demand-1",
  label: "zh-detail",
  expect: ["联系方式（已脱敏）", "138****5678", "wa*****@example.com", "我对这个需求感兴趣"],
  reject: ["13812345678", "wangwei@example.com", "Demand Hall"],
})
await check(zh, {
  path: "/demands/seed-demand-3",
  label: "zh-detail-optout",
  expect: ["您的意向将由平台人工转达"],
})
await check(zh, {
  path: "/demands/seed-demand-5",
  expectStatus: 404,
  label: "zh-detail-pending",
  reject: ["流域水环境遥感反演"],
})
await check(zh, { path: "/publish", label: "zh-publish", expect: ["发布遥感需求", "需求基本信息", "下一步"] })
await check(zh, {
  path: "/cooperation",
  label: "zh-cooperation",
  expect: ["商务合作", "数据服务", "提交合作意向", "复制"],
})
await check(zh, { path: "/about", label: "zh-about", expect: ["免责声明", "平台仅提供信息发布与撮合服务"] })
await check(zh, {
  path: "/manage/seed-demo-manage-token",
  label: "zh-manage",
  expect: ["13812345678", "收到的服务方意向", "张经理", "编辑需求", "关闭需求"],
})
await zh.close()

// ---------- 英文（cookie 切换） ----------
const en = await browser.newContext()
await en.addCookies([LOCALE_COOKIE])
await check(en, {
  path: "/",
  label: "en-home",
  expect: [
    "Match your remote sensing demands",
    "Platform Capabilities",
    "Typical Scenarios",
    "Latest Demands",
    "Image Acquisition",
    "Agriculture & Cropland",
  ],
  reject: ["平台能力"],
})
await check(en, {
  path: "/demands",
  label: "en-demands",
  expect: ["Demand Hall", "verified demands", "All categories"],
})
await check(en, {
  path: "/demands/seed-demand-1",
  label: "en-detail",
  expect: ["Contact (masked)", "138****5678", "I'm interested in this demand"],
})
await check(en, {
  path: "/cooperation",
  label: "en-cooperation",
  expect: ["Partnership", "Data Services", "Partnership email"],
})
await check(en, {
  path: "/about",
  label: "en-about",
  expect: ["What we are", "Disclaimer"],
})
await en.close()

// ---------- 验证流（中文语境，会消费一次性 token） ----------
const zh2 = await browser.newContext()
await check(zh2, {
  path: "/verify/seed-demo-verify-token",
  label: "verify",
  expect: ["需求验证成功"],
  waitAfterGoto: 4000,
})

// 详情页结构化数据
const page = await zh2.newPage()
await page.goto(`${base}/demands/seed-demand-1`, { waitUntil: "networkidle" })
const jsonLd = await page.locator('script[type="application/ld+json"]').textContent()
if (!jsonLd?.includes('"@type":"Demand"') || jsonLd.includes("13812345678")) {
  console.error("FAIL detail JSON-LD")
  failures++
} else {
  console.log("ok  detail JSON-LD (Demand, no contact leak)")
}
await zh2.close()

await browser.close()
console.log(`checks done, failures=${failures}`)
process.exit(failures > 0 ? 1 : 0)
