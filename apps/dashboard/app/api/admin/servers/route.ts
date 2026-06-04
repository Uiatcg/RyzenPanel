export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";

export async function GET() {
  const servers = await prisma.server.findMany({
    include: { node: { select: { name: true } }, owner: { select: { username: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ servers });
}
