import { cookies } from "next/headers";
import { verifyJwt } from "@ryzenpanel/shared/src/utils/jwt";
import { COOKIE_NAME } from "@ryzenpanel/shared/src/constants";
import prisma from "./prisma";
import type { JwtPayload } from "@ryzenpanel/shared/src/types/auth";

export async function auth() {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;

    const payload = verifyJwt(token) as JwtPayload;
    if (!payload?.userId) return null;

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, email: true, username: true, role: true, credits: true, emailVerified: true },
    });

    return user;
  } catch {
    return null;
  }
}

export async function requireAuth() {
  const user = await auth();
  if (!user) throw new Error("Unauthorized");
  return user;
}

export async function requireAdmin() {
  const user = await requireAuth();
  if (user.role !== "ADMIN") throw new Error("Forbidden");
  return user;
}
