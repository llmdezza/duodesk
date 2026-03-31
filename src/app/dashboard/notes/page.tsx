"use client"

import { useState } from "react"
import useSWR from "swr"
import { Plus, Pin, PinOff, Trash2, X } from "lucide-react"
import { Button } from "@/components/ui/button"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

type Note = {
  id: string
  title: string
  content: string
  color: string
  pinned: boolean
  createdBy: { id: string; name: string }
  updatedAt: string
}

const NOTE_COLORS = [
  { value: "#fef3c7", label: "Yellow" },
  { value: "#dbeafe", label: "Blue" },
  { value: "#dcfce7", label: "Green" },
  { value: "#fce7f3", label: "Pink" },
  { value: "#f3e8ff", label: "Purple" },
  { value: "#e0e7ff", label: "Indigo" },
]

export default function NotesPage() {
  const { data: notes = [], mutate } = useSWR<Note[]>("/api/notes", fetcher, {
    refreshInterval: 5000,
  })
  const [showForm, setShowForm] = useState(false)
  const [newNote, setNewNote] = useState({ title: "", content: "", color: "#fef3c7" })
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editData, setEditData] = useState({ title: "", content: "" })

  const handleAdd = async () => {
    if (!newNote.title.trim()) return

    await fetch("/api/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newNote),
    })

    setNewNote({ title: "", content: "", color: "#fef3c7" })
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
        <h1 className="text-2xl font-bold tracking-tight">Notes</h1>
        <Button
          size="sm"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? <X className="h-4 w-4 mr-1" /> : <Plus className="h-4 w-4 mr-1" />}
          {showForm ? "Cancel" : "New Note"}
        </Button>
      </div>

      {showForm && (
        <div className="rounded-xl border border-border bg-card p-4 space-y-3">
          <input
            autoFocus
            type="text"
            placeholder="Note title..."
            value={newNote.title}
            onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
            className="w-full text-sm px-3 py-2 rounded-md border border-input bg-background
              focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <textarea
            placeholder="Write your note..."
            value={newNote.content}
            onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
            rows={4}
            className="w-full text-sm px-3 py-2 rounded-md border border-input bg-background
              focus:outline-none focus:ring-2 focus:ring-ring resize-none"
          />
          <div className="flex items-center justify-between">
            <div className="flex gap-1.5">
              {NOTE_COLORS.map((c) => (
                <button
                  key={c.value}
                  onClick={() => setNewNote({ ...newNote, color: c.value })}
                  className={`w-6 h-6 rounded-full border transition-transform ${
                    newNote.color === c.value ? "scale-125 ring-2 ring-ring ring-offset-2 ring-offset-background" : "border-border"
                  }`}
                  style={{ backgroundColor: c.value }}
                  title={c.label}
                />
              ))}
            </div>
            <Button size="sm" onClick={handleAdd} disabled={!newNote.title.trim()}>
              Save
            </Button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {notes.map((note) => (
          <div
            key={note.id}
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
                  <Button size="sm" onClick={() => handleSaveEdit(note.id)}>Save</Button>
                  <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>Cancel</Button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-start justify-between mb-1">
                  <h3
                    className="font-semibold text-sm cursor-pointer hover:underline"
                    onClick={() => handleStartEdit(note)}
                  >
                    {note.title}
                  </h3>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleTogglePin(note)}
                      className="text-muted-foreground hover:text-foreground"
                      title={note.pinned ? "Unpin" : "Pin"}
                    >
                      {note.pinned ? <PinOff className="h-3.5 w-3.5" /> : <Pin className="h-3.5 w-3.5" />}
                    </button>
                    <button
                      onClick={() => handleDelete(note.id)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
                {note.pinned && (
                  <Pin className="h-3 w-3 text-muted-foreground mb-1" />
                )}
                <p
                  className="text-xs text-foreground/80 whitespace-pre-wrap line-clamp-6 cursor-pointer"
                  onClick={() => handleStartEdit(note)}
                >
                  {note.content || "Empty note"}
                </p>
                <p className="text-[10px] text-muted-foreground/60 mt-2">
                  {note.createdBy.name} · {new Date(note.updatedAt).toLocaleDateString()}
                </p>
              </>
            )}
          </div>
        ))}
      </div>

      {notes.length === 0 && !showForm && (
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-sm">No notes yet. Create your first one!</p>
        </div>
      )}
    </div>
  )
}
