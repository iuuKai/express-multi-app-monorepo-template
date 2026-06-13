const fs = require('fs')
const path = require('path')
const APPS_CONFIG = require('../apps.config.cjs')

// 递归删除目录
function deleteDir(dir) {
	if (fs.existsSync(dir)) {
		fs.rmSync(dir, { recursive: true })
	}
}

// 递归复制目录
function copyDir(src, dest) {
	if (!fs.existsSync(dest)) {
		fs.mkdirSync(dest, { recursive: true })
	}

	const entries = fs.readdirSync(src, { withFileTypes: true })

	for (const entry of entries) {
		const srcPath = path.join(src, entry.name)
		const destPath = path.join(dest, entry.name)

		if (entry.isDirectory()) {
			copyDir(srcPath, destPath)
		} else {
			fs.copyFileSync(srcPath, destPath)
		}
	}
}

// =========================================
// 主函数：复制单个项目的构建产物
// =========================================
function copySingle(appName) {
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
	const mainDistDir = path.join(rootDir, 'dist')

	console.log(`\n=== 正在复制 ${proj.name} 构建产物 ===`)

	// 确保主 dist 目录存在
	if (!fs.existsSync(mainDistDir)) {
		fs.mkdirSync(mainDistDir, { recursive: true })
	}

	// source 模式 → 直接复制源文件
	if (proj.sourceDir) {
		const sourcePath = path.resolve(rootDir, proj.sourceDir)
		const targetDist = path.join(mainDistDir, proj.name)

		if (!fs.existsSync(sourcePath)) {
			console.log(`❌ ${proj.name} 的 source 目录不存在: ${sourcePath}`)
			process.exit(1)
		}

		console.log(`📂 源目录: ${sourcePath}`)
		console.log(`📁 目标目录: ${targetDist}`)

		deleteDir(targetDist)
		copyDir(sourcePath, targetDist)
		console.log(`✅ ${proj.name} 复制完成（source 模式）`)
		console.log('🎉 复制完成！')
		return
	}

	// 检查是否有 dist 属性
	if (!proj.outputDir) {
		console.log(`❌ ${proj.name} 没有配置 dist 属性，无法复制`)
		process.exit(1)
	}

	// 根据 dist 属性获取项目构建产物目录
	const subProjDist = path.resolve(rootDir, proj.outputDir)
	const targetDist = path.join(mainDistDir, proj.name)

	console.log(`📂 源目录: ${proj.outputDir}`)
	console.log(`📁 目标目录: ${targetDist}`)

	// 验证项目 dist 是否存在
	if (!fs.existsSync(subProjDist)) {
		console.log(`❌ ${proj.name} 的 dist 目录不存在: ${subProjDist}`)
		console.log(`💡 请先构建项目: pnpm build:app ${proj.name}`)
		process.exit(1)
	}

	// 复制构建产物
	deleteDir(targetDist)
	copyDir(subProjDist, targetDist)
	console.log(`✅ ${proj.name} 复制完成`)

	// 如果是 hexo-ssg 项目，复制自定义的 banner.jpg
	if (proj.name === 'hexo-ssg') {
		const sourceBanner = path.join(rootDir, 'apps', proj.name, 'source/css/images/banner.jpg')
		const targetBanner = path.join(targetDist, 'css/images/banner.jpg')
		if (fs.existsSync(sourceBanner)) {
			console.log(`🔄 复制用户自定义 banner.jpg...`)
			fs.copyFileSync(sourceBanner, targetBanner)
			console.log(`✅ 用户自定义 banner.jpg 已复制`)
		}
	}

	console.log('🎉 复制完成！')
}

// =========================================
// 解析命令行参数
// =========================================
const args = process.argv.slice(2)

if (args.length === 0) {
	console.log('❌ 请指定要复制的项目名称')
	console.log('使用方法: pnpm copy:app <项目名称>')
	console.log('\n可用项目列表:')
	APPS_CONFIG.forEach(p => {
		console.log(`  - ${p.name}`)
	})
	process.exit(1)
}

const appName = args[0]
copySingle(appName)
