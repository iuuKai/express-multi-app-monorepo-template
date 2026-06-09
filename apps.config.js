/**
 * 子项目配置
 * @type {Array<{
 * 	 name: string,
 * 	 description: string,
 * 	 type: string,					// 如果是 spa 应用，必须为 'spa'，其他则可空
 * 	 dist: string,					// 默认 "apps/{appName}/dist"
 * 	 entry: string,					// 默认 "dist/index.html"
 * 	 install: string,				// 默认 "pnpm install"
 * 	 build: string,					// 默认 "pnpm build"
 * }>}
 * @property {string} name - 子项目名称
 * @property {string} description - 子项目描述
 * @property {string} type - 子项目类型，可选值：'spa'、'mpa'、'static'
 * @property {string} dist - 子项目构建输出目录
 * @property {string} entry - 子项目入口文件（访问 /p/{appName} 时的渲染的html文件）
 * @property {string} install - 子项目安装依赖命令
 * @property {string} build - 子项目构建命令
 */
module.exports = [
	{
		name: 'demo1',
		description: 'vite 单页面项目演示',
		type: 'spa',
		dist: 'apps/demo1/dist',
		entry: 'index.html',
		install: 'pnpm install',
		build: 'pnpm build'
	},
	{
		name: 'demo2',
		description: 'vite 多页面项目演示',
		type: 'mpa',
		dist: 'apps/demo2/dist',
		entry: 'index.html',
		install: 'pnpm install',
		build: 'pnpm build'
	},
	{
		name: 'demo3',
		description: '纯原生静态项目演示',
		type: 'static',
		dist: 'apps/demo3/dist',
		entry: 'pages/layout.html',
		install: 'pnpm install',
		build: 'node build'
	}
]
