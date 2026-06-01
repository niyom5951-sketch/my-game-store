import { NextRequest, NextResponse } from "next/server"
import { getAuthContext, isAuthError } from "@/lib/api/auth"
import { sendDiscord } from "@/lib/discord"

export async function POST(req: NextRequest) {
  const context = await getAuthContext()
  if (isAuthError(context)) return context

  const { message } = await req.json()
  if (!message || typeof message !== "string") {
    return NextResponse.json({ success: false, error: "Invalid message" }, { status: 400 })
  }

  await sendDiscord(message)
  return NextResponse.json({ success: true })
}
