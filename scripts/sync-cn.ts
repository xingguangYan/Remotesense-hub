/**
 * 国内展示层同步：生成确定性 demands.json -> 与 Remotesense-hub-cn 仓库上一提交比对
 * -> 不一致才把 cn/out 产物 force-push 过去；完全一致则跳过（幂等）。
 * 运行前置：prisma client 已生成（本地 dev:gen / CI 用 postgres schema）。
 * 用法： npm run sync:cn （tsx scripts/sync-cn.ts）
 */
import fs from "node:fs"
import os from "node:os"
import path from "node:path"
import crypto from "node:crypto"
import { execSync, spawnSync } from "node:child_process"

const CN_REPO = "xingguangYan/Remotesense-hub-cn"
const root = process.cwd()

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
    // CI 已注入环境变量
  }
}

loadDotEnv()

const PAT = process.env.CN_SYNC_PAT
if (!PAT) {
  console.error("[sync] 缺少 CN_SYNC_PAT（fine-grained PAT，cn 仓库 contents:write）")
  process.exit(1)
}

const remote = `https://x-access-token:${PAT}@github.com/${CN_REPO}.git`

function git(args, opts = {}) {
  const res = spawnSync("git", args, {
    cwd: opts.cwd || root,
    encoding: "utf8",
    env: {
      ...process.env,
      GIT_TERMINAL_PROMPT: "0",
      GIT_AUTHOR_NAME: "rs-hub-sync",
      GIT_AUTHOR_EMAIL: "sync@remotesense-hub.local",
      GIT_COMMITTER_NAME: "rs-hub-sync",
      GIT_COMMITTER_EMAIL: "sync@remotesense-hub.local",
    },
    stdio: opts.capture ? "pipe" : "inherit",
  })
  if (res.status !== 0) {
    throw new Error(`git ${args.join(" ")} failed: ${(res.stderr || "").toString().slice(0, 300)}`)
  }
  return res.stdout ? res.stdout.toString().trim() : ""
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/** git 网络操作统一重试：5s / 15s / 40s 三次，仍失败抛错（Actions 标红，下次 cron 兜底） */
async function retryGit(label, args, opts = {}) {
  const delays = [5_000, 15_000, 40_000]
  for (let attempt = 1; attempt <= 3; attempt++) {
    const res = spawnSync("git", args, {
      cwd: opts.cwd || root,
      encoding: "utf8",
      env: {
        ...process.env,
        GIT_TERMINAL_PROMPT: "0",
        GIT_AUTHOR_NAME: "rs-hub-sync",
        GIT_AUTHOR_EMAIL: "sync@remotesense-hub.local",
        GIT_COMMITTER_NAME: "rs-hub-sync",
        GIT_COMMITTER_EMAIL: "sync@remotesense-hub.local",
      },
      stdio: "inherit",
    })
    if (res.status === 0) return
    console.error(`[sync] ${label} 第 ${attempt} 次失败`)
    if (attempt < 3) {
      console.log(`[sync] ${delays[attempt - 1] / 1000}s 后重试 ...`)
      await sleep(delays[attempt - 1])
    }
  }
  throw new Error(`[sync] ${label} 连续 3 次失败`)
}

async function main() {
  // 1. 导出公开数据集(确定性：固定字段顺序、无时间戳)
  const { buildPublicDataset } = await import("../src/lib/cn-export.ts")
  const dataset = await buildPublicDataset()

  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "rs-cn-"))
  const stagingJson = path.join(tmp, "demands.json")
  fs.writeFileSync(stagingJson, JSON.stringify(dataset, null, 2) + "\n")
  const newHash = crypto.createHash("sha256").update(fs.readFileSync(stagingJson)).digest("hex").slice(0, 12)
  console.log(`[sync] 新快照: ${dataset.demands.length} 条需求, sha256=${newHash}`)

  // 2. 克隆 cn 仓库（纯产物仓），网络波动时重试
  const repoDir = path.join(tmp, "repo")
  await retryGit("clone", ["clone", "--depth", "1", remote, repoDir], { cwd: tmp })
  const committedJson = path.join(repoDir, "data", "demands.json")

  // 3. 构建静态产物（next build cn）
  console.log("[sync] 构建静态产物 cn/out ...")
  execSync("npx next build cn --no-lint", { stdio: "inherit", cwd: root })

  // 4. 把 out/ 内容铺到 cn 仓库根目录
  const outDir = path.join(root, "cn", "out")
  const entries = fs.readdirSync(repoDir).filter((name) => name !== ".git")
  for (const name of entries) {
    fs.rmSync(path.join(repoDir, name), { recursive: true, force: true })
  }
  for (const name of fs.readdirSync(outDir)) {
    fs.cpSync(path.join(outDir, name), path.join(repoDir, name), { recursive: true })
  }

  // 5. 幂等比对：产物里的 demands.json 与新快照必须一致（构建即注入），且仓库内容无变化则跳过
  const builtJson = path.join(repoDir, "data", "demands.json")
 const builtHash = crypto.createHash("sha256").update(fs.readFileSync(builtJson)).digest("hex").slice(0, 12)
  if (builtHash !== newHash) {
    throw new Error(`构建产物 JSON 与新快照不一致 (${builtHash} != ${newHash})`)
  }
  const hasOld = fs.existsSync(committedJson)
  const oldHash = hasOld
    ? crypto.createHash("sha256").update(fs.readFileSync(committedJson)).digest("hex").slice(0, 12)
    : null

  const status = git(["status", "--porcelain"], { cwd: repoDir, capture: true })
  if (!status && hasOld && oldHash === newHash) {
    console.log(`[sync] 数据与上一提交一致(sha256=${newHash})，跳过推送`)
    return
  }
  console.log(`[sync] 内容有变化(旧 ${oldHash ?? "空"} -> 新 ${newHash})，准备推送`)

  // 6. 提交并推送，指数退避重试 3 次（5s / 15s / 40s）
  git(["add", "-A"], { cwd: repoDir })
  git(
    [
      "-c",
      "user.name=rs-hub-sync",
      "-c",
      "user.email=sync@remotesense-hub.local",
      "commit",
      "-m",
      `chore(data): sync demands sha256=${newHash} (${dataset.demands.length} demands)`,
    ],
    { cwd: repoDir },
  )

  await retryGit("push", ["push", "--force-with-lease", "origin", "HEAD:main"], { cwd: repoDir })
  console.log("[sync] 推送成功，cn 仓库已更新")
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
