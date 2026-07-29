/** @type {import('next').NextConfig} */
const nextConfig = {
  // 云函数/容器部署：输出独立可运行的最小 server，便于打包进 SCF。
  output: "standalone",
  // pg 与 pglite 含原生/WASM 依赖，交给 Node 直接加载，避免被打包器处理。
  serverExternalPackages: ["pg", "@electric-sql/pglite"],
};

export default nextConfig;
