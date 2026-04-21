import { NextResponse } from "next/server";
import { listCases, replaceAllCases } from "@/lib/db";
import {
  exportCasesToGoogleSheet,
  hasGoogleSheetsConfig,
  importCasesFromGoogleSheet,
  isGoogleConnected
} from "@/lib/google-sheets";

export async function GET() {
  return NextResponse.json({
    configured: hasGoogleSheetsConfig(),
    connected: await isGoogleConnected()
  });
}

export async function POST(request: Request) {
  if (!hasGoogleSheetsConfig()) {
    return NextResponse.json(
      {
        message: "Google Sheets is not configured. Please fill .env.local first."
      },
      { status: 400 }
    );
  }

  if (!(await isGoogleConnected())) {
    return NextResponse.json(
      {
        message: "Google OAuth is not connected yet. Please connect your Google account first."
      },
      { status: 400 }
    );
  }

  const body = (await request.json()) as {
    direction: "export" | "import";
  };

  if (body.direction === "export") {
    const result = await exportCasesToGoogleSheet(await listCases());
    return NextResponse.json({
      direction: "export",
      ...result
    });
  }

  if (body.direction === "import") {
    const importedRows = await importCasesFromGoogleSheet();
    await replaceAllCases(importedRows);

    return NextResponse.json({
      direction: "import",
      importedRows: importedRows.length
    });
  }

  return NextResponse.json({ message: "Invalid direction." }, { status: 400 });
}
