import { NextRequest, NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const server = await prisma.server.findUnique({
    where: { id: params.id },
    include: { node: { select: { fqdn: true, ip: true, daemonPort: true, daemonKey: true } } },
  });
  if (!server?.node) return NextResponse.json({ message: "No node" }, { status: 502 });
  const daemonUrl = server.node.fqdn?.startsWith("http") ? server.node.fqdn : "http://" + server.node.ip + ":" + server.node.daemonPort;
  const containerId = server.containerId || server.id;
  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const path = (formData.get("path") as string) || "/";
  if (!file) return NextResponse.json({ message: "No file" }, { status: 400 });
  const content = await file.text();
  try {
    const res = await fetch(daemonUrl + "/api/files/write", {
      method: "POST", headers: { "Content-Type": "application/json", "x-daemon-key": server.node.daemonKey },
      body: JSON.stringify({ path: path + "/" + file.name, content, containerId }),
    });
    return NextResponse.json(await res.json(), { status: res.status });
  } catch { return NextResponse.json({ message: "Daemon unreachable" }, { status: 502 }); }
}
