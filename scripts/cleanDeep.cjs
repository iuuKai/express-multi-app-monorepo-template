const fs = require('fs')
const path = require('path')
const APPS_CONFIG = require('../apps.config.cjs')

function existsPath(path) {
	try {
		fs.lstatSync(path)
		return true
	} catch {
		return false
	}
}

function deleteDir(dir) {
	try {
		const stat = fs.lstatSync(dir)
		if (stat.isSymbolicLink()) {
			fs.unlinkSync(dir)
		} else if (stat.isDirectory()) {
			fs.rmSync(dir, { recursive: true, force: true })
		} else {
			fs.unlinkSync(dir)
		}
		return true
	} catch {
		return false
	}
}

// =========================================
// 主函数：深度清理所有项目（包括 node_modules 和缓存）
// =========================================
function cleanDeep() {
	const rootDir = path.resolve(__dirname, '..')
	const distDir = path.join(rootDir, 'dist')

	console.log('\n=== 正在深度清理所有项目（包括 node_modules 和缓存）===')

	// 记录开始时间
	const startTime = Date.now()

	let totalCount = 0

	// 1. 清空根目录 dist
	console.log(`\n📁 清空根目录 dist: ${distDir}`)
	if (existsPath(distDir)) {
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

	// 2. 深度清理所有 apps
	console.log(`\n📁 深度清理 apps 目录`)
	APPS_CONFIG.forEach(proj => {
		const appRoot = path.join(rootDir, 'apps', proj.name)

		if (!existsPath(appRoot)) {
			console.log(`  ⏭️ ${proj.name} 目录不存在，跳过`)
			return
		}

		console.log(`\n  📦 ${proj.name}:`)

		// 清理 node_modules
		const nodeModulesDir = path.join(appRoot, 'node_modules')
		if (existsPath(nodeModulesDir)) {
			deleteDir(nodeModulesDir)
			console.log(`    ✅ 已删除 node_modules/`)
			totalCount++
		} else {
			console.log(`    ⚠️ node_modules 不存在，跳过`)
		}

		// 清理构建产物目录
		if (proj.outputDir) {
			const projectDist = path.resolve(rootDir, proj.outputDir)
			if (existsPath(projectDist)) {
				deleteDir(projectDist)
				console.log(`    ✅ 已删除 dist: ${proj.outputDir}/`)
				totalCount++
			} else {
				console.log(`    ⚠️ dist 不存在，跳过`)
			}
		}

		// 清理常见缓存目录
		const cacheDirs = ['.next', '.nuxt', '.output', '.vite', 'dist', 'build', '.turbo']
		cacheDirs.forEach(cacheDir => {
			const cachePath = path.join(appRoot, cacheDir)
			if (existsPath(cachePath)) {
				deleteDir(cachePath)
				console.log(`    ✅ 已删除缓存: ${cacheDir}/`)
				totalCount++
			}
		})
	})

	// 记录结束时间并输出耗时
	const endTime = Date.now()
	console.log(`\n⏱️ 总耗时: ${((endTime - startTime) / 1000).toFixed(2)}s`)
	console.log(`📊 共清理 ${totalCount} 个目录`)
	console.log('🎉 深度清理完成！')
}

// 执行清空操作
cleanDeep()
