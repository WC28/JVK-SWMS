import { calculateJvkDeadline, normalizeStatus } from "@/lib/business-days";
import { defaultCaseForm } from "@/lib/constants";
import type { AppUser, AllowedUserRole, CaseRecord, MonthlySnapshot } from "@/lib/types";

const PAGE_SIZE = 1000;

type DbCaseRow = {
  id: number;
  case_no: string;
  is_done: boolean;
  problem_social_list: string;
  priority: string;
  status: string;
  consult_date: string | null;
  deadline: string | null;
  ward_entry_date: string | null;
  sw_name: string;
  patient_name: string;
  intake: string;
  intake_no: string | null;
  sex: string;
  admit_date: string | null;
  age: number | null;
  hn: string | null;
  dx: string | null;
  ward: string;
  area: string;
  md_name: string;
  intervention_plan: string[] | string | null;
  dc_date: string | null;
  is_dc_done: boolean;
  followup_date: string | null;
  is_fu_done: boolean;
  note: string | null;
  created_at: string;
  updated_at: string;
};

type DbSnapshotRow = {
  id: number;
  snapshot_month: number;
  snapshot_year: number;
  snapshot_type: "team" | "sw";
  owner_name: string;
  total_cases: number;
  payload_json: Record<string, unknown> | string;
  created_at: string;
};

type DbSettingRow = {
  key: string;
  value: string;
  updated_at: string;
};

type DbAppUserRow = {
  username: string;
  password_hash: string;
  display_name: string;
  role: AllowedUserRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

function getSupabaseConfig() {
  const url = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error("SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is missing.");
  }

  return {
    restUrl: `${url.replace(/\/$/, "")}/rest/v1`,
    serviceRoleKey
  };
}

function hasSupabaseConfig() {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

async function supabaseRequest<T>(
  path: string,
  init: RequestInit = {},
  extraHeaders?: Record<string, string>
) {
  const { restUrl, serviceRoleKey } = getSupabaseConfig();
  const response = await fetch(`${restUrl}/${path}`, {
    ...init,
    cache: "no-store",
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      "Content-Type": "application/json",
      ...extraHeaders,
      ...(init.headers ?? {})
    }
  });

  if (!response.ok) {
    throw new Error(`Supabase request failed (${response.status}): ${await response.text()}`);
  }

  if (response.status === 204) {
    return null as T;
  }

  return (await response.json()) as T;
}

async function selectAll<T>(path: string) {
  const rows: T[] = [];
  let offset = 0;

  while (true) {
    const separator = path.includes("?") ? "&" : "?";
    const batch = await supabaseRequest<T[]>(
      `${path}${separator}limit=${PAGE_SIZE}&offset=${offset}`,
      { method: "GET" }
    );

    rows.push(...batch);

    if (batch.length < PAGE_SIZE) {
      break;
    }

    offset += PAGE_SIZE;
  }

  return rows;
}

