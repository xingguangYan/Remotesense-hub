# RemoteSense Hub · ModelScope Docker 创空间镜像
# 数据存 SQLite（/mnt/workspace 为 ModelScope 持久化卷），不依赖外部数据库
FROM node:20-bookworm-slim AS deps
WORKDIR /app
# Prisma 引擎需要 openssl 才能选择正确的二进制
RUN apt-get update -y \
 && apt-get install -y --no-install-recommends openssl ca-certificates \
 && rm -rf /var/lib/apt/lists/*
COPY package.json package-lock.json ./
# postinstall 的 prisma generate 需要 schema，此时尚未拷贝，先生成到 builder 阶段
RUN npm ci --ignore-scripts

FROM node:20-bookworm-slim AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
RUN apt-get update -y \
 && apt-get install -y --no-install-recommends openssl ca-certificates \
 && rm -rf /var/lib/apt/lists/*
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
RUN apt-get update -y \
 && apt-get install -y --no-install-recommends openssl ca-certificates \
 && rm -rf /var/lib/apt/lists/*
COPY --from=builder /app ./
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh
EXPOSE 7860
ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
