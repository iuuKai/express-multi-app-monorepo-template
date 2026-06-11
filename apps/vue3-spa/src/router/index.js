import { createRouter, createWebHistory } from 'vue-router'
import Home from '../pages/Home.vue'
import About from '../pages/About.vue'
import Link from '../pages/Link.vue'

const routes = [
	{ path: '/', component: Home },
	{ path: '/about', component: About },
	{ path: '/link', component: Link }
]

const router = createRouter({
	history: createWebHistory(import.meta.env.BASE_URL),
	routes
})

export default router
