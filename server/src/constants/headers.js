// HTML 不缓存响应头
module.exports = {
	NO_CACHE_HEADERS: {
		'Cache-Control': 'no-cache, no-store, must-revalidate',
		Pragma: 'no-cache',
		Expires: '0'
	}
}