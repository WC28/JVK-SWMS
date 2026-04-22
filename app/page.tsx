import Link from "next/link";
import { requirePageSession } from "@/lib/app-auth";
import { MetricCard } from "@/components/metric-card";
import { SectionCard } from "@/components/section-card";
import { buildSummary } from "@/lib/analytics";
import { swOptions } from "@/lib/constants";
import { listCases } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  await requirePageSession();
  const summary = buildSummary(await listCases());

  return (
    <div className="stack-xl">
      <section className="hero hero-premium">
        <div className="hero-content">
          <div className="hero-brow">
            <span className="eyebrow">JVK SWMS</span>
            <span className="hero-status">Hospital High-Tech Edition</span>
          </div>

          <h1>JVK SWMS</h1>
          <p className="hero-copy">
            Information Case และ Dashboard รายเดือนในระบบเดียว ยกระดับงานสังคมสงเคราะห์จิตเวช
            สู่ดิจิทัล
          </p>
          <blockquote className="hero-quote">
            <span>สร้างระบบที่ทำให้</span>
            <span>นักสังคมสงเคราะห์จิตเวช</span>
            <span>มีเวลามากขึ้นสำหรับ สิ่งที่สำคัญที่สุด —</span>
            <strong>การดูแลผู้ป่วยและครอบครัว</strong>
          </blockquote>

          <div className="hero-actions">
            <Link className="button button-primary" href="/cases">
              เปิดหน้าบันทึกเคส
            </Link>
            <Link className="button button-secondary" href="/dashboard/team">
              ดู Team Dashboard
            </Link>
            <Link className="button button-secondary" href="/reports">
              เปิด Monthly Reports
            </Link>
          </div>

          <div className="hero-meta">
            <div className="hero-meta-card">
              <span className="hero-meta-label">Live Database</span>
              <strong>Supabase + Local User Auth</strong>
            </div>
            <div className="hero-meta-card">
              <span className="hero-meta-label">Workflow</span>
              <strong>Case Entry, Team KPI, SW KPI</strong>
            </div>
          </div>
        </div>

        <div className="hero-visual">
          <div className="hero-orb hero-orb-primary" />
          <div className="hero-orb hero-orb-secondary" />
          <div className="hero-glass">
            <div className="hero-glass-head">
              <img alt="JVK SW logo" className="hero-logo" src="/branding/jvk-sw-logo.png" />
              <div>
                <p className="hero-panel-title">Smart Social Work Console</p>
                <p className="hero-panel-subtitle">JVK psychiatric hospital workflow center</p>
              </div>
            </div>

            <div className="hero-glass-grid">
              <div className="hero-chip-card">
                <span>Care coordination</span>
                <strong>24/7</strong>
              </div>
              <div className="hero-chip-card">
                <span>Clinical visibility</span>
                <strong>Real-time</strong>
              </div>
              <div className="hero-chip-card">
                <span>Reporting</span>
                <strong>PNG + Monthly</strong>
              </div>
              <div className="hero-chip-card">
                <span>Identity</span>
                <strong>Username / Password</strong>
              </div>
            </div>

            <div className="hero-seal-row">
              <img alt="Department of Mental Health seal" className="hero-seal" src="/branding/dmh-seal.png" />
              <span>Trusted healthcare-ready visual system for mental health operations</span>
            </div>
          </div>
        </div>
      </section>

      <section className="metrics-grid">
        <MetricCard label="Total Cases" value={summary.totalCases} tone="blue" />
        <MetricCard label="In Progress" value={summary.inProgress} tone="indigo" />
        <MetricCard label="D/C" value={summary.dc} tone="lime" />
        <MetricCard label="Late" value={summary.late} tone="orange" />
      </section>

      <section className="content-grid">
        <SectionCard title="Quick Actions" subtitle="ทางลัดสำหรับการใช้งานประจำวัน">
          <div className="link-list action-link-list">
            <Link className="action-link" href="/cases">
              <strong>Case Entry</strong>
              <span>บันทึกข้อมูลเคสและติดตามสถานะ</span>
            </Link>
            <Link className="action-link" href="/dashboard/team">
              <strong>Team Dashboard</strong>
              <span>ดู KPI ภาพรวมกลุ่มงาน</span>
            </Link>
            <Link className="action-link" href="/dashboard/sw">
              <strong>SW Dashboard</strong>
              <span>วิเคราะห์รายนักสังคมสงเคราะห์</span>
            </Link>
            <Link className="action-link" href="/reports">
              <strong>Monthly Reports</strong>
              <span>snapshot รายเดือนและ export</span>
            </Link>
          </div>
        </SectionCard>

        <SectionCard title="ทีมสังคมสงเคราะห์" subtitle="รายชื่อ SW ที่ใช้ใน master data">
          <div className="chip-grid chip-grid-rich">
            {swOptions.map((name) => (
              <span key={name} className="chip">
                {name}
              </span>
            ))}
          </div>
        </SectionCard>
      </section>
    </div>
  );
}
