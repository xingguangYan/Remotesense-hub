import type { Config } from "tailwindcss"

const config: Config = {
  content: ["./src/**/*.{ts,tsx,mdx}"],
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
        sans: [
          "var(--font-inter)",
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
