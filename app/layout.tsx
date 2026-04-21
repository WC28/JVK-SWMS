import type { Metadata } from "next";
import { MainNav } from "@/components/main-nav";
import "./globals.css";

export const metadata: Metadata = {
  title: "JVK SWMS",
  description: "JVK Social Work Management System"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body>
        <div className="shell">
          <MainNav />
          <main className="page">{children}</main>
        </div>
      </body>
    </html>
  );
}
