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

  const existing = await db.shoppingItem.findUnique({ where: { id } })
  if (!existing) return notFound("Shopping item")

  const item = await db.shoppingItem.update({
    where: { id },
    data: {
      ...(body.name !== undefined && { name: truncate(body.name as string, 200) || existing.name }),
      ...(body.quantity !== undefined && typeof body.quantity === "number" && body.quantity > 0 && body.quantity <= 9999 && {
        quantity: Math.floor(body.quantity),
      }),
      ...(body.checked !== undefined && { checked: body.checked === true }),
      ...(body.category !== undefined && { category: truncate(body.category as string, 100) }),
    },
    include: { createdBy: { select: { id: true, name: true } } },
  })

  return NextResponse.json(item)
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getSessionUserId()
  if (!userId) return unauthorized()

  const { id } = await params
  const existing = await db.shoppingItem.findUnique({ where: { id } })
  if (!existing) return notFound("Shopping item")

  await db.shoppingItem.delete({ where: { id } })

  return NextResponse.json({ ok: true })
}
