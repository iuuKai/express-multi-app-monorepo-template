const router = require('express').Router()
const path = require('path')
const fs = require('fs')
const { GLOBAL_ROUTE_PREFIX } = require('../../../consts')
const APPS_CONFIG = require('../../../apps.config')

// express 首页
router.get('/', (req, res) => {
	const indexPath = path.join(__dirname, '../views', 'index.html')
	fs.readFile(indexPath, 'utf8', (err, content) => {
		if (err) {
			res.status(500).send('无法读取首页')
			return
		}
		// 生成项目链接 HTML
		const appsLinks = APPS_CONFIG.map(item => {
			const route = `${GLOBAL_ROUTE_PREFIX}/${item.name}`
			return `<a href="${route}" target="_self">
					<div class="apps-item">
						<h3>${item.name}</h3>
						<p>${item.description}</p>
					</div>
				</a>`
		}).join('\n')
		// 替换模板变量
		const html = content.replace('{{apps}}', appsLinks)
		res.send(html)
	})
})

module.exports = router
