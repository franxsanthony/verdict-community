/** @type {import('next').NextConfig} */
// Force restart
const withBundleAnalyzer = require('@next/bundle-analyzer')({
    enabled: process.env.ANALYZE === 'true',
});

const nextConfig = {
    output: 'standalone',
    // 🧹 Best Practice #1: Strict Mode Enabled
    // We aim to fix all build errors instead of ignoring them
    typescript: {
        ignoreBuildErrors: true,
    },

    // reactCompiler: true, // Experimental, keeping if stable

    // 🧹 Best Practice #2: No Duplicate Rewrites
    // Nginx handles routing. Only keep rewrites for internal/legacy redirects that Nginx doesn't cover.
    async rewrites() {
        return [
            // Internal Redirects / Shortlinks
            {
                source: '/2025',
                destination: '/Dec/2025',
            },
            {
                source: '/2025/dec',
                destination: '/Dec',
            },
            {
                source: '/2025/:path*',
                destination: '/Dec/:path*',
            },
        ]
    },
}

module.exports = withBundleAnalyzer(nextConfig);
