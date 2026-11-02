import Link from "next/link"
import { Satellite } from "lucide-react"
import { siteConfig } from "@/lib/constants"

const NAV_LINKS = [
  { href: "/", label: "首页" },
  { href: "/demands", label: "需求大厅" },
  { href: "/publish", label: "发布需求" },
  { href: "/cooperation", label: "商务合作" },
  { href: "/about", label: "关于" },
]

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-4">
        <Link href="/" className="flex items-center gap-2 font-bold text-primary">
          <Satellite className="h-6 w-6" />
          <span>{siteConfig.name}</span>
        </Link>
        <nav className="flex items-center gap-1 overflow-x-auto sm:ml-auto">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium text-foreground/80 transition-colors hover:bg-muted hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  )
}
