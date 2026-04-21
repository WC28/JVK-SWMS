import { NextResponse } from "next/server";
import { clearSessionCookie } from "@/lib/app-auth";

export async function GET(request: Request) {
  const appUrl = new URL(request.url).origin;
  const response = NextResponse.redirect(new URL("/login?loggedOut=1", appUrl));
  clearSessionCookie(response);
  return response;
}
