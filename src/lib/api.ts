import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"

const VALID_TASK_STATUSES = ["todo", "in_progress", "done"]

export { VALID_TASK_STATUSES }

export async function getSessionUserId(): Promise<string | null> {
  const session = await auth()
  return session?.user?.id ?? null
}

export function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
}

export function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 })
}

export function notFound(resource = "Resource") {
  return NextResponse.json({ error: `${resource} not found` }, { status: 404 })
}

export async function parseJson(req: Request): Promise<Record<string, unknown> | null> {
  try {
    return await req.json()
  } catch {
    return null
  }
}

export function truncate(value: string | undefined | null, maxLength: number): string | null {
  if (!value) return null
  return value.trim().slice(0, maxLength) || null
}
