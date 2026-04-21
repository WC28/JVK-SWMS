import { NextResponse } from "next/server";
import { requireApiSession } from "@/lib/app-auth";
import { deleteCase, getCaseById, updateCase } from "@/lib/db";

type Context = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(request: Request, context: Context) {
  const auth = await requireApiSession(request);
  if (auth.error) {
    return auth.error;
  }

  const params = await context.params;
  const record = await getCaseById(Number(params.id));

  if (!record) {
    return NextResponse.json({ message: "Case not found." }, { status: 404 });
  }

  return NextResponse.json(record);
}

export async function PUT(request: Request, context: Context) {
  const auth = await requireApiSession(request, ["admin", "editor"]);
  if (auth.error) {
    return auth.error;
  }

  const params = await context.params;
  const payload = await request.json();
  const updated = await updateCase(Number(params.id), payload);

  if (!updated) {
    return NextResponse.json({ message: "Case not found." }, { status: 404 });
  }

  return NextResponse.json(updated);
}

export async function DELETE(request: Request, context: Context) {
  const auth = await requireApiSession(request, ["admin", "editor"]);
  if (auth.error) {
    return auth.error;
  }

  const params = await context.params;
  await deleteCase(Number(params.id));
  return NextResponse.json({ ok: true });
}
