export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import prisma from "../../../../../src/lib/prisma";
import { hashPassword } from "@ryzenpanel/shared/src/utils/hash";
import { createSession } from "../../../../../src/lib/auth";
import { GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET, GITHUB_REDIRECT_URI, COOKIE_NAME, SESSION_MAX_AGE_SECONDS } from "@ryzenpanel/shared/src/constants";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  if (!code) return NextResponse.json({ message: "Missing OAuth code." }, { status: 400 });

  const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ client_id: GITHUB_CLIENT_ID, client_secret: GITHUB_CLIENT_SECRET, code, redirect_uri: GITHUB_REDIRECT_URI }),
  });
  const tokenData = await tokenRes.json();
  if (!tokenData.access_token) return NextResponse.json({ message: "GitHub OAuth failed." }, { status: 500 });

  const profileRes = await fetch("https://api.github.com/user", { headers: { Authorization: `Bearer ${tokenData.access_token}` } });
  const profile = await profileRes.json();
  if (!profile.id) return NextResponse.json({ message: "GitHub profile fetch failed." }, { status: 500 });

  const emailRes = await fetch("https://api.github.com/user/emails", { headers: { Authorization: `Bearer ${tokenData.access_token}` } });
  const emails = await emailRes.json();
  const primary = Array.isArray(emails) ? emails.find((e: any) => e.primary) : null;
  const email = primary?.email || `${profile.id}@github.local`;

  let user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    user = await prisma.user.create({
      data: { email, username: profile.login, password: await hashPassword(crypto.randomUUID()), role: "USER", emailVerified: true },
    });
  }

  await prisma.oAuthAccount.upsert({
    where: { provider_providerId: { provider: "github", providerId: String(profile.id) } },
    create: { provider: "github", providerId: String(profile.id), accessToken: tokenData.access_token, userId: user.id },
    update: { accessToken: tokenData.access_token },
  });

  const { jwt } = await createSession(user, request);
  const response = NextResponse.redirect(new URL("/settings", request.url));
  response.cookies.set({ name: COOKIE_NAME, value: jwt, httpOnly: true, path: "/", maxAge: SESSION_MAX_AGE_SECONDS, secure: process.env.NODE_ENV === "production", sameSite: "lax" });
  return response;
}
