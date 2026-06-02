"use client";

import { type FormEvent, useState } from "react";

export default function PasswordResetRequestPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus(null);

    const response = await fetch("/api/auth/reset/request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    if (response.ok) {
      setStatus("If that email exists, a reset link has been sent.");
      setEmail("");
      return;
    }

    const result = await response.json();
    setStatus(result.message ?? "Unable to request password reset.");
  }

  return (
    <main className="mx-auto max-w-md px-6 py-16">
      <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-8 shadow-xl shadow-slate-950/30">
        <h1 className="text-3xl font-semibold text-white">Reset your password</h1>
        <p className="mt-2 text-slate-400">Enter the email address associated with your account.</p>
        {status ? <div className="mt-4 rounded-2xl bg-slate-800 px-4 py-3 text-slate-200">{status}</div> : null}
        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          <label className="block">
            <span className="text-sm text-slate-300">Email</span>
            <input
              className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-cyan-500"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </label>
          <button className="w-full rounded-2xl bg-cyan-600 px-4 py-3 font-semibold text-slate-950 transition hover:bg-cyan-500" type="submit">
            Request reset link
          </button>
        </form>
      </div>
    </main>
  );
}
