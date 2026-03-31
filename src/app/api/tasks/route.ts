import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const tasks = await db.task.findMany({
    orderBy: [{ status: "asc" }, { position: "asc" }, { createdAt: "desc" }],
    include: { createdBy: { select: { id: true, name: true } } },
  })

  return NextResponse.json(tasks)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json()
  const { title, description, status } = body

  if (!title?.trim()) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 })
  }

  const maxPosition = await db.task.aggregate({
    _max: { position: true },
    where: { status: status || "todo" },
  })

  const task = await db.task.create({
    data: {
      title: title.trim(),
      description: description?.trim() || null,
      status: status || "todo",
      position: (maxPosition._max.position ?? -1) + 1,
      userId: session.user.id,
    },
    include: { createdBy: { select: { id: true, name: true } } },
  })

  return NextResponse.json(task, { status: 201 })
}
