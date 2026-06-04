import { NextResponse } from "next/server";
import crypto from "crypto";
import { verifyJwt, signJwt } from "@ryzenpanel/shared/src/utils/jwt";
import { COOKIE_NAME, SESSION_MAX_AGE_SECONDS, BASE_URL } from "@ryzenpanel/shared/src/constants";
import prisma from "./prisma";
import type { JwtPayload } from "@ryzenpanel/shared/src/types/auth";
import type { User } from "@prisma/client";

function parseCookies(cookieHeader: string | null) {
  if (!cookieHeader) return {} as Record<string, string>;
  return cookieHeader.split(";").reduce<Record<string, string>>((acc, cookiePair) => {
    const [key, ...valueParts] = cookiePair.split("=");
    const name = key?.trim();
    const value = valueParts.join("=").trim();
    if (name && value) acc[name] = decodeURIComponent(value);
    return acc;
  }, {});
}

export function getAuthTokenFromRequest(request: Request) {
  return parseCookies(request.headers.get("cookie"))[COOKIE_NAME];
}

export function setAuthCookie(response: NextResponse, token: string) {
  response.cookies.set({
    name: COOKIE_NAME, value: token, httpOnly: true, path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
    secure: process.env.NODE_ENV === "production", sameSite: "lax",
  });
}

export function clearAuthCookie(response: NextResponse) {
  response.cookies.set({
    name: COOKIE_NAME, value: "", httpOnly: true, path: "/", maxAge: 0,
    secure: process.env.NODE_ENV === "production", sameSite: "lax",
  });
}

export async function createSession(user: User, request: Request) {
  const session = await prisma.session.create({
    data: {
      userId: user.id,
      token: crypto.randomUUID(),
      userAgent: request.headers.get("user-agent") ?? undefined,
      ipAddress: request.headers.get("x-forwarded-for") ?? request.headers.get("x-real-ip") ?? undefined,
      expiresAt: new Date(Date.now() + SESSION_MAX_AGE_SECONDS * 1000),
    },
  });

  const jwt = signJwt({
    userId: user.id, email: user.email, role: user.role, sessionId: session.id,
  });

  return { session, jwt };
}

export async function authenticateRequest(request: Request) {
  try {
    const token = getAuthTokenFromRequest(request);
    if (!token) return null;

    const payload = verifyJwt(token);
    if (!payload?.userId || !payload?.sessionId) return null;

    const session = await prisma.session.findUnique({ where: { id: payload.sessionId } });
    if (!session || session.expiresAt < new Date()) return null;
    if (session.userId !== payload.userId) return null;

    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (!user) return null;

    await prisma.session.update({
      where: { id: session.id },
      data: { lastActiveAt: new Date() },
    }).catch(() => {});

    return { user, session };
  } catch (err) {
    return null;
  }
}

export function createRedirectResponse(destination: string) {
  return NextResponse.redirect(new URL(destination, BASE_URL));
}
