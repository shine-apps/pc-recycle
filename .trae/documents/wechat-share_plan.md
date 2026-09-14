# (site) 页面微信分享功能实施计划

## 背景与方案结论

目标：让 `src/app/(site)` 下所有页面可分享到**微信好友**和**朋友圈**。

经确认，店铺目前**没有已认证的微信服务号**，因此采用**零资质方案**（已与用户确认）：

- 微信平台限制：H5 页面**无法通过 JS 直接唤起分享面板**（微信早已封禁该能力），微信内唯一分享路径是用户点击右上角「···」→「发送给朋友 / 分享到朋友圈」。
- 分享卡片的标题、描述、缩略图由微信爬虫抓取**服务端直出 HTML** 决定：`<title>`、`<meta name="description">`、`og:image`（识别不稳定，iOS 支持差），兜底取页面内**尺寸 ≥300×300 的 JPG/PNG `<img>`**；不支持 WebP/GIF/SVG/base64；图片需公网可访问、无鉴权无重定向。
- 本项目是 Next.js App Router（SSR），商品详情页 `force-dynamic` 直出标题/描述/主图，天然具备卡片抓取条件；上传链路（`compress.ts`）统一输出 JPEG、最大边 1280px，符合缩略图规范。

功能拆成两部分：
1. **分享卡片优化**（给爬虫看）：补全 OG 元数据 + 默认分享图 + 无大图页面的隐藏兜底图。
2. **分享入口与引导**（给用户看）：全站右下角悬浮分享按钮 + 商品详情页分享按钮；微信内弹「点右上角 ···」引导浮层，微信外走系统分享（Web Share API）并降级为复制链接。

## 仓库调研结论

- 站点页面：`(site)/page.tsx`（首页，服务端组件，无独立 metadata）、`products/page.tsx`（客户端组件）、`products/[id]/page.tsx`（服务端组件，已有动态 metadata + JSON-LD）、`recycle/page.tsx`（客户端组件）、`contact/page.tsx`（服务端组件，已有 metadata，含 160px 微信二维码图，尺寸不达标）。
- 根 `src/app/layout.tsx` 仅有静态 `title/description`，无 `metadataBase`、无 openGraph。
- `public/` 下仅有 `product-placeholder.svg`（SVG 不能做微信缩略图）。
- 图片上传落盘 `public/uploads/`，返回 `/uploads/xxx.jpg` 相对路径；压缩后格式为 JPEG。
- 部署：Next 16 standalone，Docker 端口 4444；`NEXT_PUBLIC_*` 为**构建时**内联变量，需经 Dockerfile `ARG` + compose `build.args` 传递。
- UI 风格：Tailwind + shadcn 风格组件（`@/components/ui/button` 等），无图标库，图标需内联 SVG。
- middleware 只拦截 `/admin` 与 `/api/admin`，不影响新资源/页面。

## 文件与改动

### 新增

- `public/share-logo.png`
  - 默认分享缩略图：500×500、品牌蓝（#2563eb）底 + 白色极简分享图形（三个圆点连线），JPG/PNG 规范、预计 < 10KB（远小于 64KB 建议值）。
  - 由一次性脚本生成（仅用 Node 内置 `zlib` 手写 PNG，零新依赖），老板日后可直接替换同名文件换成店铺正式 logo。
- `scripts/gen-share-logo.mjs`
  - PNG 生成脚本（PNG 签名 + IHDR/IDAT/IEND + CRC32，逐像素几何绘制），`node scripts/gen-share-logo.mjs` 运行；保留以便重新生成。
