import { NextResponse } from "next/server";
import { authenticateRequest } from "@/src/lib/auth";

export async function GET(request: Request) {
  const auth = await authenticateRequest(request);
  if (!auth) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { user } = auth;
  return NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
      credits: user.credits,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
    },
  });
}
