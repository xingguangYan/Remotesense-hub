import { redirect } from "next/navigation"
import { isAdmin } from "@/lib/admin"
import { AdminLoginForm } from "./AdminLoginForm"
import { siteConfig } from "@/lib/constants"

export const metadata = { title: "管理登录" }

export default async function AdminLoginPage() {
  if (isAdmin()) redirect("/admin")

  return (
    <div className="mx-auto flex max-w-md flex-col justify-center px-4 py-16 sm:py-24">
      <div className="rounded-lg border border-border bg-white p-8 shadow-sm">
        <h1 className="text-xl font-bold text-foreground">
          {siteConfig.name} · 管理后台
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          请输入管理员账号与密码登录。连续尝试失败将被限流。
        </p>
        <div className="mt-6">
          <AdminLoginForm />
        </div>
      </div>
    </div>
  )
}
