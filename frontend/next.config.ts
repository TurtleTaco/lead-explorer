import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	experimental: {
		serverActions: {
			bodySizeLimit: '2mb',
		},
	},
	// Ensure middleware uses Node.js runtime for Clerk compatibility
	webpack: (config, { isServer }) => {
		if (isServer) {
			config.externals = [...(config.externals || []), 'bufferutil', 'utf-8-validate'];
		}
		return config;
	},
};

export default nextConfig;
