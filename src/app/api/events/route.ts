import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = req.nextUrl
  const upcoming = searchParams.get("upcoming")
  const month = searchParams.get("month") // format: "2026-03"
  const year = searchParams.get("year")

  let where = {}

  if (upcoming) {
    where = { startDate: { gte: new Date() } }
  } else if (month) {
    const [y, m] = month.split("-").map(Number)
    const start = new Date(y, m - 1, 1)
    const end = new Date(y, m, 0, 23, 59, 59, 999)
    where = {
      OR: [
        { startDate: { gte: start, lte: end } },
        { endDate: { gte: start, lte: end } },
        { AND: [{ startDate: { lte: start } }, { endDate: { gte: end } }] },
      ],
    }
  } else if (year) {
    const start = new Date(Number(year), 0, 1)
    const end = new Date(Number(year), 11, 31, 23, 59, 59, 999)
    where = { startDate: { gte: start, lte: end } }
  }

  const events = await db.calendarEvent.findMany({
    where,
    orderBy: { startDate: "asc" },
    include: { createdBy: { select: { id: true, name: true } } },
  })

  return NextResponse.json(events)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json()
  const { title, description, startDate, endDate, allDay, color } = body

  if (!title?.trim() || !startDate) {
    return NextResponse.json({ error: "Title and start date required" }, { status: 400 })
  }

  const event = await db.calendarEvent.create({
    data: {
      title: title.trim(),
      description: description?.trim() || null,
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : null,
      allDay: allDay ?? false,
      color: color || "#3b82f6",
      userId: session.user.id,
    },
    include: { createdBy: { select: { id: true, name: true } } },
  })

  return NextResponse.json(event, { status: 201 })
}
