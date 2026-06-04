export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import prisma from "../../../../../src/lib/prisma";
import { hashPassword } from "@ryzenpanel/shared/src/utils/hash";
import { createSession } from "../../../../../src/lib/auth";
import { DISCORD_CLIENT_ID, DISCORD_CLIENT_SECRET, DISCORD_REDIRECT_URI, COOKIE_NAME, SESSION_MAX_AGE_SECONDS } from "@ryzenpanel/shared/src/constants";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  if (!code) {
    return NextResponse.json({ message: "Missing OAuth code." }, { status: 400 });
  }

  const tokenResponse = await fetch("https://discord.com/api/oauth2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: DISCORD_CLIENT_ID,
      client_secret: DISCORD_CLIENT_SECRET,
      grant_type: "authorization_code",
      code,
      redirect_uri: DISCORD_REDIRECT_URI,
    }),
  });

  const tokenData = await tokenResponse.json();
  if (!tokenResponse.ok || !tokenData.access_token) {
    return NextResponse.json({ message: "Discord OAuth failed." }, { status: 500 });
  }

  const profileResponse = await fetch("https://discord.com/api/users/@me", {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
  });
  const profile = await profileResponse.json();
  if (!profile || !profile.id || !profile.username) {
    return NextResponse.json({ message: "Discord profile fetch failed." }, { status: 500 });
  }

  const email = profile.email ?? profile.id + "@discord.local";
  let user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    const password = await hashPassword(crypto.randomUUID());
    user = await prisma.user.create({
      data: {
        email,
        username: `${profile.username}#${profile.discriminator ?? "0000"}`,
        password,
        role: "USER",
        emailVerified: true,
      },
    });
  }

  await prisma.oAuthAccount.upsert({
    where: { provider_providerId: { provider: "discord", providerId: profile.id } },
    create: {
      provider: "discord",
      providerId: profile.id,
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      userId: user.id,
    },
    update: {
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
    },
  });

  const { jwt } = await createSession(user, request);
  const response = NextResponse.redirect(new URL("/settings", request.url));
  response.cookies.set({
    name: COOKIE_NAME,
    value: jwt,
    httpOnly: true,
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });

  return response;
}
