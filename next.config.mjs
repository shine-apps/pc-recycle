/** @type {import('next').NextConfig} */
const nextConfig = {
  // pg 与 pglite 含原生/WASM 依赖，交给 Node 直接加载，避免被打包器处理。
  serverExternalPackages: ["pg", "@electric-sql/pglite"],
};

export default nextConfig;
