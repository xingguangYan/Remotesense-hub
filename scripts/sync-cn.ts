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

// ModelScope Space：国内展示层的实际托管处（Static SDK）
const MODELSCOPE_STUDIO_OWNER = "xg346049806"
const MODELSCOPE_STUDIO_NAME = "remotesense-hub"
const MODELSCOPE_DEPLOY_API =
  `https://modelscope.cn/openapi/v1/studios/${MODELSCOPE_STUDIO_OWNER}/${MODELSCOPE_STUDIO_NAME}/deploy`

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

type GitOpts = { cwd?: string; capture?: boolean }

function git(args: string[], opts: GitOpts = {}) {
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

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/** git 网络操作统一重试：5s / 15s / 40s 三次，仍失败抛错（Actions 标红，下次 cron 兜底） */
async function retryGit(label: string, args: string[], opts: GitOpts = {}) {
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

/**
 * 展示层源码指纹：next build cn 的全部输入 = cn/ 源码 + 主站 src/（cn 页面复用其组件/i18n/常量）
 * + 根构建配置。任一变化都需要重新构建发布；全部不变且数据也未变时跳过整个同步。
 * （Next App Router 输出含每次构建随机的 buildId，无法字节级幂等，故按输入指纹判定）
 */
function fingerprintSources(): string {
  const targets: string[] = []
  const collect = (dir: string, skip: string[]) => {
    for (const name of fs.readdirSync(dir).sort()) {
      const full = path.join(dir, name)
      const rel = path.relative(root, full).replace(/\\/g, "/")
      if (fs.statSync(full).isDirectory()) {
        if (skip.some((s) => rel === s || rel.startsWith(s + "/"))) continue
        collect(full, skip)
      } else {
        targets.push(rel)
      }
    }
  }
  collect(path.join(root, "cn"), ["cn/.next", "cn/out"])
  collect(path.join(root, "src"), [])
  for (const extra of ["package.json", "package-lock.json", "tailwind.config.ts", "postcss.config.mjs"]) {
    if (fs.existsSync(path.join(root, extra))) targets.push(extra)
  }
  targets.sort()
  const hash = crypto.createHash("sha256")
  for (const rel of targets) {
    hash.update(rel).update("\0")
    hash.update(fs.readFileSync(path.join(root, rel))).update("\0")
  }
  return hash.digest("hex").slice(0, 12)
}

async function main() {
  // 1. 导出公开数据集(确定性：固定字段顺序、无时间戳)，并写入 cn/public/data/demands.json
  //    —— next build cn 的唯一数据来源（构建期注入，运行时不读主站）
  const { buildPublicDataset } = await import("../src/lib/cn-export")
  const dataset = await buildPublicDataset()
  const dataJson = JSON.stringify(dataset, null, 2) + "\n"
  const newHash = crypto.createHash("sha256").update(dataJson).digest("hex").slice(0, 12)
  const newSrcHash = fingerprintSources()
  console.log(`[sync] 新快照: ${dataset.demands.length} 条需求, sha256=${newHash}, src=${newSrcHash}`)

  const canonicalJson = path.join(root, "cn", "public", "data", "demands.json")
  fs.mkdirSync(path.dirname(canonicalJson), { recursive: true })
  fs.writeFileSync(canonicalJson, dataJson)

  // 2. 克隆 cn 仓库（纯产物仓），网络波动时重试
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "rs-cn-"))
  const repoDir = path.join(tmp, "repo")
  await retryGit("clone", ["clone", "--depth", "1", remote, repoDir], { cwd: tmp })

  // 3. 幂等判定：数据 hash 与源码指纹均与上一提交一致则跳过（连带省掉本次构建）
  const committedJson = path.join(repoDir, "data", "demands.json")
  const committedMeta = path.join(repoDir, "data", "sync-meta.json")
  const oldHash = fs.existsSync(committedJson)
    ? crypto.createHash("sha256").update(fs.readFileSync(committedJson)).digest("hex").slice(0, 12)
    : null
  let oldSrcHash: string | null = null
  if (fs.existsSync(committedMeta)) {
    try {
      oldSrcHash = (JSON.parse(fs.readFileSync(committedMeta, "utf8")) as { srcSha256?: string }).srcSha256 ?? null
    } catch {
      oldSrcHash = null
    }
  }
  if (oldHash === newHash && oldSrcHash === newSrcHash) {
    console.log(`[sync] 数据与源码均与上一提交一致(sha256=${newHash}, src=${newSrcHash})，跳过推送`)
    return
  }
  console.log(
    `[sync] 有变化(数据 ${oldHash ?? "空"} -> ${newHash}, 源码 ${oldSrcHash ?? "空"} -> ${newSrcHash})，开始构建`,
  )

  // 4. 构建静态产物（next build cn）
  console.log("[sync] 构建静态产物 cn/out ...")
  execSync("npx next build cn --no-lint", { stdio: "inherit", cwd: root })

  // 5. 把 out/ 内容铺到 cn 仓库根目录
  const outDir = path.join(root, "cn", "out")
  for (const name of fs.readdirSync(repoDir).filter((n) => n !== ".git")) {
    fs.rmSync(path.join(repoDir, name), { recursive: true, force: true })
  }
  for (const name of fs.readdirSync(outDir)) {
    fs.cpSync(path.join(outDir, name), path.join(repoDir, name), { recursive: true })
  }

  // 6. 安全网：产物里的 demands.json 必须与新快照字节一致
  const builtJson = path.join(repoDir, "data", "demands.json")
  const builtHash = crypto.createHash("sha256").update(fs.readFileSync(builtJson)).digest("hex").slice(0, 12)
  if (builtHash !== newHash) {
    throw new Error(`构建产物 JSON 与新快照不一致 (${builtHash} != ${newHash})`)
  }

  // 7. 写源码指纹元数据（供下次幂等比对），提交并推送
  fs.writeFileSync(committedMeta, JSON.stringify({ srcSha256: newSrcHash }, null, 2) + "\n")
  git(["add", "-A"], { cwd: repoDir })
  git(
    [
      "-c",
      "user.name=rs-hub-sync",
      "-c",
      "user.email=sync@remotesense-hub.local",
      "commit",
      "-m",
      `chore(data): sync demands sha256=${newHash} src=${newSrcHash} (${dataset.demands.length} demands)`,
    ],
    { cwd: repoDir },
  )

  await retryGit("push", ["push", "--force-with-lease", "origin", "HEAD:main"], { cwd: repoDir })
  console.log("[sync] 推送成功，cn 仓库已更新")

  // 8. 部署 ModelScope Space（国内展示层实际托管处；推送后必须显式触发部署才生效）
  await deployModelscope(newHash, dataset.demands.length)
}

