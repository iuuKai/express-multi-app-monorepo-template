/**
 * 子项目配置
 * @typedef {Object} AppConfig
 * @property {string} name - 子项目唯一标识（用于路由/脚本区分）
 * @property {'spa' | 'ssg' | 'mpa' } type - 项目类型（不区分大小写，不支持 ssr）
 *  - spa: 单页应用
 *  - ssg: 静态站点
 *  - mpa: 多页应用
 * @property {string} entry - 入口 HTML 文件（访问 `/p/{appName}` 时渲染的文件）
 *  通常为 `index.html`
 * @property {string} [sourceDir] - 源文件目录（与 outputDir 二选一）
 *  直接拷贝源文件到 dist，不执行 buildCmd 命令
 * @property {string} [outputDir] - 构建输出目录（与 sourceDir 二选一）
 *  通常为 `apps/{appName}/dist`
 * @property {string} [installCmd] - 依赖安装命令（sourceDir 模式下不执行）
 *  通常为 `pnpm install`
 * @property {string} [buildCmd] - 构建命令（sourceDir 模式下不执行）
 *  通常为 `pnpm build`
 * @property {string} [devCmd] - 开发服务器命令（可选，sourceDir 模式下不执行）
 *  通常为 `pnpm server`
 * @type {AppConfig[]}
 */
module.exports = [
	{
		name: 'vanilla-spa',
		type: 'spa',
		entry: 'index.html',
		sourceDir: 'apps/vanilla-spa'
	},
	{
		name: 'webpack-ejs-mpa',
		type: 'mpa',
		entry: 'home/index.html',
		outputDir: 'apps/webpack-ejs-mpa/dist',
		installCmd: 'pnpm install',
		buildCmd: 'pnpm build',
		devCmd: 'pnpm dev'
	},
	{
		name: 'vue3-spa',
		type: 'spa',
		entry: 'index.html',
		outputDir: 'apps/vue3-spa/dist',
		installCmd: 'pnpm install',
		buildCmd: 'pnpm build',
		devCmd: 'pnpm dev'
	},
	{
		name: 'react-spa',
		type: 'spa',
		entry: 'index.html',
		outputDir: 'apps/react-spa/dist',
		installCmd: 'pnpm install',
		buildCmd: 'pnpm build',
		devCmd: 'pnpm dev'
	},
	{
		name: 'vuepress-ssg',
		type: 'ssg',
		entry: 'index.html',
		outputDir: 'apps/vuepress-ssg/docs/.vuepress/dist',
		installCmd: 'pnpm install',
		buildCmd: 'pnpm docs:build',
		devCmd: 'pnpm docs:dev'
	},
	{
		name: 'vitepress-ssg',
		type: 'ssg',
		entry: 'index.html',
		outputDir: 'apps/vitepress-ssg/docs/.vitepress/dist',
		installCmd: 'pnpm approve-builds && pnpm install',
		buildCmd: 'pnpm docs:build',
		devCmd: 'pnpm docs:dev'
	},
	{
		name: 'hexo-ssg',
		type: 'ssg',
		entry: 'index.html',
		outputDir: 'apps/hexo-ssg/public',
		installCmd: 'pnpm install --ignore-scripts',
		buildCmd: 'pnpm build',
		devCmd: 'pnpm server'
	},
	{
		name: 'astro-ssg',
		type: 'ssg',
		entry: 'index.html',
		outputDir: 'apps/astro-ssg/dist',
		installCmd: 'pnpm install',
		buildCmd: 'pnpm build',
		devCmd: 'pnpm dev'
	},
	{
		name: 'nuxt4-ssg',
		type: 'ssg',
		entry: 'index.html',
		outputDir: 'apps/nuxt4-ssg/.output/public',
		installCmd: 'pnpm install',
		buildCmd: 'pnpm generate',
		devCmd: 'pnpm dev'
	},
	{
		name: 'next-ssg',
		type: 'ssg',
		entry: 'index.html',
		outputDir: 'apps/next-ssg/out',
		installCmd: 'pnpm install',
		buildCmd: 'pnpm build',
		devCmd: 'pnpm dev'
	}
]
