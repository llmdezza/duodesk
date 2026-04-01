"use client"

import { useState } from "react"
import useSWR from "swr"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, Trash2, Check, ShoppingCart, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

type ShoppingItem = {
  id: string
  name: string
  quantity: number
  checked: boolean
  category: string | null
  personal: boolean
  createdBy: { id: string; name: string }
}

const CATEGORIES = [
  { key: "Produce", label: "Овощи/Фрукты" },
  { key: "Dairy", label: "Молочное" },
  { key: "Meat", label: "Мясо" },
  { key: "Bakery", label: "Выпечка" },
  { key: "Drinks", label: "Напитки" },
  { key: "Household", label: "Для дома" },
  { key: "Other", label: "Другое" },
]

type Mode = "all" | "personal" | "shared"

export default function ShoppingPage() {
  const [mode, setMode] = useState<Mode>("all")
  const modeParam = mode !== "all" ? `?mode=${mode}` : ""
  const { data: items = [], mutate } = useSWR<ShoppingItem[]>(`/api/shopping${modeParam}`, fetcher, {
    refreshInterval: 3000,
  })
  const [newName, setNewName] = useState("")
  const [newQty, setNewQty] = useState(1)
  const [newCategory, setNewCategory] = useState("")
  const [isPersonal, setIsPersonal] = useState(false)

  const unchecked = items.filter((i) => !i.checked)
  const checked = items.filter((i) => i.checked)

  const handleAdd = async () => {
    if (!newName.trim()) return

    await fetch("/api/shopping", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: newName,
        quantity: newQty,
        category: newCategory || null,
        personal: isPersonal,
      }),
    })

    setNewName("")
    setNewQty(1)
    setNewCategory("")
    setIsPersonal(false)
    mutate()
  }

  const handleToggle = async (item: ShoppingItem) => {
    await fetch(`/api/shopping/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ checked: !item.checked }),
    })
    mutate()
  }

  const handleDelete = async (id: string) => {
    await fetch(`/api/shopping/${id}`, { method: "DELETE" })
    mutate()
  }

  const handleClearChecked = async () => {
    await Promise.all(
      checked.map((item) =>
        fetch(`/api/shopping/${item.id}`, { method: "DELETE" })
      )
    )
    mutate()
  }

  const pluralItems = (n: number) => {
    const mod10 = n % 10
    const mod100 = n % 100
    if (mod10 === 1 && mod100 !== 11) return `${n} товар`
    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return `${n} товара`
    return `${n} товаров`
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Список покупок</h1>
        <span className="text-sm text-muted-foreground">
          {pluralItems(unchecked.length)} к покупке
        </span>
      </div>

      <ModeToggle mode={mode} onChange={setMode} />

      {/* Add item form */}
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Добавить товар..."
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          className="flex-1 text-sm px-3 py-2 rounded-lg border border-input bg-background
            focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <input
          type="number"
          min={1}
          value={newQty}
          onChange={(e) => setNewQty(Number(e.target.value) || 1)}
          className="w-16 text-sm text-center px-2 py-2 rounded-lg border border-input bg-background
            focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <Button onClick={handleAdd} disabled={!newName.trim()}
          className="transition-transform active:scale-95">
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* Category & personal toggle */}
      <div className="flex flex-wrap gap-1.5 items-center">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.key}
            onClick={() => setNewCategory(newCategory === cat.key ? "" : cat.key)}
            className={`text-xs px-2.5 py-1 rounded-full border transition-all duration-150 ${
              newCategory === cat.key
                ? "bg-primary text-primary-foreground border-primary scale-105"
                : "bg-secondary text-secondary-foreground border-border hover:bg-accent"
            }`}
          >
            {cat.label}
          </button>
        ))}
        <button
          onClick={() => setIsPersonal(!isPersonal)}
          className={`text-xs px-2.5 py-1 rounded-full border transition-all duration-150 flex items-center gap-1 ${
            isPersonal
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-secondary text-secondary-foreground border-border hover:bg-accent"
          }`}
        >
          <Lock className="h-3 w-3" />
          Личное
        </button>
      </div>

      {/* Items to buy */}
      <AnimatePresence mode="popLayout">
        {unchecked.length > 0 && (
          <div className="space-y-1">
            {unchecked.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="group flex items-center gap-3 p-3 rounded-lg border border-border bg-card hover:bg-accent/30 transition-colors"
              >
                <button
                  onClick={() => handleToggle(item)}
                  className="w-5 h-5 rounded-full border-2 border-muted-foreground/40 hover:border-primary
                    flex items-center justify-center shrink-0 transition-colors"
                >
                  <Check className="h-3 w-3 opacity-0 group-hover:opacity-30" />
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm font-medium">
                      {item.personal && <Lock className="inline h-3 w-3 mr-1 text-muted-foreground" />}
                      {item.name}
                    </span>
                    {item.quantity > 1 && (
                      <span className="text-xs text-muted-foreground">x{item.quantity}</span>
                    )}
                  </div>
                  <div className="flex gap-2 text-[10px] text-muted-foreground/60">
                    {item.category && <span>{CATEGORIES.find(c => c.key === item.category)?.label || item.category}</span>}
                    <span>{item.createdBy.name}</span>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* Checked items */}
      {checked.length > 0 && (
        <div className="space-y-1">
          <div className="flex items-center justify-between pt-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Куплено ({checked.length})
            </p>
            <button
              onClick={handleClearChecked}
              className="text-xs text-muted-foreground hover:text-destructive transition-colors"
            >
              Очистить
            </button>
          </div>
          <AnimatePresence mode="popLayout">
            {checked.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="group flex items-center gap-3 p-3 rounded-lg border border-border/50 bg-muted/30"
              >
                <button
                  onClick={() => handleToggle(item)}
                  className="w-5 h-5 rounded-full border-2 border-primary bg-primary
                    flex items-center justify-center shrink-0"
                >
                  <Check className="h-3 w-3 text-primary-foreground" />
                </button>
                <span className="text-sm text-muted-foreground line-through flex-1">
                  {item.name}
                  {item.quantity > 1 && ` x${item.quantity}`}
                </span>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {items.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12 text-muted-foreground"
        >
          <ShoppingCart className="h-8 w-8 mx-auto mb-2 opacity-40" />
          <p className="text-sm">Список покупок пуст</p>
        </motion.div>
      )}
    </div>
  )
}
