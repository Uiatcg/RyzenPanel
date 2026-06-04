export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";
import { authenticateRequest } from "@/src/lib/auth";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const node = await prisma.node.findUnique({
    where: { id: params.id },
    include: {
      _count: { select: { servers: true, allocations: true } },
      allocations: { include: { server: { select: { name: true } } } },
      servers: { include: { owner: { select: { username: true } } } },
      metrics: { orderBy: { recordedAt: "desc" }, take: 60 },
    },
  });
  if (!node) return NextResponse.json({ message: "Node not found" }, { status: 404 });
  return NextResponse.json(node);
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const auth = await authenticateRequest(req);
  if (!auth || auth.user.role !== "ADMIN") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const node = await prisma.node.update({
    where: { id: params.id },
    data: {
      name: body.name,
      description: body.description,
      location: body.location,
      fqdn: body.fqdn,
      ip: body.ip,
      daemonPort: body.daemonPort,
      maxRam: body.maxRam,
      maxDisk: body.maxDisk,
      maxServers: body.maxServers,
      isPublic: body.isPublic,
    },
  });

  return NextResponse.json(node);
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const auth = await authenticateRequest(_req);
  if (!auth || auth.user.role !== "ADMIN") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  await prisma.node.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const auth = await authenticateRequest(req);
  if (!auth || auth.user.role !== "ADMIN") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const data: any = {};

  if (body.action === "suspend") {
    data.status = "suspended";
  } else if (body.action === "unsuspend") {
    data.status = "online";
  } else if (body.action === "reset-token") {
    const crypto = await import("crypto");
    data.nodeSecret = crypto.randomBytes(32).toString("hex");
    data.daemonKey = crypto.randomBytes(48).toString("hex");
  }

  const node = await prisma.node.update({
    where: { id: params.id },
    data,
  });

  return NextResponse.json(node);
}