- `src/components/share/ShareButton.tsx`（`"use client"`）
  - Props：`{ title?: string; text?: string; url?: string; variant?: "fab" | "button"; label?: string; className?: string }`。
  - 环境判断：`/MicroMessenger/i.test(navigator.userAgent)`（企业微信 `wxwork` 同样走引导）。
  - 微信内点击 → 显示引导浮层 `ShareGuideOverlay`：全屏半透明遮罩，右上角定位「···」高亮 + 向下手指/箭头，文案「点击右上角 ···，可发送给微信朋友或分享到朋友圈」；点击遮罩任意处关闭；`role="dialog"`、可 Esc 关闭。
  - 微信外点击 → `navigator.canShare({url})` 通过则 `navigator.share({ title, text, url })`（`AbortError` 用户取消时静默）；不支持时降级 `navigator.clipboard.writeText`，再降级隐藏 `textarea + execCommand("copy")`；复制成功显示自制轻量 toast「链接已复制，快去微信分享给好友吧」（2s 消失，不引依赖）。
  - `fab`：`fixed bottom-5 right-4 z-40` 胶囊/圆形主色按钮 + 内联分享 SVG 图标，带阴影；`button`：复用 `buttonVariants({ variant: "outline" })` 风格，与现有 UI 一致。
  - 默认取 `window.location.href`、`document.title`；组件挂载后才渲染（避免 SSR/ hydration 不一致，用 useEffect 挂载标志或直接在点击事件里读 window，按钮本身可 SSR）。
- `src/components/share/ShareFallbackImage.tsx`
  - 纯展示组件（无 hook、无 `"use client"`，在服务端/客户端页面都能直出 HTML）：
    `<img src="/share-logo.png" width="300" height="300" alt="" aria-hidden="true" style="position:absolute;left:-9999px;top:0" />`
    不加 `loading="lazy"`、不用 `display:none`（部分抓取器会忽略），用移出视口方式兜底。

### 修改

- `src/app/layout.tsx`
  - metadata 增加 `metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000")`；
  - 增加 `openGraph` 默认项：`type: "website"`、`locale: "zh_CN"`、`siteName: "桐乡阳光回收"`、`images: ["/share-logo.png"]`（由 metadataBase 补成绝对 URL）。
- `src/app/(site)/layout.tsx`
  - 在 `<footer>` 后挂载 `<ShareButton variant="fab" />`（仅影响 (site) 页面，不影响 /admin）。
- `src/app/(site)/page.tsx`
  - 增加 `export const metadata`（首页专属标题/描述文案，走 SSR 直出）；页面底部挂 `<ShareFallbackImage />`。
- `src/app/(site)/products/page.tsx`
  - 客户端组件无法 export metadata，保持根默认；在页面 JSX 中挂 `<ShareFallbackImage />`（Next 客户端组件仍会输出初始 HTML，可被爬虫抓取）。
- `src/app/(site)/products/[id]/page.tsx`
  - `generateMetadata` 返回值增加 `openGraph`：标题用商品名、描述用现有文案、`images` 取主图（优先选 jpg/png；若为相对路径由 metadataBase 补全；data: URL 不放入）；`alternates.canonical` 顺手补当前商品绝对 URL。
  - 详情页**不挂** fallback 图（避免抢主图），主图本身就是 ≥300px 直出 JPEG。
  - 「联系购买」按钮改为 flex 行：原链接 `flex-1` + 新增 `<ShareButton variant="button" label="分享" title={...} text={`${p.title} ¥${p.price} · 桐乡阳光回收`} />。
- `src/app/(site)/recycle/page.tsx`
  - JSX 中挂 `<ShareFallbackImage />`。
- `src/app/(site)/contact/page.tsx`
  - JSX 中挂 `<ShareFallbackImage />`（微信二维码仅 160px，不满足抓取尺寸）。
- `.env.example`
  - 增加 `# 站点对外访问地址（生产填 https 域名，用于微信分享卡片 og:image 绝对地址）` 与 `NEXT_PUBLIC_SITE_URL=https://your-domain.example`。
- `Dockerfile`
  - builder 阶段 `RUN pnpm build` 前增加 `ARG NEXT_PUBLIC_SITE_URL`。
