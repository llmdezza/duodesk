import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getSessionUserId, unauthorized, badRequest, notFound, parseJson, VALID_TASK_STATUSES } from "@/lib/api"

export async function POST(req: NextRequest) {
  const userId = await getSessionUserId()
  if (!userId) return unauthorized()

  const body = await parseJson(req)
  if (!body) return badRequest("Invalid JSON")

  const { taskId, newStatus, newPosition } = body as { taskId: string; newStatus: string; newPosition: number }

  if (!taskId || typeof newPosition !== "number") {
    return badRequest("taskId and newPosition are required")
  }

  if (!VALID_TASK_STATUSES.includes(newStatus)) {
    return badRequest(`Invalid status. Must be one of: ${VALID_TASK_STATUSES.join(", ")}`)
  }

  const existing = await db.task.findUnique({ where: { id: taskId } })
  if (!existing) return notFound("Task")

  await db.task.update({
    where: { id: taskId },
    data: { status: newStatus, position: newPosition },
  })

  return NextResponse.json({ ok: true })
}
