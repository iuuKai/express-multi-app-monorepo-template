# Express Multi-App Monorepo Template

一个基于 Express 作为路由代理的 Monorepo 仓库模板，支持一键部署到 Vercel，实现一个域名访问多个前端子项目。

## 🚀 项目演示

演示地址：<https://express-multi-app-monorepo-template.vercel.app/>

## ✨ 功能特点

### 核心优势

- **即开即用**：只需在 `apps.config.cjs` 中添加项目配置即可快速接入新应用
- **部署成本低**：多个前端项目共享一个域名，降低服务器和域名成本
- **技术栈兼容高**：支持 SPA（单页应用）、MPA（多页应用）、SSG（静态站点）三种类型
- **路由统一管理**：通过 `/p/:appName` 路径访问各个子项目，入口清晰便于维护
- **自动化构建**：一键构建所有子项目并自动复制到统一的 `dist` 目录

### 技术特性

- 基于 Express 实现反向代理，路由转发灵活可控
- 支持 Vercel 一键部署，无需额外配置
- 内置自动化脚本工具集（构建、安装、清理、复制）
- 静态资源缓存优化，提升访问性能
- 完善的错误处理和 404 页面

## 📁 项目结构

```
express-multi-app-monorepo-template/
├── apps/                    # 前端子项目目录
│   ├── vanilla-spa/         # 原生 JS 单页应用示例
│   ├── vue3-spa/            # Vue 3 单页应用示例
│   ├── react-spa/           # React 单页应用示例
│   ├── webpack-ejs-mpa/     # Webpack + EJS 多页应用示例
│   ├── vuepress-ssg/        # VuePress 文档站点示例
│   ├── vitepress-ssg/       # VitePress 文档站点示例
│   ├── hexo-ssg/            # Hexo 静态博客示例
│   ├── astro-ssg/           # Astro 静态站点示例
│   ├── nuxt4-ssg/           # Nuxt 4 静态站点示例
│   └── next-ssg/            # Next.js 静态站点示例
├── server/                  # Express 服务器
│   ├── src/
│   │   ├── app.js           # Express 应用入口
│   │   ├── routes/          # 路由定义
│   │   ├── handlers/        # 路由处理器（SPA/SSG）
│   │   └── views/           # 视图模板
│   └── public/              # 公共静态资源
├── scripts/                 # 自动化脚本工具集
├── dist/                    # 构建产物统一输出目录（自动生成）
├── apps.config.cjs          # 子项目配置文件
├── consts.js                # 全局常量配置
├── vercel.json              # Vercel 部署配置
└── package.json             # 项目依赖配置
```

## 🛠️ 快速开始

### 环境要求

- Node.js >= 20.x
- pnpm >= 11.x

### 本地开发

```bash
# 1. 克隆仓库
git clone <仓库地址>
cd express-multi-app-monorepo-template

# 2. 构建所有项目（自动安装依赖）
pnpm build

# 3. 启动开发服务器
pnpm dev

# 4. 访问项目
# 主页：http://localhost:3000
# 子项目：http://localhost:3000/p/<appName>
```

### 部署到 Vercel

1. 登录 Vercel 控制台
2. 新建项目，关联你的 GitHub 仓库
3. 无需额外配置，Vercel 会自动读取 `vercel.json`
4. 部署完成后访问 `https://<your-domain>.vercel.app`

## ⚙️ 配置说明

### 子项目配置 (`apps.config.cjs`)

每个子项目需要在 `apps.config.cjs` 中配置以下信息：

**工程化项目**

```js
{
  name: 'my-app',                    // 项目名称（唯一标识，用于路由）
  type: 'spa',                       // 项目类型：spa / mpa / ssg
  entry: 'index.html',               // 入口 HTML 文件
  outputDir: 'apps/my-app/dist',     // 构建产物目录（build 模式）
  installCmd: 'pnpm install',        // 安装命令（可选）
  buildCmd: 'pnpm build',            // 构建命令（可选）
  devCmd: 'pnpm dev'                 // 开发服务器命令（可选）
}
```

