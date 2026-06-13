const fs = require('fs')
const path = require('path')

// 递归删除目录
function deleteDir(dir) {
	if (fs.existsSync(dir)) {
		fs.rmSync(dir, { recursive: true })
		return true
	}
	return false
}

// =========================================
// 主函数：清空根目录 dist 下的所有构建产物
// =========================================
function clean() {
	const rootDir = path.resolve(__dirname, '..')
	const distDir = path.join(rootDir, 'dist')

	console.log('\n=== 正在清空根目录 dist ===')
	console.log(`📁 目录: ${distDir}`)

	if (!fs.existsSync(distDir)) {
		console.log('⚠️ dist 目录不存在，无需清空')
		console.log('🎉 完成！')
		return
	}

	// 获取 dist 目录下的所有文件和文件夹
	const entries = fs.readdirSync(distDir, { withFileTypes: true })

	if (entries.length === 0) {
		console.log('⚠️ dist 目录为空，无需清空')
		console.log('🎉 完成！')
		return
	}

	let count = 0
	for (const entry of entries) {
		// 跳过 package.json（我们创建的标记文件）
		if (entry.name === 'package.json') {
			continue
		}

		const entryPath = path.join(distDir, entry.name)
		if (deleteDir(entryPath)) {
			console.log(`✅ 已删除: ${entry.name}${entry.isDirectory() ? '/' : ''}`)
			count++
		}
	}

	console.log(`\n📊 共清空 ${count} 个项目`)
	console.log('🎉 完成！')
}

// 执行清空操作
clean()
