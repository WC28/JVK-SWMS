"use client";

import { useEffect, useMemo, useState } from "react";
import { calculateJvkDeadline } from "@/lib/business-days";
import {
  areaOptions,
  defaultCaseForm,
  intakeOptions,
  interventionOptions,
  mdOptions,
  priorityOptions,
  problemOptions,
  sexOptions,
  statusOptions,
  swOptions,
  wardOptions,
  type CaseFormState
} from "@/lib/constants";
import type { AppUserSession, CaseRecord } from "@/lib/types";

type CaseEntryClientProps = {
  canEdit: boolean;
  initialCases: CaseRecord[];
  session: AppUserSession;
};

export function CaseEntryClient({ canEdit, initialCases, session }: CaseEntryClientProps) {
  const [cases, setCases] = useState(initialCases);
  const [form, setForm] = useState<CaseFormState>(defaultCaseForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [message, setMessage] = useState("");
  const [googleStatus, setGoogleStatus] = useState({
    configured: false,
    connected: false
  });
  const [filters, setFilters] = useState({
    month: "",
    year: "",
    swName: "",
    status: "",
    intake: ""
  });

  useEffect(() => {
    setCases(initialCases);
  }, [initialCases]);

  useEffect(() => {
    void fetch("/api/google-sync")
      .then((response) => response.json())
      .then((data: { configured: boolean; connected: boolean }) => {
        setGoogleStatus(data);
      })
      .catch(() => undefined);

    const params = new URLSearchParams(window.location.search);
    const google = params.get("google");
    if (google === "connected") {
      setMessage("เชื่อม Google OAuth สำเร็จแล้ว");
    } else if (google === "missing-config") {
      setMessage("ยังไม่ได้ตั้งค่า GOOGLE_OAUTH_CLIENT_ID / SECRET ใน .env.local");
    } else if (google === "invalid-state") {
      setMessage("Google OAuth state ไม่ถูกต้อง ลองเชื่อมใหม่อีกครั้ง");
    } else if (google === "denied") {
      setMessage("คุณยกเลิกการอนุญาต Google OAuth");
    }
  }, [initialCases]);

  const computedDeadline = useMemo(
    () => calculateJvkDeadline(form.consultDate, 5),
    [form.consultDate]
  );

  const summary = useMemo(
    () => ({
      total: cases.length,
      active: cases.filter((item) => item.status === "In progress").length,
      waiting: cases.filter((item) => item.status === "WAIT D/C").length,
      late: cases.filter((item) => item.status === "LATE").length
    }),
    [cases]
  );

  function updateField<K extends keyof CaseFormState>(key: K, value: CaseFormState[K]) {
    setForm((current) => ({
      ...current,
      [key]: value,
      ...(key === "consultDate" ? { deadline: calculateJvkDeadline(String(value), 5) } : {})
    }));
  }

  async function refreshCases() {
    const response = await fetch("/api/cases", { cache: "no-store" });
    const data = (await response.json()) as CaseRecord[];
    setCases(data);
  }

  function resetForm() {
    setEditingId(null);
    setForm(defaultCaseForm);
    setMessage("");
  }

  function fillForm(record: CaseRecord) {
    setEditingId(record.id);
    setForm({
      caseNo: record.caseNo,
      isDone: record.isDone,
      problemSocialList: record.problemSocialList,
      priority: record.priority,
      status: record.status,
      consultDate: record.consultDate,
      deadline: record.deadline,
      wardEntryDate: record.wardEntryDate,
      swName: record.swName,
      patientName: record.patientName,
      intake: record.intake,
      intakeNo: record.intakeNo,
      sex: record.sex,
      admitDate: record.admitDate,
      age: record.age,
      hn: record.hn,
      dx: record.dx,
      ward: record.ward,
      area: record.area,
      mdName: record.mdName,
      interventionPlan: record.interventionPlan,
      dcDate: record.dcDate,
      isDcDone: record.isDcDone,
      followupDate: record.followupDate,
      isFuDone: record.isFuDone,
      note: record.note
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function toggleIntervention(option: string) {
    setForm((current) => {
      const exists = current.interventionPlan.includes(option);
      return {
        ...current,
        interventionPlan: exists
          ? current.interventionPlan.filter((item) => item !== option)
          : [...current.interventionPlan, option]
      };
    });
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canEdit) {
      setMessage("บัญชีนี้ไม่มีสิทธิ์บันทึกข้อมูล");
      return;
    }

    setIsSubmitting(true);
    setMessage("");

    const response = await fetch(editingId ? `/api/cases/${editingId}` : "/api/cases", {
      method: editingId ? "PUT" : "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        ...form,
        deadline: computedDeadline
      })
    });

    setIsSubmitting(false);

    if (!response.ok) {
      setMessage("บันทึกข้อมูลไม่สำเร็จ");
      return;
    }

    await refreshCases();
    setMessage(editingId ? "อัปเดตข้อมูลเคสแล้ว" : "บันทึกเคสใหม่แล้ว");
    resetForm();
  }

  async function handleDelete(id: number) {
    if (!canEdit) {
      setMessage("บัญชีนี้ไม่มีสิทธิ์ลบข้อมูล");
      return;
    }

    if (!window.confirm("ต้องการลบเคสนี้ใช่หรือไม่")) {
      return;
    }

    await fetch(`/api/cases/${id}`, { method: "DELETE" });
    await refreshCases();

    if (editingId === id) {
      resetForm();
    }
  }

  async function handleGoogleSync(direction: "export" | "import") {
    if (!canEdit) {
      setMessage("บัญชีนี้ไม่มีสิทธิ์ sync กับ Google Sheet");
      return;
    }

    setIsSyncing(true);
    setMessage("");

    const response = await fetch("/api/google-sync", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ direction })
    });

    const payload = (await response.json()) as {
      message?: string;
      exportedRows?: number;
      importedRows?: number;
    };

    setIsSyncing(false);

    if (!response.ok) {
      setMessage(payload.message || "Google Sheet sync ไม่สำเร็จ");
      return;
    }

    if (direction === "import") {
      await refreshCases();
      setMessage(`Import จาก Google Sheet แล้ว ${payload.importedRows ?? 0} rows`);
      return;
    }

    setMessage(`Export ไป Google Sheet แล้ว ${payload.exportedRows ?? 0} rows`);
  }

  async function handleDisconnectGoogle() {
    if (!canEdit) {
      setMessage("บัญชีนี้ไม่มีสิทธิ์ตัดการเชื่อม Google");
      return;
    }

    await fetch("/api/google-oauth/disconnect", {
      method: "POST"
    });

    setGoogleStatus({
      configured: googleStatus.configured,
      connected: false
    });
    setMessage("ตัดการเชื่อม Google OAuth แล้ว");
  }

  const filteredCases = cases.filter((item) => {
    const consult = item.consultDate || "";
    const [year, month] = consult.split("-");

    return (
      (!filters.month || month === filters.month.padStart(2, "0")) &&
      (!filters.year || year === filters.year) &&
      (!filters.swName || item.swName === filters.swName) &&
      (!filters.status || item.status === filters.status) &&
      (!filters.intake || item.intake === filters.intake)
    );
  });

  return (
    <div className="stack-xl">
      <section className="case-command">
        <div className="case-command-copy">
          <span className="eyebrow">Clinical Case Workspace</span>
          <h1>{editingId ? "Update Information Case" : "Create Information Case"}</h1>
          <p>
            ออกแบบใหม่ให้เหมาะกับการบันทึกข้อมูลเคสแบบ clinical workflow, ดูสถานะการ sync,
            คัดกรอง registry และจัดการข้อมูลในประสบการณ์เดียว
          </p>
        </div>

        <div className="case-command-actions">
          <button className="button button-primary" disabled={!canEdit} form="case-form" type="submit">
            {isSubmitting ? "Saving..." : editingId ? "อัปเดตเคส" : "บันทึกเคส"}
          </button>
          <button className="button button-secondary" disabled={!canEdit} onClick={resetForm} type="button">
            ล้างฟอร์ม
          </button>
          {googleStatus.connected ? (
            <button className="button button-secondary" disabled={!canEdit} onClick={handleDisconnectGoogle} type="button">
              Disconnect Google
            </button>
          ) : (
            <a
              aria-disabled={!canEdit}
              className={`button button-secondary${!canEdit ? " button-disabled" : ""}`}
              href={canEdit ? "/api/google-oauth/start" : "#"}
            >
              Connect Google
            </a>
          )}
          <button
            className="button button-secondary"
            disabled={!canEdit || !googleStatus.connected || isSyncing}
            onClick={() => handleGoogleSync("export")}
            type="button"
          >
            {isSyncing ? "Syncing..." : "Export Google Sheet"}
          </button>
          <button
            className="button button-secondary"
            disabled={!canEdit || !googleStatus.connected || isSyncing}
            onClick={() => handleGoogleSync("import")}
            type="button"
          >
            {isSyncing ? "Syncing..." : "Import Google Sheet"}
          </button>
        </div>
      </section>

      <section className="case-clinical-overview">
        <div className="case-status-rail">
          <div className="filter-pill">
            Google Config: {googleStatus.configured ? "พร้อม" : "ยังไม่ครบ"}
          </div>
          <div className="filter-pill">
            Google OAuth: {googleStatus.connected ? "เชื่อมแล้ว" : "ยังไม่เชื่อม"}
          </div>
          <div className="filter-pill">Registry: {filteredCases.length} cases</div>
          <div className="filter-pill">{`${session.displayName} • ${session.role}`}</div>
        </div>

        <div className="case-stat-grid">
          <div className="case-stat-card">
            <span>Total cases</span>
            <strong>{summary.total}</strong>
          </div>
          <div className="case-stat-card">
            <span>Active flow</span>
            <strong>{summary.active}</strong>
          </div>
          <div className="case-stat-card">
            <span>Wait D/C</span>
            <strong>{summary.waiting}</strong>
          </div>
          <div className="case-stat-card">
            <span>Late cases</span>
            <strong>{summary.late}</strong>
          </div>
        </div>
      </section>

      <section className="case-filter-panel">
        <div className="section-head">
          <h2>Case Registry Filters</h2>
          <p className="section-subtitle">ใช้คัดกรองรายการเคสก่อนตรวจทาน แก้ไข หรือนำออก report</p>
        </div>
        <div className="case-filter-grid">
          <label className="field compact-field">
            <span>เดือน</span>
            <input
              max="12"
              min="1"
              onChange={(event) =>
                setFilters((current) => ({ ...current, month: event.target.value }))
              }
              placeholder="เช่น 4"
              type="number"
              value={filters.month}
            />
          </label>
          <label className="field compact-field">
            <span>ปี</span>
            <input
              onChange={(event) =>
                setFilters((current) => ({ ...current, year: event.target.value }))
              }
              placeholder="เช่น 2026"
              type="number"
              value={filters.year}
            />
          </label>
          <label className="field compact-field">
            <span>SW</span>
            <select
              onChange={(event) =>
                setFilters((current) => ({ ...current, swName: event.target.value }))
              }
              value={filters.swName}
            >
              <option value="">ทั้งหมด</option>
              {swOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
          <label className="field compact-field">
            <span>Status</span>
            <select
              onChange={(event) =>
                setFilters((current) => ({ ...current, status: event.target.value }))
              }
              value={filters.status}
            >
              <option value="">ทั้งหมด</option>
              {statusOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
          <label className="field compact-field">
            <span>Intake</span>
            <select
              onChange={(event) =>
                setFilters((current) => ({ ...current, intake: event.target.value }))
              }
              value={filters.intake}
            >
              <option value="">ทั้งหมด</option>
              {intakeOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      {message ? <p className="feedback">{message}</p> : null}
      {!canEdit ? (
        <p className="feedback">
          บัญชีนี้เป็น viewer จึงดูข้อมูลได้อย่างเดียว หากต้องการบันทึกหรือแก้ไขข้อมูลให้ผู้ดูแลเปลี่ยนสิทธิ์เป็น editor หรือ admin
        </p>
      ) : null}

      <form className="case-clinical-layout" id="case-form" onSubmit={handleSubmit}>
        <aside className="case-sidebar">
          <section className="form-section form-section-featured">
            <div className="section-head">
              <h2>Case Identity</h2>
              <p className="section-subtitle">ข้อมูลอ้างอิงหลักและ workflow status ของเคสนี้</p>
            </div>

            <div className="field">
              <span>No.</span>
              <input onChange={(event) => updateField("caseNo", event.target.value)} required value={form.caseNo} />
            </div>

            <div className="field">
              <span>SW</span>
              <select onChange={(event) => updateField("swName", event.target.value)} value={form.swName}>
                {swOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div className="field">
              <span>Status</span>
              <select onChange={(event) => updateField("status", event.target.value)} value={form.status}>
                {statusOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div className="field">
              <span>Priority</span>
              <select onChange={(event) => updateField("priority", event.target.value)} value={form.priority}>
                {priorityOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div className="field field-inline-check">
              <span>Done</span>
              <input checked={form.isDone} onChange={(event) => updateField("isDone", event.target.checked)} type="checkbox" />
            </div>

            <div className="clinical-mini-grid">
              <div className="clinical-mini-card">
                <span>Consult date</span>
                <strong>{form.consultDate || "-"}</strong>
              </div>
              <div className="clinical-mini-card">
                <span>Deadline</span>
                <strong>{computedDeadline || "-"}</strong>
              </div>
            </div>
          </section>
        </aside>

        <div className="case-main-form stack-lg">
          <section className="form-section">
            <div className="section-head">
              <h2>Clinical Workflow</h2>
              <p className="section-subtitle">สถานะ ปัญหา วันที่ปรึกษา deadline และการเข้าตึก</p>
            </div>
            <div className="form-grid">
              <label className="field form-span-2">
                <span>Problem Social List</span>
                <select onChange={(event) => updateField("problemSocialList", event.target.value)} value={form.problemSocialList}>
                  {problemOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field">
                <span>Consult Date</span>
                <input onChange={(event) => updateField("consultDate", event.target.value)} type="date" value={form.consultDate} />
              </label>
              <label className="field">
                <span>Deadline</span>
                <input readOnly type="date" value={computedDeadline} />
              </label>
              <label className="field">
                <span>วันที่เข้าตึก</span>
                <input onChange={(event) => updateField("wardEntryDate", event.target.value)} type="date" value={form.wardEntryDate} />
              </label>
            </div>
          </section>

          <section className="form-section">
            <div className="section-head">
              <h2>Patient Profile</h2>
              <p className="section-subtitle">ชื่อผู้ป่วย ข้อมูลการรับบริการ demographic และข้อมูลเวชระเบียน</p>
            </div>
            <div className="form-grid">
              <label className="field form-span-2">
                <span>Patient Name</span>
                <input onChange={(event) => updateField("patientName", event.target.value)} required value={form.patientName} />
              </label>
              <label className="field">
                <span>Patient name (copy)</span>
                <input readOnly value={form.patientName} />
              </label>
              <label className="field">
                <span>SW (copy)</span>
                <input readOnly value={form.swName} />
              </label>
              <label className="field">
                <span>Intake</span>
                <select onChange={(event) => updateField("intake", event.target.value)} value={form.intake}>
                  {intakeOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field">
                <span>No. (Intake)</span>
                <input onChange={(event) => updateField("intakeNo", event.target.value)} value={form.intakeNo} />
              </label>
              <label className="field">
                <span>Sex</span>
                <select onChange={(event) => updateField("sex", event.target.value)} value={form.sex}>
                  {sexOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field">
                <span>Age</span>
                <input min="0" onChange={(event) => updateField("age", event.target.value)} type="number" value={form.age} />
              </label>
              <label className="field">
                <span>Admit Date</span>
                <input onChange={(event) => updateField("admitDate", event.target.value)} type="date" value={form.admitDate} />
              </label>
              <label className="field">
                <span>HN</span>
                <input onChange={(event) => updateField("hn", event.target.value)} value={form.hn} />
              </label>
              <label className="field form-span-2">
                <span>DX</span>
                <input onChange={(event) => updateField("dx", event.target.value)} value={form.dx} />
              </label>
              <label className="field">
                <span>ตึก</span>
                <select onChange={(event) => updateField("ward", event.target.value)} value={form.ward}>
                  {wardOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field">
                <span>พื้นที่</span>
                <select onChange={(event) => updateField("area", event.target.value)} value={form.area}>
                  {areaOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field">
                <span>MD</span>
                <select onChange={(event) => updateField("mdName", event.target.value)} value={form.mdName}>
                  {mdOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </section>

          <section className="form-section">
            <div className="section-head">
              <h2>Intervention Planning</h2>
              <p className="section-subtitle">เลือกหลายรายการได้สำหรับกระบวนการทางสังคมและ clinical intervention</p>
            </div>
            <label className="field">
              <span>Plan / Intervention / กระบวนการทางสังคม</span>
              <div className="checkbox-grid">
                {interventionOptions.map((option) => (
                  <label className="checkbox-option" key={option}>
                    <input checked={form.interventionPlan.includes(option)} onChange={() => toggleIntervention(option)} type="checkbox" />
                    <span>{option}</span>
                  </label>
                ))}
              </div>
            </label>
          </section>

          <section className="form-section">
            <div className="section-head">
              <h2>Follow-up and Closure</h2>
              <p className="section-subtitle">จัดการ D/C, follow-up และบันทึกสรุปทางสังคมสงเคราะห์</p>
            </div>
            <div className="form-grid">
              <label className="field">
                <span>D/C DATE</span>
                <input onChange={(event) => updateField("dcDate", event.target.value)} type="date" value={form.dcDate} />
              </label>
              <label className="field field-inline-check">
                <span>DONE (D/C)</span>
                <input checked={form.isDcDone} onChange={(event) => updateField("isDcDone", event.target.checked)} type="checkbox" />
              </label>
              <label className="field">
                <span>F/U DATE</span>
                <input onChange={(event) => updateField("followupDate", event.target.value)} type="date" value={form.followupDate} />
              </label>
              <label className="field field-inline-check">
                <span>DONE (F/U)</span>
                <input checked={form.isFuDone} onChange={(event) => updateField("isFuDone", event.target.checked)} type="checkbox" />
              </label>
            </div>
            <label className="field">
              <span>Note</span>
              <textarea onChange={(event) => updateField("note", event.target.value)} rows={5} value={form.note} />
            </label>
          </section>
        </div>
      </form>

      <section className="table-card">
        <div className="table-head">
          <div>
            <h2>Case Registry</h2>
            <p className="section-subtitle">รายการเคสจากฐานข้อมูล production พร้อม sticky header บน desktop และ mobile cards บนจอเล็ก</p>
          </div>
          <span className="record-count">{filteredCases.length} records</span>
        </div>

        <div className="table-scroll desktop-table">
          <table className="data-table sticky-table">
            <thead>
              <tr>
                <th>No.</th>
                <th>Status</th>
                <th>Consult</th>
                <th>Deadline</th>
                <th>SW</th>
                <th>Patient</th>
                <th>Intake</th>
                <th>Ward</th>
                <th>Problem</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCases.length === 0 ? (
                <tr>
                  <td className="empty-row" colSpan={10}>
                    ไม่พบข้อมูลตาม filter ปัจจุบัน
                  </td>
                </tr>
              ) : (
                filteredCases.map((item) => (
                  <tr key={item.id}>
                    <td>{item.caseNo}</td>
                    <td>{item.status}</td>
                    <td>{item.consultDate || "-"}</td>
                    <td>{item.deadline || "-"}</td>
                    <td>{item.swName}</td>
                    <td>{item.patientName}</td>
                    <td>{item.intake}</td>
                    <td>{item.ward}</td>
                    <td>{item.problemSocialList}</td>
                    <td>
                      <div className="table-actions">
                        <button className="button button-secondary" onClick={() => fillForm(item)} type="button">
                          Edit
                        </button>
                        <button className="button button-danger" disabled={!canEdit} onClick={() => handleDelete(item.id)} type="button">
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="mobile-records">
          {filteredCases.length === 0 ? (
            <div className="mobile-record-card">
              <p className="empty-row">ไม่พบข้อมูลตาม filter ปัจจุบัน</p>
            </div>
          ) : (
            filteredCases.map((item) => (
              <article className="mobile-record-card" key={item.id}>
                <div className="mobile-record-head">
                  <strong>{item.patientName}</strong>
                  <span className="filter-pill">{item.status}</span>
                </div>
                <div className="mobile-record-grid">
                  <div>
                    <span>No.</span>
                    <strong>{item.caseNo}</strong>
                  </div>
                  <div>
                    <span>Consult</span>
                    <strong>{item.consultDate || "-"}</strong>
                  </div>
                  <div>
                    <span>Deadline</span>
                    <strong>{item.deadline || "-"}</strong>
                  </div>
                  <div>
                    <span>SW</span>
                    <strong>{item.swName}</strong>
                  </div>
                  <div>
                    <span>Intake</span>
                    <strong>{item.intake}</strong>
                  </div>
                  <div>
                    <span>Ward</span>
                    <strong>{item.ward}</strong>
                  </div>
                </div>
                <div className="mobile-record-problem">
                  <span>Problem</span>
                  <strong>{item.problemSocialList}</strong>
                </div>
                <div className="table-actions">
                  <button className="button button-secondary" onClick={() => fillForm(item)} type="button">
                    Edit
                  </button>
                  <button className="button button-danger" disabled={!canEdit} onClick={() => handleDelete(item.id)} type="button">
                    Delete
                  </button>
                </div>
              </article>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
