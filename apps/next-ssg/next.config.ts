import type { NextConfig } from 'next'

const BASE_URL = '/p/next-ssg'

const nextConfig: NextConfig = {
	/* config options here */
	output: 'export',
	basePath: BASE_URL,
	images: {
		unoptimized: true
	}
}

export default nextConfig
