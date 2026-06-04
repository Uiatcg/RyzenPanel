import { NextRequest, NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const server = await prisma.server.findUnique({
    where: { id: params.id },
    include: { node: { select: { fqdn: true, ip: true, daemonPort: true, daemonKey: true } } },
  });
  if (!server?.node) return NextResponse.json({ message: "No node" }, { status: 502 });
  const daemonUrl = server.node.fqdn?.startsWith("http") ? server.node.fqdn : "http://" + server.node.ip + ":" + server.node.daemonPort;
  const containerId = server.containerId || server.id;
  const path = new URL(req.url).searchParams.get("path") || "/";
  try {
    const res = await fetch(daemonUrl + "/api/files/read?containerId=" + containerId + "&path=" + encodeURIComponent(path), {
      headers: { "x-daemon-key": server.node.daemonKey },
    });
    return NextResponse.json(await res.json(), { status: res.status });
  } catch { return NextResponse.json({ message: "Daemon unreachable" }, { status: 502 }); }
}
