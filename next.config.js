/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    // Warning "Invalid Options: useEslintrc, extensions" is internal to
    // Next.js 15 + ESLint 8. Suppressed here until upstream resolves it.
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
