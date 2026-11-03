# 2026-11-02 · RemoteSense Hub 搭建过程中的三条可复用经验

1. **apply_patch 自由格式补丁的纪律**：每行内容必须以 `+` 开头（包括缩进、
   空行、`{`、`aria-` 属性等任何行），漏一行整块补丁会被拒绝；
   `Update File` 的 context 行必须与前缀语法一致，混写会把新内容插成重复块。
   大文件优先 Delete + Add 分两次提交，别用 Update 大段重排。

2. **tsx 不会自动加载 .env**：Prisma CLI 会加载，但脚本里读 `process.env`
   （如自定义加盐的 token 哈希）在 `tsx prisma/seed.ts` 下是 undefined，
   与 Next 服务器（自动加载 .env） calc 出的哈希必然对不上。
   修法：`node --env-file-if-exists=.env --import tsx prisma/seed.ts`。
   PowerShell 里 `[token]` 这样的目录名是通配符，查询要用 `-LiteralPath`。

3. **Next 14 dev 默认 reactStrictMode，effect 执行两次**：
   邮件验证这类一次性副作用的客户端 POST 必须用 `useRef` 守卫，
   否则第二次请求必然落到「token 已被使用」的错误分支上，
   生产环境虽然不双触发，但接口幂等保护仍然必要。
