"use client";

import { useState } from "react";
import { MonthYearFilter } from "@/components/month-year-filter";
import { swOptions } from "@/lib/constants";
import type { MonthlySnapshot } from "@/lib/types";

type SwBoard = {
  swName: string;
  summary: {
    totalCases: number;
    inProgress: number;
    dc: number;
    late: number;
    waitDc: number;
    opd: number;
    ipd: number;
    er: number;
  };
  topProblems: Array<{ label: string; total: number }>;
  longStay: Array<{ patientName: string; days: number }>;
};

type CountEntry = {
  label: string;
  total: number;
};

type MdSwMatrixRow = {
  mdName: string;
  swCounts: Array<{ swName: string; total: number }>;
};

type AreaBySwBoard = {
  swName: string;
  areas: Array<{ area: string; total: number }>;
};

type ReportsClientProps = {
  areaCounts: CountEntry[];
  areaBySwBoards: AreaBySwBoard[];
  initialSnapshots: MonthlySnapshot[];
  mdIpd: CountEntry[];
  mdMatrixIpd: MdSwMatrixRow[];
  mdMatrixOpd: MdSwMatrixRow[];
  mdOpd: CountEntry[];
  mdTotal: CountEntry[];
  month: number;
  swChildOpd: CountEntry[];
  swBoards: SwBoard[];
  swEr: CountEntry[];
  swFemale: CountEntry[];
  swIpd: CountEntry[];
  swMale: CountEntry[];
  swOpd: CountEntry[];
  swTotals: CountEntry[];
  topProblems: Array<{ label: string; total: number }>;
  wardCounts: CountEntry[];
  year: number;
};

