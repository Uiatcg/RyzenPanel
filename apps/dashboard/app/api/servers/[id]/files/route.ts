import { NextRequest, NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";

async function getDaemonInfo(serverId: string) {
  const server = await prisma.server.findUnique({
    where: { id: serverId },
    include: { node: { select: { fqdn: true, ip: true, daemonPort: true, daemonKey: true } } },
  });
  if (!server?.node) return null;
  const daemonUrl = server.node.fqdn?.startsWith("http") ? server.node.fqdn : "http://" + server.node.ip + ":" + server.node.daemonPort;
  return { daemonUrl, daemonKey: server.node.daemonKey, containerId: server.containerId || server.id };
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const info = await getDaemonInfo(params.id);
  if (!info) return NextResponse.json({ message: "No node" }, { status: 502 });
  const path = new URL(req.url).searchParams.get("path") || "/";
  try {
    const url = info.daemonUrl + "/api/files/list?containerId=" + info.containerId + "&path=" + encodeURIComponent(path);
    const res = await fetch(url, { headers: { "x-daemon-key": info.daemonKey } });
    return NextResponse.json(await res.json(), { status: res.status });
  } catch { return NextResponse.json({ message: "Daemon unreachable" }, { status: 502 }); }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const info = await getDaemonInfo(params.id);
  if (!info) return NextResponse.json({ message: "No node" }, { status: 502 });
  const path = new URL(req.url).searchParams.get("path") || "/";
  try {
    const url = info.daemonUrl + "/api/files?containerId=" + info.containerId + "&path=" + encodeURIComponent(path);
    const res = await fetch(url, { method: "DELETE", headers: { "x-daemon-key": info.daemonKey } });
    return NextResponse.json(await res.json(), { status: res.status });
  } catch { return NextResponse.json({ message: "Daemon unreachable" }, { status: 502 }); }
}
