# RemoteSense Hub · ModelScope Docker 创空间镜像
# 数据存 SQLite（/mnt/workspace 为 ModelScope 持久化卷），不依赖外部数据库
FROM node:20-bookworm-slim AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:20-bookworm-slim AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
# 构建期用临时 sqlite 文件，避免任何外部数据库依赖
ENV DATABASE_URL="file:./build.db"
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate --schema=prisma/schema.dev.prisma \
 && npm run build

FROM node:20-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=7860
COPY --from=builder /app ./
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh
EXPOSE 7860
ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
