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
  contactPhone: z
    .string()
    .trim()
    .regex(phoneRegex, "请输入有效的中国大陆手机号（11 位）"),
  contactEmail: z
    .string()
    .trim()
    .email("请输入有效的邮箱地址"),
  company: optionalText(100),
  allowDirectContact: z.boolean().default(true),
  captchaAnswer: z.string().min(1, "请输入验证码"),
})
export type DemandInput = z.infer<typeof demandSchema>

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
  phone: z
    .string()
    .trim()
    .regex(phoneRegex, "请输入有效的中国大陆手机号（11 位）"),
  email: z.string().trim().email("请输入有效的邮箱地址"),
  message: z
    .string()
    .trim()
    .min(10, "请简单介绍您的服务方案（10–500 字）")
    .max(500, "服务方案说明过长（500 字以内）"),
  captchaAnswer: z.string().min(1, "请输入验证码"),
})
export type InquiryInput = z.infer<typeof inquirySchema>

/** 商务合作咨询 */
export const cooperationSchema = z.object({
  name: z.string().trim().min(2, "请填写您的姓名").max(30, "姓名过长"),
  company: optionalText(100),
  phone: z
    .union([z.string().trim().regex(phoneRegex, "请输入有效的中国大陆手机号"), z.literal("")])
    .optional(),
  email: z.string().trim().email("请输入有效的邮箱地址"),
  message: z
    .string()
    .trim()
    .min(10, "请描述您的合作意向（10–1000 字）")
    .max(1000, "合作意向描述过长（1000 字以内）"),
  captchaAnswer: z.string().min(1, "请输入验证码"),
})
export type CooperationInput = z.infer<typeof cooperationSchema>

export const verifyTokenSchema = z.object({
  token: z.string().min(16, "验证链接无效"),
})
