import { NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const allocations = await prisma.allocation.findMany({ where: { serverId: params.id } });
  return NextResponse.json({ allocations });
}
