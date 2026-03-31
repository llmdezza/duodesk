"use client"

import { useState, useMemo } from "react"
import useSWR from "swr"
import { ChevronLeft, ChevronRight, Plus, X, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

type CalendarEvent = {
  id: string
  title: string
  description: string | null
  startDate: string
  endDate: string | null
  allDay: boolean
  color: string
  createdBy: { id: string; name: string }
}

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
const COLORS = ["#3b82f6", "#ef4444", "#22c55e", "#f59e0b", "#8b5cf6", "#ec4899", "#06b6d4"]

function getMonthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
}

function getMonthDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)

  // Monday = 0, Sunday = 6
  let startOffset = firstDay.getDay() - 1
  if (startOffset < 0) startOffset = 6

  const days: Array<{ date: Date; isCurrentMonth: boolean }> = []

  // Previous month padding
  for (let i = startOffset - 1; i >= 0; i--) {
    const d = new Date(year, month, -i)
    days.push({ date: d, isCurrentMonth: false })
  }

  // Current month
  for (let i = 1; i <= lastDay.getDate(); i++) {
    days.push({ date: new Date(year, month, i), isCurrentMonth: true })
  }

  // Next month padding to fill 6 rows
  const remaining = 42 - days.length
  for (let i = 1; i <= remaining; i++) {
    days.push({ date: new Date(year, month + 1, i), isCurrentMonth: false })
  }

  return days
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

function formatTime(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
}

