import crypto from "node:crypto";
import { google } from "googleapis";
import { deleteAppSetting, getAppSetting, setAppSetting } from "@/lib/db";
import type { CaseRecord } from "@/lib/types";

const SHEET_HEADERS = [
  "No.",
  "Done",
  "Problem Social List",
  "Priority",
  "Status",
  "Consult Date",
  "Deadline",
  "วันที่เข้าตึก",
  "SW",
  "Patient Name",
  "Intake",
  "No. Intake",
  "Sex",
  "Admit date",
  "Age",
  "HN",
  "DX",
  "ตึก",
  "Patient name copy",
  "SW copy",
  "พื้นที่",
  "MD",
  "Plan / Intervention / กระบวนการทางสังคม",
  "D/C DATE",
  "DONE D/C",
  "F/U DATE",
  "DONE F/U",
  "Note"
];

const OAUTH_SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];

type StoredGoogleTokens = {
  access_token?: string | null;
  refresh_token?: string | null;
  scope?: string | null;
  token_type?: string | null;
  expiry_date?: number | null;
};

function getSheetsConfig() {
  const rawSpreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
  const spreadsheetId =
    rawSpreadsheetId?.match(/\/d\/([a-zA-Z0-9-_]+)/)?.[1] ??
    rawSpreadsheetId?.split("/edit")[0] ??
    rawSpreadsheetId;

  return {
    spreadsheetId,
    sheetName: process.env.GOOGLE_SHEETS_SHEET_NAME || "Information Case"
  };
}

function getOauthConfig() {
  return {
    clientId: process.env.GOOGLE_OAUTH_CLIENT_ID,
    clientSecret: process.env.GOOGLE_OAUTH_CLIENT_SECRET,
    redirectUri: ""
  };
}

export function hasGoogleSheetsConfig() {
  const sheetConfig = getSheetsConfig();
  const oauthConfig = getOauthConfig();

  return Boolean(
    sheetConfig.spreadsheetId &&
      sheetConfig.sheetName &&
      oauthConfig.clientId &&
      oauthConfig.clientSecret
  );
}

export async function isGoogleConnected() {
  return Boolean(await getAppSetting("google_oauth_tokens"));
}

function createOauthClient(appUrl?: string) {
  const config = getOauthConfig();
  const resolvedAppUrl =
    appUrl ||
    process.env.APP_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : "http://localhost:3000");

  if (!config.clientId || !config.clientSecret) {
    throw new Error("Google OAuth environment variables are missing.");
  }

  return new google.auth.OAuth2(
    config.clientId,
    config.clientSecret,
    `${resolvedAppUrl}/api/google-oauth/callback`
  );
}

async function getStoredTokens() {
  const raw = await getAppSetting("google_oauth_tokens");
  return raw ? (JSON.parse(raw) as StoredGoogleTokens) : null;
}

async function saveTokens(tokens: StoredGoogleTokens) {
  await setAppSetting("google_oauth_tokens", JSON.stringify(tokens));
}

export function getGoogleAuthUrl(appUrl?: string) {
  const client = createOauthClient(appUrl);
  const state = crypto.randomUUID();

  return {
    state,
    url: client.generateAuthUrl({
      access_type: "offline",
      prompt: "consent",
      scope: OAUTH_SCOPES
    })
  };
}

export async function exchangeGoogleCode(code: string, appUrl?: string) {
  const client = createOauthClient(appUrl);
  const { tokens } = await client.getToken(code);

  if (!tokens.refresh_token) {
    const existing = await getStoredTokens();
    tokens.refresh_token = existing?.refresh_token ?? undefined;
  }

  await saveTokens(tokens);
  return tokens;
}

