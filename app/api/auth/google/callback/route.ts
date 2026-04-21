import { NextResponse } from "next/server";
import {
  clearStateCookie,
  createSessionForAllowedUser,
  exchangeAppGoogleCode,
  readStateCookie,
  setSessionCookie
} from "@/lib/app-auth";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const appUrl = url.origin;
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const error = url.searchParams.get("error");

  if (error) {
    return NextResponse.redirect(new URL("/login?error=google-denied", appUrl));
  }

  const expectedState = await readStateCookie();
  if (!code || !state || !expectedState || state !== expectedState) {
    return NextResponse.redirect(new URL("/login?error=invalid-state", appUrl));
  }

  const { profile } = await exchangeAppGoogleCode(code, appUrl);
  const email = profile.email?.trim().toLowerCase();

  if (!email || profile.verified_email === false) {
    return NextResponse.redirect(new URL("/login?error=missing-email", appUrl));
  }

  const session = await createSessionForAllowedUser(email, profile);
  if (!session) {
    return NextResponse.redirect(
      new URL(`/login?error=not-allowed&email=${encodeURIComponent(email)}`, appUrl)
    );
  }

  const response = NextResponse.redirect(new URL("/", appUrl));
  clearStateCookie(response);
  setSessionCookie(response, session);
  return response;
}
