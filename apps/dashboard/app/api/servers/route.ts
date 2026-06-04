export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";
import { authenticateRequest } from "@/src/lib/auth";

const MC_IMAGE = "itzg/minecraft-server:latest";
const PROXY_IMAGES: Record<string, string> = {
  velocity: "itzg/velocity:latest",
  waterfall: "itzg/waterfall:latest",
  bungeecord: "itzg/bungeecord:latest",
};

function getServerType(software: string): string {
  const typeMap: Record<string, string> = {
    paper: "PAPER", purpur: "PURPUR", spigot: "SPIGOT",
    vanilla: "VANILLA", fabric: "FABRIC", forge: "FORGE",
    neoforge: "NEOFORGE", velocity: "VELOCITY",
    waterfall: "WATERFALL", bungeecord: "BUNGEE",
  };
  return typeMap[software] || "PAPER";
}

function getEnvForServer(server: any, software: string, version: string): string[] {
  const type = getServerType(software);
  if (["velocity", "waterfall", "bungeecord"].includes(software)) {
    return [`TYPE=${type}`];
  }
    return [
      `TYPE=${type}`,
      `VERSION=${version || "latest"}`,
      `EULA=TRUE`,
      `MEMORY=${Math.max(512, server.ram)}M`,
      `ONLINE_MODE=FALSE`,
      `SERVER_NAME=${server.name}`,
      `ENABLE_WHITELIST=FALSE`,
      `ENABLE_RCON=FALSE`,
      `MAX_PLAYERS=20`,
      `DIFFICULTY=easy`,
      `MODE=survival`,
      `JAVA_VERSION=17-jdk`,
    ];
}

async function createContainerOnDaemon(node: any, server: any, software: string, version: string) {
  let daemonUrl: string;
  if (node.fqdn?.startsWith("http")) {
    daemonUrl = node.fqdn;
    const parsed = new URL(daemonUrl);
    const portInUrl = parsed.port || (parsed.protocol === "https:" ? "443" : "80");
    if (node.daemonPort && portInUrl !== String(node.daemonPort)) {
      daemonUrl = `${parsed.protocol}//${parsed.hostname}:${node.daemonPort}`;
    }
  } else {
    daemonUrl = `http://${node.ip || "localhost"}:${node.daemonPort || 8080}`;
  }

  const isProxy = ["velocity", "waterfall", "bungeecord"].includes(software);
  const image = isProxy ? PROXY_IMAGES[software] || MC_IMAGE : MC_IMAGE;
  const env = getEnvForServer(server, software, version);
  const safeName = server.name.toLowerCase().replace(/[^a-z0-9_.-]/g, "").replace(/^[^a-z0-9]+/, "") || `server_${server.id?.slice(0, 8) || Date.now()}`;

  const res = await fetch(`${daemonUrl}/api/containers/create`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-daemon-key": node.daemonKey },
    body: JSON.stringify({
      name: safeName,
      image,
      env,
      serverId: server.id,
      ports: [{ containerPort: "25565", hostPort: "25565", protocol: "tcp" }],
      memoryLimitMb: server.ram,
      cpuLimit: server.cpu / 100,
    }),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "unknown error");
    throw new Error(`Daemon returned ${res.status}: ${errText}`);
  }

  const data = await res.json();
  return data.id || data.containerId;
}

export async function GET(request: Request) {
  const auth = await authenticateRequest(request);
  const where: any = {};
  if (auth && auth.user.role !== "ADMIN") {
    where.ownerId = auth.user.id;
  }

  const servers = await prisma.server.findMany({
    where,
    include: {
      node: { select: { id: true, name: true, fqdn: true } },
      allocations: true,
      owner: { select: { username: true } },
      _count: { select: { backups: true, databases: true, schedules: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({
    servers: servers.map(s => ({
      id: s.id, uuid: s.uuid, name: s.name, status: s.status.toLowerCase(),
      cpu: s.cpu, ram: s.ram, disk: s.disk,
      ip: s.node?.fqdn || s.ip || s.allocations[0]?.ip || "—",
      port: s.port || 25565,
      node: s.node?.name || "Unknown",
      nodeId: s.node?.id || null,
      fqdn: s.node?.fqdn || null,
      owner: s.owner?.username || null,
      dockerImage: s.dockerImage, backups: s._count.backups,
      databases: s._count.databases, schedules: s._count.schedules,
      createdAt: s.createdAt.toISOString(),
    })),
  });
}

export async function POST(req: Request) {
  const auth = await authenticateRequest(req);
  if (!auth) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { name, software, version, nodeId, ram, cpu, disk, backups, databases } = body;

    if (!name || name.length < 3) {
      return NextResponse.json({ message: "Server name must be at least 3 characters" }, { status: 400 });
    }

    let node;
    if (nodeId) {
      node = await prisma.node.findUnique({ where: { id: nodeId } });
      if (!node) {
        return NextResponse.json({ message: "Selected node not found" }, { status: 404 });
      }
    } else {
      const nodes = await prisma.node.findMany({ where: { status: "online" }, take: 1 });
      if (nodes.length === 0) {
        return NextResponse.json({ message: "No active nodes available. Please add a daemon node first or contact support." }, { status: 503 });
      }
      node = nodes[0];
    }
    const isProxy = ["velocity", "waterfall", "bungeecord"].includes(software);
    const image = isProxy ? (PROXY_IMAGES[software] || MC_IMAGE) : MC_IMAGE;

    let egg = await prisma.egg.findFirst({ where: { name: { contains: software || "paper", mode: "insensitive" } } });
    if (!egg) {
      const nest = await prisma.nest.findFirst();
      if (!nest) {
        const newNest = await prisma.nest.create({ data: { name: "Minecraft", description: "Minecraft server software" } });
        egg = await prisma.egg.create({
          data: {
            nestId: newNest.id, name: "Paper", description: "Paper Minecraft server",
            dockerImage: image,
            startup: "",
          },
        });
      } else {
        const firstEgg = await prisma.egg.findFirst();
        if (!firstEgg) {
          return NextResponse.json({ message: "No eggs configured. Create an egg first." }, { status: 400 });
        }
        egg = firstEgg;
      }
    }

    const server = await prisma.server.create({
      data: {
        name, ownerId: auth.user.id, nodeId: node.id, eggId: egg.id,
        ram: ram || 2048, cpu: cpu || 100, disk: disk || 10240,
        dockerImage: image, startup: "",
        status: "INSTALLING",
      },
    });

    // Create container synchronously so it's ready before returning
    const containerId = await createContainerOnDaemon(node, server, software, version).catch((err) => {
      console.error(`[RYZENPANEL] Container creation failed:`, err.message);
      return null;
    });

    if (containerId) {
      await prisma.server.update({
        where: { id: server.id },
        data: { containerId, status: "ONLINE" },
      });
    }

    await prisma.activityLog.create({
      data: { serverId: server.id, userId: auth.user.id, title: "Server Created", detail: `Server ${name} created successfully`, status: containerId ? "SUCCESS" : "WARNING" },
    });

    const finalServer = await prisma.server.findUnique({
      where: { id: server.id },
      include: { node: { select: { fqdn: true, ip: true, daemonPort: true, daemonKey: true } } },
    });

    return NextResponse.json({ server: finalServer, node: { fqdn: node.fqdn, ip: node.ip, daemonPort: node.daemonPort, daemonKey: node.daemonKey } }, { status: 201 });
  } catch (err) {
    console.error("[RYZENPANEL] Server creation error:", err);
    return NextResponse.json({ message: "Failed to create server. Check server logs for details." }, { status: 500 });
  }
}
