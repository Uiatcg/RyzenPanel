export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";
import { authenticateRequest, setAuthCookie } from "@/src/lib/auth";
import { settingsSchema } from "@ryzenpanel/shared/src/utils/validators";
import { signJwt } from "@ryzenpanel/shared/src/utils/jwt";
import { COOKIE_NAME, SESSION_MAX_AGE_SECONDS } from "@ryzenpanel/shared/src/constants";

export async function PUT(request: Request) {
  const auth = await authenticateRequest(request);
  if (!auth) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const data = settingsSchema.parse(body);

  const existingEmailUser = await prisma.user.findUnique({ where: { email: data.email } });
  if (existingEmailUser && existingEmailUser.id !== auth.user.id) {
    return NextResponse.json({ message: "Email is already in use." }, { status: 409 });
  }

  const updatedUser = await prisma.user.update({
    where: { id: auth.user.id },
    data: {
      email: data.email,
      username: data.username,
    },
  });

  const token = signJwt({
    userId: updatedUser.id,
    email: updatedUser.email,
    role: updatedUser.role,
    sessionId: auth.session.id,
  });

  const response = NextResponse.json({ user: { id: updatedUser.id, email: updatedUser.email, username: updatedUser.username, role: updatedUser.role } });
  response.cookies.set({
    name: COOKIE_NAME,
    value: token,
    httpOnly: true,
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });

  return response;
}
