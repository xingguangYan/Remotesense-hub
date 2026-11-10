// 零依赖静态服务器，用于本地预览 cn/out（npm run preview:cn 的离线替代）
import fs from "node:fs"
import path from "node:path"
import http from "node:http"

const root = path.resolve("cn/out")
const PORT = Number(process.env.CN_PORT) || 3001

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".txt": "text/plain; charset=utf-8",
  ".ico": "image/x-icon",
}

function safeJoin(target) {
  const resolved = path.resolve(root, "." + (target.startsWith("/") ? target : "/" + target))
  return resolved.startsWith(root) ? resolved : null
}

function resolveFile(urlPath) {
  const clean = urlPath.replace(/\/+$/, "")
  const candidates = []
  if (clean) {
    // 1) 原始路径(带后缀: css/js/png) 2) clean-url 补 .html 3) 目录 index
    for (const candidate of [safeJoin(clean), safeJoin(clean + ".html"), safeJoin(clean + "/index.html")]) {
      if (candidate) candidates.push(candidate)
    }
    if (!path.extname(clean)) {
      candidates.push(path.join(root, "404.html"))
    }
  } else {
    candidates.push(path.join(root, "index.html"))
  }
  return candidates.find((candidate) => fs.existsSync(candidate) && fs.statSync(candidate).isFile())
}

function isFallback(file) {
  // 命中的是 404.html 说明没匹配到真实页面
  return path.basename(file) === "404.html"
}

http
  .createServer((req, res) => {
    try {
      const urlPath = decodeURIComponent(String(req.url).split("?")[0])
      const file = resolveFile(urlPath)
      if (!file) {
        res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" })
        res.end("404 - " + urlPath)
        return
      }
      const data = fs.readFileSync(file)
      const status = isFallback(file) ? 404 : 200
      res.writeHead(status, { "Content-Type": TYPES[path.extname(file)] || "application/octet-stream" })
      res.end(data)
    } catch (error) {
      res.writeHead(500, { "Content-Type": "text/plain" })
      res.end(String(error))
    }
  })
  .listen(PORT, "127.0.0.1", () => {
    console.log(`[cn] preview: http://127.0.0.1:3001`.replace("3001", String(PORT)) + `  (root: ${root})`)
  })
