import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const items = await db.shoppingItem.findMany({
    orderBy: [{ checked: "asc" }, { createdAt: "desc" }],
    include: { createdBy: { select: { id: true, name: true } } },
  })

  return NextResponse.json(items)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json()
  const { name, quantity, category } = body

  if (!name?.trim()) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 })
  }

  const item = await db.shoppingItem.create({
    data: {
      name: name.trim(),
      quantity: quantity || 1,
      category: category?.trim() || null,
      userId: session.user.id,
    },
    include: { createdBy: { select: { id: true, name: true } } },
  })

  return NextResponse.json(item, { status: 201 })
}
