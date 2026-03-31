"use client"

import { useState } from "react"
import useSWR from "swr"
import { Plus, Trash2, Check, ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

type ShoppingItem = {
  id: string
  name: string
  quantity: number
  checked: boolean
  category: string | null
  createdBy: { id: string; name: string }
}

const CATEGORIES = ["Produce", "Dairy", "Meat", "Bakery", "Drinks", "Household", "Other"]

export default function ShoppingPage() {
  const { data: items = [], mutate } = useSWR<ShoppingItem[]>("/api/shopping", fetcher, {
    refreshInterval: 3000,
  })
  const [newName, setNewName] = useState("")
  const [newQty, setNewQty] = useState(1)
  const [newCategory, setNewCategory] = useState("")

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
      }),
    })

    setNewName("")
    setNewQty(1)
    setNewCategory("")
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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Shopping List</h1>
        <span className="text-sm text-muted-foreground">
          {unchecked.length} item{unchecked.length !== 1 ? "s" : ""} to buy
        </span>
      </div>

      {/* Add item form */}
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Add item..."
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
        <Button onClick={handleAdd} disabled={!newName.trim()}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* Category quick-add */}
      <div className="flex flex-wrap gap-1.5">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setNewCategory(newCategory === cat ? "" : cat)}
            className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
              newCategory === cat
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-secondary text-secondary-foreground border-border hover:bg-accent"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Items to buy */}
      {unchecked.length > 0 && (
        <div className="space-y-1">
          {unchecked.map((item) => (
            <div
              key={item.id}
              className="group flex items-center gap-3 p-3 rounded-lg border border-border bg-card hover:bg-accent/30 transition-colors"
            >
              <button
                onClick={() => handleToggle(item)}
                className="w-5 h-5 rounded border-2 border-muted-foreground/40 hover:border-primary
                  flex items-center justify-center shrink-0 transition-colors"
              >
                <Check className="h-3 w-3 opacity-0 group-hover:opacity-30" />
              </button>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2">
                  <span className="text-sm font-medium">{item.name}</span>
                  {item.quantity > 1 && (
                    <span className="text-xs text-muted-foreground">x{item.quantity}</span>
                  )}
                </div>
                <div className="flex gap-2 text-[10px] text-muted-foreground/60">
                  {item.category && <span>{item.category}</span>}
                  <span>{item.createdBy.name}</span>
                </div>
              </div>
              <button
                onClick={() => handleDelete(item.id)}
                className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Checked items */}
      {checked.length > 0 && (
        <div className="space-y-1">
          <div className="flex items-center justify-between pt-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Bought ({checked.length})
            </p>
            <button
              onClick={handleClearChecked}
              className="text-xs text-muted-foreground hover:text-destructive transition-colors"
            >
              Clear all
            </button>
          </div>
          {checked.map((item) => (
            <div
              key={item.id}
              className="group flex items-center gap-3 p-3 rounded-lg border border-border/50 bg-muted/30"
            >
              <button
                onClick={() => handleToggle(item)}
                className="w-5 h-5 rounded border-2 border-primary bg-primary
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
            </div>
          ))}
        </div>
      )}

      {items.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <ShoppingCart className="h-8 w-8 mx-auto mb-2 opacity-40" />
          <p className="text-sm">Shopping list is empty</p>
        </div>
      )}
    </div>
  )
}
