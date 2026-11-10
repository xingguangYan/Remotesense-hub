# RemoteSense Hub · 遥感需求对接平台

免注册的轻量级遥感需求撮合平台：甲方发布需求（邮箱验证替代账号），乙方浏览并提交服务意向；同时接受商务合作咨询。

## 技术栈

- Next.js 14（App Router）+ TypeScript + Tailwind CSS
- Prisma ORM（本地 SQLite / 生产 PostgreSQL）
- Zod 表单校验 · Resend 邮件 · Sonner 通知 · Radix UI 基础组件

## 本地启动

```bash
# 1. 安装依赖
npm install

# 2. 配置环境变量（默认使用本地 SQLite + 邮件开发模式）
cp .env.example .env

# 3. 创建数据库表并写入种子数据
npm run db:push
npm run seed

# 4. 启动开发服务器
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000)。

种子数据包含：

- 5 条示例需求（4 条已发布、1 条待验证）
- 演示管理链接：`/manage/seed-demo-manage-token`
- 演示验证链接：`/verify/seed-demo-verify-token`

## 环境变量

| 变量 | 说明 |
| --- | --- |
| `DATABASE_URL` | 本地 `file:./dev.db`；生产填 PostgreSQL 连接串（Neon/Supabase） |
| `RESEND_API_KEY` | Resend API Key，留空时邮件仅打印到控制台（开发模拟模式） |
| `NEXT_PUBLIC_SITE_URL` | 站点地址，用于拼接验证 / 管理链接 |
| `COOPERATION_EMAIL` | 商务合作邮箱，所有合作咨询自动转发到此 |
| `MAIL_FROM` | 发件人地址（Resend 需先验证域名） |
| `TOKEN_SALT` | 一次性凭证哈希加盐，生产环境务必修改 |

## 数据库迁移（生产）

```bash
# 切换 schema.prisma 中 provider 为 postgresql 后
npx prisma migrate deploy
npm run seed
```

## 邮件配置

平台不向用户发送任何邮件；所有通知（新需求上线、新服务方意向、商务合作咨询）统一发送到 `COOPERATION_EMAIL`（平台管理员邮箱），由管理员在后台 `/admin` 审核。

1. 在 [Resend](https://resend.com) 注册并获取 API Key，填入 `RESEND_API_KEY`
2. 免费方案：Resend 免费版的测试发件人 `onboarding@resend.dev` 只能发给「注册 Resend 的账号邮箱」——只要该邮箱就是 `COOPERATION_EMAIL`，即可零成本发送全部通知，无需验证发件域名
3. 如需自定义发件人，在 Resend 后台验证自有域名后更新 `MAIL_FROM`
4. 无 API Key 时平台照常运行，通知邮件改为在服务端控制台输出

## 部署（Vercel + Neon）

1. GitHub 仓库连接 Vercel，框架自动识别 Next.js
2. 环境变量按上表填入（`DATABASE_URL` 填 Neon 连接串）
3. 部署后在 Vercel 域名下确认 `NEXT_PUBLIC_SITE_URL`
4. 生产建议把 `prisma/schema.prisma` 的 `provider` 改为 `postgresql` 并执行 `prisma migrate deploy`

## 平台规则

- **无账号体系**：发布需求 = 邮箱验证链接 + 一次性管理链接（仅存哈希）
- **联系方式必填校验**：手机号 11 位中国大陆规则、邮箱格式校验（Zod）
- **限流**：同一 IP 每小时发布 3 条、咨询 10 条、合作咨询 5 条
- **反垃圾**：数学验证码 + 敏感词过滤 + 24h 未验证自动标记失效
- **脱敏**：列表页与详情页联系方式一律脱敏，完整信息仅在管理链接内可见

## 国内展示层（ModelScope Space）

为解决国内访问 Vercel 主站不稳定的问题，主站可静态导出一份只读的国内展示层，托管在 ModelScope Static Space：

- 空间：`xg346049806/remotesense-hub`（Static SDK，免费 `platform/2v-cpu-8g-mem`）
- 访问地址：<https://xg346049806-remotesense-hub-92da07.ms.show>

同一份产物同时推送到独立仓库 `Remotesense-hub-cn`（GitHub 侧留档与触发链路）。展示层只包含浏览类页面（首页 / 需求大厅 / 需求详情 / 关于），不包含发布、登录、消息等写操作。

导出开启 `trailingSlash: true`：ModelScope Static 托管支持目录索引（`/demands` → `demands/index.html`），不支持无后缀 `.html` 映射。

### 同步机制

- `.github/workflows/sync-cn.yml`：读主站生产 Postgres 的 `published` 需求 → 脱敏导出 `data/demands.json` → `next build cn` 生成 `out/` → force-push 到 `Remotesense-hub-cn` → 推送 `cn/out` 到 ModelScope Space 仓库并调用部署接口
- ModelScope 的 git 推送**不会**自动生效，脚本推送后会调用 `POST /openapi/v1/studios/{owner}/{repo}/deploy` 并轮询状态直到 `Running`
- 幂等：产物 JSON 的 SHA256 与上一提交一致则跳过，不产生空提交；git 网络操作指数退避重试 3 次
- 触发路径：主站发布 / 审核 / 编辑 / 关闭 / 提交意向成功后 fire-and-forget 调 `workflow_dispatch`（失败不阻塞用户操作）；每小时 cron 兜底

### 需要配置的 secret / 环境变量

GitHub 仓库 Secrets（`Settings → Secrets and variables → Actions`）：

- `DATABASE_POSTGRES_URL`：Vercel Postgres 直连串（`postgresql://...`，即 `prisma/schema.prisma` 里读的那个变量）
- `CN_SYNC_PAT`：对 `Remotesense-hub-cn` 有 `contents:write` 权限的 PAT
- `MODELSCOPE_TOKEN`：ModelScope 访问令牌（`ms-...`），用于推送 Space 仓库并调用部署接口

Vercel 项目环境变量（供主站运行时触发 dispatch）：

- `CN_SYNC_PAT`：同上

### 本地预览

```bash
npm run build:cn    # 导出数据 + 构建静态产物到 cn/out
npm run preview:cn  # 本地 serve cn/out 预览全部路由
npm run sync:cn     # 完整同步（需要外网 git 可达 + CN_SYNC_PAT + MODELSCOPE_TOKEN）
```

## 免责声明

平台仅提供信息撮合，不参与交易。详见 `/about`。
