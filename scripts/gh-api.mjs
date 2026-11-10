/** 通过 GitHub Contents API 推送文件（绕开国内不稳定的 git 协议） */
import fs from "node:fs"
import path from "node:path"

const TOKEN = process.env.CN_SYNC_PAT
const OWNER = "xingguangYan"

async function api(url, options = {}) {
  let lastError
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await fetch(`https://api.github.com${url}`, {
        ...options,
        headers: {
          Authorization: `Bearer ${TOKEN}`,
          "Content-Type": "application/json",
          Accept: "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
          ...(options.headers || {}),
        },
      })
      return res
    } catch (e) {
      lastError = e
      console.error(`[gh] 第 ${attempt} 次请求失败: ${String(e).slice(0, 150)}`)
      await new Promise((r) => setTimeout(r, 5000 * attempt))
    }
  }
  throw lastError
}

async function putFile(repo, file, localPath, message) {
  const content = fs.readFileSync(localPath).toString("base64")
  const res = await api(`/repos/${OWNER}/${repo}/contents/${file}`, {
    method: "PUT",
    body: JSON.stringify({ message, content }),
  })
  const json = await res.json()
  return { status: res.status, json }
}

async function getFileSha(repo, file) {
  const res = await api(`/repos/${OWNER}/${repo}/contents/${file}`)
  if (res.status === 404) return null
  const json = await res.json()
  return json.sha
}

async function triggerWorkflow(repo, workflow, ref = "master") {
  const res = await api(`/repos/${OWNER}/${repo}/actions/workflows/${workflow}/dispatches`, {
    method: "POST",
    body: JSON.stringify({ ref }),
  })
  return { status: res.status, body: await res.text() }
}

async function listRuns(repo, workflow) {
  const res = await api(`/repos/${OWNER}/${repo}/actions/workflows/${workflow}/runs?per_page=5`)
  return await res.json()
}

const mode = process.argv[2]
if (mode === "put") {
  const [repo, file, localPath] = process.argv.slice(3)
  console.log(await putFile(repo, file, localPath, process.argv[6] || `chore: update ${file}`))
} else if (mode === "dispatch") {
  const [repo, workflow] = process.argv.slice(3)
  console.log(await triggerWorkflow(repo, workflow))
} else if (mode === "runs") {
  const [repo, workflow] = process.argv.slice(3)
  const runs = await listRuns(repo, workflow)
  for (const run of runs.workflow_runs || []) {
    console.log(run.status, run.conclusion, run.html_url, run.created_at)
  }
}
