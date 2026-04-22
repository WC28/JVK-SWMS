import { NextResponse } from "next/server";
import { authenticateWithPassword, setSessionCookie } from "@/lib/app-auth";

export async function POST(request: Request) {
  const appUrl = new URL(request.url).origin;
  const formData = await request.formData();

  const username = String(formData.get("username") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");

  if (!username || !password) {
    return NextResponse.redirect(new URL("/login?error=missing-credentials", appUrl));
  }

  const session = await authenticateWithPassword(username, password);
  if (!session) {
    return NextResponse.redirect(new URL("/login?error=invalid-credentials", appUrl));
  }

  const response = NextResponse.redirect(new URL("/", appUrl));
  setSessionCookie(response, session);
  return response;
}
