import type { Metadata } from "next";
import { getCurrentSession } from "@/lib/app-auth";
import { MainNav } from "@/components/main-nav";
import "./globals.css";

export const metadata: Metadata = {
  title: "JVK SWMS",
  description: "JVK Social Work Management System"
};

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getCurrentSession();

  return (
    <html lang="th">
      <body>
        <div className="shell">
          <MainNav session={session} />
          <main className="page">{children}</main>
        </div>
      </body>
    </html>
  );
}