export default function CalendarPage() {
  const today = new Date()
  const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1))
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    startTime: "09:00",
    endTime: "10:00",
    allDay: false,
    color: "#3b82f6",
  })

  const monthKey = getMonthKey(viewDate)
  const { data: events = [], mutate } = useSWR<CalendarEvent[]>(
    `/api/events?month=${monthKey}`,
    fetcher,
    { refreshInterval: 5000 }
  )

  const days = useMemo(
    () => getMonthDays(viewDate.getFullYear(), viewDate.getMonth()),
    [viewDate]
  )

  const eventsForDate = (date: Date) =>
    events.filter((e) => {
      const start = new Date(e.startDate)
      const end = e.endDate ? new Date(e.endDate) : start
      return date >= new Date(start.getFullYear(), start.getMonth(), start.getDate()) &&
        date <= new Date(end.getFullYear(), end.getMonth(), end.getDate())
    })

  const selectedEvents = selectedDate ? eventsForDate(selectedDate) : []

  const prevMonth = () =>
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))
  const nextMonth = () =>
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))
  const goToday = () => {
    setViewDate(new Date(today.getFullYear(), today.getMonth(), 1))
    setSelectedDate(today)
  }

  const handleAddEvent = async () => {
    if (!newEvent.title.trim() || !selectedDate) return

    const startDate = new Date(selectedDate)
    if (!newEvent.allDay) {
      const [h, m] = newEvent.startTime.split(":").map(Number)
      startDate.setHours(h, m, 0, 0)
    }

    let endDate: Date | null = null
    if (!newEvent.allDay) {
      endDate = new Date(selectedDate)
      const [h, m] = newEvent.endTime.split(":").map(Number)
      endDate.setHours(h, m, 0, 0)
    }

    await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: newEvent.title,
        description: newEvent.description || null,
        startDate: startDate.toISOString(),
        endDate: endDate?.toISOString() || null,
        allDay: newEvent.allDay,
        color: newEvent.color,
      }),
    })

    setNewEvent({ title: "", description: "", startTime: "09:00", endTime: "10:00", allDay: false, color: "#3b82f6" })
    setShowAddForm(false)
    mutate()
  }

  const handleDeleteEvent = async (id: string) => {
    await fetch(`/api/events/${id}`, { method: "DELETE" })
    mutate()
  }

  const monthLabel = viewDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Calendar</h1>
        <Button variant="outline" size="sm" onClick={goToday}>
          Today
        </Button>
      </div>

      {/* Month navigation */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="icon" onClick={prevMonth}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h2 className="text-lg font-semibold">{monthLabel}</h2>
        <Button variant="ghost" size="icon" onClick={nextMonth}>
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      {/* Calendar grid */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        {/* Weekday headers */}
        <div className="grid grid-cols-7 border-b border-border">
          {WEEKDAYS.map((d) => (
            <div
              key={d}
              className="text-center text-xs font-medium text-muted-foreground py-2"
            >
              {d}
            </div>
          ))}
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7">
          {days.map((day, i) => {
            const dayEvents = eventsForDate(day.date)
            const isToday = isSameDay(day.date, today)
            const isSelected = selectedDate && isSameDay(day.date, selectedDate)

            return (
              <button
                key={i}
                onClick={() => setSelectedDate(day.date)}
                className={`
                  relative min-h-[52px] sm:min-h-[72px] p-1 border-b border-r border-border
                  text-left transition-colors
                  ${!day.isCurrentMonth ? "text-muted-foreground/40 bg-muted/20" : ""}
                  ${isSelected ? "bg-accent" : "hover:bg-accent/50"}
                `}
              >
                <span
                  className={`
                    text-xs sm:text-sm inline-flex items-center justify-center w-6 h-6 rounded-full
                    ${isToday ? "bg-primary text-primary-foreground font-bold" : ""}
                  `}
                >
                  {day.date.getDate()}
                </span>
                {/* Event dots on mobile, previews on desktop */}
                {dayEvents.length > 0 && (
                  <>
                    <div className="flex gap-0.5 mt-0.5 sm:hidden">
                      {dayEvents.slice(0, 3).map((e) => (
                        <span
                          key={e.id}
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ backgroundColor: e.color }}
                        />
                      ))}
                      {dayEvents.length > 3 && (
                        <span className="text-[8px] text-muted-foreground">
                          +{dayEvents.length - 3}
                        </span>
                      )}
                    </div>
                    <div className="hidden sm:block space-y-0.5 mt-0.5">
                      {dayEvents.slice(0, 2).map((e) => (
                        <div
                          key={e.id}
                          className="text-[10px] leading-tight truncate rounded px-1 py-0.5 text-white"
                          style={{ backgroundColor: e.color }}
                        >
                          {e.title}
                        </div>
                      ))}
                      {dayEvents.length > 2 && (
                        <div className="text-[10px] text-muted-foreground px-1">
                          +{dayEvents.length - 2} more
                        </div>
                      )}
                    </div>
                  </>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Selected day panel */}
      {selectedDate && (
        <div className="rounded-xl border border-border bg-card p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">
              {selectedDate.toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
            </h3>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => {
                setShowAddForm(!showAddForm)
                setNewEvent({ title: "", description: "", startTime: "09:00", endTime: "10:00", allDay: false, color: "#3b82f6" })
              }}
            >
              {showAddForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            </Button>
          </div>

          {/* Add event form */}
          {showAddForm && (
            <div className="space-y-2 p-3 rounded-lg border border-border bg-background">
              <input
                autoFocus
                type="text"
                placeholder="Event title..."
                value={newEvent.title}
                onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                onKeyDown={(e) => e.key === "Enter" && handleAddEvent()}
                className="w-full text-sm px-2 py-1.5 rounded-md border border-input bg-background
                  focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <textarea
                placeholder="Description (optional)"
                value={newEvent.description}
                onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                rows={2}
                className="w-full text-sm px-2 py-1.5 rounded-md border border-input bg-background
                  focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              />
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={newEvent.allDay}
                  onChange={(e) => setNewEvent({ ...newEvent, allDay: e.target.checked })}
                  className="rounded border-input"
                />
                All day
              </label>
              {!newEvent.allDay && (
                <div className="flex gap-2">
                  <input
                    type="time"
                    value={newEvent.startTime}
                    onChange={(e) => setNewEvent({ ...newEvent, startTime: e.target.value })}
                    className="flex-1 text-sm px-2 py-1.5 rounded-md border border-input bg-background
                      focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                  <span className="self-center text-muted-foreground text-sm">—</span>
                  <input
                    type="time"
                    value={newEvent.endTime}
                    onChange={(e) => setNewEvent({ ...newEvent, endTime: e.target.value })}
                    className="flex-1 text-sm px-2 py-1.5 rounded-md border border-input bg-background
                      focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              )}
              <div className="flex gap-1.5">
                {COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => setNewEvent({ ...newEvent, color: c })}
                    className={`w-6 h-6 rounded-full transition-transform ${
                      newEvent.color === c ? "scale-125 ring-2 ring-ring ring-offset-2 ring-offset-background" : ""
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
              <Button size="sm" className="w-full" onClick={handleAddEvent} disabled={!newEvent.title.trim()}>
                Add Event
              </Button>
            </div>
          )}

          {/* Events list */}
          {selectedEvents.length === 0 && !showAddForm && (
            <p className="text-sm text-muted-foreground">No events this day</p>
          )}
          {selectedEvents.map((event) => (
            <div
              key={event.id}
              className="group flex items-start gap-3 p-2 rounded-lg hover:bg-accent/50 transition-colors"
            >
              <div
                className="w-1 h-full min-h-[32px] rounded-full shrink-0 mt-0.5"
                style={{ backgroundColor: event.color }}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{event.title}</p>
                {event.description && (
                  <p className="text-xs text-muted-foreground mt-0.5">{event.description}</p>
                )}
                <p className="text-xs text-muted-foreground/60 mt-0.5">
                  {event.allDay
                    ? "All day"
                    : `${formatTime(event.startDate)}${event.endDate ? ` — ${formatTime(event.endDate)}` : ""}`}
                  {" · "}
                  {event.createdBy.name}
                </p>
              </div>
              <button
                onClick={() => handleDeleteEvent(event.id)}
                className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all mt-1"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
