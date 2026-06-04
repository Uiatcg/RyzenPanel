export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import prisma from "../../../../../src/lib/prisma";
import { resetRequestSchema } from "@ryzenpanel/shared/src/utils/validators";
import { BASE_URL } from "@ryzenpanel/shared/src/constants";

export async function POST(request: Request) {
  const body = await request.json();
  const data = resetRequestSchema.parse(body);

  const user = await prisma.user.findUnique({ where: { email: data.email } });
  if (user) {
    const token = crypto.randomUUID();
    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        token,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60),
      },
    });

    console.log(`Send password reset link: ${BASE_URL}/auth/reset/${token}`);
  }

  return NextResponse.json({ success: true });
}
