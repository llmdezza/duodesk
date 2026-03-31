import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getSessionUserId, unauthorized, badRequest, parseJson, truncate } from "@/lib/api"

export async function GET(req: NextRequest) {
  const userId = await getSessionUserId()
  if (!userId) return unauthorized()

  const { searchParams } = req.nextUrl
  const upcoming = searchParams.get("upcoming")
  const month = searchParams.get("month")

  let where = {}

  if (upcoming) {
    where = { startDate: { gte: new Date() } }
  } else if (month && /^\d{4}-\d{2}$/.test(month)) {
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
  }

  const events = await db.calendarEvent.findMany({
    where,
    orderBy: { startDate: "asc" },
    include: { createdBy: { select: { id: true, name: true } } },
  })

  return NextResponse.json(events)
}

export async function POST(req: NextRequest) {
  const userId = await getSessionUserId()
  if (!userId) return unauthorized()

  const body = await parseJson(req)
  if (!body) return badRequest("Invalid JSON")

  const title = truncate(body.title as string, 200)
  if (!title) return badRequest("Title is required")

  const startDate = body.startDate as string
  if (!startDate || isNaN(Date.parse(startDate))) {
    return badRequest("Valid start date is required")
  }

  const endDate = body.endDate as string | undefined
  if (endDate && isNaN(Date.parse(endDate))) {
    return badRequest("Invalid end date")
  }

  const color = /^#[0-9a-fA-F]{6}$/.test(body.color as string || "") ? body.color as string : "#3b82f6"

  const event = await db.calendarEvent.create({
    data: {
      title,
      description: truncate(body.description as string, 2000),
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : null,
      allDay: body.allDay === true,
      color,
      userId,
    },
    include: { createdBy: { select: { id: true, name: true } } },
  })

  return NextResponse.json(event, { status: 201 })
}
