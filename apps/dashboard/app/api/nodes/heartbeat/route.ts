export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";

export async function POST(req: Request) {
  try {
    const { nodeId, nodeToken, cpu, memory, disk, network } = await req.json();

    if (!nodeId || !nodeToken) {
      return NextResponse.json({ message: "nodeId and token required" }, { status: 400 });
    }

    const node = await prisma.node.findUnique({ where: { uuid: nodeId } });
    if (!node) {
      return NextResponse.json({ message: "Node not found" }, { status: 404 });
    }

    if (node.nodeSecret !== nodeToken) {
      return NextResponse.json({ message: "Invalid token" }, { status: 403 });
    }

    await prisma.node.update({
      where: { id: node.id },
      data: {
        status: "online",
        lastHeartbeat: new Date(),
        memoryUsed: memory?.used ? Math.round(Number(memory.used) / 1024 / 1024) : node.memoryUsed,
        diskUsed: disk?.used ? Math.round(Number(disk.used) / 1024 / 1024) : node.diskUsed,
      },
    });

    await prisma.nodeMetric.create({
      data: {
        nodeId: node.id,
        cpuPercent: cpu?.loadPercent || 0,
        memoryUsed: BigInt(memory?.used || 0),
        memoryTotal: BigInt(memory?.total || 0),
        diskUsed: BigInt(disk?.used || 0),
        diskTotal: BigInt(disk?.total || 0),
        networkRx: network?.rx ? BigInt(network.rx) : null,
        networkTx: network?.tx ? BigInt(network.tx) : null,
        dockerRunning: memory?.containers || 0,
      },
    });

    const servers = await prisma.server.findMany({
      where: { nodeId: node.id },
      select: { id: true, uuid: true, status: true, containerId: true, ram: true, cpu: true, disk: true },
    });

    return NextResponse.json({ success: true, servers });
  } catch (error) {
    return NextResponse.json({ message: "Heartbeat failed" }, { status: 500 });
  }
}