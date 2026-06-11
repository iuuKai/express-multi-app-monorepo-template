/**
 * 子项目配置
 * @type {Array<{
 * 	 name: string,
 * 	 description: string,
 * 	 type: string,					// 如果是 spa 应用，必须为 'spa'；如果是 ssg，必须为 'ssg'；其他则可空（不区分大小写）
 * 	 dist: string,					// 默认 "apps/{appName}/dist"
 * 	 source: string,				// 源文件目录（用于纯静态项目，直接拷贝，不执行 build）
 * 	 entry: string,					// 默认 "dist/index.html"
 * 	 install: string,				// 默认 "pnpm install"
 * 	 build: string,					// 默认 "pnpm build"
 * }>}
 * @property {string} name - 子项目名称
 * @property {string} description - 子项目描述
 * @property {string} type - 子项目类型，可选值：'spa'、'ssg'、'mpa'、'static'（不区分大小写），不支持 'ssr' 类型
 * @property {string} dist - 子项目构建输出目录（与 source 二选一）
 * @property {string} source - 源文件目录（与 dist 二选一，用于纯静态项目，直接拷贝源文件到 dist，不执行 build）
 * @property {string} entry - 子项目入口文件（访问 /p/{appName} 时的渲染的html文件）
 * @property {string} install - 子项目安装依赖命令（可选，source 模式下通常不需要）
 * @property {string} build - 子项目构建命令（可选，source 模式下不执行）
 */
module.exports = [
	{
		name: 'vanilla-spa',
		description: '纯原生单页面项目',
		type: 'spa',
		source: 'apps/vanilla-spa',
		entry: 'index.html'
	},
	{
		name: 'webpack-ejs-mpa',
		description: 'webpack 多页面项目',
		type: 'mpa',
		dist: 'apps/webpack-ejs-mpa/dist',
		entry: 'home/index.html',
		install: 'pnpm install',
		build: 'pnpm build'
	},
	{
		name: 'vue3-spa',
		description: 'vue 单页面项目',
		type: 'spa',
		dist: 'apps/vue3-spa/dist',
		entry: 'index.html',
		install: 'pnpm install',
		build: 'pnpm build'
	},
	{
		name: 'react-spa',
		description: 'react 单页面项目',
		type: 'spa',
		dist: 'apps/react-spa/dist',
		entry: 'index.html',
		install: 'pnpm install',
		build: 'pnpm build'
	},
	{
		name: 'hexo-ssg',
		description: 'hexo 静态博客项目',
		type: 'ssg',
		dist: 'apps/hexo-ssg/public',
		entry: 'index.html',
		install: 'pnpm install --ignore-scripts',
		build: 'pnpm build'
	}
]
