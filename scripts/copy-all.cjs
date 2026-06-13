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
// 主函数：复制所有项目的构建产物
// =========================================
function copyAll() {
	const rootDir = path.resolve(__dirname, '..')
	const mainDistDir = path.join(rootDir, 'dist')

	console.log('\n=== 开始复制所有项目构建产物 ===')

	// 确保主 dist 目录存在
	if (!fs.existsSync(mainDistDir)) {
		fs.mkdirSync(mainDistDir, { recursive: true })
	}

	// 创建 package.json 标记为 ES Module
	fs.writeFileSync(path.join(mainDistDir, 'package.json'), JSON.stringify({ type: 'module' }))

	// 记录开始时间
	const startTime = Date.now()

	// 遍历所有项目配置
	APPS_CONFIG.forEach(proj => {
		console.log(`\n=== 复制 ${proj.name} ===`)

		// source 模式 → 直接复制源文件
		if (proj.sourceDir) {
			const sourcePath = path.resolve(rootDir, proj.sourceDir)
			const targetDist = path.join(mainDistDir, proj.name)

			if (!fs.existsSync(sourcePath)) {
				console.log(`⚠️ ${proj.name} 的 source 目录不存在，跳过`)
				return
			}

			console.log(`📂 源目录: ${sourcePath}`)
			console.log(`📁 目标目录: ${targetDist}`)

			deleteDir(targetDist)
			copyDir(sourcePath, targetDist)
			console.log(`✅ ${proj.name} 复制完成（source 模式）`)
			return
		}

		// 检查是否有 dist 属性
		if (!proj.outputDir) {
			console.log(`⚠️ ${proj.name} 没有配置 dist 属性，跳过`)
			return
		}

		// 根据 dist 属性获取项目构建产物目录
		const subProjDist = path.resolve(rootDir, proj.outputDir)
		const targetDist = path.join(mainDistDir, proj.name)

		console.log(`📂 源目录: ${proj.outputDir}`)
		console.log(`📁 目标目录: ${targetDist}`)

		// 验证项目 dist 是否存在
		if (!fs.existsSync(subProjDist)) {
			console.log(`⚠️ ${proj.name} 的 dist 目录不存在，跳过`)
			console.log(`💡 请先构建项目: pnpm build:app ${proj.name}`)
			return
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
	})

	// 记录结束时间并输出耗时
	const endTime = Date.now()
	console.log(`\n⏱️ 总耗时: ${((endTime - startTime) / 1000).toFixed(2)}s`)
	console.log('🎉 所有项目复制完成！')
}

// 执行复制操作
copyAll()
