import { NextResponse } from "next/server";
import { deleteAppSetting, getAppSetting } from "@/lib/db";
import { exchangeGoogleCode } from "@/lib/google-sheets";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const error = url.searchParams.get("error");
  const appUrl = url.origin;

  if (error) {
    return NextResponse.redirect(new URL(`/cases?google=denied`, appUrl));
  }

  const expectedState = await getAppSetting("google_oauth_state");
  if (!code || !state || !expectedState || state !== expectedState) {
    return NextResponse.redirect(new URL(`/cases?google=invalid-state`, appUrl));
  }

  await exchangeGoogleCode(code, appUrl);
  await deleteAppSetting("google_oauth_state");

  return NextResponse.redirect(new URL(`/cases?google=connected`, appUrl));
}
