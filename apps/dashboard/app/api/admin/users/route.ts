export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";

export async function GET() {
  const users = await prisma.user.findMany({
    select: { id: true, username: true, email: true, role: true, createdAt: true, credits: true, emailVerified: true, _count: { select: { servers: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ users });
}
