/** @type {import('next').NextConfig} */
const nextConfig = {
  // Served under /dashboard so it can sit at budgetiq.org/dashboard (behind the
  // marketing site's proxy). All routes + assets are namespaced under it.
  basePath: "/dashboard",
  reactStrictMode: true,
  images: {
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
};

export default nextConfig;
