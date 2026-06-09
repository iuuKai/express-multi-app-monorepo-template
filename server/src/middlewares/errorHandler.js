module.exports = (err, req, res, next) => {
	console.error(err.stack)
	res.status(500).json({
		code: 500,
		msg: '服务器错误'
	})
}
