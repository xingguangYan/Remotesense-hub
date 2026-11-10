/**
 * 展示层构建入口：
 *   1. 按 .env / 环境变量判定本地 sqlite 或生产 postgres，生成对应 Prisma client
 *   2. 导出公开数据集(脱敏) 到 cn/public/data/demands.json
 *   3. next build cn -> cn/out 纯静态产物
 * 用法： npm run build:cn
 */
import fs from "node:fs"
import path from "node:path"
import { execSync } from "node:child_process"

const root = process.cwd()
const jsonPath = path.join(root, "cn", "public", "data", "demands.json")

function loadDotEnv() {
  try {
    const text = fs.readFileSync(path.join(root, ".env"), "utf8")
    for (const raw of text.split("\n")) {
      const line = raw.trim()
      if (!line || line.startsWith("#")) continue
      const eq = line.indexOf("=")
      if (eq < 0) continue
      const key = line.slice(0, eq).trim()
      const value = line.slice(eq + 1).trim().replace(/^"(.*)"$/, "$1")
      if (!(key in process.env)) process.env[key] = value
    }
  } catch {
    // 容器/CI 环境变量已由平台注入，无 .env 属正常
  }
}

loadDotEnv()

const usePostgres = Boolean(process.env.DATABASE_POSTGRES_URL)
const schema = usePostgres ? "prisma/schema.prisma" : "prisma/schema.dev.prisma"
console.log(`[cn] prisma generate --schema=${schema}`)
execSync(`npx prisma generate --schema=${schema}`, { stdio: "inherit", cwd: root })

async function main() {
  const { buildPublicDataset } = await import("../src/lib/cn-export")
  const dataset = await buildPublicDataset()

  fs.mkdirSync(path.dirname(jsonPath), { recursive: true })
  fs.writeFileSync(jsonPath, JSON.stringify(dataset, null, 2) + "\n")
  console.log(`[cn] wrote ${dataset.demands.length} demands -> cn/public/data/demands.json`)

  execSync("npx next build cn --no-lint", { stdio: "inherit", cwd: root })
  console.log("[cn] static export finished -> cn/out")
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