export function ReportsClient({
  areaCounts,
  areaBySwBoards,
  initialSnapshots,
  mdIpd,
  mdMatrixIpd,
  mdMatrixOpd,
  mdOpd,
  mdTotal,
  month,
  swChildOpd,
  swBoards,
  swEr,
  swFemale,
  swIpd,
  swMale,
  swOpd,
  swTotals,
  topProblems,
  wardCounts,
  year
}: ReportsClientProps) {
  const [snapshots, setSnapshots] = useState(initialSnapshots);
  const [isSavingTeam, setIsSavingTeam] = useState(false);
  const [isSavingSw, setIsSavingSw] = useState(false);
  const [isClearingSnapshots, setIsClearingSnapshots] = useState(false);
  const [selectedSw, setSelectedSw] = useState<string>(swOptions[0]);
  const [message, setMessage] = useState("");

  async function refreshSnapshots() {
    const response = await fetch("/api/snapshots", { cache: "no-store" });
    const data = (await response.json()) as MonthlySnapshot[];
    setSnapshots(data);
  }

  async function createTeamSnapshot() {
    setIsSavingTeam(true);
    setMessage("");

    const response = await fetch("/api/snapshots", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        snapshotMonth: month,
        snapshotYear: year,
        snapshotType: "team"
      })
    });

    setIsSavingTeam(false);
    if (!response.ok) {
      setMessage("บันทึก Team Snapshot ไม่สำเร็จ");
      return;
    }

    await refreshSnapshots();
    setMessage("บันทึก Team Snapshot แล้ว");
  }

  async function createSwSnapshot() {
    setIsSavingSw(true);
    setMessage("");

    const response = await fetch("/api/snapshots", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        snapshotMonth: month,
        snapshotYear: year,
        snapshotType: "sw",
        ownerName: selectedSw
      })
    });

    setIsSavingSw(false);
    if (!response.ok) {
      setMessage("บันทึก SW Snapshot ไม่สำเร็จ");
      return;
    }

    await refreshSnapshots();
    setMessage(`บันทึก SW Snapshot สำหรับ ${selectedSw} แล้ว`);
  }

  async function clearAllSnapshots() {
    if (!window.confirm("ต้องการล้าง Saved Snapshots ทั้งหมดใช่หรือไม่")) {
      return;
    }

    setIsClearingSnapshots(true);
    setMessage("");

    const response = await fetch("/api/snapshots", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mode: "all" })
    });

    setIsClearingSnapshots(false);

    if (!response.ok) {
      setMessage("ล้าง snapshots ไม่สำเร็จ");
      return;
    }

    await refreshSnapshots();
    setMessage("ล้าง Saved Snapshots ทั้งหมดแล้ว");
  }

  async function deleteOneSnapshot(id: number) {
    const response = await fetch("/api/snapshots", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, mode: "single" })
    });

    if (!response.ok) {
      setMessage("ลบ snapshot ไม่สำเร็จ");
      return;
    }

    await refreshSnapshots();
    setMessage("ลบ snapshot แล้ว");
  }

  const teamSnapshots = snapshots.filter((snapshot) => snapshot.snapshotType === "team");
  const swSnapshots = snapshots.filter((snapshot) => snapshot.snapshotType === "sw");

  function renderMetricGrid(title: string, entries: CountEntry[], toneClass = "") {
    return (
      <section className={`section-card reports-panel ${toneClass}`.trim()}>
        <div className="section-head">
          <h2>{title}</h2>
        </div>
        <div className="reports-matrix-grid">
          {entries.map((entry) => (
            <article className="reports-matrix-item" key={`${title}-${entry.label}`}>
              <span>{entry.label}</span>
              <strong>{entry.total}</strong>
            </article>
          ))}
        </div>
      </section>
    );
  }

  function renderMdMatrix(title: string, rows: MdSwMatrixRow[], toneClass = "") {
    return (
      <section className={`section-card reports-panel ${toneClass}`.trim()}>
        <div className="section-head">
          <h2>{title}</h2>
        </div>
        <div className="reports-md-matrix-stack">
          {rows.map((row) => (
            <div className="reports-md-matrix-card" key={row.mdName}>
              <div className="reports-md-matrix-head">{row.mdName}</div>
              <div className="reports-md-matrix-grid">
                {row.swCounts.map((item) => (
                  <article className="reports-matrix-item" key={`${row.mdName}-${item.swName}`}>
                    <span>{item.swName}</span>
                    <strong>{item.total}</strong>
                  </article>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <div className="stack-xl">
      <section className="filter-bar">
        <MonthYearFilter month={month} year={year} />
      </section>

      {message ? <p className="feedback">{message}</p> : null}

      <section className="reports-overview-grid">
        <article className="reports-overview-card reports-overview-card-primary">
          <span className="eyebrow">Current Reporting Window</span>
          <h2>{`${month}/${year}`}</h2>
          <p>บริหาร snapshot และ monthly reporting ของรอบเวลาปัจจุบันใน workspace เดียว</p>
        </article>

        <article className="reports-overview-card">
          <span>All snapshots</span>
          <strong>{snapshots.length}</strong>
        </article>

        <article className="reports-overview-card">
          <span>Team snapshots</span>
          <strong>{teamSnapshots.length}</strong>
        </article>

        <article className="reports-overview-card">
          <span>SW snapshots</span>
          <strong>{swSnapshots.length}</strong>
        </article>
      </section>

      <section className="reports-grid">
        <div className="section-card reports-panel">
          <div className="section-head">
            <h2>Generate Snapshot</h2>
            <p className="section-subtitle">บันทึกประวัติรายงานรายเดือนลงฐานข้อมูลเพื่อใช้อ้างอิงย้อนหลัง</p>
          </div>
          <div className="stack-lg">
            <button className="button button-primary" onClick={createTeamSnapshot} type="button">
              {isSavingTeam ? "Saving..." : "Save Team Snapshot"}
            </button>
            <div className="stack-lg">
              <label className="field">
                <span>เลือก SW</span>
                <select onChange={(event) => setSelectedSw(event.target.value)} value={selectedSw}>
                  {swOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
              <button className="button button-secondary" onClick={createSwSnapshot} type="button">
                {isSavingSw ? "Saving..." : "Save SW Snapshot"}
              </button>
            </div>
            <button className="button button-danger" onClick={clearAllSnapshots} type="button">
              {isClearingSnapshots ? "Clearing..." : "Clear Saved Snapshots"}
            </button>
          </div>
        </div>

        <div className="section-card reports-panel">
          <div className="section-head">
            <h2>Executive Export Routes</h2>
            <p className="section-subtitle">เปิด dashboard พร้อม month/year ที่เลือกไว้เพื่อ export PNG ต่อได้ทันที</p>
          </div>
          <div className="reports-shortcut-list">
            <a className="action-link" href={`/dashboard/team?month=${month}&year=${year}`}>
              <strong>Team Dashboard Export</strong>
              <span>เปิดภาพรวมกลุ่มงานตามเดือนและปีปัจจุบัน</span>
            </a>
            <a
              className="action-link"
              href={`/dashboard/sw?month=${month}&year=${year}&sw=${encodeURIComponent(selectedSw)}`}
            >
              <strong>SW Dashboard Export</strong>
              <span>{`เปิด KPI ของ ${selectedSw} พร้อมช่วงเวลาที่เลือก`}</span>
            </a>
          </div>
        </div>
      </section>

      <section className="section-card reports-panel">
        <div className="section-head">
          <h2>Saved Monthly Snapshots</h2>
          <p className="section-subtitle">ประวัติ snapshot ที่เก็บไว้ในฐานข้อมูล พร้อม sticky header บน desktop และ cards บน mobile</p>
        </div>
        <div className="table-scroll desktop-table">
          <table className="compact-table sticky-table">
            <thead>
              <tr>
                <th>Month</th>
                <th>Type</th>
                <th>Owner</th>
                <th>Total Cases</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {snapshots.length === 0 ? (
                <tr>
                  <td className="empty-row" colSpan={6}>
                    ยังไม่มี snapshot
                  </td>
                </tr>
              ) : (
                snapshots.map((snapshot) => (
                  <tr key={snapshot.id}>
                    <td>{`${snapshot.snapshotMonth}/${snapshot.snapshotYear}`}</td>
                    <td>{snapshot.snapshotType}</td>
                    <td>{snapshot.ownerName}</td>
                    <td>{snapshot.totalCases}</td>
                    <td>{snapshot.createdAt}</td>
                    <td>
                      <button
                        className="button button-danger"
                        onClick={() => deleteOneSnapshot(snapshot.id)}
                        type="button"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="mobile-records">
          {snapshots.length === 0 ? (
            <div className="mobile-record-card">
              <p className="empty-row">ยังไม่มี snapshot</p>
            </div>
          ) : (
            snapshots.map((snapshot) => (
              <article className="mobile-record-card" key={snapshot.id}>
                <div className="mobile-record-head">
                  <strong>{`${snapshot.snapshotMonth}/${snapshot.snapshotYear}`}</strong>
                  <span className="filter-pill">{snapshot.snapshotType}</span>
                </div>
                <div className="mobile-record-grid">
                  <div>
                    <span>Owner</span>
                    <strong>{snapshot.ownerName || "-"}</strong>
                  </div>
                  <div>
                    <span>Total Cases</span>
                    <strong>{snapshot.totalCases}</strong>
                  </div>
                  <div>
                    <span>Created</span>
                    <strong>{snapshot.createdAt}</strong>
                  </div>
                </div>
                <div className="table-actions">
                  <button
                    className="button button-danger"
                    onClick={() => deleteOneSnapshot(snapshot.id)}
                    type="button"
                  >
                    Delete
                  </button>
                </div>
              </article>
            ))
          )}
        </div>
      </section>

      <section className="section-card reports-panel">
        <div className="section-head">
          <h2>Top ปัญหา/เรื่อง ของทั้งกลุ่มงาน</h2>
          <p className="section-subtitle">สรุปภาพรวมปัญหาที่ส่งปรึกษากลุ่มงานสังคมสงเคราะห์มากที่สุดในเดือนที่เลือก</p>
        </div>
        <div className="reports-problem-grid">
          {topProblems.map((row) => (
            <article className="reports-problem-card" key={row.label}>
              <strong>{row.label}</strong>
              <span>{row.total}</span>
            </article>
          ))}
        </div>
      </section>

      <section className="reports-grid reports-grid-2x">
        {renderMetricGrid("KPI Total Intake Cases (แยกตาม SW)", swTotals, "reports-tone-blue")}
        {renderMetricGrid("KPI Total OPD (แยกตาม SW)", swOpd, "reports-tone-cyan")}
        {renderMetricGrid("KPI Total IPD (แยกตาม SW)", swIpd, "reports-tone-indigo")}
        {renderMetricGrid("KPI Total ER (แยกตาม SW)", swEr, "reports-tone-red")}
        {renderMetricGrid("KPI Total OPD เด็ก (แยกตาม SW)", swChildOpd, "reports-tone-aqua")}
        {renderMetricGrid("Total Male (each SW)", swMale, "reports-tone-navy")}
        {renderMetricGrid("Total Female (each SW)", swFemale, "reports-tone-pink")}
        {renderMetricGrid("KPI ตึกที่ส่งปรึกษานักสังคมสงเคราะห์", wardCounts, "reports-tone-lime")}
      </section>

      <section className="reports-grid reports-grid-2x">
        {renderMetricGrid("KPI Total MD Consult SW", mdTotal, "reports-tone-yellow")}
        {renderMetricGrid("KPI Total MD OPD Consult SW", mdOpd, "reports-tone-cyan")}
        {renderMetricGrid("KPI Total MD IPD Consult SW", mdIpd, "reports-tone-indigo")}
        {renderMetricGrid("พื้นที่ที่ส่งปรึกษากลุ่มงานสังคมสงเคราะห์", areaCounts, "reports-tone-orange")}
      </section>

      <section className="reports-grid reports-grid-2x">
        {renderMdMatrix("KPI MD OPD Consult SW Matrix", mdMatrixOpd, "reports-tone-cyan")}
        {renderMdMatrix("KPI MD IPD Consult SW Matrix", mdMatrixIpd, "reports-tone-indigo")}
      </section>

      <section className="stack-lg">
        <div className="section-head">
          <h2>Dashboard รายนักสังคมสงเคราะห์</h2>
          <p className="section-subtitle">เพิ่มมุมมอง KPI ย่อของแต่ละคน พร้อม top ปัญหาและเคสนอนเรือนนาน</p>
        </div>

        <div className="reports-sw-board-grid">
          {swBoards.map((board) => (
            <article className="reports-sw-board" key={board.swName}>
              <div className="reports-sw-board-head">
                <h3>{`KPI Dashboard - ${board.swName}`}</h3>
              </div>

              <div className="reports-sw-kpi-grid">
                <div className="reports-sw-kpi">
                  <span>Total cases</span>
                  <strong>{board.summary.totalCases}</strong>
                </div>
                <div className="reports-sw-kpi">
                  <span>In Progress</span>
                  <strong>{board.summary.inProgress}</strong>
                </div>
                <div className="reports-sw-kpi">
                  <span>LATE</span>
                  <strong>{board.summary.late}</strong>
                </div>
                <div className="reports-sw-kpi">
                  <span>WAIT D/C</span>
                  <strong>{board.summary.waitDc}</strong>
                </div>
                <div className="reports-sw-kpi">
                  <span>D/C</span>
                  <strong>{board.summary.dc}</strong>
                </div>
                <div className="reports-sw-kpi">
                  <span>OPD / IPD / ER</span>
                  <strong>{`${board.summary.opd} / ${board.summary.ipd} / ${board.summary.er}`}</strong>
                </div>
              </div>

              <div className="reports-sw-detail-grid">
                <div className="reports-sw-detail-card">
                  <h4>Top 5 ปัญหา/เรื่อง</h4>
                  <div className="reports-mini-list">
                    {board.topProblems.length === 0 ? (
                      <p className="empty-row">ยังไม่มีข้อมูล</p>
                    ) : (
                      board.topProblems.map((problem) => (
                        <div className="reports-mini-row" key={problem.label}>
                          <span>{problem.label}</span>
                          <strong>{problem.total}</strong>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="reports-sw-detail-card">
                  <h4>Top 5 ผู้ป่วยค้างวอร์ด/นอนเรือนนาน</h4>
                  <div className="reports-mini-list">
                    {board.longStay.length === 0 ? (
                      <p className="empty-row">ยังไม่มีข้อมูล</p>
                    ) : (
                      board.longStay.map((patient, index) => (
                        <div className="reports-mini-row" key={`${patient.patientName}-${index}`}>
                          <span>{patient.patientName}</span>
                          <strong>{patient.days}</strong>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="stack-lg">
        <div className="section-head">
          <h2>Dashboard พื้นที่แยกตาม SW</h2>
          <p className="section-subtitle">สถิติพื้นที่/อำเภอ/จังหวัดของผู้ป่วยที่ส่งปรึกษา แยกเป็นรายนักสังคมสงเคราะห์</p>
        </div>

        <div className="reports-area-board-grid">
          {areaBySwBoards.map((board) => (
            <article className="reports-area-board" key={board.swName}>
              <div className="reports-area-board-head">{board.swName}</div>
              <div className="reports-area-list">
                {board.areas.map((entry) => (
                  <div className="reports-area-row" key={`${board.swName}-${entry.area}`}>
                    <span>{entry.area}</span>
                    <strong>{entry.total}</strong>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
