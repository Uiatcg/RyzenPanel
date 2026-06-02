export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";

export async function GET() {
  const invoices = await prisma.invoice.findMany({
    include: { user: { select: { id: true, username: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ invoices });
}
