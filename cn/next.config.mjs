/** @type {import('next').NextConfig} */
// 国内展示层：纯静态导出，托管在 ModelScope Static SDK + 香港反代
// 不依赖主站运行时，所有数据在主站 CI 构建时写入 cn/public/data/demands.json
const config = {
  output: "export",
  // ModelScope Static 托管支持目录索引（/demands -> demands/index.html），
  // 但不支持无后缀 .html 映射，因此开启 trailingSlash 让导出产物全部落到目录形式
  trailingSlash: true,
  reactStrictMode: true,
  images: { unoptimized: true },
}

export default config
