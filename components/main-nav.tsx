import Link from "next/link";
import type { AppUserSession } from "@/lib/types";

const items = [
  { href: "/", label: "Home" },
  { href: "/cases", label: "Case Entry" },
  { href: "/dashboard/team", label: "Team Dashboard" },
  { href: "/dashboard/sw", label: "SW Dashboard" },
  { href: "/reports", label: "Monthly Reports" }
];

type MainNavProps = {
  session: AppUserSession | null;
};

export function MainNav({ session }: MainNavProps) {
  const navigationItems =
    session?.role === "admin"
      ? [...items, { href: "/settings/users", label: "User Access" }]
      : items;

  return (
    <header className="main-nav">
      <div className="brand-cluster">
        <Link className="brand brand-rich" href="/">
          <img
            alt="JVK Social Work logo"
            className="brand-logo"
            src="/branding/jvk-sw-logo.png"
          />
          <div className="brand-copy">
            <span className="brand-kicker">Psychiatric Care Platform</span>
            <span className="brand-mark">JVK SWMS</span>
            <span className="brand-sub">Information Case, KPI Dashboard, Monthly Reporting</span>
          </div>
        </Link>

        <div className="brand-badge">
          <img
            alt="Department of Mental Health seal"
            className="seal-logo"
            src="/branding/dmh-seal.png"
          />
          <div className="brand-badge-copy">
            <strong>Department of Mental Health</strong>
            <span>High-tech social work management workspace</span>
          </div>
        </div>
      </div>

      <nav className="nav-links">
        {navigationItems.map((item) => (
          <Link className="nav-link" href={item.href} key={item.href}>
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="nav-user">
        {session ? (
          <>
            <div className="nav-user-badge">
              <strong>{session.displayName}</strong>
              <span>{`${session.role} • ${session.username}`}</span>
            </div>
            <a className="button button-secondary" href="/api/auth/logout">
              Sign out
            </a>
          </>
        ) : (
          <Link className="button button-primary" href="/login">
            Sign in
          </Link>
        )}
      </div>
    </header>
  );
}