**原生项目**

```js
{
  name: 'vanilla-spa',              // 项目名称（唯一标识，用于路由）
  type: 'spa',                      // 项目类型：spa / mpa / ssg
  entry: 'index.html',              // 入口 HTML 文件
  sourceDir: 'apps/vanilla-spa'    // 源文件目录（sourceDir 模式，直接复制源文件）
}
```

**配置注意事项**：

- `name` 字段必须与 `apps/` 目录下的项目文件夹名称**完全一致**
- `server/src/data/apps.meta.js` 中的 `name` 也必须与之一致，否则项目卡片无法正确显示

### 路由前缀配置 (`consts.js`)

默认路由前缀为 `/p`，如需修改：

```javascript
// consts.js
const GLOBAL_ROUTE_PREFIX = '/p' // 修改为你想要的前缀
```

修改后需要同步更新所有子项目的 `baseURL` 配置。

## 📖 路由规则

| 路径          | 说明                                   |
| ------------- | -------------------------------------- |
| `/`           | Express 首页（可自定义或移除）         |
| `/p/:appName` | 子项目入口（自动路由到对应 dist 目录） |
| `/api/*`      | API 接口路由                           |

## 📦 脚本命令

> **📖 详细文档**：[scripts/README.md](scripts/README.md)

### ESM 模块兼容处理

由于前端项目多为 ESM 模块，而 Node.js 默认使用 CommonJS，`scripts/build-all.cjs` 在构建时会自动在 `dist` 目录创建 `package.json` 文件并设置 `{ "type": "module" }`，确保 Vercel 正确识别 ESM 模块：

```javascript
// scripts/build-all.cjs 自动生成
fs.writeFileSync(path.join(mainDistDir, 'package.json'), JSON.stringify({ type: 'module' }))
```

**重要提示**：

- 如果 `apps/` 里的项目需要使用 Node.js 执行脚本（如 `apps.config.cjs` 中配置的 `buildCmd` 等），脚本文件后缀必须使用 `.cjs`（CommonJS 格式）
- **注意**：这仅针对需要 Node.js 执行的脚本，正常的前端 ESM JS 文件（如项目源码）无需改为 `.cjs`
- 使用 `.js` 后缀的 Node.js 脚本会导致 Vercel 识别异常报错，因为根 `dist` 目录的 `package.json` 设置了 `"type": "module"`

### 常用命令示例

```bash
# 首次初始化项目
pnpm build          # 构建所有项目（自动执行 install）
pnpm dev            # 启动开发服务器

# 单项目开发调试
pnpm build:app hexo-ssg   # 构建指定项目
pnpm dev:app hexo-ssg     # 直接启动项目开发服务器

# 只复制已有的构建产物（不重新构建）
pnpm copy           # 复制所有项目到根 dist
pnpm copy:app vue3-spa    # 只复制指定项目

# 清理操作
pnpm clean          # 清空根目录 dist（保留 apps 里的构建产物）
pnpm clean:all      # 清空所有 dist（包括 apps 里的）
pnpm cleanDeep      # 深度清理（含 node_modules 和缓存，解决依赖问题）

# 修复单个项目依赖
pnpm install:app react-spa
pnpm build:app react-spa
```

### 命令分类总览

| 分类     | 命令                      | 说明                               |
| -------- | ------------------------- | ---------------------------------- |
| **构建** | `pnpm build`              | 构建所有项目（自动执行 install）   |
| <br />   | `pnpm build:app <name>`   | 构建指定项目                       |
| **安装** | `pnpm install:all`        | 安装所有项目依赖                   |
| <br />   | `pnpm install:app <name>` | 安装指定项目依赖                   |
| **清理** | `pnpm clean`              | 清空根目录 dist                    |
| <br />   | `pnpm clean:all`          | 清空所有 dist（包括 apps 里的）    |
| <br />   | `pnpm cleanDeep`          | 深度清理（含 node_modules 和缓存） |
| **复制** | `pnpm copy`               | 复制所有构建产物到根 dist          |
| <br />   | `pnpm copy:app <name>`    | 复制指定项目到根 dist              |
| **开发** | `pnpm dev`                | 启动 Express 服务器                |
| <br />   | `pnpm dev:app <name>`     | 启动指定项目的开发服务器           |

