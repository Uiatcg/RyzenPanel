export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";

export async function GET() {
  try {
    const plans = await prisma.plan.findMany({ orderBy: { price: "asc" } });
    return NextResponse.json({ plans });
  } catch {
    return NextResponse.json({
      plans: [
        { id: "free", name: "FREE", ram: 1024, cpu: 100, disk: 5120, backups: 1, databases: 1, price: 0 },
        { id: "starter", name: "STARTER", ram: 4096, cpu: 200, disk: 20480, backups: 3, databases: 2, price: 4.99 },
        { id: "pro", name: "PRO", ram: 16384, cpu: 400, disk: 51200, backups: 10, databases: 5, price: 14.99 },
        { id: "enterprise", name: "ENTERPRISE", ram: 65536, cpu: 800, disk: 204800, backups: 50, databases: 20, price: 49.99 },
      ],
    });
  }
}
