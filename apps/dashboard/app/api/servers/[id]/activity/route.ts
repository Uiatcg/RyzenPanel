import { NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const activity = await prisma.activityLog.findMany({
    where: { serverId: params.id },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  return NextResponse.json({ activity });
}
