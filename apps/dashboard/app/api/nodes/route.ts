export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";

export async function GET() {
  const nodes = await prisma.node.findMany({
    include: { _count: { select: { servers: true } } },
  });
  return NextResponse.json({ nodes });
}