- `docker-compose.yml`
  - `web.build` 改为对象形式并透传 `args: NEXT_PUBLIC_SITE_URL: ${NEXT_PUBLIC_SITE_URL:-}`；头部注释补充该变量说明。

## 实施步骤（依赖顺序）

1. 写 `scripts/gen-share-logo.mjs` 并执行，生成 `public/share-logo.png`，确认文件有效（可用 `file` 命令查看 PNG 尺寸）。
2. 写 `ShareFallbackImage.tsx` 与 `ShareButton.tsx`（含引导浮层、复制降级、toast、内联 SVG）。
3. 改根 `layout.tsx`（metadataBase + 默认 openGraph）。
4. 改 `(site)/layout.tsx` 挂悬浮按钮。
5. 改各页面：首页 metadata + fallback、products/recycle/contact 挂 fallback、商品详情页 openGraph + 行内分享按钮。
6. 改 `.env.example`、`Dockerfile`、`docker-compose.yml`。
7. 自查与验证（见下）。

## 依赖与注意事项

- **零新增 npm 依赖**；PNG 生成只用 Node 内置模块。
- 微信卡片抓取前提（部署侧，非代码）：页面与图片需公网可访问、正式域名建议 HTTPS + ICP 备案；无需配置公众号「JS 安全域名」（那是 JS-SDK 路线才需要，本方案不涉及）。
- `NEXT_PUBLIC_SITE_URL` 为构建时变量：未配置时 og 绝对地址会是 localhost，此时靠页面内**相对路径隐藏 `<img>`** 兜底（微信按页面 URL 解析相对路径，仍可抓图）；生产配置后 og:image 同时生效，双保险。
- 微信抓取缓存可达 24 小时以上，换图/改文案后短时间内仍可能显示旧卡片，属平台行为。
- 商品图历史数据若存在 webp/gif（当前上传链路只产 jpeg，风险低），og:image 选择时优先 jpg/png 扩展名。

## 验证

- `pnpm build` 通过；`pnpm dev` 启动无报错；`pnpm test` 现有测试不受影响。
- `curl -s http://localhost:3000/ | grep` 查看 SSR 直出 HTML：含 `og:image`、`/share-logo.png` 隐藏 img；商品详情页 HTML 含商品标题、`og:image` 指向 `/uploads/...jpg`、不含隐藏兜底图。
- 桌面浏览器：点击悬浮按钮走复制降级（桌面 Chrome 的 `navigator.share` 不可用），toast 正常出现且链接正确；商品页行内按钮同样可用。
- 手机浏览器（可联网部署/内网穿透后）：系统分享面板可调起；取消分享无报错。
- 真机微信内：点击按钮弹出右上角引导浮层，点遮罩可关闭；通过「···」发送给朋友/分享到朋友圈，卡片展示标题、描述、缩略图（商品页为商品主图，其他页为 share-logo）。
- TypeScript/ESLint 诊断无错误（GetDiagnostics）。

## 风险与处理

- **平台限制无法绕过**：任何 H5 页面都做不到"点按钮一键直接分享到微信"，只能引导「···」；UI 文案如实描述，避免承诺无法实现的交互。
- **og:image 识别不稳定**：已用「OG 标签 + 页面隐藏 img」双保险；商品页以直出主图为主。
- **缩略图不显示**：排查图片格式（仅 JPG/PNG）、尺寸（≥300×300）、公网可访问性、HTTPS 混合内容、微信缓存；代码侧均已规避。
- **悬浮按钮遮挡内容**：置于右下且尺寸小；站内无底部固定导航，冲突风险低；商品页底部按钮区在悬浮按钮之上留白足够。
- **Docker 构建变量遗漏**：已在 Dockerfile/compose 改动项中显式声明 ARG/args；缺失时构建不报错（env 为空字符串），功能退化为相对路径兜底，不阻断发布。
