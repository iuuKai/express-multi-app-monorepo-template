const { execSync } = require('child_process')
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
// 主函数：构建单个项目
// =========================================
function buildSingle(appName) {
	// 查找对应的项目配置
	const proj = APPS_CONFIG.find(p => p.name === appName)

	if (!proj) {
		console.log(`❌ 未找到项目: ${appName}`)
		console.log('可用项目列表:')
		APPS_CONFIG.forEach(p => {
			console.log(`  - ${p.name}: ${p.description}`)
		})
		process.exit(1)
	}

	const rootDir = path.resolve(__dirname, '..')
	const mainDistDir = path.join(rootDir, 'dist')

	// 确保主 dist 目录存在
	if (!fs.existsSync(mainDistDir)) {
		fs.mkdirSync(mainDistDir, { recursive: true })
	}

	// 创建 package.json 标记为 ES Module
	fs.writeFileSync(path.join(mainDistDir, 'package.json'), JSON.stringify({ type: 'module' }))

	console.log(`\n=== 正在构建：${proj.name} ==`)
	console.log(`📋 描述: ${proj.description}`)

	// 记录开始时间
	const startTime = Date.now()

	// 如果有 source，直接拷贝源文件到 dist
	if (proj.source) {
		console.log(`\n📤 source 模式：直接复制文件...`)

		const sourcePath = path.resolve(rootDir, proj.source)
		const targetDist = path.join(mainDistDir, proj.name)

		console.log(`复制从 ${proj.source} 到 dist/${proj.name}/...`)

		if (fs.existsSync(sourcePath)) {
			deleteDir(targetDist)
			copyDir(sourcePath, targetDist)
			console.log(`✅ ${proj.name} 复制完成`)
		} else {
			console.log(`❌ ${proj.name} 的 source 目录不存在: ${sourcePath}`)
			process.exit(1)
		}

		// 记录结束时间并输出耗时
		const endTime = Date.now()
		console.log(`⏱️ ${proj.name} 耗时: ${((endTime - startTime) / 1000).toFixed(2)}s`)
		console.log('🎉 构建完成！')
		return
	}

	// 检查是否有 build 命令
	if (!proj.build) {
		console.log(`❌ ${proj.name} 没有配置 build 命令`)
		process.exit(1)
	}

	// 关键：路径必须正确
	const cwd = path.resolve(rootDir, 'apps', proj.name)

	// 先安装子项目依赖
	console.log(`\n📦 安装 ${proj.name} 依赖...`)
	const installCmd = proj.install || 'pnpm install'
	try {
		execSync(installCmd, {
			stdio: 'inherit',
			cwd
		})
		console.log(`✅ ${proj.name} 依赖安装完成`)
	} catch (e) {
		console.log(`⚠️ ${proj.name} 依赖安装失败，但继续构建`)
	}

	// 执行子项目构建命令
	console.log(`\n🔨 执行 ${proj.name} 构建...`)
	try {
		execSync(proj.build, {
			stdio: 'inherit',
			cwd
		})
		console.log(`✅ ${proj.name} 构建完成`)
	} catch (e) {
		console.log(`❌ ${proj.name} 构建失败`)
		process.exit(1)
	}

	// 将子项目的构建产物复制到主项目的 dist 目录下
	const subProjDist = path.resolve(rootDir, proj.dist)
	const targetDist = path.join(mainDistDir, proj.name)

	console.log(`\n📤 复制 ${proj.name} 到主项目 dist/${proj.name}/...`)

	if (fs.existsSync(subProjDist)) {
		deleteDir(targetDist)
		copyDir(subProjDist, targetDist)
		console.log(`✅ ${proj.name} 复制完成`)
	} else {
		console.log(`❌ ${proj.name} 的 dist 目录不存在: ${subProjDist}`)
		process.exit(1)
	}

	// 记录结束时间并输出耗时
	const endTime = Date.now()
	console.log(`\n⏱️ ${proj.name} 耗时: ${((endTime - startTime) / 1000).toFixed(2)}s`)
	console.log('🎉 构建完成！')
}

// =========================================
// 解析命令行参数
// =========================================
const args = process.argv.slice(2)

if (args.length === 0) {
	console.log('❌ 请指定要构建的项目名称')
	console.log('使用方法: pnpm build:single <项目名称>')
	console.log('\n可用项目列表:')
	APPS_CONFIG.forEach(p => {
		console.log(`  - ${p.name}: ${p.description}`)
	})
	process.exit(1)
}

const appName = args[0]
buildSingle(appName)