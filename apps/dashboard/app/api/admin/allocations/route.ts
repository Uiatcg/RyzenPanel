export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";
import { authenticateRequest } from "@/src/lib/auth";

export async function GET(req: Request) {
  const auth = await authenticateRequest(req);
  if (!auth || auth.user.role !== "ADMIN") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const nodeId = searchParams.get("nodeId");

  const where: any = {};
  if (nodeId) where.nodeId = nodeId;

  const allocations = await prisma.allocation.findMany({
    where,
    include: { node: { select: { id: true, name: true } }, server: { select: { id: true, name: true } } },
    orderBy: [{ ip: "asc" }, { port: "asc" }],
  });

  return NextResponse.json({ allocations });
}

export async function POST(req: Request) {
  const auth = await authenticateRequest(req);
  if (!auth || auth.user.role !== "ADMIN") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const { nodeId, ip, ports } = body;

  if (!nodeId || !ip || !ports) {
    return NextResponse.json({ message: "nodeId, ip, and ports required" }, { status: 400 });
  }

  const node = await prisma.node.findUnique({ where: { id: nodeId } });
  if (!node) return NextResponse.json({ message: "Node not found" }, { status: 404 });

  const portList: number[] = [];
  for (const entry of ports) {
    if (typeof entry === "number") {
      portList.push(entry);
    } else if (entry.start && entry.end) {
      for (let p = entry.start; p <= entry.end; p++) {
        portList.push(p);
      }
    } else if (entry.port) {
      portList.push(entry.port);
    }
  }

  const existing = await prisma.allocation.findMany({
    where: { nodeId, ip, port: { in: portList } },
    select: { port: true },
  });
  const existingPorts = new Set(existing.map(a => a.port));
  const newPorts = portList.filter(p => !existingPorts.has(p));

  if (newPorts.length === 0) {
    return NextResponse.json({ message: "All ports already exist" }, { status: 409 });
  }

  await prisma.allocation.createMany({
    data: newPorts.map(port => ({ nodeId, ip, port, notes: body.notes || "" })),
  });

  return NextResponse.json({
    success: true,
    created: newPorts.length,
    existing: existingPorts.size,
    ports: newPorts,
  }, { status: 201 });
}