export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";

export async function GET() {
  const tickets = await prisma.ticket.findMany({
    include: { user: { select: { id: true, username: true } }, messages: { take: 1, orderBy: { createdAt: "desc" }, select: { message: true } } },
    orderBy: { updatedAt: "desc" },
  });
  return NextResponse.json({ tickets });
}
