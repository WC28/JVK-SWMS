import { NextResponse } from "next/server";
import { requireApiSession } from "@/lib/app-auth";
import { deleteAllowedUser, listAllowedUsers, upsertAllowedUser } from "@/lib/db";
import type { AllowedUserRole } from "@/lib/types";

export async function GET(request: Request) {
  const auth = await requireApiSession(request, ["admin"]);
  if (auth.error) {
    return auth.error;
  }

  return NextResponse.json(await listAllowedUsers());
}

export async function POST(request: Request) {
  const auth = await requireApiSession(request, ["admin"]);
  if (auth.error) {
    return auth.error;
  }

  const body = (await request.json()) as {
    email: string;
    displayName?: string;
    role: AllowedUserRole;
    isActive?: boolean;
  };

  if (!body.email || !body.role) {
    return NextResponse.json({ message: "Email and role are required." }, { status: 400 });
  }

  const saved = await upsertAllowedUser(body);
  return NextResponse.json(saved, { status: 201 });
}

export async function DELETE(request: Request) {
  const auth = await requireApiSession(request, ["admin"]);
  if (auth.error) {
    return auth.error;
  }

  const body = (await request.json()) as {
    email?: string;
  };

  if (!body.email) {
    return NextResponse.json({ message: "Email is required." }, { status: 400 });
  }

  await deleteAllowedUser(body.email);
  return NextResponse.json({ ok: true });
}
