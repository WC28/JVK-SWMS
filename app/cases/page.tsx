import { CaseEntryClient } from "@/components/case-entry-client";
import { listCases } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function CasesPage() {
  return <CaseEntryClient initialCases={await listCases()} />;
}
