import { FileText } from "lucide-react"
import { PublishForm } from "@/components/PublishForm"

export default function PublishPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:py-14">
      <div className="mb-8">
        <h1 className="flex items-center gap-2 text-2xl font-bold text-foreground sm:text-3xl">
          <FileText className="h-6 w-6 text-accent" />
          发布遥感需求
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          无需注册账号。提交后系统会向您填写的邮箱发送验证链接，确认后需求将公开展示在需求大厅。请保证联系方式真实有效，这是服务方与您对接的唯一渠道。
        </p>
      </div>
      <PublishForm />
    </div>
  )
}
