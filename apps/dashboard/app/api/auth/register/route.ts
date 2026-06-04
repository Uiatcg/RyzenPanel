export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import crypto from "crypto";
import { ZodError } from "zod";
import prisma from "../../../../src/lib/prisma";
import { hashPassword } from "@ryzenpanel/shared/src/utils/hash";
import { createSession } from "../../../../src/lib/auth";
import { registerSchema } from "@ryzenpanel/shared/src/utils/validators";
import { COOKIE_NAME, SESSION_MAX_AGE_SECONDS } from "@ryzenpanel/shared/src/constants";
import { rateLimit, getClientIp } from "@/src/lib/rate-limit";

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const rl = rateLimit(`register:${ip}`, 3, 60000);
    if (!rl.allowed) {
      return NextResponse.json({ message: "Too many attempts. Try again later." }, { status: 429 });
    }

    const body = await request.json();
    const data = registerSchema.parse(body);

    const existingUser = await prisma.user.findUnique({ where: { email: data.email } });
    if (existingUser) {
      return NextResponse.json({ message: "Email is already registered." }, { status: 409 });
    }

    const existingUsername = await prisma.user.findUnique({ where: { username: data.username } });
    if (existingUsername) {
      return NextResponse.json({ message: "Username is taken." }, { status: 409 });
    }

    const password = await hashPassword(data.password);
    const user = await prisma.user.create({
      data: { email: data.email, username: data.username, password, role: "USER" },
    });

    const { jwt } = await createSession(user, request);
    const response = NextResponse.json({ user: { id: user.id, email: user.email, username: user.username, role: user.role } });
    response.cookies.set({ name: COOKIE_NAME, value: jwt, httpOnly: true, path: "/", maxAge: 60 * 60 * 24 * 30, secure: process.env.NODE_ENV === "production", sameSite: "lax" });

    return response;
  } catch (err) {
    if (err instanceof ZodError) {
      return NextResponse.json({ message: err.errors.map(e => e.message).join(", ") }, { status: 400 });
    }
    console.error("[REGISTER ERROR]", err);
    return NextResponse.json({ message: "Registration failed. Please try again." }, { status: 500 });
  }
}
