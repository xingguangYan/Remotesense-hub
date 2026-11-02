export const siteConfig = {
  name: "RemoteSense Hub",
  description: "发布遥感需求，对接专业遥感数据与技术服务",
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

export const CATEGORY_LABELS: Record<DemandCategory, string> = {
  IMAGE_ACQUISITION: "影像获取",
  DATA_PROCESSING: "数据处理",
  MODEL_TRAINING: "模型训练",
  CHANGE_DETECTION: "变化检测",
  THEMATIC_MAPPING: "专题制图",
  OTHER: "其他",
}

export const BUDGETS = [
  "UNDER_10K",
  "BETWEEN_10K_50K",
  "BETWEEN_50K_200K",
  "OVER_200K",
  "NEGOTIABLE",
] as const
export type BudgetRange = (typeof BUDGETS)[number]

export const BUDGET_LABELS: Record<BudgetRange, string> = {
  UNDER_10K: "1万以下",
  BETWEEN_10K_50K: "1–5万",
  BETWEEN_50K_200K: "5–20万",
  OVER_200K: "20万以上",
  NEGOTIABLE: "面议",
}

export const DEMAND_STATUSES = [
  "pending",
  "published",
  "closed",
  "rejected",
] as const
export type DemandStatus = (typeof DEMAND_STATUSES)[number]

export const STATUS_LABELS: Record<DemandStatus, string> = {
  pending: "待验证",
  published: "已发布",
  closed: "已关闭",
  rejected: "已拒绝",
}

export const RATE_LIMITS = {
  publishPerHour: 3,
  inquiryPerHour: 10,
  cooperationPerHour: 5,
}
