import { NextResponse } from "next/server";
import { requireApiSession } from "@/lib/app-auth";
import { getGoogleAuthUrl, hasGoogleSheetsConfig } from "@/lib/google-sheets";
import { setAppSetting } from "@/lib/db";

export async function GET(request: Request) {
  const auth = await requireApiSession(request, ["admin", "editor"]);
  if (auth.error) {
    return auth.error;
  }

  const appUrl = new URL(request.url).origin;

  if (!hasGoogleSheetsConfig()) {
    return NextResponse.redirect(
      new URL("/cases?google=missing-config", appUrl)
    );
  }

  const { state, url } = getGoogleAuthUrl(appUrl);
  await setAppSetting("google_oauth_state", state);
  return NextResponse.redirect(url);
}
