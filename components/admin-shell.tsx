"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useState } from "react";
import { adminNavItems } from "@/lib/admin-data";

type AdminShellProps = {
  children: ReactNode;
};

export function AdminShell({ children }: AdminShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  async function onLogout() {
    setLoggingOut(true);
    await fetch("/api/admin/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto flex w-full max-w-7xl gap-6 px-6 py-8">
        <aside className="card sticky top-6 h-fit w-64 p-4">
          <div className="mb-5 flex items-center justify-between">
            <h1 className="text-lg font-semibold text-slate-900">后台管理</h1>
            <button type="button" className="rounded-md border border-slate-300 px-2 py-1 text-xs text-slate-700" onClick={onLogout} disabled={loggingOut}>
              {loggingOut ? "退出中..." : "退出"}
            </button>
          </div>
          <nav className="space-y-1">
            {adminNavItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link key={item.href} href={item.href} className={`block rounded-lg px-3 py-2 text-sm transition ${isActive ? "bg-brand-100 text-brand-800" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"}`}>
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
