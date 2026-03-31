import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json()
  const { taskId, newStatus, newPosition } = body

  await db.task.update({
    where: { id: taskId },
    data: { status: newStatus, position: newPosition },
  })

  return NextResponse.json({ ok: true })
}
