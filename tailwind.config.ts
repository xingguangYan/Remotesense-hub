import type { Config } from "tailwindcss"

// 主站与国内展示层(cn/)共用同一份主题。
// content 同时覆盖两个 app，因为 `next build cn` 的 PostCSS 仍以仓库根为 cwd 解析本文件。
const config: Config = {
  content: [
    "./src/**/*.{ts,tsx,mdx}",
    "./cn/app/**/*.{ts,tsx}",
    "./cn/components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#F8FAFC",
        foreground: "#0F172A",
        primary: {
          DEFAULT: "#1E3A8A",
          foreground: "#FFFFFF",
        },
        accent: {
          DEFAULT: "#0EA5E9",
          foreground: "#FFFFFF",
        },
        muted: {
          DEFAULT: "#F1F5F9",
          foreground: "#64748B",
        },
        destructive: {
          DEFAULT: "#DC2626",
          foreground: "#FFFFFF",
        },
        border: "#E2E8F0",
        ring: "#1E3A8A",
      },
      borderRadius: {
        lg: "8px",
        md: "6px",
      },
      fontFamily: {
        // --font-inter 由主站 next/font 注入；展示层未注入时回落到中文字体栈(var 第二参数)
        sans: [
          "var(--font-inter, \"PingFang SC\")",
          "\"PingFang SC\"",
          "\"Hiragino Sans GB\"",
          "\"Microsoft YaHei\"",
          "system-ui",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
}

export default config
