import { Database, Handshake, Mail, Network } from "lucide-react"
import { CopyEmail } from "@/components/CopyEmail"
import { CooperationForm } from "@/components/CooperationForm"
import { getMessages } from "@/i18n/messages"
import { getLocale } from "@/i18n/server"
import { siteConfig } from "@/lib/constants"

const DIRECTIONS = [
  { key: "data", icon: Database },
  { key: "project", icon: Network },
  { key: "channel", icon: Handshake },
] as const

export default async function CooperationPage() {
  const t = getMessages(getLocale())

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:py-14">
      <section className="relative overflow-hidden rounded-lg border border-border bg-[#0B1B45] p-6 shadow-sm sm:p-10">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.12]"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.6) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
          aria-hidden
        />
        <div className="relative max-w-2xl">
          <h1 className="text-2xl font-bold text-white sm:text-3xl">
            {t.cooperation.title}
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-white/70">
            {t.cooperation.intro}
          </p>
          <div className="mt-5 flex items-center gap-2 rounded-md bg-white/10 px-4 py-3 backdrop-blur">
            <Mail className="h-4 w-4 text-accent" />
            <span className="text-sm font-medium text-white">
              {siteConfig.cooperationEmail}
            </span>
            <CopyEmail email={siteConfig.cooperationEmail} />
          </div>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-bold text-foreground sm:text-xl">
          {t.cooperation.directionsTitle}
        </h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          {DIRECTIONS.map((direction) => {
            const Icon = direction.icon
            const d = t.cooperation.directions[direction.key]
            return (
              <div
                key={direction.key}
                className="rounded-lg border border-border bg-white p-6 shadow-sm"
              >
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-md bg-accent/10 text-accent">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 text-base font-semibold text-foreground">
                  {d.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {d.desc}
                </p>
              </div>
            )
          })}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-bold text-foreground sm:text-xl">
          {t.cooperation.formTitle}
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">{t.cooperation.formDesc}</p>
        <div className="mt-5">
          <CooperationForm />
        </div>
      </section>
    </div>
  )
}