/** 把 cn/out 铺进目标仓库目录（保留 .git，其余全量替换） */
function stageOutDir(repoDir: string) {
  const outDir = path.join(root, "cn", "out")
  for (const name of fs.readdirSync(repoDir).filter((n) => n !== ".git")) {
    fs.rmSync(path.join(repoDir, name), { recursive: true, force: true })
  }
  for (const name of fs.readdirSync(outDir)) {
    fs.cpSync(path.join(outDir, name), path.join(repoDir, name), { recursive: true })
  }
}

/**
 * 部署到 ModelScope Space（Static SDK）：
 * 克隆 studio 仓库 -> 铺产物 -> 推送 -> 调部署 API -> 轮询到 Running。
 * 注意：ModelScope 的 git 推送不会自动触发生效，必须显式调用 deploy 接口。
 * 缺 MODELSCOPE_TOKEN 时只告警跳过，不影响 GitHub 侧同步。
 */
async function deployModelscope(dataHash: string, demandCount: number) {
  const token = process.env.MODELSCOPE_TOKEN
  if (!token) {
    console.warn("[sync] 未配置 MODELSCOPE_TOKEN，跳过 ModelScope Space 部署")
    return
  }

  const studioRemote = `https://oauth2:${token}@modelscope.cn/studios/${MODELSCOPE_STUDIO_OWNER}/${MODELSCOPE_STUDIO_NAME}.git`
  const statusApi = `https://modelscope.cn/openapi/v1/studios/${MODELSCOPE_STUDIO_OWNER}/${MODELSCOPE_STUDIO_NAME}`

  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "rs-ms-"))
  const studioDir = path.join(tmp, "studio")
  await retryGit("ms-clone", ["clone", "--depth", "1", studioRemote, studioDir], { cwd: tmp })

  stageOutDir(studioDir)
  git(["add", "-A"], { cwd: studioDir })
  git(
    [
      "-c",
      "user.name=rs-hub-sync",
      "-c",
      "user.email=sync@remotesense-hub.local",
      "commit",
      "-m",
      `chore(data): sync demands sha256=${dataHash} (${demandCount} demands)`,
    ],
    { cwd: studioDir },
  )
  await retryGit("ms-push", ["push", "origin", "HEAD:master"], { cwd: studioDir })
  console.log("[sync] ModelScope Space 仓库已更新，触发部署 ...")

  const deployRes = await fetch(MODELSCOPE_DEPLOY_API, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
  })
  if (!deployRes.ok) {
    throw new Error(
      `[sync] ModelScope deploy API 返回 ${deployRes.status}: ${(await deployRes.text()).slice(0, 200)}`,
    )
  }

  // 轮询部署状态：Building/Deploying -> Running，上限 5 分钟；失败/超时均抛错由 cron 兜底重试
  const deadline = Date.now() + 5 * 60_000
  let status = "Unknown"
  while (Date.now() < deadline) {
    await sleep(10_000)
    const res = await fetch(statusApi, { headers: { Authorization: `Bearer ${token}` } })
    if (res.ok) {
      // OpenAPI 响应形如 { success, request_id, data: { status, ... } }
      const body = (await res.json()) as { status?: string; data?: { status?: string } }
      status = body.data?.status ?? body.status ?? "Unknown"
      console.log(`[sync] ModelScope 部署状态: ${status}`)
      if (status === "Running") {
        console.log("[sync] ModelScope Space 部署完成")
        return
      }
      if (status === "Failed" || status === "Error") {
        throw new Error(`[sync] ModelScope Space 部署失败: ${status}`)
      }
    }
  }
  throw new Error(`[sync] ModelScope Space 部署超时（最后状态: ${status}）`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
