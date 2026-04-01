import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getSessionUserId, unauthorized, badRequest, notFound, parseJson, truncate } from "@/lib/api"

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getSessionUserId()
  if (!userId) return unauthorized()

  const { id } = await params
  const body = await parseJson(req)
  if (!body) return badRequest("Invalid JSON")

  const existing = await db.calendarEvent.findUnique({ where: { id } })
  if (!existing) return notFound("Event")

  if (body.color !== undefined && !/^#[0-9a-fA-F]{6}$/.test(body.color as string)) {
    return badRequest("Invalid color format")
  }

  const event = await db.calendarEvent.update({
    where: { id },
    data: {
      ...(body.title !== undefined && { title: truncate(body.title as string, 200) || existing.title }),
      ...(body.description !== undefined && { description: truncate(body.description as string, 2000) }),
      ...(body.startDate !== undefined && { startDate: new Date(body.startDate as string) }),
      ...(body.endDate !== undefined && { endDate: body.endDate ? new Date(body.endDate as string) : null }),
      ...(body.allDay !== undefined && { allDay: body.allDay === true }),
      ...(body.personal !== undefined && { personal: body.personal === true }),
      ...(body.color !== undefined && { color: body.color as string }),
    },
    include: { createdBy: { select: { id: true, name: true } } },
  })

  return NextResponse.json(event)
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getSessionUserId()
  if (!userId) return unauthorized()

  const { id } = await params
  const existing = await db.calendarEvent.findUnique({ where: { id } })
  if (!existing) return notFound("Event")

  await db.calendarEvent.delete({ where: { id } })

  return NextResponse.json({ ok: true })
}
