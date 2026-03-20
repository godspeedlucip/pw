"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/admin/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    setLoading(false);

    if (!res.ok) {
      setError("邮箱或密码错误");
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md items-center px-6">
      <section className="card w-full p-8">
        <h1 className="text-2xl font-semibold text-slate-900">后台登录</h1>
        <p className="mt-2 text-sm text-slate-600">请输入管理员账号后继续。</p>

        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          <label className="block text-sm font-medium text-slate-700">
            邮箱
            <input className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            密码
            <input className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </label>

          {error ? <p className="text-sm text-red-600">{error}</p> : null}

          <button type="submit" className="w-full rounded-lg bg-brand-600 px-3 py-2 font-medium text-white hover:bg-brand-700 disabled:opacity-70" disabled={loading}>
            {loading ? "登录中..." : "登录"}
          </button>
        </form>
      </section>
    </main>
  );
}
