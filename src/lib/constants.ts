import { type Locale } from "@/i18n/messages"

export const siteConfig = {
  name: "RemoteSense Hub",
  // 商务合作邮箱走环境变量，不硬编码
  cooperationEmail:
    process.env.COOPERATION_EMAIL || "xingguangyan0703@gmail.com",
}

export const DEMAND_CATEGORIES = [
  "IMAGE_ACQUISITION",
  "DATA_PROCESSING",
  "MODEL_TRAINING",
  "CHANGE_DETECTION",
  "THEMATIC_MAPPING",
  "OTHER",
] as const
export type DemandCategory = (typeof DEMAND_CATEGORIES)[number]

export const CATEGORY_LABELS: Record<Locale, Record<DemandCategory, string>> = {
  zh: {
    IMAGE_ACQUISITION: "影像获取",
    DATA_PROCESSING: "数据处理",
    MODEL_TRAINING: "模型训练",
    CHANGE_DETECTION: "变化检测",
    THEMATIC_MAPPING: "专题制图",
    OTHER: "其他",
  },
  en: {
    IMAGE_ACQUISITION: "Image Acquisition",
    DATA_PROCESSING: "Data Processing",
    MODEL_TRAINING: "Model Training",
    CHANGE_DETECTION: "Change Detection",
    THEMATIC_MAPPING: "Thematic Mapping",
    OTHER: "Other",
  },
}

export const BUDGETS = [
  "UNDER_10K",
  "BETWEEN_10K_50K",
  "BETWEEN_50K_200K",
  "OVER_200K",
  "NEGOTIABLE",
] as const
export type BudgetRange = (typeof BUDGETS)[number]

export const DEMAND_STATUSES = ["pending", "published", "closed", "rejected"] as const
export type DemandStatus = (typeof DEMAND_STATUSES)[number]

export const BUDGET_LABELS: Record<Locale, Record<BudgetRange, string>> = {
  zh: {
    UNDER_10K: "1万以下",
    BETWEEN_10K_50K: "1–5万",
    BETWEEN_50K_200K: "5–20万",
    OVER_200K: "20万以上",
    NEGOTIABLE: "面议",
  },
  en: {
    UNDER_10K: "< ¥10k",
    BETWEEN_10K_50K: "¥10k–50k",
    BETWEEN_50K_200K: "¥50k–200k",
    OVER_200K: "> ¥200k",
    NEGOTIABLE: "Negotiable",
  },
}

export const RATE_LIMITS = {
  publishPerHour: 3,
  inquiryPerHour: 10,
  cooperationPerHour: 5,
}

/** 错误码 → 本地化文案（客户端用，服务端错误体里带 code） */
export type LocalizableErrorCode = keyof import("@/i18n/messages").Messages["errors"]
