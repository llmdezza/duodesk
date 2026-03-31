import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getSessionUserId, unauthorized, badRequest, parseJson, truncate } from "@/lib/api"

export async function GET() {
  const userId = await getSessionUserId()
  if (!userId) return unauthorized()

  const items = await db.shoppingItem.findMany({
    orderBy: [{ checked: "asc" }, { createdAt: "desc" }],
    include: { createdBy: { select: { id: true, name: true } } },
  })

  return NextResponse.json(items)
}

export async function POST(req: NextRequest) {
  const userId = await getSessionUserId()
  if (!userId) return unauthorized()

  const body = await parseJson(req)
  if (!body) return badRequest("Invalid JSON")

  const name = truncate(body.name as string, 200)
  if (!name) return badRequest("Name is required")

  const quantity = typeof body.quantity === "number" && body.quantity > 0 && body.quantity <= 9999
    ? Math.floor(body.quantity)
    : 1

  const item = await db.shoppingItem.create({
    data: {
      name,
      quantity,
      category: truncate(body.category as string, 100),
      userId,
    },
    include: { createdBy: { select: { id: true, name: true } } },
  })

  return NextResponse.json(item, { status: 201 })
}
