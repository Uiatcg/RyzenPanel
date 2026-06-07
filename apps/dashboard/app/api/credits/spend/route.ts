import { NextResponse } from "next/server";
import { authenticateRequest } from "@/src/lib/auth";
import prisma from "@/src/lib/prisma";

const SPEND_COSTS: Record<string, { credits: number; type: string }> = {
  "ram-512": { credits: 100, type: "SPEND_RAM" },
  "ram-1024": { credits: 180, type: "SPEND_RAM" },
  "ram-2048": { credits: 320, type: "SPEND_RAM" },
  "cpu-50": { credits: 80, type: "SPEND_CPU" },
  "cpu-100": { credits: 150, type: "SPEND_CPU" },
  "disk-1024": { credits: 60, type: "SPEND_DISK" },
  "disk-2048": { credits: 110, type: "SPEND_DISK" },
  "disk-5120": { credits: 250, type: "SPEND_DISK" },
  "backup-1": { credits: 50, type: "SPEND_BACKUP" },
  "database-1": { credits: 40, type: "SPEND_DATABASE" },
  "server-1": { credits: 500, type: "SPEND_SERVER" },
};

export async function POST(req: Request) {
  const auth = await authenticateRequest(req);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { itemId, serverId } = body;

  const item = SPEND_COSTS[itemId];
  if (!item) {
    return NextResponse.json({ error: "Invalid item" }, { status: 400 });
  }

  const settingsPath = require("path").join(process.cwd(), "admin-settings.json");
  let settings = { creditsEnabled: true };
  try {
    if (require("fs").existsSync(settingsPath)) {
      settings = { ...settings, ...JSON.parse(require("fs").readFileSync(settingsPath, "utf8")) };
    }
  } catch {}

  if (!settings.creditsEnabled) {
    return NextResponse.json({ error: "Credits system is disabled" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { id: auth.user.id } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
  if (user.credits < item.credits) {
    return NextResponse.json({ error: "Not enough credits" }, { status: 400 });
  }

  const updated = await prisma.user.update({
    where: { id: auth.user.id },
    data: { credits: { decrement: item.credits } },
  });

  await prisma.creditTransaction.create({
    data: {
      userId: auth.user.id,
      type: item.type as any,
      amount: -item.credits,
      balance: updated.credits,
      metadata: { itemId, serverId },
    },
  });

  if (serverId) {
    const updateData: Record<string, any> = {};
    if (item.type === "SPEND_RAM") updateData.ram = { increment: parseInt(itemId.split("-")[1]) };
    if (item.type === "SPEND_CPU") updateData.cpu = { increment: parseInt(itemId.split("-")[1]) };
    if (item.type === "SPEND_DISK") updateData.disk = { increment: parseInt(itemId.split("-")[1]) };
    if (item.type === "SPEND_BACKUP") updateData.disk = { increment: 0 };

    if (Object.keys(updateData).length > 0) {
      await prisma.server.update({ where: { id: serverId }, data: updateData });
    }
  }

  return NextResponse.json({ credits: updated.credits, spent: item.credits, itemId });
}
