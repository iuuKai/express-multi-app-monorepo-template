const path = require('path')
const fs = require('fs')
const { NO_CACHE_HEADERS } = require('../constants/headers')

/**
 * SSG 子路径路由处理器
 * 优先查找预渲染的静态 HTML 文件，不存在则降级到入口 HTML
 */

/**
 * 注册 SSG 子路径路由
 * @param {object} router - Express router
 * @param {string} name - 应用名称
 * @param {string} distPath - 静态资源目录路径
 * @param {string} entryFile - 入口文件名称
 * @param {function} sendEntry - 发送入口文件的函数
 */
module.exports = (router, name, distPath, entryFile, sendEntry) => {
	const routePattern = new RegExp(`^/${name}/.+$`)
	router.get(routePattern, (req, res) => {
		const subPath = req.path.replace(`/${name}/`, '') || ''
		let staticHtmlPath = ''

		if (subPath.endsWith('/')) {
			const fileName = subPath.slice(0, -1) || 'index'
			const htmlFilePath = path.join(distPath, `${fileName}.html`)
			if (fs.existsSync(htmlFilePath)) {
				staticHtmlPath = htmlFilePath
			} else {
				staticHtmlPath = path.join(distPath, subPath, 'index.html')
			}
		} else if (subPath.endsWith('.html')) {
			staticHtmlPath = path.join(distPath, subPath)
		} else {
			const htmlFilePath = path.join(distPath, `${subPath}.html`)
			if (fs.existsSync(htmlFilePath)) {
				staticHtmlPath = htmlFilePath
			} else {
				staticHtmlPath = path.join(distPath, subPath, 'index.html')
			}
		}

		if (fs.existsSync(staticHtmlPath) && fs.statSync(staticHtmlPath).isFile()) {
			res.sendFile(staticHtmlPath, { headers: NO_CACHE_HEADERS })
		} else {
			sendEntry(res, distPath, entryFile)
		}
	})
}
