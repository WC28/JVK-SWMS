import { NextResponse } from "next/server";
import { disconnectGoogleOAuth } from "@/lib/google-sheets";

export async function POST() {
  await disconnectGoogleOAuth();
  return NextResponse.json({ ok: true });
}
