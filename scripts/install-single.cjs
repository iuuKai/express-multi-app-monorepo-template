const { execSync } = require('child_process')
const path = require('path')
const APPS_CONFIG = require('../apps.config.cjs')

// =========================================
// 主函数：安装单个项目依赖
// =========================================
function installSingle(appName) {
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

	console.log(`\n=== 正在安装 ${proj.name} 依赖 ===`)

	// source 模式 → 不需要安装依赖
	if (proj.source) {
		console.log(`⏭️ ${proj.name} 使用 source 模式，不需要安装依赖`)
		console.log('🎉 安装完成！')
		return
	}

	// 检查是否有 install 命令
	const installCmd = proj.installCmd || 'pnpm install'
	if (!installCmd) {
		console.log(`⏭️ ${proj.name} 没有配置 install 命令，跳过`)
		console.log('🎉 安装完成！')
		return
	}

	// 子项目目录
	const cwd = path.resolve(rootDir, 'apps', proj.name)

	// 验证目录是否存在
	if (!require('fs').existsSync(cwd)) {
		console.log(`❌ ${proj.name} 的目录不存在: ${cwd}`)
		process.exit(1)
	}

	// 验证 package.json 是否存在
	const packageJsonPath = path.join(cwd, 'package.json')
	if (!require('fs').existsSync(packageJsonPath)) {
		console.log(`❌ ${proj.name} 的 package.json 不存在: ${packageJsonPath}`)
		process.exit(1)
	}

	// 执行 install 命令
	console.log(`📂 工作目录: ${cwd}`)
	console.log(`🔧 安装命令: ${installCmd}`)

	try {
		execSync(installCmd, {
			stdio: 'inherit',
			cwd
		})
		console.log(`✅ ${proj.name} 依赖安装完成`)
		console.log('🎉 安装完成！')
	} catch (e) {
		console.log(`❌ ${proj.name} 依赖安装失败`)
		process.exit(1)
	}
}

// =========================================
// 解析命令行参数
// =========================================
const args = process.argv.slice(2)

if (args.length === 0) {
	console.log('❌ 请指定要安装依赖的项目名称')
	console.log('使用方法: pnpm install:single <项目名称>')
	console.log('\n可用项目列表:')
	APPS_CONFIG.forEach(p => {
		console.log(`  - ${p.name}`)
	})
	process.exit(1)
}

const appName = args[0]
installSingle(appName)
