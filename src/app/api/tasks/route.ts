import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getSessionUserId, unauthorized, badRequest, parseJson, truncate, VALID_TASK_STATUSES } from "@/lib/api"

export async function GET(req: NextRequest) {
  const userId = await getSessionUserId()
  if (!userId) return unauthorized()

  const mode = req.nextUrl.searchParams.get("mode")
  const where = mode === "personal"
    ? { personal: true, userId }
    : mode === "shared"
    ? { personal: false }
    : {}

  const tasks = await db.task.findMany({
    where,
    orderBy: [{ status: "asc" }, { position: "asc" }, { createdAt: "desc" }],
    include: { createdBy: { select: { id: true, name: true } } },
  })

  return NextResponse.json(tasks)
}

export async function POST(req: NextRequest) {
  const userId = await getSessionUserId()
  if (!userId) return unauthorized()

  const body = await parseJson(req)
  if (!body) return badRequest("Invalid JSON")

  const title = truncate(body.title as string, 200)
  if (!title) return badRequest("Title is required")

  const status = (body.status as string) || "todo"
  if (!VALID_TASK_STATUSES.includes(status)) {
    return badRequest(`Invalid status. Must be one of: ${VALID_TASK_STATUSES.join(", ")}`)
  }

  const maxPosition = await db.task.aggregate({
    _max: { position: true },
    where: { status },
  })

  const task = await db.task.create({
    data: {
      title,
      description: truncate(body.description as string, 2000),
      status,
      position: (maxPosition._max.position ?? -1) + 1,
      personal: body.personal === true,
      userId,
    },
    include: { createdBy: { select: { id: true, name: true } } },
  })

  return NextResponse.json(task, { status: 201 })
}
