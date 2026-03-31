"use client"

import useSWR from "swr"
import Link from "next/link"
import { LayoutGrid, Calendar, StickyNote, ShoppingCart } from "lucide-react"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function DashboardPage() {
  const { data: tasks } = useSWR("/api/tasks", fetcher, { refreshInterval: 5000 })
  const { data: events } = useSWR("/api/events?upcoming=true", fetcher, { refreshInterval: 5000 })
  const { data: notes } = useSWR("/api/notes", fetcher, { refreshInterval: 5000 })
  const { data: shopping } = useSWR("/api/shopping", fetcher, { refreshInterval: 5000 })

  const tasksByStatus = {
    todo: tasks?.filter((t: { status: string }) => t.status === "todo")?.length ?? 0,
    in_progress: tasks?.filter((t: { status: string }) => t.status === "in_progress")?.length ?? 0,
    done: tasks?.filter((t: { status: string }) => t.status === "done")?.length ?? 0,
  }

  const uncheckedShopping = shopping?.filter((s: { checked: boolean }) => !s.checked)?.length ?? 0

  const cards = [
    {
      title: "Kanban Board",
      href: "/dashboard/kanban",
      icon: LayoutGrid,
      stat: `${tasksByStatus.todo} to do, ${tasksByStatus.in_progress} in progress`,
      color: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    },
    {
      title: "Calendar",
      href: "/dashboard/calendar",
      icon: Calendar,
      stat: `${events?.length ?? 0} upcoming events`,
      color: "bg-green-500/10 text-green-600 dark:text-green-400",
    },
    {
      title: "Notes",
      href: "/dashboard/notes",
      icon: StickyNote,
      stat: `${notes?.length ?? 0} notes`,
      color: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    },
    {
      title: "Shopping List",
      href: "/dashboard/shopping",
      icon: ShoppingCart,
      stat: `${uncheckedShopping} items to buy`,
      color: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
    },
  ]

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {cards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="group rounded-xl border border-border bg-card p-5 transition-all hover:shadow-md hover:border-primary/20"
          >
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <h2 className="font-semibold group-hover:text-primary transition-colors">
                  {card.title}
                </h2>
                <p className="text-sm text-muted-foreground">{card.stat}</p>
              </div>
              <div className={`rounded-lg p-2.5 ${card.color}`}>
                <card.icon className="h-5 w-5" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
