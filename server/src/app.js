const { GLOBAL_ROUTE_PREFIX } = require('../../consts')
const express = require('express')
const cors = require('cors')
const path = require('path')
const fs = require('fs')
const app = express()

// 中间件
app.use(cors())
app.use(express.json())

app.use(express.static(path.join(__dirname, 'public'))) // 静态资源托管
app.use('/', require('./routes/web')) // server 自己的页面路由
app.use('/api', require('./api')) // 接口
app.use(GLOBAL_ROUTE_PREFIX, require('./routes/static')) // 前端静态代理
app.use((req, res) => {
	const distDir = path.join(__dirname, '../dist')
	const indexFile = path.join(distDir, 'demo1', 'index.html')

	const diagnostics = [
		{ key: 'server/dist', value: fs.existsSync(distDir) ? 'true' : 'false' },
		{
			key: 'server/dist 文件数量',
			value: fs.existsSync(distDir) ? fs.readdirSync(distDir).length.toString() : '0'
		},
		{ key: 'server/dist/demo1/index.html', value: fs.existsSync(indexFile) ? 'true' : 'false' }
	]

	const html = `<!doctype html>
<html lang="en">
	<head>
		<meta charset="UTF-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1.0" />
		<title>404 Not Found</title>
	</head>
	<body>
		<h1>404 Not Found</h1>
		${diagnostics.map(d => `<div>${d.key}：${d.value}</div>`).join('\n')}
		<a href="/">返回首页</a>
	</body>
</html>`

	res.status(404).send(html)
}) // 404 页面
app.use(require('./middlewares/errorHandler')) // 全局错误处理

module.exports = app
