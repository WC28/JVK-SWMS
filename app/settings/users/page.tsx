import { AdminUsersClient } from "@/components/admin-users-client";
import { requirePageSession } from "@/lib/app-auth";
import { listAllowedUsers } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function SettingsUsersPage() {
  await requirePageSession(["admin"]);

  return (
    <div className="stack-xl">
      <section className="dashboard-banner reports-banner">
        <div>
          <p className="eyebrow filter-pill-light">Access Control</p>
          <h1>Allowed Users and Roles</h1>
          <p>กำหนดรายชื่อ Google account ที่อนุญาตให้เข้าใช้ระบบ พร้อม role แบบ admin, editor และ viewer</p>
        </div>
      </section>

      <AdminUsersClient initialUsers={await listAllowedUsers()} />
    </div>
  );
}
