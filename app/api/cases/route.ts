import { NextResponse } from "next/server";
import { createCase, listCases } from "@/lib/db";

export async function GET() {
  return NextResponse.json(await listCases());
}

export async function POST(request: Request) {
  const payload = await request.json();
  const created = await createCase(payload);

  if (!created) {
    return NextResponse.json({ message: "Unable to create case." }, { status: 400 });
  }

  return NextResponse.json(created, { status: 201 });
}
