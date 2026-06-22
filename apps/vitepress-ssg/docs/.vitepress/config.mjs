import { defineConfig, loadEnv } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, process.cwd(), '')
	return {
		base: env.BASE_URL,
		title: 'VitePress SSG',
		description: 'VitePress SSG',
		themeConfig: {
			nav: [
				{ text: 'Home', link: '/' },
				{ text: 'About', link: '/about.html' },
				{ text: 'Link', link: '/link.html' }
			],
			sidebar: false
		}
	}
})
