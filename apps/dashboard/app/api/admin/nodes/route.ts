export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";
import { authenticateRequest } from "@/src/lib/auth";
import crypto from "crypto";

export async function GET(req: Request) {
  try {
    const auth = await authenticateRequest(req);
    if (!auth || auth.user.role !== "ADMIN") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const nodes = await prisma.node.findMany({
      include: {
        _count: { select: { servers: true, allocations: true } },
        metrics: { orderBy: { recordedAt: "desc" }, take: 1 },
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({
      nodes: nodes.map(n => ({
        id: n.id,
        uuid: n.uuid,
        name: n.name,
        description: n.description,
        location: n.location,
        fqdn: n.fqdn,
        ip: n.ip,
        isPublic: n.isPublic,
        status: n.status,
        daemonPort: n.daemonPort,
        maxRam: n.maxRam,
        maxDisk: n.maxDisk,
        maxServers: n.maxServers,
        memoryUsed: n.memoryUsed,
        diskUsed: n.diskUsed,
        allocateMemory: n.allocateMemory,
        allocateDisk: n.allocateDisk,
        lastHeartbeat: n.lastHeartbeat,
        daemonKey: n.daemonKey,
        nodeSecret: n.nodeSecret,
        createdAt: n.createdAt,
        _count: n._count,
        metrics: n.metrics?.[0] ? {
          cpuPercent: n.metrics[0].cpuPercent,
          memoryUsed: Number(n.metrics[0].memoryUsed),
          memoryTotal: Number(n.metrics[0].memoryTotal),
          diskUsed: Number(n.metrics[0].diskUsed),
          diskTotal: Number(n.metrics[0].diskTotal),
          networkRx: n.metrics[0].networkRx ? Number(n.metrics[0].networkRx) : null,
          networkTx: n.metrics[0].networkTx ? Number(n.metrics[0].networkTx) : null,
          dockerRunning: n.metrics[0].dockerRunning,
        } : null,
      })),
    });
  } catch (err) {
    console.error("[ADMIN NODES ERROR]", err);
    return NextResponse.json({ message: (err as Error).message || "Unknown error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const auth = await authenticateRequest(req);
  if (!auth || auth.user.role !== "ADMIN") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const nodeSecret = crypto.randomBytes(32).toString("hex");
  const apiKey = crypto.randomBytes(48).toString("hex");

  const node = await prisma.node.create({
    data: {
      name: body.name,
      description: body.description || "",
      location: body.location || "us-east",
      fqdn: body.fqdn || body.name,
      ip: body.ip || "0.0.0.0",
      daemonPort: body.daemonPort || 8080,
      daemonKey: apiKey,
      nodeSecret,
      maxRam: body.maxRam || 65536,
      maxDisk: body.maxDisk || 512000,
      maxServers: body.maxServers || 1,
      isPublic: body.isPublic !== undefined ? body.isPublic : true,
      status: "offline",
    },
  });

  await prisma.activityLog.create({
    data: {
      userId: auth.user.id,
      title: "Node Created",
      detail: `Node "${node.name}" created with UUID: ${node.uuid}`,
      status: "SUCCESS",
    },
  });

  return NextResponse.json({
    id: node.id,
    uuid: node.uuid,
    name: node.name,
    fqdn: node.fqdn,
    nodeSecret: node.nodeSecret,
    daemonKey: node.daemonKey,
    installCommand: `curl -sSL https://install.ryzenpanel.com/daemon.sh | bash -s -- --panel-url="${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}" --node-id="${node.uuid}" --node-token="${node.nodeSecret}"`,
  }, { status: 201 });
}