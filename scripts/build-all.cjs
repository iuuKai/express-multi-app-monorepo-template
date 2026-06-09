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
// 1. 创建主项目 dist 目录
// =========================================
const rootDir = path.resolve(__dirname, '..')
const mainDistDir = path.join(rootDir, 'dist')

// 确保主 dist 目录存在
if (!fs.existsSync(mainDistDir)) {
	fs.mkdirSync(mainDistDir, { recursive: true })
}

// 创建 package.json 标记为 ES Module
fs.writeFileSync(path.join(mainDistDir, 'package.json'), JSON.stringify({ type: 'module' }))

// =========================================
// 2. 构建所有子项目（你的配置）
// =========================================
console.log('\n📦 开始构建所有子项目...')

APPS_CONFIG.forEach(proj => {
	if (!proj.build) {
		console.log(`\n⏭️ 跳过 ${proj.name}（无 build 配置）`)
		return
	}

	console.log(`\n=== 正在构建：${proj.name} ==`)

	// 关键：路径必须正确
	const cwd = path.resolve(__dirname, '../apps', proj.name)

	// 先安装子项目依赖
	console.log(`📦 安装 ${proj.name} 依赖...`)
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
	execSync(proj.build, {
		stdio: 'inherit',
		cwd
	})

	// 将子项目的构建产物复制到主项目的 dist 目录下
	const subProjDist = path.resolve(rootDir, proj.dist)
	const targetDist = path.join(mainDistDir, proj.name)

	console.log(`📤 复制 ${proj.name} 到主项目 dist/${proj.name}/...`)

	if (fs.existsSync(subProjDist)) {
		deleteDir(targetDist)
		copyDir(subProjDist, targetDist)
		console.log(`✅ ${proj.name} 复制完成`)
	} else {
		console.log(`❌ ${proj.name} 的 dist 目录不存在: ${subProjDist}`)
	}
})

console.log('\n🎉 所有项目构建完成！')
