export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";

export async function GET() {
  try {
    const [totalUsers, totalServers, activeServers, totalNodes, openTickets, invoices] = await Promise.all([
      prisma.user.count(),
      prisma.server.count(),
      prisma.server.count({ where: { status: "ONLINE" } }),
      prisma.node.count(),
      prisma.ticket.count({ where: { status: "OPEN" } }),
      prisma.invoice.aggregate({ _sum: { amount: true }, where: { status: "PAID" } }),
    ]);

    return NextResponse.json({
      totalUsers, totalServers, activeServers, totalNodes, openTickets,
      totalRevenue: invoices._sum.amount || 0,
    });
  } catch {
    return NextResponse.json({ totalUsers: 0, totalServers: 0, activeServers: 0, totalNodes: 0, openTickets: 0, totalRevenue: 0 });
  }
}
