import { chromium } from "playwright"

const base = process.env.BASE_URL || "http://localhost:3000"

const checks = [
  {
    path: "/",
    label: "home",
    expect: [
      "发布遥感需求，精准对接专业服务",
      "三步完成需求对接",
      "长江中下游水稻种植面积遥感监测专题制图",
      "xingguangyan0703@gmail.com",
    ],
    reject: ["13812345678"],
  },
  {
    path: "/demands",
    label: "demands",
    expect: ["需求大厅", "共 4 条已验证需求"],
  },
  {
    path: "/demands/seed-demand-1",
    label: "demand-detail",
    expect: [
      "联系方式（已脱敏）",
      "138****5678",
      "wa*****@example.com",
      "我对这个需求感兴趣",
    ],
    reject: ["13812345678", "wangwei@example.com"],
  },
  {
    path: "/demands/seed-demand-3",
    label: "demand-detail-optout",
    expect: ["您的意向将由平台人工转达"],
  },
  // 待验证需求在 verify 页面被 POST 消费前保持不可见
  {
    path: "/demands/seed-demand-5",
    label: "demand-detail-pending",
    reject: ["流域水环境遥感反演"],
  },
  {
    path: "/publish",
    label: "publish",
    expect: ["发布遥感需求", "需求基本信息", "下一步"],
  },
  {
    path: "/cooperation",
    label: "cooperation",
    expect: [
      "商务合作",
      "数据服务",
      "提交合作意向",
      "xingguangyan0703@gmail.com",
      "复制",
    ],
  },
  {
    path: "/about",
    label: "about",
    expect: ["免责声明", "平台仅提供信息发布与撮合服务"],
  },
  // verify 页客户端发起 POST（dev 首次编译慢），等待后断言最终态
  {
    path: "/verify/seed-demo-verify-token",
    label: "verify",
    expect: ["需求验证成功"],
    waitAfterGoto: 3000,
  },
]

const browser = await chromium.launch()
const page = await browser.newPage()
let failures = 0

for (const { path, label, expect = [], reject = [], waitAfterGoto = 300 } of checks) {
  await page.goto(base + path, { waitUntil: "networkidle", timeout: 60000 })
  if (label === "verify") {
    // 客户端 POST 会先经历 dev 路由冷编译，等结果 h1 出现（加载态无 h1）
    await page.locator("h1").waitFor({ state: "visible", timeout: 30000 })
  } else {
    await page.waitForTimeout(waitAfterGoto)
  }
  const body = await page.locator("body").textContent()
  for (const text of expect) {
    if (!body?.includes(text)) {
      console.error(`FAIL ${label}: 缺少文本「${text}」`)
      failures++
    }
  }
  for (const text of reject) {
    if (body?.includes(text)) {
      console.error(`FAIL ${label}: 不应出现的文本「${text}」`)
      failures++
    }
  }
  console.log(`ok  ${label} (${path})`)
}

// 管理页放在 verify 之后：凭管理链接可见完整联系方式与意向
{
  await page.goto(`${base}/manage/seed-demo-manage-token`, {
    waitUntil: "networkidle",
    timeout: 60000,
  })
  await page.waitForTimeout(300)
  const body = await page.locator("body").textContent()
  const expected = [
    "13812345678",
    "收到的服务方意向（2 条）",
    "张经理",
    "编辑需求",
    "关闭需求",
  ]
  for (const text of expected) {
    if (!body?.includes(text)) {
      console.error(`FAIL manage: 缺少文本「${text}」`)
      failures++
    }
  }
  console.log("ok  manage (/manage/seed-demo-manage-token)")
}

// 详情页结构化数据：类型 Demand 且不含完整联系方式
await page.goto(`${base}/demands/seed-demand-1`, { waitUntil: "networkidle" })
const jsonLd = await page
  .locator('script[type="application/ld+json"]')
  .textContent()
if (!jsonLd?.includes('"@type":"Demand"') || jsonLd.includes("13812345678")) {
  console.error("FAIL demand-detail JSON-LD 校验")
  failures++
} else {
  console.log("ok  demand-detail JSON-LD (Demand, 无泄漏联系方式)")
}

await browser.close()
console.log(`checks done, failures=${failures}`)
process.exit(failures > 0 ? 1 : 0)
