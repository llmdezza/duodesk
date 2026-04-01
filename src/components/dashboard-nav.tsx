"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutGrid, Calendar, StickyNote, ShoppingCart, Home } from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/dashboard", label: "Главная", icon: Home },
  { href: "/dashboard/kanban", label: "Канбан", icon: LayoutGrid },
  { href: "/dashboard/calendar", label: "Календарь", icon: Calendar },
  { href: "/dashboard/notes", label: "Заметки", icon: StickyNote },
  { href: "/dashboard/shopping", label: "Покупки", icon: ShoppingCart },
]

export function DashboardSidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden md:flex md:w-56 md:flex-col md:fixed md:inset-y-0 border-r border-border bg-card">
      <div className="flex h-14 items-center px-4 border-b border-border">
        <Link href="/dashboard" className="flex items-center gap-2 font-bold text-lg">
          DuoDesk
        </Link>
      </div>
      <nav className="flex-1 py-4 px-2 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}

export function DashboardBottomNav() {
  const pathname = usePathname()

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 border-t border-border bg-card/95 backdrop-blur-md">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 px-3 py-1 text-xs transition-colors",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground"
              )}
            >
              <item.icon className={cn("h-5 w-5", isActive && "stroke-[2.5]")} />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
