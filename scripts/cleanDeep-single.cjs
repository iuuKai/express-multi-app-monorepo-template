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
// 主函数：深度清理单个项目（包括 node_modules 和缓存）
// =========================================
function cleanDeepSingle(appName) {
	// 查找对应的项目配置
	const proj = APPS_CONFIG.find(p => p.name === appName)

	if (!proj) {
		console.log(`❌ 未找到项目: ${appName}`)
		console.log('可用项目列表:')
		APPS_CONFIG.forEach(p => {
			console.log(`  - ${p.name}`)
		})
		process.exit(1)
	}

	const rootDir = path.resolve(__dirname, '..')
	const appRoot = path.join(rootDir, 'apps', proj.name)

	console.log(`\n=== 正在深度清理 ${proj.name}（包括 node_modules 和缓存）===`)

	if (!fs.existsSync(appRoot)) {
		console.log(`❌ 项目目录不存在: ${appRoot}`)
		process.exit(1)
	}

	let cleaned = false

	// 1. 清空根目录 dist 下对应的项目
	const rootDistPath = path.join(rootDir, 'dist', proj.name)
	console.log(`\n📁 检查根目录 dist: ${rootDistPath}`)
	if (fs.existsSync(rootDistPath)) {
		deleteDir(rootDistPath)
		console.log(`✅ 已清空根目录 dist/${proj.name}/`)
		cleaned = true
	} else {
		console.log(`⚠️ 根目录 dist/${proj.name}/ 不存在，跳过`)
	}

	// 2. 清理 node_modules
	const nodeModulesDir = path.join(appRoot, 'node_modules')
	console.log(`\n📁 检查 node_modules: ${nodeModulesDir}`)
	if (fs.existsSync(nodeModulesDir)) {
		deleteDir(nodeModulesDir)
		console.log(`✅ 已删除 node_modules/`)
		cleaned = true
	} else {
		console.log(`⚠️ node_modules 不存在，跳过`)
	}

	// 3. 清理构建产物目录
	if (proj.outputDir) {
		const projectDist = path.resolve(rootDir, proj.outputDir)
		console.log(`\n📁 检查构建产物: ${projectDist}`)
		if (fs.existsSync(projectDist)) {
			deleteDir(projectDist)
			console.log(`✅ 已删除 dist: ${proj.outputDir}/`)
			cleaned = true
		} else {
			console.log(`⚠️ dist 不存在，跳过`)
		}
	}

	// 4. 清理常见缓存目录
	const cacheDirs = ['.next', '.nuxt', '.output', '.vite', 'dist', 'build', '.turbo']
	console.log(`\n📁 检查缓存目录:`)
	cacheDirs.forEach(cacheDir => {
		const cachePath = path.join(appRoot, cacheDir)
		if (fs.existsSync(cachePath)) {
			deleteDir(cachePath)
			console.log(`✅ 已删除缓存: ${cacheDir}/`)
			cleaned = true
		}
	})

	// 如果什么都没清空，输出提示
	if (!cleaned) {
		console.log(`\n⚠️ 没有找到任何需要清理的内容`)
	}

	console.log('\n🎉 深度清理完成！')
}

// =========================================
// 解析命令行参数
// =========================================
const args = process.argv.slice(2)

if (args.length === 0) {
	console.log('❌ 请指定要深度清理的项目名称')
	console.log('使用方法: pnpm clean:deep <项目名称>')
	console.log('\n可用项目列表:')
	APPS_CONFIG.forEach(p => {
		console.log(`  - ${p.name}`)
	})
	process.exit(1)
}

const appName = args[0]
cleanDeepSingle(appName)