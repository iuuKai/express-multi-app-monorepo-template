// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	compatibilityDate: '2026-06-18',
	devtools: { enabled: true },
	app: {
		baseURL: '/p/nuxt4-ssg/',
		head: {
			title: 'Nuxt4 SSG'
		}
	},
	devServer: {
		port: 4000
	},
	nitro: {
		preset: 'static',
		output: {
			dir: './.output',
			publicDir: './.output/public'
		}
	}
})
