import { NextResponse } from "next/server";
import { hashPassword, requireApiSession } from "@/lib/app-auth";
import { deleteAppUser, getAppUserByUsername, listAppUsers, upsertAppUser } from "@/lib/db";
import type { AllowedUserRole } from "@/lib/types";

export async function GET(request: Request) {
  const auth = await requireApiSession(request, ["admin"]);
  if (auth.error) {
    return auth.error;
  }

  return NextResponse.json(await listAppUsers());
}

export async function POST(request: Request) {
  const auth = await requireApiSession(request, ["admin"]);
  if (auth.error) {
    return auth.error;
  }

  const body = (await request.json()) as {
    username: string;
    displayName?: string;
    password?: string;
    role: AllowedUserRole;
    isActive?: boolean;
  };

  if (!body.username || !body.role) {
    return NextResponse.json({ message: "Username and role are required." }, { status: 400 });
  }

  const existing = await getAppUserByUsername(body.username);
  const normalizedPassword = body.password?.trim() || "";

  if (!existing && !normalizedPassword) {
    return NextResponse.json(
      { message: "Password is required when creating a new user." },
      { status: 400 }
    );
  }

  const saved = await upsertAppUser({
    username: body.username,
    displayName: body.displayName,
    passwordHash: normalizedPassword ? hashPassword(normalizedPassword) : undefined,
    role: body.role,
    isActive: body.isActive
  });

  if (!saved) {
    return NextResponse.json({ message: "Unable to save user." }, { status: 400 });
  }

  return NextResponse.json(saved, { status: 201 });
}

export async function DELETE(request: Request) {
  const auth = await requireApiSession(request, ["admin"]);
  if (auth.error) {
    return auth.error;
  }

  const body = (await request.json()) as {
    username?: string;
  };

  if (!body.username) {
    return NextResponse.json({ message: "Username is required." }, { status: 400 });
  }

  await deleteAppUser(body.username);
  return NextResponse.json({ ok: true });
}
