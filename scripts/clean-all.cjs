const fs = require('fs')
const path = require('path')
const APPS_CONFIG = require('../apps.config.cjs')

// 递归删除目录
function deleteDir(dir) {
	if (fs.existsSync(dir)) {
		fs.rmSync(dir, { recursive: true })
		return true
	}
	return false
}

// =========================================
// 主函数：清空所有构建产物（包括根目录 dist 和 apps 里的 dist）
// =========================================
function cleanAll() {
	const rootDir = path.resolve(__dirname, '..')
	const distDir = path.join(rootDir, 'dist')

	console.log('\n=== 正在清空所有构建产物（包括根目录 dist 和 apps 里的 dist）===')

	// 记录开始时间
	const startTime = Date.now()

	let totalCount = 0

	// 1. 清空根目录 dist
	console.log(`\n📁 清空根目录 dist: ${distDir}`)
	if (fs.existsSync(distDir)) {
		const entries = fs.readdirSync(distDir, { withFileTypes: true })
		let count = 0
		for (const entry of entries) {
			// 跳过 package.json（我们创建的标记文件）
			if (entry.name === 'package.json') {
				continue
			}

			const entryPath = path.join(distDir, entry.name)
			if (deleteDir(entryPath)) {
				console.log(`  ✅ 已删除: ${entry.name}${entry.isDirectory() ? '/' : ''}`)
				count++
			}
		}
		console.log(`  📊 共清空 ${count} 个项目`)
		totalCount += count
	} else {
		console.log(`  ⚠️ dist 目录不存在，跳过`)
	}

	// 2. 清空所有 apps 里的 dist
	console.log(`\n📁 清空 apps 里的 dist`)
	APPS_CONFIG.forEach(proj => {
		// source 模式 → 不需要清空 dist
		if (proj.sourceDir) {
			console.log(`  ⏭️ ${proj.name} 使用 source 模式，跳过`)
			return
		}

		// 检查是否有 dist 属性
		if (!proj.outputDir) {
			console.log(`  ⏭️ ${proj.name} 没有 dist 配置，跳过`)
			return
		}

		// 根据 dist 属性获取项目构建产物目录
		const projectDist = path.resolve(rootDir, proj.outputDir)

		if (fs.existsSync(projectDist)) {
			deleteDir(projectDist)
			console.log(`  ✅ 已清空 ${proj.name} dist: ${proj.outputDir}/`)
			totalCount++
		} else {
			console.log(`  ⚠️ ${proj.name} dist 不存在，跳过`)
		}
	})

	// 记录结束时间并输出耗时
	const endTime = Date.now()
	console.log(`\n⏱️ 总耗时: ${((endTime - startTime) / 1000).toFixed(2)}s`)
	console.log(`📊 共清空 ${totalCount} 个项目`)
	console.log('🎉 完成！')
}

// 执行清空操作
cleanAll()
