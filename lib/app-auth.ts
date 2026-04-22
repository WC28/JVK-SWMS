import crypto from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { NextResponse } from "next/server";
import { getAppUserAuthByUsername } from "@/lib/db";
import type { AllowedUserRole, AppUserSession } from "@/lib/types";

const APP_SESSION_COOKIE = "jvk_swms_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

type StoredUserAuth = {
  username: string;
  password_hash: string;
  display_name: string;
  role: AllowedUserRole;
  is_active: boolean;
};

function toBase64Url(value: string) {
  return Buffer.from(value).toString("base64url");
}

function fromBase64Url(value: string) {
  return Buffer.from(value, "base64url").toString("utf8");
}

function getSessionSecret() {
  const secret = process.env.APP_SESSION_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!secret) {
    throw new Error("APP_SESSION_SECRET or SUPABASE_SERVICE_ROLE_KEY is required.");
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

function buildSession(user: StoredUserAuth): AppUserSession {
  return {
    username: user.username,
    displayName: user.display_name || user.username,
    role: user.role,
    expiresAt: Date.now() + SESSION_MAX_AGE_SECONDS * 1000
  };
}

function parsePasswordHash(value: string) {
  const [salt, hash] = value.split(":");
  if (!salt || !hash) {
    return null;
  }

  return { salt, hash };
}

export function hashPassword(password: string) {
  const trimmed = password.trim();
  if (trimmed.length < 8) {
    throw new Error("Password must be at least 8 characters.");
  }

  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(trimmed, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, storedHash: string) {
  const parsed = parsePasswordHash(storedHash);
  if (!parsed) {
    return false;
  }

  const derived = crypto.scryptSync(password, parsed.salt, 64);
  const expected = Buffer.from(parsed.hash, "hex");

  if (derived.length !== expected.length) {
    return false;
  }

  return crypto.timingSafeEqual(derived, expected);
}

export async function authenticateWithPassword(username: string, password: string) {
  const user = await getAppUserAuthByUsername(username.trim().toLowerCase());

  if (!user || !user.is_active) {
    return null;
  }

  if (!verifyPassword(password, user.password_hash)) {
    return null;
  }

  return buildSession(user);
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

export function setSessionCookie(response: NextResponse, session: AppUserSession) {
  response.cookies.set(APP_SESSION_COOKIE, signPayload(session), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS
  });
}

export function clearSessionCookie(response: NextResponse) {
  response.cookies.set(APP_SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0
  });
}

export async function canManageRecords() {
  const session = await getCurrentSession();
  return Boolean(session && ["admin", "editor"].includes(session.role));
}

export async function canAdminSystem() {
  const session = await getCurrentSession();
  return session?.role === "admin";
}
