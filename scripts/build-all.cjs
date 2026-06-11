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
// 临时处理 pnpm-workspace.yaml
// =========================================
const rootDir = path.resolve(__dirname, '..')
const workspacePath = path.join(rootDir, 'pnpm-workspace.yaml')
const backupWorkspacePath = workspacePath + '.backup'

function backupWorkspace() {
	if (fs.existsSync(workspacePath)) {
		fs.renameSync(workspacePath, backupWorkspacePath)
		console.log('📤 临时移除 pnpm-workspace.yaml（防止 workspace 模式干扰子项目安装）')
	}
}

function restoreWorkspace() {
	if (fs.existsSync(backupWorkspacePath)) {
		fs.renameSync(backupWorkspacePath, workspacePath)
		console.log('📥 恢复 pnpm-workspace.yaml')
	}
}

// =========================================
// 1. 创建主项目 dist 目录
// =========================================
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

// 在构建前临时移除 pnpm-workspace.yaml
backupWorkspace()

// 确保在脚本结束时恢复 workspace 配置
process.on('exit', restoreWorkspace)
process.on('SIGINT', restoreWorkspace)
process.on('uncaughtException', restoreWorkspace)

// 记录总开始时间
const startTime = Date.now()

APPS_CONFIG.forEach(proj => {
	if (!proj.build && !proj.source) {
		console.log(`\n⏭️ 跳过 ${proj.name}（无 build 和 source 配置）`)
		return
	}

	// 记录子项目开始时间
	const projStartTime = Date.now()

	// 如果有 source，直接拷贝源文件到 dist
	if (proj.source) {
		console.log(`\n=== 正在处理：${proj.name}（source 模式）==`)

		const sourcePath = path.resolve(rootDir, proj.source)
		const targetDist = path.join(mainDistDir, proj.name)

		console.log(`📤 复制 ${proj.name} 从 ${proj.source} 到 dist/${proj.name}/...`)

		if (fs.existsSync(sourcePath)) {
			deleteDir(targetDist)
			copyDir(sourcePath, targetDist)
			console.log(`✅ ${proj.name} 复制完成`)
		} else {
			console.log(` ${proj.name} 的 source 目录不存在: ${sourcePath}`)
		}

		// 记录结束时间并输出耗时
		const projEndTime = Date.now()
		console.log(`️ ${proj.name} 耗时: ${((projEndTime - projStartTime) / 1000).toFixed(2)}s`)
		return
	}

	console.log(`\n=== 正在构建：${proj.name} ==`)

	// 关键：路径必须正确
	const cwd = path.resolve(rootDir, 'apps', proj.name)

	// 验证目录是否存在
	if (!fs.existsSync(cwd)) {
		console.log(`❌ ${proj.name} 的目录不存在: ${cwd}`)
		return
	}

	// 验证 package.json 是否存在
	const packageJsonPath = path.join(cwd, 'package.json')
	if (!fs.existsSync(packageJsonPath)) {
		console.log(`❌ ${proj.name} 的 package.json 不存在: ${packageJsonPath}`)
		return
	}

	// 先安装子项目依赖
	console.log(`📦 安装 ${proj.name} 依赖...`)
	const installCmd = proj.install || 'pnpm install'

	// 方法1：直接在子项目目录安装（禁用 workspace 模式）
	try {
		console.log(`📂 工作目录: ${cwd}`)
		console.log(`🔧 执行命令: ${installCmd}`)
		const env = {
			...process.env,
			PATH: process.env.PATH,
			PNPM_IGNORED_BUILDS: 'true',
			PNPM_WORKSPACE_CONFIG: '' // 禁用 workspace 配置
		}
		execSync(installCmd, {
			stdio: 'inherit',
			cwd,
			env
		})
		console.log(`✅ ${proj.name} 依赖安装完成`)
	} catch (e) {
		console.log(`⚠️ ${proj.name} 依赖安装失败: ${e.message || e}`)

		// 方法2：尝试使用 --config.workspace=false 禁用 workspace 模式
		try {
			console.log(`🔄 尝试使用 pnpm install --ignore-scripts --config.workspace=false...`)
			execSync('pnpm install --ignore-scripts --config.workspace=false', {
				stdio: 'inherit',
				cwd,
				env: { ...process.env, PATH: process.env.PATH, PNPM_IGNORED_BUILDS: 'true' }
			})
			console.log(`✅ ${proj.name} 依赖安装完成（禁用 workspace）`)
		} catch (e2) {
			console.log(`❌ ${proj.name} 依赖安装失败（禁用 workspace）: ${e2.message || e2}`)

			// 方法3：尝试移除临时的 pnpm-workspace.yaml
			try {
				console.log(`🔄 尝试临时移除 pnpm-workspace.yaml...`)
				const workspacePath = path.join(rootDir, 'pnpm-workspace.yaml')
				const backupWorkspacePath = workspacePath + '.backup'
				if (fs.existsSync(workspacePath)) {
					fs.renameSync(workspacePath, backupWorkspacePath)
				}
				execSync('pnpm install --ignore-scripts', {
					stdio: 'inherit',
					cwd,
					env: { ...process.env, PATH: process.env.PATH, PNPM_IGNORED_BUILDS: 'true' }
				})
				if (fs.existsSync(backupWorkspacePath)) {
					fs.renameSync(backupWorkspacePath, workspacePath)
				}
				console.log(`✅ ${proj.name} 依赖安装完成（临时移除 workspace）`)
			} catch (e3) {
				console.log(`❌ ${proj.name} 依赖安装失败（临时移除 workspace）: ${e3.message || e3}`)
				return
			}
		}
	}

	// 执行子项目构建命令
	console.log(`🔨 执行构建命令: ${proj.build}`)
	try {
		execSync(proj.build, {
			stdio: 'inherit',
			cwd
		})
		console.log(`✅ ${proj.name} 构建完成`)
	} catch (e) {
		console.log(`❌ ${proj.name} 构建失败: ${e.message || e}`)
		throw e
	}

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

	// 记录子项目结束时间并输出耗时
	const projEndTime = Date.now()
	console.log(`⏱️ ${proj.name} 耗时: ${((projEndTime - projStartTime) / 1000).toFixed(2)}s`)
})

// 记录总结束时间并输出总耗时
const endTime = Date.now()
console.log(`\n⏱️ 总构建耗时: ${((endTime - startTime) / 1000).toFixed(2)}s`)
console.log('🎉 所有项目构建完成！')
