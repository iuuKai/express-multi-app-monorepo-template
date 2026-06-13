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
// 主函数：清空单个项目的构建产物（只清根 dist，不清 apps 里的 dist）
// =========================================
function cleanSingle(appName) {
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

	console.log(`\n=== 正在清空 ${proj.name} 构建产物（只清根 dist）===`)

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

	// 如果什么都没清空，输出提示
	if (!cleaned) {
		console.log(`\n⚠️ 没有找到任何构建产物需要清空`)
	}

	console.log('\n🎉 清空完成！')
}

// =========================================
// 解析命令行参数
// =========================================
const args = process.argv.slice(2)

if (args.length === 0) {
	console.log('❌ 请指定要清空的项目名称')
	console.log('使用方法: pnpm clean:single <项目名称>')
	console.log('\n可用项目列表:')
	APPS_CONFIG.forEach(p => {
		console.log(`  - ${p.name}`)
	})
	process.exit(1)
}

const appName = args[0]
cleanSingle(appName)
