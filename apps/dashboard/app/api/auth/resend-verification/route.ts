export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";
import { authenticateRequest } from "@/src/lib/auth";
import { BASE_URL } from "@ryzenpanel/shared/src/constants";

export async function POST(request: Request) {
  const auth = await authenticateRequest(request);
  if (!auth) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  if (auth.user.emailVerified) {
    return NextResponse.json({ message: "Email already verified" }, { status: 400 });
  }

  const token = await prisma.passwordResetToken.create({
    data: { userId: auth.user.id, token: crypto.randomUUID(), expiresAt: new Date(Date.now() + 3600000) },
  });

  console.log(`[RYZENPANEL] Email verification: ${BASE_URL}/api/auth/verify/${token.token}`);
  // In production, send via email provider: await sendEmail(...)

  return NextResponse.json({ success: true, message: "Verification email sent" });
}
