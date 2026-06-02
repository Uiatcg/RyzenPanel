export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";

export async function POST(req: Request) {
  try {
    const { nodeId, nodeToken, daemonKey, fqdn, daemonPort, ip } = await req.json();

    if (!nodeId || !nodeToken) {
      return NextResponse.json({ message: "nodeId and nodeToken required" }, { status: 400 });
    }

    const node = await prisma.node.findUnique({ where: { uuid: nodeId } });
    if (!node) {
      return NextResponse.json({ message: "Node not found" }, { status: 404 });
    }

    if (node.nodeSecret !== nodeToken) {
      return NextResponse.json({ message: "Invalid node token" }, { status: 403 });
    }

    await prisma.node.update({
      where: { id: node.id },
      data: {
        status: "online",
        lastHeartbeat: new Date(),
        fqdn: (fqdn && fqdn !== "0.0.0.0") ? fqdn : node.fqdn,
        ip: (ip && ip !== "0.0.0.0") ? ip : node.ip,
        daemonPort: daemonPort || node.daemonPort,
        daemonKey: daemonKey || node.daemonKey,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Node registered successfully",
      node: {
        id: node.id,
        uuid: node.uuid,
        name: node.name,
      },
    });
  } catch (error) {
    return NextResponse.json({ message: "Registration failed" }, { status: 500 });
  }
}