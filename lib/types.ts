import type { CaseFormState } from "@/lib/constants";

export type AllowedUserRole = "admin" | "editor" | "viewer";

export type CaseRecord = CaseFormState & {
  id: number;
  patientNameCopy: string;
  swNameCopy: string;
  createdAt: string;
  updatedAt: string;
};

export type AppUser = {
  username: string;
  displayName: string;
  role: AllowedUserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type AppUserSession = {
  username: string;
  displayName: string;
  role: AllowedUserRole;
  expiresAt: number;
};

export type MonthlySnapshot = {
  id: number;
  snapshotMonth: number;
  snapshotYear: number;
  snapshotType: "team" | "sw";
  ownerName: string;
  totalCases: number;
  payload: Record<string, unknown>;
  createdAt: string;
};
