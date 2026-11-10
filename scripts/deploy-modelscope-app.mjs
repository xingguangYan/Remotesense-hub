/**
 * 部署 RemoteSense Hub 主应用到 ModelScope Docker 创空间。
 *
 * 流程：把当前工作树（去掉依赖/构建产物）铺到创空间仓库 -> git 推送 -> 调部署接口 -> 轮询到 Running。
 * 幂等：仓库内容无变化时跳过推送与部署。
 * 依赖：Node 20（内置 fetch）、git。需要环境变量 MODELSCOPE_TOKEN。
 *
 * 用法：node scripts/deploy-modelscope-app.mjs
 */
import fs from "node:fs"
import os from "node:os"
import path from "node:path"
import crypto from "node:crypto"
import { spawnSync } from "node:child_process"

const OWNER = "xg346049806"
const NAME = "remotesense-hub"
const API = `https://modelscope.cn/openapi/v1/studios/${OWNER}/${NAME}`
const DEPLOY_API = `${API}/deploy`
const root = process.cwd()

const TOKEN = process.env.MODELSCOPE_TOKEN
if (!TOKEN) {
  console.error("[deploy] 缺少 MODELSCOPE_TOKEN")
  process.exit(1)
}

// 不进入镜像/仓库的路径（与 .dockerignore 保持一致）
const EXCLUDED = new Set([
  "node_modules",
  ".next",
  "out",
  ".git",
  ".github",
  ".vercel",
  "cn",
  "shots",
  ".learnings",
  "buildlog.txt",
  "tsconfig.tsbuildinfo",
  "next-env.d.ts",
])
const EXCLUDED_PREFIX = [".env", "prisma/dev.db"]

function ignored(name) {
  return EXCLUDED.has(name) || EXCLUDED_PREFIX.some((p) => name === p || name.startsWith(p))
}

function git(args, opts = {}) {
  const res = spawnSync("git", args, {
    cwd: opts.cwd || root,
    encoding: "utf8",
    env: {
      ...process.env,
      GIT_TERMINAL_PROMPT: "0",
      GIT_AUTHOR_NAME: "rs-hub-deploy",
      GIT_AUTHOR_EMAIL: "deploy@remotesense-hub.local",
      GIT_COMMITTER_NAME: "rs-hub-deploy",
      GIT_COMMITTER_EMAIL: "deploy@remotesense-hub.local",
    },
    stdio: opts.capture ? "pipe" : "inherit",
  })
  if (res.status !== 0) {
    throw new Error(`git ${args.join(" ")} 失败: ${(res.stderr || "").toString().slice(0, 300)}`)
  }
  return res.stdout ? res.stdout.toString().trim() : ""
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function retry(label, fn, delays = [5000, 15000, 40000]) {
  for (let i = 0; i < delays.length + 1; i++) {
    try {
      return await fn()
    } catch (error) {
      if (i === delays.length) throw error
      console.error(`[deploy] ${label} 第 ${i + 1} 次失败，${delays[i] / 1000}s 后重试`)
      await sleep(delays[i])
    }
  }
}

function copyTree(src, dest) {
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    if (ignored(entry.name)) continue
    const from = path.join(src, entry.name)
    const to = path.join(dest, entry.name)
    if (entry.isDirectory()) {
      fs.mkdirSync(to, { recursive: true })
      copyTree(from, to)
    } else if (entry.isFile()) {
      fs.copyFileSync(from, to)
    }
  }
}

async function main() {
  const remote = `https://oauth2:${TOKEN}@modelscope.cn/studios/${OWNER}/${NAME}.git`
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "rs-app-"))
  const repoDir = path.join(tmp, "studio")

  await retry("clone", () => git(["clone", "--depth", "1", remote, repoDir], { cwd: tmp }))

  // 全量替换（保留 .git），确保与主仓库内容一致
  for (const name of fs.readdirSync(repoDir)) {
    if (name === ".git") continue
    fs.rmSync(path.join(repoDir, name), { recursive: true, force: true })
  }
  copyTree(root, repoDir)

  git(["add", "-A"], { cwd: repoDir })
  const status = git(["status", "--porcelain"], { cwd: repoDir, capture: true })
  if (!status) {
    console.log("[deploy] 创空间仓库与当前代码一致，跳过推送与部署")
    return
  }

  const hash = crypto.createHash("sha256")
  for (const rel of ["package.json", "Dockerfile", "prisma/schema.dev.prisma"]) {
    hash.update(fs.readFileSync(path.join(root, rel)))
  }
  const shortHash = hash.digest("hex").slice(0, 12)

  git(
    ["-c", "user.name=rs-hub-deploy", "-c", "user.email=deploy@remotesense-hub.local", "commit", "-m",
      `deploy: app source ${shortHash} (${new Date().toISOString()})`],
    { cwd: repoDir },
  )
  await retry("push", () => git(["push", "origin", "HEAD:master"], { cwd: repoDir }))
  console.log("[deploy] 创空间仓库已更新，触发构建部署 ...")

  const deployRes = await fetch(DEPLOY_API, {
    method: "POST",
    headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
  })
  if (!deployRes.ok) {
    throw new Error(`[deploy] 部署接口返回 ${deployRes.status}: ${(await deployRes.text()).slice(0, 200)}`)
  }

  // OpenAPI 响应外层有 data 信封；构建 + 启动通常 2-6 分钟
  const deadline = Date.now() + 10 * 60_000
  let status = "Unknown"
  while (Date.now() < deadline) {
    await sleep(15000)
    const res = await fetch(API, { headers: { Authorization: `Bearer ${TOKEN}` } })
    if (res.ok) {
      const body = await res.json()
      status = body?.data?.status ?? body?.status ?? "Unknown"
      console.log(`[deploy] 状态: ${status}`)
      if (status === "Running") {
        console.log("[deploy] 部署完成")
        return
      }
      if (status === "Failed" || status === "Error") {
        throw new Error(`[deploy] 部署失败: ${status}`)
      }
    }
  }
  throw new Error(`[deploy] 部署超时（最后状态: ${status}）`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
