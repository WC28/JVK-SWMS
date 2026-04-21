import Link from "next/link";
import { getCurrentSession } from "@/lib/app-auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

type LoginPageProps = {
  searchParams?: Promise<{
    error?: string;
    loggedOut?: string;
    email?: string;
  }>;
};

const errorMessages: Record<string, string> = {
  "missing-google-config": "ยังไม่ได้ตั้งค่า Google OAuth สำหรับระบบล็อกอิน",
  "google-denied": "คุณยกเลิกการลงชื่อเข้าใช้ด้วย Google",
  "invalid-state": "ข้อมูลยืนยันตัวตนไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง",
  "missing-email": "Google account นี้ไม่มีอีเมลที่ยืนยันแล้ว",
  "not-allowed": "อีเมลนี้ยังไม่ได้รับสิทธิ์เข้าใช้งานระบบ"
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const session = await getCurrentSession();
  if (session) {
    redirect("/");
  }

  const resolved = searchParams ? await searchParams : undefined;
  const error = resolved?.error ? errorMessages[resolved.error] ?? "ไม่สามารถเข้าสู่ระบบได้" : "";

  return (
    <div className="auth-page">
      <section className="auth-card">
        <div className="auth-card-copy">
          <span className="eyebrow">Secure JVK Access</span>
          <h1>Sign in with Google</h1>
          <p>
            ระบบนี้จำกัดการเข้าใช้งานเฉพาะอีเมลที่ได้รับอนุญาตจากผู้ดูแลเท่านั้น
            หากคุณอยู่ในรายชื่อ 8 คนที่อนุญาต ระบบจะกำหนดสิทธิ์ดูข้อมูลหรือกรอกข้อมูลให้อัตโนมัติ
          </p>
        </div>

        {resolved?.loggedOut ? <p className="feedback">ออกจากระบบแล้ว</p> : null}
        {error ? <p className="feedback feedback-error">{error}</p> : null}
        {resolved?.email ? <p className="feedback">อีเมลที่ถูกปฏิเสธ: {resolved.email}</p> : null}

        <div className="auth-actions">
          <a className="button button-primary" href="/api/auth/google/start">
            Continue with Google
          </a>
          <Link className="button button-secondary" href="https://jvk-swms-wc28.vercel.app">
            เปิดหน้าเว็บหลัก
          </Link>
        </div>
      </section>
    </div>
  );
}
