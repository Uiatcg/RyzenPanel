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

  if (!["start", "stop", "restart", "kill"].includes(action)) {
    return NextResponse.json({ message: "Invalid action" }, { status: 400 });
  }

  let status: ServerStatus;
  const actionStatusMap: Record<string, ServerStatus> = {
    start: ServerStatus.STARTING,
    stop: ServerStatus.STOPPING,
    restart: ServerStatus.RESTARTING,
    kill: ServerStatus.OFFLINE,
  };
  status = actionStatusMap[action];

  const finalStatus: Record<string, ServerStatus> = {
    start: ServerStatus.ONLINE,
    stop: ServerStatus.OFFLINE,
    restart: ServerStatus.ONLINE,
    kill: ServerStatus.OFFLINE,
  };

  // Fetch server with node info to call daemon
  const server = await prisma.server.findUnique({
    where: { id: params.id },
    include: { node: { select: { fqdn: true, ip: true, daemonPort: true, daemonKey: true } } },
  });

  if (!server) return NextResponse.json({ message: "Server not found" }, { status: 404 });

  // Call daemon API
  const node = server.node;
  if (node && server.containerId) {
    let daemonBase: string;
    if (node.fqdn?.startsWith("http")) {
      daemonBase = node.fqdn;
    } else {
      daemonBase = `http://${node.ip || "localhost"}:${node.daemonPort || 8080}`;
    }
    const daemonUrl = `${daemonBase}/api/containers/${server.containerId}/${action}`;
    try {
      const daemonRes = await fetch(daemonUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-daemon-key": node.daemonKey || "" },
      });
      if (!daemonRes.ok) {
        console.error(`[RYZENPANEL] Daemon ${action} failed: ${daemonRes.status}`);
      }
    } catch (err) {
      console.error(`[RYZENPANEL] Daemon ${action} error:`, (err as Error).message);
    }
  }

  // Update DB status to final state (or keep intermediate for restart)
  const updated = await prisma.server.update({
    where: { id: params.id },
    data: { status: action === "restart" ? status : finalStatus[action] },
  });

  await prisma.activityLog.create({
    data: { serverId: params.id, userId: auth.user.id, title: `Server ${action}`, detail: `Server ${server.name} action: ${action}`, status: "SUCCESS" },
  });

  return NextResponse.json({ server: updated });
}
