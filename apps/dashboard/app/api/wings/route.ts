export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";
import { authenticateRequest } from "@/src/lib/auth";

export async function GET(req: Request) {
  const auth = await authenticateRequest(req);
  if (!auth) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  let nodes;
  try {
    nodes = await prisma.node.findMany({
      include: {
        _count: { select: { servers: true } },
      },
      orderBy: { name: "asc" },
    });
  } catch (error) {
    return NextResponse.json({ message: "Failed to fetch nodes", error: String(error) }, { status: 500 });
  }

  return NextResponse.json({
    nodes: nodes.map(n => ({
      id: n.id, uuid: n.uuid, name: n.name, description: n.description,
      location: n.location, fqdn: n.fqdn, ip: n.ip, isPublic: n.isPublic,
      status: n.status, daemonPort: n.daemonPort,
      maxRam: n.maxRam, maxDisk: n.maxDisk, maxServers: n.maxServers,
      memoryUsed: n.memoryUsed, diskUsed: n.diskUsed,
      allocateMemory: n.allocateMemory, allocateDisk: n.allocateDisk,
      lastHeartbeat: n.lastHeartbeat, createdAt: n.createdAt,
      _count: { servers: n._count.servers, allocations: 0 },
      metrics: null,
    })),
  });
}
