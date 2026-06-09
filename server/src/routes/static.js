const express = require('express')
const path = require('path')
const fs = require('fs')
const router = express.Router()
const APPS_CONFIG = require('../../../apps.config.cjs')

// HTML 不缓存响应头
const NO_CACHE_HEADERS = {
	'Cache-Control': 'no-cache, no-store, must-revalidate',
	Pragma: 'no-cache',
	Expires: '0'
}

// 禁止 HTML 缓存（sendEntry 已处理入口文件，此处处理其他 HTML 请求）
router.use((req, res, next) => {
	const ext = req.path.split('.').pop()
	if (ext === 'html') {
		res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate')
		res.setHeader('Pragma', 'no-cache')
		res.setHeader('Expires', '0')
	}
	next()
})

// 发送入口文件（统一处理不缓存）
const sendEntry = (res, distPath, entryFile) => {
	res.sendFile(path.join(distPath, entryFile), { headers: NO_CACHE_HEADERS })
}

// 遍历子项目配置注册路由
APPS_CONFIG.forEach(item => {
	const { name, type, entry = 'index.html' } = item

	// 子项目打包后会被复制到 server/dist/{name}/ 目录下
	const distPath = path.join(__dirname, '../../dist', name)
	const entryFile = entry.replace(/^\//, '') // 去除前导斜杠

	// 检查子项目 dist 目录是否存在（可能因为无 build 指令而未打包）
	if (!fs.existsSync(distPath)) {
		console.warn(`⚠️ 子项目 ${name} 的 dist 目录不存在: ${distPath}，已跳过路由注册`)
		return
	}

	// 静态资源放前面 + 关闭自动 index.html ✓ 不影响 Vercel
	router.use(`/${name}`, express.static(distPath, { index: false }))

	// 根路径入口
	router.get(`/${name}`, (req, res) => sendEntry(res, distPath, entryFile))

	// SPA 子路径处理
	if (type === 'spa') {
		const routePattern = new RegExp(`^/${name}/.+$`)
		router.get(routePattern, (req, res) => sendEntry(res, distPath, entryFile))
	}
})

module.exports = router
