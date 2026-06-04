export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";

export async function GET() {
  const backups = await prisma.backup.findMany({
    include: { server: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ backups });
}