## 🎯 适用场景

- **个人作品集**：一个域名展示多个项目作品
- **个人博客**：Hexo/VuePress 等静态博客托管
- **文档站点**：多个项目文档统一管理
- **微前端架构**：多个独立前端应用集成
- **原型展示**：快速展示多个项目原型

## ⚠️ 注意事项

- 所有子项目必须设置正确的 `baseURL`，否则会出现资源加载失败
- 构建产物必须是静态资源，不支持 SSR 服务端渲染
- `apps.config.cjs` 和 `apps.meta.js` 中的 `name` 必须与 `apps/` 目录下的项目文件夹名称一致

## 💡 优缺点分析

### 优点

- **低成本部署**：单域名多应用，节省服务器和域名费用
- **统一管理**：所有项目集中管理，便于维护和更新
- **技术灵活**：支持任意前端技术栈，不受框架限制
- **即开即用**：只需配置 `apps.config.cjs` 即可添加新项目
- **本地开发友好**：支持单独开发调试每个子项目

### 缺点

- **性能依赖 Express**：所有请求经过 Express 代理，无法充分利用 Vercel CDN 加速能力
- **构建时间增长**：项目越多，构建时间越长
- **资源路径依赖**：必须严格配置 `baseURL`
- **无自动扩容**：高流量场景需要手动配置

### Vercel 部署性能分析

#### 当前架构的性能瓶颈

**问题核心**：当前使用 Express 作为路由代理，**所有请求（包括静态资源）都会经过 Express 函数处理**，而不是直接走 Vercel CDN。这会导致：

1. **CDN 能力未利用**：静态资源无法享受到 Vercel CDN 的全球加速和缓存
2. **请求次数累积**：每个请求都计入 Serverless Function 调用次数
3. **并发能力受限**：Express 函数的并发处理能力远低于 CDN
4. **冷启动延迟**：Serverless Function 存在冷启动问题

#### 并发访问能力估算

| 指标             | 估算值       | 说明                            |
| ---------------- | ------------ | ------------------------------- |
| **单函数并发**   | 10-20 req/s  | Vercel Serverless Function 限制 |
| **免费版并发**   | 50-100 req/s | 受限于免费版资源配额            |
| **同时在线用户** | 500-1000     | 基于平均页面浏览量估算          |

#### 缓存策略

当前项目已在 Express 中配置了以下缓存策略：

- **HTML 文件**：强制不缓存，确保用户始终获取最新内容（配置位置：`server/src/routes/static.js` 和 `server/src/handlers/ssg.js`）
  ```javascript
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate')
  res.setHeader('Pragma', 'no-cache')
  res.setHeader('Expires', '0')
  ```
- **静态资源（CSS、JS、图片）**：默认遵循浏览器缓存规则

#### 替代方案

> 待补充

### ⚠️ 重要提示

> **当前方案仅适合个人演示项目，不适合正式商业项目！**
>
> - **适用场景**：个人作品集、技术博客、项目原型、学习 Demo
> - **不适用场景**：企业级应用、高流量网站、电商平台、支付系统
> - **核心原因**：性能受限、资源配额有限、缺乏专业级运维能力

## 🔧 自定义页面

### 自定义首页

默认首页 (`server/src/views/index.html`) 作为项目导航页面。如需移除，注释 `server/src/app.js` 中的 `app.use('/', require('./routes/web'))` 即可。

### 自定义 404 页面

默认 404 页面 (`server/src/views/404.html`) 仅作为演示使用，建议根据实际需求自定义：

- 修改页面样式和内容（只需编辑 `404.html` 文件即可）
- 如作为子项目的兜底 404，建议移除返回首页的链接

## 📄 License

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

---

**提示**：非常适合用作个人介绍页、个人博客、作品集等轻量项目的统一托管方案。
