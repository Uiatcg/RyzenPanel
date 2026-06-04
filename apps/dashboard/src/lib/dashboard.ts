import prisma from "@/src/lib/prisma";

export async function getOverview(userId?: string) {
  try {
    const totalServers = await prisma.server.count();
    const activeServers = await prisma.server.count({ where: { status: "ONLINE" } });
    const alerts = await prisma.activityLog.count({ where: { status: "ERROR" } });
    const userServers = userId ? await prisma.server.count({ where: { ownerId: userId } }) : 0;

    return {
      summary: {
        totalServers,
        activeServers,
        alerts,
        userServers,
        uptime: "99.9%",
      },
      graphs: {
        cpu: [] as { label: string; value: number }[],
        ram: [] as { label: string; value: number }[],
        storage: [] as { label: string; value: number }[],
      },
    };
  } catch {
    return {
      summary: { totalServers: 0, activeServers: 0, alerts: 0, userServers: 0, uptime: "99.9%" },
      graphs: { cpu: [], ram: [], storage: [] },
    };
  }
}

export async function getServers(userId?: string) {
  try {
    const where = userId ? { ownerId: userId } : {};
    const servers = await prisma.server.findMany({
      where,
      include: { node: true, allocations: true, _count: { select: { backups: true, databases: true } } },
      orderBy: { createdAt: "desc" },
    });

    return { servers: servers.map((s) => ({
      id: s.id,
      name: s.name,
      status: s.status.toLowerCase(),
      cpu: s.cpu,
      ram: s.ram,
      disk: s.disk,
      node: s.node?.name || "Unknown",
      ip: s.ip || s.allocations[0]?.ip || "—",
      port: s.port || s.allocations[0]?.port || null,
      backups: s._count.backups,
      databases: s._count.databases,
      createdAt: s.createdAt.toISOString(),
      dockerImage: s.dockerImage,
    })) };
  } catch {
    return { servers: [] };
  }
}

export async function getActivity(userId?: string) {
  try {
    const where = userId ? { userId } : {};
    const activity = await prisma.activityLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 50,
      include: { server: { select: { name: true } } },
    });
    return { activity: activity.map((a) => ({
      id: a.id,
      title: a.title,
      detail: a.detail || "",
      time: a.createdAt.toISOString(),
      status: a.status.toLowerCase(),
      serverName: a.server?.name || null,
    })) };
  } catch {
    return { activity: [] };
  }
}

export async function getNotifications() {
  try {
    const notifications = await prisma.activityLog.findMany({
      where: { status: { not: "SUCCESS" } },
      orderBy: { createdAt: "desc" },
      take: 20,
    });
    return { notifications: notifications.map((n) => ({
      id: n.id,
      title: n.title,
      description: n.detail || "",
      time: n.createdAt.toISOString(),
      severity: n.status === "ERROR" ? "critical" : "warning" as "info" | "warning" | "critical",
    })) };
  } catch {
    return { notifications: [] };
  }
}
