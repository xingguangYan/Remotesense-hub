# 2026-11-10 · ModelScope Space 部署国内展示层的可复用经验

1. **ModelScope Studio（Space）git 推送不会自动生效**：`git push` 到
   `https://oauth2:<token>@modelscope.cn/studios/<owner>/<repo>.git` 只更新仓库，
   必须再调 `POST https://modelscope.cn/openapi/v1/studios/<owner>/<repo>/deploy`
   （`Authorization: Bearer <token>`）才会构建；构建/部署约 1-3 分钟，
   轮询 `GET .../studios/<owner>/<repo>` 直到 `Running`。

2. **OpenAPI 响应有 `data` 信封**：`GET/POST /openapi/v1/...` 返回
   `{ success, request_id, data: {...} }`，裸读 `body.status` 永远 undefined
   （会被误判为 Unknown 并轮询超时）；Python SDK 内部会解包，所以 SDK 正常、
   手写 fetch 出错。正确写法 `body.data?.status ?? body.status`。

3. **ModelScope Static SDK 的 clean URL**：托管支持目录索引
   （`/demands` 和 `/demands/` 都命中 `demands/index.html`），但不支持
   `demands.html` 的无后缀映射。Next 静态导出必须 `trailingSlash: true`，
   否则站内 `<Link href="/demands">` 点过去 404。

4. **本机 git push github.com 被墙、api.github.com 可达**：`git push` 超时后
   可用 Git Data API 完成推送——POST `/git/blobs`（base64）→
   POST `/git/trees`（`base_tree` + entries）→ POST `/git/commits`
   （parents 用远程当前 SHA）→ PATCH `/git/refs/heads/master`。
   注意 `git hash-object <file>` 不写对象库，`git cat-file blob <hash>` 会报
   bad file；取 git 规范化内容用 `git add` 后 `git cat-file blob :<path>`。
   空 blob（`e69de29b`）会把文件提交成空文件，务必核对字节数。

5. **GitHub Actions secret 可用 API 免网页添加**：admin PAT +
   `pynacl.SealedBox`，GET `/actions/secrets/public-key` → 加密 →
   PUT `/actions/secrets/<NAME>`（`encrypted_value` + `key_id`）。
