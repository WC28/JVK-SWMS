import Link from "next/link";
import { getCurrentSession } from "@/lib/app-auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

type LoginPageProps = {
  searchParams?: Promise<{
    error?: string;
    loggedOut?: string;
  }>;
};

const errorMessages: Record<string, string> = {
  "missing-credentials": "กรุณากรอก username และ password",
  "invalid-credentials": "username หรือ password ไม่ถูกต้อง",
  "session-required": "กรุณาเข้าสู่ระบบก่อนใช้งาน"
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
          <h1>Sign in with Username &amp; Password</h1>
          <p>
            ระบบนี้ใช้บัญชีภายในของหน่วยงาน ผู้ดูแลสามารถกำหนด username, password และสิทธิ์
            การใช้งานได้ไม่จำกัดจำนวนผู้ใช้
          </p>
        </div>

        {resolved?.loggedOut ? <p className="feedback">ออกจากระบบแล้ว</p> : null}
        {error ? <p className="feedback feedback-error">{error}</p> : null}

        <form action="/api/auth/login" className="auth-form" method="POST">
          <label className="field">
            <span>Username</span>
            <input autoComplete="username" name="username" required type="text" />
          </label>

          <label className="field">
            <span>Password</span>
            <input autoComplete="current-password" name="password" required type="password" />
          </label>

          <div className="auth-actions">
            <button className="button button-primary" type="submit">
              Sign in
            </button>
            <Link className="button button-secondary" href="/">
              เปิดหน้าเว็บหลัก
            </Link>
          </div>
        </form>
      </section>
    </div>
  );
}
