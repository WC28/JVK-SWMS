import { requirePageSession } from "@/lib/app-auth";
import { CaseEntryClient } from "@/components/case-entry-client";
import { listCases } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function CasesPage() {
  const session = await requirePageSession();

  return (
    <CaseEntryClient
      canEdit={["admin", "editor"].includes(session.role)}
      initialCases={await listCases()}
      session={session}
    />
  );
}
