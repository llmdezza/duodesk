import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getSessionUserId, unauthorized, badRequest, notFound, parseJson, truncate, VALID_TASK_STATUSES } from "@/lib/api"

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getSessionUserId()
  if (!userId) return unauthorized()

  const { id } = await params
  const body = await parseJson(req)
  if (!body) return badRequest("Invalid JSON")

  const existing = await db.task.findUnique({ where: { id } })
  if (!existing) return notFound("Task")

  if (body.status !== undefined && !VALID_TASK_STATUSES.includes(body.status as string)) {
    return badRequest(`Invalid status. Must be one of: ${VALID_TASK_STATUSES.join(", ")}`)
  }

  const task = await db.task.update({
    where: { id },
    data: {
      ...(body.title !== undefined && { title: truncate(body.title as string, 200) || existing.title }),
      ...(body.description !== undefined && { description: truncate(body.description as string, 2000) }),
      ...(body.status !== undefined && { status: body.status as string }),
      ...(body.position !== undefined && typeof body.position === "number" && { position: body.position }),
    },
    include: { createdBy: { select: { id: true, name: true } } },
  })

  return NextResponse.json(task)
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getSessionUserId()
  if (!userId) return unauthorized()

  const { id } = await params
  const existing = await db.task.findUnique({ where: { id } })
  if (!existing) return notFound("Task")

  await db.task.delete({ where: { id } })

  return NextResponse.json({ ok: true })
}
