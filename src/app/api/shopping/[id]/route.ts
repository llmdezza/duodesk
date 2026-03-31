import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const body = await req.json()
  const { name, quantity, checked, category } = body

  const item = await db.shoppingItem.update({
    where: { id },
    data: {
      ...(name !== undefined && { name: name.trim() }),
      ...(quantity !== undefined && { quantity }),
      ...(checked !== undefined && { checked }),
      ...(category !== undefined && { category: category?.trim() || null }),
    },
    include: { createdBy: { select: { id: true, name: true } } },
  })

  return NextResponse.json(item)
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  await db.shoppingItem.delete({ where: { id } })

  return NextResponse.json({ ok: true })
}
