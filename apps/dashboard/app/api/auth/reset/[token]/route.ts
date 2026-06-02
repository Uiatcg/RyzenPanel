import { NextResponse } from "next/server";
import prisma from "../../../../../src/lib/prisma";
import { passwordResetSchema } from "@ryzenpanel/shared/src/utils/validators";
import { hashPassword } from "@ryzenpanel/shared/src/utils/hash";
import { createSession, setAuthCookie } from "../../../../../src/lib/auth";
import { COOKIE_NAME, SESSION_MAX_AGE_SECONDS } from "@ryzenpanel/shared/src/constants";

interface RouteParams {
  params: { token: string };
}

export async function POST(request: Request, { params }: RouteParams) {
  const body = await request.json();
  const data = passwordResetSchema.parse(body);

  const resetToken = await prisma.passwordResetToken.findUnique({ where: { token: params.token } });
  if (!resetToken || resetToken.used || resetToken.expiresAt < new Date()) {
    return NextResponse.json({ message: "Reset token is invalid or expired." }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { id: resetToken.userId } });
  if (!user) {
    return NextResponse.json({ message: "Reset token belongs to an unknown user." }, { status: 400 });
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { password: await hashPassword(data.password) },
  });
  await prisma.passwordResetToken.update({
    where: { token: params.token },
    data: { used: true },
  });

  const { jwt } = await createSession(user, request);
  const response = NextResponse.json({ success: true });
  setAuthCookie(response, jwt);
  return response;
}
