const REPO = "xingguangYan/Remotesense-hub"
const WORKFLOW = "sync-cn.yml"

/**
 * 触发国内展示层同步（失败只记日志，不阻塞用户操作、不影响主流程结果）。
 *
 * serverless 环境下响应返回后未完成的 promise 会被冻结，纯 fire-and-forget 不可靠，
 * 因此用 3.5s 上限的 race 等待 dispatch 落地（GitHub dispatch 通常 <1s，最坏只多等 3.5s）。
 * 即使本次彻底失败也没关系：sync-cn workflow 每小时 cron 兜底一次。
 */
export async function triggerCnSync(label: string) {
  const token = process.env.CN_SYNC_PAT
  if (!token) {
    console.warn("[cn-sync] 跳过：未配置 CN_SYNC_PAT")
    return
  }

  const fire = async () => {
    try {
      const res = await fetch(
        `https://api.github.com/repos/${REPO}/actions/workflows/${WORKFLOW}/dispatches`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/vnd.github+json",
            "X-GitHub-Api-Version": "2022-11-28",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ ref: "master" }),
        },
      )
      if (!res.ok) {
        const body = await res.text().catch(() => "")
        console.warn(`[cn-sync] ${label} dispatch 返回 ${res.status}: ${body.slice(0, 120)}`)
      } else {
        console.log(`[cn-sync] ${label} 已触发展示层同步`)
      }
    } catch (e) {
      console.warn(`[cn-sync] ${label} dispatch 异常:`, String(e).slice(0, 200))
    }
  }

  const timeout = new Promise<void>((resolve) => setTimeout(resolve, 3500))
  await Promise.race([fire(), timeout])
}
