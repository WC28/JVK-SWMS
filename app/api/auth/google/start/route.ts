import { NextResponse } from "next/server";
import { getAppGoogleAuthUrl, hasAppGoogleAuthConfig, setStateCookie } from "@/lib/app-auth";

export async function GET(request: Request) {
  const appUrl = new URL(request.url).origin;

  if (!hasAppGoogleAuthConfig()) {
    return NextResponse.redirect(new URL("/login?error=missing-google-config", appUrl));
  }

  const { state, url } = getAppGoogleAuthUrl(appUrl);
  const response = NextResponse.redirect(url);
  setStateCookie(response, state);
  return response;
}
