export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";
import { BASE_URL } from "@ryzenpanel/shared/src/constants";

export async function GET(_req: Request, { params }: { params: { token: string } }) {
  const token = await prisma.passwordResetToken.findUnique({ where: { token: params.token } });
  if (!token || token.used || token.expiresAt < new Date()) {
    return NextResponse.redirect(new URL("/auth/login?error=invalid-token", BASE_URL));
  }

  await prisma.user.update({ where: { id: token.userId }, data: { emailVerified: true } });
  await prisma.passwordResetToken.update({ where: { id: token.id }, data: { used: true } });

  return NextResponse.redirect(new URL("/?verified=true", BASE_URL));
}
