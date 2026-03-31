import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const notes = await db.note.findMany({
    orderBy: [{ pinned: "desc" }, { updatedAt: "desc" }],
    include: { createdBy: { select: { id: true, name: true } } },
  })

  return NextResponse.json(notes)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json()
  const { title, content, color } = body

  if (!title?.trim()) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 })
  }

  const note = await db.note.create({
    data: {
      title: title.trim(),
      content: content?.trim() || "",
      color: color || "#fef3c7",
      userId: session.user.id,
    },
    include: { createdBy: { select: { id: true, name: true } } },
  })

  return NextResponse.json(note, { status: 201 })
}
