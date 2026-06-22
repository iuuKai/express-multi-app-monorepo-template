/**
 * SPA 子路径路由处理器
 * 所有子路径都返回入口 HTML，由前端路由处理
 */

/**
 * 注册 SPA 子路径路由
 * @param {object} router - Express router
 * @param {string} name - 应用名称
 * @param {string} distPath - 静态资源目录路径
 * @param {string} entryFile - 入口文件名称
 * @param {function} sendEntry - 发送入口文件的函数
 */
module.exports = (router, name, distPath, entryFile, sendEntry) => {
	const routePattern = new RegExp(`^/${name}/.+$`)
	router.get(routePattern, (req, res) => sendEntry(res, distPath, entryFile))
}
