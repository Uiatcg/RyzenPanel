export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import prisma from "../../../../../src/lib/prisma";
import { hashPassword } from "@ryzenpanel/shared/src/utils/hash";
import { createSession } from "../../../../../src/lib/auth";
import { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI, COOKIE_NAME, SESSION_MAX_AGE_SECONDS } from "@ryzenpanel/shared/src/constants";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  if (!code) return NextResponse.json({ message: "Missing OAuth code." }, { status: 400 });

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ client_id: GOOGLE_CLIENT_ID, client_secret: GOOGLE_CLIENT_SECRET, code, redirect_uri: GOOGLE_REDIRECT_URI, grant_type: "authorization_code" }),
  });
  const tokenData = await tokenRes.json();
  if (!tokenData.access_token) return NextResponse.json({ message: "Google OAuth failed." }, { status: 500 });

  const profileRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", { headers: { Authorization: `Bearer ${tokenData.access_token}` } });
  const profile = await profileRes.json();
  if (!profile.id) return NextResponse.json({ message: "Google profile fetch failed." }, { status: 500 });

  const email = profile.email || `${profile.id}@google.local`;

  let user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    user = await prisma.user.create({
      data: { email, username: profile.name || profile.email?.split("@")[0] || `user${profile.id}`, password: await hashPassword(crypto.randomUUID()), role: "USER", emailVerified: true },
    });
  }

  await prisma.oAuthAccount.upsert({
    where: { provider_providerId: { provider: "google", providerId: String(profile.id) } },
    create: { provider: "google", providerId: String(profile.id), accessToken: tokenData.access_token, userId: user.id },
    update: { accessToken: tokenData.access_token },
  });

  const { jwt } = await createSession(user, request);
  const response = NextResponse.redirect(new URL("/settings", request.url));
  response.cookies.set({ name: COOKIE_NAME, value: jwt, httpOnly: true, path: "/", maxAge: SESSION_MAX_AGE_SECONDS, secure: process.env.NODE_ENV === "production", sameSite: "lax" });
  return response;
}
