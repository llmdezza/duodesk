"use client"

import useSWR from "swr"
import Link from "next/link"
import { motion } from "framer-motion"
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
      title: "Канбан-доска",
      href: "/dashboard/kanban",
      icon: LayoutGrid,
      stat: `${tasksByStatus.todo} сделать, ${tasksByStatus.in_progress} в работе`,
      color: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    },
    {
      title: "Календарь",
      href: "/dashboard/calendar",
      icon: Calendar,
      stat: `${events?.length ?? 0} предстоящих событий`,
      color: "bg-green-500/10 text-green-600 dark:text-green-400",
    },
    {
      title: "Заметки",
      href: "/dashboard/notes",
      icon: StickyNote,
      stat: `${notes?.length ?? 0} заметок`,
      color: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    },
    {
      title: "Список покупок",
      href: "/dashboard/shopping",
      icon: ShoppingCart,
      stat: `${uncheckedShopping} товаров к покупке`,
      color: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
    },
  ]

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Главная</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {cards.map((card, i) => (
          <motion.div
            key={card.href}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.08 }}
          >
            <Link
              href={card.href}
              className="group block rounded-xl border border-border bg-card p-5 transition-all hover:shadow-md hover:border-primary/20 hover:scale-[1.02] active:scale-[0.98]"
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
          </motion.div>
        ))}
      </div>
    </div>
  )
}
