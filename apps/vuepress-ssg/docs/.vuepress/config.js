import { defineUserConfig } from 'vuepress'
import { viteBundler } from '@vuepress/bundler-vite'
import { defaultTheme } from '@vuepress/theme-default'
import dotenv from 'dotenv'
import path from 'path'

const envPath = process.argv.includes('build')
	? path.resolve('.env.production')
	: path.resolve('.env')
dotenv.config({ path: envPath })

export default defineUserConfig({
	base: process.env.BASE_URL,
	bundler: viteBundler({
		viteOptions: {
			publicDir: 'public',
			server: { port: 8088 },
			resolve: {
				alias: { '@': './docs/.vuepress' }
			}
		}
	}),
	title: 'VuePress SSG',
	description: 'VuePress SSG',
	theme: defaultTheme({
		navbar: [
			{ text: 'Home', link: '/' },
			{ text: 'About', link: '/about.html' },
			{ text: 'Link', link: '/link.html' }
		],
		sidebar: false
	})
})
