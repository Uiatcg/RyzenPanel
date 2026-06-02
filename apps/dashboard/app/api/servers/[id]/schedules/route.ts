import { NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const schedules = await prisma.schedule.findMany({
    where: { serverId: params.id },
    include: { tasks: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ schedules });
}
