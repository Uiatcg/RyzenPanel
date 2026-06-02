export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";
import { authenticateRequest } from "@/src/lib/auth";

export async function GET(request: Request) {
  const auth = await authenticateRequest(request);
  if (!auth) return NextResponse.json({ invoices: [] });

  const invoices = await prisma.invoice.findMany({
    where: { userId: auth.user.id },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ invoices });
}
