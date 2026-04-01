"use client"

import { Lock, Users } from "lucide-react"

type Mode = "all" | "personal" | "shared"

const MODES = [
  { key: "all" as const, label: "Все", icon: null },
  { key: "shared" as const, label: "Общее", icon: Users },
  { key: "personal" as const, label: "Личное", icon: Lock },
]

export function ModeToggle({ mode, onChange }: { mode: Mode; onChange: (m: Mode) => void }) {
  return (
    <div className="flex gap-1 p-1 rounded-lg bg-muted">
      {MODES.map((m) => (
        <button
          key={m.key}
          onClick={() => onChange(m.key)}
          className={`flex-1 flex items-center justify-center gap-1.5 text-sm py-1.5 px-3 rounded-md transition-all duration-200 ${
            mode === m.key
              ? "bg-background text-foreground shadow-sm font-medium scale-[1.02]"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {m.icon && <m.icon className="h-3.5 w-3.5" />}
          {m.label}
        </button>
      ))}
    </div>
  )
}
