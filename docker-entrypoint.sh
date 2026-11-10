#!/bin/sh
set -e

# ModelScope 持久化卷：/mnt/workspace（重启保留）；本地 docker run 无该卷时回退到临时目录
DB_DIR=/mnt/workspace
if [ ! -d "$DB_DIR" ]; then
  DB_DIR=/app/data
  mkdir -p "$DB_DIR"
fi
export DATABASE_URL="file:$DB_DIR/remotesense.db"

echo "[entrypoint] DATABASE_URL=$DATABASE_URL"
echo "[entrypoint] OAUTH_CLIENT_ID=${OAUTH_CLIENT_ID:-unset} STUDIO_HOST=${STUDIO_HOST:-unset} OPENID_PROVIDER_URL=${OPENID_PROVIDER_URL:-unset}"
# 幂等建表：新增 User 表 / Demand.userId 等变更会自动应用
npx prisma db push --schema=prisma/schema.dev.prisma --skip-generate

exec npx next start -H 0.0.0.0 -p 7860
