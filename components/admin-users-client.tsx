"use client";

import { useState } from "react";
import type { AppUser, AllowedUserRole } from "@/lib/types";

type AdminUsersClientProps = {
  initialUsers: AppUser[];
};

const roleOptions: AllowedUserRole[] = ["admin", "editor", "viewer"];

export function AdminUsersClient({ initialUsers }: AdminUsersClientProps) {
  const [users, setUsers] = useState(initialUsers);
  const [form, setForm] = useState({
    username: "",
    displayName: "",
    password: "",
    role: "viewer" as AllowedUserRole,
    isActive: true
  });
  const [message, setMessage] = useState("");

  async function refreshUsers() {
    const response = await fetch("/api/app-users", { cache: "no-store" });
    const payload = (await response.json()) as AppUser[];
    setUsers(payload);
  }

  async function saveUser(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    const response = await fetch("/api/app-users", {
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
      username: "",
      displayName: "",
      password: "",
      role: "viewer",
      isActive: true
    });
    setMessage("บันทึกบัญชีผู้ใช้แล้ว");
  }

  async function removeUser(username: string) {
    if (!window.confirm(`ต้องการลบผู้ใช้ ${username} ออกจากระบบใช่หรือไม่`)) {
      return;
    }

    const response = await fetch("/api/app-users", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ username })
    });

    if (!response.ok) {
      setMessage("ลบผู้ใช้ไม่สำเร็จ");
      return;
    }

    await refreshUsers();
    setMessage("ลบบัญชีผู้ใช้แล้ว");
  }

  async function updateRole(user: AppUser, role: AllowedUserRole) {
    const response = await fetch("/api/app-users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        username: user.username,
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
    setMessage(`อัปเดต role ของ ${user.username} แล้ว`);
  }

  async function toggleActive(user: AppUser) {
    const response = await fetch("/api/app-users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        username: user.username,
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
    setMessage(`อัปเดตสถานะของ ${user.username} แล้ว`);
  }

  async function resetPassword(user: AppUser) {
    const password = window.prompt(`ตั้งรหัสผ่านใหม่สำหรับ ${user.username}`);
    if (!password) {
      return;
    }

    const response = await fetch("/api/app-users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        username: user.username,
        displayName: user.displayName,
        password,
        role: user.role,
        isActive: user.isActive
      })
    });

    if (!response.ok) {
      setMessage("รีเซ็ตรหัสผ่านไม่สำเร็จ");
      return;
    }

    setMessage(`รีเซ็ตรหัสผ่านของ ${user.username} แล้ว`);
  }

  return (
    <div className="stack-xl">
      <section className="section-card reports-panel">
        <div className="section-head">
          <h2>System User Accounts</h2>
          <p className="section-subtitle">
            สร้างผู้ใช้แบบ username/password และกำหนดสิทธิ์เป็น admin, editor หรือ viewer
          </p>
        </div>

        {message ? <p className="feedback">{message}</p> : null}

        <form className="admin-user-form" onSubmit={saveUser}>
          <label className="field">
            <span>Username</span>
            <input
              required
              type="text"
              value={form.username}
              onChange={(event) =>
                setForm((current) => ({ ...current, username: event.target.value }))
              }
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
            <span>Password</span>
            <input
              minLength={8}
              required
              type="password"
              value={form.password}
              onChange={(event) =>
                setForm((current) => ({ ...current, password: event.target.value }))
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
            Save user account
          </button>
        </form>
      </section>

      <section className="section-card reports-panel">
        <div className="section-head">
          <h2>User Access List</h2>
          <p className="section-subtitle">{`ตอนนี้มี ${users.length} บัญชีในระบบ`}</p>
        </div>

        <div className="table-scroll">
          <table className="compact-table sticky-table">
            <thead>
              <tr>
                <th>Username</th>
                <th>Name</th>
                <th>Role</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.username}>
                  <td>{user.username}</td>
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
                      className="button button-secondary"
                      onClick={() => resetPassword(user)}
                      type="button"
                    >
                      Reset Password
                    </button>
                    <button
                      className="button button-danger"
                      onClick={() => removeUser(user.username)}
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
