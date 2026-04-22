import crypto from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { google } from "googleapis";
import type { NextResponse } from "next/server";
import { getAllowedUserByEmail } from "@/lib/db";
import type { AllowedUser, AllowedUserRole, AppUserSession } from "@/lib/types";

const APP_SESSION_COOKIE = "jvk_swms_session";
const APP_AUTH_STATE_COOKIE = "jvk_swms_auth_state";
const APP_AUTH_SCOPES = ["openid", "email", "profile"];
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

type GoogleOauthTokens = {
  access_token?: string | null;
  id_token?: string | null;
};

type GoogleProfile = {
  email?: string;
  name?: string;
  picture?: string;
  verified_email?: boolean;
};

function toBase64Url(value: string) {
  return Buffer.from(value).toString("base64url");
}

function fromBase64Url(value: string) {
  return Buffer.from(value, "base64url").toString("utf8");
}

function getSessionSecret() {
  const secret =
    process.env.APP_SESSION_SECRET ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.GOOGLE_OAUTH_CLIENT_SECRET;

  if (!secret) {
    throw new Error(
      "APP_SESSION_SECRET, SUPABASE_SERVICE_ROLE_KEY, or GOOGLE_OAUTH_CLIENT_SECRET is required."
    );
  }

  return secret;
}

function signPayload(payload: object) {
  const encoded = toBase64Url(JSON.stringify(payload));
  const signature = crypto
    .createHmac("sha256", getSessionSecret())
    .update(encoded)
    .digest("base64url");

  return `${encoded}.${signature}`;
}

function verifyPayload<T>(value?: string | null) {
  if (!value) {
    return null;
  }

  const [encoded, signature] = value.split(".");
  if (!encoded || !signature) {
    return null;
  }

  const expected = crypto
    .createHmac("sha256", getSessionSecret())
    .update(encoded)
    .digest("base64url");

  if (signature !== expected) {
    return null;
  }

  try {
    return JSON.parse(fromBase64Url(encoded)) as T;
  } catch {
    return null;
  }
}

function getGoogleAuthConfig() {
  return {
    clientId: process.env.GOOGLE_OAUTH_CLIENT_ID,
    clientSecret: process.env.GOOGLE_OAUTH_CLIENT_SECRET
  };
}

function createGoogleAuthClient(appUrl: string, callbackPath: string) {
  const config = getGoogleAuthConfig();

  if (!config.clientId || !config.clientSecret) {
    throw new Error("Google OAuth client id/secret is missing.");
  }

  return new google.auth.OAuth2(
    config.clientId,
    config.clientSecret,
    `${appUrl}${callbackPath}`
  );
}

function buildSession(user: AllowedUser, profile: GoogleProfile): AppUserSession {
  return {
    email: user.email,
    displayName: user.displayName || profile.name || user.email,
    role: user.role,
    avatarUrl: profile.picture || "",
    expiresAt: Date.now() + SESSION_MAX_AGE_SECONDS * 1000
  };
}

export function hasAppGoogleAuthConfig() {
  const config = getGoogleAuthConfig();
  return Boolean(config.clientId && config.clientSecret);
}

export function getAppGoogleAuthUrl(appUrl: string) {
  const client = createGoogleAuthClient(appUrl, "/api/auth/google/callback");
  const state = crypto.randomUUID();

  return {
    state,
    url: client.generateAuthUrl({
      access_type: "online",
      prompt: "select_account",
      scope: APP_AUTH_SCOPES
    })
  };
}

export async function exchangeAppGoogleCode(code: string, appUrl: string) {
  const client = createGoogleAuthClient(appUrl, "/api/auth/google/callback");
  const { tokens } = await client.getToken(code);
  client.setCredentials(tokens);

  const oauth2 = google.oauth2({ version: "v2", auth: client });
  const response = await oauth2.userinfo.get();

  return {
    tokens,
    profile: response.data as GoogleProfile
  };
}

export async function getCurrentSession() {
  const cookieStore = await cookies();
  const payload = verifyPayload<AppUserSession>(cookieStore.get(APP_SESSION_COOKIE)?.value);

  if (!payload || payload.expiresAt <= Date.now()) {
    return null;
  }

  return payload;
}

export async function requirePageSession(roles?: AllowedUserRole[]) {
  const session = await getCurrentSession();

  if (!session) {
    redirect("/login");
  }

  if (roles && !roles.includes(session.role)) {
    redirect("/");
  }

  return session;
}

export async function getRequestSession(request: Request) {
  const cookieHeader = request.headers.get("cookie") || "";
  const cookiesMap = new Map(
    cookieHeader
      .split(";")
      .map((item) => item.trim())
      .filter(Boolean)
      .map((item) => {
        const [key, ...rest] = item.split("=");
        return [key, rest.join("=")] as const;
      })
  );

  const payload = verifyPayload<AppUserSession>(cookiesMap.get(APP_SESSION_COOKIE));

  if (!payload || payload.expiresAt <= Date.now()) {
    return null;
  }

  return payload;
}

export async function requireApiSession(request: Request, roles?: AllowedUserRole[]) {
  const session = await getRequestSession(request);

  if (!session) {
    return {
      error: Response.json({ message: "Authentication required." }, { status: 401 }),
      session: null
    };
  }

  if (roles && !roles.includes(session.role)) {
    return {
      error: Response.json({ message: "You do not have permission." }, { status: 403 }),
      session: null
    };
  }

  return { error: null, session };
}

export function setStateCookie(response: NextResponse, state: string) {
  response.cookies.set(APP_AUTH_STATE_COOKIE, signPayload({ state }), {
    httpOnly: true,
    sameSite: "none",
    secure: true,
    path: "/",
    maxAge: 60 * 15
  });
}

export async function readStateCookie() {
  const cookieStore = await cookies();
  const payload = verifyPayload<{ state: string }>(
    cookieStore.get(APP_AUTH_STATE_COOKIE)?.value
  );

  return payload?.state ?? null;
}

export function clearStateCookie(response: NextResponse) {
  response.cookies.set(APP_AUTH_STATE_COOKIE, "", {
    httpOnly: true,
    sameSite: "none",
    secure: true,
    path: "/",
    maxAge: 0
  });
}

export function setSessionCookie(response: NextResponse, session: AppUserSession) {
  response.cookies.set(APP_SESSION_COOKIE, signPayload(session), {
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS
  });
}

export function clearSessionCookie(response: NextResponse) {
  response.cookies.set(APP_SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    path: "/",
    maxAge: 0
  });
}

export async function createSessionForAllowedUser(email: string, profile: GoogleProfile) {
  const allowedUser = await getAllowedUserByEmail(email);

  if (!allowedUser || !allowedUser.isActive) {
    return null;
  }

  return buildSession(allowedUser, profile);
}

export async function canManageRecords() {
  const session = await getCurrentSession();
  return Boolean(session && ["admin", "editor"].includes(session.role));
}

export async function canAdminSystem() {
  const session = await getCurrentSession();
  return session?.role === "admin";
}
