# 桐乡阳光回收

面向本地个体户（二手电脑 / 配件回收与销售）的轻量全栈网站。顾客可浏览在售二手整机与配件、在线提交回收估价与联系购买；店主通过后台管理商品、回收订单、留言与店铺设置。

技术栈选型以「本地零运维」为优先：开发环境无需 Docker、无需外部数据库，即可直接跑起来。

## 功能特性

- **商城前台**：二手整机 / 配件分类浏览，商品详情页，联系购买 CTA。
- **在线估价**：顾客填写设备类型、品牌、型号、成色与配置，系统按规则自动给出报价区间，无匹配规则时转入人工报价。
- **回收订单**：顾客提交回收意向，店主在后台查看与跟进。
- **留言咨询**：顾客留言，后台标记已处理。
- **管理后台**：商品 / 分类 / 品牌 / 回收订单 / 留言 / 店铺设置统一管理，带登录鉴权。
- **双轨数据库**：本地用 PGlite（进程内 Postgres，Drizzle 原生支持），生产可无缝切换到真实 PostgreSQL。

## 技术栈

| 层次 | 选型 |
| --- | --- |
| 框架 | Next.js 16（App Router，React 19，Turbopack） |
| 语言 | TypeScript ^6 |
| 样式 | Tailwind CSS v4 + 自建 shadcn/ui 风格组件（零额外依赖） |
| ORM | Drizzle ORM |
| 本地数据库 | PGlite（进程内 Postgres，无需 Docker） |
| 生产数据库 | PostgreSQL（通过 `DATABASE_URL` 切换） |
| 鉴权 | jose（JWT 会话签名）+ bcryptjs（管理员密码） |
| 测试 | Vitest |
| 包管理 | pnpm |

## 环境要求

- Node.js **22**
- pnpm（仓库已通过 `packageManager` 字段锁定版本，CI 自动安装对应版本）

## 快速开始（本地开发）

```bash
# 1. 安装依赖
pnpm install

# 2. 准备环境变量
cp .env.example .env.local
#   按需修改 .env.local（默认即开箱可用）

# 3. 启动开发服务器
pnpm dev
#   浏览器访问 http://localhost:3000
```

### 数据库：两种本地模式

项目对本地开发提供两种开箱即用的数据库模式，**无需安装任何数据库服务**。

- **持久化模式（推荐日常开发）**：编辑 `.env.local` 保持
  ```
  DATABASE_URL=pglite://./.data/pglite
  ```
  首次运行建表并灌入示例数据：
  ```bash
  pnpm db:migrate:local   # 应用迁移
  pnpm seed               # 灌入示例数据（已存在则跳过）
  ```
  数据落在 `.data/pglite`（已被 `.gitignore` 忽略）。

- **内存模式（沙箱 / CI 友好）**：编辑 `.env.local` 改为
  ```
  DATABASE_URL=pglite://memory
  ```
  每次启动进程自动建表 + 灌入示例数据，**零磁盘写入**。适合受限环境（如无法写本地目录的沙箱）与持续集成。

> 生产环境把 `DATABASE_URL` 指向真实 PostgreSQL 即可，例如：
> `DATABASE_URL=postgres://user:pass@localhost:5432/pcrecycle`

## 常用脚本

| 命令 | 说明 |
| --- | --- |
| `pnpm dev` | 启动开发服务器 |
| `pnpm build` | 生产构建 |
| `pnpm start` | 启动生产服务器（需先 `build`） |
| `pnpm test` | 运行 Vitest 单元测试 |
| `pnpm db:generate` | 由 schema 生成 Drizzle 迁移（不连库） |
| `pnpm db:push` | 将 schema 推送到数据库 |
| `pnpm db:migrate:local` | 本地应用 PGlite 迁移 |
| `pnpm seed` | 灌入示例数据 |

## 管理员后台

- 入口：`/admin`
- 默认账号（首次 seed 写入库）：
  - 用户名：`admin`
  - 密码：`change-me`
- **上线前请务必在 `.env.local` 修改 `ADMIN_PASSWORD` 与 `AUTH_SECRET`**，并使用强随机值。

## 测试

当前为纯函数单元测试（估价逻辑 `src/lib/estimate.test.ts`），不依赖数据库或网络：

```bash
pnpm test
```

## 部署

1. 安装依赖：`pnpm install`
2. 生产构建：`pnpm build`
3. 配置生产环境变量（至少 `DATABASE_URL` 指向 PostgreSQL、`AUTH_SECRET` 为强随机值、管理员账号密码）。
4. 启动：`pnpm start`（默认端口 3000）。

如需用真实 Postgres，可参考 `.env.example` 中的连接串示例，并运行 `pnpm db:push` / `pnpm db:migrate:local` 初始化表结构（生产建议走 migration，而非 `db:push`）。

## 使用 Docker 部署（推荐生产）

仓库已提供 `Dockerfile` 与 `docker-compose.yml`，一键拉起「Next.js 应用 + PostgreSQL」。

### 前置准备

1. 在项目根目录创建 `.env`（不会被提交，已在 `.gitignore` 中忽略），至少设置：

   ```bash
   AUTH_SECRET=$(openssl rand -base64 32)   # 会话签名密钥，务必强随机
   ADMIN_PASSWORD=你的强密码               # 后台管理员密码
   ADMIN_USERNAME=admin                     # 可选，默认 admin
   ```

   也可直接复制模板后修改：`cp .env.example .env`。

2. 确认已安装 Docker 与 Docker Compose v2（`docker compose` 命令可用）。

### 启动

```bash
docker compose up -d
```

- 首次启动会自动：用 `drizzle-kit push` 把表结构推送到 PostgreSQL（幂等），再启动 Next.js。
- 访问 http://localhost:4444 ；后台 /admin 。
- 上传的图片持久化在 `uploads` 卷（`/app/public/uploads`），容器重建不丢失；数据库持久化在 `pgdata` 卷。

### 停止 / 重建

```bash
docker compose down              # 停止并移除容器（数据卷保留）
docker compose up -d --build     # 代码改动后重新构建镜像
```

> 镜像基于 `node:20-alpine` + pnpm 多阶段构建；`.dockerignore` 已排除 `node_modules`、`.next`、`public/uploads`、`.env` 等，避免把密钥或冗余产物打进镜像。

## 持续集成

仓库内置 GitHub Actions（`.github/workflows/ci.yml`）：在 **push 到 `main`** 以及 **发起 Pull Request** 时自动执行 `pnpm install` → `pnpm build` → `pnpm test`。CI 使用内存版 PGlite（`DATABASE_URL=pglite://memory`），无需外部数据库即可完成构建与测试。

## 安全与注意

- `.env.local`（含密钥与本地配置）已被 `.gitignore` 忽略，**不会进入版本库**。请勿手动提交。
- `.env.example` 仅为模板，不含任何真实密钥。
- `.data/`（本地数据库运行数据）、`/public/uploads`（上传文件）均为运行时产物，已忽略。
- 生产部署请替换所有默认值（管理员密码、会话密钥、数据库连接）。
