"use client"

import { Coffee, Heart } from "lucide-react"
import { useTranslations } from "@/i18n/LocaleProvider"

/** 全站赞赏区：永久免费，欢迎请作者喝杯咖啡（与主站保持一致） */
export function SupportAuthorCN() {
  const { t } = useTranslations()
  const s = t.support

  return (
    <section className="border-t border-border bg-muted/30">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-4 py-10 sm:flex-row sm:gap-10 sm:py-12">
        <div className="flex flex-1 flex-col items-center text-center sm:items-start sm:text-left">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
            <Heart className="h-3 w-3" />
            {s.eyebrow}
          </span>
          <h2 className="mt-3 text-lg font-bold text-foreground sm:text-xl">
            {s.title}
          </h2>
          <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
            {s.desc}
          </p>
          <p className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-primary">
            <Coffee className="h-3.5 w-3.5" />
            {s.action}
          </p>
        </div>
        <div className="shrink-0">
          <div className="rounded-lg border border-border bg-white p-2.5 shadow-sm">
            <img
              src="/reward-qr.png"
              alt={s.qrAlt}
              width={140}
              height={140}
              className="h-[140px] w-[140px] rounded-md object-cover"
            />
          </div>
          <p className="mt-2 text-center text-xs text-muted-foreground">{s.thanks}</p>
        </div>
      </div>
    </section>
  )
}
