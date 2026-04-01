"use client"

import { useState, useCallback } from "react"
import useSWR from "swr"
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
} from "@hello-pangea/dnd"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, Trash2, GripVertical, X, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

type Task = {
  id: string
  title: string
  description: string | null
  status: string
  position: number
  personal: boolean
  createdBy: { id: string; name: string }
  createdAt: string
}

const COLUMNS = [
  { id: "todo", title: "Сделать", color: "border-blue-500" },
  { id: "in_progress", title: "В работе", color: "border-amber-500" },
  { id: "done", title: "Готово", color: "border-green-500" },
] as const

type Mode = "all" | "personal" | "shared"

export default function KanbanPage() {
  const [mode, setMode] = useState<Mode>("all")
  const modeParam = mode !== "all" ? `?mode=${mode}` : ""
  const { data: tasks = [], mutate } = useSWR<Task[]>(`/api/tasks${modeParam}`, fetcher, {
    refreshInterval: 3000,
  })
  const [addingTo, setAddingTo] = useState<string | null>(null)
  const [newTitle, setNewTitle] = useState("")
  const [newDesc, setNewDesc] = useState("")
  const [isPersonal, setIsPersonal] = useState(false)

  const tasksByColumn = useCallback(
    (columnId: string) =>
      tasks
        .filter((t) => t.status === columnId)
        .sort((a, b) => a.position - b.position),
    [tasks]
  )

  const handleAdd = async (status: string) => {
    if (!newTitle.trim()) return

    await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newTitle, description: newDesc || null, status, personal: isPersonal }),
    })

    setNewTitle("")
    setNewDesc("")
    setIsPersonal(false)
    setAddingTo(null)
    mutate()
  }

  const handleDelete = async (id: string) => {
    await fetch(`/api/tasks/${id}`, { method: "DELETE" })
    mutate()
  }

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return

    const { draggableId, destination } = result
    const newStatus = destination.droppableId
    const newPosition = destination.index

    const updated = tasks.map((t) => {
      if (t.id === draggableId) {
        return { ...t, status: newStatus, position: newPosition }
      }
      return t
    })

    mutate(updated, false)

    await fetch("/api/tasks/reorder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ taskId: draggableId, newStatus, newPosition }),
    })

    mutate()
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold tracking-tight">Канбан-доска</h1>

      <ModeToggle mode={mode} onChange={setMode} />

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {COLUMNS.map((col) => (
            <div
              key={col.id}
              className={`rounded-xl border-t-4 ${col.color} border border-border bg-card p-3 min-h-[200px]`}
            >
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
                  {col.title}
                  <span className="ml-2 text-xs bg-muted rounded-full px-2 py-0.5">
                    {tasksByColumn(col.id).length}
                  </span>
                </h2>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => {
                    setAddingTo(addingTo === col.id ? null : col.id)
                    setNewTitle("")
                    setNewDesc("")
                    setIsPersonal(false)
                  }}
                >
                  {addingTo === col.id ? (
                    <X className="h-4 w-4" />
                  ) : (
                    <Plus className="h-4 w-4" />
                  )}
                </Button>
              </div>

              <AnimatePresence>
                {addingTo === col.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="mb-3 space-y-2 p-3 rounded-lg border border-border bg-background overflow-hidden"
                  >
                    <input
                      autoFocus
                      type="text"
                      placeholder="Название задачи..."
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleAdd(col.id)}
                      className="w-full text-sm px-2 py-1.5 rounded-md border border-input bg-background
                        focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                    <textarea
                      placeholder="Описание (необязательно)"
                      value={newDesc}
                      onChange={(e) => setNewDesc(e.target.value)}
                      rows={2}
                      className="w-full text-sm px-2 py-1.5 rounded-md border border-input bg-background
                        focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                    />
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isPersonal}
                        onChange={(e) => setIsPersonal(e.target.checked)}
                        className="rounded border-input"
                      />
                      <Lock className="h-3.5 w-3.5" />
                      Личная задача
                    </label>
                    <Button
                      size="sm"
                      className="w-full transition-transform active:scale-[0.98]"
                      onClick={() => handleAdd(col.id)}
                      disabled={!newTitle.trim()}
                    >
                      Добавить
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>

              <Droppable droppableId={col.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`space-y-2 min-h-[80px] rounded-lg transition-colors ${
                      snapshot.isDraggingOver ? "bg-accent/50" : ""
                    }`}
                  >
                    {tasksByColumn(col.id).map((task, index) => (
                      <Draggable
                        key={task.id}
                        draggableId={task.id}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={`group rounded-lg border border-border bg-background p-3 transition-shadow ${
                              snapshot.isDragging ? "shadow-lg ring-2 ring-ring/20" : ""
                            }`}
                          >
                            <div className="flex items-start gap-2">
                              <div
                                {...provided.dragHandleProps}
                                className="mt-0.5 text-muted-foreground/50 hover:text-muted-foreground cursor-grab active:cursor-grabbing"
                              >
                                <GripVertical className="h-4 w-4" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium leading-tight">
                                  {task.personal && <Lock className="inline h-3 w-3 mr-1 text-muted-foreground" />}
                                  {task.title}
                                </p>
                                {task.description && (
                                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                    {task.description}
                                  </p>
                                )}
                                <p className="text-xs text-muted-foreground/60 mt-1.5">
                                  {task.createdBy.name}
                                </p>
                              </div>
                              <button
                                onClick={() => handleDelete(task.id)}
                                className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>
    </div>
  )
}
