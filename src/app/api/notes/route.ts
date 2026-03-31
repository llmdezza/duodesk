import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getSessionUserId, unauthorized, badRequest, parseJson, truncate } from "@/lib/api"

export async function GET() {
  const userId = await getSessionUserId()
  if (!userId) return unauthorized()

  const notes = await db.note.findMany({
    orderBy: [{ pinned: "desc" }, { updatedAt: "desc" }],
    include: { createdBy: { select: { id: true, name: true } } },
  })

  return NextResponse.json(notes)
}

export async function POST(req: NextRequest) {
  const userId = await getSessionUserId()
  if (!userId) return unauthorized()

  const body = await parseJson(req)
  if (!body) return badRequest("Invalid JSON")

  const title = truncate(body.title as string, 200)
  if (!title) return badRequest("Title is required")

  const color = /^#[0-9a-fA-F]{6}$/.test(body.color as string || "") ? body.color as string : "#fef3c7"

  const note = await db.note.create({
    data: {
      title,
      content: truncate(body.content as string, 10000) || "",
      color,
      userId,
    },
    include: { createdBy: { select: { id: true, name: true } } },
  })

  return NextResponse.json(note, { status: 201 })
}
