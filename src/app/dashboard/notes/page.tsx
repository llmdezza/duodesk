"use client"

import { useState } from "react"
import useSWR from "swr"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, Pin, PinOff, Trash2, X, CheckCircle2, Circle, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

type Note = {
  id: string
  title: string
  content: string
  isTask: boolean
  completed: boolean
  color: string
  pinned: boolean
  personal: boolean
  createdBy: { id: string; name: string }
  updatedAt: string
}

const NOTE_COLORS = [
  { value: "#fef3c7", label: "Жёлтый" },
  { value: "#dbeafe", label: "Синий" },
  { value: "#dcfce7", label: "Зелёный" },
  { value: "#fce7f3", label: "Розовый" },
  { value: "#f3e8ff", label: "Фиолетовый" },
  { value: "#e0e7ff", label: "Индиго" },
]

type Mode = "all" | "personal" | "shared"

export default function NotesPage() {
  const [mode, setMode] = useState<Mode>("all")
  const modeParam = mode !== "all" ? `?mode=${mode}` : ""
  const { data: notes = [], mutate } = useSWR<Note[]>(`/api/notes${modeParam}`, fetcher, {
    refreshInterval: 5000,
  })
  const [showForm, setShowForm] = useState(false)
  const [newNote, setNewNote] = useState({ title: "", content: "", color: "#fef3c7", isTask: false, personal: false })
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editData, setEditData] = useState({ title: "", content: "" })

  const handleAdd = async () => {
    if (!newNote.title.trim()) return

    await fetch("/api/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newNote),
    })

    setNewNote({ title: "", content: "", color: "#fef3c7", isTask: false, personal: false })
    setShowForm(false)
    mutate()
  }

  const handleTogglePin = async (note: Note) => {
    await fetch(`/api/notes/${note.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pinned: !note.pinned }),
    })
    mutate()
  }

  const handleToggleComplete = async (note: Note) => {
    await fetch(`/api/notes/${note.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed: !note.completed }),
    })
    mutate()
  }

  const handleDelete = async (id: string) => {
    await fetch(`/api/notes/${id}`, { method: "DELETE" })
    mutate()
  }

  const handleStartEdit = (note: Note) => {
    setEditingId(note.id)
    setEditData({ title: note.title, content: note.content })
  }

  const handleSaveEdit = async (id: string) => {
    if (!editData.title.trim()) return

    await fetch(`/api/notes/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editData),
    })

    setEditingId(null)
    mutate()
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Заметки</h1>
        <Button
          size="sm"
          onClick={() => setShowForm(!showForm)}
          className="transition-transform active:scale-95"
        >
          {showForm ? <X className="h-4 w-4 mr-1" /> : <Plus className="h-4 w-4 mr-1" />}
          {showForm ? "Отмена" : "Новая заметка"}
        </Button>
      </div>

      <ModeToggle mode={mode} onChange={setMode} />

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="rounded-xl border border-border bg-card p-4 space-y-3"
          >
            <input
              autoFocus
              type="text"
              placeholder="Название заметки..."
              value={newNote.title}
              onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
              className="w-full text-sm px-3 py-2 rounded-md border border-input bg-background
                focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <textarea
              placeholder="Текст заметки..."
              value={newNote.content}
              onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
              rows={4}
              className="w-full text-sm px-3 py-2 rounded-md border border-input bg-background
                focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            />
            <div className="flex flex-wrap gap-3">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={newNote.isTask}
                  onChange={(e) => setNewNote({ ...newNote, isTask: e.target.checked })}
                  className="rounded-full w-4 h-4 border-input accent-primary"
                />
                Задача
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={newNote.personal}
                  onChange={(e) => setNewNote({ ...newNote, personal: e.target.checked })}
                  className="rounded border-input"
                />
                <Lock className="h-3.5 w-3.5" />
                Личное
              </label>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex gap-1.5">
                {NOTE_COLORS.map((c) => (
                  <button
                    key={c.value}
                    onClick={() => setNewNote({ ...newNote, color: c.value })}
                    className={`w-6 h-6 rounded-full border transition-transform duration-150 ${
                      newNote.color === c.value ? "scale-125 ring-2 ring-ring ring-offset-2 ring-offset-background" : "border-border"
                    }`}
                    style={{ backgroundColor: c.value }}
                    title={c.label}
                  />
                ))}
              </div>
              <Button size="sm" onClick={handleAdd} disabled={!newNote.title.trim()}
                className="transition-transform active:scale-95">
                Сохранить
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <AnimatePresence mode="popLayout">
          {notes.map((note) => (
            <motion.div
              key={note.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              className="group rounded-xl border border-border p-4 transition-shadow hover:shadow-md"
              style={{ backgroundColor: note.color + "30" }}
            >
              {editingId === note.id ? (
                <div className="space-y-2">
                  <input
                    autoFocus
                    type="text"
                    value={editData.title}
                    onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                    onKeyDown={(e) => e.key === "Enter" && handleSaveEdit(note.id)}
                    className="w-full text-sm font-semibold px-2 py-1 rounded border border-input bg-background
                      focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                  <textarea
                    value={editData.content}
                    onChange={(e) => setEditData({ ...editData, content: e.target.value })}
                    rows={3}
                    className="w-full text-sm px-2 py-1 rounded border border-input bg-background
                      focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => handleSaveEdit(note.id)}>Сохранить</Button>
                    <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>Отмена</Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-start justify-between mb-1">
                    <div className="flex items-start gap-2 flex-1 min-w-0">
                      {note.isTask && (
                        <button
                          onClick={() => handleToggleComplete(note)}
                          className="mt-0.5 shrink-0 transition-colors"
                        >
                          {note.completed ? (
                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                          ) : (
                            <Circle className="h-5 w-5 text-muted-foreground/50 hover:text-primary" />
                          )}
                        </button>
                      )}
                      <h3
                        className={`font-semibold text-sm cursor-pointer hover:underline ${
                          note.isTask && note.completed ? "line-through text-muted-foreground" : ""
                        }`}
                        onClick={() => handleStartEdit(note)}
                      >
                        {note.personal && <Lock className="inline h-3 w-3 mr-1 text-muted-foreground" />}
                        {note.title}
                      </h3>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleTogglePin(note)}
                        className="text-muted-foreground hover:text-foreground transition-colors"
                        title={note.pinned ? "Открепить" : "Закрепить"}
                      >
                        {note.pinned ? <PinOff className="h-3.5 w-3.5" /> : <Pin className="h-3.5 w-3.5" />}
                      </button>
                      <button
                        onClick={() => handleDelete(note.id)}
                        className="text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                  {note.pinned && (
                    <Pin className="h-3 w-3 text-muted-foreground mb-1" />
                  )}
                  <p
                    className={`text-xs whitespace-pre-wrap line-clamp-6 cursor-pointer ${
                      note.isTask && note.completed ? "text-muted-foreground/50 line-through" : "text-foreground/80"
                    }`}
                    onClick={() => handleStartEdit(note)}
                  >
                    {note.content || "Пустая заметка"}
                  </p>
                  <p className="text-[10px] text-muted-foreground/60 mt-2">
                    {note.createdBy.name} · {new Date(note.updatedAt).toLocaleDateString("ru-RU")}
                  </p>
                </>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {notes.length === 0 && !showForm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12 text-muted-foreground"
        >
          <p className="text-sm">Пока нет заметок. Создайте первую!</p>
        </motion.div>
      )}
    </div>
  )
}
