/** @type {import('next').NextConfig} */
// 国内展示层：纯静态导出，托管在 ModelScope Static SDK + 香港反代
// 不依赖主站运行时，所有数据在主站 CI 构建时写入 cn/public/data/demands.json
const config = {
  output: "export",
  reactStrictMode: true,
  images: { unoptimized: true },
}

export default config
