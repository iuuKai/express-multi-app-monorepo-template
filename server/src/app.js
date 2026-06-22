const { GLOBAL_ROUTE_PREFIX } = require('../../consts')
const express = require('express')
const cors = require('cors')
const path = require('path')
const app = express()

// 中间件
app.use(cors())
app.use(express.json())

app.use(express.static(path.join(__dirname, '../public'))) // 静态资源托管
app.use('/', require('./routes/web')) // server 自己的页面路由
app.use('/api', require('./api')) // 接口
app.use(GLOBAL_ROUTE_PREFIX, require('./routes/static')) // 前端静态代理
app.use((req, res) => {
	res.status(404).sendFile(path.join(__dirname, './views/404.html'))
}) // 404 页面
app.use(require('./middlewares/errorHandler')) // 全局错误处理

module.exports = app
