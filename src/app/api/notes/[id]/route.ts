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

  const existing = await db.note.findUnique({ where: { id } })
  if (!existing) return notFound("Note")

  if (body.color !== undefined && !/^#[0-9a-fA-F]{6}$/.test(body.color as string)) {
    return badRequest("Invalid color format")
  }

  const note = await db.note.update({
    where: { id },
    data: {
      ...(body.title !== undefined && { title: truncate(body.title as string, 200) || existing.title }),
      ...(body.content !== undefined && { content: truncate(body.content as string, 10000) || "" }),
      ...(body.color !== undefined && { color: body.color as string }),
      ...(body.pinned !== undefined && { pinned: body.pinned === true }),
      ...(body.completed !== undefined && { completed: body.completed === true }),
      ...(body.isTask !== undefined && { isTask: body.isTask === true }),
    },
    include: { createdBy: { select: { id: true, name: true } } },
  })

  return NextResponse.json(note)
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getSessionUserId()
  if (!userId) return unauthorized()

  const { id } = await params
  const existing = await db.note.findUnique({ where: { id } })
  if (!existing) return notFound("Note")

  await db.note.delete({ where: { id } })

  return NextResponse.json({ ok: true })
}
