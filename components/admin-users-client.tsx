"use client";

import { useState } from "react";
import type { AllowedUser, AllowedUserRole } from "@/lib/types";

type AdminUsersClientProps = {
  initialUsers: AllowedUser[];
};

const roleOptions: AllowedUserRole[] = ["admin", "editor", "viewer"];

export function AdminUsersClient({ initialUsers }: AdminUsersClientProps) {
  const [users, setUsers] = useState(initialUsers);
  const [form, setForm] = useState({
    email: "",
    displayName: "",
    role: "viewer" as AllowedUserRole,
    isActive: true
  });
  const [message, setMessage] = useState("");

  async function refreshUsers() {
    const response = await fetch("/api/allowed-users", { cache: "no-store" });
    const payload = (await response.json()) as AllowedUser[];
    setUsers(payload);
  }

  async function saveUser(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    const response = await fetch("/api/allowed-users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(form)
    });

    if (!response.ok) {
      setMessage("บันทึกรายชื่อผู้ใช้ไม่สำเร็จ");
      return;
    }

    await refreshUsers();
    setForm({
      email: "",
      displayName: "",
      role: "viewer",
      isActive: true
    });
    setMessage("บันทึกรายชื่อผู้ใช้แล้ว");
  }

  async function removeUser(email: string) {
    if (!window.confirm(`ต้องการลบ ${email} ออกจากรายชื่ออนุญาตใช่หรือไม่`)) {
      return;
    }

    const response = await fetch("/api/allowed-users", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email })
    });

    if (!response.ok) {
      setMessage("ลบผู้ใช้ไม่สำเร็จ");
      return;
    }

    await refreshUsers();
    setMessage("ลบผู้ใช้ออกจากรายชื่อแล้ว");
  }

  async function updateRole(user: AllowedUser, role: AllowedUserRole) {
    const response = await fetch("/api/allowed-users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email: user.email,
        displayName: user.displayName,
        role,
        isActive: user.isActive
      })
    });

    if (!response.ok) {
      setMessage("อัปเดต role ไม่สำเร็จ");
      return;
    }

    await refreshUsers();
    setMessage(`อัปเดต role ของ ${user.email} แล้ว`);
  }

  async function toggleActive(user: AllowedUser) {
    const response = await fetch("/api/allowed-users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email: user.email,
        displayName: user.displayName,
        role: user.role,
        isActive: !user.isActive
      })
    });

    if (!response.ok) {
      setMessage("อัปเดตสถานะผู้ใช้ไม่สำเร็จ");
      return;
    }

    await refreshUsers();
    setMessage(`อัปเดตสถานะของ ${user.email} แล้ว`);
  }

  return (
    <div className="stack-xl">
      <section className="section-card reports-panel">
        <div className="section-head">
          <h2>Allowed Google Accounts</h2>
          <p className="section-subtitle">
            จำกัดการเข้าระบบเฉพาะอีเมลที่อนุญาต และกำหนดสิทธิ์เป็น admin, editor หรือ viewer
          </p>
        </div>

        {message ? <p className="feedback">{message}</p> : null}

        <form className="admin-user-form" onSubmit={saveUser}>
          <label className="field">
            <span>Email</span>
            <input
              required
              type="email"
              value={form.email}
              onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
            />
          </label>

          <label className="field">
            <span>Display name</span>
            <input
              type="text"
              value={form.displayName}
              onChange={(event) =>
                setForm((current) => ({ ...current, displayName: event.target.value }))
              }
            />
          </label>

          <label className="field">
            <span>Role</span>
            <select
              value={form.role}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  role: event.target.value as AllowedUserRole
                }))
              }
            >
              {roleOptions.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </label>

          <label className="checkbox-field">
            <input
              checked={form.isActive}
              type="checkbox"
              onChange={(event) =>
                setForm((current) => ({ ...current, isActive: event.target.checked }))
              }
            />
            <span>Active</span>
          </label>

          <button className="button button-primary" type="submit">
            Save allowed user
          </button>
        </form>
      </section>

      <section className="section-card reports-panel">
        <div className="section-head">
          <h2>User Access List</h2>
          <p className="section-subtitle">{`ตอนนี้มี ${users.length} อีเมลในรายการอนุญาต`}</p>
        </div>

        <div className="table-scroll">
          <table className="compact-table sticky-table">
            <thead>
              <tr>
                <th>Email</th>
                <th>Name</th>
                <th>Role</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.email}>
                  <td>{user.email}</td>
                  <td>{user.displayName || "-"}</td>
                  <td>
                    <select
                      value={user.role}
                      onChange={(event) =>
                        updateRole(user, event.target.value as AllowedUserRole)
                      }
                    >
                      {roleOptions.map((role) => (
                        <option key={role} value={role}>
                          {role}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>{user.isActive ? "active" : "inactive"}</td>
                  <td className="admin-user-actions">
                    <button
                      className="button button-secondary"
                      onClick={() => toggleActive(user)}
                      type="button"
                    >
                      {user.isActive ? "Disable" : "Enable"}
                    </button>
                    <button
                      className="button button-danger"
                      onClick={() => removeUser(user.email)}
                      type="button"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
