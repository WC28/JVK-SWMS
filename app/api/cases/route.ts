import { NextResponse } from "next/server";
import { requireApiSession } from "@/lib/app-auth";
import { createCase, listCases } from "@/lib/db";

export async function GET(request: Request) {
  const auth = await requireApiSession(request);
  if (auth.error) {
    return auth.error;
  }

  return NextResponse.json(await listCases());
}

export async function POST(request: Request) {
  const auth = await requireApiSession(request, ["admin", "editor"]);
  if (auth.error) {
    return auth.error;
  }

  const payload = await request.json();
  const created = await createCase(payload);

  if (!created) {
    return NextResponse.json({ message: "Unable to create case." }, { status: 400 });
  }

  return NextResponse.json(created, { status: 201 });
}
