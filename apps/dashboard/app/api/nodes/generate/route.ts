export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";
import { authenticateRequest } from "@/src/lib/auth";
import crypto from "crypto";

export async function POST(req: Request) {
  const auth = await authenticateRequest(req);
  if (!auth || auth.user.role !== "ADMIN") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { name, fqdn, location, maxRam, maxDisk, maxServers } = await req.json();
    if (!name || !fqdn) {
      return NextResponse.json({ message: "name and fqdn required" }, { status: 400 });
    }

    const uuid = crypto.randomUUID();
    const daemonKey = crypto.randomBytes(32).toString("hex");
    const nodeSecret = crypto.randomBytes(32).toString("hex");

    const node = await prisma.node.create({
      data: {
        uuid,
        name,
        location: location || "default",
        fqdn,
        ip: fqdn,
        daemonPort: 8080,
        daemonKey,
        nodeSecret,
        status: "offline",
        maxRam: maxRam || 32768,
        maxDisk: maxDisk || 102400,
        maxServers: maxServers || 10,
      },
    });

    return NextResponse.json({
      node: {
        id: node.id,
        uuid: node.uuid,
        name: node.name,
        fqdn: node.fqdn,
        daemonKey: node.daemonKey,
        nodeSecret: node.nodeSecret,
      },
      installCommand: `bash <(curl -s https://raw.githubusercontent.com/Uiatcg/RyzenPanel/main/install.sh) --daemon --panel-url="${process.env.NEXT_PUBLIC_BASE_URL || "https://YOUR_PANEL_DOMAIN"}" --node-uuid="${node.uuid}" --node-secret="${node.nodeSecret}" --daemon-key="${node.daemonKey}" --fqdn="${fqdn}"`,
    });
  } catch (error) {
    return NextResponse.json({ message: "Failed to generate node" }, { status: 500 });
  }
}
