import { z } from "zod"
import { BUDGETS, DEMAND_CATEGORIES } from "./constants"

const phoneRegex = /^1[3-9]\d{9}$/

const budgetField = z
  .union([z.enum(BUDGETS), z.literal("")])
  .optional()

const optionalText = (max: number) =>
  z
    .string()
    .max(max)
    .optional()
    .transform((v) => (v === undefined ? "" : v.trim()))

/** 手机号：选填，填写时须为 11 位中国大陆号码 */
const optionalPhone = z
  .string()
  .trim()
  .max(11)
  .optional()
  .transform((v) => (v ?? "").trim())
  .refine((v) => v === "" || phoneRegex.test(v), "请输入有效的中国大陆手机号（11 位）")

/** 邮箱：选填，填写时须为合法邮箱 */
const optionalEmail = z
  .string()
  .max(120)
  .optional()
  .transform((v) => (v ?? "").trim())
  .refine((v) => v === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), "请输入有效的邮箱地址")

/** 日期：选填，YYYY-MM-DD */
const optionalDate = z
  .string()
  .trim()
  .max(10)
  .optional()
  .transform((v) => (v ?? "").trim())
  .refine(
    (v) => v === "" || /^\d{4}-\d{2}-\d{2}$/.test(v),
    "日期格式无效，应为 YYYY-MM-DD",
  )

/** 至少一项联系方式（发布 / 咨询 / 合作通用） */
function requireOneContact<T extends Record<string, unknown>>(
  phoneKey: keyof T,
  emailKey: keyof T,
) {
  return (val: T, ctx: z.RefinementCtx) => {
    if (!val[phoneKey] && !val[emailKey]) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: [phoneKey as string],
        message: "手机号与邮箱至少填写一项",
      })
    }
  }
}

/** 发布需求：三步表单汇总 */
export const demandSchema = z.object({
  title: z
    .string()
    .trim()
    .min(10, "标题需为 10–80 字")
    .max(80, "标题需为 10–80 字"),
  category: z.enum(DEMAND_CATEGORIES, { message: "请选择需求类型" }),
  region: z
    .string()
    .trim()
    .min(2, "请填写目标区域")
    .max(100, "区域描述过长"),
  area: optionalText(200),
  resolution: optionalText(50),
  timeRange: z
    .string()
    .trim()
    .min(2, "请填写时间要求")
    .max(100, "时间要求过长"),
  startAt: optionalDate,
  deadlineAt: optionalDate,
  budget: budgetField,
  description: z
    .string()
    .trim()
    .min(50, "详细描述需为 50–2000 字")
    .max(2000, "详细描述需为 50–2000 字"),
  contactName: z
    .string()
    .trim()
    .min(2, "请填写联系人称呼")
    .max(30, "称呼过长"),
  contactPhone: optionalPhone,
  contactEmail: optionalEmail,
  company: optionalText(100),
  allowDirectContact: z.boolean().default(true),
  captchaAnswer: z.string().min(1, "请输入验证码"),
}).superRefine(requireOneContact<DemandInputShape>("contactPhone", "contactEmail"))
  .superRefine((val, ctx) => {
    if (val.startAt && val.deadlineAt && val.deadlineAt < val.startAt) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["deadlineAt"],
        message: "截止时间不能早于开始时间",
      })
    }
  })
export type DemandInput = z.infer<typeof demandSchema>
type DemandInputShape = {
  contactPhone: string
  contactEmail: string
}

/** 管理链接：编辑需求（联系方式不可改） */
export const manageEditSchema = z.object({
  title: z.string().trim().min(10, "标题需为 10–80 字").max(80, "标题需为 10–80 字"),
  category: z.enum(DEMAND_CATEGORIES, { message: "请选择需求类型" }),
  region: z.string().trim().min(2, "请填写目标区域").max(100, "区域描述过长"),
  area: optionalText(200),
  resolution: optionalText(50),
  timeRange: z.string().trim().min(2, "请填写时间要求").max(100, "时间要求过长"),
  budget: budgetField,
  description: z
    .string()
    .trim()
    .min(50, "详细描述需为 50–2000 字")
    .max(2000, "详细描述需为 50–2000 字"),
})
export type ManageEditInput = z.infer<typeof manageEditSchema>

/** 服务方咨询 */
export const inquirySchema = z.object({
  name: z.string().trim().min(2, "请填写您的称呼").max(30, "称呼过长"),
  phone: optionalPhone,
  email: optionalEmail,
  message: z
    .string()
    .trim()
    .min(10, "请简单介绍您的服务方案（10–500 字）")
    .max(500, "服务方案说明过长（500 字以内）"),
  captchaAnswer: z.string().min(1, "请输入验证码"),
}).superRefine(requireOneContact<InquiryInputShape>("phone", "email"))
export type InquiryInput = z.infer<typeof inquirySchema>
type InquiryInputShape = {
  phone: string
  email: string
}

/** 商务合作咨询 */
export const cooperationSchema = z.object({
  name: z.string().trim().min(2, "请填写您的姓名").max(30, "姓名过长"),
  company: optionalText(100),
  phone: optionalPhone,
  email: optionalEmail,
  message: z
    .string()
    .trim()
    .min(10, "请描述您的合作意向（10–1000 字）")
    .max(1000, "合作意向描述过长（1000 字以内）"),
  captchaAnswer: z.string().min(1, "请输入验证码"),
}).superRefine(requireOneContact<CooperationInputShape>("phone", "email"))
export type CooperationInput = z.infer<typeof cooperationSchema>
type CooperationInputShape = {
  phone: string
  email: string
}

export const verifyTokenSchema = z.object({
  token: z.string().min(16, "验证链接无效"),
})
