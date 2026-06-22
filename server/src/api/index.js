const router = require('express').Router()
const fs = require('fs')

// 自动加载当前目录下所有 .js 接口文件
fs.readdirSync(__dirname).forEach(file => {
	if (file !== 'index.js') {
		const name = file.replace('.js', '')
		router.use(`/${name}`, require(`./${file}`))
	}
})

module.exports = router
