/** @type {import('next').NextConfig} */
const nextConfig = {
	output: "export",
	webpack: (config, { isServer }) => {
		if (isServer) {
			config.externals = [...config.externals, "@google-cloud/spanner"];
		}
		return config;
	},
};

export default nextConfig;
