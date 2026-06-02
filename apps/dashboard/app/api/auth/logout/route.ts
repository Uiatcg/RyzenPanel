export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";
import { authenticateRequest, clearAuthCookie } from "@/src/lib/auth";

export async function POST(request: Request) {
  const auth = await authenticateRequest(request);
  const response = NextResponse.json({ success: true });
  clearAuthCookie(response);

  if (!auth) {
    return response;
  }

  await prisma.session.deleteMany({ where: { id: auth.session.id } });
  return response;
}