async function getSheetsClient() {
  const sheetConfig = getSheetsConfig();
  const tokens = await getStoredTokens();

  if (!sheetConfig.spreadsheetId || !tokens) {
    throw new Error("Google Sheets is not connected.");
  }

  const auth = createOauthClient();
  auth.setCredentials({
    access_token: tokens.access_token ?? undefined,
    refresh_token: tokens.refresh_token ?? undefined,
    scope: tokens.scope ?? undefined,
    token_type: tokens.token_type ?? undefined,
    expiry_date: tokens.expiry_date ?? undefined
  });

  auth.on("tokens", (newTokens) => {
    void (async () => {
      const current = (await getStoredTokens()) ?? {};
      await saveTokens({
        ...current,
        ...newTokens,
        refresh_token: newTokens.refresh_token ?? current.refresh_token ?? null
      });
    })();
  });

  return {
    spreadsheetId: sheetConfig.spreadsheetId,
    sheetName: sheetConfig.sheetName,
    sheets: google.sheets({ version: "v4", auth })
  };
}

export async function disconnectGoogleOAuth() {
  await deleteAppSetting("google_oauth_tokens");
  await deleteAppSetting("google_oauth_state");
}

function toSheetRow(record: CaseRecord) {
  return [
    record.caseNo,
    record.isDone ? "TRUE" : "FALSE",
    record.problemSocialList,
    record.priority,
    record.status,
    record.consultDate,
    record.deadline,
    record.wardEntryDate,
    record.swName,
    record.patientName,
    record.intake,
    record.intakeNo,
    record.sex,
    record.admitDate,
    record.age,
    record.hn,
    record.dx,
    record.ward,
    record.patientNameCopy,
    record.swNameCopy,
    record.area,
    record.mdName,
    record.interventionPlan.join(", "),
    record.dcDate,
    record.isDcDone ? "TRUE" : "FALSE",
    record.followupDate,
    record.isFuDone ? "TRUE" : "FALSE",
    record.note
  ];
}

function fromSheetRow(row: string[]) {
  return {
    caseNo: row[0] ?? "",
    isDone: (row[1] ?? "").toUpperCase() === "TRUE",
    problemSocialList: row[2] ?? "",
    priority: row[3] ?? "",
    status: row[4] ?? "",
    consultDate: row[5] ?? "",
    deadline: row[6] ?? "",
    wardEntryDate: row[7] ?? "",
    swName: row[8] ?? "",
    patientName: row[9] ?? "",
    intake: row[10] ?? "",
    intakeNo: row[11] ?? "",
    sex: row[12] ?? "",
    admitDate: row[13] ?? "",
    age: row[14] ?? "",
    hn: row[15] ?? "",
    dx: row[16] ?? "",
    ward: row[17] ?? "",
    area: row[20] ?? "",
    mdName: row[21] ?? "",
    interventionPlan: (row[22] ?? "")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean),
    dcDate: row[23] ?? "",
    isDcDone: (row[24] ?? "").toUpperCase() === "TRUE",
    followupDate: row[25] ?? "",
    isFuDone: (row[26] ?? "").toUpperCase() === "TRUE",
    note: row[27] ?? ""
  };
}

export async function exportCasesToGoogleSheet(records: CaseRecord[]) {
  const client = await getSheetsClient();
  const range = `${client.sheetName}!A1:AB`;
  const values = [SHEET_HEADERS, ...records.map(toSheetRow)];

  await client.sheets.spreadsheets.values.clear({
    spreadsheetId: client.spreadsheetId,
    range
  });

  await client.sheets.spreadsheets.values.update({
    spreadsheetId: client.spreadsheetId,
    range,
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values
    }
  });

  return {
    exportedRows: records.length
  };
}

export async function importCasesFromGoogleSheet() {
  const client = await getSheetsClient();
  const range = `${client.sheetName}!A2:AB`;

  const response = await client.sheets.spreadsheets.values.get({
    spreadsheetId: client.spreadsheetId,
    range
  });

  const rows = response.data.values ?? [];
  return rows.filter((row) => row.some(Boolean)).map((row) => fromSheetRow(row));
}