function normalizeInterventionPlan(value: DbCaseRow["intervention_plan"]) {
  if (Array.isArray(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim()) {
    try {
      return JSON.parse(value) as string[];
    } catch {
      return value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
    }
  }

  return [];
}

function mapCaseRow(row: DbCaseRow): CaseRecord {
  return {
    id: row.id,
    caseNo: row.case_no,
    isDone: Boolean(row.is_done),
    problemSocialList: row.problem_social_list,
    priority: row.priority,
    status: row.status,
    consultDate: row.consult_date ?? "",
    deadline: row.deadline ?? "",
    wardEntryDate: row.ward_entry_date ?? "",
    swName: row.sw_name,
    patientName: row.patient_name,
    intake: row.intake,
    intakeNo: row.intake_no ?? "",
    sex: row.sex,
    admitDate: row.admit_date ?? "",
    age: row.age === null ? "" : String(row.age),
    hn: row.hn ?? "",
    dx: row.dx ?? "",
    ward: row.ward,
    patientNameCopy: row.patient_name,
    swNameCopy: row.sw_name,
    area: row.area,
    mdName: row.md_name,
    interventionPlan: normalizeInterventionPlan(row.intervention_plan),
    dcDate: row.dc_date ?? "",
    isDcDone: Boolean(row.is_dc_done),
    followupDate: row.followup_date ?? "",
    isFuDone: Boolean(row.is_fu_done),
    note: row.note ?? "",
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function mapSnapshotRow(row: DbSnapshotRow): MonthlySnapshot {
  const payload =
    typeof row.payload_json === "string"
      ? (JSON.parse(row.payload_json) as Record<string, unknown>)
      : row.payload_json;

  return {
    id: row.id,
    snapshotMonth: row.snapshot_month,
    snapshotYear: row.snapshot_year,
    snapshotType: row.snapshot_type,
    ownerName: row.owner_name,
    totalCases: row.total_cases,
    payload,
    createdAt: row.created_at
  };
}

function mapAppUserRow(row: DbAppUserRow): AppUser {
  return {
    username: row.username,
    displayName: row.display_name,
    role: row.role,
    isActive: Boolean(row.is_active),
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function normalizePayload(payload: Partial<CaseRecord>) {
  const consultDate = payload.consultDate ?? "";
  const deadline = consultDate ? calculateJvkDeadline(consultDate, 5) : "";
  const status = normalizeStatus({
    deadline,
    status: payload.status ?? defaultCaseForm.status,
    isDone: Boolean(payload.isDone)
  });

  return {
    case_no: payload.caseNo?.trim() || "",
    is_done: Boolean(payload.isDone),
    problem_social_list: payload.problemSocialList ?? defaultCaseForm.problemSocialList,
    priority: payload.priority ?? defaultCaseForm.priority,
    status,
    consult_date: consultDate || null,
    deadline: deadline || null,
    ward_entry_date: (payload.wardEntryDate ?? "") || null,
    sw_name: payload.swName ?? defaultCaseForm.swName,
    patient_name: payload.patientName?.trim() || "",
    intake: payload.intake ?? defaultCaseForm.intake,
    intake_no: payload.intakeNo?.trim() || null,
    sex: payload.sex ?? defaultCaseForm.sex,
    admit_date: (payload.admitDate ?? "") || null,
    age: payload.age === "" || payload.age === undefined ? null : Number(payload.age),
    hn: payload.hn?.trim() || null,
    dx: payload.dx?.trim() || null,
    ward: payload.ward ?? defaultCaseForm.ward,
    area: payload.area ?? defaultCaseForm.area,
    md_name: payload.mdName ?? defaultCaseForm.mdName,
    intervention_plan: payload.interventionPlan ?? [],
    dc_date: (payload.dcDate ?? "") || null,
    is_dc_done: Boolean(payload.isDcDone),
    followup_date: (payload.followupDate ?? "") || null,
    is_fu_done: Boolean(payload.isFuDone),
    note: payload.note?.trim() || null
  };
}

function unwrapSingle<T>(value: T[] | T | null) {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value;
}

export async function listCases() {
  if (!hasSupabaseConfig()) {
    return [];
  }

  const rows = await selectAll<DbCaseRow>("information_cases?select=*&order=updated_at.desc,id.desc");
  return rows.map(mapCaseRow);
}

export async function getCaseById(id: number) {
  if (!hasSupabaseConfig()) {
    return null;
  }

  const row = unwrapSingle(
    await supabaseRequest<DbCaseRow[]>(
      `information_cases?select=*&id=eq.${id}&limit=1`,
      { method: "GET" }
    )
  );

  return row ? mapCaseRow(row) : null;
}

export async function createCase(payload: Partial<CaseRecord>) {
  if (!hasSupabaseConfig()) {
    return null;
  }

  const normalized = normalizePayload(payload);
  const created = unwrapSingle(
    await supabaseRequest<DbCaseRow[]>("information_cases", {
      method: "POST",
      body: JSON.stringify(normalized)
    }, {
      Prefer: "return=representation"
    })
  );

  return created ? mapCaseRow(created) : null;
}

export async function updateCase(id: number, payload: Partial<CaseRecord>) {
  if (!hasSupabaseConfig()) {
    return null;
  }

  const normalized = normalizePayload(payload);
  const updated = unwrapSingle(
    await supabaseRequest<DbCaseRow[]>(
      `information_cases?id=eq.${id}`,
      {
        method: "PATCH",
        body: JSON.stringify({
          ...normalized,
          updated_at: new Date().toISOString()
        })
      },
      {
        Prefer: "return=representation"
      }
    )
  );

  return updated ? mapCaseRow(updated) : null;
}

export async function deleteCase(id: number) {
  if (!hasSupabaseConfig()) {
    return;
  }

  await supabaseRequest(
    `information_cases?id=eq.${id}`,
    { method: "DELETE" },
    { Prefer: "return=minimal" }
  );
}

export async function replaceAllCases(records: Partial<CaseRecord>[]) {
  if (!hasSupabaseConfig()) {
    return;
  }

  await supabaseRequest(
    "information_cases?id=gte.0",
    { method: "DELETE" },
    { Prefer: "return=minimal" }
  );

  if (records.length === 0) {
    return;
  }

  const normalizedRows = records.map(normalizePayload);
  for (let index = 0; index < normalizedRows.length; index += 200) {
    const batch = normalizedRows.slice(index, index + 200);
    await supabaseRequest(
      "information_cases",
      {
        method: "POST",
        body: JSON.stringify(batch)
      },
      {
        Prefer: "return=minimal"
      }
    );
  }
}

export async function listSnapshots() {
  if (!hasSupabaseConfig()) {
    return [];
  }

  const rows = await selectAll<DbSnapshotRow>(
    "monthly_snapshots?select=*&order=snapshot_year.desc,snapshot_month.desc,created_at.desc"
  );
  return rows.map(mapSnapshotRow);
}

export async function createSnapshot(input: {
  snapshotMonth: number;
  snapshotYear: number;
  snapshotType: "team" | "sw";
  ownerName: string;
  totalCases: number;
  payload: Record<string, unknown>;
}) {
  if (!hasSupabaseConfig()) {
    return null;
  }

  const created = unwrapSingle(
    await supabaseRequest<DbSnapshotRow[]>("monthly_snapshots", {
      method: "POST",
      body: JSON.stringify({
        snapshot_month: input.snapshotMonth,
        snapshot_year: input.snapshotYear,
        snapshot_type: input.snapshotType,
        owner_name: input.ownerName,
        total_cases: input.totalCases,
        payload_json: input.payload
      })
    }, {
      Prefer: "return=representation"
    })
  );

  return created ? mapSnapshotRow(created) : null;
}

export async function deleteSnapshot(id: number) {
  if (!hasSupabaseConfig()) {
    return;
  }

  await supabaseRequest(
    `monthly_snapshots?id=eq.${id}`,
    { method: "DELETE" },
    { Prefer: "return=minimal" }
  );
}

export async function clearSnapshots() {
  if (!hasSupabaseConfig()) {
    return;
  }

  await supabaseRequest(
    "monthly_snapshots?id=gte.0",
    { method: "DELETE" },
    { Prefer: "return=minimal" }
  );
}

export async function getAppSetting(key: string) {
  if (!hasSupabaseConfig()) {
    return null;
  }

  const row = unwrapSingle(
    await supabaseRequest<DbSettingRow[]>(
      `app_settings?select=key,value,updated_at&key=eq.${encodeURIComponent(key)}&limit=1`,
      { method: "GET" }
    )
  );

  return row?.value ?? null;
}

export async function setAppSetting(key: string, value: string) {
  if (!hasSupabaseConfig()) {
    return;
  }

  await supabaseRequest(
    "app_settings?on_conflict=key",
    {
      method: "POST",
      body: JSON.stringify({
        key,
        value,
        updated_at: new Date().toISOString()
      })
    },
    {
      Prefer: "resolution=merge-duplicates,return=minimal"
    }
  );
}

export async function deleteAppSetting(key: string) {
  if (!hasSupabaseConfig()) {
    return;
  }

  await supabaseRequest(
    `app_settings?key=eq.${encodeURIComponent(key)}`,
    { method: "DELETE" },
    { Prefer: "return=minimal" }
  );
}

export async function listAppUsers() {
  if (!hasSupabaseConfig()) {
    return [];
  }

  const rows = await selectAll<DbAppUserRow>("app_users?select=*&order=username.asc");
  return rows.map(mapAppUserRow);
}

export async function getAppUserByUsername(username: string) {
  if (!hasSupabaseConfig()) {
    return null;
  }

  const normalizedUsername = username.trim().toLowerCase();
  const row = unwrapSingle(
    await supabaseRequest<DbAppUserRow[]>(
      `app_users?select=*&username=eq.${encodeURIComponent(normalizedUsername)}&limit=1`,
      { method: "GET" }
    )
  );

  return row ? mapAppUserRow(row) : null;
}

export async function getAppUserAuthByUsername(username: string) {
  if (!hasSupabaseConfig()) {
    return null;
  }

  const normalizedUsername = username.trim().toLowerCase();
  const row = unwrapSingle(
    await supabaseRequest<DbAppUserRow[]>(
      `app_users?select=*&username=eq.${encodeURIComponent(normalizedUsername)}&limit=1`,
      { method: "GET" }
    )
  );

  return row;
}

export async function upsertAppUser(payload: {
  username: string;
  displayName?: string;
  passwordHash?: string;
  role: AllowedUserRole;
  isActive?: boolean;
}) {
  if (!hasSupabaseConfig()) {
    return null;
  }

  const normalizedUsername = payload.username.trim().toLowerCase();
  const existing = await getAppUserAuthByUsername(normalizedUsername);

  const normalized = {
    username: normalizedUsername,
    password_hash: payload.passwordHash ?? existing?.password_hash ?? "",
    display_name: payload.displayName?.trim() || "",
    role: payload.role,
    is_active: payload.isActive ?? true,
    updated_at: new Date().toISOString()
  };

  const saved = unwrapSingle(
    await supabaseRequest<DbAppUserRow[]>(
      "app_users",
      {
        method: "POST",
        body: JSON.stringify(normalized)
      },
      {
        Prefer: "resolution=merge-duplicates,return=representation"
      }
    )
  );

  return saved ? mapAppUserRow(saved) : null;
}

export async function deleteAppUser(username: string) {
  if (!hasSupabaseConfig()) {
    return;
  }

  await supabaseRequest(
    `app_users?username=eq.${encodeURIComponent(username.trim().toLowerCase())}`,
    { method: "DELETE" },
    { Prefer: "return=minimal" }
  );
}
