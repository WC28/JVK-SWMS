import { NextResponse } from "next/server";
import { clearSnapshots, createSnapshot, deleteSnapshot, listCases, listSnapshots } from "@/lib/db";
import { filterCasesBySw, buildSummary, buildProblemBreakdown } from "@/lib/analytics";
import { filterCasesByMonthYear } from "@/lib/date-filters";

export async function GET() {
  return NextResponse.json(await listSnapshots());
}

export async function POST(request: Request) {
  const body = (await request.json()) as {
    snapshotMonth: number;
    snapshotYear: number;
    snapshotType: "team" | "sw";
    ownerName?: string;
  };

  const allCases = await listCases();
  const filteredByMonth = filterCasesByMonthYear(
    allCases,
    body.snapshotMonth,
    body.snapshotYear
  );

  const rows =
    body.snapshotType === "sw" && body.ownerName
      ? filterCasesBySw(filteredByMonth, body.ownerName)
      : filteredByMonth;

  const summary = buildSummary(rows);
  const topProblems = buildProblemBreakdown(rows).slice(0, 10);

  const snapshot = await createSnapshot({
    snapshotMonth: body.snapshotMonth,
    snapshotYear: body.snapshotYear,
    snapshotType: body.snapshotType,
    ownerName: body.snapshotType === "sw" ? body.ownerName || "Unknown SW" : "Team Dashboard",
    totalCases: summary.totalCases,
    payload: {
      summary,
      topProblems
    }
  });

  if (!snapshot) {
    return NextResponse.json({ message: "Unable to create snapshot." }, { status: 400 });
  }

  return NextResponse.json(snapshot, { status: 201 });
}

export async function DELETE(request: Request) {
  const body = (await request.json().catch(() => ({}))) as {
    id?: number;
    mode?: "single" | "all";
  };

  if (body.mode === "all") {
    await clearSnapshots();
    return NextResponse.json({ ok: true });
  }

  if (!body.id) {
    return NextResponse.json({ message: "Snapshot id is required." }, { status: 400 });
  }

  await deleteSnapshot(body.id);
  return NextResponse.json({ ok: true });
}
