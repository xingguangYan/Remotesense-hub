# 2026-11-10 · ModelScope 创空间接入 OAuth 全栈应用的经验

1. **静态空间无法做登录/写操作**：要登录发布必须用 Docker/Streamlit/Gradio 创空间；
   Static 创空间不支持 OAuth。Docker 创空间要求服务监听 `0.0.0.0:7860`（8080 被平台占用），
   `/mnt/workspace` 是持久化卷（重启保留），适合放 SQLite。

2. **OAuth 设置 API 字段**（PATCH `/openapi/v1/studios/{owner}/{repo}/settings`）：
   `oauth_enabled: true` 时必须同时提供 `oauth_scope`（如 `openid profile`）、
   `oauth_token_expire_time`（1-6 天）、`oauth_callback_urls`（数组，需含
   `https://<host>/auth/callback`）、`oauth_homepage_url`；单独传其余字段会 400
   （提示必须带 oauth_enabled）。保存后必须重新部署才注入环境变量。

3. **容器运行时注入的 `OPENID_PROVIDER_URL` 可能是 `http://www.modelscope.cn`**：
   必须强制升级为 https，否则 authorize 跳转是 http，浏览器/客户端会拒绝。
   OIDC discovery：`https://www.modelscope.cn/.well-known/openid-configuration`。

4. **Next 14 App Router 的 GET route handler 会构建期静态缓存**：
   依赖运行时 env（OAuth 客户端）的路由必须 `export const dynamic = "force-dynamic"`，
   否则构建时 env 缺失的响应（`/?auth=unavailable`）会被永久缓存，表现像"环境变量没注入"。

5. **创空间页面是 iframe 嵌入**：浏览器顶层访问 app 域名会被重定向到
   `modelscope.cn/studios/{owner}/{repo}?mode=full`，app 在 iframe 中运行；
   登录链接建议 `target="_blank"`，会话 cookie 需 `SameSite=None; Secure`
   才能在 iframe 内生效。服务端重定向不要用 `req.url`（容器内是 0.0.0.0:7860），
   用 `STUDIO_HOST` 拼站点域名。

6. **Docker 构建坑**：`npm ci` 的 postinstall（prisma generate）在只复制了
   package.json 的 deps 阶段必然失败 → `npm ci --ignore-scripts`，在 builder 阶段
   拷贝完整源码后再 `prisma generate`；Prisma 引擎需要 openssl，三个 stage 都装
   `openssl ca-certificates`。

7. **阿里风控会拦截自动化登录**：headless 与 headful Chrome 均触发
   `passport.modelscope.cn/.../punish` 页面，无法用脚本完成真实账号登录；
   验证登录链路时改为验证 redirect_uri/state/回调错误分支 + 手工构造会话 cookie 测会话解析。
