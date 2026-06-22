# Monorepo 脚本工具集

本文档介绍 express-multi-app-monorepo-template 项目中的自动化脚本工具，用于管理多个子项目的构建、安装、清理和复制操作。

## 快速开始

```bash
# 构建所有项目（会自动执行安装依赖）
pnpm build
# 或者
pnpm build:all

# 启动 express 服务器
pnpm dev
```

## 命令总览

|   分类   | 命令                        | 脚本文件               | 核心职责                                                                        | 适用场景                  |
| :------: | :-------------------------- | :--------------------- | :------------------------------------------------------------------------------ | :------------------------ |
| **构建** | `pnpm build`                | `build-all.cjs`        | 遍历所有 app，执行各自 `buildCommand`，生成子项目 dist                          | 首次部署、全量更新        |
|  <br />  | `pnpm build:app <name>`     | `build-single.cjs`     | 执行指定 app 的 `buildCommand`，生成子项目 dist                                 | 开发调试、单 app 迭代     |
| **安装** | `pnpm install:all`          | `install-all.cjs`      | 遍历所有 app，执行各自 `installCommand`                                         | 初始化项目、全量更新依赖  |
|  <br />  | `pnpm install:app <name>`   | `install-single.cjs`   | 执行指定 app 的 `installCommand`                                                | 新增依赖、单 app 依赖修复 |
| **清理** | `pnpm clean`                | `clean.cjs`            | 清空**根 dist** 目录（不清 apps 里的 dist）                                     | 部署前清理、重新构建      |
|  <br />  | `pnpm clean:app <name>`     | `clean-single.cjs`     | 清空根 dist 中指定 app 的目录（不清 apps 里的 dist）                            | 单 app 调试、局部清理     |
|  <br />  | `pnpm clean:all`            | `clean-all.cjs`        | 清空**所有 dist**（包括根 dist 和 apps 里的 dist）                              | 完全清理、重置环境        |
|  <br />  | `pnpm cleanDeep`            | `cleanDeep.cjs`        | 深度清理：清空所有 dist + **node_modules** + 缓存目录（.next, .nuxt, .vite 等） | 彻底清理、重新初始化      |
|  <br />  | `pnpm cleanDeep:app <name>` | `cleanDeep-single.cjs` | 深度清理单个项目：清空 dist + **node_modules** + 缓存目录                       | 单 app 问题排查、依赖重装 |
| **复制** | `pnpm copy`                 | `copy-all.cjs`         | 将所有 apps 的 dist 拷贝到根 dist                                               | 全量部署、构建后统一发布  |
|  <br />  | `pnpm copy:app <name>`      | `copy-single.cjs`      | 将指定 app 的 dist 拷贝到根 dist                                                | 开发调试、单 app 快速更新 |
| **开发** | `pnpm dev`                  | <br />                 | 启动 express 服务                                                               | 全栈开发、联调测试        |
|  <br />  | `pnpm dev:app <name>`       | `dev-single.cjs`       | 启动指定项目的开发服务器                                                        | 单 app 开发调试           |

## 使用示例

### 场景一：首次初始化项目

```bash
# 1. 构建所有项目
pnpm build

# 2. 启动 express 服务
pnpm dev
```

### 场景二：单项目开发调试

有两种调试方式：

**方式一：直接调试单个项目**

```bash
# 直接启动 hexo-ssg 项目的开发服务器（如 hexo server）
pnpm dev:app hexo-ssg
```

这种方式直接运行项目自身的开发服务器，适合独立调试单个项目。

**方式二：在 express 服务中查看构建产物**

```bash
# 1. 打包 hexo-ssg 项目并复制到根 dist
pnpm build:app hexo-ssg

# 2. 启动 express 服务
pnpm dev
```

这种方式将项目打包后，通过 express 服务的路由访问构建产物。适合在完整项目环境中验证构建结果。

### 场景三：修复单个项目依赖

```bash
# 在 hexo-ssg 项目中安装了新依赖后
pnpm install:app hexo-ssg

# 重新构建
pnpm build:app hexo-ssg
```

### 场景四：部署前清理和构建

```bash
# 方式一：只清理根 dist（保留 apps 里的构建产物）
pnpm clean
pnpm copy

# 方式二：完全清理（包括 apps 里的 dist）
pnpm clean:all
pnpm build
```

### 场景五：只复制已有的构建产物

```bash
# 不重新构建，只复制已有的 dist 到根目录
pnpm copy

# 或者只复制单个项目
pnpm copy:app hexo-ssg
```

### 场景六：清理特定项目的构建产物

```bash
# 清理 hexo-ssg 在根目录的构建产物
pnpm clean:app hexo-ssg

# 清理后重新复制（不重新构建）
pnpm copy:app hexo-ssg
```

### 场景七：深度清理（解决依赖问题）

当项目出现依赖冲突、缓存问题时，使用深度清理：

```bash
# 深度清理所有项目（包括 node_modules 和缓存）
pnpm cleanDeep

# 深度清理单个项目
pnpm cleanDeep:app hexo-ssg

# 深度清理后重新安装和构建
pnpm cleanDeep
pnpm build
```

## 核心概念

### 根目录 dist

- 位置：`express-multi-app-monorepo-template/dist/`
- 用途：作为静态服务器的统一出口，所有子项目的构建产物最终都会复制到这里
- 特点：会被 `.gitignore` 忽略，不提交到版本控制

### apps 目录

- 位置：`express-multi-app-monorepo-template/apps/<app-name>/`
- 用途：存放各个子项目的源码和各自的构建产物
- dist 位置：`apps/<app-name>/public`（以 hexo-ssg 为例）

### apps.config.cjs 配置文件

每个子项目需要在 `apps.config.cjs` 中配置以下信息：

```javascript
{
  name: 'hexo-ssg',                    // 项目名称（唯一标识）
  installCmd: 'pnpm install',          // 安装命令（可选）
  buildCmd: 'hexo clean && hexo generate',  // 构建命令（可选）
  devCmd: 'pnpm server',              // 开发命令（可选）
  outputDir: 'apps/hexo-ssg/public',  // 构建产物目录
  // 或者使用 sourceDir 模式：
  // sourceDir: 'apps/static-site/source'  // 直接复制源文件
}
```

## 常见问题

### Q: 为什么 clean 只清根 dist，不清 apps 里的 dist？

A: 这样的设计是为了保留开发环境中的构建产物，避免每次清理后都需要重新构建。如果需要完全清理，使用 `pnpm clean:all`。

### Q: clean:all 会清空 sourceDir 模式的项目吗？

A: 不会。`clean:all` 会跳过 sourceDir 模式的项目，因为它没有构建产物，只是直接复制源文件。sourceDir 模式的目录通常在项目源码中，清理它们没有意义。

### Q: copy 和 build 有什么区别？

A: `build` 会执行完整的构建流程（安装依赖 → 编译 → 生成产物），而 `copy` 只是将已有的构建产物复制到根目录，速度更快。

### Q: 如何添加新的子项目？

A: 在 `apps.config.cjs` 中添加新的配置项，然后：

```bash
# 如果新项目未安装依赖，需要先安装
pnpm install:app <新项目名>

# 构建新项目, 并复制到根目录
pnpm build:app <新项目名>
```
