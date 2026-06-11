const fs = require('fs')
const path = require('path')

// 读取 .env 文件
function loadEnv(envFile) {
	const envPath = path.join(__dirname, '..', envFile)
	if (!fs.existsSync(envPath)) {
		return {}
	}

	const envContent = fs.readFileSync(envPath, 'utf-8')
	const env = {}

	envContent.split('\n').forEach(line => {
		const [key, value] = line.split('=')
		if (key && value !== undefined) {
			env[key.trim()] = value.trim()
		}
	})

	return env
}

// 更新 _config.yml 中的 root 配置
function updateConfig(rootPath) {
	const configPath = path.join(__dirname, '..', '_config.yml')
	let configContent = fs.readFileSync(configPath, 'utf-8')

	// 移除旧的 root 配置（如果存在）
	configContent = configContent.replace(/^root:.*$/m, '')

	// 在 URL 部分添加 root 配置
	const urlSection = configContent.match(/# URL[\s\S]*?permalink_defaults:/)
	if (urlSection) {
		const newUrlSection = urlSection[0].replace(
			'permalink_defaults:',
			`root: ${rootPath}\npermalink_defaults:`
		)
		configContent = configContent.replace(urlSection[0], newUrlSection)
	} else {
		// 如果找不到 URL 部分，在 url 配置后添加
		configContent = configContent.replace(/^url:.*$/m, `url: http://example.com\nroot: ${rootPath}`)
	}

	fs.writeFileSync(configPath, configContent)
	console.log(`✓ 已设置 root: ${rootPath}`)
}

// 主函数
function main() {
	// 检查命令行参数或环境变量
	const args = process.argv.slice(2)
	const isProduction = args.includes('--production') || process.env.NODE_ENV === 'production'
	const envFile = isProduction ? '.env.production' : '.env'

	console.log(`📝 使用环境文件: ${envFile}`)

	const env = loadEnv(envFile)
	const baseUrl = env.BASE_URL || '/'

	updateConfig(baseUrl)
}

main()