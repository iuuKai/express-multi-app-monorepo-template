const { execSync, spawn } = require('child_process')
const fs = require('fs')
const path = require('path')
const APPS_CONFIG = require('../apps.config.cjs')

// =========================================
// 安装依赖函数
// =========================================
function installDependencies(proj, cwd) {
	console.log(`📦 安装 ${proj.name} 依赖...`)
	const installCmd = proj.install || 'pnpm install'

	try {
		console.log(`📂 工作目录: ${cwd}`)
		console.log(`🔧 执行命令: ${installCmd}`)
		execSync(installCmd, {
			stdio: 'inherit',
			cwd,
			env: { ...process.env, PATH: process.env.PATH }
		})
		console.log(`✅ ${proj.name} 依赖安装完成`)
		return true
	} catch (e) {
		console.log(`❌ ${proj.name} 依赖安装失败: ${e.message || e}`)
		return false
	}
}

// =========================================
// 主函数：开发单个项目
// =========================================
function devSingle(appName) {
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

	if (proj.source) {
		console.log(`\n⏭️ 跳过 ${proj.name}（source 模式不执行 dev）`)
		process.exit(1)
	}

	const rootDir = path.resolve(__dirname, '..')

	console.log(`\n=== 正在启动 ${proj.name} 开发服务器 ===`)

	// 关键：路径必须正确
	const cwd = path.resolve(rootDir, 'apps', proj.name)

	// 验证目录是否存在
	if (!fs.existsSync(cwd)) {
		console.log(`❌ ${proj.name} 的目录不存在: ${cwd}`)
		process.exit(1)
	}

	// 验证 package.json 是否存在
	const packageJsonPath = path.join(cwd, 'package.json')
	if (!fs.existsSync(packageJsonPath)) {
		console.log(`❌ ${proj.name} 的 package.json 不存在: ${packageJsonPath}`)
		process.exit(1)
	}

	// 检查是否有 dev 命令
	const devCmd = proj.devCmd || proj.devCmdCommand
	if (!devCmd) {
		console.log(`❌ ${proj.name} 没有配置 dev 或 devCommand 命令`)
		process.exit(1)
	}

	// 先安装子项目依赖（如果 node_modules 不存在）
	const nodeModulesPath = path.join(cwd, 'node_modules')
	if (!fs.existsSync(nodeModulesPath)) {
		if (!installDependencies(proj, cwd)) {
			console.log(`❌ ${proj.name} 依赖安装失败，无法启动开发服务器`)
			process.exit(1)
		}
	} else {
		console.log(`✅ ${proj.name} 依赖已安装`)
	}

	// 启动开发服务器
	console.log(`\n🚀 启动 ${proj.name} 开发服务器...`)
	console.log(`📂 工作目录: ${cwd}`)
	console.log(`🔧 启动命令: ${devCmd}`)

	const child = spawn(devCmd, [], {
		cwd,
		stdio: 'inherit',
		shell: true,
		env: { ...process.env, PATH: process.env.PATH }
	})

	// 处理进程退出
	child.on('close', code => {
		console.log(`\n🔚 ${proj.name} 开发服务器已退出，退出码: ${code}`)
		process.exit(code)
	})

	child.on('error', err => {
		console.log(`\n❌ ${proj.name} 开发服务器启动失败: ${err.message}`)
		process.exit(1)
	})

	// 监听 Ctrl+C
	process.on('SIGINT', () => {
		console.log(`\n🛑 正在停止 ${proj.name} 开发服务器...`)
		child.kill('SIGINT')
	})
}

// =========================================
// 解析命令行参数
// =========================================
const args = process.argv.slice(2)

if (args.length === 0) {
	console.log('❌ 请指定要开发的项目名称')
	console.log('使用方法: pnpm dev:single <项目名称>')
	console.log('\n可用项目列表:')
	APPS_CONFIG.forEach(p => {
		console.log(`  - ${p.name}`)
	})
	process.exit(1)
}

const appName = args[0]
devSingle(appName)
