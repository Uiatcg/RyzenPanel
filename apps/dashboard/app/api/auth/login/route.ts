export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { ZodError } from "zod";
import prisma from "../../../../src/lib/prisma";
import { verifyPassword } from "@ryzenpanel/shared/src/utils/hash";
import { createSession } from "../../../../src/lib/auth";
import { loginSchema } from "@ryzenpanel/shared/src/utils/validators";
import { COOKIE_NAME } from "@ryzenpanel/shared/src/constants";
import { rateLimit, getClientIp } from "@/src/lib/rate-limit";

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const rl = rateLimit(`login:${ip}`, 5, 60000);
    if (!rl.allowed) {
      return NextResponse.json({ message: "Too many attempts. Try again later." }, { status: 429 });
    }

    const body = await request.json();
    const data = loginSchema.parse(body);

    const user = await prisma.user.findUnique({ where: { email: data.email } });
    if (!user) {
      return NextResponse.json({ message: "Invalid email or password." }, { status: 401 });
    }

    const passwordMatches = await verifyPassword(data.password, user.password);
    if (!passwordMatches) {
      return NextResponse.json({ message: "Invalid email or password." }, { status: 401 });
    }

    const { jwt } = await createSession(user, request);
    const response = NextResponse.json({ user: { id: user.id, email: user.email, username: user.username, role: user.role } });
    response.cookies.set({ name: COOKIE_NAME, value: jwt, httpOnly: true, path: "/", maxAge: 60 * 60 * 24 * 30, secure: process.env.NODE_ENV === "production", sameSite: "lax" });

    return response;
  } catch (err) {
    if (err instanceof ZodError) {
      return NextResponse.json({ message: err.errors.map(e => e.message).join(", ") }, { status: 400 });
    }
    console.error("[LOGIN ERROR]", err);
    return NextResponse.json({ message: "Login failed. Please try again." }, { status: 500 });
  }
}
