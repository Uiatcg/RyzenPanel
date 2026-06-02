import { NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";
import { authenticateRequest } from "@/src/lib/auth";
import { ServerStatus } from "@prisma/client";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const server = await prisma.server.findUnique({
    where: { id: params.id },
    include: {
      node: { select: { id: true, name: true, fqdn: true, ip: true, daemonPort: true, daemonKey: true } },
      egg: { select: { id: true, name: true } },
      allocations: true,
      backups: { orderBy: { createdAt: "desc" }, take: 10 },
      databases: true,
      schedules: { include: { tasks: true } },
      owner: { select: { id: true, username: true } },
    },
  });
  if (!server) return NextResponse.json({ message: "Not found" }, { status: 404 });
  return NextResponse.json(server);
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const auth = await authenticateRequest(req);
  if (!auth) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const server = await prisma.server.update({
    where: { id: params.id },
    data: { name: body.name, description: body.description },
  });

  await prisma.activityLog.create({
    data: { serverId: params.id, userId: auth.user.id, title: "Server Updated", detail: "Server settings modified", status: "SUCCESS" },
  });

  return NextResponse.json(server);
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  await prisma.server.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const auth = await authenticateRequest(req);
  if (!auth) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { action } = body;
  let status: ServerStatus | null = null;

  if (action === "start") status = ServerStatus.STARTING;
  else if (action === "stop") status = ServerStatus.STOPPING;
  else if (action === "restart") status = ServerStatus.RESTARTING;
  else if (action === "kill") status = ServerStatus.OFFLINE;
  else return NextResponse.json({ message: "Invalid action" }, { status: 400 });

  const server = await prisma.server.update({
    where: { id: params.id },
    data: { status },
  });

  await prisma.activityLog.create({
    data: { serverId: params.id, userId: auth.user.id, title: `Server ${action}`, detail: `Server ${server.name} action: ${action}`, status: "SUCCESS" },
  });

  return NextResponse.json({ server });
}
