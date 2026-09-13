# syntax=docker/dockerfile:1
# 桐乡阳光回收网站 — 生产镜像（Next.js 全栈 + pnpm）
# 用法见 docker-compose.yml

FROM node:24-alpine AS base
ENV NEXT_TELEMETRY_DISABLED=1
RUN corepack enable && corepack prepare pnpm@11.5.1 --activate

# 1) 依赖安装（利用层缓存）
FROM base AS deps
WORKDIR /app
# pnpm 11 的构建脚本审批策略（allowBuilds）位于 pnpm-workspace.yaml，必须一并拷入，否则 CI 环境下安装会报 ERR_PNPM_IGNORED_BUILDS
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

# 2) 构建
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm build

# 3) 运行
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=4444
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/next.config.mjs ./next.config.mjs
COPY --from=builder /app/drizzle.config.ts ./drizzle.config.ts
COPY --from=builder /app/src ./src
RUN mkdir -p /app/public/uploads
EXPOSE 4444
# 启动前先用 drizzle-kit 把表结构推到 PostgreSQL（幂等），再启动服务
CMD ["sh", "-c", "pnpm db:push && pnpm start"]
